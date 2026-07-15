// ============================================
// MENU - MEDIO URBANO PASTA
// Pasta Boloñesa, Pesto y Alfredo
// ============================================

const menuPasta = [
  // PASTAS
  {
    id: 601,
    nombre: "Boloñesa",
    precio: 105,
    descripcion: "Espagueti con salsa boloñesa de carne molida, tomate natural y especias",
    imagen: "🍝",
    categoria: "Pastas",
    disponible: true
  },
  {
    id: 602,
    nombre: "Pesto",
    precio: 100,
    descripcion: "Penne con salsa pesto de albahaca, ajo, piñones y parmesano",
   imagen: "🍝",
    categoria: "Pastas",
    disponible: true
  },
  {
    id: 603,
    nombre: "Alfredo",
    precio: 105,
    descripcion: "Fettuccine con salsa alfredo cremosa, parmesano y mantequilla",
    imagen: "🍝",
    categoria: "Pastas",
    disponible: true
  },
  {
    id: 604,
    nombre: "Carbonara",
    precio: 110,
    descripcion: "Espagueti con huevo, queso parmesano, tocino crujiente y pimienta negra",
    imagen: "🍝",
    categoria: "Pastas",
    disponible: true
  },
  {
    id: 605,
    nombre: "Arrabiata",
    precio: 95,
    descripcion: "Penne con salsa de tomate picante, ajo y chile rojo",
    imagen: "🍝",
    categoria: "Pastas",
    disponible: true
  },
  {
    id: 606,
    nombre: "4 Quesos",
    precio: 115,
    descripcion: "Fettuccine con salsa de cuatro quesos: mozzarella, gorgonzola, parmesano y ricotta",
    imagen: "🍝",
    categoria: "Pastas",
    disponible: true
  },

  // COMPLEMENTOS
  {
    id: 607,
    nombre: "Pan con Ajo",
    precio: 25,
    descripcion: "Pan tostado con mantequilla de ajo y perejil",
    imagen: "🍞",
    categoria: "Complementos",
    disponible: true
  },
  {
    id: 608,
    nombre: "Ensalada del Dia",
    precio: 35,
    descripcion: "Ensalada fresca del dia con vinagreta",
    imagen: "🥗",
    categoria: "Complementos",
    disponible: true
  },

  // BEBIDAS
  {
    id: 609,
    nombre: "Refresco",
    precio: 25,
    descripcion: "Coca-Cola, Sprite o Fanta",
    imagen: "🥤",
    categoria: "Bebidas",
    disponible: true
  },
  {
    id: 610,
    nombre: "Agua Mineral",
    precio: 20,
    descripcion: "Botella de agua mineral",
    imagen: "💧",
    categoria: "Bebidas",
    disponible: true
  }
];

// INSTRUCCIONES:
// - Para agregar una pasta, copia un bloque y modificalo
// - Para quitar, borra el bloque o pon "disponible: false"
// - Las categorias son: "Pastas", "Complementos", "Bebidas"
// - Pon "disponible: false" para productos agotados
