// ============================================
// MEDIO URBANO - App Principal (Firebase)
// ============================================

let WHATSAPP_NUMBER = '529983852946';

// ============================================
// DEFAULT DATA
// ============================================

const DEFAULT_HORARIOS = {
  cocina: {
    nombre: "Medio Urbano Cocina",
    dias: [1, 2, 3, 4, 5],
    apertura: 10,
    cierre: 15,
    mensaje: "Lunes a Viernes de 10:00 AM a 3:00 PM"
  },
  salad: {
    nombre: "Medio Urbano Salad",
    dias: [1, 2, 3, 4, 5],
    apertura: 10,
    cierre: 15,
    mensaje: "Lunes a Viernes de 10:00 AM a 3:00 PM"
  },
  burgers: {
    nombre: "Medio Urbano Burgers",
    dias: [1, 2, 3, 4, 5, 6],
    apertura: 20,
    cierre: 24,
    mensaje: "Lunes a Sabado de 8:00 PM a 12:00 AM"
  },
  pasta: {
    nombre: "Medio Urbano Pasta",
    dias: [1, 2, 3, 4, 5, 6],
    apertura: 18,
    cierre: 23,
    mensaje: "Lunes a Sabado de 6:00 PM a 11:00 PM"
  }
};

// ============================================
// GLOBAL STATE
// ============================================

let horarios = DEFAULT_HORARIOS;
let menuCocinaData = [];
let menuSaladData = [];
let menuBurgersData = [];
let menuPastaData = [];
let carrito = [];
let negocioActual = null;
let modoSoloVer = false;

// ============================================
// FIREBASE REAL-TIME LISTENERS
// ============================================

function setupRealtimeListeners() {
  Storage.onHorariosChange(data => {
    horarios = { ...DEFAULT_HORARIOS, ...data };
    updateStatusIndicators();
    if (negocioActual && !EstaAbierto(negocioActual)) {
      goHome();
    }
  });

  Storage.onMenuCocinaChange(data => {
    menuCocinaData = data;
    if (negocioActual === 'cocina') renderMenuCocina();
  });

  Storage.onMenuSaladChange(data => {
    menuSaladData = data;
    if (negocioActual === 'salad') renderMenuSalad();
  });

  Storage.onMenuBurgersChange(data => {
    menuBurgersData = data;
    if (negocioActual === 'burgers') renderMenuBurgers();
  });

  Storage.onMenuPastaChange(data => {
    menuPastaData = data;
    if (negocioActual === 'pasta') renderMenuPasta();
  });
}

// ============================================
// SEED DATA ON FIRST LOAD
// ============================================

async function seedData() {
  await Storage.seedIfNeeded(
    { cocina: menuCocina, salad: menuSalad, burgers: menuBurgers, pasta: menuPasta },
    DEFAULT_HORARIOS
  );
}

// ============================================
// INIT
// ============================================

async function initApp() {
  try {
    const results = await Promise.allSettled([
      Storage.getHorarios(),
      Storage.getMenuCocina(),
      Storage.getMenuSalad(),
      Storage.getMenuBurgers(),
      Storage.getMenuPasta(),
      Storage.getConfig()
    ]);

    const horariosRaw = results[0].status === 'fulfilled' && results[0].value ? results[0].value : DEFAULT_HORARIOS;
    horarios = { ...DEFAULT_HORARIOS, ...horariosRaw };
    menuCocinaData = (results[1].status === 'fulfilled' && results[1].value && results[1].value.items) || menuCocina;
    menuSaladData = (results[2].status === 'fulfilled' && results[2].value && results[2].value.items) || menuSalad;
    menuBurgersData = (results[3].status === 'fulfilled' && results[3].value && results[3].value.items) || menuBurgers;
    menuPastaData = (results[4].status === 'fulfilled' && results[4].value && results[4].value.items) || menuPasta;
    WHATSAPP_NUMBER = (results[5].status === 'fulfilled' && results[5].value && results[5].value.whatsappNumber) || '529983852946';

    await seedData();
    try { setupRealtimeListeners(); } catch (e) { console.warn('Listeners not set up:', e); }
  } catch (e) {
    console.warn('Firestore unavailable, using defaults:', e);
    horarios = DEFAULT_HORARIOS;
    menuCocinaData = menuCocina;
    menuSaladData = menuSalad;
    menuBurgersData = menuBurgers;
    menuPastaData = menuPasta;
  }

  updateStatusIndicators();
}

