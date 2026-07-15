/*====================================================
promos-carousel.js - MEDIO URBANO V3
Lee promociones activas de Firestore y renderiza
carrusel dentro de la sección existente #promociones
=====================================================*/

(function(){
  const AUTO_INTERVAL=5000;
  let current=0,timer=null,touchX=0;

  const BRAND_SCROLL_MAP={
    "burgers":"marcas",
    "cocina":"marcas",
    "pasta":"marcas",
    "salad":"marcas"
  };

  function scrollToBrand(marca){
    if(!marca) return;
    const key=marca.toLowerCase();
    if(BRAND_SCROLL_MAP[key]){
      const el=document.getElementById(BRAND_SCROLL_MAP[key]);
      if(el){
        el.scrollIntoView({behavior:"smooth",block:"start"});
        setTimeout(()=>{
          const cards=document.querySelectorAll(".brand");
          cards.forEach(c=>{
            if(c.dataset.categoria===key){
              c.style.boxShadow="0 0 30px rgba(255,208,40,.5)";
              setTimeout(()=>{c.style.boxShadow="";},2000);
            }
          });
        },600);
      }
    }
  }

  function render(slides){
    const section=document.querySelector(".promotions");
    const container=section.querySelector(".container");
    if(!section||!container) return;

    if(!slides.length){
      section.classList.add("no-promos");
      return;
    }
    section.classList.remove("no-promos");

    let wrapper=container.querySelector(".promos-carousel-wrapper");
    if(wrapper) wrapper.remove();

    wrapper=document.createElement("div");
    wrapper.className="promos-carousel-wrapper"+(slides.length===1?" single":"");

    const track=document.createElement("div");
    track.className="carousel-track";

    slides.forEach((p,i)=>{
      const slide=document.createElement("div");
      slide.className="carousel-slide";
      slide.innerHTML=`
        <div class="slide-bg" style="background-image:url('${p.imagen||''}')"></div>
        <div class="slide-overlay"></div>
        <div class="slide-content">
          <span class="slide-marca">${p.marca||"MEDIO URBANO"}</span>
          <h2 class="slide-title">${p.titulo}</h2>
          <p class="slide-desc">${p.descripcion||""}</p>
          ${p.precio?`<div class="slide-price">${p.precio}</div>`:""}
          <span class="slide-btn">${p.boton||"Ver Menú"}</span>
        </div>
      `;
      slide.addEventListener("click",()=>{
        if(p.url&&p.url!=="#"){
          window.open(p.url,"_blank");
        }else if(p.marca){
          scrollToBrand(p.marca);
        }
      });
      track.appendChild(slide);
    });

    wrapper.appendChild(track);

    if(slides.length>1){
      const prev=document.createElement("button");
      prev.type="button";prev.className="c-arrow prev";
      prev.innerHTML='<i class="fas fa-chevron-left"></i>';
      prev.addEventListener("click",e=>{e.stopPropagation();go(current-1);resetTimer();});

      const next=document.createElement("button");
      next.type="button";next.className="c-arrow next";
      next.innerHTML='<i class="fas fa-chevron-right"></i>';
      next.addEventListener("click",e=>{e.stopPropagation();go(current+1);resetTimer();});

      const dots=document.createElement("div");
      dots.className="c-dots";
      slides.forEach((_,i)=>{
        const dot=document.createElement("button");
        dot.type="button";dot.className="c-dot"+(i===0?" active":"");
        dot.addEventListener("click",e=>{e.stopPropagation();go(i);resetTimer();});
        dots.appendChild(dot);
      });

      wrapper.appendChild(prev);
      wrapper.appendChild(next);
      wrapper.appendChild(dots);
    }

    container.appendChild(wrapper);

    function go(n){
      const total=slides.length;
      current=((n%total)+total)%total;
      track.style.transform="translateX(-"+(current*100)+"%)";
      const allDots=wrapper.querySelectorAll(".c-dot");
      allDots.forEach((d,i)=>d.classList.toggle("active",i===current));
    }

    function startTimer(){
      stopTimer();
      if(slides.length>1) timer=setInterval(()=>go(current+1),AUTO_INTERVAL);
    }
    function stopTimer(){clearInterval(timer);}
    function resetTimer(){stopTimer();startTimer();}

    wrapper.addEventListener("mouseenter",stopTimer);
    wrapper.addEventListener("mouseleave",startTimer);

    wrapper.addEventListener("touchstart",e=>{touchX=e.changedTouches[0].screenX;},{passive:true});
    wrapper.addEventListener("touchend",e=>{
      const diff=touchX-e.changedTouches[0].screenX;
      if(Math.abs(diff)>50){diff>0?go(current+1):go(current-1);resetTimer();}
    },{passive:true});

    startTimer();
  }

  function loadFromFirestore(){
    if(typeof firebase==="undefined"||!firebase.firestore){
      console.warn("Firebase no disponible para carrusel");
      return;
    }
    firebase.firestore().collection("promociones")
      .where("activo","==",true)
      .orderBy("orden","asc")
      .get()
      .then(snap=>{
        const slides=[];
        snap.forEach(doc=>{
          const d=doc.data();
          slides.push({
            id:doc.id,titulo:d.titulo||"",
            descripcion:d.descripcion||"",precio:d.precio||"",
            imagen:d.imagen||"",marca:d.marca||"MEDIO URBANO",
            boton:d.boton||"Ver Menú",url:d.url||"#",
            orden:d.orden||0
          });
        });
        render(slides);
      })
      .catch(err=>{
        console.warn("Error loading promos:",err);
      });
  }

  document.addEventListener("DOMContentLoaded",()=>{
    setTimeout(loadFromFirestore,1000);
  });

  window.reloadPromosCarousel=loadFromFirestore;
})();
