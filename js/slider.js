/*====================================================
slider.js - MEDIO URBANO V3 - Hero por Horario
Horarios reales:
  Cocina/Salad: Lun-Vie 10:00-15:00
  Burgers/Pasta: Lun-Sab 20:00-00:00 (Próximamente)
  Fuera de horario: Marca general
=====================================================*/

const heroConfig = {
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

function getHeroBySchedule() {
  const now = new Date();
  const h = now.getHours();
  const day = now.getDay(); // 0=Dom, 1=Lun...6=Sab

  // Cocina + Salad: Lun-Vie (1-5), 10:00-15:00
  if (day >= 1 && day <= 5 && h >= 10 && h < 15) {
    return heroConfig.cocina;
  }

  // Burgers + Pasta: Lun-Sab (1-6), 20:00-00:00
  if (day >= 1 && day <= 6 && (h >= 20 || h < 0)) {
    return heroConfig.burgers;
  }

  // Fuera de horario: marca general
  return heroConfig.marca;
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

function initHero() {
  const config = getHeroBySchedule();
  applyHeroConfig(config);
  animateHeroIn();
}

window.addEventListener("load", initHero);
