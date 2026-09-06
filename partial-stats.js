(()=>{
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const selectedAssociationName=()=>{const pub=document.querySelector('#pubAssociation');if(pub&&pub.value)return pub.options[pub.selectedIndex]?.textContent||'';return (typeof S!=='undefined'&&S?.aName)||''};
  const isPrecordillera=()=>norm(selectedAssociationName()).includes('precordillera');
  const isFenfur=()=>document.querySelector('#pubAssociation')?.value==='__fenfur__'||document.querySelector('#fenfurCupPanel')?.classList.contains('active');
  const isDirectAdmin=()=>new URLSearchParams(location.search).get('admin')==='1'||location.hash==='#admin';
  const noticeHtml='<div style="font-size:.72rem;font-weight:950;letter-spacing:.12em">⚽ PRECORDILLERA 2026</div><h2 style="margin:7px 0">🏆 Copa Regional FENFUR</h2><p style="margin:0"><b>Actualmente se está disputando la Copa Regional FENFUR en Serie 35 y Serie 50.</b></p>';
  function notice(){let box=document.querySelector('#associationStatusNotice');if(isDirectAdmin()||isFenfur()||!isPrecordillera()){box?.remove();return}const main=document.querySelector('#publicView .public-main');if(!main)return;if(!box){box=document.createElement('div');box.id='associationStatusNotice';box.className='card';box.style.cssText='margin:0 0 18px;border-left:7px solid var(--accent,#ff1f59);'}const tabs=main.querySelector('.tabs');if(tabs)main.insertBefore(box,tabs);else main.prepend(box);box.innerHTML=noticeHtml}
  function openDirectAdmin(){if(!isDirectAdmin())return;const modal=document.querySelector('#loginModal');if(!modal)return;document.querySelector('#associationStatusNotice')?.remove();modal.classList.remove('hidden');const title=modal.querySelector('h2');if(title)title.textContent='🔐 Linares Score — Administración';const p=modal.querySelector('p.muted');if(p)p.textContent='Ingresa con tu cuenta de administrador.';setTimeout(()=>document.querySelector('#email')?.focus(),80)}
  function bind(){const sel=document.querySelector('#pubAssociation');if(sel&&!sel.dataset.preNoticeBound){sel.dataset.preNoticeBound='1';sel.addEventListener('change',()=>{document.querySelector('#associationStatusNotice')?.remove();setTimeout(notice,150)})}}
  const addScript=(src,key)=>{if(document.querySelector(`script[data-${key}]`))return;const s=document.createElement('script');s.src=src;s.dataset[key]='1';document.body.appendChild(s)};

  function addHeadLink(rel,href,extra={}){if(document.querySelector(`link[rel="${rel}"][href="${href}"]`))return;const l=document.createElement('link');l.rel=rel;l.href=href;Object.assign(l,extra);document.head.appendChild(l)}
  function addMeta(name,content){if(document.querySelector(`meta[name="${name}"]`))return;const m=document.createElement('meta');m.name=name;m.content=content;document.head.appendChild(m)}

  let deferredInstallPrompt=null;
  const isStandalone=()=>window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true;
  function ensureInstallButton(){
    if(isStandalone()){document.querySelector('#installAppBtn')?.remove();return}
    const actions=document.querySelector('#publicView .top-actions');
    if(!actions)return;
    let btn=document.querySelector('#installAppBtn');
    if(!btn){
      btn=document.createElement('button');
      btn.id='installAppBtn';
      btn.type='button';
      btn.className='ghost';
      btn.textContent='📲 Instalar app';
      btn.setAttribute('aria-label','Instalar Linares Score');
      const admin=actions.querySelector('#adminLoginBtn');
      if(admin)actions.insertBefore(btn,admin);else actions.appendChild(btn);
    }
    btn.onclick=async()=>{
      if(deferredInstallPrompt){
        try{
          deferredInstallPrompt.prompt();
          await deferredInstallPrompt.userChoice;
        }catch{}
        deferredInstallPrompt=null;
        return;
      }
      const ua=navigator.userAgent||'';
      if(/iphone|ipad|ipod/i.test(ua)){
        alert('En iPhone/iPad: toca Compartir y luego “Agregar a pantalla de inicio”.');
      }else if(/instagram|fban|fbav/i.test(ua)){
        alert('Abre Linares Score en Chrome y luego toca “Instalar app” o “Agregar a pantalla de inicio”.');
      }else{
        alert('Usa el menú del navegador y elige “Instalar app” o “Agregar a pantalla de inicio”.');
      }
    };
  }
  function initInstallButton(){
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;ensureInstallButton()});
    window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;document.querySelector('#installAppBtn')?.remove()});
    ensureInstallButton();
    setTimeout(ensureInstallButton,250);
    setTimeout(ensureInstallButton,800);
    setTimeout(ensureInstallButton,1800);
  }

  function initPwa(){
    addHeadLink('manifest','/manifest.webmanifest');
    addHeadLink('icon','/app-icon.svg?v=3',{type:'image/svg+xml'});
    addHeadLink('apple-touch-icon','/app-icon.svg?v=3');
    addMeta('theme-color','#075f33');addMeta('mobile-web-app-capable','yes');addMeta('apple-mobile-web-app-capable','yes');addMeta('apple-mobile-web-app-status-bar-style','black-translucent');addMeta('apple-mobile-web-app-title','Linares Score');
    if('serviceWorker'in navigator)navigator.serviceWorker.register('/service-worker.js',{scope:'/'}).catch(()=>{});
  }

  const init=()=>{bind();notice();setTimeout(notice,400);setTimeout(notice,1200);openDirectAdmin();setTimeout(openDirectAdmin,350);setTimeout(openDirectAdmin,900);window.addEventListener('fenfur-hidden',notice);const sel=document.querySelector('#pubAssociation');if(sel)new MutationObserver(()=>{bind();setTimeout(notice,40);setTimeout(ensureInstallButton,50)}).observe(sel,{childList:true,subtree:true});addScript('fenfur-cup.js?v=6','fenfur');addScript('fenfur-admin.js?v=3','fenfurAdmin');addScript('villa-alegre-fecha12.js?v=1','villaAlegreFecha12');initPwa();initInstallButton()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
