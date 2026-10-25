(() => {
  const search = document.querySelector('#search');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const courses = [...document.querySelectorAll('.course')];
  let selected = 'Todos';
  const normalize = (value) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  function render() {
    const term = normalize(search.value.trim());
    let count = 0;
    courses.forEach((course) => {
      const visible =
        (selected === 'Todos' || course.dataset.category === selected) &&
        normalize(course.textContent).includes(term);
      course.hidden = !visible;
      if (visible) count++;
    });
    document.querySelector('#empty').hidden = count !== 0;
    document.querySelector('#result-status').textContent =
      `${count} ${count === 1 ? 'curso encontrado' : 'cursos encontrados'}.`;
    filters.forEach((button) => {
      const active = button.dataset.filter === selected;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  filters.forEach((button) =>
    button.addEventListener('click', () => {
      selected = button.dataset.filter;
      render();
    })
  );
  search.addEventListener('input', render);
  document.querySelector('#reset').addEventListener('click', () => {
    selected = 'Todos';
    search.value = '';
    render();
    search.focus();
  });
  document.querySelectorAll('[data-topic]').forEach((link) =>
    link.addEventListener('click', () => {
      selected = link.dataset.topic;
      search.value = '';
      render();
    })
  );
  render();
  // Motion assists discovery once; never hides content or delays keyboard actions.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const isImage = entry.target.tagName === 'FIGURE';
          entry.target.animate(
            isImage
              ? [
                  { transform: 'scale(.98)', opacity: 0.65 },
                  { transform: 'scale(1)', opacity: 1 },
                ]
              : [
                  { transform: 'translateY(18px)', opacity: 0.5 },
                  { transform: 'translateY(0)', opacity: 1 },
                ],
            { duration: isImage ? 700 : 550, easing: 'cubic-bezier(.23,1,.32,1)' }
          );
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );
    document
      .querySelectorAll(
        '.section-heading, .course-photo, .course-copy, .how-heading, .how li, .student-photo, .student-copy, .footer-top'
      )
      .forEach((element) => observer.observe(element));
  }
})();
