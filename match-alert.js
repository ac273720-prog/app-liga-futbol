(()=>{
let installPrompt=null;

function setupPwa(){
  if(!document.querySelector('link[rel="manifest"]')){
    const link=document.createElement('link');
    link.rel='manifest';
    link.href='/manifest.webmanifest?v=4';
    document.head.appendChild(link);
  }
  if(!document.querySelector('meta[name="theme-color"]')){
    const meta=document.createElement('meta');
    meta.name='theme-color';
    meta.content='#075f33';
    document.head.appendChild(meta);
  }
  if(!document.querySelector('meta[name="apple-mobile-web-app-capable"]')){
    const meta=document.createElement('meta');
    meta.name='apple-mobile-web-app-capable';
    meta.content='yes';
    document.head.appendChild(meta);
  }
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/service-worker.js?v=3',{scope:'/'}).catch(()=>{});
  }
  ensureInstallButton();
}

function isStandalone(){
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
}
function isIos(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}
function findInstallButton(){
  return [...document.querySelectorAll('button,a')].find(el=>/instalar\s*(la\s*)?app|descargar\s*(la\s*)?app/i.test((el.textContent||'').trim()));
}
function ensureInstallButton(){
  let btn=findInstallButton();
  if(!btn){
    const host=document.querySelector('#publicView .top-actions');
    if(!host)return;
    btn=document.createElement('button');
    btn.id='installAppBtn';
    btn.className='ghost';
    btn.type='button';
    btn.textContent='⬇️ Instalar app';
    host.appendChild(btn);
  }
  btn.dataset.pwaReady='1';
  if(isStandalone()){
    btn.style.display='none';
    return;
  }
  btn.onclick=async e=>{
    e.preventDefault();
    if(installPrompt){
      const p=installPrompt;
      installPrompt=null;
      await p.prompt();
      try{await p.userChoice}catch(_){ }
      if(isStandalone())btn.style.display='none';
      return;
    }
    if(isIos()){
      alert('Para instalar Linares Score en iPhone/iPad: toca Compartir y luego “Añadir a pantalla de inicio”.');
    }else{
      alert('Si no aparece la ventana de instalación, abre el menú de tu navegador y elige “Instalar aplicación” o “Añadir a pantalla de inicio”.');
    }
  };
}
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();
  installPrompt=e;
  ensureInstallButton();
});
window.addEventListener('appinstalled',()=>{
  installPrompt=null;
  const btn=findInstallButton();
  if(btn)btn.style.display='none';
});

function hideEmptySeries(){
  document.querySelectorAll('#pubFixtures *,#fixtures *').forEach(el=>{
    if(el.children.length===0 && el.textContent.trim().toLowerCase()==='sin series')el.style.display='none';
  });
}

function removeFinishedMatchAlert(){
  document.querySelector('#achibuenoToday')?.remove();
  document.querySelector('#achibuenoAlertStyle')?.remove();
}

function run(){
  removeFinishedMatchAlert();
  hideEmptySeries();
  ensureInstallButton();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setupPwa();run()});else{setupPwa();run()}
new MutationObserver(()=>setTimeout(run,20)).observe(document.body,{childList:true,subtree:true});
})();