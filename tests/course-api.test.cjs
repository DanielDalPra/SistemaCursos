const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const runtimeRequire = createRequire(path.resolve('runtime/package.json'));
const express = runtimeRequire('express');
const knex = runtimeRequire('knex');
const course = require('../learning/course.cjs');
const createRouter = require('../learning/server.cjs');
let db, server, base, csrf;
async function request(url, { user = 1, method = 'GET', body, token = csrf, origin } = {}) {
  return fetch(base + url, { method, headers: { 'x-test-user': String(user), ...(body ? { 'content-type': 'application/json', 'x-aprende-csrf': token || '' } : {}), ...(origin ? { origin } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), redirect: 'manual' });
}
before(async () => {
  db = knex({ client: 'sqlite3', connection: { filename: ':memory:' }, useNullAsDefault: true, pool: { min: 1, max: 1 } });
  await db.schema.createTable('users', t => { t.integer('id').primary(); t.string('email'); t.string('name'); t.boolean('isActive'); t.boolean('isSystem'); });
  await db('users').insert([ { id:1, email:'admin@example.test', name:'Admin', isActive:true, isSystem:false }, { id:2, name:'Guest', isSystem:true, isActive:true }, { id:3, email:'aluno@example.test', name:'Aluno', isActive:true, isSystem:false }, { id:4, email:'outro@example.test', name:'Outro', isActive:true, isSystem:false } ]);
  const app = express();
  // Test fixture identity only: this app is never mounted in Wiki.js or shipped as a runtime route.
  app.use(express.json(), (req, res, next) => { req.user = { id: Number(req.get('x-test-user')) }; next(); });
  app.use(createRouter({ models: { knex: db, users: { query: () => ({ findById: id => db('users').where({ id }).first() }) } }, config: { sessionSecret: 'test-secret-not-for-production' }, auth: { checkAccess: user => user.id === 1 } }, express));
  app.use((err, req, res, next) => res.status(500).json({ error: err.message }));
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.on('listening', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  csrf = (await (await request('/api/aprende/state')).json()).csrf;
});
after(async () => { await new Promise(resolve => server.close(resolve)); await db.destroy(); });
test('guest must sign in and protected pages do not expose content', async () => {
  assert.equal((await request('/api/aprende/state', { user:2 })).status, 401);
  const page = await request('/cursos/do-plano-a-acao/confianca', { user:2 });
  assert.equal(page.status, 302); assert.equal(page.headers.get('location'), '/login');
});
test('only admin can enroll; ungranted student cannot read quiz or write progress', async () => {
  const student = await (await request('/api/aprende/state', { user:3 })).json();
  assert.equal(student.enrolled, false);
  assert.equal((await request('/api/aprende/enrollments', { user:3, method:'POST', token:student.csrf, body:{ email:'outro@example.test', action:'grant' } })).status,403);
  assert.equal((await request('/api/aprende/quiz', { user:3 })).status,403);
  assert.equal((await request('/api/aprende/complete', { user:3, method:'POST', token:student.csrf, body:{step:'confianca'} })).status,403);
});
test('CSRF and cross-origin requests are rejected', async () => {
  assert.equal((await request('/api/aprende/enrollments', { method:'POST', token:'invalid', body:{email:'aluno@example.test',action:'grant'} })).status,403);
  assert.equal((await request('/api/aprende/enrollments', { method:'POST', origin:'https://evil.example', body:{email:'aluno@example.test',action:'grant'} })).status,403);
  assert.equal((await request('/api/aprende/enrollments', { method:'POST', origin:'not-a-url', body:{email:'aluno@example.test',action:'grant'} })).status,403);
  assert.equal((await request('/api/aprende/enrollments', { method:'POST', token:'é'.repeat(64), body:{email:'aluno@example.test',action:'grant'} })).status,403);
});
test('manual grant succeeds and user cannot forge another student identity', async () => {
  assert.equal((await request('/api/aprende/enrollments', { method:'POST', body:{email:'aluno@example.test',action:'grant'} })).status,200);
  const student = await (await request('/api/aprende/state', { user:3 })).json();
  assert.equal(student.enrolled,true);
  await request('/api/aprende/complete', { method:'POST', user:3, token:student.csrf, body:{step:'confianca',userId:4} });
  assert.deepEqual(JSON.parse((await db('aprendeProgress').where({userId:3}).first()).completed), ['confianca']);
  assert.equal(await db('aprendeProgress').where({userId:4}).first(),undefined);
});
test('sequence and idempotence: no skipping, no duplicate completion', async () => {
  const student = await (await request('/api/aprende/state', { user:3 })).json();
  assert.equal((await request('/api/aprende/complete',{user:3,token:student.csrf,method:'POST',body:{step:'clareza'}})).status,409);
  await request('/api/aprende/complete',{user:3,token:student.csrf,method:'POST',body:{step:'confianca'}});
  const state = await (await request('/api/aprende/state',{user:3})).json();
  assert.deepEqual(state.progress.completed,['confianca']);
  assert.equal((await request('/api/aprende/quiz',{user:3})).status,409);
});
test('notes are validated and stay isolated per authenticated user', async () => {
  const student = await (await request('/api/aprende/state', { user:3 })).json();
  assert.equal((await request('/api/aprende/notes',{user:3,token:student.csrf,method:'POST',body:{notes:{acao:'Ler duas páginas'}}})).status,200);
  assert.equal((await request('/api/aprende/notes',{user:3,token:student.csrf,method:'POST',body:{notes:{acao:'a'.repeat(2001)}}})).status,400);
  assert.equal((await (await request('/api/aprende/state',{user:3})).json()).progress.notes.acao,'Ler duas páginas');
  assert.deepEqual((await (await request('/api/aprende/state')).json()).progress.notes,{});
  const resume = await request('/cursos',{user:3});
  assert.equal(resume.headers.get('location'),'/cursos/do-plano-a-acao/material');
});
test('server grades attempts, rejects incomplete answers and persists pass', async () => {
  const student = await (await request('/api/aprende/state', { user:3 })).json();
  for(const step of ['material','clareza']) await request('/api/aprende/complete',{user:3,token:student.csrf,method:'POST',body:{step}});
  const quiz = await (await request('/api/aprende/quiz',{user:3})).json();
  assert.equal(quiz.questions.length,5); assert.equal('answer' in quiz.questions[0],false);
  assert.equal((await request('/api/aprende/quiz',{user:3,token:student.csrf,method:'POST',body:{answers:{}}})).status,400);
  const failed = await (await request('/api/aprende/quiz',{user:3,token:student.csrf,method:'POST',body:{answers:Object.fromEntries(course.questions.map(q=>[q.id,(q.answer+1)%4])),score:100}})).json();
  assert.equal(failed.score,0); assert.equal(failed.passed,false);
  const passed = await (await request('/api/aprende/quiz',{user:3,token:student.csrf,method:'POST',body:{answers:Object.fromEntries(course.questions.map(q=>[q.id,q.answer]))}})).json();
  assert.equal(passed.score,100); assert.equal(passed.passed,true); assert.equal(passed.progress.completed.length,4);
  assert.equal((await db('aprendeAttempts').where({userId:3})).length,2);
  assert.equal((await request('/cursos',{user:3})).headers.get('location'),'/cursos/do-plano-a-acao/avaliacao');
});
test('quiz submission limit is enforced for the authenticated student', async () => {
  const student=await (await request('/api/aprende/state',{user:3})).json();
  await db('aprendeAttempts').insert(Array.from({length:18},()=>({userId:3,courseId:course.id,revision:1,score:0,passed:false,answers:'{}',createdAt:new Date().toISOString()})));
  assert.equal((await request('/api/aprende/quiz',{user:3,token:student.csrf,method:'POST',body:{answers:Object.fromEntries(course.questions.map(q=>[q.id,q.answer]))}})).status,429);
});
test('revoking blocks later requests and inactive accounts are denied', async () => {
  await request('/api/aprende/enrollments',{method:'POST',body:{email:'aluno@example.test',action:'revoke'}});
  assert.equal((await request('/api/aprende/quiz',{user:3})).status,403);
  await db('users').where({id:3}).update({isActive:false});
  assert.equal((await request('/api/aprende/state',{user:3})).status,403);
});
