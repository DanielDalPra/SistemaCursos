// Isolated accounts and in-memory SQLite only; never accesses the real Wiki.js session.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const runtime = createRequire(path.resolve('runtime/package.json'));
const express = runtime('express');
const knex = runtime('knex');
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE ||
    'C:/Users/danie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
);
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
    t.string('email');
    t.boolean('isActive');
    t.boolean('isSystem');
  });
  await db('users').insert([
    { id: 1, name: 'Admin de teste', email: 'admin@example.test', isActive: true, isSystem: false },
    { id: 2, name: 'Visitante', isSystem: true, isActive: true },
    { id: 3, name: 'Aluno de teste', email: 'aluno@example.test', isActive: true, isSystem: false },
    {
      id: 4,
      name: 'Conta inativa',
      email: 'inativo@example.test',
      isActive: false,
      isSystem: false,
    },
  ]);
  const app = express();
  app.use(express.json(), (req, res, next) => {
    req.user = { id: req.headers.cookie?.includes('student=yes') ? 3 : 1 };
    next();
  });
  app.use('/cursos-home', express.static(path.resolve('home')));
  app.use(
    require('../learning/server.cjs')(
      {
        models: {
          knex: db,
          users: { query: () => ({ findById: (id) => db('users').where({ id }).first() }) },
        },
        config: { sessionSecret: 'navigation-fixture' },
        auth: { checkAccess: (user) => user.id === 1 },
      },
      express
    )
  );
  app.use((error, req, res, next) => res.status(500).json({ error: error.message }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.on('listening', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.CHROME_PATH ||
      'C:/Users/danie/AppData/Local/ms-playwright/chromium-1208/chrome-win64/chrome.exe',
  });
  const admin = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
  await context.addCookies([{ name: 'student', value: 'yes', url: base }]);
  const student = await context.newPage();
  const errors = [];
  [admin, student].forEach((page) => page.on('pageerror', (error) => errors.push(error.message)));
  const output = path.resolve('.impeccable/navigation-review');
  fs.mkdirSync(output, { recursive: true });
  async function capture(page, name) {
    for (const [label, width, height] of [
      ['desktop', 1440, 1000],
      ['mobile', 390, 844],
    ]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(async () => {
        await document.fonts.ready;
        document.activeElement?.blur();
      });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        name + ' overflow'
      );
      await page.screenshot({
        path: path.join(output, name + '-' + label + '.png'),
        fullPage: true,
        animations: 'disabled',
      });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  try {
    await student.goto(base + '/cursos');
    await student.getByText('Seu progresso e suas anotações ficam salvos na sua conta.').waitFor();
    assert.equal(await student.locator('#student-courses li').count(), 3);
    assert.equal(await student.locator('#nav-admin').isVisible(), false);
    assert.equal(await student.locator('#student-resume').isVisible(), false);
    assert.equal(await student.locator('.global-menu a[href="/p"]').count(), 1);
    assert.equal(await student.locator('.global-menu a[href="/logout"]').count(), 1);
    await capture(student, 'courses-pending');
    const forbidden = await context.request.get(base + '/api/aprende/students?q=aluno');
    assert.equal(forbidden.status(), 403);
    await student.getByRole('button', { name: 'Concluídos', exact: true }).click();
    await student.getByText('Você ainda não concluiu um curso.', { exact: false }).waitFor();
    await capture(student, 'courses-empty');
    await admin.goto(base + '/cursos/administracao');
    await admin.waitForFunction(() => !document.querySelector('#search-submit').disabled);
    await admin.locator('#student-query').fill('aluno');
    await admin.getByRole('button', { name: 'Buscar aluno', exact: true }).click();
    await admin.getByText('1 conta encontrada.').waitFor();
    await capture(admin, 'admin-search');
    await admin.getByRole('button', { name: 'Selecionar aluno: Aluno de teste' }).click();
    assert.equal(await admin.locator('#email').inputValue(), 'aluno@example.test');
    await admin.getByRole('button', { name: 'Salvar alteração de acesso' }).click();
    await admin.getByText('Acesso liberado para Aluno de teste.', { exact: true }).waitFor();
    assert.equal((await db('aprendeEnrollments').where({ userId: 3 })).length, 1);
    await capture(admin, 'admin-granted');
    assert.deepEqual(
      await (await admin.request.get(base + '/api/aprende/students?q=%25%25')).json(),
      []
    );
    assert.deepEqual(
      await (await admin.request.get(base + '/api/aprende/students?q=inativo')).json(),
      []
    );
    await db('aprendeProgress').insert({
      userId: 3,
      courseId: 'do-plano-a-acao',
      completed: JSON.stringify(['confianca']),
      notes: '{}',
      updatedAt: '2026-10-24T15:00:00.000Z',
    });
    await student.goto(base + '/cursos');
    await student.locator('#student-resume:visible').waitFor();
    assert.equal(
      await student.locator('#student-resume').getAttribute('href'),
      '/cursos/do-plano-a-acao/material'
    );
    await student.getByRole('button', { name: 'Para continuar', exact: true }).click();
    assert.equal(await student.locator('#student-courses li').count(), 1);
    await capture(student, 'courses-active');
    await student.setViewportSize({ width: 390, height: 844 });
    await student.waitForFunction(() => !document.querySelector('.global-menu').open);
    assert.equal(await student.locator('.global-menu').getAttribute('open'), null);
    await student.locator('.global-menu summary').click();
    await student
      .getByRole('navigation', { name: 'Área do aluno' })
      .getByRole('link', { name: 'Meus cursos', exact: true })
      .waitFor({ state: 'visible' });
    await student.screenshot({ path: path.join(output, 'menu-open-mobile.png'), fullPage: true });
    await student.keyboard.press('Escape');
    assert.equal(await student.locator('.global-menu').getAttribute('open'), null);
    await student.setViewportSize({ width: 1440, height: 1000 });
    await student.goto(base + '/cursos/do-plano-a-acao/material');
    await student.locator('.global-menu').waitFor();
    await student.waitForFunction(() => !document.querySelector('#complete').disabled);
    await capture(student, 'lesson-navigation');
    await admin.locator('#enrollment-filter').fill('ninguém');
    await admin.locator('#enrollment-no-match:visible').waitFor();
    await admin.locator('#enrollment-filter').fill('');
    await admin.getByRole('button', { name: 'Revisar revogação: Aluno de teste' }).click();
    assert.equal(await admin.locator('input[name=action]:checked').inputValue(), 'revoke');
    assert.equal((await db('aprendeEnrollments').where({ userId: 3 })).length, 1);
    await capture(admin, 'admin-revoke-review');
    await admin.getByRole('button', { name: 'Salvar alteração de acesso' }).click();
    await admin.getByText('Acesso revogado para Aluno de teste.', { exact: true }).waitFor();
    assert.equal((await db('aprendeEnrollments').where({ userId: 3 })).length, 0);
    assert.equal((await db('aprendeProgress').where({ userId: 3 })).length, 1);
    await admin.locator('#course-selector').selectOption('rotina-possivel');
    await admin.getByText('Pronto para gerenciar acessos de Tempo para o que importa.').waitFor();
    assert.equal(await admin.locator('#email').inputValue(), '');
    await capture(admin, 'admin-course-switch');
    await db('aprendeEnrollments').insert({
      userId: 3,
      courseId: 'do-plano-a-acao',
      grantedBy: 1,
      grantedAt: new Date().toISOString(),
    });
    await db('aprendeProgress')
      .where({ userId: 3 })
      .update({ completed: JSON.stringify(['confianca', 'material', 'clareza', 'avaliacao']) });
    await student.goto(base + '/cursos');
    await student.getByRole('button', { name: 'Concluídos', exact: true }).click();
    await student.getByRole('link', { name: 'Revisar curso: Do plano à ação' }).waitFor();
    assert.equal(await student.locator('#student-resume').isVisible(), false);
    await capture(student, 'courses-completed');
    await student.route('**/api/aprende/catalog', (route) => route.abort('failed'));
    await student.reload();
    await student.locator('#retry-student:visible').waitFor();
    await capture(student, 'courses-offline');
    await student.unroute('**/api/aprende/catalog');
    await student.locator('#retry-student').click();
    await student.getByText('Seu progresso e suas anotações ficam salvos na sua conta.').waitFor();
    assert.deepEqual(errors, []);
    console.log(
      'PASS: responsive sidebar, account/logout links, admin visibility, course filters/resume, guarded search, manual grant/revoke, course switch, retained progress and connection retry.'
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
