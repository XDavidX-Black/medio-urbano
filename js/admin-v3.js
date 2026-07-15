/*====================================================
admin.js - MEDIO URBANO V3
CRUD Productos via Firestore (real-time sync)
=====================================================*/

const ADMIN_PASSWORD="medio123";

function login(){
  const password=document.getElementById("password").value;
  const stored=localStorage.getItem("adminPassword")||ADMIN_PASSWORD;
  if(password===stored){
    localStorage.setItem("admin","true");
    window.location="panel-v3.html";
  }else{
    alert("Contraseña incorrecta");
  }
}

if(location.pathname.includes("panel")){
  if(localStorage.getItem("admin")!="true"){
    window.location="admin-v3.html";
  }
}

function logout(){
  localStorage.removeItem("admin");
  window.location="test.html";
}

/* IMAGE UPLOAD HANDLING */
let imagenBase64="";
let editProductId=null;

const uploadArea=document.getElementById("uploadArea");
const imagenFile=document.getElementById("imagenFile");
const imagenPreview=document.getElementById("imagenPreview");
const previewImg=document.getElementById("previewImg");

if(uploadArea){
  uploadArea.addEventListener("click",()=>imagenFile.click());
  uploadArea.addEventListener("dragover",e=>{e.preventDefault();uploadArea.classList.add("dragover");});
  uploadArea.addEventListener("dragleave",()=>uploadArea.classList.remove("dragover"));
  uploadArea.addEventListener("drop",e=>{
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    if(e.dataTransfer.files.length) procesarImagen(e.dataTransfer.files[0]);
  });
  imagenFile.addEventListener("change",e=>{
    if(e.target.files.length) procesarImagen(e.target.files[0]);
  });
}

