(()=>{
let installPrompt=null;
let fenfurRows=null;
let fenfurLoading=false;
const LINARES_ASSOCIATION_ID='f8057c00-36f9-4974-abca-5cc728300a74';

function setupPwa(){
  if(!document.querySelector('link[rel="manifest"]')){const link=document.createElement('link');link.rel='manifest';link.href='/manifest.webmanifest';document.head.appendChild(link)}
  if(!document.querySelector('meta[name="theme-color"]')){const meta=document.createElement('meta');meta.name='theme-color';meta.content='#075f33';document.head.appendChild(meta)}
  if(!document.querySelector('meta[name="apple-mobile-web-app-capable"]')){const meta=document.createElement('meta');meta.name='apple-mobile-web-app-capable';meta.content='yes';document.head.appendChild(meta)}
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/service-worker.js?v=4',{scope:'/'}).catch(()=>{});ensureInstallButton()
}
function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true}
function isIos(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}
function isInstagram(){return /(instagram|fb_iab|fbav)/i.test(navigator.userAgent)}
function installAnalyticsId(){let id=localStorage.getItem('linaresInstallId');if(!id){id=crypto.randomUUID?.()||'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==='x'?r:(r&3|8);return v.toString(16)});localStorage.setItem('linaresInstallId',id)}return id}
function trackInstallEvent(eventType){if(typeof sb==='undefined')return;const platform=isIos()?'ios':/android/i.test(navigator.userAgent)?'android':'other';const params=new URLSearchParams(location.search);const source=(params.get('utm_source')||(isInstagram()?'instagram':'direct')).slice(0,32);sb.rpc('track_install_event',{p_install_id:installAnalyticsId(),p_event_type:eventType,p_platform:platform,p_source:source}).then(()=>{}).catch(()=>{})}
function showInstallHelp(message,action){
  let modal=document.querySelector('#installHelpModal');
  if(!modal){
    modal=document.createElement('div');modal.id='installHelpModal';modal.className='modal hidden';
    modal.innerHTML='<div class="card modal-card" style="border-top:5px solid #d2ad3a;text-align:left"><div class="fixture-head"><div><small class="muted">LINARES SCORE</small><h2 style="margin:4px 0 0">Instalar aplicación</h2></div><button id="closeInstallHelp" class="ghost" type="button">✕</button></div><p id="installHelpText" style="font-size:1.05rem;line-height:1.5;margin:20px 0"></p><button id="externalInstallHelp" class="primary hidden" type="button" style="width:100%;margin-bottom:10px">Abrir en Chrome</button><button id="acceptInstallHelp" class="ghost" type="button" style="width:100%">Entendido</button></div>';
    document.body.appendChild(modal);
    const close=()=>modal.classList.add('hidden');
    modal.querySelector('#closeInstallHelp').onclick=close;modal.querySelector('#acceptInstallHelp').onclick=close;
    modal.addEventListener('click',e=>{if(e.target===modal)close()})
  }
  modal.querySelector('#installHelpText').textContent=message;
  const external=modal.querySelector('#externalInstallHelp');
  external.classList.toggle('hidden',!action);external.onclick=action||null;
  modal.classList.remove('hidden')
}
function findInstallButtons(){
  return [...document.querySelectorAll('button,a')].filter(el=>
    el.id==='installAppBtn'||
    el.dataset.pwaReady==='1'||
    /instalar\s*(ahora|la\s*app|app)|preparando\s*instalaci[oó]n|descargar\s*(la\s*)?app/i.test((el.textContent||'').trim())
  )
}
function ensureInstallButton(){
  let buttons=findInstallButtons();
  if(buttons.length>1){buttons.slice(1).forEach(el=>el.remove());buttons=buttons.slice(0,1)}
  let btn=buttons[0]||null;
  if(!btn){const host=document.querySelector('#publicView .top-actions');if(!host)return;btn=document.createElement('button');btn.id='installAppBtn';btn.type='button';btn.textContent='📲 Instalar app';host.appendChild(btn)}
  btn.dataset.pwaReady='1';
  btn.style.cssText='display:inline-flex!important;align-items:center;justify-content:center;gap:7px;background:linear-gradient(135deg,#ffb300,#ff7a00)!important;color:#1d1600!important;border:2px solid #ffe082!important;border-radius:12px!important;padding:10px 16px!important;font-weight:950!important;font-size:14px!important;box-shadow:0 4px 12px rgba(255,122,0,.35)!important;cursor:pointer!important;';
  btn.disabled=false;btn.textContent='📲 Instalar app';
  btn.onclick=async e=>{
    e.preventDefault();trackInstallEvent('install_click');
    if(isStandalone()){showInstallHelp('Linares Score ya está instalada en este dispositivo.');return}
    if(isInstagram()){
      if(isIos())showInstallHelp('Instagram no permite instalar aplicaciones dentro de su navegador. Toca los tres puntos de arriba, elige “Abrir en Safari”; después toca Compartir y “Añadir a pantalla de inicio”.');
      else{const cleanUrl=`${location.host}${location.pathname}${location.search}${location.hash}`;location.href=`intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`}
      return
    }
    if(installPrompt){
      const p=installPrompt;installPrompt=null;await p.prompt();
      try{const choice=await p.userChoice;if(choice?.outcome==='accepted')trackInstallEvent('install_accepted')}catch(_){}
      return
    }
    if(isIos())showInstallHelp('En iPhone o iPad, toca Compartir y luego “Añadir a pantalla de inicio”.');
    else showInstallHelp('Toca el menú ⋮ de Chrome y elige “Instalar aplicación” o “Añadir a pantalla de inicio”.')
  }
}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;ensureInstallButton()});window.addEventListener('appinstalled',()=>{installPrompt=null;trackInstallEvent('install_confirmed');ensureInstallButton()});
function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function selectedAssociation(){const sel=document.querySelector('#pubAssociation');return norm(sel?.options?.[sel.selectedIndex]?.textContent||'')}
function selectedAssociationId(){return document.querySelector('#pubAssociation')?.value||''}
function prettyAssociation(name){const n=norm(name);if(n==='linares'||n==='asociacion linares'||n==='soc linares')return 'ASOCIACIÓN LINARES';if(n.includes('fenfur'))return '🏆 FENFUR · COPA REGIONAL';if(n.includes('victor zavala'))return 'VÍCTOR ZAVALA · LINARES';if(n.includes('precordillera'))return 'PRECORDILLERA · LINARES';if(n.includes('afal'))return 'AFAL · LINARES';if(n.includes('afacon'))return 'AFACON · COLBÚN';if(n.includes('yerbas buenas'))return 'YERBAS BUENAS';return String(name||'').replace(/^asociaci[oó]n\s+/i,'').replace(/^soc\.\s*/i,'').trim().toUpperCase()}
function polishAssociationSelector(){
  let st=document.querySelector('#associationSelectorPolish');
  if(!st){st=document.createElement('style');st.id='associationSelectorPolish';document.head.appendChild(st)}
  st.textContent=`
  .top-choice{font-family:"Trebuchet MS","Segoe UI",system-ui,sans-serif!important;font-size:.72rem!important;font-weight:950!important;letter-spacing:.14em!important;text-transform:uppercase!important;color:#ffd95a!important}
  #pubAssociation,#ownerAssociation{appearance:auto!important;min-width:255px!important;min-height:46px!important;padding:10px 40px 10px 14px!important;border:2px solid #d2ad3a!important;border-radius:12px!important;background:linear-gradient(180deg,#061a11,#0d3422)!important;color:#ffd95a!important;font-family:"Trebuchet MS","Segoe UI",system-ui,sans-serif!important;font-size:.9rem!important;font-weight:950!important;letter-spacing:.045em!important;box-shadow:0 0 0 1px rgba(210,173,58,.16),0 7px 18px rgba(0,0,0,.28)!important;text-shadow:0 1px 0 rgba(0,0,0,.35)!important}
  #pubAssociation:focus,#ownerAssociation:focus{outline:3px solid rgba(255,217,90,.24)!important;outline-offset:2px!important;border-color:#ffe070!important}
  #pubAssociation option,#ownerAssociation option{background:#071b12!important;color:#ffffff!important;font-family:"Trebuchet MS","Segoe UI",system-ui,sans-serif!important;font-size:.94rem!important;font-weight:800!important}
  #pubFixtures.only-crossings .series-row{display:none!important}
  #pubFixtures.only-crossings .empty{display:none!important}
  @media(max-width:560px){#pubAssociation,#ownerAssociation{min-width:0!important;width:100%!important;font-size:.84rem!important}.top-choice{width:100%!important}}
  `;
  ['#pubAssociation','#ownerAssociation'].forEach(id=>{const sel=document.querySelector(id);if(!sel)return;[...sel.options].forEach(o=>{if(!o.dataset.originalLabel)o.dataset.originalLabel=o.textContent;const label=prettyAssociation(o.dataset.originalLabel);if(o.textContent!==label)o.textContent=label})});
}
function cleanFixtureDisplay(){
  const assoc=selectedAssociation();
  const assocId=selectedAssociationId();
  const afacon=assoc.includes('afacon')||assoc.includes('afacom');
  const linares=assocId===LINARES_ASSOCIATION_ID||assoc==='asociacion linares'||assoc==='linares';
  const zavala=assoc.includes('zavala');
  const onlyCrossings=afacon||linares;
  const fixtureHost=document.querySelector('#pubFixtures');
  fixtureHost?.classList.toggle('only-crossings',onlyCrossings);
  document.querySelectorAll('#pubFixtures .fixture').forEach(card=>{
    card.querySelectorAll('.series-row').forEach(row=>{row.style.setProperty('display',onlyCrossings?'none':'','important')});
    card.querySelectorAll('.empty').forEach(el=>{const t=norm(el.textContent);if((onlyCrossings||zavala)&&t==='sin series')el.style.setProperty('display','none','important');else if(!onlyCrossings&&!zavala&&t==='sin series')el.style.removeProperty('display')});
  });
  const sub=document.querySelector('#pub-fixtures .section-title .muted');
  if(sub)sub.textContent=onlyCrossings?'Cruces programados entre clubes':'Enfrentamientos entre clubes y resultados por serie';
}
function removeFinishedMatchAlert(){document.querySelector('#achibuenoToday')?.remove();document.querySelector('#achibuenoAlertStyle')?.remove()}
function cleanName(s){return norm(s)}
async function ensureFenfurRows(){if(fenfurRows||fenfurLoading||typeof sb==='undefined')return;fenfurLoading=true;try{const {data,error}=await sb.from('fenfur_ties').select('id,category,home_team,away_team,first_leg_home_goals,first_leg_away_goals,second_leg_home_goals,second_leg_away_goals,status');if(!error)fenfurRows=data||[]}catch(_){}fenfurLoading=false}
async function showFenfurScores(){const cards=[...document.querySelectorAll('#fenfurGrid .fenfur-tie')];if(!cards.length)return;await ensureFenfurRows();if(!fenfurRows)return;for(const card of cards){let box=card.querySelector('[data-fenfur-score]');if(card.querySelector('.fenfur-score-pill')){box?.remove();continue}const teams=[...card.querySelectorAll('.fenfur-team span')].map(x=>cleanName(x.childNodes[0]?.textContent||x.textContent));if(teams.length<2)continue;const row=fenfurRows.find(r=>cleanName(r.home_team)===teams[0]&&cleanName(r.away_team)===teams[1]);if(!row)continue;const parts=[];if(row.first_leg_home_goals!==null&&row.first_leg_home_goals!==undefined&&row.first_leg_away_goals!==null&&row.first_leg_away_goals!==undefined)parts.push(`IDA · ${row.home_team} ${row.first_leg_home_goals}-${row.first_leg_away_goals} ${row.away_team}`);if(row.second_leg_home_goals!==null&&row.second_leg_home_goals!==undefined&&row.second_leg_away_goals!==null&&row.second_leg_away_goals!==undefined)parts.push(`VUELTA · ${row.home_team} ${row.second_leg_home_goals}-${row.second_leg_away_goals} ${row.away_team}`);if(!parts.length){box?.remove();continue}if(!box){box=document.createElement('div');box.dataset.fenfurScore='1';box.style.cssText='margin-top:10px;padding:10px 11px;border-radius:10px;background:#5a1117;border:1px solid #d5ae42;color:#fff;font-weight:950;text-align:center';card.appendChild(box)}box.innerHTML=`🏁 ${parts.join('<br>')}`}}
async function loadInstallAnalytics(){const note=document.querySelector('#installStatsNote');if(note)note.textContent='Actualizando…';const {data,error}=await sb.from('app_install_events').select('install_id,event_type,platform');if(error){if(note)note.textContent='No se pudieron cargar las estadísticas.';return}const rows=data||[],ids=type=>new Set(rows.filter(x=>x.event_type===type).map(x=>x.install_id)),installed=new Set([...ids('install_confirmed'),...ids('standalone_open')]),installedRows=rows.filter(x=>installed.has(x.install_id));document.querySelector('#installTotal').textContent=installed.size;document.querySelector('#installClicks').textContent=ids('install_click').size;document.querySelector('#installAndroid').textContent=new Set(installedRows.filter(x=>x.platform==='android').map(x=>x.install_id)).size;document.querySelector('#installIos').textContent=new Set(installedRows.filter(x=>x.platform==='ios').map(x=>x.install_id)).size;if(note)note.textContent='Cuenta instalaciones detectadas desde la activación del contador. No guarda datos personales.'}
function ensureInstallAnalyticsPanel(){if(typeof isOwner!=='function'||!isOwner())return;const control=document.querySelector('#p-control');if(!control||document.querySelector('#installAnalyticsCard'))return;const card=document.createElement('div');card.id='installAnalyticsCard';card.className='card';card.style.marginTop='16px';card.innerHTML='<div class="section-title"><div><h3 style="margin:0">Instalaciones de Linares Score</h3><p class="muted">Estadísticas privadas del propietario.</p></div><button id="refreshInstallStats" class="ghost small" type="button">Actualizar</button></div><div class="grid" style="margin-top:12px"><div><small class="muted">INSTALACIONES</small><h2 id="installTotal" style="margin:5px 0">—</h2></div><div><small class="muted">CLICS EN INSTALAR</small><h2 id="installClicks" style="margin:5px 0">—</h2></div><div><small class="muted">ANDROID</small><h2 id="installAndroid" style="margin:5px 0">—</h2></div><div><small class="muted">IPHONE / IPAD</small><h2 id="installIos" style="margin:5px 0">—</h2></div></div><p id="installStatsNote" class="muted" style="margin-bottom:0">Cargando estadísticas…</p>';control.appendChild(card);card.querySelector('#refreshInstallStats').onclick=loadInstallAnalytics;const controlTab=[...document.querySelectorAll('#nav button')].find(x=>x.dataset.p==='control');if(controlTab&&!controlTab.dataset.installStatsBound){controlTab.dataset.installStatsBound='1';controlTab.addEventListener('click',()=>setTimeout(loadInstallAnalytics,50))}loadInstallAnalytics()}
function run(){removeFinishedMatchAlert();polishAssociationSelector();cleanFixtureDisplay();ensureInstallButton();ensureInstallAnalyticsPanel();showFenfurScores()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setupPwa();if(isStandalone())trackInstallEvent('standalone_open');run()});else{setupPwa();if(isStandalone())trackInstallEvent('standalone_open');run()}
let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;setTimeout(()=>{pending=false;run()},80)}).observe(document.body,{childList:true,subtree:true});
})();
