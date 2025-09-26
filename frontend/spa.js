console.log('ConectEdu SPA v4.1');
const api=axios.create({baseURL:CONFIG.API_BASE, timeout:12000});
api.interceptors.request.use(cfg=>{ const t=localStorage.getItem('token'); if(t){ cfg.headers['Authorization']='Bearer '+t } return cfg });
api.interceptors.response.use(r=>r, err=>{ if(err.response && err.response.status===401){ localStorage.removeItem('token'); if(location.hash!=='#/login') location.hash='#/login'; } return Promise.reject(err); });

const Guard=(to,from,next)=>{
  const t=localStorage.getItem('token');
  if(!t && to.path!=='/login' && to.path!=='/register'){
    next('/login');
  } else {
    next();
  }
};

const Layout={template:`
<div class="min-h-screen flex">
  <div class="fixed inset-0 bg-black/30 z-40 lg:hidden" v-show="open" @click="open=false"></div>
  <aside :class="['fixed top-0 left-0 h-full w-72 bg-white/90 backdrop-blur border-r z-50 p-4 transform transition-transform lg:translate-x-0', open?'translate-x-0':'-translate-x-full']">
    <div class="flex items-center justify-between mb-4">
      <div class="text-xl font-semibold text-slate-800">Menu</div>
      <button class="btn btn-sm btn-outline-secondary lg:hidden" @click="open=false">Fechar</button>
    </div>
    <nav class="rounded-xl border border-slate-200 divide-y divide-slate-200 bg-white">
      <router-link class="block px-4 py-2 hover:bg-slate-50" to="/">Dashboard</router-link>
      <router-link class="block px-4 py-2 hover:bg-slate-50" to="/alunos">Alunos</router-link>
      <router-link class="block px-4 py-2 hover:bg-slate-50" to="/formularios">Formulários</router-link>
      <router-link class="block px-4 py-2 hover:bg-slate-50" to="/planos">Planejamento</router-link>
      <router-link class="block px-4 py-2 hover:bg-slate-50" to="/frequencia">Frequência</router-link>
      <router-link class="block px-4 py-2 hover:bg-slate-50" to="/relatorios">Relatórios</router-link>
      <router-link v-if="me && me.role==='admin'" class="block px-4 py-2 hover:bg-slate-50" to="/admin/users">Usuários</router-link>
    </nav>
    <div class="mt-6">
      <button class="inline-flex items-center justify-center w-full px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-red-300 text-red-600 bg-transparent hover:bg-red-50 active:translate-y-px" @click="logout">Sair</button>
    </div>
  </aside>
  <main class="flex-1 w-full lg:ml-72">
    <header class="p-3 px-4 bg-white/90 backdrop-blur border-b flex items-center gap-2 sticky top-0 z-30">
      <button class="btn btn-light lg:hidden" @click="open=true">Menu</button>
      <div class="text-lg font-medium text-slate-800">Painel</div>
    </header>
    <section class="p-4 lg:p-6"><router-view></router-view></section>
  </main>
</div>`, data(){return{open:false,me:null}}, async created(){ try{ const r=await api.get('/auth/me'); this.me=r.data.data; }catch(e){ /* 401 handled */ } }, methods:{
  async logout(){ await api.post('/auth/logout', {}).catch(()=>{}); localStorage.removeItem('token'); this.$router.push('/login'); }
}};

const Login={template:`
<div class="min-h-[80vh] grid place-items-center p-4">
  <div class="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 space-y-3 ring-1 ring-blue-100">
    <div class="text-center">
      <div class="text-2xl font-semibold text-slate-800">Entrar</div>
      <div class="text-slate-500 text-sm">Use seu e-mail e senha</div>
    </div>
    <input v-model="email" type="email" class="form-control" placeholder="E-mail">
    <input v-model="password" type="password" class="form-control" placeholder="Senha">
    <button class="inline-flex items-center justify-center w-full px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 active:translate-y-px" @click="doLogin">Entrar</button>
    <div class="text-center"><router-link to="/register">Criar conta</router-link></div>
    <div v-if="err" class="text-danger text-center text-sm">{{err}}</div>
  </div>
</div>`, data(){return{email:'admin@conectedu.local',password:'admin123',err:null}}, methods:{
  async doLogin(){ this.err=null; try{ const r=await api.post('/auth/login',{email:this.email,password:this.password}); if(r.data.ok){ localStorage.setItem('token',r.data.data.token); this.$router.push('/'); } else this.err=r.data.error||'Erro'; }catch(e){ this.err='Não foi possível conectar à API'; } }
}};

const Register={template:`
<div class="min-h-[80vh] grid place-items-center p-4">
  <div class="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 space-y-3 ring-1 ring-blue-100">
    <div class="text-center"><div class="text-2xl font-semibold">Criar conta</div></div>
    <input v-model="name" class="form-control" placeholder="Nome">
    <input v-model="email" type="email" class="form-control" placeholder="E-mail">
    <input v-model="password" type="password" class="form-control" placeholder="Senha">
    <button class="inline-flex items-center justify-center w-full px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 active:translate-y-px" @click="doReg">Registrar</button>
    <div class="text-center"><router-link to="/login">Já tenho conta</router-link></div>
    <div v-if="err" class="text-danger text-center text-sm">{{err}}</div>
  </div>
</div>`, data(){return{name:'',email:'',password:'',err:null}}, methods:{
  async doReg(){ this.err=null; try{ const r=await api.post('/auth/register',{name:this.name,email:this.email,password:this.password}); if(r.data.ok){ localStorage.setItem('token',r.data.data.token); this.$router.push('/'); } else this.err=r.data.error||'Erro'; }catch(e){ this.err='Não foi possível conectar à API'; } }
}};

