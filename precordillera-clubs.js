(()=>{
const $=s=>document.querySelector(s);
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let lastSignature='';

function isPrecordillera(){
  const selected=$('#pubAssociation');
  const label=selected?.options?.[selected.selectedIndex]?.textContent||'';
  return norm(label).includes('precordillera')||(typeof S!=='undefined'&&norm(S?.aName).includes('precordillera'));
}

function ensureStyles(){
  if($('#precordilleraClubStyles'))return;
  const style=document.createElement('style');
  style.id='precordilleraClubStyles';
  style.textContent=`
  #precordilleraClubs{margin:0 0 18px;overflow:hidden;border-top:5px solid #d2ad3a}
  .precordillera-head{display:flex;align-items:center;gap:16px;padding-bottom:16px;border-bottom:1px solid #9caf9f}
  .precordillera-head img{width:86px;height:86px;object-fit:contain;flex:none;filter:drop-shadow(0 6px 10px rgba(0,0,0,.2))}
  .precordillera-head h2{margin:0 0 4px}.precordillera-head p{margin:0}
  .precordillera-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-top:16px}
  .precordillera-club{min-width:0;padding:13px 9px;text-align:center;border:1px solid #9caf9f;border-radius:14px;background:linear-gradient(180deg,#e1e9e3,#c7d7ca)}
  .precordillera-club img{display:block;width:92px;height:92px;object-fit:contain;margin:0 auto 9px;filter:drop-shadow(0 5px 7px rgba(0,0,0,.18))}
  .precordillera-club b{display:block;font-size:.82rem;line-height:1.2;color:#07150e}
  @media(max-width:900px){.precordillera-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
  @media(max-width:560px){.precordillera-head{align-items:flex-start}.precordillera-head img{width:70px;height:70px}.precordillera-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.precordillera-club{padding:10px 6px}.precordillera-club img{width:76px;height:76px}}
  `;
  document.head.appendChild(style);
}

function render(){
  let panel=$('#precordilleraClubs');
  if(!isPrecordillera()){
    panel?.remove();
    lastSignature='';
    return;
  }
  const teams=typeof S!=='undefined'&&Array.isArray(S?.teams)?S.teams:[];
  if(!teams.length)return;
  ensureStyles();
  if(!panel){
    panel=document.createElement('section');
    panel.id='precordilleraClubs';
    panel.className='card';
    const main=$('#publicView .public-main');
    const tabs=main?.querySelector('.tabs');
    if(tabs)main.insertBefore(panel,tabs);else main?.prepend(panel);
  }
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clubs=[...teams].sort((a,b)=>a.name.localeCompare(b.name,'es'));
  const signature=clubs.map(team=>`${team.id}:${team.name}:${team.logo_url||''}`).join('|');
  if(signature===lastSignature&&panel.innerHTML)return;
  lastSignature=signature;
  panel.innerHTML=`<div class="precordillera-head"><img src="/club-logos/precordillera.webp" alt="Escudo Asociación Precordillera"><div><h2>Asociación Precordillera</h2><p class="muted">13 clubes confirmados · programación pendiente de reunión dirigencial</p></div></div><div class="precordillera-grid">${clubs.map(team=>`<article class="precordillera-club"><img src="${esc(team.logo_url||'/club-logos/precordillera.webp')}" alt="Escudo ${esc(team.name)}" loading="lazy"><b>${esc(team.name)}</b></article>`).join('')}</div>`;
}

function init(){
  if(typeof S==='undefined'||!$('#publicView'))return setTimeout(init,100);
  render();
  const select=$('#pubAssociation');
  select?.addEventListener('change',()=>setTimeout(render,350));
  new MutationObserver(()=>setTimeout(render,80)).observe($('#publicView'),{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
