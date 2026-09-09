(()=>{
  let deferredPrompt=null;
  const ua=navigator.userAgent||'';
  const isIOS=/iphone|ipad|ipod/i.test(ua);
  const isInApp=/(instagram|fbav|fban|line|wv)/i.test(ua);
  const standalone=()=>window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true;

  function removeHelp(){document.querySelector('#installHelpModal')?.remove()}
  function showHelp(){
    removeHelp();
    const box=document.createElement('div');
    box.id='installHelpModal';
    box.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.72);display:grid;place-items:center;padding:18px';
    const card=document.createElement('div');
    card.style.cssText='width:min(430px,100%);background:#fff;color:#111;border-radius:18px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.35);font-family:Arial,sans-serif';
    const title=document.createElement('h2');title.textContent='📲 Instalar Linares Score';title.style.margin='0 0 10px';
    const text=document.createElement('div');text.style.cssText='font-size:16px;line-height:1.45';
    if(isIOS){
      text.innerHTML='<b>En iPhone:</b><br>1. Abre esta página en Safari.<br>2. Toca <b>Compartir</b>.<br>3. Elige <b>Agregar a pantalla de inicio</b>.';
    }else if(isInApp){
      text.innerHTML='<b>Estás dentro de Instagram/Facebook.</b><br><br>Abre el menú del navegador <b>⋮</b>, elige <b>Abrir en Chrome</b> o <b>Abrir en navegador</b>, y luego toca nuevamente <b>Instalar Linares Score</b>.';
    }else{
      text.innerHTML='Si no aparece la instalación automática, abre el menú del navegador <b>⋮</b> y toca <b>Instalar app</b> o <b>Agregar a pantalla de inicio</b>.';
    }
    const close=document.createElement('button');close.type='button';close.textContent='Entendido';
    close.style.cssText='width:100%;margin-top:18px;border:0;border-radius:12px;padding:12px 14px;background:#0b9950;color:#fff;font-weight:900';
    close.onclick=removeHelp;
    card.append(title,text,close);box.appendChild(card);box.addEventListener('click',e=>{if(e.target===box)removeHelp()});document.body.appendChild(box);
  }

  function ensureButton(){
    if(standalone()){document.querySelector('#installAppBtn')?.remove();return}
    const actions=document.querySelector('#publicView .top-actions');
    if(!actions)return;
    let btn=document.querySelector('#installAppBtn');
    if(!btn){
      btn=document.createElement('button');
      btn.id='installAppBtn';
      btn.type='button';
      btn.className='ghost';
      btn.setAttribute('aria-label','Instalar Linares Score');
      btn.style.cssText='font-weight:950;min-height:44px;padding:10px 16px;white-space:nowrap';
      const admin=actions.querySelector('#adminLoginBtn');
      if(admin)actions.insertBefore(btn,admin);else actions.appendChild(btn);
    }
    btn.textContent='📲 Instalar Linares Score';
    btn.onclick=async()=>{
      if(standalone())return;
      if(deferredPrompt){
        const prompt=deferredPrompt;
        deferredPrompt=null;
        try{await prompt.prompt();await prompt.userChoice}catch{}
        ensureButton();
        return;
      }
      showHelp();
    };
  }

  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;ensureButton()});
  window.addEventListener('appinstalled',()=>{deferredPrompt=null;removeHelp();document.querySelector('#installAppBtn')?.remove()});
  function init(){
    if('serviceWorker' in navigator)navigator.serviceWorker.register('/service-worker.js',{scope:'/'}).catch(()=>{});
    ensureButton();setTimeout(ensureButton,400);setTimeout(ensureButton,1200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();