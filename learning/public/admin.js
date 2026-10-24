(() => {
  let state;let apiRoot;let students=[];let busy=true;let searching=false;let generation=0;
  const status=document.querySelector('#admin-status');const form=document.querySelector('#enroll-form');
  const selector=document.querySelector('#course-selector');const submit=form.querySelector('[type=submit]');
  const searchForm=document.querySelector('#student-search');const searchButton=document.querySelector('#search-submit');const reload=document.querySelector('#reload-enrollments');
  const requested=new URLSearchParams(location.search).get('curso');if([...selector.options].some(option=>option.value===requested))selector.value=requested;
  function message(text,error=false){status.textContent=text;status.className='status-message '+(error?'error':'');}
  function controls(){submit.disabled=busy||!state;selector.disabled=busy;reload.disabled=busy||!state;searchButton.disabled=busy||searching||!state;document.querySelectorAll('[data-student-action]').forEach(button=>button.disabled=busy||!state);}
  async function request(path,body){
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
    try{const response=await fetch(apiRoot+path,{signal:controller.signal,credentials:'same-origin',headers:{'Content-Type':'application/json',...(body?{'X-Aprende-CSRF':state.csrf}:{})},...(body?{method:'POST',body:JSON.stringify(body)}:{})});const data=await response.json();if(!response.ok)throw new Error(data.error||'Não foi possível atualizar os acessos.');return data;}
    catch(error){if(error.name==='AbortError')throw new Error('A resposta demorou. Atualize a lista para conferir antes de repetir a alteração.');if(error instanceof TypeError)throw new Error('Falha de conexão. Confira sua internet e atualize a lista antes de tentar novamente.');throw error;}
    finally{clearTimeout(timeout);}
  }
  function preview(){const email=form.elements.email.value.trim();const action=form.elements.action.value;document.querySelector('#access-preview').textContent=email?`${action==='grant'?'Liberar':'Revogar'} acesso de ${email} ao curso ${state?.course.title||'selecionado'}.`:'Informe o aluno e confira o curso antes de salvar.';}
  function choose(student,action){form.elements.email.value=student.email;form.elements.action.value=action;preview();document.querySelector('#access-preview').scrollIntoView({block:'center',behavior:'instant'});submit.focus();}
  function render(){const list=document.querySelector('#enrollment-list');list.replaceChildren();const query=document.querySelector('#enrollment-filter').value.trim().toLocaleLowerCase('pt-BR');const visible=students.filter(student=>(student.name+' '+student.email).toLocaleLowerCase('pt-BR').includes(query));
    document.querySelector('#enrollment-empty').hidden=students.length!==0;document.querySelector('#enrollment-no-match').hidden=!students.length||visible.length>0;
    document.querySelector('#enrollment-count').textContent=`${visible.length} de ${students.length} ${students.length===1?'aluno liberado':'alunos liberados'}`;
    visible.forEach(student=>{const item=document.createElement('li');const copy=document.createElement('div');const name=document.createElement('strong');name.textContent=student.name;const email=document.createElement('small');email.textContent=student.email;const date=document.createElement('small');date.textContent='Liberado em '+new Date(student.grantedAt).toLocaleString('pt-BR');const button=document.createElement('button');button.type='button';button.className='button secondary';button.dataset.studentAction='revoke';button.textContent='Revisar revogação';button.setAttribute('aria-label','Revisar revogação: '+student.name);button.disabled=busy;button.addEventListener('click',()=>choose(student,'revoke'));copy.append(name,email,date);item.append(copy,button);list.append(item);});
  }
  async function refresh(){students=await request('enrollments');render();}
  async function loadCourse(){busy=true;state=null;generation++;controls();message('Carregando acessos…');students=[];render();document.querySelector('#search-results').replaceChildren();document.querySelector('#search-status').textContent='';form.reset();apiRoot=selector.value==='do-plano-a-acao'?'/api/aprende/':'/api/aprende/'+selector.value+'/';
    try{const loaded=await request('state');if(!loaded.admin)throw new Error('Apenas administradores podem gerenciar acessos.');state=loaded;document.querySelector('#managed-course').textContent=state.course.title;document.querySelector('#open-managed-course').href='/cursos/'+state.course.id;await refresh();message('Pronto para gerenciar acessos de '+state.course.title+'.');history.replaceState(null,'','/cursos/administracao?curso='+encodeURIComponent(selector.value));}
    catch(error){message(error.message+' Se necessário, recarregue a página.',true);state=null;}
    finally{busy=false;preview();controls();}
  }
  searchForm.addEventListener('submit',async event=>{event.preventDefault();if(busy||searching||!state||!searchForm.reportValidity())return;searching=true;controls();const version=generation;const local=document.querySelector('#search-status');local.textContent='Buscando contas ativas…';const list=document.querySelector('#search-results');list.replaceChildren();
    try{const results=await request('students?q='+encodeURIComponent(document.querySelector('#student-query').value.trim()));if(version!==generation)return;local.textContent=results.length?`${results.length} ${results.length===1?'conta encontrada':'contas encontradas'}${results.length===15?' (limite de 15; refine a busca)':''}.`:'Nenhuma conta ativa encontrada. Confira o e-mail ou o cadastro.';
      results.forEach(student=>{const item=document.createElement('li');const copy=document.createElement('div');const name=document.createElement('strong');name.textContent=student.name;const email=document.createElement('small');email.textContent=student.email;const access=document.createElement('small');access.textContent=student.enrolled?'Já tem acesso a este curso':'Sem acesso a este curso';copy.append(name,email,access);const button=document.createElement('button');button.type='button';button.className='button secondary';button.dataset.studentAction='select';button.textContent='Selecionar aluno';button.setAttribute('aria-label','Selecionar aluno: '+student.name);button.addEventListener('click',()=>choose(student,'grant'));item.append(copy,button);list.append(item);});
    }catch(error){if(version===generation)local.textContent=error.message;}finally{searching=false;controls();}
  });
  form.addEventListener('input',preview);
  form.addEventListener('submit',async event=>{event.preventDefault();if(busy||!form.reportValidity()||!state)return;busy=true;generation++;controls();message('Salvando alteração…');
    try{const data=await request('enrollments',Object.fromEntries(new FormData(form)));document.querySelector('#search-results').replaceChildren();document.querySelector('#search-status').textContent='';message(`Acesso ${data.action==='grant'?'liberado':'revogado'} para ${data.name}.`);try{await refresh();}catch(error){message(`Alteração salva. Não foi possível atualizar a lista: ${error.message}`,true);}}
    catch(error){message(error.message,true);}finally{busy=false;controls();}
  });
  selector.addEventListener('change',loadCourse);document.querySelector('#enrollment-filter').addEventListener('input',render);
  reload.addEventListener('click',async()=>{if(busy||!state)return;busy=true;controls();try{await refresh();message('Lista atualizada.');}catch(error){message(error.message,true);}finally{busy=false;controls();}});
  loadCourse();
})();
