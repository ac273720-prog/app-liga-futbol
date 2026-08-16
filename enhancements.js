(() => {
  const waitForApp = () => typeof sb !== 'undefined' && typeof S !== 'undefined' && document.querySelector('#adminView');

  function ensurePanels(){
    const main=document.querySelector('#adminView main');
    if(!main)return;
    if(!document.querySelector('#p-club')){
      const s=document.createElement('section');s.id='p-club';s.className='panel hidden';
      s.innerHTML=`<div class="section-title"><div><h2>Mi club</h2><p class="muted">Personaliza la identidad de tu equipo.</p></div></div><div class="card" style="max-width:650px"><div id="clubLogoBox" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap"></div><form id="clubLogoForm" style="display:grid;gap:12px;margin-top:16px"><label>Logo del club<input id="clubLogoFile" type="file" accept="image/jpeg,image/png,image/webp" required></label><button class="primary">Subir logo de mi club</button></form><div id="clubLogoMsg" class="msg"></div></div>`;
      main.appendChild(s);
      s.querySelector('#clubLogoForm').onsubmit=uploadClubLogo;
    }
    if(!document.querySelector('#p-reports')){
      const s=document.createElement('section');s.id='p-reports';s.className='panel hidden';
      s.innerHTML=`<div class="section-title"><div><h2>Informes arbitrales</h2><p class="muted">Informes, turnos, observaciones y documentos enviados desde los partidos.</p></div><button id="refreshReports" class="ghost">Actualizar</button></div><div id="reportsList" style="display:grid;gap:12px;margin-top:14px"></div>`;
      main.appendChild(s);s.querySelector('#refreshReports').onclick=loadReports;
    }
  }

  function activateExtra(id){
    document.querySelectorAll('.panel').forEach(x=>x.classList.add('hidden'));
    document.querySelector('#p-'+id)?.classList.remove('hidden');
    document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.p===id));
    if(id==='club')renderClubPanel();
    if(id==='reports')loadReports();
  }

  function patchNav(){
    const nav=document.querySelector('#nav');if(!nav||!S.u)return;
    if(!nav.querySelector('[data-p="reports"]')){
      const b=document.createElement('button');b.dataset.p='reports';b.textContent='Informes arbitrales';b.onclick=()=>activateExtra('reports');nav.appendChild(b);
    }
    if(S.u.role==='team_admin'&&!nav.querySelector('[data-p="club"]')){
      const b=document.createElement('button');b.dataset.p='club';b.textContent='Mi club / Logo';b.onclick=()=>activateExtra('club');nav.appendChild(b);
    }
  }

  function renderClubPanel(){
    const box=document.querySelector('#clubLogoBox');if(!box||S.u?.role!=='team_admin')return;
    const team=S.teams.find(t=>t.id===S.u.team_id);
    if(!team){box.innerHTML='<div class="empty">No se encontró tu club.</div>';return}
    const img=team.logo_url?`<img src="${team.logo_url}" alt="Logo ${team.name}" style="width:110px;height:110px;object-fit:contain;background:#eef4ef;border:1px solid #93a995;border-radius:16px;padding:8px">`:`<div style="width:110px;height:110px;display:grid;place-items:center;border:2px dashed #93a995;border-radius:16px;font-size:2.5rem">⚽</div>`;
    box.innerHTML=`${img}<div><h3 style="margin:0 0 6px">${team.name}</h3><p class="muted" style="margin:0">JPG, PNG o WebP · máximo 5 MB.</p></div>`;
  }

  async function uploadClubLogo(e){
    e.preventDefault();
    const msg=document.querySelector('#clubLogoMsg'),file=document.querySelector('#clubLogoFile')?.files?.[0];
    try{
      if(S.u?.role!=='team_admin'||!S.u.team_id)throw Error('Solo un administrador de club puede cambiar este logo.');
      if(!file)throw Error('Selecciona una imagen.');
      if(file.size>5*1024*1024)throw Error('El logo no puede superar 5 MB.');
      if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Formato no permitido. Usa JPG, PNG o WebP.');
      msg.textContent='Subiendo logo...';msg.className='msg';
      const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');
      const path=`${S.u.team_id}/logo-${Date.now()}.${ext}`;
      const {error:upErr}=await sb.storage.from('team-logos').upload(path,file,{cacheControl:'3600'});if(upErr)throw upErr;
      const {data:urlData}=sb.storage.from('team-logos').getPublicUrl(path);const url=urlData.publicUrl;
      const {error:dbErr}=await sb.from('teams').update({logo_url:url}).eq('id',S.u.team_id);if(dbErr)throw dbErr;
      const team=S.teams.find(t=>t.id===S.u.team_id);if(team)team.logo_url=url;
      msg.textContent='Logo actualizado correctamente.';msg.className='msg ok';renderClubPanel();e.target.reset();
    }catch(err){msg.textContent=err?.message||'No se pudo subir el logo.';msg.className='msg error'}
  }

  async function loadReports(){
    const host=document.querySelector('#reportsList');if(!host)return;
    host.innerHTML='<div class="empty">Cargando informes...</div>';
    try{
      await loadFixtures();
      const ids=S.matches.map(m=>m.id);if(!ids.length){host.innerHTML='<div class="empty">Aún no hay partidos con informes en esta asociación.</div>';return}
      const {data,error}=await sb.from('arbitral_reports').select('id,match_id,report_text,document_url,created_at').in('match_id',ids).order('created_at',{ascending:false});if(error)throw error;
      if(!data?.length){host.innerHTML='<div class="empty">Aún no se han enviado informes arbitrales.</div>';return}
      host.innerHTML='';
      for(const r of data){
        const m=S.matches.find(x=>x.id===r.match_id),card=document.createElement('div');card.className='card';
        const title=m?`${m.home?.name||'Local'} vs ${m.away?.name||'Visita'}`:'Partido';
        const meta=[m?.series?.name,m?.scheduled_at?new Date(m.scheduled_at).toLocaleDateString('es-CL'):null,new Date(r.created_at).toLocaleString('es-CL')].filter(Boolean).join(' · ');
        let doc='';
        if(r.document_url){const {data:signed}=await sb.storage.from('match-files').createSignedUrl(r.document_url,300);if(signed?.signedUrl)doc=`<a class="primary" style="display:inline-block;text-decoration:none;padding:8px 12px;border-radius:10px;margin-top:10px" href="${signed.signedUrl}" target="_blank" rel="noopener">Ver foto / PDF</a>`}
        card.innerHTML=`<h3 style="margin:0">${title}</h3><p class="muted">${meta}</p><pre style="white-space:pre-wrap;font:inherit;background:#c7d6ca;padding:12px;border-radius:10px">${r.report_text||'Sin observaciones escritas.'}</pre>${doc}`;
        host.appendChild(card);
      }
    }catch(err){host.innerHTML=`<div class="msg error">${err?.message||'No se pudieron cargar los informes.'}</div>`}
  }

  function installAdminGate(){
    const adminBtn=document.querySelector('#adminLoginBtn');
    const ownerBtn=document.querySelector('#ownerLoginBtn');
    const loginForm=document.querySelector('#loginForm');
    const backBtn=document.querySelector('#backPublic');

    if(adminBtn)adminBtn.onclick=()=>document.querySelector('#loginModal')?.classList.remove('hidden');
    if(ownerBtn)ownerBtn.onclick=()=>document.querySelector('#loginModal')?.classList.remove('hidden');
    if(loginForm)loginForm.addEventListener('submit',()=>sessionStorage.setItem('adminGate','1'),true);
    if(backBtn)backBtn.onclick=async()=>{
      const aid=S.a;
      if(aid)localStorage.setItem('publicAssociation',aid);
      sessionStorage.removeItem('adminGate');
      await sb.auth.signOut();
      S.u=null;
      await startPublic();
    };

    setTimeout(async()=>{
      const {data:{session}}=await sb.auth.getSession();
      const gate=sessionStorage.getItem('adminGate')==='1';
      if(session&&!gate){
        await sb.auth.signOut();
        S.u=null;
        await startPublic();
      }
    },500);
  }

  function init(){
    if(!waitForApp())return setTimeout(init,100);
    ensurePanels();
    installAdminGate();
    const nav=document.querySelector('#nav');
    new MutationObserver(()=>{ensurePanels();patchNav()}).observe(nav,{childList:true});
    setInterval(()=>{if(!document.querySelector('#adminView').classList.contains('hidden'))patchNav()},800);
  }
  init();
})();