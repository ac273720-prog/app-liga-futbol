(()=>{
const $=s=>document.querySelector(s);
function venueName(v){return String(v?.name||v?.venue_name||v?.label||'').trim()}
function ensureDatalist(input){
  let list=$('#venueOptions');
  if(!list){list=document.createElement('datalist');list.id='venueOptions';document.body.appendChild(list)}
  const names=[...new Set((window.S?.venues||[]).map(venueName).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  list.innerHTML=names.map(n=>`<option value="${n.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}"></option>`).join('');
  input.setAttribute('list','venueOptions');
}
function fix(){
  const form=$('#fixtureForm'); if(!form)return;
  let input=$('#fVenue'); if(!input)return;
  if(input.tagName==='SELECT'){
    const oldValue=input.options[input.selectedIndex]?.textContent?.trim()||'';
    const i=document.createElement('input');
    i.id='fVenue';i.type='text';i.autocomplete='off';i.placeholder='Escribe o elige una cancha';i.value=oldValue&&oldValue!=='Seleccionar'&&oldValue!=='—'?oldValue:'';
    i.dataset.manualVenue='1';input.replaceWith(i);input=i;
  }
  input.type='text';input.autocomplete='off';input.placeholder='Escribe o elige una cancha';input.dataset.manualVenue='1';
  ensureDatalist(input);
  const label=input.closest('label');if(label&&label.firstChild)label.firstChild.textContent='Cancha / recinto (elige o escribe)';
  /* Evita que al elegir local/visita el código antiguo reemplace el texto por un UUID de cancha. */
  const home=$('#fHome'),away=$('#fAway');
  if(home){home.onchange=null;if(!home.dataset.venueSafe){home.dataset.venueSafe='1';home.addEventListener('change',()=>{setTimeout(()=>{if($('#fVenue')?.value&&/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test($('#fVenue').value))$('#fVenue').value=''},0)})}}
  if(away){away.onchange=null}
}
function init(){fix();new MutationObserver(()=>fix()).observe(document.body,{childList:true,subtree:true});setInterval(fix,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,300));else setTimeout(init,300);
})();