/*====================================================
admin-promos.js - MEDIO URBANO V3
CRUD Promociones con Firestore (sin Storage)
Imágenes comprimidas guardadas como base64 en Firestore
=====================================================*/

let promosAdmin=[];
let promoEditId=null;

function initAdminPromos(){
  if(typeof firebase==="undefined"||!firebase.firestore){
    console.warn("Firebase no disponible para promos");
    return;
  }
  setupPromoUpload();
  loadAdminPromos();
}

/* ========== UPLOAD AREA ========== */
function setupPromoUpload(){
  const area=document.getElementById("promoUploadArea");
  const fileInput=document.getElementById("promoAdminFile");
  if(!area||!fileInput) return;
  area.addEventListener("click",()=>fileInput.click());
  area.addEventListener("dragover",e=>{e.preventDefault();area.classList.add("dragover");});
  area.addEventListener("dragleave",()=>area.classList.remove("dragover"));
  area.addEventListener("drop",e=>{e.preventDefault();area.classList.remove("dragover");if(e.dataTransfer.files.length)handlePromoFile(e.dataTransfer.files[0]);});
  fileInput.addEventListener("change",e=>{if(e.target.files.length)handlePromoFile(e.target.files[0]);});
}

function handlePromoFile(file){
  if(!file.type.startsWith("image/")){showPromoNotif("error","Solo imágenes");return;}
  const sizeEl=document.getElementById("promoImgSize");
  if(sizeEl) sizeEl.textContent="Original: "+(file.size/1024).toFixed(0)+"KB";
  const reader=new FileReader();
  reader.onload=e=>{
    compressImage(e.target.result,1200,600,0.6).then(result=>{
      document.getElementById("promoPreviewImg").src=result.dataUrl;
      document.getElementById("promoImgPreview").style.display="block";
      document.getElementById("promoUploadArea").style.display="none";
      if(sizeEl) sizeEl.textContent+=" → "+(result.dataUrl.length*0.75/1024).toFixed(0)+"KB (listo para Firestore)";
    });
  };
  reader.readAsDataURL(file);
}

function compressImage(dataUrl,maxW,maxH,quality){
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      const canvas=document.createElement("canvas");
      let w=img.width,h=img.height;
      if(w>maxW){h=h*maxW/w;w=maxW;}
      if(h>maxH){w=w*maxH/h;h=maxH;}
      canvas.width=w;canvas.height=h;
      canvas.getContext("2d").drawImage(img,0,0,w,h);
      resolve({dataUrl:canvas.toDataURL("image/jpeg",quality),width:w,height:h});
    };
    img.src=dataUrl;
  });
}

function limpiarPromoImagen(){
  document.getElementById("promoAdminFile").value="";
  document.getElementById("promoPreviewImg").src="";
  document.getElementById("promoImgPreview").style.display="none";
  document.getElementById("promoUploadArea").style.display="flex";
  document.getElementById("promoImgSize").textContent="";
}

/* ========== NOTIFICATION ========== */
function showPromoNotif(type,msg){
  const old=document.querySelector(".promo-notif");
  if(old) old.remove();
  const div=document.createElement("div");
  div.className="promo-notif";
  div.style.cssText="position:fixed;top:20px;right:20px;z-index:9999;padding:16px 24px;border-radius:14px;font-size:14px;font-weight:600;color:white;box-shadow:0 10px 30px rgba(0,0,0,.3);transition:transform .4s,opacity .4s;";
  div.style.background=type==="success"?"#35c759":type==="error"?"#ff3b30":"#ff9500";
  div.innerHTML='<i class="fas fa-'+(type==="success"?"check-circle":"times-circle")+'" style="margin-right:10px;"></i>'+msg;
  document.body.appendChild(div);
  setTimeout(()=>{div.style.transform="translateX(120%)";div.style.opacity="0";setTimeout(()=>div.remove(),400);},3000);
}