const Dashboard={template:`
<div>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    <div class="rounded-2xl bg-white shadow-lg ring-1 ring-slate-200"><div class="p-4"><div class="text-muted">Alunos</div><div class="fs-3">{{cards.total_students}}</div></div></div>
    <div class="rounded-2xl bg-white shadow-lg ring-1 ring-slate-200"><div class="p-4"><div class="text-muted">Ativos</div><div class="fs-3">{{cards.active_students}}</div></div></div>
    <div class="rounded-2xl bg-white shadow-lg ring-1 ring-slate-200"><div class="p-4"><div class="text-muted">PDIs Concluídos</div><div class="fs-3">{{cards.pdis_concluidos}}</div></div></div>
    <div class="rounded-2xl bg-white shadow-lg ring-1 ring-slate-200"><div class="p-4"><div class="text-muted">Pendências</div><div class="fs-3">{{cards.formularios_pendentes}}</div></div></div>
  </div>
  <div class="row g-3 mt-3">
    <div class="col-lg-6"><div class="rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 h-full">
      <div class="px-4 py-3 font-semibold text-white d-flex align-items-center justify-content-between" style="background:linear-gradient(90deg,#2563eb,#22d3ee);color:#fff">
        <span>Atividades Recentes</span>
        <button class="btn btn-sm btn-light" @click="openStatsDebug" title="Abrir stats em nova aba (debug)">Debug</button>
      </div>
      <div class="p-0">
        <ul class="divide-y divide-slate-200 bg-white">
          <li v-for="r in recent" :key="r.id" class="list-group-item d-flex justify-content-between"><span>{{r.message}}</span><small class="text-muted">{{new Date(r.created_at).toLocaleString()}}</small></li>
          <li v-if="recent.length===0" class="list-group-item text-muted">Sem atividades</li>
        </ul>
      </div>
    </div></div>
    <div class="col-lg-6"><div class="rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 h-full">
      <div class="px-4 py-3 font-semibold text-white" style="background:linear-gradient(90deg,#22d3ee,#2563eb);color:#fff">Resumo de Vagas</div>
      <div class="p-4">
        <h6 class="text-muted">Professores de Apoio</h6>
        <div class="table-responsive mb-3"><table class="w-full text-sm align-middle"><thead><tr><th>Nome</th><th>Usadas</th><th>Cap.</th><th>Disp.</th></tr></thead><tbody><tr v-for="t in vagas.apoio" :key="'a'+t.id"><td>{{t.name}}</td><td>{{t.used}}</td><td>{{t.capacity}}</td><td>{{t.capacity - t.used}}</td></tr></tbody></table></div>
        <h6 class="text-muted">Salas de Recursos</h6>
        <div class="overflow-x-auto"><table class="w-full text-sm align-middle"><thead><tr><th>Nome</th><th>Usadas</th><th>Cap.</th><th>Disp.</th></tr></thead><tbody><tr v-for="r in vagas.srm" :key="'r'+r.id"><td>{{r.name}}</td><td>{{r.used}}</td><td>{{r.capacity}}</td><td>{{r.capacity - r.used}}</td></tr></tbody></table></div>
      </div>
    </div></div>
  </div>
  <div class="row g-3 mt-2">
    <div class="col-lg-4"><div class="rounded-2xl bg-white shadow-lg ring-1 ring-slate-200"><div class="card-header">Alunos por Modalidade</div><div class="p-4"><div id="hc-mod"></div></div></div></div>
    <div class="col-lg-4"><div class="rounded-2xl bg-white shadow-lg ring-1 ring-slate-200"><div class="card-header">PDIs por Status</div><div class="p-4"><div id="hc-pdi"></div></div></div></div>
    <div class="col-lg-4"><div class="rounded-2xl bg-white shadow-lg ring-1 ring-slate-200"><div class="card-header">Presenças (30 dias)</div><div class="p-4"><div id="hc-att"></div></div></div></div>
  </div>
</div>`, data(){return{cards:{total_students:0,active_students:0,pdis_concluidos:0,formularios_pendentes:0}, recent:[], vagas:{apoio:[],srm:[]}, charts:null}}, async mounted(){ await this.load(); }, methods:{
  async load(){ try{ const r=await api.get('/stats'); if(r.data.ok){ this.cards=r.data.data.cards; this.recent=r.data.data.recent; this.vagas=r.data.data.vagas; this.charts=r.data.data.charts; this.drawCharts(); } }catch(e){} },
  openStatsDebug(){ const t=localStorage.getItem('token'); if(!t) return alert('Sem token'); const url=CONFIG.API_BASE+'/stats?token='+encodeURIComponent(t); window.open(url,'_blank'); },
  drawCharts(){ const mod=(this.charts.students_by_modalidade||[]).map(i=>({name:String(i.modalidade||'N/D').toUpperCase(),y:Number(i.c||0)})); Highcharts.chart('hc-mod',{title:{text:null},series:[{type:'pie',data:mod}],credits:{enabled:false}});
    const pdi=(this.charts.pdi_status||[]).map(i=>[String(i.status||'N/D'), Number(i.c||0)]); Highcharts.chart('hc-pdi',{title:{text:null},xAxis:{type:'category'},series:[{type:'column',data:pdi}],credits:{enabled:false}});
    const days={}; (this.charts.attendance_30d||[]).forEach(i=>{ const d=i.date; if(!days[d]) days[d]={P:0,A:0}; if(String(i.present)=='1') days[d].P+=Number(i.c); else days[d].A+=Number(i.c); }); const cats=Object.keys(days).sort(); const P=cats.map(k=>days[k].P); const A=cats.map(k=>days[k].A);
    Highcharts.chart('hc-att',{title:{text:null},xAxis:{categories:cats},yAxis:{title:{text:'Registros'}},series:[{name:'Presente',type:'line',data:P},{name:'Ausente',type:'line',data:A}],credits:{enabled:false}});
  }
}};

