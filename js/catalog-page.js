(function(){
  const I18N = window.ZETT_UTIL.i18n;
  const PROD = window.ZETT_PRODUCTS;

  function q(name){ return new URLSearchParams(location.search).get(name); }

  function cardHTML(p, t){
    const title = t.products[p.key] || p.key;
    return `
      <div class="product-card" data-key="${p.key}" data-category="${p.category}">
        <div class="product-image"><img src="${p.image}" alt="${title}"></div>
        <div class="product-info">
          <div class="product-name">${title}</div>
          <div class="product-price">${p.price}</div>
          <button class="order-button">${t.modal.orderNow}</button>
        </div>
      </div>
    `;
  }

  function renderGrid(){
    const t=I18N[ZETT.currentLang];
    const grid=document.getElementById('grid');
    grid.innerHTML = PROD.map(p=>cardHTML(p,t)).join('');
    // interactions
    grid.querySelectorAll('.product-card').forEach(card=>{
      const key=card.getAttribute('data-key');
      card.addEventListener('click',()=>{ location.href=`product.html?key=${encodeURIComponent(key)}`; });
      card.querySelector('.order-button').addEventListener('click',(e)=>{ e.stopPropagation(); const price=PROD.find(x=>x.key===key)?.price||''; window.showOrderModal(key, price); });
    });
  }

  function applyFilter(){
    const cat=q('category'); if(!cat) return;
    const t=I18N[ZETT.currentLang];
    document.getElementById('filterNote').textContent = t.catalog.filtered(t.categories[cat]||cat);
    document.querySelectorAll('.product-card').forEach(c=>{
      c.style.display = (c.getAttribute('data-category')===cat) ? '' : 'none';
    });
  }

  function applyStrings(){
    const t=I18N[ZETT.currentLang];
    document.getElementById('catalogTitle').textContent=t.catalog.title;
    // rename card titles/buttons
    document.querySelectorAll('.product-card').forEach(card=>{
      const key=card.getAttribute('data-key');
      const name=card.querySelector('.product-name'); if(name) name.textContent=t.products[key]||key;
      const btn=card.querySelector('.order-button'); if(btn) btn.textContent=t.modal.orderNow;
    });
    // footer & nav handled by app.js; update filter note
    const cat=q('category');
    const note=document.getElementById('filterNote');
    if(cat) note.textContent=t.catalog.filtered(t.categories[cat]||cat); else note.textContent='';
  }
  window.ZETT_LANG_REFRESH = ()=>{ renderGrid(); applyFilter(); applyStrings(); };

  function animateIn(){
    const obs=new IntersectionObserver((en)=>{ en.forEach(e=>{ if(e.isIntersecting){ e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; } }); },{threshold:.1});
    document.querySelectorAll('.product-card').forEach(el=>{
      el.style.opacity='0'; el.style.transform='translateY(30px)'; el.style.transition='opacity .6s ease, transform .6s ease'; obs.observe(el);
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    renderGrid();
    applyFilter();
    applyStrings();
    animateIn();
  });
})();
