(()=>{
  const fix=()=>{
    ['#pubStandings','#standings'].forEach(sel=>{
      document.querySelectorAll(sel+' td').forEach(td=>{
        if(td.textContent.trim()==='null') td.textContent='—';
      });
    });
  };
  new MutationObserver(fix).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  setInterval(fix,800);
  fix();
})();
