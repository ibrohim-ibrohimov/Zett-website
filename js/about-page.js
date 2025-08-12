(function(){
  const { i18n } = window.ZETT_UTIL;

  function renderAbout(){
    const t=i18n[ZETT.currentLang]?.about;
    if(!t) return;
    const h1=document.getElementById('aboutHeroTitle');
    const tag=document.getElementById('aboutHeroTagline');
    const content=document.getElementById('aboutContent');
    if(h1) h1.textContent=t.heroTitle;
    if(tag) tag.textContent=t.heroTag;
    if(content){ content.innerHTML = t.bodyHTML; }
  }
  window.ZETT_LANG_REFRESH = renderAbout;

  document.addEventListener('DOMContentLoaded', renderAbout);
})();
