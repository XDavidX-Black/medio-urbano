// ============================================
// MENU - MEDIO URBANO SALAD
// Ensaladas pre-armadas
// ============================================

const menuSalad = [
  // ENSALADAS
  {
    id: 501,
    nombre: "Caesar",
    precio: 85,
    descripcion: "Lechuga romana, pollo a la plancha, crotones de pan, queso parmesano y aderezo caesar",
    imagen: "🥗",
    categoria: "Ensaladas",
    disponible: true
  },
  {
    id: 502,
    nombre: "Mediterranea",
    precio: 90,
    descripcion: "Mix de lechugas, tomate cherry, pepino, aceitunas negras, queso feta y aderezo griego",
    imagen: "🥗",
    categoria: "Ensaladas",
    disponible: true
  },
  {
    id: 503,
    nombre: "Tropical",
    precio: 85,
    descripcion: "Lechuga, mango, aguacate, jicama, pepino, linaza y aderezo de limon",
    imagen: "🥗",
    categoria: "Ensaladas",
    disponible: true
  },
  {
    id: 504,
    nombre: "Mexicana",
    precio: 80,
    descripcion: "Lechuga, elote, aguacate, tomate, cebolla morada, cilantro y vinagreta",
    imagen: "🥗",
    categoria: "Ensaladas",
    disponible: true
  },
  {
    id: 505,
    nombre: "De Pollo",
    precio: 90,
    descripcion: "Mix de lechugas, pechuga de pollo a la plancha, zanahoria, pepino y aderezo ranch",
    imagen: "🥗",
    categoria: "Ensaladas",
    disponible: true
  },
  {
    id: 506,
    nombre: "VIP",
    precio: 110,
    descripcion: "Mix de lechugas, salmon, aguacate, mango, pepino, ajonjoli y aderezo especial",
    imagen: "🥗",
    categoria: "Ensaladas",
    disponible: true
  },

  // COMPLEMENTOS
  {
    id: 507,
    nombre: "Pan de Ajo",
    precio: 25,
    descripcion: "Pan de ajo crujiente con mantequilla y ajo",
    imagen: "🍞",
    categoria: "Complementos",
    disponible: true
  },
  {
    id: 508,
    nombre: "Papas Gajo",
    precio: 45,
    descripcion: "Papas gajo sazonadas con especias",
    imagen: "🍟",
    categoria: "Complementos",
    disponible: true
  },

  // BEBIDAS
  {
    id: 509,
    nombre: "Agua Fresca",
    precio: 25,
    descripcion: "Horchata, jamaica o limonada natural",
    imagen: "🥤",
    categoria: "Bebidas",
    disponible: true
  },
  {
    id: 510,
    nombre: "Agua Mineral",
    precio: 20,
    descripcion: "Botella de agua mineral",
    imagen: "💧",
    categoria: "Bebidas",
    disponible: true
  }
];

// INSTRUCCIONES:
// - Para agregar una ensalada, copia un bloque y modificalo
// - Para quitar, borra el bloque o pon "disponible: false"
// - Las categorias son: "Ensaladas", "Complementos", "Bebidas"
// - Pon "disponible: false" para productos agotados
