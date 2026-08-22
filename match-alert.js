(()=>{
const LIVE_URL='https://www.youtube.com/live/J1KMr6yV1aI?si=RQJad0IABjG_wvoi';
const EVENT_END='2026-08-22T03:59:59Z';

function hideEmptySeries(){
  document.querySelectorAll('#pubFixtures *,#fixtures *').forEach(el=>{
    if(el.children.length===0 && el.textContent.trim().toLowerCase()==='sin series'){
      el.style.display='none';
    }
  });
}

function renderAlert(){
  if(Date.now()>Date.parse(EVENT_END))return;
  const host=document.querySelector('#publicView .public-main');
  if(!host||document.querySelector('#achibuenoToday'))return;
  const css=`
#achibuenoToday{margin:0 0 18px;overflow:hidden;padding:0;border:1px solid #87151c;border-top:5px solid #d8b04b;background:linear-gradient(135deg,#190608,#4a0c12 58%,#23070a);color:#fff;box-shadow:0 14px 30px rgba(43,3,7,.25)}
.achibueno-inner{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center;padding:20px 22px}
.achibueno-kicker{font-size:.72rem;font-weight:950;letter-spacing:.16em;color:#e2bd57}
.achibueno-title{margin:5px 0 12px;color:#fff;font-size:1.55rem}
.achibueno-details{display:flex;gap:9px;flex-wrap:wrap}
.achibueno-chip{padding:7px 10px;border-radius:999px;background:#3c1014;border:1px solid #6e2a2f;color:#f5dfe0;font-size:.8rem;font-weight:900}
.achibueno-stream{min-width:220px;text-align:center;padding:15px;border-radius:14px;background:#671018;border:1px solid #a53b43}
.achibueno-stream strong{display:block;font-size:1rem}
.achibueno-stream small{display:block;margin-top:6px;color:#f0d5d7;font-weight:800;line-height:1.35}
.achibueno-live{display:inline-block;margin-top:10px;padding:10px 14px;border-radius:10px;background:#e31b23;color:#fff;text-decoration:none;font-weight:950;box-shadow:0 6px 16px rgba(0,0,0,.25)}
@media(max-width:720px){.achibueno-inner{grid-template-columns:1fr;padding:17px}.achibueno-title{font-size:1.28rem}.achibueno-stream{min-width:0;text-align:left}}
`;
  if(!document.querySelector('#achibuenoAlertStyle')){
    const style=document.createElement('style');
    style.id='achibuenoAlertStyle';
    style.textContent=css;
    document.head.appendChild(style);
  }
  const box=document.createElement('section');
  box.id='achibuenoToday';box.className='card';
  box.setAttribute('aria-label','Partido destacado de hoy');
  box.innerHTML=`<div class="achibueno-inner"><div><div class="achibueno-kicker">COPA REGIONAL FENFUR · SENIOR 35</div><h2 class="achibueno-title">⚽ ¡HOY JUEGA UNIÓN ACHIBUENO!</h2><div class="achibueno-details"><span class="achibueno-chip">🆚 Unión 8½ vs Unión Achibueno</span><span class="achibueno-chip">🕣 20:30 hrs</span><span class="achibueno-chip">📍 Estadio San Antonio</span></div></div><div class="achibueno-stream"><strong>📺 Transmisión en vivo por SebitaTV</strong>${LIVE_URL?`<a class="achibueno-live" href="${LIVE_URL}" target="_blank" rel="noopener">🔴 VER TRANSMISIÓN EN VIVO</a>`:'<small>🔴 Linares Score dejará aquí el enlace directo cuando comience el partido.</small>'}</div></div>`;
  const tabs=host.querySelector('.tabs');
  if(tabs)host.insertBefore(box,tabs);else host.prepend(box);
}

function run(){
  hideEmptySeries();
  renderAlert();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
new MutationObserver(()=>setTimeout(run,20)).observe(document.body,{childList:true,subtree:true});
})();