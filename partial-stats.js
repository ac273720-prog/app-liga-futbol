(()=>{
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const selectedAssociationName=()=>{
    const pub=document.querySelector('#pubAssociation');
    if(pub&&pub.value)return pub.options[pub.selectedIndex]?.textContent||'';
    return S?.aName||'';
  };
  const isPrecordillera=()=>norm(selectedAssociationName()).includes('precordillera');
  const isFenfur=()=>document.querySelector('#pubAssociation')?.value==='__fenfur__'||document.querySelector('#fenfurCupPanel')?.classList.contains('active');
  const noticeHtml='<div style="font-size:.72rem;font-weight:950;letter-spacing:.12em">⚽ PRECORDILLERA 2026</div><h2 style="margin:7px 0">Pronta reanudación del fútbol</h2><p style="margin:0 0 7px">La actividad de la Asociación Precordillera está próxima a reanudarse.</p><p style="margin:0"><b>🏆 Este sábado se juega Copa Regional FENFUR en Serie 35 y Serie 50.</b></p><p class="muted" style="margin:7px 0 0">Programación, resultados y tablas se actualizarán en Linares Score.</p>';
  function notice(){
    let box=document.querySelector('#associationStatusNotice');
    if(isFenfur()||!isPrecordillera()){box?.remove();return}
    const main=document.querySelector('#publicView .public-main');if(!main)return;
    if(!box){box=document.createElement('div');box.id='associationStatusNotice';box.className='card';box.style.cssText='margin:0 0 18px;border-left:7px solid var(--accent,#ff1f59);'}
    const tabs=main.querySelector('.tabs');if(tabs){if(box.parentElement!==main||box.nextElementSibling!==tabs)main.insertBefore(box,tabs)}else if(box.parentElement!==main)main.prepend(box);
    if(box.innerHTML!==noticeHtml)box.innerHTML=noticeHtml;
  }
  function bind(){const sel=document.querySelector('#pubAssociation');if(sel&&!sel.dataset.preNoticeBound){sel.dataset.preNoticeBound='1';sel.addEventListener('change',()=>{document.querySelector('#associationStatusNotice')?.remove();setTimeout(notice,80)})}}
  const init=()=>{bind();notice();const sel=document.querySelector('#pubAssociation');if(sel)new MutationObserver(()=>{bind();notice()}).observe(sel,{childList:true,subtree:true,attributes:true});if(!document.querySelector('script[data-fenfur]')){const s=document.createElement('script');s.src='fenfur-cup.js?v=3';s.dataset.fenfur='1';document.body.appendChild(s)}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();