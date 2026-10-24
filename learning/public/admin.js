(() => {
  let state;
  const status = document.querySelector('#admin-status');
  const form = document.querySelector('#enroll-form');
  const submit = form.querySelector('[type=submit]');
  function message(text,error=false){status.textContent=text;status.className='status-message '+(error?'error':'');}
  async function request(path,body){
    const response=await fetch('/api/aprende/'+path,{credentials:'same-origin',headers:{'Content-Type':'application/json',...(body?{'X-Aprende-CSRF':state.csrf}:{})},...(body?{method:'POST',body:JSON.stringify(body)}:{})});
    const data=await response.json();if(!response.ok)throw new Error(data.error||'Não foi possível atualizar os acessos.');return data;
  }
  async function refresh(){
    const students=await request('enrollments');
    const list=document.querySelector('#enrollment-list');list.replaceChildren();
    document.querySelector('#enrollment-empty').hidden=students.length!==0;
    students.forEach(student=>{const item=document.createElement('li');const name=document.createElement('strong');name.textContent=student.name;const email=document.createElement('small');email.textContent=student.email;const date=document.createElement('small');date.textContent='Liberado em '+new Date(student.grantedAt).toLocaleString('pt-BR');item.append(name,email,date);list.append(item);});
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!form.reportValidity())return;
    submit.disabled=true;message('Salvando alteração…');
    try{const data=await request('enrollments',Object.fromEntries(new FormData(form)));await refresh();message(`Acesso ${data.action==='grant'?'liberado':'revogado'} para ${data.name}.`);}
    catch(error){message(error.message,true);}finally{submit.disabled=false;}
  });
  document.querySelector('#reload-enrollments').addEventListener('click',async()=>{try{await refresh();message('Lista atualizada.');}catch(error){message(error.message,true);}});
  (async()=>{try{state=await request('state');if(!state.admin)throw new Error('Apenas administradores podem gerenciar acessos.');await refresh();submit.disabled=false;message('Pronto para gerenciar acessos.');}catch(error){message(error.message+' Recarregue a página ou entre novamente.',true);}})();
})();
