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
      const {error:dbErr}=await sb.rpc('set_my_team_logo',{p_logo_url:url});if(dbErr)throw dbErr;
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
      const aid=S.a;if(aid)localStorage.setItem('publicAssociation',aid);
      sessionStorage.removeItem('adminGate');await sb.auth.signOut();S.u=null;await startPublic();
    };
    setTimeout(async()=>{
      const {data:{session}}=await sb.auth.getSession();const gate=sessionStorage.getItem('adminGate')==='1';
      if(session&&!gate){await sb.auth.signOut();S.u=null;await startPublic()}
    },500);
  }

  function installManualVenue(){
    const form=document.querySelector('#fixtureForm');const old=document.querySelector('#fVenue');
    if(!form||!old||old.dataset.manualVenue==='1')return;
    const label=old.closest('label');if(!label)return;
    const input=document.createElement('input');input.id='fVenue';input.type='text';input.placeholder='Ej: Estadio Municipal, Cancha El Bosque, Sin cancha fija';input.autocomplete='off';input.dataset.manualVenue='1';old.replaceWith(input);label.firstChild.textContent='Cancha / recinto';
    form.onsubmit=async e=>{
      e.preventDefault();
      if(!canSchedule())return flash('#fixtureMsg','No tienes permiso');
      if(!document.querySelector('#fCompetition').value)return flash('#fixtureMsg','Primero debes tener una liga creada para esta asociación');
      if(document.querySelector('#fHome').value===document.querySelector('#fAway').value)return flash('#fixtureMsg','Local y visita deben ser distintos');
      const {data,error}=await sb.rpc('create_club_fixture_named_venue',{
        p_competition_id:document.querySelector('#fCompetition').value,p_home_team_id:document.querySelector('#fHome').value,p_away_team_id:document.querySelector('#fAway').value,p_venue_name:document.querySelector('#fVenue').value.trim()||null,p_fixture_date:document.querySelector('#fDate').value,p_round_number:document.querySelector('#fRound').value?Number(document.querySelector('#fRound').value):null
      });
      flash('#fixtureMsg',error?.message||(data?'Fecha programada correctamente':'Fecha programada'),!error);
      if(!error){form.reset();syncFixtureClubs();installManualVenue();await loadFixtures()}
    };
  }

  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const isAfacon=()=>norm(S.aName).includes('afacon');

  function seriesQualificationStatus(pos){
    if(pos===1)return '🏆 Copa Regional';
    if(pos>=2&&pos<=5)return '⚔️ Liguilla';
    return '—';
  }

  function afaconGeneralStatus(pos,total,competitionName){
    const c=norm(competitionName);
    if(c.includes('liga a')){
      if(pos===1)return '🏆 Copa Regional';
      if(pos===2||pos===3)return '⚔️ Liguilla Copa Regional';
      if(pos===Math.max(1,total-2))return '⚠️ Repechaje permanencia';
      if(pos>=Math.max(1,total-1))return '⬇️ Descenso a Liga B';
      return '—';
    }
    if(c.includes('liga b')){
      if(pos===1||pos===2)return '⬆️ Ascenso a Liga A · ⚔️ Liguilla Copa Regional';
      if(pos===3)return '⚠️ Repechaje ascenso';
      return '—';
    }
    return '—';
  }

  function removeQualification(body){
    const table=body?.closest('table');
    table?.querySelectorAll('[data-qualification]').forEach(x=>x.remove());
    table?.querySelectorAll('tbody tr').forEach(r=>r.querySelectorAll('[data-qualification]').forEach(x=>x.remove()));
  }

  function decorateSeriesTable(body){
    if(!body)return;
    if(isAfacon()){
      removeQualification(body);
      const note=body.closest('.table')?.parentElement?.querySelector('[data-series-qualification-note]');
      if(note)note.remove();
      return;
    }
    const table=body.closest('table'),head=table?.querySelector('thead tr');if(!head)return;
    if(!head.querySelector('[data-qualification]')){
      const th=document.createElement('th');th.dataset.qualification='1';th.textContent='Situación';head.appendChild(th);
    }
    const rows=[...body.querySelectorAll('tr')];
    rows.forEach(r=>{
      const cells=r.querySelectorAll('td');if(!cells.length)return;
      const pos=Number(cells[0].textContent);if(!Number.isFinite(pos))return;
      let td=r.querySelector('[data-qualification]');if(!td){td=document.createElement('td');td.dataset.qualification='1';r.appendChild(td)}
      td.innerHTML=`<b>${seriesQualificationStatus(pos)}</b>`;
    });
    const wrap=table.closest('.table')?.parentElement;
    if(wrap&&!wrap.querySelector('[data-series-qualification-note]')){
      const p=document.createElement('p');p.dataset.seriesQualificationNote='1';p.className='muted';p.textContent='Clasificación provisoria de esta serie: el 1° va a Copa Regional y del 2° al 5° están en zona de liguilla.';
      table.closest('.table').after(p);
    }
  }

  function decoratePublicGeneral(){
    const body=document.querySelector('#pubGeneral');if(!body)return;
    const table=body.closest('table'),head=table?.querySelector('thead tr');if(!head)return;
    const card=table.closest('.card');
    if(!isAfacon()){
      removeQualification(body);
      card?.querySelector('#qualificationNote')?.remove();
      return;
    }
    if(!head.querySelector('[data-qualification]')){const th=document.createElement('th');th.dataset.qualification='1';th.textContent='Situación';head.appendChild(th)}
    const rows=[...body.querySelectorAll('tr')];const comp=S.comps.find(x=>x.id===document.querySelector('#pubCompetition')?.value);
    rows.forEach(r=>{
      const cells=r.querySelectorAll('td');if(!cells.length)return;
      const pos=Number(cells[0].textContent);if(!Number.isFinite(pos))return;
      let td=r.querySelector('[data-qualification]');if(!td){td=document.createElement('td');td.dataset.qualification='1';r.appendChild(td)}
      td.innerHTML=`<b>${afaconGeneralStatus(pos,rows.length,comp?.name)}</b>`;
    });
    if(card){
      let note=card.querySelector('#qualificationNote');if(!note){note=document.createElement('p');note.id='qualificationNote';note.className='muted';const h=card.querySelector('h3');h?.after(note)}
      const c=norm(comp?.name);
      note.textContent=c.includes('liga a')?'Afacon Liga A: 1° Copa Regional; 2° y 3° a liguilla regional; los 2 últimos descienden y el antepenúltimo juega repechaje con el 3° de Liga B.':c.includes('liga b')?'Afacon Liga B: 1° y 2° ascienden y juegan liguilla regional; el 3° juega repechaje por el ascenso contra el antepenúltimo de Liga A.':'';
    }
  }

  function ensureAdminGeneral(){
    const panel=document.querySelector('#p-tables');if(!panel)return;
    let card=document.querySelector('#adminGeneralCard');
    if(!isAfacon()){
      if(card)card.remove();
      return;
    }
    if(card)return;
    card=document.createElement('div');card.id='adminGeneralCard';card.className='card';card.style.marginTop='16px';
    card.innerHTML='<h3>Tabla general acumulada · clasificación</h3><p id="adminQualificationNote" class="muted"></p><div class="table"><table><thead><tr><th>POS</th><th>Equipo</th><th>PTS</th><th>Situación</th></tr></thead><tbody id="adminGeneral"></tbody></table></div>';
    panel.appendChild(card);
  }

  let generalTimer;
  async function loadAdminGeneral(){
    ensureAdminGeneral();
    if(!isAfacon())return;
    const body=document.querySelector('#adminGeneral');if(!body||!S.u)return;
    const cid=document.querySelector('#competition')?.value;if(!cid){body.innerHTML='<tr><td colspan="4">Sin datos disponibles.</td></tr>';return}
    const comp=S.comps.find(x=>x.id===cid);const {data,error}=await sb.rpc('get_general_standings',{p_competition_id:cid});
    if(error){body.innerHTML=`<tr><td colspan="4">${error.message}</td></tr>`;return}
    const list=data||[];body.innerHTML=list.map(x=>`<tr><td>${x.pos}</td><td>${x.team_name}</td><td><b>${x.pts}</b></td><td><b>${afaconGeneralStatus(Number(x.pos),list.length,comp?.name)}</b></td></tr>`).join('')||'<tr><td colspan="4">Sin datos disponibles.</td></tr>';
    const note=document.querySelector('#adminQualificationNote');if(note){const c=norm(comp?.name);note.textContent=c.includes('liga a')?'Afacon Liga A: 1° Copa Regional; 2° y 3° a liguilla regional; los 2 últimos descienden y el antepenúltimo juega repechaje con el 3° de Liga B.':c.includes('liga b')?'Afacon Liga B: 1° y 2° ascienden y juegan liguilla regional; el 3° juega repechaje por el ascenso contra el antepenúltimo de Liga A.':''}
  }

  function scheduleAdminGeneral(){clearTimeout(generalTimer);generalTimer=setTimeout(loadAdminGeneral,120)}

  function installQualificationViews(){
    decorateSeriesTable(document.querySelector('#pubStandings'));
    decorateSeriesTable(document.querySelector('#standings'));
    decoratePublicGeneral();
    ensureAdminGeneral();scheduleAdminGeneral();

    const pubSeriesBody=document.querySelector('#pubStandings');
    if(pubSeriesBody&&!pubSeriesBody.dataset.qualWatch){pubSeriesBody.dataset.qualWatch='1';new MutationObserver(()=>decorateSeriesTable(pubSeriesBody)).observe(pubSeriesBody,{childList:true})}
    const adminSeriesBody=document.querySelector('#standings');
    if(adminSeriesBody&&!adminSeriesBody.dataset.qualWatch){adminSeriesBody.dataset.qualWatch='1';new MutationObserver(()=>{decorateSeriesTable(adminSeriesBody);scheduleAdminGeneral()}).observe(adminSeriesBody,{childList:true})}
    const pubGen=document.querySelector('#pubGeneral');
    if(pubGen&&!pubGen.dataset.qualWatch){pubGen.dataset.qualWatch='1';new MutationObserver(()=>decoratePublicGeneral()).observe(pubGen,{childList:true})}

    const pc=document.querySelector('#pubCompetition');if(pc&&!pc.dataset.qualWatch){pc.dataset.qualWatch='1';pc.addEventListener('change',()=>setTimeout(()=>{decorateSeriesTable(pubSeriesBody);decoratePublicGeneral()},150))}
    const ps=document.querySelector('#pubSeries');if(ps&&!ps.dataset.qualWatch){ps.dataset.qualWatch='1';ps.addEventListener('change',()=>setTimeout(()=>decorateSeriesTable(pubSeriesBody),150))}
    const ac=document.querySelector('#competition');if(ac&&!ac.dataset.qualWatch){ac.dataset.qualWatch='1';ac.addEventListener('change',()=>{setTimeout(()=>decorateSeriesTable(adminSeriesBody),120);scheduleAdminGeneral()})}
    const as=document.querySelector('#series');if(as&&!as.dataset.qualWatch){as.dataset.qualWatch='1';as.addEventListener('change',()=>setTimeout(()=>decorateSeriesTable(adminSeriesBody),120))}
  }

  function init(){
    if(!waitForApp())return setTimeout(init,100);
    ensurePanels();installAdminGate();installManualVenue();installQualificationViews();
    const nav=document.querySelector('#nav');
    new MutationObserver(()=>{ensurePanels();patchNav();installManualVenue();installQualificationViews()}).observe(nav,{childList:true});
    setInterval(()=>{
      decorateSeriesTable(document.querySelector('#pubStandings'));
      decoratePublicGeneral();
      if(!document.querySelector('#adminView').classList.contains('hidden')){patchNav();installManualVenue();installQualificationViews()}
    },900);
  }
  init();
})();