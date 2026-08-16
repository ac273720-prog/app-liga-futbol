(()=>{
const $=s=>document.querySelector(s);
const css=document.createElement('style');
css.id='mobile-layout-fix-style';
css.textContent=`
.mobile-qualification{display:none}
@media(max-width:700px){
  body{overflow-x:hidden}
  .top{position:relative!important;display:grid!important;grid-template-columns:1fr!important;gap:10px!important;padding:12px!important}
  .top:before{display:none!important}
  .top h1{font-size:1rem!important;line-height:1.08!important}
  .top-actions{display:grid!important;grid-template-columns:1fr 1fr!important;width:100%!important;gap:8px!important;align-items:end!important}
  .top-choice{grid-column:1/-1!important;width:100%!important;display:grid!important;gap:5px!important}
  .top-choice select{width:100%!important;min-width:0!important}
  .top-actions button{width:100%!important;padding:10px 8px!important;font-size:.84rem!important;white-space:nowrap!important}
  #role.badge{grid-column:1/-1!important;justify-self:start!important;display:inline-flex!important;width:auto!important}
  nav{top:0!important;gap:2px!important;padding:7px!important;scrollbar-width:none}
  nav::-webkit-scrollbar{display:none}
  nav button{padding:9px 10px!important;font-size:.68rem!important;letter-spacing:.035em!important}
  .public-main,main{padding:10px!important}
  .section-title{display:grid!important;grid-template-columns:1fr!important;gap:10px!important;padding:11px!important}
  .section-title:before{justify-self:start}
  .filters{display:grid!important;grid-template-columns:1fr!important;width:100%!important;gap:8px!important}
  .filters label,.filters select{min-width:0!important;width:100%!important}

  .mobile-series-table{min-width:0!important;width:100%!important;table-layout:fixed!important}
  .mobile-series-table .mobile-stat-hide,.mobile-series-table .mobile-situation-hide{display:none!important}
  .mobile-series-table th,.mobile-series-table td{padding:9px 5px!important}
  .mobile-series-table th:nth-child(1),.mobile-series-table td:nth-child(1){width:36px!important}
  .mobile-series-table th:nth-child(2),.mobile-series-table td:nth-child(2){width:auto!important;text-align:left!important}
  .mobile-series-table th:nth-child(9),.mobile-series-table td:nth-child(9){width:48px!important}
  .mobile-series-table th:nth-child(10),.mobile-series-table td:nth-child(10){width:52px!important}
  #pubStandings td[data-qualification],#standings td[data-qualification]{display:none!important}
  #pubStandings td:nth-child(2),#standings td:nth-child(2){font-size:.86rem!important;line-height:1.12!important}
  #pubStandings td:nth-child(10),#standings td:nth-child(10){font-size:.96rem!important;font-weight:950!important}

  .mobile-qualification{display:inline-flex!important;align-items:center!important;max-width:100%!important;margin-top:5px!important;padding:3px 6px!important;border-left:3px solid var(--accent,#ff1f59)!important;background:#f7f7f4!important;color:#071a22!important;font-size:.62rem!important;font-weight:900!important;line-height:1.05!important;white-space:normal!important;border-radius:2px!important}

  #pubGeneralCard,#adminGeneralCard{padding:12px!important;margin-top:16px!important}
  #pubGeneralCard .table,#adminGeneralCard .table{overflow:hidden!important}
  #pubGeneralCard table,#adminGeneralCard table{min-width:0!important;width:100%!important;table-layout:fixed!important}
  #pubGeneralCard th,#pubGeneralCard td,#adminGeneralCard th,#adminGeneralCard td{display:table-cell!important;padding:8px 5px!important;font-size:.72rem!important;white-space:normal!important}
  #pubGeneralCard th:nth-child(1),#pubGeneralCard td:nth-child(1),#adminGeneralCard th:nth-child(1),#adminGeneralCard td:nth-child(1){width:34px!important}
  #pubGeneralCard th:nth-child(3),#pubGeneralCard td:nth-child(3),#adminGeneralCard th:nth-child(3),#adminGeneralCard td:nth-child(3){width:48px!important}
  #pubGeneralCard th:nth-child(4),#pubGeneralCard td:nth-child(4),#adminGeneralCard th:nth-child(4),#adminGeneralCard td:nth-child(4){width:104px!important}
  #pubGeneralCard td[data-qualification] b,#adminGeneralCard td[data-qualification] b{min-width:0!important;padding:4px 5px!important;font-size:.62rem!important;line-height:1.06!important}

  .classification-summary{padding:12px!important}
  .classification-items{gap:5px!important}
  .classification-item{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:8px!important;align-items:center!important;padding:7px 8px!important}
  .classification-item b{font-size:.78rem!important;min-width:0!important}
  .classification-item span:last-child{font-size:.66rem!important;text-align:right!important;max-width:125px!important;line-height:1.05!important}
}
`;
document.head.appendChild(css);

function shortStatus(text){
  const t=String(text||'').trim();
  if(!t||t==='—')return '';
  if(t.includes('Copa Regional'))return '🏆 Copa';
  if(t.includes('Liguilla'))return '⚔️ Liguilla';
  if(t.includes('Campeón general'))return '🏅 Campeón general';
  if(t.includes('Campeón de serie'))return '🏅 Campeón';
  if(t.includes('Descenso'))return '⬇️ Descenso';
  if(t.includes('Ascenso'))return '⬆️ Ascenso';
  if(t.includes('Repechaje'))return '⚠️ Repechaje';
  return t;
}

function fixTable(body){
  if(!body)return;
  const table=body.closest('table');
  if(!table)return;
  table.classList.add('mobile-series-table');
  const head=table.querySelector('thead tr');
  if(head){
    [3,4,5,6,7,8].forEach(n=>head.children[n-1]?.classList.add('mobile-stat-hide'));
    head.querySelector('th[data-qualification]')?.classList.add('mobile-situation-hide');
  }
  [...body.querySelectorAll('tr')].forEach(row=>{
    [3,4,5,6,7,8].forEach(n=>row.children[n-1]?.classList.add('mobile-stat-hide'));
    row.querySelector('td[data-qualification]')?.classList.add('mobile-situation-hide');
    const team=row.children[1],status=row.querySelector('td[data-qualification]');
    if(!team)return;
    let chip=team.querySelector('.mobile-qualification');
    const txt=shortStatus(status?.textContent);
    if(!txt){chip?.remove();return}
    if(!chip){chip=document.createElement('span');chip.className='mobile-qualification';team.appendChild(chip)}
    chip.textContent=txt;
  });
}

function run(){fixTable($('#pubStandings'));fixTable($('#standings'))}
function init(){
  run();
  ['pubStandings','standings'].forEach(id=>{
    const el=$('#'+id);
    if(el&&!el.dataset.mobileFix){
      el.dataset.mobileFix='1';
      new MutationObserver(()=>setTimeout(run,30)).observe(el,{childList:true,subtree:true});
    }
  });
  setInterval(run,700);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,200));else setTimeout(init,200);
})();