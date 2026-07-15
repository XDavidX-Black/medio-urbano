/*====================================================
slider.js - MEDIO URBANO V3 - Hero por Horario
Horarios desde Firestore config/horarios
Fallback: horarios hardcoded si Firestore no disponible
=====================================================*/

const heroConfigDefault = {
  marca: {
    logo: "img/logo-marca.png",
    title: "MEDIO URBANO",
    subtitle: "FAST FOOD",
    text: "Comida rápida con estilo urbano"
  },
  cocina: {
    logo: "img/logo-cocina.png",
    title: "¿HOY NO QUIERES COCINAR?",
    subtitle: "MEDIO URBANO COCINA · SALAD",
    text: "Nosotros nos encargamos"
  },
  burgers: {
    logo: "img/logo-burgers.png",
    title: "PRÓXIMAMENTE",
    subtitle: "MEDIO URBANO BURGERS · PASTA",
    text: "Estamos preparando algo increíble"
  }
};

let heroFirestoreConfig={};
let horariosFirestore={};

function getHeroBySchedule() {
  const now = new Date();
  const h = now.getHours();
  const day = now.getDay();
  const dayIdx=day===0?6:day-1;

  const getHora=(marca)=>{
    const key=marca+"_"+dayIdx;
    if(horariosFirestore[key]){
      const hd=horariosFirestore[key];
      if(hd.activo===false) return null;
      const[ah,am]=(hd.apertura||"10:00").split(":").map(Number);
      const[ch,cm]=(hd.cierre||"22:00").split(":").map(Number);
      const min=ah*60+am,max=ch*60+cm,cur=h*60+now.getMinutes();
      if(max>min) return cur>=min&&cur<max;
      return cur>=min||cur<max;
    }
    return null;
  };

  const cocinaOpen=getHora("cocina");
  const saladOpen=getHora("salad");
  if((cocinaOpen===true||saladOpen===true)){
    return heroFirestoreConfig.cocina||heroConfigDefault.cocina;
  }

  const burgersOpen=getHora("burgers");
  const pastaOpen=getHora("pasta");
  if(burgersOpen===true||pastaOpen===true){
    return heroFirestoreConfig.burgers||heroConfigDefault.burgers;
  }

  if(cocinaOpen===false&&saladOpen===false&&burgersOpen===false&&pastaOpen===false){
    return heroFirestoreConfig.marca||heroConfigDefault.marca;
  }

  if(day>=1&&day<=5&&h>=10&&h<15){
    return heroFirestoreConfig.cocina||heroConfigDefault.cocina;
  }
  if(day>=1&&day<=6&&(h>=20||h<0)){
    return heroFirestoreConfig.burgers||heroConfigDefault.burgers;
  }
  return heroFirestoreConfig.marca||heroConfigDefault.marca;
}

function applyHeroConfig(config) {
  const logo = document.querySelector(".hero-logo-dynamic");
  const title = document.querySelector(".hero-title-dynamic");
  const subtitle = document.querySelector(".hero-subtitle-dynamic");
  const text = document.querySelector(".hero-text-dynamic");

  if (logo) logo.src = config.logo;
  if (title) title.textContent = config.title;
  if (subtitle) subtitle.textContent = config.subtitle;
  if (text) text.textContent = config.text;
}

function animateHeroIn() {
  const elements = document.querySelectorAll(".hero-logo-dynamic, .hero-title-dynamic, .hero-subtitle-dynamic, .hero-text-dynamic, .hero-buttons, .hero-scroll-indicator");
  elements.forEach((el, i) => {
    el.classList.add("hero-fade-in");
    setTimeout(() => el.classList.add("visible"), 100 + i * 300);
  });
}

function loadHeroFromFirestore(){
  if(typeof firebase==="undefined"||!firebase.firestore){
    initHero();
    return;
  }
  Promise.all([
    firebase.firestore().collection("config").doc("hero").get(),
    firebase.firestore().collection("config").doc("horarios").get()
  ]).then(([heroDoc,horariosDoc])=>{
    if(heroDoc.exists){
      const h=heroDoc.data();
      if(h.titulo) heroFirestoreConfig.cocina={...heroConfigDefault.cocina,title:h.titulo,subtitle:h.subtitulo||heroConfigDefault.cocina.subtitle,text:h.texto||heroConfigDefault.cocina.text};
      if(h.btnTexto) heroFirestoreConfig.cocina.button=h.btnTexto;
    }
    if(horariosDoc.exists) horariosFirestore=horariosDoc.data();
    initHero();
  }).catch(()=>initHero());
}

function initHero() {
  const config = getHeroBySchedule();
  applyHeroConfig(config);
  animateHeroIn();
}

window.addEventListener("load", loadHeroFromFirestore);
