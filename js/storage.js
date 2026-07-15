// ============================================
// MEDIO URBANO - Storage Manager (Firebase Firestore)
// ============================================

const Storage = {
  _getDoc(collection, doc) {
    if (!db) throw new Error('Firestore not available');
    return db.collection(collection).doc(doc);
  },

  async get(collection, doc) {
    try {
      const snapshot = await this._getDoc(collection, doc).get();
      return snapshot.exists ? snapshot.data() : null;
    } catch (e) {
      console.warn('Firestore read failed:', collection, doc);
      return null;
    }
  },

  async set(collection, doc, data) {
    try {
      await this._getDoc(collection, doc).set(data);
      return true;
    } catch (e) {
      console.warn('Firestore write failed:', collection, doc);
      return false;
    }
  },

  onSnapshot(collection, doc, callback) {
    if (!db) return () => {};
    return this._getDoc(collection, doc).onSnapshot(snapshot => {
      if (snapshot.exists) callback(snapshot.data());
    }, error => {});
  },

  // MENU COCINA
  async getMenuCocina() { return await this.get('menus', 'cocina'); },
  async setMenuCocina(menu) { return await this.set('menus', 'cocina', { items: menu }); },
  onMenuCocinaChange(cb) { return this.onSnapshot('menus', 'cocina', d => cb(d.items)); },

  // MENU SALAD
  async getMenuSalad() { return await this.get('menus', 'salad'); },
  async setMenuSalad(menu) { return await this.set('menus', 'salad', { items: menu }); },
  onMenuSaladChange(cb) { return this.onSnapshot('menus', 'salad', d => cb(d.items)); },

  // MENU BURGERS
  async getMenuBurgers() { return await this.get('menus', 'burgers'); },
  async setMenuBurgers(menu) { return await this.set('menus', 'burgers', { items: menu }); },
  onMenuBurgersChange(cb) { return this.onSnapshot('menus', 'burgers', d => cb(d.items)); },

  // MENU PASTA
  async getMenuPasta() { return await this.get('menus', 'pasta'); },
  async setMenuPasta(menu) { return await this.set('menus', 'pasta', { items: menu }); },
  onMenuPastaChange(cb) { return this.onSnapshot('menus', 'pasta', d => cb(d.items)); },

  // HORARIOS
  async getHorarios() { return await this.get('config', 'horarios'); },
  async setHorarios(horarios) { return await this.set('config', 'horarios', horarios); },
  onHorariosChange(cb) { return this.onSnapshot('config', 'horarios', d => cb(d)); },

  // CONFIG
  async getConfig() {
    const data = await this.get('config', 'general');
    return data || { whatsappNumber: '529983852946' };
  },

  async setConfig(config) { return await this.set('config', 'general', config); },

  // SEED
  async seedIfNeeded(defaultMenus, defaultHorarios) {
    if (!db) return;
    const [cocina, salad, burgers, pasta, horarios] = await Promise.allSettled([
      this.getMenuCocina(),
      this.getMenuSalad(),
      this.getMenuBurgers(),
      this.getMenuPasta(),
      this.getHorarios()
    ]);
    if (cocina.status === 'fulfilled' && !cocina.value) await this.setMenuCocina(defaultMenus.cocina);
    if (salad.status === 'fulfilled' && !salad.value) await this.setMenuSalad(defaultMenus.salad);
    if (burgers.status === 'fulfilled' && !burgers.value) await this.setMenuBurgers(defaultMenus.burgers);
    if (pasta.status === 'fulfilled' && !pasta.value) await this.setMenuPasta(defaultMenus.pasta);
    if (horarios.status === 'fulfilled' && !horarios.value) await this.setHorarios(defaultHorarios);
  },

  // EXPORT / IMPORT
  async exportAll() {
    const [cocina, salad, burgers, pasta, horarios, config] = await Promise.allSettled([
      this.getMenuCocina(), this.getMenuSalad(), this.getMenuBurgers(),
      this.getMenuPasta(), this.getHorarios(), this.getConfig()
    ]);
    return {
      version: '3.0', fecha: new Date().toISOString(),
      menuCocina: cocina.status === 'fulfilled' ? cocina.value : null,
      menuSalad: salad.status === 'fulfilled' ? salad.value : null,
      menuBurgers: burgers.status === 'fulfilled' ? burgers.value : null,
      menuPasta: pasta.status === 'fulfilled' ? pasta.value : null,
      horarios: horarios.status === 'fulfilled' ? horarios.value : null,
      config: config.status === 'fulfilled' ? config.value : null
    };
  },

  async importAll(data) {
    if (!data || !data.version) return false;
    if (data.menuCocina) await this.setMenuCocina(data.menuCocina.items || data.menuCocina);
    if (data.menuSalad) await this.setMenuSalad(data.menuSalad.items || data.menuSalad);
    if (data.menuBurgers) await this.setMenuBurgers(data.menuBurgers.items || data.menuBurgers);
    if (data.menuPasta) await this.setMenuPasta(data.menuPasta.items || data.menuPasta);
    if (data.horarios) await this.setHorarios(data.horarios);
    if (data.config) await this.setConfig(data.config);
    return true;
  },

  // AUTH
  isAuthenticated() { return sessionStorage.getItem('mu_admin_auth') === 'true'; },
  setAuthenticated(value) { sessionStorage.setItem('mu_admin_auth', value); }
};
