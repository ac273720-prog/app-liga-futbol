(()=>{
let installPrompt=window.linaresInstallOffer||null,installBusy=false,installedThisPage=false;
window.linaresInstallOffer=null;
if(window.linaresCaptureInstall)window.removeEventListener('beforeinstallprompt',window.linaresCaptureInstall);
let installWaitTimer=null,waitingForInstall=false;
const LINARES_ASSOCIATION_ID='f8057c00-36f9-4974-abca-5cc728300a74';
function setupPwa(){
  if(!document.querySelector('link[rel="manifest"]')){const link=document.createElement('link');link.rel='manifest';link.href='/manifest.webmanifest?v=7';document.head.appendChild(link)}
  for(const [name,content] of [['theme-color','#075f33'],['apple-mobile-web-app-capable','yes'],['apple-mobile-web-app-title','Linares Score']]){
    if(!document.querySelector('meta[name="'+name+'"]')){const meta=document.createElement('meta');meta.name=name;meta.content=content;document.head.appendChild(meta)}
  }
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/service-worker.js?v=6',{scope:'/'}).then(reg=>reg.update().catch(()=>{})).catch(()=>{});
  const style=document.createElement('style');style.textContent='#installAppBtn{grid-column:1/-1;min-height:48px;width:100%}#installHelpModal ol{padding-left:24px;line-height:1.6}#installHelpModal li{margin:10px 0}#installHelpModal button:focus-visible{outline:3px solid #ffb300;outline-offset:3px}';document.head.appendChild(style);
  ensureInstallButton();
}
function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true}
function isIos(){return /iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function isAndroid(){return /android/i.test(navigator.userAgent)}
function isInstagram(){return /instagram/i.test(navigator.userAgent)}
function isFacebookInApp(){return /(fb_iab|fbav|fban)/i.test(navigator.userAgent)}
function isInAppBrowser(){return isInstagram()||isFacebookInApp()}
function installAnalyticsId(){let id=localStorage.getItem('linaresInstallId');if(!id){id=crypto.randomUUID();localStorage.setItem('linaresInstallId',id)}return id}
function trackInstallEvent(eventType){
  try{
    if(typeof sb==='undefined')return;
    const platform=isIos()?'ios':isAndroid()?'android':'other',params=new URLSearchParams(location.search);
    const source=(params.get('utm_source')||(isInstagram()?'instagram':isFacebookInApp()?'facebook':'direct')).slice(0,32);
    Promise.resolve(sb.rpc('track_install_event',{p_install_id:installAnalyticsId(),p_event_type:eventType,p_platform:platform,p_source:source})).catch(()=>{});
  }catch(_){}
}
function currentHttpsUrl(){
  const url=new URL(location.href);url.protocol='https:';url.hash='';return url.href;
}
function chromeInstallUrl(){
  const url=new URL(currentHttpsUrl());url.searchParams.set('install','1');
  if(!url.searchParams.has('utm_source'))url.searchParams.set('utm_source',isInstagram()?'instagram':isFacebookInApp()?'facebook':'direct');
  return url;
}
function openInChrome(){
  const url=chromeInstallUrl();
  showInstallHelp('Si Chrome no se abre, usa el menú ⋯ de Instagram o Facebook y elige “Abrir en navegador”. Después toca “Instalar app”.',openInChrome,'Abrir en Chrome');
  location.href='intent://'+url.host+url.pathname+url.search+'#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url='+encodeURIComponent(url.href)+';end;';
}
let installHelpOpener=null;
function closeInstallHelp(){clearTimeout(installWaitTimer);waitingForInstall=false;const modal=document.querySelector('#installHelpModal');modal?.classList.add('hidden');installHelpOpener?.focus()}
function showInstallHelp(message,action,actionLabel='Abrir en Chrome',steps=[]){
  let modal=document.querySelector('#installHelpModal');
  if(!modal){
    modal=document.createElement('div');modal.id='installHelpModal';modal.className='modal hidden';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','installHelpTitle');
    modal.innerHTML='<div class="card modal-card" style="text-align:left"><div class="fixture-head"><h2 id="installHelpTitle" style="margin:0">Instalar Linares Score</h2><button id="closeInstallHelp" class="ghost" aria-label="Cerrar" type="button">✕</button></div><p id="installHelpText" style="line-height:1.5"></p><ol id="installHelpSteps"></ol><button id="externalInstallHelp" class="primary hidden" type="button" style="width:100%;margin-bottom:10px"></button><button id="copyInstallLink" class="ghost" type="button" style="width:100%;margin-bottom:10px">Copiar enlace</button><p id="copyInstallStatus" role="status" style="overflow-wrap:anywhere"></p><button id="acceptInstallHelp" class="ghost" type="button" style="width:100%">Cerrar</button></div>';
    document.body.appendChild(modal);
    modal.querySelector('#closeInstallHelp').onclick=closeInstallHelp;modal.querySelector('#acceptInstallHelp').onclick=closeInstallHelp;
    modal.addEventListener('click',e=>{if(e.target===modal)closeInstallHelp()});
    modal.addEventListener('keydown',e=>{
      if(e.key==='Escape'){e.preventDefault();closeInstallHelp()}
      if(e.key==='Tab'){
        const controls=[...modal.querySelectorAll('button')].filter(b=>!b.classList.contains('hidden')&&!b.disabled),first=controls[0],last=controls[controls.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      }
    });
    modal.querySelector('#copyInstallLink').onclick=async()=>{
      const status=modal.querySelector('#copyInstallStatus');
      try{await navigator.clipboard.writeText(currentHttpsUrl());status.textContent='Enlace copiado. Pégalo en tu navegador.'}catch(_){status.textContent='Copia este enlace: '+currentHttpsUrl()}
    };
  }
  const wasHidden=modal.classList.contains('hidden');
  if(wasHidden)installHelpOpener=document.activeElement;
  const txt=modal.querySelector('#installHelpText');if(txt.textContent!==message)txt.textContent=message;
  const list=modal.querySelector('#installHelpSteps');list.replaceChildren(...steps.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));list.classList.toggle('hidden',!steps.length);
  const external=modal.querySelector('#externalInstallHelp');external.textContent=actionLabel;external.classList.toggle('hidden',!action);external.onclick=action||null;external.disabled=false;
  modal.querySelector('#copyInstallStatus').textContent='';modal.classList.remove('hidden');
  if(wasHidden)modal.querySelector('#closeInstallHelp').focus();
}
function findInstallButtons(){
  return [...document.querySelectorAll('button,a')].filter(el=>el.id==='installAppBtn'||el.dataset.pwaReady==='1');
}
function hideInstallButtons(){findInstallButtons().forEach(el=>el.remove())}
function fallbackInstallHelp(){
  if(isIos()){
    showInstallHelp(isInAppBrowser()?'Abre Linares Score en Safari para añadirla a tu pantalla de inicio.':'Añade Linares Score a tu pantalla de inicio.',null,'',isInAppBrowser()?['Toca ⋯ y elige “Abrir en navegador” o copia el enlace en Safari.','En Safari: Compartir → Añadir a pantalla de inicio → Añadir.']:['Toca Compartir en el navegador.','Elige “Añadir a pantalla de inicio” y confirma “Añadir”.']);
  }else if(isAndroid()){
    showInstallHelp('Instálala desde el menú de tu navegador.',null,'',['Toca el menú ⋮.','Elige “Instalar aplicación” o “Añadir a pantalla de inicio” y confirma.']);
  }else{
    showInstallHelp('Busca “Instalar Linares Score” en la barra de direcciones o en el menú de tu navegador.');
  }
}
function waitForInstallOffer(){
  clearTimeout(installWaitTimer);waitingForInstall=true;
  showInstallHelp('Chrome está preparando la instalación. Espera unos segundos en esta página.',installApp,'Instalar app');
  const action=document.querySelector('#externalInstallHelp');if(action)action.disabled=true;
  installWaitTimer=setTimeout(()=>{
    waitingForInstall=false;
    fallbackInstallHelp();
  },35000);
}
function receiveInstallOffer(e){
  e.preventDefault();installPrompt=e;window.linaresInstallOffer=null;installedThisPage=false;
  clearTimeout(installWaitTimer);ensureInstallButton();
  if(waitingForInstall){
    waitingForInstall=false;
    showInstallHelp('Todo listo. Toca “Instalar app” para confirmar la instalación en Chrome.',installApp,'Instalar app');
  }
}
async function installApp(e){
  if(installBusy){e.preventDefault();return}
  trackInstallEvent('install_click');
  if(installedThisPage||isStandalone()){e.preventDefault();hideInstallButtons();return}
  if(isInAppBrowser()&&isAndroid()){
    showInstallHelp('Si Chrome no se abre, toca el menú ⋯ de Instagram o Facebook y elige “Abrir en navegador”. También puedes copiar el enlace y pegarlo en Chrome.');
    return;
  }
  e.preventDefault();
  if(isIos()){fallbackInstallHelp();return}
  if(!installPrompt){if(/chrome|chromium|edg/i.test(navigator.userAgent))waitForInstallOffer();else fallbackInstallHelp();return}
  closeInstallHelp();
  const prompt=installPrompt;installPrompt=null;window.linaresInstallOffer=null;installBusy=true;ensureInstallButton();
  try{
    await prompt.prompt();
    const choice=await prompt.userChoice;
    if(choice?.outcome==='accepted'){trackInstallEvent('install_accepted');installedThisPage=true;closeInstallHelp()}
  }catch(_){fallbackInstallHelp()}
  finally{installBusy=false;ensureInstallButton()}
}
function ensureInstallButton(){
  const buttons=findInstallButtons();buttons.slice(1).forEach(el=>el.remove());
  if(installedThisPage||isStandalone()){hideInstallButtons();return}
  let btn=buttons[0];
  const external=isInAppBrowser()&&isAndroid(),tag=external?'A':'BUTTON';
  if(btn&&btn.tagName!==tag){btn.remove();btn=null}
  if(!btn){
    const host=document.querySelector('#publicView .top-actions');if(!host)return;
    btn=document.createElement(tag.toLowerCase());btn.id='installAppBtn';btn.dataset.pwaReady='1';
    btn.style.cssText='display:flex!important;align-items:center;justify-content:center;text-decoration:none;background:linear-gradient(135deg,#ffb300,#ff7a00)!important;color:#1d1600!important;border:2px solid #ffe082!important;border-radius:12px;padding:12px 16px;font-weight:950;font-size:14px;cursor:pointer';
    host.appendChild(btn);
  }
  btn.onclick=installApp;
  if(external){
    const url=chromeInstallUrl();
    btn.href='intent://'+url.host+url.pathname+url.search+'#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url='+encodeURIComponent(url.href)+';end;';
    btn.setAttribute('role','button');
  }else{btn.type='button'}

  const label=installBusy?'Instalar app…':'📲 Instalar app';
  if(btn.textContent!==label)btn.textContent=label;
  if(btn.disabled!==installBusy)btn.disabled=installBusy;
}
window.addEventListener('beforeinstallprompt',receiveInstallOffer);
window.addEventListener('appinstalled',()=>{installPrompt=null;installedThisPage=true;trackInstallEvent('install_confirmed');hideInstallButtons();closeInstallHelp()});
try{window.matchMedia('(display-mode: standalone)').addEventListener('change',ensureInstallButton)}catch(_){}
function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function selectedAssociation(){const sel=document.querySelector('#pubAssociation');return norm(sel?.options?.[sel.selectedIndex]?.textContent||'')}
function selectedAssociationId(){return document.querySelector('#pubAssociation')?.value||''}
function prettyAssociation(name){const n=norm(name);if(n==='linares'||n==='asociacion linares'||n==='soc linares')return 'ASOCIACIÓN LINARES';if(n.includes('victor zavala'))return 'VÍCTOR ZAVALA · LINARES';if(n.includes('precordillera'))return 'PRECORDILLERA · LINARES';if(n.includes('afal'))return 'AFAL · LINARES';if(n.includes('afacon'))return 'AFACON · COLBÚN';if(n.includes('yerbas buenas'))return 'YERBAS BUENAS';return String(name||'').replace(/^asociaci[oó]n\s+/i,'').replace(/^soc\.\s*/i,'').trim().toUpperCase()}
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
async function loadInstallAnalytics(){const note=document.querySelector('#installStatsNote');if(note)note.textContent='Actualizando…';const {data,error}=await sb.from('app_install_events').select('install_id,event_type,platform');if(error){if(note)note.textContent='No se pudieron cargar las estadísticas.';return}const rows=data||[],ids=type=>new Set(rows.filter(x=>x.event_type===type).map(x=>x.install_id)),installed=new Set([...ids('install_confirmed'),...ids('standalone_open')]),installedRows=rows.filter(x=>installed.has(x.install_id));document.querySelector('#installTotal').textContent=installed.size;document.querySelector('#installClicks').textContent=ids('install_click').size;document.querySelector('#installAndroid').textContent=new Set(installedRows.filter(x=>x.platform==='android').map(x=>x.install_id)).size;document.querySelector('#installIos').textContent=new Set(installedRows.filter(x=>x.platform==='ios').map(x=>x.install_id)).size;if(note)note.textContent='Cuenta instalaciones detectadas desde la activación del contador. No guarda datos personales.'}
function ensureInstallAnalyticsPanel(){if(typeof isOwner!=='function'||!isOwner())return;const control=document.querySelector('#p-control');if(!control||document.querySelector('#installAnalyticsCard'))return;const card=document.createElement('div');card.id='installAnalyticsCard';card.className='card';card.style.marginTop='16px';card.innerHTML='<div class="section-title"><div><h3 style="margin:0">Instalaciones de Linares Score</h3><p class="muted">Estadísticas privadas del propietario.</p></div><button id="refreshInstallStats" class="ghost small" type="button">Actualizar</button></div><div class="grid" style="margin-top:12px"><div><small class="muted">INSTALACIONES</small><h2 id="installTotal" style="margin:5px 0">—</h2></div><div><small class="muted">CLICS EN INSTALAR</small><h2 id="installClicks" style="margin:5px 0">—</h2></div><div><small class="muted">ANDROID</small><h2 id="installAndroid" style="margin:5px 0">—</h2></div><div><small class="muted">IPHONE / IPAD</small><h2 id="installIos" style="margin:5px 0">—</h2></div></div><p id="installStatsNote" class="muted" style="margin-bottom:0">Cargando estadísticas…</p>';control.appendChild(card);card.querySelector('#refreshInstallStats').onclick=loadInstallAnalytics;const controlTab=[...document.querySelectorAll('#nav button')].find(x=>x.dataset.p==='control');if(controlTab&&!controlTab.dataset.installStatsBound){controlTab.dataset.installStatsBound='1';controlTab.addEventListener('click',()=>setTimeout(loadInstallAnalytics,50))}loadInstallAnalytics()}
function run(){removeFinishedMatchAlert();polishAssociationSelector();cleanFixtureDisplay();ensureInstallButton();ensureInstallAnalyticsPanel()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setupPwa();if(isStandalone())trackInstallEvent('standalone_open');run()});else{setupPwa();if(isStandalone())trackInstallEvent('standalone_open');run()}
let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;setTimeout(()=>{pending=false;run()},80)}).observe(document.body,{childList:true,subtree:true});
})();
