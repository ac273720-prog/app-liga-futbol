(()=>{
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const selectedAssociationName=()=>{
    const pub=document.querySelector('#pubAssociation');
    if(pub&&pub.value)return pub.options[pub.selectedIndex]?.textContent||'';
    const own=document.querySelector('#ownerAssociation');
    if(own&&own.value)return own.options[own.selectedIndex]?.textContent||'';
    return '';
  };
  const isSelectedPrecordillera=()=>norm(selectedAssociationName()).includes('precordillera');
  const noticeHtml='<div style="font-size:.72rem;font-weight:950;letter-spacing:.12em">⚽ PRECORDILLERA 2026</div><h2 style="margin:7px 0">Pronta reanudación del fútbol</h2><p style="margin:0 0 7px">La actividad de la Asociación Precordillera está próxima a reanudarse.</p><p style="margin:0"><b>🏆 Este sábado comienza la Copa Regional en Serie 35 y Serie 50.</b></p><p class="muted" style="margin:7px 0 0">Programación, resultados y tablas se actualizarán en Linares Score.</p>';
  function notice(){
    const old=document.querySelector('#associationStatusNotice');
    if(!isSelectedPrecordillera()){if(old)old.remove();return}
    const tables=document.querySelector('#pub-tables');
    if(!tables)return;
    let box=old;
    if(!box){box=document.createElement('div');box.id='associationStatusNotice';box.className='card';box.style.cssText='margin:0 0 18px;border-left:7px solid var(--accent,#ff1f59);'}
    if(box.parentElement!==tables)tables.prepend(box);
    if(box.innerHTML!==noticeHtml)box.innerHTML=noticeHtml;
  }
  ['pubAssociation','ownerAssociation'].forEach(id=>document.querySelector('#'+id)?.addEventListener('change',()=>{document.querySelector('#associationStatusNotice')?.remove();setTimeout(notice,150)}));
  const init=()=>{notice();setInterval(notice,700)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();