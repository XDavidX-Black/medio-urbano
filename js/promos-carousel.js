/*====================================================
promos-carousel.js - MEDIO URBANO V3
Lee promociones de Firestore y renderiza carrusel
=====================================================*/

(function(){
  const CAROUSEL_INTERVAL=5000;
  let currentSlide=0;
  let autoplayTimer=null;
  let touchStartX=0;
  let touchEndX=0;

  function initCarousel(){
    const container=document.getElementById("promosCarousel");
    if(!container) return;

    const track=container.querySelector(".carousel-track");
    const dotsWrap=container.querySelector(".carousel-dots");
    const prevBtn=container.querySelector(".carousel-arrow.prev");
    const nextBtn=container.querySelector(".carousel-arrow.next");

    let slides=[];
    try{
      slides=JSON.parse(container.dataset.slides||"[]");
    }catch(e){slides=[];}

    if(!slides.length){
      container.classList.add("hidden");
      return;
    }

    container.classList.remove("hidden");

    track.innerHTML="";
    dotsWrap.innerHTML="";

    slides.forEach((promo,i)=>{
      const slide=document.createElement("div");
      slide.className="carousel-slide";
      slide.innerHTML=`
        <div class="promo-slide-bg" style="background-image:url('${promo.imagen}')"></div>
        <div class="promo-slide-overlay"></div>
        <div class="promo-slide-content">
          <span class="promo-marca">${promo.marca||"MEDIO URBANO"}</span>
          <h2 class="promo-slide-title">${promo.titulo}</h2>
          <p class="promo-slide-desc">${promo.descripcion||""}</p>
          ${promo.precio?`<div class="promo-slide-price">$${promo.precio}</div>`:""}
          <a href="${promo.url||'#'}" class="promo-slide-btn">${promo.boton||"Ver Menú"}</a>
        </div>
      `;
      track.appendChild(slide);

      const dot=document.createElement("button");
      dot.className="carousel-dot"+(i===0?" active":"");
      dot.setAttribute("aria-label","Slide "+(i+1));
      dot.addEventListener("click",()=>goToSlide(i));
      dotsWrap.appendChild(dot);
    });

    function goToSlide(n){
      const total=slides.length;
      currentSlide=((n%total)+total)%total;
      track.style.transform="translateX(-"+(currentSlide*100)+"%)";
      dotsWrap.querySelectorAll(".carousel-dot").forEach((d,i)=>{
        d.classList.toggle("active",i===currentSlide);
      });
    }

    function nextSlide(){goToSlide(currentSlide+1);}
    function prevSlide(){goToSlide(currentSlide-1);}

    prevBtn.addEventListener("click",()=>{prevSlide();resetAutoplay();});
    nextBtn.addEventListener("click",()=>{nextSlide();resetAutoplay();});

    function startAutoplay(){
      stopAutoplay();
      autoplayTimer=setInterval(nextSlide,CAROUSEL_INTERVAL);
    }
    function stopAutoplay(){clearInterval(autoplayTimer);}
    function resetAutoplay(){stopAutoplay();startAutoplay();}

    container.addEventListener("mouseenter",stopAutoplay);
    container.addEventListener("mouseleave",startAutoplay);

    /* TOUCH SWIPE */
    container.addEventListener("touchstart",e=>{
      touchStartX=e.changedTouches[0].screenX;
    },{passive:true});
    container.addEventListener("touchend",e=>{
      touchEndX=e.changedTouches[0].screenX;
      const diff=touchStartX-touchEndX;
      if(Math.abs(diff)>50){
        diff>0?nextSlide():prevSlide();
        resetAutoplay();
      }
    },{passive:true});

    startAutoplay();
  }

  /* LOAD FROM FIRESTORE */
  function loadPromosFromFirestore(){
    if(typeof firebase==="undefined"||!firebase.firestore) return;

    firebase.firestore().collection("promociones")
      .where("activo","==",true)
      .orderBy("orden","asc")
      .get()
      .then(snap=>{
        const slides=[];
        snap.forEach(doc=>{
          const d=doc.data();
          slides.push({
            id:doc.id,
            titulo:d.titulo||"",
            descripcion:d.descripcion||"",
            precio:d.precio||"",
            imagen:d.imagen||"",
            marca:d.marca||"MEDIO URBANO",
            boton:d.boton||"Ver Menú",
            url:d.url||"#",
            orden:d.orden||0,
            activo:d.activo!==false
          });
        });

        const container=document.getElementById("promosCarousel");
        if(container){
          container.dataset.slides=JSON.stringify(slides);
          initCarousel();
        }
      })
      .catch(err=>{
        console.warn("Error loading promos from Firestore:",err);
      });
  }

  document.addEventListener("DOMContentLoaded",()=>{
    setTimeout(loadPromosFromFirestore,800);
  });

  window.reloadPromosCarousel=loadPromosFromFirestore;
})();
