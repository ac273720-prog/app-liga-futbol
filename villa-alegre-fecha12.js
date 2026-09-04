(()=>{
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const assocName=()=>document.querySelector('#pubAssociation')?.selectedOptions?.[0]?.textContent||'';
  const isVillaAlegre=()=>norm(assocName()).includes('villa alegre');
  const games=[
    ['Colo Colo de Pataguas','San Lorenzo'],
    ['Unión Colo Colo de Santa Elena','San Víctor Álamos'],
    ['Esperanza','Peñasco'],
    ['Estrella del Sur','Molino'],
    ['Perales','O’Higgins']
  ];
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const card=([home,away])=>`<div class="card fixture"><div class="fixture-head"><div><h3 style="margin:0">${esc(home)} vs ${esc(away)}</h3><div class="muted">Domingo 6 de septiembre de 2026 · Fecha 12</div></div></div></div>`;
  function render(){
    const box=document.querySelector('#pubFixtures');
    if(!box||!isVillaAlegre())return;
    if(box.querySelector('[data-villa-alegre-fecha12]'))return;
    box.innerHTML=`<div data-villa-alegre-fecha12="1"><div class="card" style="margin-bottom:14px;border-left:6px solid #087840"><h3 style="margin:0 0 6px">⚽ Villa Alegre · Fecha 12</h3><div class="muted">Segunda rueda · Domingo 6 de septiembre de 2026 · Sin canchas informadas</div></div>${games.map(card).join('')}<div class="card fixture"><div class="fixture-head"><div><h3 style="margin:0">Libre: River Plate</h3><div class="muted">Fecha 12</div></div></div></div></div>`;
  }
  const schedule=()=>{setTimeout(render,80);setTimeout(render,350);setTimeout(render,900)};
  function bind(){
    const sel=document.querySelector('#pubAssociation');
    if(sel&&!sel.dataset.villaFecha12Bound){sel.dataset.villaFecha12Bound='1';sel.addEventListener('change',schedule)}
    document.querySelectorAll('[data-pub="fixtures"]').forEach(b=>{if(!b.dataset.villaFecha12Bound){b.dataset.villaFecha12Bound='1';b.addEventListener('click',schedule)}});
    const box=document.querySelector('#pubFixtures');
    if(box&&!box.dataset.villaFecha12Observed){box.dataset.villaFecha12Observed='1';new MutationObserver(()=>{if(isVillaAlegre()&&!box.querySelector('[data-villa-alegre-fecha12]'))setTimeout(render,20)}).observe(box,{childList:true})}
  }
  function init(){bind();schedule();setTimeout(bind,600);setTimeout(bind,1500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
