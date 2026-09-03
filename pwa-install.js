(()=>{
  let deferredPrompt=null;
  const standalone=()=>window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true;
  function ensureButton(){
    if(standalone()){document.querySelector('#installAppBtn')?.remove();return}
    const actions=document.querySelector('#publicView .top-actions');
    if(!actions||document.querySelector('#installAppBtn'))return;
    const btn=document.createElement('button');
    btn.id='installAppBtn';
    btn.type='button';
    btn.className='ghost';
    btn.textContent='📲 Instalar app';
    btn.setAttribute('aria-label','Instalar Linares Score');
    btn.onclick=async()=>{
      if(deferredPrompt){
        deferredPrompt.prompt();
        try{await deferredPrompt.userChoice}catch{}
        deferredPrompt=null;
        return;
      }
      if(/iphone|ipad|ipod/i.test(navigator.userAgent||'')) alert('En iPhone/iPad: toca Compartir y luego “Agregar a pantalla de inicio”.');
      else alert('Usa el menú del navegador y elige “Instalar app” o “Agregar a pantalla de inicio”.');
    };
    const admin=actions.querySelector('#adminLoginBtn');
    if(admin)actions.insertBefore(btn,admin);else actions.appendChild(btn);
  }
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;ensureButton()});
  window.addEventListener('appinstalled',()=>{deferredPrompt=null;document.querySelector('#installAppBtn')?.remove()});
  function init(){
    if('serviceWorker' in navigator) navigator.serviceWorker.register('/service-worker.js',{scope:'/'}).catch(()=>{});
    ensureButton();
    setTimeout(ensureButton,500);
    setTimeout(ensureButton,1500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
