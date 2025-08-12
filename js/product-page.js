(function(){
  const I18N = window.ZETT_UTIL.i18n;
  const PROD = window.ZETT_PRODUCTS;

  function q(name){ return new URLSearchParams(location.search).get(name); }
  function getProduct(){ const key=q('key')||'laptop'; return PROD.find(p=>p.key===key) || PROD[0]; }

  function render(){
    const lang=ZETT.currentLang;
    const t=I18N[lang];
    const p=getProduct();

    document.title = (t.products[p.key]||p.key) + ' – Zett';
    // hero + card
    document.getElementById('productTitle').textContent = t.products[p.key] || p.key;
    document.getElementById('productTagline').textContent = p.tagline[lang] || '';
    const img=document.getElementById('productImage'); img.src=p.image; img.alt=t.products[p.key]||p.key;
    document.getElementById('cardName').textContent = t.products[p.key] || p.key;
    document.getElementById('cardPrice').textContent = p.price;
    const orderBtn=document.getElementById('orderBtn'); orderBtn.textContent=t.modal.orderNow;
    orderBtn.onclick=()=>window.showOrderModal(p.key, p.price);

    // specs
    document.getElementById('specsTitle').textContent = t.product.specs;
    document.getElementById('backToCatalog').textContent = t.product.back;

    const list=document.getElementById('specList'); list.innerHTML='';
    Object.entries(p.specs).forEach(([k,v])=>{
      const item=document.createElement('div'); item.className='spec-item';
      const keyEl=document.createElement('div'); keyEl.className='spec-key'; keyEl.textContent=t.product.labels[k]||k;
      const valEl=document.createElement('div'); valEl.className='spec-val'; valEl.textContent=v;
      item.appendChild(keyEl); item.appendChild(valEl); list.appendChild(item);
    });
  }
  window.ZETT_LANG_REFRESH = render;

  document.addEventListener('DOMContentLoaded', render);
})();
