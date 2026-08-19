(()=>{
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function selectedAssociationName(){
  return document.querySelector('#pubAssociation option:checked')?.textContent||S?.aName||'';
}
function update(){
  const main=document.querySelector('#publicView .public-main');
  if(!main||typeof S==='undefined')return;
  let box=document.querySelector('#associationStatusNotice');
  const name=norm(selectedAssociationName());
  const isPre=name.includes('precordillera');
  const isYerbas=name.includes('yerbas buenas')||name.includes('yerbas buena');
  if(!isPre&&!isYerbas){if(box)box.remove();return;}
  if(!box){
    box=document.createElement('div');
    box.id='associationStatusNotice';
    box.className='card';
    box.style.cssText='margin:0 0 18px;border-left:7px solid var(--accent,#ff1f59);';
    const tabs=main.querySelector('.tabs');
    if(tabs)main.insertBefore(box,tabs);else main.prepend(box);
  }
  if(isPre){
    box.innerHTML='<div style="font-size:.72rem;font-weight:950;letter-spacing:.12em">⚽ PRECORDILLERA 2026</div><h2 style="margin:7px 0">Pronta reanudación del fútbol</h2><p style="margin:0 0 7px">La actividad de la Asociación Precordillera está próxima a reanudarse.</p><p style="margin:0"><b>🏆 Este sábado comienza la Copa Regional en Serie 35 y Serie 50.</b></p><p class="muted" style="margin:7px 0 0">Programación, resultados y tablas se actualizarán en Linares Score.</p>';
  }else{
    box.innerHTML='<div style="font-size:.72rem;font-weight:950;letter-spacing:.12em">⚽ YERBAS BUENAS 2026</div><h2 style="margin:7px 0">Información en proceso de actualización</h2><p style="margin:0"><b>Aún no se han obtenido los datos oficiales de esta asociación.</b></p><p class="muted" style="margin:7px 0 0">Próximamente se actualizarán equipos, programación, resultados y tablas en Linares Score.</p>';
  }
}
function init(){
  if(typeof S==='undefined'||!document.querySelector('#publicView'))return setTimeout(init,100);
  update();
  document.querySelector('#pubAssociation')?.addEventListener('change',()=>setTimeout(update,100));
  setInterval(update,800);
}
init();
})();