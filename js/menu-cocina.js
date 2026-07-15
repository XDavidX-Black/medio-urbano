// ============================================
// MENU - MEDIO URBANO COCINA
// Edita este archivo para cambiar el menu del dia
// ============================================

// MENU DEL DIA (platos fuertes)
const menuCocina = [
  {
    id: 1,
    nombre: "Pozole Rojo",
    precio: 85,
    descripcion: "Con ganache, lechuga, orina y tostadas",
    imagen: "🍲",
    categoria: "Platos",
    disponible: true
  },
  {
    id: 2,
    nombre: "Enchiladas Verdes",
    precio: 75,
    descripcion: "Relleno de pollo con crema y arroz",
    imagen: "🌮",
    categoria: "Platos",
    disponible: true
  },
  {
    id: 3,
    nombre: "Sopa de Tortilla",
    precio: 65,
    descripcion: "Caldo con tiras de tortilla, aguacate y queso",
    imagen: "🍜",
    categoria: "Platos",
    disponible: true
  },
  {
    id: 4,
    nombre: "Tacos al Pastor",
    precio: 60,
    descripcion: "3 tacos con piña, cilantro y cebolla",
    imagen: "🌮",
    categoria: "Platos",
    disponible: true
  },
  {
    id: 5,
    nombre: "Mole Poblano",
    precio: 95,
    descripcion: "Con pollo, arroz y frijoles",
    imagen: "🍛",
    categoria: "Platos",
    disponible: true
  },
  {
    id: 6,
    nombre: "Chiles Rellenos",
    precio: 80,
    descripcion: "Chile poblanado relleno de queso con salsa roja",
    imagen: "🌶️",
    categoria: "Platos",
    disponible: true
  }
];

// ============================================
// ENSALADA - CONFIGURACION
// Edita precios y opciones aqui
// ============================================

// DEFAULT_ENSALADA is now defined in app.js

// INSTRUCCIONES:
// - Para agregar un plato del dia, copia un bloque en menuCocina
// - Para cambiar precios de ensalada, edita ensaladaConfig
// - Pon "disponible: false" para platos agotados
