(() => {
  const status = document.querySelector('#student-status');
  const retry = document.querySelector('#retry-student');
  let courses = [];
  let filter = 'all';
  const kind = (course) =>
    !course.enrolled
      ? 'locked'
      : course.completed === course.total
        ? 'done'
        : course.completed
          ? 'active'
          : 'new';
  const labels = {
    locked: 'Acesso pendente',
    done: 'Concluído',
    active: 'Em andamento',
    new: 'Pronto para começar',
  };
  function render() {
    const list = document.querySelector('#student-courses');
    list.replaceChildren();
    const visible = courses.filter(
      (course) =>
        filter === 'all' ||
        (filter === 'active' && ['active', 'new'].includes(kind(course))) ||
        filter === kind(course)
    );
    visible.forEach((course) => {
      const item = document.createElement('li');
      const copy = document.createElement('div');
      const state = document.createElement('span');
      state.className = 'course-state';
      state.textContent = labels[kind(course)];
      const heading = document.createElement('h2');
      heading.textContent = course.title;
      const description = document.createElement('p');
      description.textContent = course.enrolled
        ? `${course.completed} de ${course.total} etapas concluídas`
        : 'Fale com a responsável pelo curso para liberar seu acesso.';
      copy.append(state, heading, description);
      if (course.enrolled) {
        const progress = document.createElement('progress');
        progress.value = course.completed;
        progress.max = course.total;
        progress.setAttribute('aria-label', 'Progresso de ' + course.title);
        copy.append(progress);
      }
      const link = document.createElement('a');
      link.href = course.resumeUrl || '/cursos/' + course.id;
      link.className = 'button ' + (course.enrolled ? 'primary' : 'secondary');
      link.textContent =
        kind(course) === 'done'
          ? 'Revisar curso'
          : course.enrolled
            ? course.completed
              ? 'Continuar curso'
              : 'Começar curso'
            : 'Ver como liberar';
      link.setAttribute('aria-label', link.textContent + ': ' + course.title);
      item.append(copy, link);
      list.append(item);
    });
    const empty = document.querySelector('#student-empty');
    empty.hidden = visible.length > 0;
    empty.textContent =
      filter === 'done'
        ? 'Você ainda não concluiu um curso. Cada etapa conta: retome seus estudos quando puder.'
        : filter === 'active'
          ? 'Nenhum curso liberado em andamento. Veja todos os cursos para conferir seus acessos.'
          : 'Nenhum curso nesta seleção.';
    document
      .querySelectorAll('[data-filter]')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(button.dataset.filter === filter))
      );
  }
  async function load(initial = false) {
    retry.hidden = true;
    status.textContent = 'Carregando seus cursos…';
    status.className = 'status-message';
    try {
      const data = await (initial
        ? window.AprendeNavigation.ready
        : window.AprendeNavigation.reload());
      courses = data.courses;
      render();
      status.textContent = 'Seu progresso e suas anotações ficam salvos na sua conta.';
      const next = courses
        .filter((course) => course.enrolled && course.completed < course.total)
        .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))[0];
      const resume = document.querySelector('#student-resume');
      resume.hidden = !next;
      if (next) {
        resume.href = next.resumeUrl;
        resume.setAttribute('aria-label', 'Continuar estudando: ' + next.title);
      }
      document.querySelector('#student-filters').hidden = false;
    } catch (error) {
      status.textContent = error.message;
      status.className = 'status-message error';
      retry.hidden = false;
    }
  }
  document.querySelectorAll('[data-filter]').forEach((button) =>
    button.addEventListener('click', () => {
      filter = button.dataset.filter;
      render();
    })
  );
  retry.addEventListener('click', () => load());
  load(true);
})();
