// ============================================
// MEDIO URBANO - Admin Panel Logic (Firebase)
// ============================================

const ADMIN_PASSWORD = 'medio2026';

let currentMenuSource = null;
let currentFilterBurgers = null;
let currentFilterCocina = null;

// Local cache for admin
let adminMenuCocina = [];
let adminMenuSalad = [];
let adminMenuBurgers = [];
let adminMenuPasta = [];
let adminHorarios = null;

const DEFAULT_HORARIOS = {
  cocina: {
    nombre: "Medio Urbano Cocina", dias: [1,2,3,4,5],
    apertura: 10, cierre: 15,
    mensaje: "Lunes a Viernes de 10:00 AM a 3:00 PM"
  },
  salad: {
    nombre: "Medio Urbano Salad", dias: [1,2,3,4,5],
    apertura: 10, cierre: 15,
    mensaje: "Lunes a Viernes de 10:00 AM a 3:00 PM"
  },
  burgers: {
    nombre: "Medio Urbano Burgers", dias: [1,2,3,4,5,6],
    apertura: 20, cierre: 24,
    mensaje: "Lunes a Sabado de 8:00 PM a 12:00 AM"
  },
  pasta: {
    nombre: "Medio Urbano Pasta", dias: [1,2,3,4,5,6],
    apertura: 18, cierre: 23,
    mensaje: "Lunes a Sabado de 6:00 PM a 11:00 PM"
  }
};

// ============================================
// INIT
// ============================================

async function init() {
  if (Storage.isAuthenticated()) {
    await showAdmin();
  } else {
    showLogin();
  }
}

function showLogin() {
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('adminPage').style.display = 'none';
}

async function showAdmin() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('adminPage').style.display = 'block';
  setLoading(true);
  await loadAllData();
  setLoading(false);
}

// ============================================
// LOADING STATE
// ============================================

function setLoading(loading) {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = loading ? 'flex' : 'none';
}

function setConnectionStatus(connected) {
  const el = document.getElementById('connectionStatus');
  if (el) {
    el.className = connected ? 'conn-ok' : 'conn-err';
    el.textContent = connected ? '● Conectado' : '● Sin conexion';
  }
}

// ============================================
// AUTH
// ============================================

function login() {
  const pass = document.getElementById('loginPassword').value;
  if (pass === ADMIN_PASSWORD) {
    Storage.setAuthenticated(true);
    document.getElementById('loginError').style.display = 'none';
    showAdmin();
  } else {
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginPassword').classList.add('shake');
    setTimeout(() => document.getElementById('loginPassword').classList.remove('shake'), 300);
  }
}

function logout() {
  Storage.setAuthenticated(false);
  showLogin();
}

document.addEventListener('keydown', function(e) {
  const loginPage = document.getElementById('loginPage');
  if (e.key === 'Enter' && loginPage && loginPage.style.display !== 'none') {
    login();
  }
});

// ============================================
// TABS
// ============================================

function switchTab(tab, btnEl) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

  if (btnEl) btnEl.classList.add('active');
  const tabId = 'tab' + tab.charAt(0).toUpperCase() + tab.slice(1);
  const tabEl = document.getElementById(tabId);
  if (tabEl) tabEl.classList.add('active');

  updateTabCounters();
}

function updateTabCounters() {
  const cocinaTab = document.querySelector('[data-tab="cocina"]');
  const saladTab = document.querySelector('[data-tab="salad"]');
  const burgersTab = document.querySelector('[data-tab="burgers"]');
  const pastaTab = document.querySelector('[data-tab="pasta"]');
  if (cocinaTab) cocinaTab.textContent = `Menu Cocina (${adminMenuCocina.length})`;
  if (saladTab) saladTab.textContent = `Menu Salad (${adminMenuSalad.length})`;
  if (burgersTab) burgersTab.textContent = `Menu Burgers (${adminMenuBurgers.length})`;
  if (pastaTab) pastaTab.textContent = `Menu Pasta (${adminMenuPasta.length})`;
}

// ============================================
// LOAD DATA
// ============================================

async function loadAllData() {
  try {
    await Promise.all([
      loadMenuCocina(),
      loadMenuSalad(),
      loadMenuBurgers(),
      loadMenuPasta(),
      loadHorarios()
    ]);
    setConnectionStatus(true);
  } catch (e) {
    console.error('Error loading data:', e);
    setConnectionStatus(false);
    showToast('Error al cargar datos', true);
  }
}

