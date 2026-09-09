(()=>{
  let deferredPrompt=null;
  let pendingClick=false;
  let fallbackTimer=null;
  const ua=navigator.userAgent||'';
  const isIOS=/iphone|ipad|ipod/i.test(ua);
  const isInApp=/(instagram|fbav|fban|line|wv)/i.test(ua);
  const standalone=()=>window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true;

  function clearFallback(){if(fallbackTimer){clearTimeout(fallbackTimer);fallbackTimer=null}}
  function removeHelp(){document.querySelector('#installHelpModal')?.remove()}

  function showHelp(){
    removeHelp();
    const box=document.createElement('div');
    box.id='installHelpModal';
    box.style.cssText='position:fixed;left:16px;right:16px;bottom:18px;z-index:99999;display:flex;justify-content:center;pointer-events:none';
    const card=document.createElement('div');
    card.style.cssText='pointer-events:auto;width:min(560px,100%);background:#071f28;color:#fff;border:2px solid #d5ae42;border-radius:16px;padding:15px 16px;box-shadow:0 16px 45px rgba(0,0,0,.35);font-family:Arial,sans-serif';
    const text=document.createElement('div');
    text.style.cssText='font-size:15px;line-height:1.45;font-weight:750';
    if(isIOS){
      text.innerHTML='📲 <b>iPhone:</b> Safari → Compartir → <b>Agregar a pantalla de inicio</b>.';
    }else if(isInApp){
      text.innerHTML='📲 Abre en <b>Chrome</b> y vuelve a tocar <b>Instalar Linares Score</b>.';
    }else{
      text.innerHTML='📲 Chrome no habilitó la instalación directa en este momento. Toca <b>⋮</b> arriba a la derecha y elige <b>Instalar aplicación</b> o <b>Agregar a pantalla de inicio</b>.';
    }
    const close=document.createElement('button');
    close.type='button';close.textContent='Cerrar';
    close.style.cssText='margin-top:10px;border:0;border-radius:10px;padding:8px 12px;background:#fff;color:#071f28;font-weight:900';
    close.onclick=removeHelp;
    card.append(text,close);box.appendChild(card);document.body.appendChild(box);
  }

  async function launchPrompt(){
    if(!deferredPrompt)return false;
    clearFallback();
    const prompt=deferredPrompt;
    deferredPrompt=null;
    pendingClick=false;
    try{
      await prompt.prompt();
      await prompt.userChoice;
    }catch{}
    ensureButton();
    return true;
  }

  function ensureButton(){
    if(standalone()){
      clearFallback();removeHelp();document.querySelector('#installAppBtn')?.remove();return;
    }
    const actions=document.querySelector('#publicView .top-actions');
    if(!actions)return;
    let btn=document.querySelector('#installAppBtn');
    if(!btn){
      btn=document.createElement('button');
      btn.id='installAppBtn';
      btn.type='button';
      btn.className='ghost';
      btn.setAttribute('aria-label','Instalar Linares Score');
      btn.style.cssText='font-weight:950;min-height:46px;padding:11px 17px;white-space:nowrap';
      const admin=actions.querySelector('#adminLoginBtn');
      if(admin)actions.insertBefore(btn,admin);else actions.appendChild(btn);
    }
    btn.disabled=false;
    btn.textContent=deferredPrompt?'📲 Instalar ahora':'📲 Instalar Linares Score';
    btn.onclick=async()=>{
      removeHelp();
      if(standalone())return;
      if(await launchPrompt())return;
      if(isIOS||isInApp){showHelp();return;}

      pendingClick=true;
      btn.disabled=true;
      btn.textContent='⏳ Preparando instalación…';
      clearFallback();
      fallbackTimer=setTimeout(async()=>{
        fallbackTimer=null;
        if(!pendingClick)return;
        if(await launchPrompt())return;
        pendingClick=false;
        btn.disabled=false;
        btn.textContent='📲 Instalar Linares Score';
        showHelp();
      },5000);
    };
  }

  window.addEventListener('beforeinstallprompt',async e=>{
    e.preventDefault();
    deferredPrompt=e;
    ensureButton();
    if(pendingClick)await launchPrompt();
  });

  window.addEventListener('appinstalled',()=>{
    deferredPrompt=null;pendingClick=false;clearFallback();removeHelp();document.querySelector('#installAppBtn')?.remove();
  });

  async function init(){
    if('serviceWorker' in navigator){
      try{
        await navigator.serviceWorker.register('/service-worker.js',{scope:'/'});
        await navigator.serviceWorker.ready;
      }catch{}
    }
    ensureButton();
    setTimeout(ensureButton,500);
    setTimeout(ensureButton,1800);
    setTimeout(ensureButton,4000);
  }

  window.addEventListener('pageshow',()=>setTimeout(ensureButton,150));
  window.addEventListener('focus',()=>setTimeout(ensureButton,150));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();