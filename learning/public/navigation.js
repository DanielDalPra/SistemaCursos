(() => {
  const sidebar = document.querySelector('.course-sidebar') || document.createElement('aside');
  const lesson = sidebar.classList.contains('course-sidebar');
  if (!lesson) {
    sidebar.className = 'app-sidebar';
    const main = document.querySelector('main');
    const layout = document.createElement('div'); layout.className = 'app-layout';
    main.before(layout); layout.append(sidebar, main);
  }
  const menu = document.createElement('details'); menu.className = 'global-menu';
  menu.innerHTML = `<summary>Menu do aluno<span aria-hidden="true">+</span></summary><div class="global-menu-content"><p class="nav-person" id="nav-person">Sua área de estudos</p><nav aria-label="Área do aluno"><a href="/cursos" data-nav="courses">Meus cursos</a><a href="/cursos" id="nav-continue" hidden>Continuar estudando</a><a href="/p">Minha conta</a><a href="/cursos/administracao" id="nav-admin" hidden>Gerenciar acessos</a><a href="/">Explorar cursos</a><a href="/logout" class="nav-exit">Sair da conta</a></nav><p class="nav-error" id="nav-error" role="status" hidden></p></div>`;
  sidebar.prepend(menu);
  if (lesson) menu.classList.add('lesson-menu');
  const mobile = matchMedia('(max-width:760px)');
  const adapt = () => { menu.open = !mobile.matches; }; adapt(); mobile.addEventListener('change',adapt);
  menu.addEventListener('keydown',event => { if(event.key==='Escape' && mobile.matches){menu.open=false;menu.querySelector('summary').focus();} });
  const active = location.pathname === '/cursos' ? menu.querySelector('[data-nav=courses]') : location.pathname === '/cursos/administracao' ? menu.querySelector('#nav-admin') : null;
  active?.setAttribute('aria-current','page');
  document.querySelectorAll('.header .account-link[href="/login"]').forEach(link => {link.href='/p';link.textContent='Minha conta';});
  async function load(){
    const controller = new AbortController(); const timer=setTimeout(()=>controller.abort(),15000);
    try {
      const response=await fetch('/api/aprende/catalog',{credentials:'same-origin',signal:controller.signal});
      const data=await response.json();if(!response.ok)throw new Error(data.error || 'Não foi possível carregar sua área.');
      document.querySelector('#nav-person').textContent=data.user?.name || 'Sua área de estudos';
      document.querySelector('#nav-admin').hidden=!data.admin;
      const next=data.courses.filter(course=>course.enrolled && course.completed<course.total).sort((a,b)=>(b.updatedAt || '').localeCompare(a.updatedAt || ''))[0];
      const resume=document.querySelector('#nav-continue');resume.hidden=!next;if(next)resume.href=next.resumeUrl;
      return data;
    } catch(error) {
      const message=error.name==='AbortError'?'A conexão demorou. Recarregue para tentar novamente.':error instanceof TypeError?'Sem conexão. Recarregue para tentar novamente.':error.message;
      const notice=document.querySelector('#nav-error');notice.textContent=message;notice.hidden=false;
      throw new Error(message);
    } finally {clearTimeout(timer);}
  }
  window.AprendeNavigation={ready:load(),reload:load};
  window.AprendeNavigation.ready.catch(()=>{});
})();