// ============================================
// MENU COCINA
// ============================================

async function loadMenuCocina() {
  try {
    const result = await Storage.getMenuCocina();
    adminMenuCocina = (result && result.items) ? result.items : JSON.parse(JSON.stringify(menuCocina));
    setConnectionStatus(true);
  } catch (e) {
    adminMenuCocina = JSON.parse(JSON.stringify(menuCocina));
    setConnectionStatus(false);
  }
  renderMenuCocinaList(adminMenuCocina);
}

function renderMenuCocinaList(data) {
  const list = document.getElementById('listCocina');
  list.innerHTML = '';
  if (data.length === 0) { list.innerHTML = '<p class="admin-empty">No hay platos</p>'; return; }
  data.forEach(item => {
    list.innerHTML += `
      <div class="admin-list-item ${!item.disponible ? 'unavailable' : ''}">
        <div class="admin-item-emoji">${item.imagen}</div>
        <div class="admin-item-info">
          <div class="admin-item-name">${item.nombre}</div>
          <div class="admin-item-desc">${item.descripcion}</div>
          <div class="admin-item-cat">${item.categoria || 'Sin categoria'}</div>
        </div>
        <div class="admin-item-price">$${item.precio}</div>
        <div class="admin-item-actions">
          <button class="admin-btn-edit" onclick="editItem('cocina', ${item.id})" title="Editar">✏️</button>
          <button class="admin-btn-dup" onclick="duplicateItem('cocina', ${item.id})" title="Duplicar">📋</button>
          <button class="admin-btn-delete" onclick="confirmDelete('cocina', ${item.id}, '${item.nombre.replace(/'/g, "\\'")}')" title="Eliminar">🗑️</button>
        </div>
      </div>
    `;
  });
  updateTabCounters();
}

function searchCocina(query) {
  if (!query) { renderMenuCocinaList(adminMenuCocina); return; }
  const q = query.toLowerCase();
  renderMenuCocinaList(adminMenuCocina.filter(i => i.nombre.toLowerCase().includes(q) || i.descripcion.toLowerCase().includes(q) || (i.categoria && i.categoria.toLowerCase().includes(q))));
}

// ============================================
// MENU SALAD
// ============================================

async function loadMenuSalad() {
  try {
    const result = await Storage.getMenuSalad();
    adminMenuSalad = (result && result.items) ? result.items : JSON.parse(JSON.stringify(menuSalad));
    setConnectionStatus(true);
  } catch (e) {
    adminMenuSalad = JSON.parse(JSON.stringify(menuSalad));
    setConnectionStatus(false);
  }
  renderMenuSaladList(adminMenuSalad);
}

function renderMenuSaladList(data) {
  const list = document.getElementById('listSalad');
  list.innerHTML = '';
  if (data.length === 0) { list.innerHTML = '<p class="admin-empty">No hay productos</p>'; return; }
  data.forEach(item => {
    list.innerHTML += `
      <div class="admin-list-item ${!item.disponible ? 'unavailable' : ''}">
        <div class="admin-item-emoji">${item.imagen}</div>
        <div class="admin-item-info">
          <div class="admin-item-name">${item.nombre}</div>
          <div class="admin-item-desc">${item.descripcion}</div>
          <div class="admin-item-cat">${item.categoria || 'Sin categoria'}</div>
        </div>
        <div class="admin-item-price">$${item.precio}</div>
        <div class="admin-item-actions">
          <button class="admin-btn-edit" onclick="editItem('salad', ${item.id})" title="Editar">✏️</button>
          <button class="admin-btn-dup" onclick="duplicateItem('salad', ${item.id})" title="Duplicar">📋</button>
          <button class="admin-btn-delete" onclick="confirmDelete('salad', ${item.id}, '${item.nombre.replace(/'/g, "\\'")}')" title="Eliminar">🗑️</button>
        </div>
      </div>
    `;
  });
  updateTabCounters();
}

function searchSalad(query) {
  if (!query) { renderMenuSaladList(adminMenuSalad); return; }
  const q = query.toLowerCase();
  renderMenuSaladList(adminMenuSalad.filter(i => i.nombre.toLowerCase().includes(q) || i.descripcion.toLowerCase().includes(q) || (i.categoria && i.categoria.toLowerCase().includes(q))));
}

// ============================================
// MENU BURGERS
// ============================================

