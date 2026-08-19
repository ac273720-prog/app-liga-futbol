(()=>{
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  let lastNotice='';
  const internal=n=>{n=norm(n);return n.includes('serie primera')||n.includes('primera adulta')||n.includes('segunda serie')||n.includes('leyendas')||n.includes('infantil')||n.includes('juvenil')||n.includes('serie 50')||n.includes('senior 50')};
  const seriesStatus=(pos,cn)=>{const c=norm(cn);if(c.includes('liga a'))return pos===1?'🏆 Copa Regional':(pos===2||pos===3?'⚔️ Liguilla':'—');if(c.includes('liga b'))return (pos===1||pos===2)?'⚔️ Liguilla':'—';return null};
  const generalStatus=(pos,total,cn)=>{const c=norm(cn);let out='';if(c.includes('liga a')){if(pos===Math.max(1,total-2))out='⚠️ Repechaje permanencia';if(pos>=Math.max(1,total-1))out='⬇️ Descenso a Liga B'}else if(c.includes('liga b')){if(pos===1||pos===2)out='⬆️ Ascenso a Liga A';else if(pos===3)out='⚠️ Repechaje ascenso'}const champ=pos===1?'🏅 Campeón general':'';return [champ,out].filter(Boolean).join(' · ')||'—'};
  function fixAfacom(){
    if(typeof S==='undefined'||!norm(S.aName).includes('afacom'))return;
    [['#pubStandings','#pubSeries','#pubCompetition','#pubQualificationSummary'],['#standings','#series','#competition','#adminQualificationSummary']].forEach(([bodySel,seriesSel,compSel,sumSel])=>{
      const body=document.querySelector(bodySel),sid=document.querySelector(seriesSel)?.value,cid=document.querySelector(compSel)?.value;
      if(!body||!sid||!cid)return;
      const sn=S.series?.find(x=>x.id===sid)?.name||'',cn=S.comps?.find(x=>x.id===cid)?.name||'';
      if(internal(sn))return;
      const rows=[...body.querySelectorAll('tr')];
      const items=[];
      rows.forEach(r=>{const cells=r.querySelectorAll('td'),pos=Number(cells[0]?.textContent);if(!Number.isFinite(pos))return;const status=seriesStatus(pos,cn);if(status===null)return;let td=r.querySelector('td[data-qualification]');if(!td){td=document.createElement('td');td.dataset.qualification='1';r.appendChild(td)}if(td.textContent.trim()!==status)td.innerHTML=`<b>${status}</b>`;if(status!=='—'){const team=(cells[1]?.childNodes?.[0]?.textContent||cells[1]?.textContent||'').trim();if(team)items.push(`<div class="classification-item"><b>${team}</b><span>${status}</span></div>`)}});
      const box=document.querySelector(sumSel);if(box&&seriesStatus(1,cn)!==null){const note=norm(cn).includes('liga a')?'AFACOM Liga A: 1° a Copa Regional; 2° y 3° a liguilla.':'AFACOM Liga B: 1° y 2° a liguilla.';const html=`<h3>Clasificación actual</h3><p class="muted">${note}</p><div class="classification-items">${items.join('')||'<div class="empty">Aún no hay posiciones para clasificar.</div>'}</div>`;if(box.innerHTML!==html)box.innerHTML=html}
    });
    [['#pubGeneral','#pubCompetition'],['#adminGeneral','#competition']].forEach(([bodySel,compSel])=>{const body=document.querySelector(bodySel),cid=document.querySelector(compSel)?.value;if(!body||!cid)return;const cn=S.comps?.find(x=>x.id===cid)?.name||'',rows=[...body.querySelectorAll('tr')];if(!norm(cn).includes('liga a')&&!norm(cn).includes('liga b'))return;rows.forEach(r=>{const cells=r.querySelectorAll('td'),pos=Number(cells[0]?.textContent);if(!Number.isFinite(pos))return;const status=generalStatus(pos,rows.length,cn);let td=r.querySelector('td[data-qualification]');if(!td){td=document.createElement('td');td.dataset.qualification='1';r.appendChild(td)}if(td.textContent.trim()!==status)td.innerHTML=`<b>${status}</b>`})});
  }
  function fixPrecordilleraClassification(){
    if(typeof S==='undefined'||!norm(S.aName).includes('precordillera'))return;
    [['#pubStandings','#pubSeries','#pubQualificationSummary'],['#standings','#series','#adminQualificationSummary']].forEach(([bodySel,seriesSel,sumSel])=>{
      const body=document.querySelector(bodySel),sid=document.querySelector(seriesSel)?.value;
      if(!body||!sid)return;
      const sn=S.series?.find(x=>x.id===sid)?.name||'',n=norm(sn);
      const regional=n.includes('serie 50')||n.includes('senior 50')||n.includes('mujer');
      if(!regional)return;
      const rows=[...body.querySelectorAll('tr')];
      const items=[];
      rows.forEach(r=>{const cells=r.querySelectorAll('td'),pos=Number(cells[0]?.textContent);if(!Number.isFinite(pos))return;let td=r.querySelector('td[data-qualification]');if(!td){td=document.createElement('td');td.dataset.qualification='1';r.appendChild(td)}const status=pos===1?'🏆 Copa Regional':'—';if(td.textContent.trim()!==status)td.innerHTML=`<b>${status}</b>`;if(pos===1){const team=(cells[1]?.childNodes?.[0]?.textContent||cells[1]?.textContent||'').trim();if(team)items.push(`<div class="classification-item"><b>${team}</b><span>${status}</span></div>`)}});
      const box=document.querySelector(sumSel);if(box){const html=`<h3>Clasificación actual</h3><p class="muted">El campeón de ${sn} clasifica a Copa Regional.</p><div class="classification-items">${items.join('')||'<div class="empty">Aún no hay posiciones para clasificar.</div>'}</div>`;if(box.innerHTML!==html)box.innerHTML=html}
    });
  }
  const fix=()=>{
    ['#pubStandings','#standings'].forEach(sel=>document.querySelectorAll(sel+' td').forEach(td=>{if(td.textContent.trim()==='null')td.textContent='—'}));
    fixAfacom();
    fixPrecordilleraClassification();
    const tables=document.querySelector('#pub-tables');
    if(!tables||typeof S==='undefined')return;
    const pre=norm(S.aName).includes('precordillera');
    let box=document.querySelector('#associationStatusNotice');
    if(!pre){if(box)box.remove();lastNotice='';return}
    if(!box){box=document.createElement('div');box.id='associationStatusNotice';box.className='card';box.style.cssText='margin:0 0 18px;border-left:7px solid var(--accent,#ff1f59);';tables.prepend(box)}
    if(box.parentElement!==tables)tables.prepend(box);
    const html='<div style="font-size:.72rem;font-weight:950;letter-spacing:.12em">⚽ PRECORDILLERA 2026</div><h2 style="margin:7px 0">Pronta reanudación del fútbol</h2><p style="margin:0 0 7px">La actividad de la Asociación Precordillera está próxima a reanudarse.</p><p style="margin:0"><b>🏆 Este sábado comienza la Copa Regional en Serie 35 y Serie 50.</b></p><p class="muted" style="margin:7px 0 0">Programación, resultados y tablas se actualizarán en Linares Score.</p>';
    const key='pre|'+html;
    if(lastNotice!==key||box.innerHTML!==html){box.innerHTML=html;lastNotice=key}
  };
  setInterval(fix,650);
  fix();
})();