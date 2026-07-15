/*====================================================
notifications.js - MEDIO URBANO V3
====================================================*/

const notificationContainer=document.createElement("div");
notificationContainer.id="notifications";
document.body.appendChild(notificationContainer);

function notify({title="MEDIO URBANO",message="",type="info",time=3500,icon="fa-bell"}){
  const toast=document.createElement("div");
  toast.className=`toast ${type}`;
  toast.innerHTML=`
    <div class="toast-icon"><i class="fas ${icon}"></i></div>
    <div class="toast-content"><h4>${title}</h4><p>${message}</p></div>
    <button class="toast-close"><i class="fas fa-times"></i></button>
    <div class="toast-progress"></div>`;
  notificationContainer.appendChild(toast);
  setTimeout(()=>{toast.classList.add("show");},50);
  toast.querySelector(".toast-close").addEventListener("click",()=>{removeToast(toast);});
  setTimeout(()=>{removeToast(toast);},time);
}

function removeToast(toast){
  toast.classList.remove("show");
  toast.classList.add("hide");
  setTimeout(()=>{toast.remove();},400);
}

function success(msg){notify({title:"Éxito",message:msg,type:"success",icon:"fa-circle-check"});}
function error(msg){notify({title:"Error",message:msg,type:"error",icon:"fa-circle-xmark"});}
function warning(msg){notify({title:"Advertencia",message:msg,type:"warning",icon:"fa-triangle-exclamation"});}
function info(msg){notify({title:"Información",message:msg,type:"info",icon:"fa-circle-info"});}

document.addEventListener("click",(e)=>{
  if(e.target.closest(".btn-brand")) success("Producto agregado al carrito.");
});

function pedidoEnviado(){success("Pedido enviado correctamente.");lanzarConfeti();}

window.addEventListener("offline",()=>{warning("No tienes conexión a Internet.");});
window.addEventListener("online",()=>{success("Conexión restablecida.");});

window.addEventListener("load",()=>{setTimeout(()=>{info("¡Bienvenido a Medio Urbano!");},1800);});

function validarCampo(campo){
  if(campo.value.trim()===""){shake(campo);error("Completa todos los campos.");return false;}
  return true;
}

function showLoader(){
  const loader=document.createElement("div");
  loader.id="globalLoader";
  loader.innerHTML=`<div class="loader-spinner"></div>`;
  document.body.appendChild(loader);
}
function hideLoader(){
  const loader=document.querySelector("#globalLoader");
  if(loader) loader.remove();
}

function copiar(texto){navigator.clipboard.writeText(texto);success("Copiado al portapapeles.");}