async function loadMenuBurgers() {
  try {
    const result = await Storage.getMenuBurgers();
    adminMenuBurgers = (result && result.items) ? result.items : JSON.parse(JSON.stringify(menuBurgers));
    setConnectionStatus(true);
  } catch (e) {
    adminMenuBurgers = JSON.parse(JSON.stringify(menuBurgers));
    setConnectionStatus(false);
  }
  renderMenuBurgersList();
}

function renderMenuBurgersList() {
  const data = adminMenuBurgers;
  const catsContainer = document.getElementById('burgersCategorias');
  const list = document.getElementById('listBurgers');
  const categorias = [...new Set(data.map(i => i.categoria))];

  catsContainer.innerHTML = `<button class="admin-cat-btn ${!currentFilterBurgers ? 'active' : ''}" onclick="filterBurgers(null)">Todos</button>`;
  categorias.forEach(cat => {
    catsContainer.innerHTML += `<button class="admin-cat-btn ${currentFilterBurgers === cat ? 'active' : ''}" onclick="filterBurgers('${cat}')">${cat}</button>`;
  });

  const items = currentFilterBurgers ? data.filter(i => i.categoria === currentFilterBurgers) : data;
  list.innerHTML = '';
  if (items.length === 0) { list.innerHTML = '<p class="admin-empty">No hay productos</p>'; return; }

  items.forEach(item => {
    list.innerHTML += `
      <div class="admin-list-item ${!item.disponible ? 'unavailable' : ''}">
        <div class="admin-item-emoji">${item.imagen}</div>
        <div class="admin-item-info">
          <div class="admin-item-name">${item.nombre}</div>
          <div class="admin-item-desc">${item.descripcion}</div>
          <div class="admin-item-cat">${item.categoria || 'Sin categoria'}</div>
        </div>
        <div class="admin-item-price">$${item.precio}</div>
        <div class="admin-item-actions">
          <button class="admin-btn-edit" onclick="editItem('burgers', ${item.id})" title="Editar">✏️</button>
          <button class="admin-btn-dup" onclick="duplicateItem('burgers', ${item.id})" title="Duplicar">📋</button>
          <button class="admin-btn-delete" onclick="confirmDelete('burgers', ${item.id}, '${item.nombre.replace(/'/g, "\\'")}')" title="Eliminar">🗑️</button>
        </div>
      </div>
    `;
  });
  updateTabCounters();
}

function filterBurgers(cat) { currentFilterBurgers = cat; renderMenuBurgersList(); }

function searchBurgers(query) {
  if (!query) { renderMenuBurgersList(); return; }
  const q = query.toLowerCase();
  const filtered = adminMenuBurgers.filter(i => i.nombre.toLowerCase().includes(q) || i.descripcion.toLowerCase().includes(q) || (i.categoria && i.categoria.toLowerCase().includes(q)));
  const list = document.getElementById('listBurgers');
  list.innerHTML = '';
  if (filtered.length === 0) { list.innerHTML = '<p class="admin-empty">No hay productos</p>'; return; }
  filtered.forEach(item => {
    list.innerHTML += `
      <div class="admin-list-item ${!item.disponible ? 'unavailable' : ''}">
        <div class="admin-item-emoji">${item.imagen}</div>
        <div class="admin-item-info">
          <div class="admin-item-name">${item.nombre}</div>
          <div class="admin-item-desc">${item.descripcion}</div>
          <div class="admin-item-cat">${item.categoria || 'Sin categoria'}</div>
        </div>
        <div class="admin-item-price">$${item.precio}</div>
        <div class="admin-item-actions">
          <button class="admin-btn-edit" onclick="editItem('burgers', ${item.id})" title="Editar">✏️</button>
          <button class="admin-btn-dup" onclick="duplicateItem('burgers', ${item.id})" title="Duplicar">📋</button>
          <button class="admin-btn-delete" onclick="confirmDelete('burgers', ${item.id}, '${item.nombre.replace(/'/g, "\\'")}')" title="Eliminar">🗑️</button>
        </div>
      </div>
    `;
  });
}

// ============================================
// MENU PASTA
// ============================================

async function loadMenuPasta() {
  try {
    const result = await Storage.getMenuPasta();
    adminMenuPasta = (result && result.items) ? result.items : JSON.parse(JSON.stringify(menuPasta));
    setConnectionStatus(true);
  } catch (e) {
    adminMenuPasta = JSON.parse(JSON.stringify(menuPasta));
    setConnectionStatus(false);
  }
  renderMenuPastaList(adminMenuPasta);
}

