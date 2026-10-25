(() => {
  const navigationStyle = document.createElement('link');
  navigationStyle.rel = 'stylesheet';
  navigationStyle.href = '/cursos-assets/navigation.css';
  document.head.append(navigationStyle);
  const navigationScript = document.createElement('script');
  navigationScript.src = '/cursos-assets/navigation.js';
  document.head.append(navigationScript);
  const courseId = location.pathname.split('/')[2] || 'do-plano-a-acao';
  const root = '/cursos/' + courseId + '/';
  const apiRoot =
    courseId === 'do-plano-a-acao' ? '/api/aprende/' : '/api/aprende/' + courseId + '/';
  const stepId = document.body.dataset.step;
  let state;
  let dirty = false;
  let editVersion = 0;
  let savingNotes = null;
  let completing = false;
  const editedFields = new Set();
  const status = document.querySelector('#status');
  const button = document.querySelector('#complete');
  const notesForm = document.querySelector('#notes-form');
  const escape = (text) =>
    String(text).replace(
      /[&<>"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]
    );
  function message(text, type = '') {
    if (!status) return;
    status.hidden = !text;
    status.textContent = text;
    status.className = 'status-message ' + type;
  }
  async function api(url, body) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let response;
    try {
      response = await fetch(apiRoot + url, {
        signal: controller.signal,
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          ...(body ? { 'X-Aprende-CSRF': state.csrf } : {}),
        },
        ...(body ? { method: 'POST', body: JSON.stringify(body) } : {}),
      });
    } catch (error) {
      clearTimeout(timeout);
      throw new Error(
        controller.signal.aborted
          ? 'O servidor demorou para responder. Confira a conexão e tente novamente.'
          : 'Não foi possível conectar ao servidor. Confira a conexão e tente novamente.'
      );
    }
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(
        controller.signal.aborted
          ? 'O servidor demorou para responder. Confira a conexão e tente novamente.'
          : 'Não foi possível ler a resposta. Recarregue a página e tente novamente.'
      );
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) {
      if (response.status === 401) document.querySelector('#session-login').hidden = false;
      throw new Error(data.error || 'Não foi possível salvar. Tente novamente.');
    }
    return data;
  }
  function renderProgress() {
    const completed = state.progress.completed;
    const percentage = (completed.length / state.course.steps.length) * 100;
    document.querySelector('#progress-label').textContent =
      `${completed.length} de ${state.course.steps.length} etapas`;
    document.querySelector('#progress-percent').textContent = `${percentage}%`;
    document.querySelector('#progress-bar').value = percentage;
    document.querySelector('#student-name').textContent = state.user.name;
    document.querySelector('#admin-link').hidden = !state.admin;
    document.querySelector('#admin-link').href =
      '/cursos/administracao?curso=' + encodeURIComponent(courseId);
    document.querySelectorAll('[data-lesson]').forEach((link) => {
      const done = completed.includes(link.dataset.lesson);
      link.classList.toggle('is-complete', done);
      link.querySelector('.step-marker').textContent = done ? '✓' : '';
      link.querySelector('.step-state').textContent = done
        ? 'Concluída'
        : link.dataset.lesson === stepId
          ? 'Você está aqui'
          : 'Não concluída';
    });
    if (button) {
      const index = state.course.steps.findIndex((step) => step.id === stepId);
      const blocked = state.course.steps
        .slice(0, index)
        .some((step) => !completed.includes(step.id));
      button.disabled = blocked || !state.enrolled;
      button.textContent = completed.includes(stepId)
        ? 'Continuar para a próxima etapa'
        : 'Concluir e continuar';
      document.querySelector('#completion-note').textContent = blocked
        ? 'Conclua as etapas anteriores para registrar esta conclusão.'
        : completed.includes(stepId)
          ? 'Etapa concluída. Seu progresso está salvo na sua conta.'
          : 'Ao concluir, você confirma que estudou esta etapa.';
    }
  }
  async function saveNotes() {
    if (!notesForm) return true;
    if (!state) throw new Error('Aguarde o carregamento antes de salvar.');
    if (savingNotes) return savingNotes;
    const save = notesForm.querySelector('[type=submit]');
    const submittedVersion = editVersion;
    const notes = Object.fromEntries(new FormData(notesForm));
    save.disabled = true;
    savingNotes = (async () => {
      const progress = await api('notes', { notes });
      state.progress = progress;
      dirty = editVersion !== submittedVersion;
      document.querySelector('#notes-state').textContent = dirty
        ? 'Há alterações não salvas.'
        : 'Anotações salvas na sua conta.';
      return !dirty;
    })();
    try {
      return await savingNotes;
    } finally {
      savingNotes = null;
      save.disabled = completing;
    }
  }
  if (notesForm) {
    notesForm.querySelector('[type=submit]').disabled = true;
    notesForm.addEventListener('input', (event) => {
      editVersion++;
      editedFields.add(event.target.name);
      dirty = true;
      document.querySelector('#notes-state').textContent = 'Há alterações não salvas.';
    });
    notesForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      message('');
      try {
        const saved = await saveNotes();
        message(
          saved
            ? 'Anotações salvas. Você pode continuar quando quiser.'
            : 'A versão enviada foi salva, mas você fez novas alterações. Salve novamente para guardar o texto mais recente.',
          saved ? 'success' : ''
        );
      } catch (error) {
        message(error.message, 'error');
        document.querySelector('#notes-state').textContent =
          (dirty ? 'Há alterações não salvas. ' : '') + error.message;
      }
    });
  }
  addEventListener('beforeunload', (event) => {
    if (dirty) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
  button?.addEventListener('click', async () => {
    if (completing) return;
    completing = true;
    const fields = notesForm ? [...notesForm.querySelectorAll('input, textarea')] : [];
    fields.forEach((field) => {
      field.readOnly = true;
    });
    if (notesForm) notesForm.querySelector('[type=submit]').disabled = true;
    button.disabled = true;
    message('Salvando seu progresso…');
    try {
      if (savingNotes) await savingNotes;
      if (dirty) await saveNotes();
      state.progress = await api('complete', { step: stepId });
      renderProgress();
      const index = state.course.steps.findIndex((step) => step.id === stepId);
      location.href = root + state.course.steps[index + 1].id;
    } catch (error) {
      message(error.message, 'error');
      renderProgress();
      document.querySelector('#completion-note').textContent = error.message;
      if (notesForm && dirty)
        document.querySelector('#notes-state').textContent =
          'Há alterações não salvas. ' + error.message;
    } finally {
      completing = false;
      fields.forEach((field) => {
        field.readOnly = false;
      });
      if (notesForm) notesForm.querySelector('[type=submit]').disabled = false;
    }
  });
  function clearPrintableNotes() {
    notesForm?.querySelectorAll('.print-note').forEach((element) => element.remove());
  }
  function preparePrintableNotes() {
    clearPrintableNotes();
    notesForm?.querySelectorAll('input, textarea').forEach((field) => {
      const paragraph = document.createElement('p');
      paragraph.className = 'print-note';
      paragraph.textContent = field.value || 'Não preenchido.';
      field.insertAdjacentElement('afterend', paragraph);
    });
  }
  addEventListener('beforeprint', preparePrintableNotes);
  addEventListener('afterprint', clearPrintableNotes);
  matchMedia('print').addEventListener('change', (event) =>
    event.matches ? preparePrintableNotes() : clearPrintableNotes()
  );
  document.querySelector('#print-material')?.addEventListener('click', () => {
    preparePrintableNotes();
    window.print();
  });
  document.querySelector('#load-video')?.addEventListener('click', () => {
    const container = document.querySelector('#video');
    const iframe = document.createElement('iframe');
    const videoId = container.dataset.video;
    const start = Number(container.dataset.start) || 0;
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?start=${start}&rel=0&playsinline=1`;
    iframe.title = container.dataset.title;
    iframe.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    container.replaceChildren(iframe);
  });
  async function loadQuiz() {
    const quiz = await api('quiz');
    const form = document.querySelector('#quiz-form');
    document.querySelector('#quiz-questions').innerHTML = quiz.questions
      .map(
        (q, index) =>
          `<fieldset><legend>${index + 1}. ${escape(q.prompt)}</legend>${q.options.map((option, i) => `<label class="quiz-option"><input type="radio" name="${escape(q.id)}" value="${i}" required><span>${escape(option)}</span></label>`).join('')}</fieldset>`
      )
      .join('');
    form.hidden = false;
    const submit = form.querySelector('[type=submit]');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      submit.disabled = true;
      submit.textContent = 'Corrigindo…';
      message('');
      try {
        const answers = Object.fromEntries(
          [...new FormData(form)].map(([key, value]) => [key, Number(value)])
        );
        const result = await api('quiz', { answers });
        state.progress = result.progress;
        renderProgress();
        const region = document.querySelector('#quiz-result');
        const retainedApproval = !result.passed && result.progress.completed.includes('avaliacao');
        const resultTitle = result.passed
          ? 'Você concluiu o minicurso.'
          : retainedApproval
            ? 'Sua aprovação continua registrada.'
            : 'Mais uma tentativa faz parte.';
        const resultSummary = result.passed
          ? 'As quatro etapas estão concluídas. Sua nota e seu progresso foram salvos na sua conta.'
          : retainedApproval
            ? 'Esta tentativa ficou abaixo da nota mínima, mas sua aprovação anterior permanece registrada. Revise os comentários e pratique novamente quando quiser.'
            : `Você precisa de ${result.passScore}% para concluir. Revise os comentários e tente novamente. Sua tentativa ficou registrada.`;
        region.innerHTML = `<h2>${resultTitle}</h2><p class="score">${result.score}% de acerto</p><p>${resultSummary}</p>${result.feedback.map((item, index) => `<div class="feedback-item"><h3>${item.correct ? 'Resposta correta' : 'Para revisar'} · Questão ${index + 1}</h3><p><strong>Alternativa correta:</strong> ${escape(quiz.questions[index].options[item.answer])}</p><p>${escape(item.explanation)}</p></div>`).join('')}<div class="lesson-tools"><button class="button secondary" id="retry-quiz">Responder novamente</button><a class="button primary" href="/">Voltar ao catálogo</a></div>`;
        region.hidden = false;
        form.hidden = true;
        region.focus();
        document.querySelector('#retry-quiz').addEventListener('click', () => {
          form.reset();
          form.hidden = false;
          region.hidden = true;
          form.querySelector('input').focus();
        });
      } catch (error) {
        message(error.message, 'error');
      } finally {
        submit.disabled = false;
        submit.textContent = 'Enviar respostas';
      }
    });
    if (state.attempts.length) {
      document.querySelector('#attempts').hidden = false;
      document.querySelector('#attempt-list').textContent = state.attempts
        .map(
          (attempt) =>
            `${new Date(attempt.createdAt).toLocaleString('pt-BR')} — ${attempt.score}%${attempt.passed ? ' · aprovado' : ''}`
        )
        .join('\n');
    }
  }
  async function initialize() {
    try {
      state = await api('state');
      renderProgress();
      if (!state.enrolled)
        throw new Error('Seu acesso ainda não foi liberado. Fale com a responsável pelo curso.');
      if (notesForm) {
        Object.entries(state.progress.notes).forEach(([key, value]) => {
          if (notesForm.elements.namedItem(key) && !editedFields.has(key))
            notesForm.elements.namedItem(key).value = value;
        });
        notesForm.querySelector('[type=submit]').disabled = false;
      }
      if (stepId === 'avaliacao') await loadQuiz();
      document.querySelector('#loading').hidden = true;
    } catch (error) {
      document.querySelector('#loading').hidden = true;
      message(error.message, 'error');
      const retry = document.querySelector('#retry-load');
      retry.hidden = false;
      retry.onclick = () => location.reload();
    }
  }
  initialize();
})();
