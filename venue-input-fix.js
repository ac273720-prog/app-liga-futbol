(()=>{
const q=s=>document.querySelector(s);
function venueName(v){return String(v?.name||v?.venue_name||v?.label||'').trim()}
function escAttr(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
function ensureDatalist(input){
  let list=q('#venueOptions');
  if(!list){list=document.createElement('datalist');list.id='venueOptions';document.body.appendChild(list)}
  const names=[...new Set((S?.venues||[]).map(venueName).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  list.innerHTML=names.map(n=>`<option value="${escAttr(n)}"></option>`).join('');
  input.setAttribute('list','venueOptions');
}
function makeTextVenue(){
  const form=q('#fixtureForm'); if(!form)return null;
  let input=q('#fVenue'); if(!input)return null;
  if(input.tagName==='SELECT'){
    const selected=input.options[input.selectedIndex];
    const oldText=selected?.value ? (selected.textContent||'').trim() : '';
    const i=document.createElement('input');
    i.id='fVenue';
    i.type='text';
    i.autocomplete='off';
    i.placeholder='Escribe o elige una cancha';
    i.value=oldText;
    i.dataset.manualVenue='1';
    input.replaceWith(i);
    input=i;
  }
  input.type='text';
  input.removeAttribute('readonly');
  input.removeAttribute('disabled');
  input.autocomplete='off';
  input.placeholder='Escribe o elige una cancha';
  input.dataset.manualVenue='1';
  ensureDatalist(input);
  const label=input.closest('label');
  if(label&&label.firstChild)label.firstChild.textContent='Cancha / recinto (elige o escribe)';
  return input;
}
async function resolveVenueId(name){
  const clean=String(name||'').trim();
  if(!clean)return null;
  const existing=(S?.venues||[]).find(v=>venueName(v).toLocaleLowerCase('es')===clean.toLocaleLowerCase('es'));
  if(existing?.id)return existing.id;
  const {data,error}=await sb.from('venues').insert({association_id:S.a,name:clean}).select('*').single();
  if(error)throw error;
  if(data){S.venues=[...(S.venues||[]),data];}
  return data?.id||null;
}
async function submitFixture(e){
  e.preventDefault();
  e.stopImmediatePropagation();
  const msg=q('#fixtureMsg');
  const show=(text,ok=false)=>{
    if(!msg)return;
    msg.textContent=text||'';
    msg.className='msg '+(ok?'ok':'error');
    clearTimeout(msg._venueTimer);
    if(text)msg._venueTimer=setTimeout(()=>{msg.textContent='';msg.className='msg'},4500);
  };
  try{
    if(typeof canSchedule==='function'&&!canSchedule())return show('No tienes permiso');
    const comp=q('#fCompetition')?.value||'';
    const home=q('#fHome')?.value||'';
    const away=q('#fAway')?.value||'';
    if(!comp)return show('Primero debes tener una liga creada para esta asociación');
    if(!home||!away)return show('Selecciona club local y club visita');
    if(home===away)return show('Local y visita deben ser distintos');
    const venueText=q('#fVenue')?.value||'';
    const venueId=await resolveVenueId(venueText);
    const {data,error}=await sb.rpc('create_club_fixture',{
      p_competition_id:comp,
      p_home_team_id:home,
      p_away_team_id:away,
      p_venue_id:venueId,
      p_fixture_date:q('#fDate')?.value||null,
      p_round_number:q('#fRound')?.value?Number(q('#fRound').value):null
    });
    if(error)throw error;
    show(data?'Fecha programada correctamente':'Fecha programada',true);
    e.target.reset();
    if(typeof syncFixtureClubs==='function')syncFixtureClubs();
    makeTextVenue();
    if(typeof loadFixtures==='function')await loadFixtures();
  }catch(err){show(err?.message||'No se pudo programar la fecha');}
}
function bind(){
  const form=q('#fixtureForm'); if(!form)return;
  const input=makeTextVenue();
  if(!input)return;
  if(!form.dataset.venueSubmitFixed){
    form.dataset.venueSubmitFixed='1';
    form.addEventListener('submit',submitFixture,true);
  }
  const home=q('#fHome');
  if(home&&!home.dataset.venueSafe){
    home.dataset.venueSafe='1';
    home.addEventListener('change',()=>{
      const team=(S?.teams||[]).find(t=>t.id===home.value);
      const candidate=(S?.venues||[]).find(v=>venueName(v).toLocaleLowerCase('es')===('Cancha '+(team?.name||'')).toLocaleLowerCase('es'));
      const venue=q('#fVenue');
      if(candidate&&venue&&!venue.value.trim())venue.value=venueName(candidate);
    });
  }
}
function init(){
  bind();
  new MutationObserver(()=>bind()).observe(document.body,{childList:true,subtree:true});
  setInterval(bind,1200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,250));else setTimeout(init,250);
})();