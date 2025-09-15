(function(){
  const I18N = window.ZETT_UTIL.i18n;
  const PROD = window.ZETT_PRODUCTS;

  function q(name){ return new URLSearchParams(location.search).get(name); }
  function getProduct(){ const key=q('key')||'laptop'; return PROD.find(p=>p.key===key) || PROD[0]; }

  
  // Build a swipeable + auto-advancing gallery
  function initProductGallery(images, altBase, intervalMs=3000){
    const track = document.getElementById('productTrack');
    const dotsC = document.getElementById('productDots');
    if(!track || !dotsC) return;

    track.innerHTML = ''; dotsC.innerHTML='';

    const slides = images.map((src, i)=>{
      const slide = document.createElement('div');
      slide.className = 'product-slide';
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = (altBase||'Product') + ' ' + (i+1);
      img.src = src;
      slide.appendChild(img);
      track.appendChild(slide);
      const dot = document.createElement('div');
      dot.className = 'product-dot';
      dotsC.appendChild(dot);
      return {slide, dot};
    });

    let idx = 0, timer=null, paused=false;
    const goTo = (n, smooth=true)=>{
      idx = (n+slides.length)%slides.length;
      const el = slides[idx].slide;
      slides.forEach((s,j)=> s.dot.classList.toggle('active', j===idx));
      const left = el.offsetLeft;
      track.scrollTo({left, behavior: smooth?'smooth':'auto'});
    };
    const start = ()=>{
      stop();
      if(slides.length<=1) return;
      timer = setInterval(()=>{ if(!paused) goTo(idx+1); }, intervalMs);
    };
    const stop = ()=>{ if(timer){ clearInterval(timer); timer=null; } };

    // Update idx on manual scroll (throttled)
    let rafId = 0;
    track.addEventListener('scroll', ()=>{
      if(rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(()=>{
        const sc = track.scrollLeft + track.clientWidth/2;
        let nearest = 0, min=Infinity;
        slides.forEach((s,i)=>{
          const d = Math.abs(sc - (s.slide.offsetLeft + s.slide.clientWidth/2));
          if(d<min){min=d; nearest=i;}
        });
        if(nearest!==idx){ idx=nearest; slides.forEach((s,j)=> s.dot.classList.toggle('active', j===idx)); }
      });
    });

    // Pause on interaction; resume after
    const pause = ()=>{ paused=true; };
    const resume = ()=>{ paused=false; };
    ['pointerdown','touchstart','mouseenter','focusin'].forEach(ev=> track.addEventListener(ev, pause));
    ['pointerup','touchend','mouseleave','focusout'].forEach(ev=> track.addEventListener(ev, resume));

    // Click dots to jump
    dotsC.addEventListener('click', (e)=>{
      const i = Array.from(dotsC.children).indexOf(e.target);
      if(i>=0){ goTo(i); }
    });

    // Desktop: translate vertical wheel to horizontal scroll
    track.addEventListener('wheel', (e)=>{
      if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
        e.preventDefault();
        track.scrollLeft += e.deltaY;
      }
    }, {passive:false});

    // Initialize
    goTo(0,false);
    start();

    // Expose controls if needed later
    return { next:()=>goTo(idx+1), prev:()=>goTo(idx-1), start, stop };
  }
function render(){
    const lang=ZETT.currentLang;
    const t=I18N[lang];
    const p=getProduct();

    document.title = (t.products[p.key]||p.key) + ' – Zett';
    // hero + card
    document.getElementById('productTitle').textContent = t.products[p.key] || p.key;
    document.getElementById('productTagline').textContent = p.tagline[lang] || '';
    const gal = document.getElementById('productGallery');
    const itv = gal && gal.dataset && parseInt(gal.dataset.interval||'3000',10);
    initProductGallery((Array.isArray(p.images)&&p.images.length?p.images:[p.image]), t.products[p.key]||p.key, isNaN(itv)?3000:itv);
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
