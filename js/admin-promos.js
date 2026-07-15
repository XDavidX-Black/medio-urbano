/*====================================================
admin-promos.js - MEDIO URBANO V3
CRUD de Promociones con Firebase Firestore + Storage
Panel Administrativo
=====================================================*/

let promosAdmin=[];
let promoEditId=null;

function initAdminPromos(){
  if(typeof firebase==="undefined"||!firebase.firestore){
    console.warn("Firebase no disponible para promos admin");
    return;
  }
  loadAdminPromos();
}

/* ========== LOAD ========== */
function loadAdminPromos(){
  firebase.firestore().collection("promociones")
    .orderBy("orden","asc")
    .get()
    .then(snap=>{
      promosAdmin=[];
      snap.forEach(doc=>{
        promosAdmin.push({id:doc.id,...doc.data()});
      });
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
        <td>$${p.precio||"0"}</td>
        <td><span style="color:${p.activo!==false?'var(--success)':'var(--danger)'};font-weight:700;">${p.activo!==false?'Activo':'Inactivo'}</span></td>
        <td style="white-space:nowrap;">
          <button onclick="moverPromo('${p.id}',-1)" style="padding:6px 10px;font-size:12px;" title="Subir">&#9650;</button>
          <button onclick="moverPromo('${p.id}',1)" style="padding:6px 10px;font-size:12px;" title="Bajar">&#9660;</button>
          <button onclick="togglePromoActivo('${p.id}')" style="padding:6px 12px;font-size:12px;background:${p.activo!==false?'#ff9500':'var(--success)'};">${p.activo!==false?'Desactivar':'Activar'}</button>
          <button onclick="editarPromoAdmin('${p.id}')" style="padding:6px 12px;font-size:12px;background:var(--success);color:white;">Editar</button>
          <button onclick="eliminarPromoAdmin('${p.id}')" style="padding:6px 12px;font-size:12px;background:var(--danger);color:white;">Eliminar</button>
        </td>
      </tr>`;
  });

  const statsEl=document.getElementById("promoStatsList");
  if(statsEl){
    const activas=promosAdmin.filter(p=>p.activo!==false).length;
    const inactivas=promosAdmin.filter(p=>p.activo===false).length;
    statsEl.innerHTML=`
      <span style="color:var(--success);">Activas: ${activas}</span> |
      <span style="color:var(--danger);">Inactivas: ${inactivas}</span> |
      <span>Total: ${promosAdmin.length}</span>
    `;
  }
}

/* ========== STATS ========== */
function updatePromoStats(){
  const statEl=document.getElementById("statPromosAdmin");
  if(statEl) statEl.textContent=promosAdmin.length;
  const statActEl=document.getElementById("statPromosActivas");
  if(statActEl) statActEl.textContent=promosAdmin.filter(p=>p.activo!==false).length;
}

/* ========== UPLOAD IMAGE TO FIRESTORAGE ========== */
function uploadPromoImage(file){
  return new Promise((resolve,reject)=>{
    if(!file){resolve("");return;}
    const storageRef=firebase.storage().ref();
    const imgRef=storageRef.child("promos/"+Date.now()+"_"+file.name);
    imgRef.put(file)
      .then(snapshot=>snapshot.ref.getDownloadURL())
      .then(url=>resolve(url))
      .catch(err=>reject(err));
  });
}

/* ========== ADD / EDIT ========== */
function guardarPromoAdmin(){
  const titulo=document.getElementById("promoAdminTitulo").value.trim();
  const descripcion=document.getElementById("promoAdminDesc").value.trim();
  const precio=document.getElementById("promoAdminPrecio").value.trim();
  const marca=document.getElementById("promoAdminMarca").value;
  const boton=document.getElementById("promoAdminBtn").value.trim();
  const url=document.getElementById("promoAdminUrl").value.trim();
  const imagenFile=document.getElementById("promoAdminFile").files[0];

  if(!titulo){
    alert("Ingresa el título de la promoción");
    return;
  }

  const data={
    titulo,
    descripcion,
    precio,
    marca,
    boton:boton||"Ver Menú",
    url:url||"#",
    activo:true,
    orden:promoEditId?promosAdmin.find(p=>p.id===promoEditId)?.orden||0:promosAdmin.length,
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  };

  const savePromise=imagenFile
    ? uploadPromoImage(imagenFile).then(url=>{data.imagen=url;})
    : Promise.resolve();

  savePromise.then(()=>{
    if(promoEditId){
      return firebase.firestore().collection("promociones").doc(promoEditId).update(data);
    }else{
      data.createdAt=firebase.firestore.FieldValue.serverTimestamp();
      return firebase.firestore().collection("promociones").add(data);
    }
  }).then(()=>{
    limpiarPromoForm();
    loadAdminPromos();
    alert(promoEditId?"Promoción actualizada":"Promoción creada");
    promoEditId=null;
  }).catch(err=>{
    console.error("Error guardando promo:",err);
    alert("Error: "+err.message);
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
  document.getElementById="promoAdminBtn").value=p.boton||"Ver Menú";
  document.getElementById("promoAdminUrl").value=p.url||"";

  const preview=document.getElementById("promoAdminPreview");
  if(preview&&p.imagen){
    preview.src=p.imagen;
    preview.style.display="block";
  }

  document.getElementById("promoAdminSaveBtn").textContent="Actualizar Promoción";
  document.getElementById("promoAdminCancelBtn").style.display="inline-block";
}

/* ========== DELETE ========== */
function eliminarPromoAdmin(id){
  if(!confirm("¿Eliminar esta promoción?")) return;
  firebase.firestore().collection("promociones").doc(id).delete()
    .then(()=>loadAdminPromos())
    .catch(err=>console.error("Error eliminando:",err));
}

/* ========== TOGGLE ACTIVE ========== */
function togglePromoActivo(id){
  const p=promosAdmin.find(item=>item.id===id);
  if(!p) return;
  firebase.firestore().collection("promociones").doc(id).update({
    activo:p.activo===false?true:false,
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  }).then(()=>loadAdminPromos());
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
  document.getElementById("promoAdminFile").value="";
  const preview=document.getElementById("promoAdminPreview");
  if(preview){preview.src="";preview.style.display="none";}
  document.getElementById("promoAdminSaveBtn").textContent="Guardar Promoción";
  document.getElementById("promoAdminCancelBtn").style.display="none";
  promoEditId=null;
}

/* ========== PREVIEW ========== */
function previewPromoImage(){
  const file=document.getElementById("promoAdminFile").files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    const preview=document.getElementById("promoAdminPreview");
    preview.src=e.target.result;
    preview.style.display="block";
  };
  reader.readAsDataURL(file);
}