function procesarImagen(file){
  if(!file.type.startsWith("image/")){alert("Solo se permiten imágenes");return;}
  if(file.size>500000){alert("Imagen muy grande. Máximo 500KB");return;}
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();
    img.onload=()=>{
      const canvas=document.createElement("canvas");
      const MAX=400;
      let w=img.width,h=img.height;
      if(w>h){if(w>MAX){h=h*MAX/w;w=MAX;}}
      else{if(h>MAX){w=w*MAX/h;h=MAX;}}
      canvas.width=w;canvas.height=h;
      canvas.getContext("2d").drawImage(img,0,0,w,h);
      imagenBase64=canvas.toDataURL("image/jpeg",0.7);
      previewImg.src=imagenBase64;
      imagenPreview.style.display="block";
      uploadArea.style.display="none";
      document.getElementById("imagen").value=imagenBase64;
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}

function limpiarImagen(){
  imagenBase64="";
  document.getElementById("imagen").value="";
  previewImg.src="";
  imagenPreview.style.display="none";
  uploadArea.style.display="flex";
  if(imagenFile) imagenFile.value="";
}

/* EXTRAS */
let currentExtras=[];

function agregarExtra(){
  const nombre=document.getElementById("extraNombre").value.trim();
  const precio=Number(document.getElementById("extraPrecio").value)||0;
  if(!nombre){return;}
  currentExtras.push({nombre,precio,activo:true});
  document.getElementById("extraNombre").value="";
  document.getElementById("extraPrecio").value="";
  renderExtras();
}

function removeExtra(i){
  currentExtras.splice(i,1);
  renderExtras();
}

function renderExtras(){
  const el=document.getElementById("extrasList");
  if(!el) return;
  el.innerHTML="";
  currentExtras.forEach((ex,i)=>{
    el.innerHTML+=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px;color:#ccc;">
      <span style="flex:1;">${ex.nombre} <span style="color:var(--primary);">+$${ex.precio}</span></span>
      <button onclick="removeExtra(${i})" style="padding:4px 10px;font-size:11px;background:#c62828;color:white;">X</button>
    </div>`;
  });
}

/* PRODUCTOS - FIRESTORE CRUD */
let productos=[];
let productosUnsub=null;

function initProductosFirestore(){
  if(typeof firebase==="undefined"||!firebase.firestore){
    console.warn("Firebase no disponible para productos");
    return;
  }
  productosUnsub=firebase.firestore().collection("productos").orderBy("orden","asc").onSnapshot(snap=>{
    productos=[];
    snap.forEach(doc=>productos.push({id:doc.id,...doc.data()}));
    mostrarProductos();
    updateStats();
  },err=>{
    console.error("Error productos snapshot:",err);
  });
}

function guardarProductoFirestore(data){
  return firebase.firestore().collection("productos").doc(data.id).set(data);
}

function eliminarProductoFirestore(id){
  return firebase.firestore().collection("productos").doc(id).delete();
}

function agregarProducto(){
  const nombre=document.getElementById("nombre").value.trim();
  const precio=document.getElementById("precio").value.trim();
  const descripcion=document.getElementById("descripcion").value.trim();
  const categoria=document.getElementById("categoria").value;
  const imagen=document.getElementById("imagen").value;
  const orden=Number(document.getElementById("prodOrden").value)||0;
  const estado=Number(document.getElementById("prodEstado").value);
  const destacado=document.getElementById("prodDestacado").checked;
  if(!nombre){alert("Ingresa el nombre del producto");return;}

  const data={
    nombre,precio,descripcion,categoria,imagen,orden,estado,destacado,
    extras:currentExtras,
    updatedAt:new Date().toISOString()
  };

  if(editProductId){
    data.id=editProductId;
    guardarProductoFirestore(data).then(()=>{
      if(typeof logAdminAction==="function") logAdminAction("producto","Producto editado",nombre+" · $"+precio+" · "+categoria);
    });
    editProductId=null;
    document.getElementById("prodFormTitle").textContent="Agregar Producto";
    document.getElementById("prodSaveBtn").textContent="Guardar";
  }else{
    data.id=String(Date.now());
    data.createdAt=new Date().toISOString();
    guardarProductoFirestore(data).then(()=>{
      if(typeof logAdminAction==="function") logAdminAction("producto","Producto agregado",nombre+" · $"+precio+" · "+categoria);
    });
  }
  limpiarFormulario();
}

function limpiarFormulario(){
  document.getElementById("nombre").value="";
  document.getElementById("precio").value="";
  document.getElementById("descripcion").value="";
  document.getElementById("prodOrden").value="0";
  document.getElementById("prodEstado").value="1";
  document.getElementById("prodDestacado").checked=false;
  currentExtras=[];
  renderExtras();
  limpiarImagen();
  editProductId=null;
  document.getElementById("prodFormTitle").textContent="Agregar Producto";
  document.getElementById("prodSaveBtn").textContent="Guardar";
}

function eliminarProducto(id){
  if(!confirm("¿Eliminar producto?")) return;
  const p=productos.find(x=>x.id===id);
  eliminarProductoFirestore(id).then(()=>{
    if(typeof logAdminAction==="function") logAdminAction("producto","Producto eliminado",p?(p.nombre+" · "+p.categoria):"id:"+id);
  });
}

function editarProducto(id){
  const p=productos.find(item=>item.id===id);
  if(!p) return;
  editProductId=id;
  document.getElementById("nombre").value=p.nombre;
  document.getElementById("precio").value=p.precio;
  document.getElementById("descripcion").value=p.descripcion||"";
  document.getElementById("categoria").value=p.categoria;
  document.getElementById("prodOrden").value=p.orden||0;
  document.getElementById("prodEstado").value=p.estado!==undefined?p.estado:1;
  document.getElementById("prodDestacado").checked=!!p.destacado;
  currentExtras=p.extras?[...p.extras]:[];
  renderExtras();
  if(p.imagen&&p.imagen.startsWith("data:")){
    imagenBase64=p.imagen;
    previewImg.src=p.imagen;
    imagenPreview.style.display="block";
    uploadArea.style.display="none";
  }else{
    document.getElementById("imagen").value=p.imagen||"";
  }
  document.getElementById("prodFormTitle").textContent="Editar Producto";
  document.getElementById("prodSaveBtn").textContent="Actualizar";
  window.scrollTo({top:0,behavior:"smooth"});
}

function mostrarProductos(){
  const tabla=document.getElementById("tablaProductos");
  if(!tabla) return;
  const filtroCat=document.getElementById("filtroCategoria")?.value||"";
  const buscar=(document.getElementById("buscarProducto")?.value||"").toLowerCase();
  let filtered=productos;
  if(filtroCat) filtered=filtered.filter(p=>p.categoria===filtroCat);
  if(buscar) filtered=filtered.filter(p=>p.nombre.toLowerCase().includes(buscar));
  filtered.sort((a,b)=>(a.orden||0)-(b.orden||0));
  tabla.innerHTML="";
  const catNames={cocina:"Cocina",salad:"Salad",burgers:"Burgers",pasta:"Pasta"};
  filtered.forEach(producto=>{
    const disponible=producto.estado!==0;
    tabla.innerHTML+=`
      <tr>
        <td><img src="${producto.imagen||''}" width="50" style="border-radius:8px;${producto.imagen?'':'display:none;'}"></td>
        <td>${producto.nombre}</td>
        <td>${catNames[producto.categoria]||producto.categoria}</td>
        <td>$${producto.precio}</td>
        <td><span style="color:${disponible?'var(--success)':'var(--danger)'};font-weight:700;">${disponible?'Activo':'Inactivo'}</span></td>
        <td>${producto.destacado?'<i class="fas fa-star" style="color:var(--primary);"></i>':'<span style="color:#444;">—</span>'}</td>
        <td>${producto.orden||0}</td>
        <td>
          <button onclick="editarProducto('${producto.id}')" class="edit-btn">Editar</button>
          <button onclick="eliminarProducto('${producto.id}')" class="delete-btn">Eliminar</button>
        </td>
      </tr>`;
  });
}

function updateStats(){
  document.getElementById("statProductos").textContent=productos.length;
  if(typeof firebase!=="undefined"&&firebase.firestore){
    firebase.firestore().collection("promociones").get().then(snap=>{
      const el=document.getElementById("statPromos");
      if(el) el.textContent=snap.size;
    }).catch(()=>{});
  }
}

window.onload=()=>{
  initProductosFirestore();
};
