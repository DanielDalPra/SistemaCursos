(() => {
  let state;
  let apiRoot;
  const status = document.querySelector('#admin-status');
  const form = document.querySelector('#enroll-form');
  const selector = document.querySelector('#course-selector');
  const submit = form.querySelector('[type=submit]');
  const requested = new URLSearchParams(location.search).get('curso');
  if ([...selector.options].some(option => option.value === requested)) selector.value = requested;
  function message(text,error=false){status.textContent=text;status.className='status-message '+(error?'error':'');}
  async function request(path,body){
    const response=await fetch(apiRoot+path,{credentials:'same-origin',headers:{'Content-Type':'application/json',...(body?{'X-Aprende-CSRF':state.csrf}:{})},...(body?{method:'POST',body:JSON.stringify(body)}:{})});
    const data=await response.json();if(!response.ok)throw new Error(data.error||'Não foi possível atualizar os acessos.');return data;
  }
  async function refresh(){
    const students=await request('enrollments');
    const list=document.querySelector('#enrollment-list');list.replaceChildren();
    document.querySelector('#enrollment-empty').hidden=students.length!==0;
    students.forEach(student=>{const item=document.createElement('li');const name=document.createElement('strong');name.textContent=student.name;const email=document.createElement('small');email.textContent=student.email;const date=document.createElement('small');date.textContent='Liberado em '+new Date(student.grantedAt).toLocaleString('pt-BR');item.append(name,email,date);list.append(item);});
  }
  async function loadCourse(){
    submit.disabled=true;selector.disabled=true;message('Carregando acessos…');
    apiRoot=selector.value==='do-plano-a-acao'?'/api/aprende/':'/api/aprende/'+selector.value+'/';
    try{
      state=await request('state');if(!state.admin)throw new Error('Apenas administradores podem gerenciar acessos.');
      document.querySelector('#managed-course').textContent=state.course.title;
      document.querySelector('#open-managed-course').href='/cursos/'+state.course.id;
      await refresh();submit.disabled=false;message('Pronto para gerenciar acessos de '+state.course.title+'.');
      history.replaceState(null,'','/cursos/administracao?curso='+encodeURIComponent(selector.value));
    }catch(error){message(error.message+' Recarregue a página ou entre novamente.',true);}
    finally{selector.disabled=false;}
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!form.reportValidity()||!state)return;
    submit.disabled=true;selector.disabled=true;message('Salvando alteração…');
    try{const data=await request('enrollments',Object.fromEntries(new FormData(form)));await refresh();message(`Acesso ${data.action==='grant'?'liberado':'revogado'} para ${data.name}.`);}
    catch(error){message(error.message,true);}finally{submit.disabled=false;selector.disabled=false;}
  });
  selector.addEventListener('change',loadCourse);
  document.querySelector('#reload-enrollments').addEventListener('click',async()=>{try{await refresh();message('Lista atualizada.');}catch(error){message(error.message,true);}});
  loadCourse();
})();
