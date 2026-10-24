(() => {
  const status=document.querySelector('#student-status');
  const retry=document.querySelector('#retry-student');
  async function load(){
    retry.hidden=true;status.textContent='Carregando seus cursos…';status.className='status-message';
    try{
      const response=await fetch('/api/aprende/catalog',{credentials:'same-origin'});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'Não foi possível carregar os cursos.');
      const list=document.querySelector('#student-courses');list.replaceChildren();
      data.courses.forEach(course=>{
        const item=document.createElement('li');const heading=document.createElement('h2');heading.textContent=course.title;heading.style.margin='0 0 15px';
        const description=document.createElement('p');description.textContent=course.enrolled?`${course.completed} de ${course.total} etapas concluídas`:'Aguardando liberação de acesso.';
        const link=document.createElement('a');link.href='/cursos/'+course.id;link.className='button '+(course.enrolled?'primary':'secondary');link.style.marginTop='20px';link.textContent=course.enrolled?'Continuar curso':'Ver como liberar';
        item.append(heading,description,link);list.append(item);
      });
      status.textContent='Seu progresso é salvo separadamente em cada curso.';document.querySelector('#student-admin').hidden=!data.admin;
    }catch(error){status.textContent=error.message+' Recarregue ou entre novamente.';status.className='status-message error';retry.hidden=false;}
  }
  retry.addEventListener('click',load);load();
})();