/* ========== LOAD ========== */
function loadAdminPromos(){
  firebase.firestore().collection("promociones").orderBy("orden","asc").get()
    .then(snap=>{
      promosAdmin=[];
      snap.forEach(doc=>promosAdmin.push({id:doc.id,...doc.data()}));
      renderAdminPromosTable();
      updatePromoStats();
    })
    .catch(err=>{
      console.error("Error:",err);
      showPromoNotif("error","Error al cargar: "+err.message);
    });
}

/* ========== SAVE / UPDATE ========== */
function guardarPromoAdmin(){
  const titulo=document.getElementById("promoAdminTitulo").value.trim();
  const descripcion=document.getElementById("promoAdminDesc").value.trim();
  const precio=document.getElementById("promoAdminPrecio").value.trim();
  const marca=document.getElementById("promoAdminMarca").value;
  const boton=document.getElementById("promoAdminBtn").value.trim();
  const url=document.getElementById("promoAdminUrl").value.trim();
  const previewImg=document.getElementById("promoPreviewImg");
  const hasNewImage=previewImg&&previewImg.src&&previewImg.src.startsWith("data:");

  if(!titulo){showPromoNotif("error","Ingresa el título");return;}

  const saveBtn=document.getElementById("promoAdminSaveBtn");
  saveBtn.textContent="Guardando...";saveBtn.disabled=true;

  const data={
    titulo,descripcion,precio,marca,
    boton:boton||"Ver Menú",
    url:url||"#",
    activo:promoEditId?(promosAdmin.find(p=>p.id===promoEditId)?.activo!==false):true,
    orden:promoEditId?(promosAdmin.find(p=>p.id===promoEditId)?.orden||0):promosAdmin.length,
    updatedAt:new Date().toISOString()
  };

  if(hasNewImage) data.imagen=previewImg.src;
  else if(!promoEditId) data.imagen="";

  const promise=promoEditId
    ?firebase.firestore().collection("promociones").doc(promoEditId).update(data)
    :firebase.firestore().collection("promociones").add({...data,createdAt:new Date().toISOString()});

  promise.then(()=>{
    showPromoNotif("success",promoEditId?"Promoción actualizada":"Promoción creada");
    limpiarPromoForm();
    loadAdminPromos();
  }).catch(err=>{
    console.error("Error:",err);
    showPromoNotif("error","Error: "+err.message);
  }).finally(()=>{
    saveBtn.textContent=promoEditId?"Actualizar":"Guardar Promoción";
    saveBtn.disabled=false;
  });
}

/* ========== EDIT ========== */
function editarPromoAdmin(id){
  const p=promosAdmin.find(item=>item.id===id);
  if(!p) return;
  promoEditId=id;
  document.getElementById("promoAdminTitulo").value=p.titulo||"";
  document.getElementById("promoAdminDesc").value=p.descripcion||"";
  document.getElementById("promoAdminPrecio").value=p.precio||"";
  document.getElementById("promoAdminMarca").value=p.marca||"MEDIO URBANO";
  document.getElementById("promoAdminBtn").value=p.boton||"Ver Menú";
  document.getElementById("promoAdminUrl").value=p.url||"";
  if(p.imagen){
    document.getElementById("promoPreviewImg").src=p.imagen;
    document.getElementById("promoImgPreview").style.display="block";
    document.getElementById("promoUploadArea").style.display="none";
  }
  document.getElementById("promoFormTitle").textContent="Editar Promoción";
  document.getElementById("promoAdminSaveBtn").textContent="Actualizar";
  document.getElementById("promoAdminCancelBtn").style.display="inline-block";
}

/* ========== DELETE ========== */
function eliminarPromoAdmin(id){
  if(!confirm("¿Eliminar?")) return;
  firebase.firestore().collection("promociones").doc(id).delete()
    .then(()=>{showPromoNotif("success","Eliminada");loadAdminPromos();})
    .catch(err=>showPromoNotif("error",err.message));
}