const Alunos={template:`
<div>
  <div class="flex items-center justify-between mb-3"><h3 class="text-xl font-semibold">Alunos</h3><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 active:translate-y-px" @click="openNew">Novo Aluno</button></div>
  <div class="row g-2 mb-3">
    <div class="col-md-6">
      <input v-model="q" @input="search" class="form-control" placeholder="Buscar aluno (nome)">
      <datalist id="dl-students">
        <option v-for="s in suggestions" :key="s.id" :value="display(s)"></option>
      </datalist>
    </div>
    <div class="col-md-2 d-grid"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-slate-300 text-slate-700 bg-transparent hover:bg-slate-50 active:translate-y-px" @click="load">Filtrar</button></div>
  </div>
  <div class="overflow-x-auto"><table class="w-full text-sm align-middle"><thead><tr><th>Nome</th><th>Modalidade</th><th>Status</th><th>Vínculo</th><th></th></tr></thead><tbody>
    <tr v-for="s in rows" :key="s.id"><td>{{s.name}}</td><td class="text-uppercase">{{s.modalidade}}</td><td><span :class="['badge', s.status==='ativo'?'bg-success':'bg-secondary']">{{s.status}}</span></td><td><span v-if="s.modalidade==='apoio'">Prof #{{s.support_teacher_id||'-'}}</span><span v-else>SRM #{{s.srm_room_id||'-'}}</span></td>
    <td class="text-end"><div class="btn-group"><button class="inline-flex items-center justify-center px-2.5 py-1.5 text-sm rounded-md font-semibold shadow-sm ring-1 ring-blue-300 text-blue-700 bg-transparent hover:bg-blue-50 active:translate-y-px" @click="edit(s)">Editar</button><button class="inline-flex items-center justify-center px-2.5 py-1.5 text-sm rounded-md font-semibold shadow-sm ring-1 ring-red-300 text-red-600 bg-transparent hover:bg-red-50 active:translate-y-px" @click="del(s)">Excluir</button></div></td></tr>
    <tr v-if="rows.length===0"><td colspan="5" class="text-center text-muted">Sem registros</td></tr>
  </tbody></table></div>

  <div class="modal fade" tabindex="-1" ref="mRef"><div class="modal-dialog modal-lg"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">{{form.id?'Editar Aluno':'Novo Aluno'}}</h5><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg ring-1 ring-slate-300 text-slate-600 hover:bg-slate-50" data-bs-dismiss="modal"></button></div>
    <div class="modal-body">
      <div class="row g-2">
        <div class="col-md-6"><input v-model="form.name" class="form-control" placeholder="Nome"></div>
        <div class="col-md-3"><select v-model="form.modalidade" class="form-select"><option disabled value="">Modalidade</option><option value="apoio">Apoio</option><option value="srm">SRM</option></select></div>
        <div class="col-md-3"><select v-model="form.status" class="form-select"><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></div>

        <div class="col-md-6" v-if="form.modalidade==='apoio'">
          <input v-model="form._st_name" class="form-control" placeholder="Professor de Apoio" list="dl-teachers" @input="mapTeacher">
          <datalist id="dl-teachers"><option v-for="t in teachers" :key="t.id" :value="t.name + ' (#'+t.id+')'"></option></datalist>
        </div>
        <div class="col-md-6" v-if="form.modalidade==='srm'">
          <input v-model="form._room_name" class="form-control" placeholder="Sala de Recursos" list="dl-rooms" @input="mapRoom">
          <datalist id="dl-rooms"><option v-for="r in rooms" :key="r.id" :value="r.name + ' (#'+r.id+')'"></option></datalist>
        </div>

        <div class="col-md-6"><input v-model="form.responsible_name" class="form-control" placeholder="Responsável"></div>
        <div class="col-md-3"><input v-model="form.responsible_phone" class="form-control" placeholder="Telefone"></div>
        <div class="col-md-3"><input v-model="form.cid_code" class="form-control" placeholder="CID"></div>
      </div>
    </div>
    <div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 active:translate-y-px" @click="save">Salvar</button></div>
  </div></div></div>
</div>`, data(){return{rows:[],q:'',suggestions:[],form:{},mRef:null,teachers:[],rooms:[]}}, mounted(){ this.mRef=this.$el.querySelector('.modal'); this.loadLists(); this.load(); }, methods:{
  display(s){ return s.name + ' (#'+s.id+')'; },
  parseId(v){ const m=String(v).match(/#(\d+)/); return m?Number(m[1]):null; },
  async search(){ const name=this.q.replace(/\s+#\d+\)?$/,''); const r=await api.get('/students/search',{params:{q:name,limit:10}}); this.suggestions=r.data.ok?r.data.data:[]; },
  async load(){ const name=this.parseId(this.q)?'':this.q; const r=await api.get('/students',{params:{q:name,per_page:50}}); this.rows=r.data.ok?r.data.data.rows:[]; },
  async loadLists(){ const t=await api.get('/support-teachers'); this.teachers=t.data.ok?t.data.data:[]; const r=await api.get('/srm-rooms'); this.rooms=r.data.ok?r.data.data:[]; },
  openNew(){ this.form={id:null,name:'',modalidade:'',status:'ativo',_st_name:'',_room_name:'',support_teacher_id:null,srm_room_id:null,responsible_name:'',responsible_phone:'',cid_code:''}; new bootstrap.Modal(this.mRef).show(); },
  edit(s){ this.form=Object.assign({_st_name:'',_room_name:''},s); new bootstrap.Modal(this.mRef).show(); },
  mapTeacher(){ const id=this.parseId(this.form._st_name); this.form.support_teacher_id=id; },
  mapRoom(){ const id=this.parseId(this.form._room_name); this.form.srm_room_id=id; },
  async save(){ if(!this.form.name||!this.form.modalidade) return alert('Preencha os campos obrigatórios');
    const payload=Object.assign({},this.form); delete payload._st_name; delete payload._room_name;
    if(!this.form.id){ const r=await api.post('/students/create',payload); if(r.data.ok){ await this.load(); bootstrap.Modal.getInstance(this.mRef).hide(); } else alert(r.data.error||'Erro'); }
    else { const r=await api.put('/students/update',payload,{params:{id:this.form.id}}); if(r.data.ok){ await this.load(); bootstrap.Modal.getInstance(this.mRef).hide(); } else alert(r.data.error||'Erro'); }
  },
  async del(s){ if(!confirm('Excluir aluno?')) return; const r=await api.post('/students/delete',{}, {params:{id:s.id}}); if(r.data.ok) this.load(); else alert(r.data.error||'Erro'); }
}};

/* replaced by Formularios v4.4 */
const _OldRemoved_Anamnese={template:`
<div>
  <h3 class="text-xl font-semibold mb-3">Anamnese (Entrevista)</h3>
  <div class="row g-2 mb-3">
    <div class="col-md-6"><input v-model="studentInput" class="form-control" placeholder="Selecione o aluno" list="dl-students-a" @input="mapStudent"></div>
    <datalist id="dl-students-a"><option v-for="s in students" :key="s.id" :value="s.name + ' (#'+s.id+')'"></option></datalist>
    <div class="col-md-2 d-grid"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-slate-300 text-slate-700 bg-transparent hover:bg-slate-50 active:translate-y-px" @click="load">Carregar</button></div>
    <div class="col-md-2 d-grid"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 active:translate-y-px" @click="newOne">Nova</button></div>
  </div>
  <div v-if="editing" class="card mb-3"><div class="card-body space-y-2">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
      <input v-model="form.ident.nome" class="form-control" placeholder="Nome do estudante">
      <input v-model="form.ident.escola" class="form-control" placeholder="Nome da escola">
      <input v-model="form.ident.serie" class="form-control" placeholder="Série/Ano">
      <input v-model="form.ident.turno" class="form-control" placeholder="Turno">
      <input v-model="form.saude.deficiencia" class="form-control" placeholder="Deficiência informada">
      <input v-model="form.saude.medicacao" class="form-control" placeholder="Medicamentos em uso">
    </div>
    <textarea v-model="form.familia.habitos" class="form-control" placeholder="Hábitos da família"></textarea>
    <textarea v-model="form.desenvolvimento.comunicacao" class="form-control" placeholder="Comunicação atual"></textarea>
    <button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700 active:translate-y-px" @click="save">Salvar</button>
  </div></div>
  <ul class="rounded-xl border border-slate-200 divide-y divide-slate-200 bg-white">
    <li v-for="a in list" :key="a.id" class="list-group-item d-flex justify-content-between"><span>#{{a.id}}</span><small class="text-muted">{{new Date(a.created_at).toLocaleString()}}</small></li>
    <li v-if="list.length===0" class="list-group-item text-muted">Sem registros</li>
  </ul>
</div>`, data(){return{studentInput:'',student_id:null,students:[],list:[],editing:false,form:{ident:{},familia:{},saude:{},desenvolvimento:{}}}}, mounted(){ this.fetchStudents(); }, methods:{
  parseId(v){ const m=String(v).match(/#(\d+)/); return m?Number(m[1]):null; }, mapStudent(){ this.student_id=this.parseId(this.studentInput); },
  async fetchStudents(){ const r=await api.get('/students/search',{params:{q:'',limit:50}}); this.students=r.data.ok?r.data.data:[]; },
  async load(){ if(!this.student_id) return; const r=await api.get('/forms/anamnese',{params:{student_id:this.student_id}}); this.list=r.data.ok?r.data.data:[]; },
  newOne(){ this.editing=true; this.form={ident:{},familia:{},saude:{},desenvolvimento:{}} },
  async save(){ const r=await api.post('/forms/anamnese/create',{student_id:this.student_id,answers:this.form}); if(r.data.ok){ this.editing=false; this.load(); } else alert(r.data.error||'Erro'); }
}};


const Formularios={template:`
<div>
  <h3 class="text-xl font-semibold mb-3">Formulários AEE</h3>
  <ul class="nav nav-tabs mb-3" role="tablist">
    <li class="nav-item" role="presentation"><button class="nav-link" :class="{active:tab==='an'}" @click="tab='an'">Entrevista (Anamnese)</button></li>
    <li class="nav-item" role="presentation"><button class="nav-link" :class="{active:tab==='pdi'}" @click="tab='pdi'">PDI</button></li>
    <li class="nav-item" role="presentation"><button class="nav-link" :class="{active:tab==='pai'}" @click="tab='pai'">PAI</button></li>
  </ul>

  <!-- ENTREVISTA -->
  <div v-show="tab==='an'">
    <div class="row g-2 mb-2">
      <div class="col-md-6"><input v-model="an.studentInput" class="form-control" placeholder="Selecione o aluno" list="dl-students-an" @input="an.mapStudent"></div>
      <datalist id="dl-students-an"><option v-for="s in students" :key="s.id" :value="s.name + ' (#'+s.id+')'"></option></datalist>
      <div class="col-md-2 d-grid"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-slate-300 text-slate-700 bg-transparent hover:bg-slate-50 active:translate-y-px" @click="an.load">Carregar</button></div>
      <div class="col-md-2 d-grid"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 active:translate-y-px" @click="an.newOne">Nova</button></div>
      <div class="col-md-2 d-grid" v-if="an.student_id"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-blue-400 text-blue-700 bg-transparent hover:bg-blue-50 active:translate-y-px" @click="an.pdf">PDF</button></div>
    </div>
    <div v-if="an.editing" class="card mb-3"><div class="card-body space-y-2">
      <h6 class="mb-2">Identificação</h6>
      <div class="row g-2">
        <div class="col-md-6"><input v-model="an.form.ident.escola" class="form-control" placeholder="Escola"></div>
        <div class="col-md-3"><input v-model="an.form.ident.serie" class="form-control" placeholder="Série/Ano"></div>
        <div class="col-md-3"><input v-model="an.form.ident.turno" class="form-control" placeholder="Turno"></div>
      </div>
      <h6 class="mt-3">Família</h6>
      <textarea v-model="an.form.familia.composicao" class="form-control" placeholder="Composição familiar"></textarea>
      <textarea v-model="an.form.familia.habitos" class="form-control" placeholder="Hábitos do estudante"></textarea>
      <h6 class="mt-3">Gestação / Nascimento</h6>
      <div class="row g-2">
        <div class="col-md-4"><input v-model="an.form.gestacao.planejada" class="form-control" placeholder="Gravidez planejada?"></div>
        <div class="col-md-4"><input v-model="an.form.gestacao.saude_mae" class="form-control" placeholder="Saúde da mãe"></div>
        <div class="col-md-4"><input v-model="an.form.gestacao.parto" class="form-control" placeholder="Tipo de parto"></div>
      </div>
      <h6 class="mt-3">Saúde</h6>
      <div class="row g-2">
        <div class="col-md-6"><input v-model="an.form.saude.deficiencia" class="form-control" placeholder="Deficiência informada"></div>
        <div class="col-md-6"><input v-model="an.form.saude.medicacao" class="form-control" placeholder="Medicamentos"></div>
      </div>
      <h6 class="mt-3">Desenvolvimento e Comunicação</h6>
      <textarea v-model="an.form.desenvolvimento.comunicacao" class="form-control" placeholder="Como se comunica?"></textarea>
      <h6 class="mt-3">AVDs</h6>
      <input v-model="an.form.avd.alimentacao" class="form-control" placeholder="Alimentação independente?">
      <h6 class="mt-3">Escola</h6>
      <textarea v-model="an.form.escola.adaptacao" class="form-control" placeholder="Adaptação escolar"></textarea>
      <div class="mt-3"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700 active:translate-y-px" @click="an.save">Salvar</button></div>
    </div></div>
    <ul class="rounded-xl border border-slate-200 divide-y divide-slate-200 bg-white">
      <li v-for="r in an.list" :key="r.id" class="list-group-item d-flex justify-content-between"><span>#{{r.id}}</span><small class="text-muted">{{new Date(r.created_at).toLocaleString()}}</small></li>
      <li v-if="an.list.length===0" class="list-group-item text-muted">Sem registros</li>
    </ul>
  </div>

  <!-- PDI -->
  <div v-show="tab==='pdi'">
    <div class="row g-2 mb-2">
      <div class="col-md-6"><input v-model="pdi.studentInput" class="form-control" placeholder="Selecione o aluno" list="dl-students-pdi" @input="pdi.mapStudent"></div>
      <datalist id="dl-students-pdi"><option v-for="s in students" :key="s.id" :value="s.name + ' (#'+s.id+')'"></option></datalist>
      <div class="col-md-2 d-grid"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-slate-300 text-slate-700 bg-transparent hover:bg-slate-50 active:translate-y-px" @click="pdi.load">Carregar</button></div>
      <div class="col-md-2 d-grid"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 active:translate-y-px" @click="pdi.newOne">Novo</button></div>
      <div class="col-md-2 d-grid" v-if="pdi.student_id"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-blue-400 text-blue-700 bg-transparent hover:bg-blue-50 active:translate-y-px" @click="pdi.pdf">PDF</button></div>
    </div>
    <div v-if="pdi.editing" class="card mb-3"><div class="p-4">
      <div class="row g-2 mb-2">
        <div class="col-md-3"><input v-model="pdi.form.start_date" type="date" class="form-control" placeholder="Início"></div>
        <div class="col-md-3"><input v-model="pdi.form.end_date" type="date" class="form-control" placeholder="Fim"></div>
        <div class="col-md-3"><select v-model="pdi.form.status" class="form-select"><option value="ativo">Ativo</option><option value="concluido">Concluído</option></select></div>
      </div>
      <h6 class="mt-1">Dados do Estudante</h6>
      <div class="row g-2">
        <div class="col-md-6"><input v-model="pdi.form.details.dados.responsavel" class="form-control" placeholder="Responsável"></div>
        <div class="col-md-6"><input v-model="pdi.form.details.dados.deficiencia" class="form-control" placeholder="Deficiência informada"></div>
      </div>
      <h6 class="mt-3">Aspectos Psicomotores (resumo)</h6>
      <textarea v-model="pdi.form.details.psicomotor.resumo" class="form-control" placeholder="Esquema corporal, lateralidade, tônus, coordenação, equilíbrio..."></textarea>
      <h6 class="mt-3">Aspectos Pedagógicos/Cognitivos (resumo)</h6>
      <textarea v-model="pdi.form.details.cognitivo.resumo" class="form-control" placeholder="Memória, atenção, percepção, raciocínio..."></textarea>
      <h6 class="mt-3">Comunicação e Linguagem</h6>
      <textarea v-model="pdi.form.details.comunicacao.resumo" class="form-control" placeholder="Intenção comunicativa, recursos, escrita, leitura..."></textarea>
      <h6 class="mt-3">Objetivos</h6>
      <textarea v-model="pdi.form.objectives" class="form-control" placeholder="Objetivos do PDI"></textarea>
      <h6 class="mt-3">Estratégias</h6>
      <textarea v-model="pdi.form.strategies" class="form-control" placeholder="Estratégias/metodologias"></textarea>
      <div class="mt-3"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700 active:translate-y-px" @click="pdi.save">Salvar</button></div>
    </div></div>
    <ul class="rounded-xl border border-slate-200 divide-y divide-slate-200 bg-white">
      <li v-for="r in pdi.list" :key="r.id" class="list-group-item d-flex justify-content-between"><span>#{{r.id}} • {{r.start_date}} a {{r.end_date}} • {{r.status}}</span><small class="text-muted">{{new Date(r.created_at).toLocaleString()}}</small></li>
      <li v-if="pdi.list.length===0" class="list-group-item text-muted">Sem registros</li>
    </ul>
  </div>

  <!-- PAI -->
  <div v-show="tab==='pai'">
    <div class="row g-2 mb-2">
      <div class="col-md-6"><input v-model="pai.studentInput" class="form-control" placeholder="Selecione o aluno" list="dl-students-pai" @input="pai.mapStudent"></div>
      <datalist id="dl-students-pai"><option v-for="s in students" :key="s.id" :value="s.name + ' (#'+s.id+')'"></option></datalist>
      <div class="col-md-2 d-grid"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-slate-300 text-slate-700 bg-transparent hover:bg-slate-50 active:translate-y-px" @click="pai.load">Carregar</button></div>
      <div class="col-md-2 d-grid"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 active:translate-y-px" @click="pai.newOne">Novo</button></div>
      <div class="col-md-2 d-grid" v-if="pai.student_id"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-blue-400 text-blue-700 bg-transparent hover:bg-blue-50 active:translate-y-px" @click="pai.pdf">PDF</button></div>
    </div>
    <div v-if="pai.editing" class="card mb-3"><div class="p-4">
      <div class="row g-2 mb-2">
        <div class="col-md-3"><input v-model="pai.form.start_date" type="date" class="form-control" placeholder="Início"></div>
        <div class="col-md-3"><input v-model="pai.form.end_date" type="date" class="form-control" placeholder="Fim"></div>
        <div class="col-md-3"><select v-model="pai.form.status" class="form-select"><option value="ativo">Ativo</option><option value="concluido">Concluído</option></select></div>
      </div>
      <h6 class="mt-1">Identificação</h6>
      <div class="row g-2">
        <div class="col-md-6"><input v-model="pai.form.details.ident.prof_aee" class="form-control" placeholder="Professor(a) AEE"></div>
        <div class="col-md-6"><input v-model="pai.form.details.ident.outros_prof" class="form-control" placeholder="Outros profissionais envolvidos"></div>
      </div>
      <h6 class="mt-3">Histórico e Contexto</h6>
      <textarea v-model="pai.form.details.historico.resumo" class="form-control" placeholder="Histórico escolar, familiar e social"></textarea>
      <h6 class="mt-3">Avaliação Diagnóstica (resumo)</h6>
      <textarea v-model="pai.form.details.avaliacao.resumo" class="form-control" placeholder="Comunicação, cognitivas, socioemocionais, motoras"></textarea>
      <h6 class="mt-3">Objetivos SMART</h6>
      <textarea v-model="pai.form.goals" class="form-control" placeholder="Objetivos e metas SMART"></textarea>
      <h6 class="mt-3">Serviços/Recursos</h6>
      <textarea v-model="pai.form.services" class="form-control" placeholder="AEE, recursos, tecnologias, envolvimento da família"></textarea>
      <div class="mt-3"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700 active:translate-y-px" @click="pai.save">Salvar</button></div>
    </div></div>
    <ul class="rounded-xl border border-slate-200 divide-y divide-slate-200 bg-white">
      <li v-for="r in pai.list" :key="r.id" class="list-group-item d-flex justify-content-between"><span>#{{r.id}} • {{r.start_date}} a {{r.end_date}} • {{r.status}}</span><small class="text-muted">{{new Date(r.created_at).toLocaleString()}}</small></li>
      <li v-if="pai.list.length===0" class="list-group-item text-muted">Sem registros</li>
    </ul>
  </div>
</div>`, data(){return{
  tab:'an', students:[],
  an:{studentInput:'',student_id:null,list:[],editing:false,form:{ident:{},familia:{},gestacao:{},saude:{},desenvolvimento:{},avd:{},escola:{}}, 
      parseId(v){ const m=String(v).match(/#(\d+)/); return m?Number(m[1]):null; }, mapStudent(){ this.student_id=this.parseId(this.studentInput); },
      async load(){ if(!this.student_id) return; const r=await api.get('/forms/anamnese',{params:{student_id:this.student_id}}); this.list=r.data.ok?r.data.data:[]; },
      newOne(){ this.editing=true; this.form={ident:{},familia:{},gestacao:{},saude:{},desenvolvimento:{},avd:{},escola:{}}; },
      async save(){ const r=await api.post('/forms/anamnese/create',{student_id:this.student_id,answers:this.form}); if(r.data.ok){ this.editing=false; this.load(); } else alert(r.data.error||'Erro'); },
      pdf(){ const t=localStorage.getItem('token'); const url=CONFIG.API_BASE+'/forms/anamnese/pdf?student_id='+this.student_id+'&token='+encodeURIComponent(t); window.open(url,'_blank'); }
  },
  pdi:{studentInput:'',student_id:null,list:[],editing:false,form:{start_date:'',end_date:'',status:'ativo',objectives:'',strategies:'',details:{dados:{},psicomotor:{},cognitivo:{},comunicacao:{}}},
      parseId(v){ const m=String(v).match(/#(\d+)/); return m?Number(m[1]):null; }, mapStudent(){ this.student_id=this.parseId(this.studentInput); },
      async load(){ if(!this.student_id) return; const r=await api.get('/pdi',{params:{student_id:this.student_id}}); this.list=r.data.ok?r.data.data:[]; },
      newOne(){ this.editing=true; this.form={start_date:'',end_date:'',status:'ativo',objectives:'',strategies:'',details:{dados:{},psicomotor:{},cognitivo:{},comunicacao:{}}}; },
      async save(){ const p=Object.assign({},this.form,{student_id:this.student_id}); const r=await api.post('/pdi/create',p); if(r.data.ok){ this.editing=false; this.load(); } else alert(r.data.error||'Erro'); },
      pdf(){ const t=localStorage.getItem('token'); const url=CONFIG.API_BASE+'/pdi/pdf?student_id='+this.student_id+'&token='+encodeURIComponent(t); window.open(url,'_blank'); }
  },
  pai:{studentInput:'',student_id:null,list:[],editing:false,form:{start_date:'',end_date:'',status:'ativo',goals:'',services:'',details:{ident:{},historico:{},avaliacao:{}}},
      parseId(v){ const m=String(v).match(/#(\d+)/); return m?Number(m[1]):null; }, mapStudent(){ this.student_id=this.parseId(this.studentInput); },
      async load(){ if(!this.student_id) return; const r=await api.get('/pai',{params:{student_id:this.student_id}}); this.list=r.data.ok?r.data.data:[]; },
      newOne(){ this.editing=true; this.form={start_date:'',end_date:'',status:'ativo',goals:'',services:'',details:{ident:{},historico:{},avaliacao:{}}}; },
      async save(){ const p=Object.assign({},this.form,{student_id:this.student_id}); const r=await api.post('/pai/create',p); if(r.data.ok){ this.editing=false; this.load(); } else alert(r.data.error||'Erro'); },
      pdf(){ const t=localStorage.getItem('token'); const url=CONFIG.API_BASE+'/pai/pdf?student_id='+this.student_id+'&token='+encodeURIComponent(t); window.open(url,'_blank'); }
  }
}}, async mounted(){ const r=await api.get('/students/search',{params:{q:'',limit:100}}); this.students=r.data.ok?r.data.data:[]; }};


const Planos={template:`
<div>
  <div class="flex items-center justify-between mb-3"><h3 class="text-xl font-semibold">Planejamento Semanal</h3></div>
  <div class="row g-2 mb-3">
    <div class="col-md-6"><input v-model="studentInput" class="form-control" placeholder="Selecione o aluno" list="dl-students-p" @input="mapStudent"></div>
    <datalist id="dl-students-p"><option v-for="s in students" :key="s.id" :value="s.name + ' (#'+s.id+')'"></option></datalist>
    <div class="col-md-3"><input v-model="week_start" type="date" class="form-control"></div>
    <div class="col-md-3"><input v-model="objectives" class="form-control" placeholder="Objetivos"></div>
    <div class="col-md-2 d-grid"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 active:translate-y-px" @click="criar">Criar</button></div>
    <div class="col-md-2 d-grid"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-slate-300 text-slate-700 bg-transparent hover:bg-slate-50 active:translate-y-px" @click="listar">Listar</button></div>
  </div>
  <div v-for="p in planos" :key="p.id" class="card mb-3 shadow-sm">
    <div class="card-header d-flex justify-content-between"><span>Semana {{p.week_start}}</span><small class="text-muted">{{new Date(p.created_at).toLocaleString()}}</small></div>
    <div class="p-4"><div class="text-muted mb-2">{{p.objectives||'Sem objetivos'}}</div>
      <div v-if="p.items.length===0" class="text-muted">Sem itens</div>
      <div v-else class="overflow-x-auto"><table class="w-full text-sm"><thead><tr><th>Dia</th><th>Início</th><th>Fim</th><th>Descrição</th><th>Materiais</th><th>Intervenções</th></tr></thead><tbody>
        <tr v-for="it in p.items" :key="it.id"><td>{{it.day}}</td><td>{{it.time_start||'-'}}</td><td>{{it.time_end||'-'}}</td><td>{{it.description||'-'}}</td><td>{{it.materials||'-'}}</td><td>{{it.interventions||'-'}}</td></tr>
      </tbody></table></div>
    </div>
  </div>
</div>`, data(){return{studentInput:'',student_id:null,students:[],week_start:'',objectives:'',planos:[]}}, mounted(){ this.fetchStudents(); }, methods:{
  parseId(v){ const m=String(v).match(/#(\d+)/); return m?Number(m[1]):null; }, mapStudent(){ this.student_id=this.parseId(this.studentInput); },
  async fetchStudents(){ const r=await api.get('/students/search',{params:{q:'',limit:50}}); this.students=r.data.ok?r.data.data:[]; },
  async criar(){ if(!this.student_id||!this.week_start) return alert('Preencha aluno e semana'); const items=[{day:'seg',description:'Atividade 1'},{day:'ter',description:'Atividade 2'}]; const r=await api.post('/plans/create',{student_id:this.student_id,week_start:this.week_start,objectives:this.objectives,items}); if(r.data.ok) this.listar(); },
  async listar(){ if(!this.student_id) return; const r=await api.get('/plans',{params:{student_id:this.student_id}}); this.planos=r.data.ok?r.data.data:[]; }
}};

const Frequencia={template:`
<div>
  <div class="flex items-center justify-between mb-3"><h3 class="text-xl font-semibold">Frequência</h3></div>
  <div class="row g-2 mb-3">
    <div class="col-md-4"><input v-model="studentInput" class="form-control" placeholder="Selecione o aluno" list="dl-students-f" @input="mapStudent"></div>
    <datalist id="dl-students-f"><option v-for="s in students" :key="s.id" :value="s.name + ' (#'+s.id+')'"></option></datalist>
    <div class="col-md-3"><input v-model="date" type="date" class="form-control"></div>
    <div class="col-md-2"><select v-model="period" class="form-select"><option value="manha">Manhã</option><option value="tarde">Tarde</option></select></div>
    <div class="col-md-2"><select v-model.number="present" class="form-select"><option :value="1">Presente</option><option :value="0">Ausente</option></select></div>
    <div class="col-md-1 d-grid"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 active:translate-y-px" @click="marcar">Registrar</button></div>
    <div class="col-12"><input v-model="activities" class="form-control mt-2" placeholder="Atividades/Observações"></div>
  </div>
  <div class="row g-2 mb-3">
    <div class="col-md-3"><input v-model="from" type="date" class="form-control"></div>
    <div class="col-md-3"><input v-model="to" type="date" class="form-control"></div>
    <div class="col-md-2 d-grid"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-slate-300 text-slate-700 bg-transparent hover:bg-slate-50 active:translate-y-px" @click="listar">Listar</button></div>
  </div>
  <div class="overflow-x-auto"><table class="w-full text-sm align-middle"><thead><tr><th>Data</th><th>Período</th><th>Status</th><th>Atividades</th></tr></thead>
    <tbody><tr v-for="r in rows" :key="r.date+'-'+r.period"><td>{{r.date}}</td><td>{{r.period}}</td><td><span :class="['badge',r.present?'bg-success':'bg-danger']">{{r.present?'Presente':'Ausente'}}</span></td><td>{{r.activities||'-'}}</td></tr><tr v-if="rows.length===0"><td colspan="4" class="text-center text-muted">Sem registros</td></tr></tbody></table></div>
</div>`, data(){return{studentInput:'',student_id:null,students:[],date:'',period:'manha',present:1,activities:'',from:'',to:'',rows:[]}}, mounted(){ this.fetchStudents(); }, methods:{
  parseId(v){ const m=String(v).match(/#(\d+)/); return m?Number(m[1]):null; }, mapStudent(){ this.student_id=this.parseId(this.studentInput); },
  async fetchStudents(){ const r=await api.get('/students/search',{params:{q:'',limit:50}}); this.students=r.data.ok?r.data.data:[]; },
  async marcar(){ if(!this.student_id||!this.date) return alert('Preencha aluno e data'); const r=await api.post('/attendance/mark',{student_id:this.student_id,date:this.date,period:this.period,present:this.present,activities:this.activities}); if(r.data.ok) this.listar(); },
  async listar(){ if(!this.student_id) return; const r=await api.get('/attendance/list',{params:{student_id:this.student_id,from:this.from,to:this.to}}); this.rows=r.data.ok?r.data.data:[]; }
}};

const Relatorios={template:`
<div>
  <div class="flex items-center justify-between mb-3"><h3 class="text-xl font-semibold">Relatórios</h3></div>
  <div class="row g-2 mb-3">
    <div class="col-md-6"><input v-model="studentInput" class="form-control" placeholder="Selecione o aluno" list="dl-students-r" @input="mapStudent"></div>
    <datalist id="dl-students-r"><option v-for="s in students" :key="s.id" :value="s.name + ' (#'+s.id+')'"></option></datalist>
    <div class="col-md-2 d-grid"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-slate-300 text-slate-700 bg-transparent hover:bg-slate-50 active:translate-y-px" @click="gerar">Gerar</button></div>
    <div class="col-md-3 d-grid"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 active:translate-y-px" v-if="report" @click="avaliarIA">Análise com IA</button></div>
  </div>
  <div v-if="report" class="card mb-3 shadow-sm"><div class="p-4">
    <h4 class="mb-2">{{report.student.name}}</h4>
    <div class="text-muted mb-2">CID: {{report.student.cid_code||'-'}} • Modalidade: {{report.student.modalidade?report.student.modalidade.toUpperCase():''}} • Status: {{report.student.status}}</div>
    <h6 class="mt-3">Frequência (últimos registros)</h6>
    <div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr><th>Data</th><th>Período</th><th>Status</th><th>Notas</th></tr></thead><tbody>
      <tr v-for="f in report.attendance" :key="f.date+'-'+f.period"><td>{{f.date}}</td><td>{{f.period}}</td><td>{{f.present?'Presente':'Ausente'}}</td><td>{{f.activities||'-'}}</td></tr>
      <tr v-if="report.attendance.length===0"><td colspan="4" class="text-center text-muted">Sem entradas</td></tr>
    </tbody></table></div>
    <div v-if="ai" class="mt-3 p-3 rounded bg-blue-50 ring-1 ring-blue-100">
      <h6 class="mb-2">Análise da IA</h6>
      <div class="fw-semibold mb-1">Resumo</div><div class="mb-2">{{ai.resumo||'-'}}</div>
      <div class="fw-semibold mb-1">Forças</div><ul><li v-for="s in (ai.forcas||[])" :key="s">{{s}}</li></ul>
      <div class="fw-semibold mb-1">Desafios</div><ul><li v-for="s in (ai.desafios||[])" :key="s">{{s}}</li></ul>
      <div class="fw-semibold mb-1">Objetivos SMART</div><ul><li v-for="s in (ai.objetivos_smart||[])" :key="JSON.stringify(s)">{{s.meta||s}}</li></ul>
    </div>
  </div></div>
</div>`, data(){return{studentInput:'',student_id:null,students:[],report:null,ai:null}}, mounted(){ this.fetchStudents(); }, methods:{
  parseId(v){ const m=String(v).match(/#(\d+)/); return m?Number(m[1]):null; }, mapStudent(){ this.student_id=this.parseId(this.studentInput); },
  async fetchStudents(){ const r=await api.get('/students/search',{params:{q:'',limit:50}}); this.students=r.data.ok?r.data.data:[]; },
  async gerar(){ if(!this.student_id) return; const r=await api.get('/reports/student',{params:{student_id:this.student_id}}); this.report=r.data.ok?r.data.data:null; },
  async avaliarIA(){ const r=await api.get('/ai/evaluate-student',{params:{student_id:this.student_id}}); this.ai=r.data.ok?r.data.data:null; if(!r.data.ok) alert(r.data.error||'Erro'); },
  pdf(){ const t=localStorage.getItem('token'); const url=CONFIG.API_BASE+'/reports/student/pdf?student_id='+this.student_id+'&token='+encodeURIComponent(t); window.open(url,'_blank'); }
}};

const Users={template:`
<div>
  <div class="flex items-center justify-between mb-3"><h3 class="text-xl font-semibold">Usuários</h3><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 active:translate-y-px" @click="openNew">Novo</button></div>
  <div class="row g-2 mb-3"><div class="col-md-4"><input v-model="q" class="form-control" placeholder="Buscar"></div>
  <div class="col-md-3"><select v-model="role" class="form-select"><option value="">Perfil</option><option value="admin">Admin</option><option value="professor">Professor</option><option value="coordenador">Coordenador</option><option value="gestor">Gestor</option></select></div>
  <div class="col-md-3"><select v-model="status" class="form-select"><option value="">Status</option><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></div>
  <div class="col-md-2 d-grid"><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-slate-300 text-slate-700 bg-transparent hover:bg-slate-50 active:translate-y-px" @click="load">Filtrar</button></div></div>
  <div class="overflow-x-auto"><table class="w-full text-sm align-middle"><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th></th></tr></thead><tbody>
    <tr v-for="u in rows" :key="u.id"><td>{{u.name}}</td><td>{{u.email}}</td><td>{{u.role}}</td><td><span :class="['badge',u.status==='ativo'?'bg-success':'bg-secondary']">{{u.status}}</span></td>
      <td class="text-end"><div class="btn-group"><button class="inline-flex items-center justify-center px-2.5 py-1.5 text-sm rounded-md font-semibold shadow-sm ring-1 ring-blue-300 text-blue-700 bg-transparent hover:bg-blue-50 active:translate-y-px" @click="edit(u)">Editar</button><button class="inline-flex items-center justify-center px-2.5 py-1.5 text-sm rounded-md font-semibold shadow-sm ring-1 ring-red-300 text-red-600 bg-transparent hover:bg-red-50 active:translate-y-px" @click="del(u)">Excluir</button></div></td></tr>
    <tr v-if="rows.length===0"><td colspan="5" class="text-center text-muted">Sem registros</td></tr>
  </tbody></table></div>
  <div class="modal fade" tabindex="-1" ref="mRef"><div class="modal-dialog"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">{{form.id?'Editar':'Novo'}} Usuário</h5><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg ring-1 ring-slate-300 text-slate-600 hover:bg-slate-50" data-bs-dismiss="modal"></button></div>
    <div class="modal-body"><div class="row g-2"><div class="col-12"><input v-model="form.name" class="form-control" placeholder="Nome"></div>
    <div class="col-12"><input v-model="form.email" type="email" class="form-control" placeholder="E-mail"></div>
    <div class="col-12"><input v-model="form.password" type="password" class="form-control" :placeholder="form.id?'Nova senha (opcional)':'Senha'"></div>
    <div class="col-6"><select v-model="form.role" class="form-select"><option value="admin">Admin</option><option value="professor">Professor</option><option value="coordenador">Coordenador</option><option value="gestor">Gestor</option></select></div>
    <div class="col-6"><select v-model="form.status" class="form-select"><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></div></div></div>
    <div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button><button class="inline-flex items-center justify-center px-3 py-2 rounded-lg font-semibold shadow-sm ring-1 ring-blue-500 bg-blue-600 text-white hover:bg-blue-700 active:translate-y-px" @click="save">Salvar</button></div>
  </div></div></div>
</div>`, data(){return{rows:[],q:'',role:'',status:'',form:{},mRef:null}}, async created(){ const me=await api.get('/auth/me').catch(()=>null); if(!me||!me.data||!me.data.ok||me.data.data.role!=='admin'){ this.$router.push('/'); } else { this.load(); } }, mounted(){ this.mRef=this.$el.querySelector('.modal'); },
methods:{ async load(){ const r=await api.get('/users',{params:{q:this.q,role:this.role,status:this.status}}); this.rows=r.data.ok?r.data.data.rows:[]; },
openNew(){ this.form={id:null,name:'',email:'',password:'',role:'professor',status:'ativo'}; new bootstrap.Modal(this.mRef).show(); },
edit(u){ this.form={id:u.id,name:u.name,email:u.email,password:'',role:u.role,status:u.status}; new bootstrap.Modal(this.mRef).show(); },
async save(){ if(!this.form.name||!this.form.email||(!this.form.id && !this.form.password)) return alert('Preencha os campos'); if(!this.form.id){ const r=await api.post('/users/create',this.form); if(r.data.ok){ await this.load(); bootstrap.Modal.getInstance(this.mRef).hide(); } else alert(r.data.error||'Erro'); } else { const p=Object.assign({},this.form); if(!p.password) delete p.password; const r=await api.put('/users/update',p,{params:{id:this.form.id}}); if(r.data.ok){ await this.load(); bootstrap.Modal.getInstance(this.mRef).hide(); } else alert(r.data.error||'Erro'); } },
async del(u){ if(!confirm('Excluir usuário?')) return; const r=await api.post('/users/delete',{}, {params:{id:u.id}}); if(r.data.ok) this.load(); else alert(r.data.error||'Erro'); } }};

const routes=[
  {path:'/login',component:Login},
  {path:'/register',component:Register},
  {path:'/',component:Layout,beforeEnter:Guard,children:[
    {path:'',component:Dashboard},
    {path:'alunos',component:Alunos},
    {path:'formularios',component:Formularios},
    {path:'planos',component:Planos},
    {path:'frequencia',component:Frequencia},
    {path:'relatorios',component:Relatorios},
    {path:'admin/users',component:Users}
  ]},
];
const router=VueRouter.createRouter({history:VueRouter.createWebHashHistory(),routes});
const app=Vue.createApp({}); app.use(router); app.mount('#app');
