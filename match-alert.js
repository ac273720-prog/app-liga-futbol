(()=>{
let installPrompt=null;
let fenfurRows=null;
let fenfurLoading=false;

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
function findInstallButtons(){
  return [...document.querySelectorAll('button,a')].filter(el=>/instalar\s*(la\s*)?app|descargar\s*(la\s*)?app/i.test((el.textContent||'').trim()));
}
function findInstallButton(){return findInstallButtons()[0]||null}
function ensureInstallButton(){
  let buttons=findInstallButtons();
  if(buttons.length>1){
    buttons.slice(1).forEach(el=>el.remove());
    buttons=buttons.slice(0,1);
  }
  let btn=buttons[0]||null;
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
  btn.style.display='';
  btn.onclick=async e=>{
    e.preventDefault();
    if(isStandalone()){
      alert('Linares Score ya está instalada en este dispositivo.');
      return;
    }
    if(installPrompt){
      const p=installPrompt;
      installPrompt=null;
      await p.prompt();
      try{await p.userChoice}catch(_){ }
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
  ensureInstallButton();
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

function cleanName(s){
  return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}

async function ensureFenfurRows(){
  if(fenfurRows||fenfurLoading||typeof sb==='undefined')return;
  fenfurLoading=true;
  try{
    const {data,error}=await sb.from('fenfur_ties').select('id,category,home_team,away_team,first_leg_home_goals,first_leg_away_goals,second_leg_home_goals,second_leg_away_goals,status');
    if(!error)fenfurRows=data||[];
  }catch(_){ }
  fenfurLoading=false;
}

async function showFenfurScores(){
  const cards=[...document.querySelectorAll('#fenfurGrid .fenfur-tie')];
  if(!cards.length)return;
  await ensureFenfurRows();
  if(!fenfurRows)return;
  for(const card of cards){
    const teams=[...card.querySelectorAll('.fenfur-team span')].map(x=>cleanName(x.childNodes[0]?.textContent||x.textContent));
    if(teams.length<2)continue;
    const row=fenfurRows.find(r=>cleanName(r.home_team)===teams[0]&&cleanName(r.away_team)===teams[1]);
    if(!row)continue;
    let box=card.querySelector('[data-fenfur-score]');
    const parts=[];
    if(row.first_leg_home_goals!==null&&row.first_leg_home_goals!==undefined&&row.first_leg_away_goals!==null&&row.first_leg_away_goals!==undefined){
      parts.push(`IDA · ${row.home_team} ${row.first_leg_home_goals}-${row.first_leg_away_goals} ${row.away_team}`);
    }
    if(row.second_leg_home_goals!==null&&row.second_leg_home_goals!==undefined&&row.second_leg_away_goals!==null&&row.second_leg_away_goals!==undefined){
      parts.push(`VUELTA · ${row.home_team} ${row.second_leg_home_goals}-${row.second_leg_away_goals} ${row.away_team}`);
    }
    if(!parts.length){box?.remove();continue;}
    if(!box){
      box=document.createElement('div');
      box.dataset.fenfurScore='1';
      box.style.cssText='margin-top:10px;padding:10px 11px;border-radius:10px;background:#5a1117;border:1px solid #d5ae42;color:#fff;font-weight:950;text-align:center';
      card.appendChild(box);
    }
    box.innerHTML=`🏁 ${parts.join('<br>')}`;
  }
}

function run(){
  removeFinishedMatchAlert();
  hideEmptySeries();
  ensureInstallButton();
  showFenfurScores();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setupPwa();run()});else{setupPwa();run()}
new MutationObserver(()=>setTimeout(run,30)).observe(document.body,{childList:true,subtree:true});
})();