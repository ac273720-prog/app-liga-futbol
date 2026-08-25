(()=>{
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const pretty=name=>{
  const n=norm(name);
  if(n.includes('precordillera')) return 'PRECORDILLERA · LINARES';
  if(n.includes('fenfur')) return '🏆 FENFUR · COPA REGIONAL';
  if(n.includes('victor zavala')) return 'VÍCTOR ZAVALA · LINARES';
  if(n.includes('afal')) return 'AFAL · LINARES';
  if(n.includes('afacon')) return 'AFACON · COLBÚN';
  if(n.includes('yerbas buenas')) return 'YERBAS BUENAS';
  if(n.includes('villa alegre')) return 'ASOCIACIÓN VILLA ALEGRE';
  return String(name||'').replace(/^asociaci[oó]n\s+/i,'').replace(/^soc\.\s*/i,'').trim().toUpperCase();
};
function style(){
  if(document.querySelector('#associationSelectorPolish'))return;
  const st=document.createElement('style');st.id='associationSelectorPolish';st.textContent=`
  .top-choice{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif!important;font-size:.68rem!important;font-weight:800!important;letter-spacing:.12em!important;text-transform:uppercase!important;color:#dce8df!important}
  .top-choice select{appearance:auto!important;min-width:245px!important;min-height:42px!important;padding:9px 38px 9px 13px!important;border:1px solid rgba(255,255,255,.22)!important;border-radius:10px!important;background:#102f20!important;color:#f7fbf8!important;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif!important;font-size:.83rem!important;font-weight:800!important;letter-spacing:.025em!important;text-transform:none!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 4px 12px rgba(0,0,0,.16)!important}
  .top-choice select:focus{outline:2px solid rgba(210,173,58,.55)!important;outline-offset:2px!important;border-color:#d2ad3a!important}
  .top-choice select option{background:#102f20!important;color:#fff!important;font-weight:700!important;font-size:.9rem!important}
  @media(max-width:560px){.top-choice{gap:5px!important}.top-choice select{min-width:0!important;width:100%!important;font-size:.78rem!important}}
  `;document.head.appendChild(st);
}
function polishSelect(sel){
  if(!sel)return;
  [...sel.options].forEach(o=>{if(!o.dataset.originalLabel)o.dataset.originalLabel=o.textContent;o.textContent=pretty(o.dataset.originalLabel)});
}
function run(){style();polishSelect(document.querySelector('#pubAssociation'));polishSelect(document.querySelector('#ownerAssociation'))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
const obs=new MutationObserver(()=>run());obs.observe(document.documentElement,{childList:true,subtree:true});
})();