// ============================================
// HORARIOS
// ============================================

function EstaAbierto(negocio) {
  const ahora = new Date();
  const dia = ahora.getDay();
  const hora = ahora.getHours();
  const config = horarios[negocio];
  if (!config || !config.dias || !config.dias.includes(dia)) return false;
  if (config.cierre === 24) return hora >= config.apertura && hora < config.cierre;
  return hora >= config.apertura && hora < config.cierre;
}

function getProximoHorario(negocio) {
  const ahora = new Date();
  const dia = ahora.getDay();
  const config = horarios[negocio];
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

  if (config && config.dias.includes(dia) && ahora.getHours() < config.apertura) {
    return `Abre hoy a las ${formatHora(config.apertura)}`;
  }

  let diasHasta = 7;
  for (let i = 1; i <= 7; i++) {
    const diaBusqueda = (dia + i) % 7;
    if (config && config.dias.includes(diaBusqueda)) { diasHasta = i; break; }
  }

  const proximoDia = (dia + diasHasta) % 7;
  return `Abre ${diasSemana[proximoDia]} a las ${formatHora(config ? config.apertura : 10)}`;
}

function formatHora(h) {
  if (h === 0 || h === 24) return '12:00 AM';
  if (h === 12) return '12:00 PM';
  if (h < 12) return `${h}:00 AM`;
  return `${h - 12}:00 PM`;
}

// ============================================
// NAVEGACION
// ============================================

const MENU_SECTIONS = ['menuCocina', 'menuSalad', 'menuBurgers', 'menuPasta'];

function hideAllMenus() {
  MENU_SECTIONS.forEach(id => document.getElementById(id).classList.remove('active'));
}

function hideAllBanners() {
  document.querySelectorAll('.cerrado-banner').forEach(b => b.style.display = 'none');
}

function showBanner(negocio) {
  const config = horarios[negocio];
  const proximo = getProximoHorario(negocio);
  const bannerId = 'cerradoBanner' + negocio.charAt(0).toUpperCase() + negocio.slice(1);
  const banner = document.getElementById(bannerId);
  if (banner) {
    banner.style.display = 'flex';
    banner.querySelector('.cerrado-banner-text').textContent = `${config.mensaje} — ${proximo}`;
  }
}