function renderMenuPastaList(data) {
  const list = document.getElementById('listPasta');
  list.innerHTML = '';
  if (data.length === 0) { list.innerHTML = '<p class="admin-empty">No hay productos</p>'; return; }
  data.forEach(item => {
    list.innerHTML += `
      <div class="admin-list-item ${!item.disponible ? 'unavailable' : ''}">
        <div class="admin-item-emoji">${item.imagen}</div>
        <div class="admin-item-info">
          <div class="admin-item-name">${item.nombre}</div>
          <div class="admin-item-desc">${item.descripcion}</div>
          <div class="admin-item-cat">${item.categoria || 'Sin categoria'}</div>
        </div>
        <div class="admin-item-price">$${item.precio}</div>
        <div class="admin-item-actions">
          <button class="admin-btn-edit" onclick="editItem('pasta', ${item.id})" title="Editar">✏️</button>
          <button class="admin-btn-dup" onclick="duplicateItem('pasta', ${item.id})" title="Duplicar">📋</button>
          <button class="admin-btn-delete" onclick="confirmDelete('pasta', ${item.id}, '${item.nombre.replace(/'/g, "\\'")}')" title="Eliminar">🗑️</button>
        </div>
      </div>
    `;
  });
  updateTabCounters();
}

function searchPasta(query) {
  if (!query) { renderMenuPastaList(adminMenuPasta); return; }
  const q = query.toLowerCase();
  renderMenuPastaList(adminMenuPasta.filter(i => i.nombre.toLowerCase().includes(q) || i.descripcion.toLowerCase().includes(q) || (i.categoria && i.categoria.toLowerCase().includes(q))));
}

// ============================================
// GENERIC CRUD HELPERS
// ============================================

function getMenuDataForSource(source) {
  if (source === 'cocina') return adminMenuCocina;
  if (source === 'salad') return adminMenuSalad;
  if (source === 'burgers') return adminMenuBurgers;
  if (source === 'pasta') return adminMenuPasta;
  return [];
}

async function saveMenuForSource(source, data) {
  if (source === 'cocina') await Storage.setMenuCocina(data);
  else if (source === 'salad') await Storage.setMenuSalad(data);
  else if (source === 'burgers') await Storage.setMenuBurgers(data);
  else if (source === 'pasta') await Storage.setMenuPasta(data);
}

async function reloadMenuForSource(source) {
  if (source === 'cocina') await loadMenuCocina();
  else if (source === 'salad') await loadMenuSalad();
  else if (source === 'burgers') await loadMenuBurgers();
  else if (source === 'pasta') await loadMenuPasta();
}

// ============================================
// CRUD ITEMS
// ============================================

function addItem(source) {
  currentMenuSource = source;
  document.getElementById('modalEditTitle').textContent = 'Agregar Plato';
  document.getElementById('editItemId').value = '';
  document.getElementById('editItemSource').value = source;
  document.getElementById('editItemNombre').value = '';
  document.getElementById('editItemPrecio').value = '';
  document.getElementById('editItemEmoji').value = '🍲';
  document.getElementById('editItemDesc').value = '';
  document.getElementById('editItemDisponible').checked = true;

  const defaultCats = { cocina: 'Platos', salad: 'Ensaladas', burgers: 'Hamburguesas', pasta: 'Pastas' };
  document.getElementById('editItemCategoria').value = defaultCats[source] || 'Platos';

  document.getElementById('modalEditItem').classList.add('active');
  document.getElementById('editItemNombre').focus();
}

function editItem(source, id) {
  currentMenuSource = source;
  const data = getMenuDataForSource(source);
  const item = data.find(i => i.id === id);
  if (!item) return;

  document.getElementById('modalEditTitle').textContent = 'Editar Plato';
  document.getElementById('editItemId').value = item.id;
  document.getElementById('editItemSource').value = source;
  document.getElementById('editItemNombre').value = item.nombre;
  document.getElementById('editItemPrecio').value = item.precio;
  document.getElementById('editItemEmoji').value = item.imagen;
  document.getElementById('editItemDesc').value = item.descripcion;
  document.getElementById('editItemCategoria').value = item.categoria || 'Platos';
  document.getElementById('editItemDisponible').checked = item.disponible !== false;

  document.getElementById('modalEditItem').classList.add('active');
  document.getElementById('editItemNombre').focus();
}

