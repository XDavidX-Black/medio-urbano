/*====================================================
admin-promos.js - MEDIO URBANO V3
CRUD Promociones con Firebase Firestore + Storage
Incluye: compresión de imagen, barra de progreso,
preview, notificaciones
=====================================================*/

let promosAdmin=[];
let promoEditId=null;

function initAdminPromos(){
  if(typeof firebase==="undefined"||!firebase.firestore){
    console.warn("Firebase no disponible para promos admin");
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
  area.addEventListener("drop",e=>{
    e.preventDefault();area.classList.remove("dragover");
    if(e.dataTransfer.files.length) handlePromoFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener("change",e=>{
    if(e.target.files.length) handlePromoFile(e.target.files[0]);
  });
}

function handlePromoFile(file){
  if(!file.type.startsWith("image/")){showPromoNotif("error","Solo se permiten imágenes");return;}
  if(file.size>8000000){showPromoNotif("error","Imagen muy grande. Máximo 8MB");return;}

  const sizeEl=document.getElementById("promoImgSize");
  if(sizeEl) sizeEl.textContent="Original: "+(file.size/1024).toFixed(0)+"KB";

  const reader=new FileReader();
  reader.onload=e=>{
    compressImage(e.target.result,1920,900,0.82).then(result=>{
      const preview=document.getElementById("promoPreviewImg");
      const wrap=document.getElementById("promoImgPreview");
      preview.src=result.dataUrl;
      wrap.style.display="block";
      document.getElementById("promoUploadArea").style.display="none";

      if(sizeEl) sizeEl.textContent+=" → Comprimido: "+(result.dataUrl.length*0.75/1024).toFixed(0)+"KB";
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
      const compressed=canvas.toDataURL("image/jpeg",quality);
      resolve({dataUrl:compressed,width:w,height:h});
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

/* ========== UPLOAD TO FIRESTORAGE ========== */
function uploadPromoImageToStorage(dataUrl){
  return new Promise((resolve,reject)=>{
    const progress=document.getElementById("promoProgress");
    const bar=document.getElementById("promoProgressBar");
    if(progress) progress.style.display="block";
    if(bar) bar.style.width="0%";

    const byteString=atob(dataUrl.split(",")[1]);
    const mime=dataUrl.split(",")[0].split(":")[1].split(";")[0];
    const ab=new ArrayBuffer(byteString.length);
    const ia=new Uint8Array(ab);
    for(let i=0;i<byteString.length;i++) ia[i]=byteString.charCodeAt(i);
    const blob=new Blob([ab],{type:mime});
    const file=new File([blob],"promo_"+Date.now()+".jpg",{type:mime});

    const ref=firebase.storage().ref().child("promos/"+file.name);
    const task=ref.put(file);

    task.on("state_changed",
      snap=>{
        const pct=(snap.bytesTransferred/snap.totalBytes)*100;
        if(bar) bar.style.width=pct+"%";
      },
      err=>{if(progress) progress.style.display="none";reject(err);},
      ()=>{if(progress) progress.style.display="none";task.snapshot.ref.getDownloadURL().then(resolve);}
    );
  });
}

/* ========== NOTIFICATIONS ========== */
function showPromoNotif(type,msg){
  const existing=document.querySelector(".promo-notif");
  if(existing) existing.remove();

  const div=document.createElement("div");
  div.className="promo-notif";
  div.style.cssText="position:fixed;top:20px;right:20px;z-index:9999;padding:16px 24px;border-radius:14px;font-size:14px;font-weight:600;color:white;box-shadow:0 10px 30px rgba(0,0,0,.3);transition:transform .3s,opacity .3s;";
  div.style.background=type==="success"?"#35c759":type==="error"?"#ff3b30":"#ff9500";
  div.innerHTML='<i class="fas fa-'+(type==="success"?"check-circle":type==="error"?"times-circle":"exclamation-circle")+'" style="margin-right:10px;"></i>'+msg;
  document.body.appendChild(div);

  setTimeout(()=>{div.style.transform="translateX(120%)";div.style.opacity="0";setTimeout(()=>div.remove(),400);},3500);
}

/* ========== LOAD ========== */
function loadAdminPromos(){
  firebase.firestore().collection("promociones")
    .orderBy("orden","asc")
    .get()
    .then(snap=>{
      promosAdmin=[];
      snap.forEach(doc=>promosAdmin.push({id:doc.id,...doc.data()}));
      renderAdminPromosTable();
      updatePromoStats();
    })
    .catch(err=>console.error("Error loading promos:",err));
}

/* ========== TABLE ========== */
function renderAdminPromosTable(){
  const tbody=document.getElementById("tablaAdminPromos");
  if(!tbody) return;
  tbody.innerHTML="";
  promosAdmin.forEach((p,i)=>{
    tbody.innerHTML+=`
      <tr>
        <td>${p.imagen?`<img src="${p.imagen}" style="width:70px;height:50px;object-fit:cover;border-radius:8px;">`:'<span style="color:#666;">Sin imagen</span>'}</td>
        <td>${p.titulo}</td>
        <td>${p.marca||"-"}</td>
        <td>${p.precio||"-"}</td>
        <td><span style="color:${p.activo!==false?'var(--success)':'var(--danger)'};font-weight:700;">${p.activo!==false?'Activo':'Inactivo'}</span></td>
        <td style="white-space:nowrap;">
          <button onclick="moverPromo('${p.id}',-1)" style="padding:6px 10px;font-size:12px;" title="Subir">&#9650;</button>
          <button onclick="moverPromo('${p.id}',1)" style="padding:6px 10px;font-size:12px;" title="Bajar">&#9660;</button>
          <button onclick="togglePromoActivo('${p.id}')" style="padding:6px 12px;font-size:12px;background:${p.activo!==false?'#ff9500':'var(--success)'};color:white;border:none;border-radius:8px;cursor:pointer;">${p.activo!==false?'Off':'On'}</button>
          <button onclick="editarPromoAdmin('${p.id}')" style="padding:6px 12px;font-size:12px;background:var(--success);color:white;border:none;border-radius:8px;cursor:pointer;">Editar</button>
          <button onclick="eliminarPromoAdmin('${p.id}')" style="padding:6px 12px;font-size:12px;background:var(--danger);color:white;border:none;border-radius:8px;cursor:pointer;">Eliminar</button>
        </td>
      </tr>`;
  });
}

/* ========== STATS ========== */
function updatePromoStats(){
  const statsEl=document.getElementById("promoStatsList");
  const statDash=document.getElementById("statPromos");
  const activas=promosAdmin.filter(p=>p.activo!==false).length;
  const inactivas=promosAdmin.filter(p=>p.activo===false).length;
  if(statsEl) statsEl.innerHTML=`<span style="color:var(--success);">Activas: ${activas}</span> &nbsp;|&nbsp; <span style="color:var(--danger);">Inactivas: ${inactivas}</span> &nbsp;|&nbsp; Total: ${promosAdmin.length}`;
  if(statDash) statDash.textContent=promosAdmin.length;
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
    activo:promoEditId?(promosAdmin.find(p=>p.id===promoEditId)?.activo!==false?true:false):true,
    orden:promoEditId?(promosAdmin.find(p=>p.id===promoEditId)?.orden||0):promosAdmin.length,
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  };

  const imagePromise=hasNewImage?uploadPromoImageToStorage(previewImg.src):Promise.resolve(null);

  imagePromise.then(imgUrl=>{
    if(imgUrl) data.imagen=imgUrl;
    else if(!promoEditId) data.imagen="";

    if(promoEditId){
      return firebase.firestore().collection("promociones").doc(promoEditId).update(data);
    }else{
      data.createdAt=firebase.firestore.FieldValue.serverTimestamp();
      return firebase.firestore().collection("promociones").add(data);
    }
  }).then(()=>{
    showPromoNotif("success",promoEditId?"Promoción actualizada correctamente":"Promoción creada correctamente");
    limpiarPromoForm();
    loadAdminPromos();
  }).catch(err=>{
    console.error("Error guardando promo:",err);
    showPromoNotif("error","Error: "+err.message);
  }).finally(()=>{
    saveBtn.textContent=promoEditId?"Actualizar Promoción":"Guardar Promoción";
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

  const preview=document.getElementById("promoPreviewImg");
  const wrap=document.getElementById("promoImgPreview");
  if(preview&&p.imagen){
    preview.src=p.imagen;wrap.style.display="block";
    document.getElementById("promoUploadArea").style.display="none";
  }

  document.getElementById("promoFormTitle").textContent="Editar Promoción";
  document.getElementById("promoAdminSaveBtn").textContent="Actualizar Promoción";
  document.getElementById("promoAdminCancelBtn").style.display="inline-block";
}

/* ========== DELETE ========== */
function eliminarPromoAdmin(id){
  if(!confirm("¿Eliminar esta promoción permanentemente?")) return;
  firebase.firestore().collection("promociones").doc(id).delete()
    .then(()=>{showPromoNotif("success","Promoción eliminada");loadAdminPromos();})
    .catch(err=>showPromoNotif("error","Error: "+err.message));
}

/* ========== TOGGLE ACTIVE ========== */
function togglePromoActivo(id){
  const p=promosAdmin.find(item=>item.id===id);
  if(!p) return;
  const nuevoEstado=p.activo===false?true:false;
  firebase.firestore().collection("promociones").doc(id).update({
    activo:nuevoEstado,
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  }).then(()=>{
    showPromoNotif("success",nuevoEstado?"Promoción activada":"Promoción desactivada");
    loadAdminPromos();
  });
}

/* ========== MOVE ORDER ========== */
function moverPromo(id,direction){
  const idx=promosAdmin.findIndex(p=>p.id===id);
  if(idx<0) return;
  const swapIdx=idx+direction;
  if(swapIdx<0||swapIdx>=promosAdmin.length) return;

  const a=promosAdmin[idx];
  const b=promosAdmin[swapIdx];
  const batch=firebase.firestore().batch();

  batch.update(firebase.firestore().collection("promociones").doc(a.id),{orden:b.orden||swapIdx});
  batch.update(firebase.firestore().collection("promociones").doc(b.id),{orden:a.orden||idx});

  batch.commit().then(()=>loadAdminPromos());
}

/* ========== CLEAR FORM ========== */
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
