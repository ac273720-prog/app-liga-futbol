(()=>{
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  let lastNotice='';
  const fix=()=>{
    ['#pubStandings','#standings'].forEach(sel=>document.querySelectorAll(sel+' td').forEach(td=>{if(td.textContent.trim()==='null')td.textContent='—'}));
    const main=document.querySelector('#publicView .public-main');
    if(!main||typeof S==='undefined')return;
    const n=norm(S.aName),pre=n.includes('precordillera'),yerbas=n.includes('yerbas buenas')||n.includes('yerbas buena');
    let box=document.querySelector('#associationStatusNotice');
    if(!pre&&!yerbas){if(box)box.remove();lastNotice='';return}
    if(!box){box=document.createElement('div');box.id='associationStatusNotice';box.className='card';box.style.cssText='margin:0 0 18px;border-left:7px solid var(--accent,#ff1f59);';const tabs=main.querySelector('.tabs');tabs?main.insertBefore(box,tabs):main.prepend(box)}
    const html=pre?'<div style="font-size:.72rem;font-weight:950;letter-spacing:.12em">🏆 PRECORDILLERA 2026</div><h2 style="margin:7px 0">Temporada próxima a comenzar</h2><p style="margin:0 0 7px">El campeonato oficial de Precordillera aún no inicia.</p><p style="margin:0"><b>Este sábado comienza la Copa Regional · Serie 35.</b></p><p class="muted" style="margin:7px 0 0">Programación, resultados y tablas se actualizarán en Linares Score.</p>':'<div style="font-size:.72rem;font-weight:950;letter-spacing:.12em">⚽ YERBAS BUENAS 2026</div><h2 style="margin:7px 0">Información en proceso de actualización</h2><p style="margin:0"><b>Aún no se han obtenido los datos oficiales de esta asociación.</b></p><p class="muted" style="margin:7px 0 0">Próximamente se actualizarán equipos, programación, resultados y tablas en Linares Score.</p>';
    const key=(pre?'pre':'yerbas')+'|'+html;
    if(lastNotice!==key||box.innerHTML!==html){box.innerHTML=html;lastNotice=key}
  };
  setInterval(fix,800);
  fix();
})();