async function saveItem() {
  const id = document.getElementById('editItemId').value;
  const source = document.getElementById('editItemSource').value;
  const nombre = document.getElementById('editItemNombre').value.trim();
  const precio = parseInt(document.getElementById('editItemPrecio').value);
  const emoji = document.getElementById('editItemEmoji').value.trim();
  const desc = document.getElementById('editItemDesc').value.trim();
  const cat = document.getElementById('editItemCategoria').value;
  const disponible = document.getElementById('editItemDisponible').checked;

  if (!nombre) { showToast('Escribe un nombre', true); return; }
  if (!precio && precio !== 0) { showToast('Escribe un precio', true); return; }

  const data = getMenuDataForSource(source);

  if (id) {
    const idx = data.findIndex(i => i.id === parseInt(id));
    if (idx > -1) {
      data[idx].nombre = nombre;
      data[idx].precio = precio;
      data[idx].imagen = emoji || '🍲';
      data[idx].descripcion = desc;
      data[idx].categoria = cat;
      data[idx].disponible = disponible;
    }
  } else {
    const newId = Math.max(0, ...data.map(i => i.id)) + 1;
    data.push({ id: newId, nombre, precio, imagen: emoji || '🍲', descripcion: desc, categoria: cat, disponible });
  }

  try {
    await saveMenuForSource(source, data);
    await reloadMenuForSource(source);
    setConnectionStatus(true);
    closeModal();
    showToast(id ? 'Plato actualizado' : 'Plato agregado');
  } catch (e) {
    console.error('Error saving item:', e);
    setConnectionStatus(false);
    showToast('Error al guardar', true);
  }
}

async function duplicateItem(source, id) {
  const data = getMenuDataForSource(source);
  const item = data.find(i => i.id === id);
  if (!item) return;

  const newId = Math.max(0, ...data.map(i => i.id)) + 1;
  data.push({ ...item, id: newId, nombre: item.nombre + ' (copia)' });

  try {
    await saveMenuForSource(source, data);
    await reloadMenuForSource(source);
    setConnectionStatus(true);
    showToast('Plato duplicado');
  } catch (e) {
    setConnectionStatus(false);
    showToast('Error al duplicar', true);
  }
}

function confirmDelete(source, id, nombre) {
  document.getElementById('confirmMessage').textContent = `Eliminar "${nombre}"?`;
  document.getElementById('confirmBtn').onclick = function() {
    deleteItem(source, id);
    closeConfirm();
  };
  document.getElementById('modalConfirm').classList.add('active');
}

async function deleteItem(source, id) {
  let data = getMenuDataForSource(source);
  data = data.filter(i => i.id !== id);

  try {
    await saveMenuForSource(source, data);
    await reloadMenuForSource(source);
    setConnectionStatus(true);
    showToast('Plato eliminado');
  } catch (e) {
    setConnectionStatus(false);
    showToast('Error al eliminar', true);
  }
}

function closeModal() { document.getElementById('modalEditItem').classList.remove('active'); }
function closeConfirm() { document.getElementById('modalConfirm').classList.remove('active'); }

// ============================================
// TIME FORMAT HELPERS
// ============================================

function hourToTimeString(h) {
  if (h === 0 || h === 24) return '00:00';
  if (h < 10) return '0' + h + ':00';
  return h + ':00';
}

function timeStringToHour(str) {
  if (!str) return 0;
  const parts = str.split(':');
  return parseInt(parts[0]) || 0;
}

function hourTo12h(h) {
  if (h === 0 || h === 24) return '12:00 AM';
  if (h === 12) return '12:00 PM';
  if (h < 12) return h + ':00 AM';
  return (h - 12) + ':00 PM';
}

// ============================================
// HORARIOS
// ============================================

function getHorariosData() {
  return adminHorarios || JSON.parse(JSON.stringify(DEFAULT_HORARIOS));
}

async function loadHorarios() {
  try {
    const result = await Storage.getHorarios();
    adminHorarios = result || JSON.parse(JSON.stringify(DEFAULT_HORARIOS));
    setConnectionStatus(true);
  } catch (e) {
    adminHorarios = JSON.parse(JSON.stringify(DEFAULT_HORARIOS));
    setConnectionStatus(false);
  }

  const data = adminHorarios;
  ['cocina', 'salad', 'burgers', 'pasta'].forEach(neg => {
    if (data[neg]) loadHorarioForm(neg, data[neg]);
  });
}

