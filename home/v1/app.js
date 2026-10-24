(() => {
  const courses = [
    {id:'primeiro-passo', category:'Desenvolvimento pessoal', title:'Transforme planos em próximos passos', description:'Um espaço para repensar objetivos, reconhecer possibilidades e começar a agir com mais clareza.', color:'sage', drawing:'<span class="shape-circle"></span><span class="shape-stair"></span><span class="shape-star">✳</span>'},
    {id:'rotina', category:'Produtividade', title:'Uma rotina que funciona para você', description:'Explore formas de organizar seu tempo e criar hábitos que respeitam a sua realidade.', color:'sand', drawing:'<span class="shape-sheet"></span><span class="shape-disc">✓</span>'},
    {id:'comunicacao', category:'Comunicação', title:'Suas ideias merecem ser ouvidas', description:'Descubra caminhos para se expressar com clareza e construir conversas com mais confiança.', color:'lilac', drawing:'<span class="bubble"><span class="bubble-lines"></span></span><span class="bubble small">···</span>'}
  ];
  const grid = document.querySelector('#course-grid');
  const search = document.querySelector('#search');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const dialog = document.querySelector('#course-dialog');
  let selected = 'Todos';
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function render() {
    const term = normalize(search.value.trim());
    const visible = courses.filter(course => (selected === 'Todos' || course.category === selected) && normalize(`${course.title} ${course.description} ${course.category}`).includes(term));
    grid.innerHTML = visible.map(course => `<article class="course-card"><div class="course-cover ${course.color}" aria-hidden="true"><span class="cover-label">APRENDE / NOVOS CAMINHOS</span><div class="cover-drawing">${course.drawing}</div><span class="cover-number">0${courses.indexOf(course) + 1} / EXPLORAR</span></div><div class="course-content"><p class="course-category">${course.category}</p><h3>${course.title}</h3><p class="course-description">${course.description}</p><div class="course-bottom"><span class="demo-tag">Curso de exemplo</span><button class="course-button" data-course="${course.id}" aria-label="Conhecer curso: ${course.title}">Conhecer curso ↗</button></div></div></article>`).join('');
    document.querySelector('#empty').hidden = visible.length !== 0;
    document.querySelector('#result-status').textContent = `${visible.length} ${visible.length === 1 ? 'curso encontrado' : 'cursos encontrados'}.`;
  }
  filters.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.filter;
    filters.forEach(filter => { const active = filter === button; filter.classList.toggle('active', active); filter.setAttribute('aria-pressed', String(active)); });
    render();
  }));
  search.addEventListener('input', render);
  document.querySelector('#reset').addEventListener('click', () => { search.value = ''; filters[0].click(); search.focus(); });
  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-course]');
    if (!button) return;
    const course = courses.find(item => item.id === button.dataset.course);
    document.querySelector('#dialog-title').textContent = course.title;
    document.querySelector('#dialog-description').textContent = course.description;
    dialog.showModal();
  });
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  document.querySelector('.dialog-back').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  render();
})();
