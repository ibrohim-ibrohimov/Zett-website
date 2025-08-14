/* Shared helpers + header/footer + language persistence + modal */
(function(){
  const I18N = window.ZETT_I18N;
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
  const on = (el, ev, fn, opt)=>el && el.addEventListener(ev, fn, opt);
  const getLang = ()=> localStorage.getItem('zett_lang') || 'uz';
  const setLang = (l)=> localStorage.setItem('zett_lang', l);

  // Google Apps Script Web App endpoint (paste your /exec URL)
  const SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwyv9CMfTvFC4vLhZznybLkNx6z418pB_N9MYqY2WNQ9rsFIaF9KzlZHtEM3-m1v2sX/exec';

  window.ZETT = { currentLang: getLang() };

  function wireBackArrows(){
  document.querySelectorAll('.back-arrow').forEach(el=>{
    el.addEventListener('click', (e)=>{
      e.preventDefault();
      // prefer history if available, else fallback URL
      if (history.length > 1) { history.back(); }
      else {
        const to = el.getAttribute('data-fallback') || 'index.html#home';
        location.href = to;
        }
      }, {passive:false});
    });
  }


  function initHeader(){
    const header = $('#header');
    const hamburger = $('#hamburger');
    const navMenu = $('#navMenu');
    const isIndex = location.pathname.endsWith('index.html') || location.pathname === '/';

    document.documentElement.lang = ZETT.currentLang;

    on(window, 'scroll', ()=>{ if(window.scrollY>100) header?.classList.add('scrolled'); else header?.classList.remove('scrolled'); });

    const toggleMenu = (forceOpen) => {
      if(!hamburger || !navMenu) return;
      const willOpen = typeof forceOpen === 'boolean' ? forceOpen : !navMenu.classList.contains('active');
      hamburger.classList.toggle('active', willOpen);
      navMenu.classList.toggle('active', willOpen);
      document.body.style.overflow = willOpen ? 'hidden' : '';
    };

    // Guard against double-fire (pointerup + click on mobile)
    let lastPointerToggle = 0;

    if (hamburger) {
      on(hamburger,'pointerup', (e)=>{
        e.preventDefault(); e.stopPropagation();
        lastPointerToggle = Date.now();
        toggleMenu();
      }, {passive:false});

      on(hamburger,'click', (e)=>{
        if(Date.now() - lastPointerToggle < 350){ e.preventDefault(); e.stopPropagation(); return; }
        e.preventDefault(); e.stopPropagation();
        toggleMenu();
      });

      on(hamburger,'keydown', (e)=>{
        if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggleMenu(); }
      });
    }

    on(document,'click',(e)=>{
      if(navMenu && !navMenu.contains(e.target) && !hamburger?.contains(e.target)){
        toggleMenu(false);
      }
    });

    // Wire header nav links: smooth-scroll on index, normal nav elsewhere
    function wireNavLinks(){
      const anchors = $$('#navMenu a');
      anchors.forEach(a=>{
        a.addEventListener('click', function(ev){
          const href = this.getAttribute('href') || '';
          const m = href.match(/#(home|catalog|categories|about|service)$/i);
          if (isIndex && m){
            ev.preventDefault();
            toggleMenu(false);
            const id = m[1];
            const t = document.getElementById(id);
            if(t){
              const headerH = header ? header.offsetHeight : 0;
              window.scrollTo({ top: t.offsetTop - headerH, behavior: 'smooth' });
              history.pushState(null, '', '#'+id);
            }
          }else{
            // going to index.html#... from another page; close and let browser navigate
            toggleMenu(false);
          }
        }, {passive:false});
      });
    }
    wireNavLinks();

    // Smooth-scroll for other in-page anchors on index (e.g., "Shop Now" button)
    if (isIndex) {
      $$('a[href^="#"]').forEach(a=>{
        on(a,'click',function(e){
          const id=this.getAttribute('href');
          // Skip header links (already handled above)
          if (!id || !/^#/.test(id)) return;
          const target=document.querySelector(id);
          if(target){
            e.preventDefault();
            const headerH=header?.offsetHeight||0;
            window.scrollTo({ top: target.offsetTop - headerH, behavior:'smooth' });
            history.pushState(null, '', id);
          }
        }, {passive:false});
      });
    }
  }

  function initLangSwitcher(){
    const switcher = $('#langSwitcher');
    if(!switcher) return;

    const current = switcher.querySelector('.lang-flag');
    const optsContainer = switcher.querySelector('.lang-options');

    const FLAG = { uz:'🇺🇿', en:'🇬🇧', ru:'🇷🇺' };
    const ORDER = ['uz','en','ru'];

    function renderOptions(){
      if(!optsContainer) return;
      optsContainer.innerHTML = ORDER.map(l =>
        `<span class="lang-flag${l===ZETT.currentLang?' active':''}" data-lang="${l}">${FLAG[l]}</span>`
      ).join('');
      optsContainer.querySelectorAll('.lang-flag').forEach(flag=>{
        flag.addEventListener('click',(e)=>{
          e.stopPropagation();
          const newLang = flag.dataset.lang;
          if(!newLang || newLang===ZETT.currentLang) { switcher.classList.remove('open'); return; }
          ZETT.currentLang = newLang;
          setLang(newLang);
          setEmojiFor(newLang);
          applyCommonLanguage();
          document.documentElement.lang = newLang;
          window.ZETT_LANG_REFRESH && window.ZETT_LANG_REFRESH(newLang);
          renderOptions();
          switcher.classList.remove('open');
        });
      });
    }

    function setEmojiFor(lang){
      if(current){ current.dataset.lang = lang; current.textContent = FLAG[lang] || '🇺🇿'; }
    }

    setEmojiFor(ZETT.currentLang);
    renderOptions();

    on(current,'click',(e)=>{ e.stopPropagation(); switcher.classList.toggle('open'); });
    on(document,'click',()=>switcher.classList.remove('open'));
  }

  function applyCommonLanguage(){
    const t = I18N[ZETT.currentLang];
    if(!t) return;

    const nav = $$('#navMenu a');
    if(nav.length>=5){
      nav[0].textContent=t.nav.home;
      nav[1].textContent=t.nav.catalog;
      nav[2].textContent=t.nav.categories;
      nav[3].textContent=t.nav.about;
      nav[4].textContent=t.nav.service;

      // Ensure links point to index sections; on index use in-page hashes for smooth-scroll
      const isIndex = location.pathname.endsWith('index.html') || location.pathname === '/';
      const setHref = (el, hash)=> el && el.setAttribute('href', isIndex ? hash : 'index.html'+hash);
      setHref(nav[0], '#home');
      setHref(nav[1], '#catalog');
      setHref(nav[2], '#categories');
      setHref(nav[3], '#about');
      setHref(nav[4], '#service');
    }

    const footHeads = $$('.footer-section h3');
    if(footHeads.length>=3){
      footHeads[0].textContent=t.footer.contact;
      footHeads[1].textContent=t.footer.about;
      footHeads[2].textContent=t.footer.follow;
    }
    const aboutLink = $('.about-brand-link'); if(aboutLink) aboutLink.textContent=t.footer.learn;
    const rights = $('.footer-bottom p'); if(rights) rights.innerHTML=`&copy; 2025 Zett. ${t.footer.rights}.`;

    const lN=$('#labelCustomerName'), lP=$('#labelCustomerPhone'), bS=$('#btnSubmitOrder'), bC=$('#btnCancel');
    if(lN) lN.textContent=t.modal.name;
    if(lP) lP.textContent=t.modal.phone;
    if(bS) bS.textContent=t.modal.submit;
    if(bC) bC.textContent=t.modal.cancel;
  }

  function attachPhoneMask(){
    const phone = $('#customerPhone');
    if(!phone) return;
    on(phone,'input',(e)=>{
      let v=e.target.value.replace(/\D/g,'');
      if(!v.startsWith('998')) v='998'+v.replace(/^998/,'');
      if(v.length>12) v=v.slice(0,12);
      let f='+998';
      if(v.length>3) f+=' '+v.slice(3,5);
      if(v.length>5) f+=' '+v.slice(5,8);
      if(v.length>8) f+=' '+v.slice(8,10);
      if(v.length>10) f+=' '+v.slice(10,12);
      e.target.value=f;
    });
  }

  function showOrderModal(productKey, price){
    const t = ZETT_I18N[ZETT.currentLang];
    const modal = document.getElementById('orderModal');
    const title = document.getElementById('modalTitle');
    const form  = document.getElementById('orderForm');

    if (form) {
      form.dataset.productKey  = productKey || '';
      form.dataset.price       = price || '';
      form.dataset.productName = (t.products && t.products[productKey]) ? t.products[productKey] : productKey;
      form.dataset.page        = (location.pathname.replace(/^\//,'') || 'index.html') + (location.hash || '');
    }

    if (title) {
      const pName = (t.products && t.products[productKey]) ? t.products[productKey] : productKey;
      title.textContent = `${t.modal.orderPrefix} ${pName} - ${price}`;
    }

    if (modal){ modal.style.display='flex'; modal.classList.add('active'); document.body.style.overflow='hidden'; }
  }
  window.showOrderModal = showOrderModal;

  function closeModal(){
    const modal=$('#orderModal'); const form=$('#orderForm'); const phone=$('#customerPhone');
    if(modal){ modal.style.display='none'; modal.classList.remove('active'); document.body.style.overflow=''; }
    if(form) form.reset(); if(phone) phone.value='+998';
  }
  window.closeModal = closeModal;

  function initModalForm(){
    const form = $('#orderForm');
    if(!form) return;

    attachPhoneMask();

    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const t = ZETT_I18N[ZETT.currentLang];
      const name  = document.getElementById('customerName')?.value?.trim();
      const phone = document.getElementById('customerPhone')?.value?.trim();

      if(!(name && phone && phone.length>=13)){
        alert(t.modal.fix);
        return;
      }

      const btn = document.getElementById('btnSubmitOrder');
      if(btn){ btn.classList.add('loading'); btn.textContent = t.modal.submit + '...'; }

      // Build as URL-encoded instead of FormData (Apps Script parses this best)
      const payload = new URLSearchParams({
        productKey:   form.dataset.productKey  || '',
        productName:  form.dataset.productName || '',
        price:        form.dataset.price       || '',
        customerName: name,
        customerPhone: phone,
        lang:         ZETT.currentLang,
        page:         form.dataset.page || ''
      });

      // CORS-first, then no-cors fallback
      let submitted = false;
      try {
        const res = await fetch(SHEETS_ENDPOINT, {
          method: 'POST',
          body: payload,
          credentials: 'omit'  // fewer CORS complications
        });
        if (res.ok) {
          submitted = true;
          try { await res.json(); } catch(_) {}
        } else if (res.status === 401) {
          alert(
            ZETT.currentLang==='ru' ? 'Веб-приложение Google не публично (401). В Apps Script установите Доступ: Для всех и Выполнять как: Я, затем разверните повторно.' :
            ZETT.currentLang==='uz' ? 'Google veb-ilovasi hammaga ochiq emas (401). Apps Script’da “Access: Anyone” va “Execute as: Me” qilib qayta joylang.' :
            'Google Web App is not public (401). In Apps Script set “Who has access: Anyone” and “Execute as: Me”, then redeploy.'
          );
        } else {
          await fetch(SHEETS_ENDPOINT, { method: 'POST', body: payload, mode: 'no-cors', credentials: 'omit' });
          submitted = true;
        }
      } catch (err) {
        try {
          await fetch(SHEETS_ENDPOINT, { method: 'POST', body: payload, mode: 'no-cors', credentials: 'omit' });
          submitted = true;
        } catch (e2) {
          console.error('Both CORS and no-cors failed:', e2);
        }
      }

      if (submitted) {
        alert('✅ ' + t.modal.success);
        closeModal();
      } else {
        alert('⚠️ ' + (ZETT.currentLang==='ru' ? 'Отправка не удалась.' :
                       ZETT.currentLang==='uz' ? 'Yuborib bo‘lmadi.' : 'Failed to submit.'));
      }



      if(btn){ btn.classList.remove('loading'); btn.textContent = t.modal.submit; }
    });

    // close on backdrop click
    on($('#orderModal'),'click',(e)=>{ if(e.target===e.currentTarget) closeModal(); });
  }

  // HARD WALL: prevent any delegated product-card handlers from catching clicks inside the Service section
  function guardServiceSection(){
    const service = document.getElementById('service');
    if(!service) return;

    document.addEventListener('click', (e)=>{
      if(service.contains(e.target)){
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
        e.stopPropagation();
      }
    }, true);

    document.addEventListener('pointerup', (e)=>{
      if(service.contains(e.target)){
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
        e.stopPropagation();
      }
    }, true);

    service.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', (e)=>{
        e.stopPropagation(); // let browser navigate
      }, {capture:true});
    });
  }

  window.ZETT_UTIL = {
    i18n: I18N,
    getLang, setLang,
    applyCommonLanguage,
    productName:(key)=>I18N[ZETT.currentLang].products?.[key]||key
  };

  document.addEventListener('DOMContentLoaded', ()=>{
    initHeader();
    initLangSwitcher();
    applyCommonLanguage();
    initModalForm();
    guardServiceSection();
    wireBackArrows();
  });
})();
