/*====================================================
brand-identity.js - MEDIO URBANO V3
CRUD de logos de marca (base64 en Firestore)
=====================================================*/

const BRANDS=["marca","cocina","salad","burgers","pasta"];
const BRAND_LABELS={marca:"Logo Principal",cocina:"Cocina",salad:"Salad",burgers:"Burgers",pasta:"Pasta"};
let brandLogos={};

function initBrandIdentity(){
  if(typeof firebase==="undefined"||!firebase.firestore) return;
  loadBrandLogos();
}

function loadBrandLogos(){
  firebase.firestore().collection("config").doc("logos").get()
    .then(doc=>{
      if(doc.exists) brandLogos=doc.data();
      renderBrandLogos();
    })
    .catch(err=>console.warn("Error loading logos:",err));
}

function renderBrandLogos(){
  const container=document.getElementById("brandLogosGrid");
  if(!container) return;
  container.innerHTML="";
  BRANDS.forEach(key=>{
    const src=brandLogos[key]||"";
    container.innerHTML+=`
      <div style="background:#1a1a1a;border-radius:16px;padding:25px;text-align:center;border:1px solid rgba(255,255,255,.08);">
        <h3 style="color:var(--primary);margin-bottom:15px;font-size:16px;">${BRAND_LABELS[key]}</h3>
        <div style="width:150px;height:100px;margin:0 auto 15px;display:flex;align-items:center;justify-content:center;background:#111;border-radius:12px;overflow:hidden;">
          ${src?`<img src="${src}" style="max-width:100%;max-height:100%;object-fit:contain;">`:'<i class="fas fa-image" style="font-size:30px;color:#333;"></i>'}
        </div>
        <input type="file" accept="image/*" id="logoFile_${key}" style="display:none;" onchange="handleLogoUpload('${key}',this.files[0])">
        <button onclick="document.getElementById('logoFile_${key}').click()" style="padding:10px 20px;font-size:13px;margin-bottom:8px;">${src?'Cambiar':'Subir'} Logo</button>
        ${src?`<button onclick="removeLogo('${key}')" style="padding:10px 20px;font-size:13px;background:#c62828;color:white;">Quitar</button>`:''}
      </div>`;
  });
}

function handleLogoUpload(key,file){
  if(!file||!file.type.startsWith("image/")) return;
  if(file.size>5000000){alert("Máximo 5MB");return;}

  const reader=new FileReader();
  reader.onload=e=>{
    compressLogo(e.target.result,600,300,0.7).then(result=>{
      brandLogos[key]=result.dataUrl;
      saveBrandLogos();
      renderBrandLogos();
      showBrandNotif("Logo de "+BRAND_LABELS[key]+" actualizado");
    });
  };
  reader.readAsDataURL(file);
}

function compressLogo(dataUrl,maxW,maxH,quality){
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      const canvas=document.createElement("canvas");
      let w=img.width,h=img.height;
      if(w>maxW){h=h*maxW/w;w=maxW;}
      if(h>maxH){w=w*maxH/h;h=maxH;}
      canvas.width=w;canvas.height=h;
      canvas.getContext("2d").drawImage(img,0,0,w,h);
      resolve({dataUrl:canvas.toDataURL("image/jpeg",quality)});
    };
    img.src=dataUrl;
  });
}

function removeLogo(key){
  if(!confirm("¿Quitar este logo?")) return;
  delete brandLogos[key];
  saveBrandLogos();
  renderBrandLogos();
  showBrandNotif("Logo removido");
}

function saveBrandLogos(){
  firebase.firestore().collection("config").doc("logos").set(brandLogos,{merge:true})
    .catch(err=>console.error("Error saving logos:",err));
}

function showBrandNotif(msg){
  const old=document.querySelector(".brand-notif");
  if(old) old.remove();
  const div=document.createElement("div");
  div.className="brand-notif";
  div.style.cssText="position:fixed;top:20px;right:20px;z-index:9999;padding:14px 22px;border-radius:12px;font-size:14px;font-weight:600;color:white;background:#35c759;box-shadow:0 8px 25px rgba(0,0,0,.3);transition:transform .4s,opacity .4s;";
  div.innerHTML='<i class="fas fa-check-circle" style="margin-right:8px;"></i>'+msg;
  document.body.appendChild(div);
  setTimeout(()=>{div.style.transform="translateX(120%)";div.style.opacity="0";setTimeout(()=>div.remove(),400);},2500);
}

/* PUBLIC: get logos for external pages */
function getBrandLogos(){
  return new Promise((resolve)=>{
    if(Object.keys(brandLogos).length>0){resolve(brandLogos);return;}
    if(typeof firebase==="undefined"||!firebase.firestore){resolve({});return;}
    firebase.firestore().collection("config").doc("logos").get()
      .then(doc=>{resolve(doc.exists?doc.data():{});})
      .catch(()=>resolve({}));
  });
}
