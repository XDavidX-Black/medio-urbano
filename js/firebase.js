/*====================================================
firebase.js - MEDIO URBANO V3
====================================================*/

const firebaseConfig={
  apiKey:"TU_API_KEY",
  authDomain:"medio-urbano.firebaseapp.com",
  projectId:"medio-urbano",
  storageBucket:"medio-urbano.appspot.com",
  messagingSenderId:"XXXXXXXX",
  appId:"XXXXXXXX"
};

firebase.initializeApp(firebaseConfig);
const db=firebase.firestore();
const storage=firebase.storage();
const auth=firebase.auth();

// LOGIN
function loginFirebase(email,password){
  return auth.signInWithEmailAndPassword(email,password)
    .then(()=>{success("Bienvenido Administrador");})
    .catch(e=>{error(e.message);});
}
function logoutFirebase(){auth.signOut();}

// PRODUCTOS
async function subirProducto(producto){
  try{await db.collection("productos").add(producto);success("Producto agregado.");}catch(e){console.error(e);}
}
async function obtenerProductos(){
  const snapshot=await db.collection("productos").get();
  let productos=[];
  snapshot.forEach(doc=>{productos.push({id:doc.id,...doc.data()});});
  return productos;
}
async function eliminarProductoFirebase(id){await db.collection("productos").doc(id).delete();}
async function actualizarProducto(id,data){await db.collection("productos").doc(id).update(data);}

// PEDIDOS
async function crearPedido(pedido){
  await db.collection("pedidos").add({...pedido,fecha:new Date(),estado:"Pendiente"});
}
async function escucharPedidos(){
  db.collection("pedidos").orderBy("fecha","desc").onSnapshot(snapshot=>{
    const pedidos=[];
    snapshot.forEach(doc=>{pedidos.push({id:doc.id,...doc.data()});});
    renderPedidos(pedidos);
  });
}

// PROMOCIONES
async function subirPromocion(data){await db.collection("promociones").add(data);}

// IMAGENES
async function subirImagen(file){
  const ref=storage.ref().child("productos/"+file.name);
  await ref.put(file);
  return await ref.getDownloadURL();
}
async function eliminarImagen(nombre){await storage.ref().child("productos/"+nombre).delete();}

// AUTH STATE
auth.onAuthStateChanged(user=>{
  if(user) console.log("Administrador conectado");
  else console.log("No autenticado");
});