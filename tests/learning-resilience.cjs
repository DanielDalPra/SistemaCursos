const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const req = createRequire(path.resolve('runtime/package.json'));
const express = req('express');
const knex = req('knex');
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE ||
    'C:/Users/danie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
);
const createRouter = require('../learning/server.cjs');
(async () => {
  const db = knex({
    client: 'sqlite3',
    connection: { filename: ':memory:' },
    useNullAsDefault: true,
    pool: { min: 1, max: 1 },
  });
  await db.schema.createTable('users', (t) => {
    t.integer('id').primary();
    t.string('name');
    t.boolean('isActive');
    t.boolean('isSystem');
  });
  await db('users').insert({ id: 1, name: 'Revisão isolada', isActive: true, isSystem: false });
  const app = express();
  app.use(express.json(), (request, response, next) => {
    request.user = { id: 1 };
    next();
  });
  app.use('/cursos-home', express.static(path.resolve('home')));
  app.use((request, response, next) => {
    if (request.get('x-fixture-hang-body') === 'yes') {
      response.type('application/json');
      response.write('{');
      return;
    }
    next();
  });
  app.use(
    createRouter(
      {
        models: {
          knex: db,
          users: { query: () => ({ findById: (id) => db('users').where({ id }).first() }) },
        },
        config: { sessionSecret: 'isolated-resilience-test' },
        auth: { checkAccess: () => true },
      },
      express
    )
  );
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.on('listening', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.CHROME_PATH ||
      'C:/Users/danie/AppData/Local/ms-playwright/chromium-1208/chrome-win64/chrome.exe',
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
  page.setDefaultTimeout(8000);
  try {
    await page.goto(base + '/cursos/do-plano-a-acao/material');
    await page.locator('#loading').waitFor({ state: 'hidden' });
    let release;
    const gate = new Promise((resolve) => (release = resolve));
    let started;
    const saved = new Promise((resolve) => (started = resolve));
    await page.route('**/api/aprende/notes', async (route) => {
      const response = await route.fetch();
      started();
      await gate;
      await route.fulfill({ response });
    });
    await page.locator('#acao').fill('Primeira versão');
    await page.getByRole('button', { name: 'Salvar meu plano' }).click();
    await saved;
    await page.locator('#acao').fill('Versão mais recente');
    release();
    await page.waitForFunction(() => !document.querySelector('#notes-form button').disabled);
    assert.match(
      await page.locator('#notes-state').textContent(),
      /não salvas/,
      'Typing while a save is pending must remain marked unsaved'
    );
    await page.unroute('**/api/aprende/notes');
    await page.getByRole('button', { name: 'Salvar meu plano' }).click();
    await page.waitForFunction(
      () => document.querySelector('#notes-state').textContent === 'Anotações salvas na sua conta.'
    );
    assert.equal(
      JSON.parse(
        (await db('aprendeProgress').where({ userId: 1, courseId: 'do-plano-a-acao' }).first())
          .notes
      ).acao,
      'Versão mais recente'
    );
    console.log(
      'PASS: edits made during an in-flight save remain dirty and can be persisted without data loss.'
    );
    let releaseState;
    const stateGate = new Promise((resolve) => (releaseState = resolve));
    let stateStarted;
    const stateWaiting = new Promise((resolve) => (stateStarted = resolve));
    await page.route('**/api/aprende/state', async (route) => {
      const response = await route.fetch();
      stateStarted();
      await stateGate;
      await route.fulfill({ response });
    });
    await page.reload();
    await stateWaiting;
    await page.locator('#acao').fill('Digitado antes de carregar');
    releaseState();
    await page.locator('#loading').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#acao').inputValue(), 'Digitado antes de carregar');
    await page.unroute('**/api/aprende/state');
    await page.getByRole('button', { name: 'Salvar meu plano' }).click();
    await page.waitForFunction(
      () => document.querySelector('#notes-state').textContent === 'Anotações salvas na sua conta.'
    );
    console.log('PASS: late hydration does not overwrite a field the learner has already edited.');
    await db('aprendeProgress')
      .where({ userId: 1, courseId: 'do-plano-a-acao' })
      .update({ completed: '["confianca"]' });
    await page.reload();
    await page.waitForFunction(() => !document.querySelector('#complete').disabled);
    let releaseNext;
    const nextGate = new Promise((resolve) => (releaseNext = resolve));
    let nextStarted;
    const nextWaiting = new Promise((resolve) => (nextStarted = resolve));
    let intercepted = false;
    await page.route('**/api/aprende/notes', async (route) => {
      const response = await route.fetch();
      if (!intercepted) {
        intercepted = true;
        nextStarted();
        await nextGate;
      }
      await route.fulfill({ response });
    });
    await page.locator('#acao').fill('Rascunho anterior');
    await page.getByRole('button', { name: 'Salvar meu plano' }).click();
    await nextWaiting;
    await page.locator('#acao').fill('Texto final antes de avançar');
    await page.getByRole('button', { name: 'Concluir e continuar' }).click();
    assert.equal(await page.locator('#acao').evaluate((field) => field.readOnly), true);
    releaseNext();
    await page.waitForURL('**/clareza');
    assert.equal(
      JSON.parse(
        (await db('aprendeProgress').where({ userId: 1, courseId: 'do-plano-a-acao' }).first())
          .notes
      ).acao,
      'Texto final antes de avançar'
    );
    console.log(
      'PASS: completing while a save is pending persists the newest edits before navigation.'
    );
    await page.goto(base + '/cursos/do-plano-a-acao/material');
    await page.locator('#loading').waitFor({ state: 'hidden' });
    const longNote =
      'Uma anotação extensa para conferir a impressão. '.repeat(34) + 'FINAL DA ANOTAÇÃO';
    await page.locator('#acao').fill(longNote);
    await page.getByRole('button', { name: 'Salvar meu plano' }).click();
    await page.waitForFunction(
      () => document.querySelector('#notes-state').textContent === 'Anotações salvas na sua conta.'
    );
    await page.emulateMedia({ media: 'print' });
    const printedNote = page.getByText(longNote, { exact: true });
    await printedNote.waitFor({ state: 'visible' });
    assert.equal(
      await printedNote.isVisible(),
      true,
      'The complete saved note must appear as printable text, including its last line'
    );
    assert.equal(
      await printedNote.evaluate((element) => element.scrollHeight <= element.clientHeight),
      true,
      'Printed note must not be clipped to a textarea viewport'
    );
    require('node:fs').mkdirSync('.impeccable/resilience-review', { recursive: true });
    await page.screenshot({
      path: '.impeccable/resilience-review/long-note-print.png',
      fullPage: true,
      animations: 'disabled',
    });
    await page.emulateMedia({ media: 'screen' });
    await printedNote.waitFor({ state: 'detached' });
    assert.equal(await page.getByText(longNote, { exact: true }).count(), 0);
    console.log(
      'PASS: long notes print in full and print-only text is removed when returning to the lesson.'
    );
    await page.unroute('**/api/aprende/notes');
    await page.route('**/api/aprende/notes', (route) => route.abort('failed'));
    await page.locator('#acao').fill('Rascunho preservado sem conexão');
    await page.getByRole('button', { name: 'Salvar meu plano' }).click();
    await page.waitForFunction(() => !document.querySelector('#notes-form button').disabled);
    assert.match(
      await page.locator('#status').textContent(),
      /conectar|conexão/,
      'Offline failure must explain recovery in the interface language'
    );
    assert.equal(await page.locator('#acao').inputValue(), 'Rascunho preservado sem conexão');
    assert.match(await page.locator('#notes-state').textContent(), /não salvas/);
    assert.match(
      await page.locator('#notes-state').textContent(),
      /conectar|conexão/,
      'Recovery instruction must also appear beside the save action'
    );
    await page.screenshot({
      path: '.impeccable/resilience-review/offline-desktop.png',
      fullPage: true,
      animations: 'disabled',
    });
    await page.locator('#notes-form .save-row').scrollIntoViewIfNeeded();
    await page.screenshot({
      path: '.impeccable/resilience-review/offline-controls-desktop.png',
      animations: 'disabled',
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#notes-form .save-row').scrollIntoViewIfNeeded();
    await page.screenshot({
      path: '.impeccable/resilience-review/offline-controls-mobile.png',
      animations: 'disabled',
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.unroute('**/api/aprende/notes');
    await page.getByRole('button', { name: 'Salvar meu plano' }).click();
    await page.waitForFunction(
      () => document.querySelector('#notes-state').textContent === 'Anotações salvas na sua conta.'
    );
    console.log(
      'PASS: a connection failure preserves drafts, explains recovery and allows a successful retry.'
    );
    await page.route('**/api/aprende/notes', (route) =>
      route.continue({ headers: { ...route.request().headers(), 'x-fixture-hang-body': 'yes' } })
    );
    await page.locator('#acao').fill('Rascunho preservado após resposta incompleta');
    await page.getByRole('button', { name: 'Salvar meu plano' }).click();
    await page.waitForFunction(
      () => document.querySelector('#notes-state').textContent.includes('demorou para responder'),
      {},
      { timeout: 22000 }
    );
    assert.equal(
      await page.locator('#acao').inputValue(),
      'Rascunho preservado após resposta incompleta'
    );
    assert.equal(await page.getByRole('button', { name: 'Salvar meu plano' }).isEnabled(), true);
    await page.unroute('**/api/aprende/notes');
    await page.getByRole('button', { name: 'Salvar meu plano' }).click();
    await page.waitForFunction(
      () => document.querySelector('#notes-state').textContent === 'Anotações salvas na sua conta.'
    );
    console.log(
      'PASS: a stalled response body times out, preserves the draft and permits a retry.'
    );
    await db('aprendeProgress')
      .where({ userId: 1, courseId: 'do-plano-a-acao' })
      .update({ completed: '["confianca","material","clareza"]' });
    await page.goto(base + '/cursos/do-plano-a-acao/avaliacao');
    await page.locator('#quiz-form:visible').waitFor();
    const questions = require('../learning/course.cjs').questions;
    for (const question of questions)
      await page.locator(`input[name="${question.id}"][value="${question.answer}"]`).check();
    await page.getByRole('button', { name: 'Enviar respostas' }).click();
    await page.getByText('Você concluiu o minicurso.').waitFor();
    await page.getByRole('button', { name: 'Responder novamente' }).click();
    for (const question of questions)
      await page
        .locator(`input[name="${question.id}"][value="${(question.answer + 1) % 4}"]`)
        .check();
    await page.getByRole('button', { name: 'Enviar respostas' }).click();
    await page.getByText('0% de acerto', { exact: true }).waitFor();
    assert.match(
      await page.locator('#quiz-result').textContent(),
      /aprovação anterior/,
      'A failed practice attempt must not imply that an earned completion was lost'
    );
    assert.equal(await page.locator('#progress-percent').textContent(), '100%');
    await page.evaluate(() => document.activeElement?.blur());
    await page.screenshot({
      path: '.impeccable/resilience-review/retained-approval-desktop.png',
      fullPage: true,
      animations: 'disabled',
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: '.impeccable/resilience-review/retained-approval-mobile.png',
      fullPage: true,
      animations: 'disabled',
    });
    console.log(
      'PASS: an unsuccessful practice attempt clearly preserves the previously earned course completion.'
    );
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
    await db.destroy();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
