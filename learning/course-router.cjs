const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const schemaPromises = new WeakMap();

module.exports = function createCourseRouter(WIKI, express, course = require('./course.cjs'), catalog = [course]) {
  const router = express.Router();
  const db = WIKI.models.knex;
  const root = '/cursos/' + course.id;
  const apiRoot = course.apiBase || '/api/aprende';
  const pagesDirectory = path.join(__dirname, 'pages', course.pagesDirectory || '');
  const initialize = () => {
    if (schemaPromises.has(db)) return schemaPromises.get(db);
    const pending = (async () => {
    if (!await db.schema.hasTable('aprendeEnrollments')) await db.schema.createTable('aprendeEnrollments', t => {
      t.integer('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.string('courseId').notNullable(); t.string('grantedAt').notNullable(); t.integer('grantedBy').notNullable();
      t.primary(['userId', 'courseId']);
    });
    if (!await db.schema.hasTable('aprendeProgress')) await db.schema.createTable('aprendeProgress', t => {
      t.integer('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.string('courseId').notNullable(); t.text('completed').notNullable().defaultTo('[]');
      t.text('notes').notNullable().defaultTo('{}'); t.string('updatedAt').notNullable();
      t.primary(['userId', 'courseId']);
    });
    if (!await db.schema.hasTable('aprendeAttempts')) await db.schema.createTable('aprendeAttempts', t => {
      t.increments('id'); t.integer('userId').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.string('courseId').notNullable(); t.integer('revision').notNullable();
      t.integer('score').notNullable(); t.boolean('passed').notNullable();
      t.text('answers').notNullable(); t.string('createdAt').notNullable();
      t.index(['userId', 'courseId']);
    });
    })().catch(error => { schemaPromises.delete(db); throw error; });
    schemaPromises.set(db, pending);
    return pending;
  };
  const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
  // Stable across Wiki.js JWT refreshes; disclosure still requires the signed-in same-origin session.
  const csrf = req => crypto.createHmac('sha256', WIKI.config.sessionSecret).update('aprende:csrf:v1:' + req.user.id).digest('hex');
  const key = req => ({ userId: req.user.id, courseId: course.id });
  const parse = row => ({ completed: JSON.parse(row?.completed || '[]'), notes: JSON.parse(row?.notes || '{}'), updatedAt: row?.updatedAt || null });
  const progress = async (req, connection = db) => parse(await connection('aprendeProgress').where(key(req)).first());
  const isAdmin = req => WIKI.auth.checkAccess(req.user, ['manage:system']);

  // Files under public contain presentation only. Lesson HTML and answer keys are never static.
  router.use('/cursos-assets', express.static(path.join(__dirname, 'public'), { index: false, dotfiles: 'deny' }));
  router.use([apiRoot, root, ...(course.id === 'do-plano-a-acao' ? ['/cursos', '/cursos/administracao'] : [])], async (req, res, next) => {
    try {
      if (!req.user || !Number.isSafeInteger(req.user.id) || req.user.id === 2) {
        if (req.originalUrl.startsWith('/api/')) return res.status(401).json({ error: 'Entre na sua conta para continuar.', code: 'LOGIN_REQUIRED' });
        res.cookie('loginRedirect', req.originalUrl, { sameSite: 'lax', secure: req.secure });
        return res.redirect('/login');
      }
      const user = await WIKI.models.users.query().findById(req.user.id);
      if (!user || !user.isActive || user.isSystem) return res.status(403).json({ error: 'Sua conta não está disponível.' });
      req.aprendeUser = user;
      await initialize();
      res.set('Cache-Control', 'no-store');
      next();
    } catch (error) { next(error); }
  });
  router.use(apiRoot, (req, res, next) => {
    if (req.method === 'GET') return next();
    const token = req.get('x-aprende-csrf') || '';
    const expected = csrf(req);
    if (!/^[a-f0-9]{64}$/.test(token) || !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))) return res.status(403).json({ error: 'Sessão desatualizada. Recarregue a página e tente novamente.' });
    const origin = req.get('origin');
    let sameOrigin = !origin;
    try { if (origin) sameOrigin = new URL(origin).host === req.get('host'); } catch { sameOrigin = false; }
    if (req.get('sec-fetch-site') === 'cross-site' || !sameOrigin) return res.status(403).json({ error: 'Origem da solicitação não permitida.' });
    if (!req.is('application/json')) return res.status(415).json({ error: 'Envie os dados em JSON.' });
    next();
  });
  const hasAccess = async req => isAdmin(req) || !!await db('aprendeEnrollments').where(key(req)).first();
  const studentCourses = async req => Promise.all(catalog.map(async item => {
    const scope = { userId: req.user.id, courseId: item.id };
    const enrolled = isAdmin(req) || !!await db('aprendeEnrollments').where(scope).first();
    const state = enrolled ? parse(await db('aprendeProgress').where(scope).first()) : { completed: [] };
    return { id: item.id, title: item.title, enrolled, completed: state.completed.length, total: item.steps.length };
  }));
  if (course.id === 'do-plano-a-acao') router.get('/api/aprende/catalog', wrap(async (req, res) => res.json({ courses: await studentCourses(req), admin: isAdmin(req) })));
  const requireAccess = async (req, res) => {
    if (await hasAccess(req)) return true;
    res.status(403).json({ error: 'Seu acesso ainda não foi liberado. Fale com a responsável pelo curso.', code: 'ENROLLMENT_REQUIRED' }); return false;
  };
  const saveProgress = async (req, change) => db.transaction(async trx => {
    let row = await trx('aprendeProgress').where(key(req)).first();
    const state = parse(row);
    await change(state, trx);
    const values = { completed: JSON.stringify(state.completed), notes: JSON.stringify(state.notes), updatedAt: new Date().toISOString() };
    if (row) await trx('aprendeProgress').where(key(req)).update(values);
    else await trx('aprendeProgress').insert({ ...key(req), ...values });
    return { ...state, updatedAt: values.updatedAt };
  });

  router.get(apiRoot + '/state', wrap(async (req, res) => {
    const enrolled = await hasAccess(req);
    const state = enrolled ? await progress(req) : { completed: [], notes: {}, updatedAt: null };
    const attempts = enrolled ? await db('aprendeAttempts').where(key(req)).orderBy('id', 'desc').limit(10).select('id', 'score', 'passed', 'createdAt') : [];
    res.json({ user: { name: req.aprendeUser.name, id: req.user.id }, admin: isAdmin(req), enrolled, csrf: csrf(req), course: { id: course.id, title: course.title, steps: course.steps, passScore: course.passScore }, progress: state, attempts });
  }));
  router.post(apiRoot + '/complete', wrap(async (req, res) => {
    if (!await requireAccess(req, res)) return;
    const index = course.steps.findIndex(step => step.id === req.body.step);
    if (index < 0 || course.steps[index].kind === 'quiz') return res.status(400).json({ error: 'Etapa inválida.' });
    let blocked = false;
    const state = await saveProgress(req, state => {
      if (course.steps.slice(0, index).some(step => !state.completed.includes(step.id))) { blocked = true; return; }
      if (!state.completed.includes(req.body.step)) state.completed.push(req.body.step);
    });
    if (blocked) return res.status(409).json({ error: 'Conclua as etapas anteriores antes de avançar.' });
    res.json(state);
  }));
  router.post(apiRoot + '/notes', wrap(async (req, res) => {
    if (!await requireAccess(req, res)) return;
    const allowed = course.noteFields || ['identidade', 'acao', 'contexto', 'evidencia', 'mensagem'];
    const notes = req.body.notes;
    if (!notes || typeof notes !== 'object' || Array.isArray(notes) || Object.keys(notes).some(k => !allowed.includes(k)) || Object.values(notes).some(value => typeof value !== 'string' || value.length > 2000)) return res.status(400).json({ error: 'Revise as anotações: use até 2.000 caracteres por campo.' });
    res.json(await saveProgress(req, state => { state.notes = { ...state.notes, ...notes }; }));
  }));
  router.get(apiRoot + '/quiz', wrap(async (req, res) => {
    if (!await requireAccess(req, res)) return;
    const state = await progress(req);
    if (course.steps.slice(0, 3).some(step => !state.completed.includes(step.id))) return res.status(409).json({ error: 'Conclua os dois vídeos e o material de estudo antes de responder.' });
    res.json({ questions: course.questions.map(({ id, prompt, options }) => ({ id, prompt, options })), passScore: course.passScore });
  }));
  router.post(apiRoot + '/quiz', wrap(async (req, res) => {
    if (!await requireAccess(req, res)) return;
    const recent = await db('aprendeAttempts').where(key(req)).andWhere('createdAt', '>', new Date(Date.now() - 3600000).toISOString()).count({ count: '*' }).first();
    if (Number(recent.count) >= 20) return res.status(429).json({ error: 'Você enviou muitas tentativas em pouco tempo. Revise o material e tente novamente em uma hora.' });
    const answers = req.body.answers;
    if (!answers || Array.isArray(answers) || typeof answers !== 'object' || Object.keys(answers).length !== course.questions.length || course.questions.some(q => !Number.isInteger(answers[q.id]) || answers[q.id] < 0 || answers[q.id] >= q.options.length)) return res.status(400).json({ error: 'Responda todas as perguntas antes de enviar.' });
    const state = await progress(req);
    if (course.steps.slice(0, 3).some(step => !state.completed.includes(step.id))) return res.status(409).json({ error: 'Conclua as etapas anteriores primeiro.' });
    const score = Math.round(course.questions.filter(q => answers[q.id] === q.answer).length / course.questions.length * 100);
    const passed = score >= course.passScore;
    const updated = await saveProgress(req, async (state, trx) => {
      await trx('aprendeAttempts').insert({ ...key(req), revision: course.revision, score, passed, answers: JSON.stringify(answers), createdAt: new Date().toISOString() });
      if (passed && !state.completed.includes('avaliacao')) state.completed.push('avaliacao');
    });
    res.json({ score, passed, passScore: course.passScore, progress: updated, feedback: course.questions.map(q => ({ id: q.id, correct: answers[q.id] === q.answer, answer: q.answer, explanation: q.explanation })) });
  }));
  router.get(apiRoot + '/enrollments', wrap(async (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Apenas administradores podem gerenciar acessos.' });
    res.json(await db('aprendeEnrollments as e').join('users as u', 'e.userId', 'u.id').where('e.courseId', course.id).select('u.id', 'u.name', 'u.email', 'e.grantedAt'));
  }));
  router.post(apiRoot + '/enrollments', wrap(async (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: 'Apenas administradores podem gerenciar acessos.' });
    if (typeof req.body.email !== 'string' || req.body.email.length > 254 || !['grant', 'revoke'].includes(req.body.action)) return res.status(400).json({ error: 'Informe um e-mail e uma ação válidos.' });
    const users = await db('users').whereRaw('lower(email) = ?', [req.body.email.trim().toLowerCase()]).where('isSystem', false);
    if (users.length !== 1 || !users[0].isActive) return res.status(400).json({ error: 'Não foi possível identificar uma única conta ativa com esse e-mail. Confira os usuários no Wiki.js.' });
    const enrollment = { userId: users[0].id, courseId: course.id };
    if (req.body.action === 'revoke') await db('aprendeEnrollments').where(enrollment).delete();
    else if (!await db('aprendeEnrollments').where(enrollment).first()) await db('aprendeEnrollments').insert({ ...enrollment, grantedAt: new Date().toISOString(), grantedBy: req.user.id });
    res.json({ ok: true, name: users[0].name, action: req.body.action });
  }));
  router.get(course.id === 'do-plano-a-acao' ? ['/cursos', root] : [root], wrap(async (req, res) => {
    if (req.path === '/cursos' && catalog.length > 1) {
      const enrolled = (await studentCourses(req)).filter(item => item.enrolled);
      if (enrolled.length === 1) return res.redirect('/cursos/' + enrolled[0].id);
      return res.sendFile(path.join(__dirname, 'pages', 'meus-cursos.html'));
    }
    const state = await hasAccess(req) ? await progress(req) : { completed: [] };
    const next = course.steps.find(step => !state.completed.includes(step.id)) || course.steps[course.steps.length - 1];
    res.redirect(root + '/' + next.id);
  }));
  if (course.id === 'do-plano-a-acao') router.get('/cursos/administracao', (req, res) => {
    if (!isAdmin(req)) return res.status(403).send('Acesso restrito à administração.');
    res.sendFile(path.join(__dirname, 'pages', 'administracao.html'));
  });
  router.get(root + '/:step', wrap(async (req, res) => {
    const step = course.steps.find(step => step.id === req.params.step);
    if (!step) return res.status(404).send('Esta etapa não existe.');
    if (!await hasAccess(req)) return res.status(403).sendFile(path.join(pagesDirectory, 'acesso.html'));
    const file = path.join(pagesDirectory, step.id + '.html');
    if (!fs.existsSync(file)) return res.status(503).send('Esta aula está sendo preparada. Volte em instantes.');
    res.sendFile(file);
  }));
  return router;
};

