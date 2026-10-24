// Isolated UI fixture: no real users, secrets or production data are read or modified.
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const fs = require('node:fs');
const runtimeRequire = createRequire(path.resolve('runtime/package.json'));
const express = runtimeRequire('express');
const knex = runtimeRequire('knex');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/danie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const course = require('../learning/course.cjs');
const createRouter = require('../learning/server.cjs');

(async () => {
  const db = knex({ client:'sqlite3', connection:{filename:':memory:'}, useNullAsDefault:true, pool:{min:1,max:1} });
  await db.schema.createTable('users', t => {t.integer('id').primary();t.string('email');t.string('name');t.boolean('isActive');t.boolean('isSystem');});
  await db('users').insert([{id:1,email:'admin@example.test',name:'Admin de teste',isActive:true,isSystem:false},{id:2,name:'Visitante',isActive:true,isSystem:true},{id:3,email:'aluno@example.test',name:'Aluno de teste',isActive:true,isSystem:false}]);
  const app = express();
  app.use(express.json(), (req,res,next) => {req.user={id:req.get('cookie')?.includes('fixture=student')?3:1};next();});
  app.use('/cursos-home',express.static(path.resolve('home')));
  app.get('/',(req,res)=>res.sendFile(path.resolve('home/index.html')));
  app.use(createRouter({models:{knex:db,users:{query:()=>({findById:id=>db('users').where({id}).first()})}},config:{sessionSecret:'isolated-test-secret'},auth:{checkAccess:user=>user.id===1}},express));
  app.use((err,req,res,next)=>res.status(500).json({error:err.message}));
  const server=app.listen(0,'127.0.0.1');
  await new Promise(resolve=>server.on('listening',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Users/danie/AppData/Local/ms-playwright/chromium-1208/chrome-win64/chrome.exe'});
  const admin=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const studentContext=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await studentContext.addCookies([{name:'fixture',value:'student',url:base}]);
  const student=await studentContext.newPage();
  const errors=[]; for(const page of [admin,student])page.on('pageerror',error=>errors.push(error.message));
  const output=path.resolve('.impeccable/course-review');fs.mkdirSync(output,{recursive:true});
  const root='/cursos/do-plano-a-acao/';
  async function screenshot(page,name){
    for(const [label,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
      await page.setViewportSize({width,height});await page.evaluate(async()=>{document.activeElement?.blur();await document.fonts.ready;});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,name+' overflow '+label);
      await page.screenshot({path:path.join(output,name+'-'+label+'.png'),fullPage:true,animations:'disabled'});
    }
    await page.setViewportSize({width:1440,height:1000});
  }
  try {
    await student.goto(base+root+'confianca');assert.equal(await student.locator('h1').textContent(),'Seu próximo passo está quase aqui.');await screenshot(student,'acesso');
    await admin.goto(base+'/cursos/administracao');await admin.waitForFunction(()=>!document.querySelector('#enroll-form button').disabled);
    await admin.getByLabel('E-mail da conta do aluno').fill('aluno@example.test');await admin.getByRole('button',{name:'Salvar alteração de acesso'}).click();await admin.getByText('Acesso liberado para Aluno de teste.').waitFor();await screenshot(admin,'administracao');
    await student.goto(base+root+'confianca');await student.waitForFunction(()=>!document.querySelector('#complete').disabled);await screenshot(student,'confianca');
    assert.equal(await student.locator('iframe').count(),0);
    await student.route('https://www.youtube-nocookie.com/**',route=>route.fulfill({contentType:'text/html',body:'<p>External video fixture</p>'}));
    await student.getByRole('button',{name:'Carregar vídeo da aula'}).click();assert.match(await student.locator('iframe').getAttribute('src'),/0CpNy1Ph7e8\?start=303/);
    await student.locator('#complete').scrollIntoViewIfNeeded();await student.getByRole('button',{name:'Concluir e continuar'}).click();await student.waitForURL('**/material');await student.waitForFunction(()=>!document.querySelector('#complete').disabled);
    await student.locator('#identidade').fill('Explicar ideias com clareza');await student.locator('#acao').fill('Gravar um áudio de um minuto');await student.locator('#contexto').fill('Depois do café');await student.locator('#evidencia').fill('Revisar uma ideia e um exemplo');
    await student.getByRole('button',{name:'Salvar meu plano'}).click();await student.getByText('Anotações salvas. Você pode continuar quando quiser.').waitFor();await screenshot(student,'material');
    await student.emulateMedia({media:'print'});assert.equal(await student.locator('.course-sidebar').isVisible(),false);await student.emulateMedia({media:'screen'});
    const otherDevice=await browser.newContext();await otherDevice.addCookies([{name:'fixture',value:'student',url:base}]);const resumed=await otherDevice.newPage();await resumed.goto(base+root+'material');await resumed.waitForFunction(()=>document.querySelector('#acao').value==='Gravar um áudio de um minuto');await otherDevice.close();
    await student.getByRole('button',{name:'Concluir e continuar'}).click();await student.waitForURL('**/clareza');await student.waitForFunction(()=>!document.querySelector('#complete').disabled);await screenshot(student,'clareza');
    await student.locator('#mensagem').fill('Minha ideia é simples e tem um exemplo.');
    // Completing saves dirty notes before navigating.
    await student.getByRole('button',{name:'Concluir e continuar'}).click();await student.waitForURL('**/avaliacao');await student.locator('#quiz-form:visible').waitFor();await screenshot(student,'avaliacao');
    for(const q of course.questions)await student.locator(`input[name="${q.id}"][value="${(q.answer+1)%4}"]`).check();await student.getByRole('button',{name:'Enviar respostas'}).click();await student.getByText('0% de acerto',{exact:true}).waitFor();
    await student.getByRole('button',{name:'Responder novamente'}).click();for(const q of course.questions)await student.locator(`input[name="${q.id}"][value="${q.answer}"]`).check();await student.getByRole('button',{name:'Enviar respostas'}).click();await student.getByText('Você concluiu o minicurso.').waitFor();assert.equal(await student.locator('#progress-percent').textContent(),'100%');await screenshot(student,'resultado');
    await student.reload();await student.getByText('4 de 4 etapas',{exact:true}).waitFor();assert.match(await student.locator('#attempt-list').textContent(),/100%/);
    const notes=JSON.parse((await db('aprendeProgress').where({userId:3}).first()).notes);assert.equal(notes.mensagem,'Minha ideia é simples e tem um exemplo.');assert.equal((await db('aprendeAttempts').where({userId:3})).length,2);
    assert.deepEqual(errors,[]);
    console.log('PASS: pending access, admin grant, two video lessons, study notes, device resume, print layout, quiz fail/retry/pass, persisted result, responsive screenshots, zero JS errors.');
  } finally {await browser.close();await new Promise(resolve=>server.close(resolve));await db.destroy();}
})().catch(error=>{console.error(error);process.exitCode=1;});