function loadHorarioForm(prefix, config) {
  const diasMap = {0:'Dom', 1:'Lun', 2:'Mar', 3:'Mie', 4:'Jue', 5:'Vie', 6:'Sab'};
  Object.keys(diasMap).forEach(dia => {
    const el = document.getElementById(prefix + diasMap[dia]);
    if (el) el.checked = config.dias.includes(parseInt(dia));
  });

  const aperturaEl = document.getElementById(prefix + 'Apertura');
  const cierreEl = document.getElementById(prefix + 'Cierre');
  const aperturaLabelEl = document.getElementById(prefix + 'AperturaLabel');
  const cierreLabelEl = document.getElementById(prefix + 'CierreLabel');

  if (aperturaEl) {
    aperturaEl.value = hourToTimeString(config.apertura);
    if (aperturaLabelEl) aperturaLabelEl.textContent = hourTo12h(config.apertura);
  }
  if (cierreEl) {
    const cierreVal = config.cierre === 24 ? 0 : config.cierre;
    cierreEl.value = hourToTimeString(cierreVal);
    if (cierreLabelEl) cierreLabelEl.textContent = config.cierre === 24 ? '12:00 AM (medianoche)' : hourTo12h(config.cierre);
  }
}

async function saveHorarios(negocio) {
  const data = getHorariosData();
  const diasMap = {0:'Dom', 1:'Lun', 2:'Mar', 3:'Mie', 4:'Jue', 5:'Vie', 6:'Sab'};

  const dias = [];
  Object.keys(diasMap).forEach(dia => {
    const el = document.getElementById(negocio + diasMap[dia]);
    if (el && el.checked) dias.push(parseInt(dia));
  });

  if (dias.length === 0) { showToast('Selecciona al menos un dia', true); return; }

  data[negocio].dias = dias;
  data[negocio].apertura = timeStringToHour(document.getElementById(negocio + 'Apertura').value);
  data[negocio].cierre = timeStringToHour(document.getElementById(negocio + 'Cierre').value);

  if (data[negocio].cierre === 0 && data[negocio].apertura > 0) data[negocio].cierre = 24;

  const diasNombres = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  const diaInicio = diasNombres[dias[0] || 0];
  const diaFin = diasNombres[dias[dias.length - 1] || 0];
  data[negocio].mensaje = `${diaInicio} a ${diaFin} de ${hourTo12h(data[negocio].apertura)} a ${hourTo12h(data[negocio].cierre === 24 ? 0 : data[negocio].cierre)}`;

  try {
    await Storage.setHorarios(data);
    adminHorarios = data;
    setConnectionStatus(true);
    showToast('Horarios guardados');
  } catch (e) {
    setConnectionStatus(false);
    showToast('Error al guardar horarios', true);
  }
}

// ============================================
// BACKUP / IMPORT / EXPORT
// ============================================

async function exportData() {
  try {
    const data = await Storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medio-urbano-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setConnectionStatus(true);
    showToast('Backup descargado');
  } catch (e) {
    showToast('Error al exportar', true);
  }
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (await Storage.importAll(data)) {
        await loadAllData();
        setConnectionStatus(true);
        showToast('Datos importados correctamente');
      } else {
        showToast('Archivo invalido', true);
      }
    } catch (err) {
      showToast('Error al leer el archivo', true);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

async function resetAll() {
  if (!confirm('Esto borrara TODOS los datos de Firestore y restaura valores predeterminados. Continuar?')) return;
  if (!confirm('Ultima oportunidad. Seguro?')) return;

  try {
    await Storage.setMenuCocina(menuCocina);
    await Storage.setMenuSalad(menuSalad);
    await Storage.setMenuBurgers(menuBurgers);
    await Storage.setMenuPasta(menuPasta);
    await Storage.setHorarios(DEFAULT_HORARIOS);
    await loadAllData();
    setConnectionStatus(true);
    showToast('Datos reseteados');
  } catch (e) {
    setConnectionStatus(false);
    showToast('Error al resetear', true);
  }
}

// ============================================
// MODAL KEYBOARD NAV
// ============================================

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { closeModal(); closeConfirm(); }
});

// ============================================
// TOAST
// ============================================

function showToast(message, isError = false) {
  const toast = document.getElementById('adminToast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'admin-toast' + (isError ? ' error' : '');
  toast.classList.add('visible');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('visible'), 2500);
}

// ============================================
// START
// ============================================

init();