/* ========== TOGGLE ========== */
function togglePromoActivo(id){
  const p=promosAdmin.find(item=>item.id===id);
  if(!p) return;
  firebase.firestore().collection("promociones").doc(id).update({activo:p.activo===false?true:false})
    .then(()=>{showPromoNotif("success","Actualizado");loadAdminPromos();});
}

/* ========== MOVE ORDER ========== */
function moverPromo(id,dir){
  const idx=promosAdmin.findIndex(p=>p.id===id);
  const swap=idx+dir;
  if(swap<0||swap>=promosAdmin.length) return;
  const a=promosAdmin[idx],b=promosAdmin[swap];
  const batch=firebase.firestore().batch();
  batch.update(firebase.firestore().collection("promociones").doc(a.id),{orden:b.orden||swap});
  batch.update(firebase.firestore().collection("promociones").doc(b.id),{orden:a.orden||idx});
  batch.commit().then(()=>loadAdminPromos());
}

/* ========== TABLE ========== */
function renderAdminPromosTable(){
  const tbody=document.getElementById("tablaAdminPromos");
  if(!tbody) return;
  tbody.innerHTML="";
  promosAdmin.forEach(p=>{
    tbody.innerHTML+=`
      <tr>
        <td>${p.imagen?`<img src="${p.imagen}" style="width:70px;height:50px;object-fit:cover;border-radius:8px;">`:'<span style="color:#666;">Sin imagen</span>'}</td>
        <td>${p.titulo}</td>
        <td>${p.marca||"-"}</td>
        <td>${p.precio||"-"}</td>
        <td><span style="color:${p.activo!==false?'var(--success)':'var(--danger)'};font-weight:700;">${p.activo!==false?'Activo':'Inactivo'}</span></td>
        <td style="white-space:nowrap;">
          <button onclick="moverPromo('${p.id}',-1)" style="padding:6px 10px;font-size:12px;">&#9650;</button>
          <button onclick="moverPromo('${p.id}',1)" style="padding:6px 10px;font-size:12px;">&#9660;</button>
          <button onclick="togglePromoActivo('${p.id}')" style="padding:6px 12px;font-size:12px;background:${p.activo!==false?'#ff9500':'var(--success)'};color:white;border:none;border-radius:8px;cursor:pointer;">${p.activo!==false?'Off':'On'}</button>
          <button onclick="editarPromoAdmin('${p.id}')" style="padding:6px 12px;font-size:12px;background:var(--success);color:white;border:none;border-radius:8px;cursor:pointer;">Editar</button>
          <button onclick="eliminarPromoAdmin('${p.id}')" style="padding:6px 12px;font-size:12px;background:var(--danger);color:white;border:none;border-radius:8px;cursor:pointer;">Eliminar</button>
        </td>
      </tr>`;
  });
}

/* ========== STATS ========== */
function updatePromoStats(){
  const activas=promosAdmin.filter(p=>p.activo!==false).length;
  const inactivas=promosAdmin.filter(p=>p.activo===false).length;
  const el=document.getElementById("promoStatsList");
  if(el) el.innerHTML=`<span style="color:var(--success);">Activas: ${activas}</span> | <span style="color:var(--danger);">Inactivas: ${inactivas}</span> | Total: ${promosAdmin.length}`;
  const dash=document.getElementById("statPromos");
  if(dash) dash.textContent=promosAdmin.length;
}

/* ========== CLEAR ========== */
function limpiarPromoForm(){
  document.getElementById("promoAdminTitulo").value="";
  document.getElementById("promoAdminDesc").value="";
  document.getElementById("promoAdminPrecio").value="";
  document.getElementById("promoAdminMarca").value="MEDIO URBANO";
  document.getElementById("promoAdminBtn").value="Ver Menú";
  document.getElementById("promoAdminUrl").value="";
  limpiarPromoImagen();
  document.getElementById("promoFormTitle").textContent="Agregar Promoción";
  document.getElementById("promoAdminSaveBtn").textContent="Guardar Promoción";
  document.getElementById("promoAdminCancelBtn").style.display="none";
  promoEditId=null;
}
