/*====================================================
lazyload.js - MEDIO URBANO V3 - Carga Diferida
====================================================*/

// IMAGENES
const lazyImages=document.querySelectorAll("img[data-src]");
const imageObserver=new IntersectionObserver((entries,observer)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const img=entry.target;
      img.src=img.dataset.src;
      img.onload=()=>{img.classList.add("loaded");};
      observer.unobserve(img);
    }
  });
},{rootMargin:"150px"});
lazyImages.forEach(img=>{imageObserver.observe(img);});

// BACKGROUNDS
const lazyBackgrounds=document.querySelectorAll("[data-bg]");
const backgroundObserver=new IntersectionObserver((entries,observer)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const el=entry.target;
      el.style.backgroundImage=`url(${el.dataset.bg})`;
      el.classList.add("bg-loaded");
      observer.unobserve(el);
    }
  });
},{rootMargin:"200px"});
lazyBackgrounds.forEach(item=>{backgroundObserver.observe(item);});

// IFRAMES
const lazyIframes=document.querySelectorAll("iframe[data-src]");
const iframeObserver=new IntersectionObserver((entries,observer)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const iframe=entry.target;
      iframe.src=iframe.dataset.src;
      observer.unobserve(iframe);
    }
  });
});
lazyIframes.forEach(frame=>{iframeObserver.observe(frame);});

// VIDEOS
const lazyVideos=document.querySelectorAll("video[data-src]");
const videoObserver=new IntersectionObserver((entries,observer)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const video=entry.target;
      video.src=video.dataset.src;
      video.load();
      observer.unobserve(video);
    }
  });
});
lazyVideos.forEach(video=>{videoObserver.observe(video);});

// PRELOAD HERO
window.addEventListener("load",()=>{const hero=new Image();hero.src="img/hero/hero1.webp";});

// DETECCION
if(navigator.connection&&navigator.connection.saveData){console.log("Modo ahorro de datos activo.");}