function openMenu(negocio) {
  negocioActual = negocio;
  document.getElementById('landingPage').style.display = 'none';
  document.getElementById('btnBack').style.display = 'block';

  const cerrado = !EstaAbierto(negocio);
  hideAllBanners();

  if (cerrado) {
    showBanner(negocio);
    modoSoloVer = true;
    document.getElementById('carritoFloat').style.display = 'none';
  } else {
    modoSoloVer = false;
    if (getTotalItems() > 0) {
      document.getElementById('carritoFloat').style.display = 'flex';
    }
  }

  hideAllMenus();
  const sectionId = 'menu' + negocio.charAt(0).toUpperCase() + negocio.slice(1);
  document.getElementById(sectionId).classList.add('active');

  if (negocio === 'cocina') renderMenuCocina();
  else if (negocio === 'salad') renderMenuSalad();
  else if (negocio === 'burgers') renderMenuBurgers();
  else if (negocio === 'pasta') renderMenuPasta();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goHome() {
  document.getElementById('landingPage').style.display = 'block';
  hideAllMenus();
  document.getElementById('btnBack').style.display = 'none';
  modoSoloVer = false;

  const float = document.getElementById('carritoFloat');
  if (getTotalItems() > 0) {
    float.style.display = 'flex';
  } else {
    float.style.display = 'none';
  }

  hideAllBanners();
  updateStatusIndicators();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// MODAL CERRADO
// ============================================

function mostrarAvisoCerrado(nombre, horarios, proximo) {
  document.getElementById('cerradoNegocio').textContent = nombre;
  document.getElementById('cerradoHorario').textContent = horarios;
  document.getElementById('cerradoProximo').textContent = proximo;
  document.getElementById('modalCerrado').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCerrado() {
  document.getElementById('modalCerrado').classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================
// STATUS INDICATORS
// ============================================

function updateStatusIndicators() {
  updateStatus('cocina', 'statusCocina');
  updateStatus('salad', 'statusSalad');
  updateStatus('burgers', 'statusBurgers');
  updateStatus('pasta', 'statusPasta');
  updateHorarioText('cocina', 'horarioTextoCocina');
  updateHorarioText('salad', 'horarioTextoSalad');
  updateHorarioText('burgers', 'horarioTextoBurgers');
  updateHorarioText('pasta', 'horarioTextoPasta');
}

function updateStatus(negocio, elementId) {
  const el = document.getElementById(elementId);
  const config = horarios[negocio];
  if (!config || !el) return;
  const abierto = EstaAbierto(negocio);

  if (abierto) {
    el.className = 'negocio-status abierto';
    el.innerHTML = `<span class="status-dot"></span>Abierto - ${config.mensaje}`;
  } else {
    el.className = 'negocio-status cerrado';
    el.innerHTML = `<span class="status-dot"></span>Cerrado - ${getProximoHorario(negocio)}`;
  }
}

function updateHorarioText(negocio, elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const config = horarios[negocio];
  if (!config) return;
  el.textContent = config.mensaje || '';
}

// ============================================
// RENDER MENU - GENERIC
// ============================================

function renderMenuGeneric(gridId, catsId, data, filtro, renderFn) {
  const grid = document.getElementById(gridId);
  const cats = document.getElementById(catsId);

  const categorias = [...new Set(data.map(i => i.categoria))];

  cats.innerHTML = `<button class="categoria-btn ${!filtro ? 'active' : ''}" onclick="${renderFn}()">Todos</button>`;
  categorias.forEach(cat => {
    cats.innerHTML += `<button class="categoria-btn ${filtro === cat ? 'active' : ''}" onclick="${renderFn}('${cat}')">${cat}</button>`;
  });

  const items = filtro ? data.filter(i => i.categoria === filtro) : data;

  grid.innerHTML = '';
  items.forEach(item => {
    if (modoSoloVer) {
      grid.innerHTML += `
        <div class="menu-item fade-in solo-ver">
          <div class="menu-item-emoji">${item.imagen}</div>
          <div class="menu-item-info">
            <div class="menu-item-top">
              <span class="menu-item-name">${item.nombre}</span>
              <span class="menu-item-price">$${item.precio}</span>
            </div>
            <p class="menu-item-desc">${item.descripcion}</p>
            <div class="menu-item-cat-label">${item.categoria || ''}</div>
          </div>
        </div>
      `;
    } else {
      const cantidad = getCantidad(item.id);
      grid.innerHTML += `
        <div class="menu-item fade-in">
          <div class="menu-item-emoji">${item.imagen}</div>
          <div class="menu-item-info">
            <div class="menu-item-top">
              <span class="menu-item-name">${item.nombre}</span>
              <span class="menu-item-price">$${item.precio}</span>
            </div>
            <p class="menu-item-desc">${item.descripcion}</p>
            <div class="menu-item-actions">
              <div class="btn-cantidad">
                <button onclick="changeCantidad(${item.id}, -1)">−</button>
                <span id="cant-${item.id}">${cantidad}</span>
                <button onclick="changeCantidad(${item.id}, 1)">+</button>
              </div>
              <button class="btn-agregar" onclick="addToCart(${item.id})">Agregar</button>
            </div>
          </div>
        </div>
      `;
    }
  });
}

function renderMenuCocina(filtro) {
  const data = menuCocinaData.length > 0 ? menuCocinaData : menuCocina;
  renderMenuGeneric('gridCocina', 'categoriasCocina', data, filtro, 'renderMenuCocina');
}

function renderMenuSalad(filtro) {
  const data = menuSaladData.length > 0 ? menuSaladData : menuSalad;
  renderMenuGeneric('gridSalad', 'categoriasSalad', data, filtro, 'renderMenuSalad');
}

function renderMenuBurgers(filtro) {
  const data = menuBurgersData.length > 0 ? menuBurgersData : menuBurgers;
  renderMenuGeneric('gridBurgers', 'categoriasBurgers', data, filtro, 'renderMenuBurgers');
}

function renderMenuPasta(filtro) {
  const data = menuPastaData.length > 0 ? menuPastaData : menuPasta;
  renderMenuGeneric('gridPasta', 'categoriasPasta', data, filtro, 'renderMenuPasta');
}

// ============================================
// CARRITO
// ============================================

function getAllMenuItems() {
  const cocina = menuCocinaData.length > 0 ? menuCocinaData : menuCocina;
  const salad = menuSaladData.length > 0 ? menuSaladData : menuSalad;
  const burgers = menuBurgersData.length > 0 ? menuBurgersData : menuBurgers;
  const pasta = menuPastaData.length > 0 ? menuPastaData : menuPasta;
  return [...cocina, ...salad, ...burgers, ...pasta];
}

function findItem(id) {
  return getAllMenuItems().find(i => i.id === id);
}

function getCantidad(id) {
  const item = carrito.find(i => i.id === id);
  return item ? item.cantidad : 0;
}

function changeCantidad(id, delta) {
  const existing = carrito.find(i => i.id === id);
  if (existing) {
    existing.cantidad += delta;
    if (existing.cantidad <= 0) {
      carrito = carrito.filter(i => i.id !== id);
    }
  } else if (delta > 0) {
    const item = findItem(id);
    carrito.push({ ...item, cantidad: 1 });
  }
  updateUI();
}

function addToCart(id) {
  const existing = carrito.find(i => i.id === id);
  if (existing) {
    existing.cantidad += 1;
  } else {
    const item = findItem(id);
    carrito.push({ ...item, cantidad: 1 });
  }

  const cantEl = document.getElementById(`cant-${id}`);
  if (cantEl) {
    cantEl.classList.add('shake');
    setTimeout(() => cantEl.classList.remove('shake'), 300);
  }

  updateUI();
}

function removeFromCart(id) {
  carrito = carrito.filter(i => i.id !== id);
  updateUI();
  renderCarrito();
}

function getTotal() {
  return carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
}

function getTotalItems() {
  return carrito.reduce((sum, item) => sum + item.cantidad, 0);
}

function updateUI() {
  const total = getTotalItems();
  const badge = document.getElementById('carritoBadge');
  const float = document.getElementById('carritoFloat');

  badge.textContent = total;

  if (total > 0) {
    float.classList.add('visible');
  } else {
    float.classList.remove('visible');
  }

  if (negocioActual === 'cocina') renderMenuCocina();
  else if (negocioActual === 'salad') renderMenuSalad();
  else if (negocioActual === 'burgers') renderMenuBurgers();
  else if (negocioActual === 'pasta') renderMenuPasta();
}

// ============================================
// MODAL CARRITO
// ============================================

function openCarrito() {
  renderCarrito();
  document.getElementById('modalCarrito').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCarrito() {
  document.getElementById('modalCarrito').classList.remove('active');
  document.body.style.overflow = '';
}

function renderCarrito() {
  const body = document.getElementById('carritoBody');
  const totalEl = document.getElementById('carritoTotal');
  const formEl = document.getElementById('formularioSection');
  const totalAmount = document.getElementById('totalAmount');

  if (carrito.length === 0) {
    body.innerHTML = `
      <div class="carrito-empty">
        <span class="carrito-empty-icon">🛒</span>
        <p>Tu carrito esta vacio</p>
      </div>
    `;
    totalEl.style.display = 'none';
    formEl.style.display = 'none';
    return;
  }

  let html = '';
  carrito.forEach(item => {
    html += `
      <div class="carrito-item">
        <span class="carrito-item-emoji">${item.imagen}</span>
        <div class="carrito-item-info">
          <div class="carrito-item-name">${item.nombre}</div>
          <div class="carrito-item-price">$${item.precio * item.cantidad}</div>
        </div>
        <div class="carrito-item-controls">
          <div class="btn-cantidad">
            <button onclick="changeCantidad(${item.id}, -1); renderCarrito();">−</button>
            <span>${item.cantidad}</span>
            <button onclick="changeCantidad(${item.id}, 1); renderCarrito();">+</button>
          </div>
          <button class="btn-eliminar" onclick="removeFromCart(${item.id})">🗑️</button>
        </div>
      </div>
    `;
  });

  body.innerHTML = html;
  totalEl.style.display = 'flex';
  formEl.style.display = 'block';
  totalAmount.textContent = `$${getTotal()}`;
}

// ============================================
// WHATSAPP
// ============================================

function enviarWhatsApp() {
  const nombre = document.getElementById('inputNombre').value.trim();
  const telefono = document.getElementById('inputTelefono').value.trim();
  const direccion = document.getElementById('inputDireccion').value.trim();
  const pago = document.getElementById('inputPago').value;
  const notas = document.getElementById('inputNotas').value.trim();

  if (!nombre) { alert('Por favor ingresa tu nombre'); return; }
  if (!telefono) { alert('Por favor ingresa tu telefono'); return; }
  if (!direccion) { alert('Por favor ingresa tu direccion de entrega'); return; }
  if (!pago) { alert('Por favor selecciona un metodo de pago'); return; }

  const negocios = {
    cocina: { nombre: 'Medio Urbano Cocina', emoji: '🍳' },
    salad: { nombre: 'Medio Urbano Salad', emoji: '🥗' },
    burgers: { nombre: 'Medio Urbano Burgers', emoji: '🍔' },
    pasta: { nombre: 'Medio Urbano Pasta', emoji: '🍝' }
  };

  const info = negocios[negocioActual] || negocios.cocina;

  let mensaje = `${info.emoji} *Pedido - ${info.nombre}*\n\n`;
  mensaje += `👤 *Nombre:* ${nombre}\n`;
  mensaje += `📞 *Tel:* ${telefono}\n`;
  mensaje += `📍 *Direccion:* ${direccion}\n`;
  mensaje += `💳 *Pago:* ${pago}\n\n`;
  mensaje += `📋 *Pedido:*\n`;

  carrito.forEach(item => {
    mensaje += `• ${item.cantidad}x ${item.nombre} - $${item.precio * item.cantidad}\n`;
  });

  mensaje += `\n💰 *Total: $${getTotal()}*\n`;

  if (notas) {
    mensaje += `\n📝 *Notas:* ${notas}`;
  }

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}

// ============================================
// CERRAR MODAL CLICK FUERA
// ============================================

document.getElementById('modalCarrito').addEventListener('click', function(e) {
  if (e.target === this) closeCarrito();
});

document.getElementById('modalCerrado').addEventListener('click', function(e) {
  if (e.target === this) closeCerrado();
});

// ============================================
// CERRAR CON ESC
// ============================================

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeCarrito();
    closeCerrado();
  }
});

// ============================================
// INICIALIZAR
// ============================================

updateStatusIndicators();
initApp();
