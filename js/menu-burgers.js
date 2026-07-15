// ============================================
// MENU - MEDIO URBANO BURGERS
// Hamburguesas, Hot Dogs y Papas
// ============================================

const menuBurgers = [
  // HAMBURGUESAS
  {
    id: 101,
    nombre: "Sencilla",
    precio: 70,
    descripcion: "Carne de res jugosa, lechuga fresca, tomate rojo, cebolla crujiente, queso derretido y aderezo",
    imagen: "🍔",
    categoria: "Hamburguesas",
    disponible: true
  },
  {
    id: 102,
    nombre: "Hawaiana",
    precio: 85,
    descripcion: "Carne de res con jamon, piña dorada, queso fundido, lechuga, tomate y aderezo",
    imagen: "🍔",
    categoria: "Hamburguesas",
    disponible: true
  },
  {
    id: 103,
    nombre: "Pizza",
    precio: 85,
    descripcion: "Carne de res con pepperoni, salsa de pizza, queso mozzarella derretido y oregano",
    imagen: "🍔",
    categoria: "Hamburguesas",
    disponible: true
  },
  {
    id: 104,
    nombre: "Bacon",
    precio: 90,
    descripcion: "Carne de res, tiras de tocino crujiente, queso fundido, lechuga, tomate, cebolla y aderezo",
    imagen: "🍔",
    categoria: "Hamburguesas",
    disponible: true
  },
  {
    id: 105,
    nombre: "Mexa",
    precio: 90,
    descripcion: "Carne de res con jalapeños, guacamole cremoso, queso fundido, lechuga, tomate y aderezo chipotle",
    imagen: "🍔",
    categoria: "Hamburguesas",
    disponible: true
  },

  // HOT DOGS
  {
    id: 201,
    nombre: "Sencillo",
    precio: 45,
    descripcion: "Salchicha de res en pan suave, catsup, mostaza, cebolla y relish",
    imagen: "🌭",
    categoria: "Hot Dogs",
    disponible: true
  },
  {
    id: 202,
    nombre: "Hawaiano",
    precio: 55,
    descripcion: "Salchicha de res con jamon y piña, catsup, mostaza y aderezo",
    imagen: "🌭",
    categoria: "Hot Dogs",
    disponible: true
  },
  {
    id: 203,
    nombre: "Pizza",
    precio: 60,
    descripcion: "Salchicha de res con salsa de pizza, queso mozzarella, pepperoni y oregano",
    imagen: "🌭",
    categoria: "Hot Dogs",
    disponible: true
  },
  {
    id: 204,
    nombre: "Bacon",
    precio: 60,
    descripcion: "Salchicha de res, tiras de tocino crujiente, catsup, mostaza y cebolla",
    imagen: "🌭",
    categoria: "Hot Dogs",
    disponible: true
  },
  {
    id: 205,
    nombre: "Mexa",
    precio: 65,
    descripcion: "Salchicha de res con jalapeños, guacamole, cebolla, catsup y aderezo chipotle",
    imagen: "🌭",
    categoria: "Hot Dogs",
    disponible: true
  },

  // PAPAS
  {
    id: 301,
    nombre: "Papas",
    precio: 40,
    descripcion: "Papas fritas clasicas, doradas y crujientes",
    imagen: "🍟",
    categoria: "Papas",
    disponible: true
  },
  {
    id: 302,
    nombre: "Papas con bacon",
    precio: 55,
    descripcion: "Papas fritas con tiras de bacon crujiente encima",
    imagen: "🍟",
    categoria: "Papas",
    disponible: true
  },
  {
    id: 303,
    nombre: "Papas con queso",
    precio: 50,
    descripcion: "Papas fritas banadas en queso fundido",
    imagen: "🍟",
    categoria: "Papas",
    disponible: true
  }
];

// INSTRUCCIONES:
// - Para agregar un producto, copia un bloque y modificalo
// - Para quitar, borra el bloque o pon "disponible: false"
// - Las categorias son: "Hamburguesas", "Hot Dogs", "Papas"
// - Pon "disponible: false" para productos agotados
