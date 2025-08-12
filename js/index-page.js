(function(){
  const { i18n } = window.ZETT_UTIL;

  function initCarousel(){
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    let current=0, timer;
    const show=i=>{ slides.forEach((s,k)=>s.classList.toggle('active',k===i)); dots.forEach((d,k)=>d.classList.toggle('active',k===i)); current=i; };
    const next=()=>show((current+1)%slides.length);
    const start=()=>timer=setInterval(next,5000);
    const stop=()=>clearInterval(timer);
    dots.forEach((d,i)=>d.addEventListener('click',()=>{stop();show(i);start();}));
    let sx=0,sy=0; const hero=document.querySelector('.hero');
    hero?.addEventListener('touchstart',e=>{sx=e.touches[0].clientX; sy=e.touches[0].clientY;},{passive:true});
    hero?.addEventListener('touchmove',e=>{const dx=Math.abs(e.touches[0].clientX-sx),dy=Math.abs(e.touches[0].clientY-sy); if(dx>dy) e.preventDefault();},{passive:false});
    hero?.addEventListener('touchend',e=>{const ex=e.changedTouches[0].clientX, dx=sx-ex; if(Math.abs(dx)>50){ stop(); show(dx>0?(current+1)%slides.length:(current-1+slides.length)%slides.length); start(); }},{passive:true});
    start();
  }

  function wireCTAs(){
    const seeAll = document.querySelector('.see-all-button');
    if(seeAll) seeAll.setAttribute('href','catalog.html');

    document.querySelectorAll('.category-tile').forEach(tile=>{
      tile.addEventListener('click',()=>{ const cat=tile.getAttribute('data-category-key'); location.href=`catalog.html?category=${encodeURIComponent(cat)}`; });
    });

    document.querySelectorAll('.product-card').forEach(card=>{
      const key=card.getAttribute('data-product-key');
      card.addEventListener('click',()=>{ location.href=`product.html?key=${encodeURIComponent(key)}`; });
      const btn=card.querySelector('.order-button');
      btn?.addEventListener('click',(e)=>{ e.stopPropagation(); const price=card.getAttribute('data-price')||''; window.showOrderModal(key,price); });
    });

    document.querySelectorAll('button, .cta-button').forEach(b=>{
      b.addEventListener('click',function(){ if(!this.classList.contains('loading')){ this.style.transform='scale(0.95)'; setTimeout(()=>this.style.transform='',150); } });
    });
  }

  function animateIn(){
    const observer=new IntersectionObserver((en)=>{
      en.forEach(entry=>{ if(entry.isIntersecting){ entry.target.style.opacity='1'; entry.target.style.transform='translateY(0)'; } });
    },{threshold:.1, rootMargin:'0px 0px -50px 0px'});
    document.querySelectorAll('.product-card, .category-tile, .service-card').forEach(el=>{
      el.style.opacity='0'; el.style.transform='translateY(30px)'; el.style.transition='opacity .6s ease, transform .6s ease';
      observer.observe(el);
    });
  }

  function applyIndexLanguage(){
    const t=i18n[ZETT.currentLang];
    const heroTitle=document.querySelector('.hero-title'); if(heroTitle) heroTitle.textContent=t.hero.title;
    const heroSubtitle=document.querySelector('.hero-subtitle'); if(heroSubtitle) heroSubtitle.textContent=t.hero.subtitle;
    const heroButton=document.querySelector('.hero .cta-button'); if(heroButton) heroButton.textContent=t.hero.shopNow;

    const catalogTitle=document.querySelector('#catalog .section-title'); if(catalogTitle) catalogTitle.textContent=t.sections.featuredProducts;
    const categoriesTitle=document.querySelector('#categories .section-title'); if(categoriesTitle) categoriesTitle.textContent=t.sections.shopByCategory;
    const serviceTitle=document.querySelector('#service .section-title'); if(serviceTitle) serviceTitle.textContent=t.sections.serviceCenters;
    const seeAllBtn=document.querySelector('.see-all-button'); if(seeAllBtn) seeAllBtn.textContent=t.sections.seeAll;

    document.querySelectorAll('.product-card').forEach(card=>{
      const key=card.getAttribute('data-product-key');
      const nameEl=card.querySelector('.product-name'); if(nameEl) nameEl.textContent=t.products[key]||key;
      const orderBtn=card.querySelector('.order-button'); if(orderBtn) orderBtn.textContent=t.modal.orderNow;
    });

    document.querySelectorAll('.category-tile').forEach(tile=>{
      const k=tile.getAttribute('data-category-key'); const el=tile.querySelector('.category-title'); if(el) el.textContent=t.categories[k]||k;
    });

    // About teaser translations
    const aboutTitle=document.querySelector('.about-title');
    const aboutMission=document.querySelector('.about-mission');
    const aboutButton=document.querySelector('.about-content .cta-button');
    if(aboutTitle) aboutTitle.textContent=t.indexAbout.title;
    if(aboutMission) aboutMission.textContent=t.indexAbout.mission;
    if(aboutButton) aboutButton.textContent=t.indexAbout.cta;
  }
  window.ZETT_LANG_REFRESH = applyIndexLanguage;

  document.addEventListener('DOMContentLoaded', ()=>{
    initCarousel();
    wireCTAs();
    animateIn();
    applyIndexLanguage();
  });
})();
