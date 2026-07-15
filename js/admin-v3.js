/*====================================================
admin.js - MEDIO URBANO V3
=====================================================*/

const ADMIN_PASSWORD="medio123";

function login(){
  const password=document.getElementById("password").value;
  if(password===ADMIN_PASSWORD){
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
    if(e.dataTransfer.files.length){
      procesarImagen(e.dataTransfer.files[0]);
    }
  });
  imagenFile.addEventListener("change",e=>{
    if(e.target.files.length) procesarImagen(e.target.files[0]);
  });
}

function procesarImagen(file){
  if(!file.type.startsWith("image/")){
    alert("Solo se permiten imágenes");
    return;
  }
  if(file.size>500000){
    alert("Imagen muy grande. Máximo 500KB");
    return;
  }
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();
    img.onload=()=>{
      const canvas=document.createElement("canvas");
      const MAX=400;
      let w=img.width,h=img.height;
      if(w>h){if(w>MAX){h=h*MAX/w;w=MAX;}}
      else{if(h>MAX){w=w*MAX/h;h=MAX;}}
      canvas.width=w;
      canvas.height=h;
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

/* PRODUCTOS */
let productos=JSON.parse(localStorage.getItem("productos"))||[];

function guardarProductos(){
  localStorage.setItem("productos",JSON.stringify(productos));
  window.dispatchEvent(new Event("productosUpdated"));
}

function agregarProducto(){
  const nombre=document.getElementById("nombre").value.trim();
  const precio=document.getElementById("precio").value.trim();
  const descripcion=document.getElementById("descripcion").value.trim();
  const categoria=document.getElementById("categoria").value;
  const imagen=document.getElementById("imagen").value;
  if(!nombre){alert("Ingresa el nombre del producto");return;}
  productos.push({id:Date.now(),nombre,precio,descripcion,categoria,imagen});
  guardarProductos();
  mostrarProductos();
  limpiarFormulario();
}

function limpiarFormulario(){
  document.getElementById("nombre").value="";
  document.getElementById("precio").value="";
  document.getElementById("descripcion").value="";
  limpiarImagen();
}

function eliminarProducto(id){
  productos=productos.filter(p=>p.id!==id);
  guardarProductos();
  mostrarProductos();
}

function editarProducto(id){
  const p=productos.find(item=>item.id===id);
  document.getElementById("nombre").value=p.nombre;
  document.getElementById("precio").value=p.precio;
  document.getElementById("descripcion").value=p.descripcion;
  document.getElementById("categoria").value=p.categoria;
  if(p.imagen&&p.imagen.startsWith("data:")){
    imagenBase64=p.imagen;
    previewImg.src=p.imagen;
    imagenPreview.style.display="block";
    uploadArea.style.display="none";
  }else{
    document.getElementById("imagen").value=p.imagen||"";
  }
  eliminarProducto(id);
}

function mostrarProductos(){
  const tabla=document.getElementById("tablaProductos");
  if(!tabla) return;
  tabla.innerHTML="";
  productos.forEach(producto=>{
    tabla.innerHTML+=`
      <tr>
        <td><img src="${producto.imagen||''}" width="60" style="border-radius:8px;${producto.imagen?'':'display:none;'}"></td>
        <td>${producto.nombre}</td>
        <td>${producto.categoria}</td>
        <td>$${producto.precio}</td>
        <td>
          <button onclick="editarProducto(${producto.id})" class="edit-btn">Editar</button>
          <button onclick="eliminarProducto(${producto.id})" class="delete-btn">Eliminar</button>
        </td>
      </tr>`;
  });
}

/* PROMOCIONES */
let promociones=JSON.parse(localStorage.getItem("promociones"))||[];

function agregarPromo(){
  const titulo=document.getElementById("promoTitulo").value.trim();
  const precio=document.getElementById("promoPrecio").value.trim();
  const imagen=document.getElementById("promoImagen").value.trim();
  if(!titulo){alert("Ingresa el título");return;}
  promociones.push({id:Date.now(),titulo,precio,imagen});
  localStorage.setItem("promociones",JSON.stringify(promociones));
  window.dispatchEvent(new Event("promosUpdated"));
  mostrarPromos();
}

function mostrarPromos(){
  const lista=document.getElementById("tablaPromos");
  if(!lista) return;
  lista.innerHTML="";
  promociones.forEach(p=>{
    lista.innerHTML+=`
      <tr>
        <td><img src="${p.imagen||''}" width="70" style="border-radius:8px;"></td>
        <td>${p.titulo}</td>
        <td>$${p.precio}</td>
        <td><button onclick="eliminarPromo(${p.id})" class="delete-btn">Eliminar</button></td>
      </tr>`;
  });
}

function eliminarPromo(id){
  promociones=promociones.filter(p=>p.id!==id);
  localStorage.setItem("promociones",JSON.stringify(promociones));
  window.dispatchEvent(new Event("promosUpdated"));
  mostrarPromos();
}

window.onload=()=>{
  mostrarProductos();
  mostrarPromos();
};
