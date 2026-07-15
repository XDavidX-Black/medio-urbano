/*====================================================
slider.js - MEDIO URBANO V3 - Hero Rotativo
====================================================*/

const slides=[
  {titulo:"MEDIO URBANO",subtitulo:"UN SOLO LUGAR · CUATRO EXPERIENCIAS",texto:"Descubre Cocina, Salad, Burgers y Pasta.",imagen:"img/hero/hero1.webp"},
  {titulo:"COCINA",subtitulo:"SABOR CASERO",texto:"Comida preparada diariamente.",imagen:"img/hero/cocina.webp"},
  {titulo:"SALAD",subtitulo:"FRESCO Y SALUDABLE",texto:"Ingredientes frescos todos los días.",imagen:"img/hero/salad.webp"},
  {titulo:"BURGERS",subtitulo:"PRÓXIMAMENTE",texto:"Estamos preparando algo increíble.",imagen:"img/hero/burgers.webp"},
  {titulo:"PASTA",subtitulo:"PRÓXIMAMENTE",texto:"Muy pronto una nueva experiencia.",imagen:"img/hero/pasta.webp"}
];

let slideActual=0;

function cambiarSlide(indice){
  const slide=slides[indice];
  const hero=document.querySelector(".hero");
  const heroTitle=document.querySelector(".hero h1");
  const heroSubtitle=document.querySelector(".hero h2");
  const heroText=document.querySelector(".hero p");
  hero.style.backgroundImage=`linear-gradient(rgba(0,0,0,.75),rgba(0,0,0,.88)),url(${slide.imagen})`;
  heroTitle.style.opacity=0;
  heroSubtitle.style.opacity=0;
  heroText.style.opacity=0;
  setTimeout(()=>{
    heroTitle.innerHTML=slide.titulo;
    heroSubtitle.innerHTML=slide.subtitulo;
    heroText.innerHTML=slide.texto;
    heroTitle.style.opacity=1;
    heroSubtitle.style.opacity=1;
    heroText.style.opacity=1;
  },300);
}

function siguienteSlide(){
  slideActual++;
  if(slideActual>=slides.length) slideActual=0;
  cambiarSlide(slideActual);
  actualizarDots();
}

function anteriorSlide(){
  slideActual--;
  if(slideActual<0) slideActual=slides.length-1;
  cambiarSlide(slideActual);
  actualizarDots();
}

setInterval(siguienteSlide,7000);

const next=document.querySelector(".next-slide");
const prev=document.querySelector(".prev-slide");
if(next) next.addEventListener("click",siguienteSlide);
if(prev) prev.addEventListener("click",anteriorSlide);

// INDICADORES
const indicadores=document.querySelector(".hero-dots");
if(indicadores){
  slides.forEach((_,index)=>{
    const dot=document.createElement("span");
    dot.classList.add("dot");
    if(index===0) dot.classList.add("active");
    dot.addEventListener("click",()=>{
      slideActual=index;
      cambiarSlide(index);
      actualizarDots();
    });
    indicadores.appendChild(dot);
  });
}

function actualizarDots(){
  document.querySelectorAll(".dot").forEach((dot,index)=>{
    dot.classList.toggle("active",index===slideActual);
  });
}

window.addEventListener("load",()=>{cambiarSlide(0);});