/*====================================================
panel-manager.js - MEDIO URBANO V3
Gestor profesional: pedidos, clientes, config,
horarios, zonas, hero, SEO, PWA, reportes, respaldos, seguridad
=====================================================*/

let allPedidos=[];
let allClientes=[];
let configGeneral={};
let horariosData={};
let zonasData=[];
let pedidoEditId=null;

/* ====================================================
   INIT
   ==================================================== */
function initPanelManager(){
  loadConfigGeneral();
  loadHorarios();
  loadZonas();
  loadPedidosPanel();
  loadClientes();
  loadHeroConfig();
  loadSEO();
  loadPWA();
  recordAccess();
  initLogs();
}

/* ====================================================
   PEDIDOS - GESTIÓN PROFESIONAL
   ==================================================== */
function loadPedidosPanel(){
  if(typeof firebase==="undefined"||!firebase.firestore) return;
  firebase.firestore().collection("pedidos").orderBy("fecha","desc").get()
    .then(snap=>{
      allPedidos=[];
      snap.forEach(doc=>allPedidos.push({id:doc.id,...doc.data()}));
      renderPedidosPanel();
      renderPedidosFull();
    }).catch(()=>{});
}

function renderPedidosPanel(){
  const container=document.getElementById("listaPedidosFull");
  if(!container) return;
  let filtered=[...allPedidos];
  const fc=document.getElementById("filtroCliente")?.value.toLowerCase()||"";
  const ft=document.getElementById("filtroTelefono")?.value||"";
  const fe=document.getElementById("filtroEstadoPed")?.value||"";
  const fm=document.getElementById("filtroMarcaPed")?.value||"";
  const fdate=document.getElementById("filtroFechaPed")?.value||"";
  if(fc) filtered=filtered.filter(p=>(p.cliente||"").toLowerCase().includes(fc));
  if(ft) filtered=filtered.filter(p=>(p.telefono||"").includes(ft));
  if(fe) filtered=filtered.filter(p=>p.estado===fe);
  if(fm) filtered=filtered.filter(p=>p.marca===fm);
  if(fdate) filtered=filtered.filter(p=>p.fecha&&p.fecha.startsWith(fdate));

  if(!filtered.length){container.innerHTML='<p style="color:#666;text-align:center;padding:30px;">Sin pedidos</p>';return;}
  container.innerHTML="";
  filtered.forEach(p=>{
    const f=p.fecha?new Date(p.fecha):new Date();
    const estado=p.estado||"Pendiente";
    const cls="status-"+(estado.toLowerCase().replace(" ",""));
    const marcaLabel=p.marca?(p.marca.charAt(0).toUpperCase()+p.marca.slice(1)):"General";
    container.innerHTML+=`
      <div class="cliente-card">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
          <span class="status-badge ${cls}">${estado}</span>
          <strong style="flex:1;">${p.cliente||"Sin nombre"}</strong>
          <span style="color:var(--primary);font-weight:700;">$${(p.total||0).toFixed(2)}</span>
        </div>
        <div style="display:flex;gap:15px;font-size:13px;color:#888;flex-wrap:wrap;margin-bottom:10px;">
          <span><i class="fas fa-phone" style="margin-right:4px;"></i>${p.telefono||"-"}</span>
          <span><i class="fas fa-store" style="margin-right:4px;"></i>${marcaLabel}</span>
          <span><i class="fas fa-clock" style="margin-right:4px;"></i>${f.toLocaleDateString()} ${f.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <select onchange="cambiarEstadoPedido('${p.id}',this.value)" style="padding:8px 12px;width:auto;font-size:12px;background:#111;border:1px solid rgba(255,255,255,.1);border-radius:8px;color:white;">
            <option value="Pendiente" ${estado==="Pendiente"?"selected":""}>Pendiente</option>
            <option value="Preparando" ${estado==="Preparando"?"selected":""}>Preparando</option>
            <option value="En reparto" ${estado==="En reparto"?"selected":""}>En reparto</option>
            <option value="Entregado" ${estado==="Entregado"?"selected":""}>Entregado</option>
            <option value="Cancelado" ${estado==="Cancelado"?"selected":""}>Cancelado</option>
          </select>
          <button onclick="verDetallePedido('${p.id}')" style="padding:8px 14px;font-size:12px;background:#2196f3;color:white;">Ver</button>
          <button onclick="eliminarPedido('${p.id}')" style="padding:8px 14px;font-size:12px;background:#c62828;color:white;">Eliminar</button>
        </div>
      </div>`;
  });
}

function renderPedidosFull(){
  const el=document.getElementById("listaPedidos");
  if(!el) return;
  const recent=allPedidos.slice(0,5);
  if(!recent.length){el.innerHTML='<p style="color:#666;text-align:center;padding:30px;">Sin pedidos</p>';return;}
  el.innerHTML="";
  recent.forEach(p=>{
    const estado=p.estado||"Pendiente";
    const cls="status-"+(estado.toLowerCase().replace(" ",""));
    el.innerHTML+=`<div class="order"><div><strong>${p.cliente||"-"}</strong><br><small>${p.marca||"general"}</small></div><div>$${(p.total||0).toFixed(0)}</div><div><span class="status-badge ${cls}">${estado}</span></div></div>`;
  });
}

function cambiarEstadoPedido(id,estado){
  if(typeof firebase==="undefined"||!firebase.firestore) return;
  firebase.firestore().collection("pedidos").doc(id).update({estado})
    .then(()=>{
      const p=allPedidos.find(x=>x.id===id);
      if(p) p.estado=estado;
      renderPedidosPanel();
      renderPedidosFull();
      logAdminAction("pedido","Estado cambiado a "+estado,"Pedido "+(p?.cliente||"")+p?.telefono+(p?" · $"+(p.total||0).toFixed(0):"")+(p?" · "+(p.marca||""):""));
    });
}

function verDetallePedido(id){
  const p=allPedidos.find(x=>x.id===id);
  if(!p) return;
  const modal=document.getElementById("pedidoDetailModal");
  const content=document.getElementById("pedidoDetailContent");
  const marcaLabel=p.marca?(p.marca.charAt(0).toUpperCase()+p.marca.slice(1)):"General";
  const f=p.fecha?new Date(p.fecha):new Date();
  let html=`
    <h2 style="color:var(--primary);margin-bottom:20px;font-family:'Bebas Neue';">Detalle del Pedido</h2>
    <div class="order-summary-row"><span class="label">Cliente</span><span class="value">${p.cliente||"-"}</span></div>
    <div class="order-summary-row"><span class="label">WhatsApp</span><span class="value">${p.telefono||"-"}</span></div>
    <div class="order-summary-row"><span class="label">Marca</span><span class="value">${marcaLabel}</span></div>
    <div class="order-summary-row"><span class="label">Estado</span><span class="value">${p.estado||"Pendiente"}</span></div>
    <hr class="order-summary-divider">
    <div class="order-summary-row"><span class="label">Dirección</span><span class="value">${p.direccion||"-"}</span></div>
    <div class="order-summary-row"><span class="label">Colonia</span><span class="value">${p.colonia||"-"}</span></div>
    <div class="order-summary-row"><span class="label">CP</span><span class="value">${p.cp||"-"}</span></div>
    <div class="order-summary-row"><span class="label">Referencias</span><span class="value">${p.referencias||"-"}</span></div>
    <div class="order-summary-row"><span class="label">Pago</span><span class="value">${p.pago||"-"}</span></div>
    <hr class="order-summary-divider">
    <div class="order-summary-products">`;
  (p.productos||[]).forEach(item=>{
    html+=`<div class="order-summary-product"><span><span class="qty">x${item.cantidad}</span>${item.nombre}</span><span>$${(item.precio*item.cantidad).toFixed(2)}</span></div>`;
    if(item.extras&&item.extras.length) html+=`<div class="order-summary-product extra"><span class="extra"><i class="fas fa-plus-circle"></i> ${item.extras.join(", ")}</span></div>`;
  });
  html+=`</div><div class="order-summary-total"><span>TOTAL</span><span>$${(p.total||0).toFixed(2)} MXN</span></div>`;
  if(p.gpsLat&&p.gpsLng) html+=`<div class="order-summary-row" style="margin-top:10px;"><span class="label">Ubicación</span><span class="value"><a href="https://maps.google.com/?q=${p.gpsLat},${p.gpsLng}" target="_blank" style="color:var(--primary);text-decoration:underline;">Ver en mapa</a></span></div>`;
  if(p.comentarios) html+=`<div class="order-summary-row"><span class="label">Observaciones</span><span class="value">${p.comentarios}</span></div>`;
  html+=`<div class="order-summary-row"><span class="label">Fecha</span><span class="value">${f.toLocaleDateString()} ${f.toLocaleTimeString()}</span></div>`;
  content.innerHTML=html;
  modal.classList.add("active");
}

function closePedidoDetail(){
  document.getElementById("pedidoDetailModal").classList.remove("active");
}

function eliminarPedido(id){
  if(!confirm("¿Eliminar este pedido?")) return;
  if(typeof firebase==="undefined"||!firebase.firestore) return;
  const p=allPedidos.find(x=>x.id===id);
  firebase.firestore().collection("pedidos").doc(id).delete()
    .then(()=>{
      allPedidos=allPedidos.filter(p=>p.id!==id);
      renderPedidosPanel();
      renderPedidosFull();
      logAdminAction("pedido","Pedido eliminado",""+(p?.cliente||"")+" "+(p?.telefono||"")+" · $"+(p?.total||0).toFixed(0));
    });
}

/* ====================================================
   CLIENTES - AUTO-REGISTRO
   ==================================================== */
function loadClientes(){
  if(typeof firebase==="undefined"||!firebase.firestore) return;
  firebase.firestore().collection("pedidos").get()
    .then(snap=>{
      const mapa={};
      snap.forEach(doc=>{
        const d=doc.data();
        const key=(d.telefono||"").trim();
        if(!key) return;
        if(!mapa[key]) mapa[key]={nombre:d.cliente||"Sin nombre",telefono:key,pedidos:0,total:0,ultimoPedido:d.fecha||"",marca:{}};
        mapa[key].pedidos++;
        mapa[key].total+=(d.total||0);
        if(d.fecha>mapa[key].ultimoPedido) mapa[key].ultimoPedido=d.fecha;
        if(d.cliente) mapa[key].nombre=d.cliente;
        const m=d.marca||"general";
        mapa[key].marca[m]=(mapa[key].marca[m]||0)+1;
      });
      allClientes=Object.values(mapa);
      renderClientes();
    }).catch(()=>{});
}

function renderClientes(){
  const container=document.getElementById("listaClientes");
  if(!container) return;
  const search=(document.getElementById("buscarCliente")?.value||"").toLowerCase();
  let filtered=allClientes;
  if(search) filtered=filtered.filter(c=>c.nombre.toLowerCase().includes(search)||c.telefono.includes(search));
  if(!filtered.length){container.innerHTML='<p style="color:#666;text-align:center;padding:30px;">Sin clientes</p>';return;}
  container.innerHTML="";
  filtered.forEach(c=>{
    const topMarca=Object.entries(c.marca).sort((a,b)=>b[1]-a[1])[0];
    container.innerHTML+=`
      <div class="cliente-card">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <strong style="font-size:16px;">${c.nombre}</strong>
            <div style="color:var(--primary);font-size:13px;">${c.telefono}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:700;color:var(--primary);">$${c.total.toFixed(0)}</div>
            <div style="font-size:12px;color:#888;">${c.pedidos} pedido${c.pedidos>1?"s":""}</div>
          </div>
        </div>
        <div style="margin-top:8px;font-size:12px;color:#666;">
          Marca principal: ${topMarca?topMarca[0]:"—"} · Último: ${c.ultimoPedido?new Date(c.ultimoPedido).toLocaleDateString():"—"}
        </div>
      </div>`;
  });
}

/* ====================================================
   CONFIGURACION GENERAL
   ==================================================== */
function loadConfigGeneral(){
  if(typeof firebase==="undefined"||!firebase.firestore) return;
  firebase.firestore().collection("config").doc("general").get()
    .then(doc=>{
      if(doc.exists) configGeneral=doc.data();
      const map={cfgNombre:"nombre",cfgWhatsapp:"whatsapp",cfgEmail:"email",cfgDireccion:"direccion",cfgEnvio:"envio",cfgMinimo:"minimo",cfgTiempo:"tiempo",cfgMaps:"maps",cfgFacebook:"facebook",cfgInstagram:"instagram",cfgTiktok:"tiktok",cfgMetodosPago:"metodosPago",cfgMsgWhatsapp:"msgWhatsapp"};
      Object.entries(map).forEach(([elId,key])=>{
        const el=document.getElementById(elId);
        if(el&&configGeneral[key]) el.value=configGeneral[key];
      });
    }).catch(()=>{});
}

function guardarConfigGeneral(){
  const data={
    nombre:document.getElementById("cfgNombre").value,
    whatsapp:document.getElementById("cfgWhatsapp").value,
    email:document.getElementById("cfgEmail").value,
    direccion:document.getElementById("cfgDireccion").value,
    envio:Number(document.getElementById("cfgEnvio").value)||0,
    minimo:Number(document.getElementById("cfgMinimo").value)||0,
    tiempo:Number(document.getElementById("cfgTiempo").value)||30,
    maps:document.getElementById("cfgMaps").value,
    facebook:document.getElementById("cfgFacebook").value,
    instagram:document.getElementById("cfgInstagram").value,
    tiktok:document.getElementById("cfgTiktok").value,
    metodosPago:document.getElementById("cfgMetodosPago").value,
    msgWhatsapp:document.getElementById("cfgMsgWhatsapp").value,
    updatedAt:new Date().toISOString()
  };
  firebase.firestore().collection("config").doc("general").set(data,{merge:true})
    .then(()=>{alert("Configuración guardada");logAdminAction("config","Configuración general actualizada","WhatsApp, envío, redes sociales");})
    .catch(e=>alert("Error: "+e.message));
}

/* ====================================================
   HORARIOS
   ==================================================== */
const DIAS=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Dominio"];
const MARCAS_H=["burgers","cocina","pasta","salad"];

function loadHorarios(){
  if(typeof firebase==="undefined"||!firebase.firestore) return;
  firebase.firestore().collection("config").doc("horarios").get()
    .then(doc=>{
      if(doc.exists) horariosData=doc.data();
      renderHorarios();
    }).catch(()=>{renderHorarios();});
}

function renderHorarios(){
  const container=document.getElementById("horariosGrid");
  if(!container) return;
  container.innerHTML="";
  MARCAS_H.forEach(marca=>{
    let html=`<div class="horario-card"><h3>${marca.charAt(0).toUpperCase()+marca.slice(1)}</h3>`;
    DIAS.forEach((dia,i)=>{
      const h=horariosData[marca+"_"+i]||{apertura:"10:00",cierre:"22:00",activo:true};
      html+=`<div class="horario-row">
        <label>${dia.substring(0,3)}</label>
        <input type="time" value="${h.apertura||"10:00"}" id="hor_${marca}_${i}_ap">
        <span>-</span>
        <input type="time" value="${h.cierre||"22:00"}" id="hor_${marca}_${i}_ce">
        <input type="checkbox" ${h.activo!==false?"checked":""} id="hor_${marca}_${i}_on" style="width:auto;">
      </div>`;
    });
    html+=`</div>`;
    container.innerHTML+=html;
  });
}

function guardarHorarios(){
  const data={};
  MARCAS_H.forEach(marca=>{
    DIAS.forEach((dia,i)=>{
      data[marca+"_"+i]={
        apertura:document.getElementById(`hor_${marca}_${i}_ap`)?.value||"10:00",
        cierre:document.getElementById(`hor_${marca}_${i}_ce`)?.value||"22:00",
        activo:document.getElementById(`hor_${marca}_${i}_on`)?.checked!==false
      };
    });
  });
  horariosData=data;
  firebase.firestore().collection("config").doc("horarios").set(data,{merge:true})
    .then(()=>{alert("Horarios guardados");logAdminAction("config","Horarios actualizados","Todos los días y marcas");})
    .catch(e=>alert("Error: "+e.message));
}

/* ====================================================
   ZONAS DE ENTREGA
   ==================================================== */
function loadZonas(){
  if(typeof firebase==="undefined"||!firebase.firestore) return;
  firebase.firestore().collection("config").doc("zonas").get()
    .then(doc=>{
      if(doc.exists&&doc.data().zonas) zonasData=doc.data().zonas;
      renderZonas();
    }).catch(()=>{renderZonas();});
}

function renderZonas(){
  const container=document.getElementById("listaZonas");
  if(!container) return;
  if(!zonasData.length){container.innerHTML='<p style="color:#666;text-align:center;">Sin zonas configuradas</p>';return;}
  container.innerHTML="";
  zonasData.forEach((z,i)=>{
    container.innerHTML+=`
      <div class="zona-card">
        <div>
          <strong>${z.colonias.substring(0,50)}${z.colonias.length>50?"...":""}</strong>
          <div style="font-size:12px;color:#888;">Envío: $${z.costo||0} · Mínimo: $${z.minimo||0} · ~${z.tiempo||30}min</div>
        </div>
        <button onclick="eliminarZona(${i})" style="padding:8px 14px;font-size:12px;background:#c62828;color:white;">X</button>
      </div>`;
  });
}

function agregarZona(){
  const colonias=document.getElementById("zonaColonias").value.trim();
  if(!colonias){alert("Ingresa al menos una colonia");return;}
  zonasData.push({
    colonias,
    costo:Number(document.getElementById("zonaCosto").value)||0,
    minimo:Number(document.getElementById("zonaMinimo").value)||0,
    tiempo:Number(document.getElementById("zonaTiempo").value)||30
  });
  saveZonas();
  document.getElementById("zonaColonias").value="";
  document.getElementById("zonaCosto").value="";
  document.getElementById("zonaMinimo").value="";
  document.getElementById("zonaTiempo").value="";
}

function eliminarZona(i){
  if(!confirm("¿Eliminar zona?")) return;
  zonasData.splice(i,1);
  saveZonas();
}

function saveZonas(){
  firebase.firestore().collection("config").doc("zonas").set({zonas:zonasData},{merge:true})
    .then(()=>{renderZonas();logAdminAction("config","Zonas de entrega actualizadas",zonasData.length+" zonas configuradas");})
    .catch(e=>alert("Error: "+e.message));
}

/* ====================================================
   HERO CONFIG
   ==================================================== */
function loadHeroConfig(){
  if(typeof firebase==="undefined"||!firebase.firestore) return;
  firebase.firestore().collection("config").doc("hero").get()
    .then(doc=>{
      if(!doc.exists) return;
      const d=doc.data();
      if(d.titulo) document.getElementById("heroTitulo").value=d.titulo;
      if(d.subtitulo) document.getElementById("heroSubtitulo").value=d.subtitulo;
      if(d.texto) document.getElementById("heroTexto").value=d.texto;
      if(d.btnTexto) document.getElementById("heroBtnTexto").value=d.btnTexto;
      if(d.btnAccion) document.getElementById("heroBtnAccion").value=d.btnAccion;
      if(d.activo!==undefined) document.getElementById("heroActivo").value=d.activo?"1":"0";
    }).catch(()=>{});
}

function guardarHero(){
  const data={
    titulo:document.getElementById("heroTitulo").value,
    subtitulo:document.getElementById("heroSubtitulo").value,
    texto:document.getElementById("heroTexto").value,
    btnTexto:document.getElementById("heroBtnTexto").value,
    btnAccion:document.getElementById("heroBtnAccion").value,
    activo:document.getElementById("heroActivo").value==="1",
    updatedAt:new Date().toISOString()
  };
  firebase.firestore().collection("config").doc("hero").set(data,{merge:true})
    .then(()=>{alert("Hero guardado");logAdminAction("config","Hero actualizado","Título: "+data.titulo);})
    .catch(e=>alert("Error: "+e.message));
}

/* ====================================================
   SEO
   ==================================================== */
function loadSEO(){
  if(typeof firebase==="undefined"||!firebase.firestore) return;
  firebase.firestore().collection("config").doc("seo").get()
    .then(doc=>{
      if(!doc.exists) return;
      const d=doc.data();
      if(d.title) document.getElementById("seoTitle").value=d.title;
      if(d.description) document.getElementById("seoDescription").value=d.description;
      if(d.keywords) document.getElementById("seoKeywords").value=d.keywords;
      if(d.ogImage) document.getElementById("seoOgImage").value=d.ogImage;
      if(d.twitter) document.getElementById("seoTwitter").value=d.twitter;
    }).catch(()=>{});
}

function guardarSEO(){
  const data={
    title:document.getElementById("seoTitle").value,
    description:document.getElementById("seoDescription").value,
    keywords:document.getElementById("seoKeywords").value,
    ogImage:document.getElementById("seoOgImage").value,
    twitter:document.getElementById("seoTwitter").value,
    updatedAt:new Date().toISOString()
  };
  firebase.firestore().collection("config").doc("seo").set(data,{merge:true})
    .then(()=>{alert("SEO guardado");logAdminAction("config","SEO actualizado","Título: "+data.title);})
    .catch(e=>alert("Error: "+e.message));
}

/* ====================================================
   PWA
   ==================================================== */
function loadPWA(){
  if(typeof firebase==="undefined"||!firebase.firestore) return;
  firebase.firestore().collection("config").doc("pwa").get()
    .then(doc=>{
      if(!doc.exists) return;
      const d=doc.data();
      if(d.name) document.getElementById("pwaName").value=d.name;
      if(d.desc) document.getElementById("pwaDesc").value=d.desc;
      if(d.color) document.getElementById("pwaColor").value=d.color;
      if(d.icon192) document.getElementById("pwaIcon192").value=d.icon192;
      if(d.icon512) document.getElementById("pwaIcon512").value=d.icon512;
      if(d.bgColor) document.getElementById("pwaBgColor").value=d.bgColor;
    }).catch(()=>{});
}

function guardarPWA(){
  const data={
    name:document.getElementById("pwaName").value,
    desc:document.getElementById("pwaDesc").value,
    color:document.getElementById("pwaColor").value,
    icon192:document.getElementById("pwaIcon192").value,
    icon512:document.getElementById("pwaIcon512").value,
    bgColor:document.getElementById("pwaBgColor").value,
    updatedAt:new Date().toISOString()
  };
  firebase.firestore().collection("config").doc("pwa").set(data,{merge:true})
    .then(()=>{alert("PWA guardada");logAdminAction("config","PWA actualizada","Nombre: "+data.name);})
    .catch(e=>alert("Error: "+e.message));
}

/* ====================================================
   REPORTES
   ==================================================== */
function generarReporte(){
  const fi=document.getElementById("reporteFechaInicio").value;
  const ff=document.getElementById("reporteFechaFin").value;
  let pedidos=[...allPedidos];
  if(fi) pedidos=pedidos.filter(p=>p.fecha&&p.fecha>=fi);
  if(ff) pedidos=pedidos.filter(p=>p.fecha&&p.fecha<=ff+"T23:59:59");
  const container=document.getElementById("reporteResultado");
  if(!pedidos.length){container.innerHTML='<p style="color:#666;text-align:center;">Sin pedidos en este rango</p>';return;}
  const total=pedidos.reduce((s,p)=>s+(p.total||0),0);
  const porMarca={};const porEstado={};
  pedidos.forEach(p=>{
    const m=p.marca||"general";porMarca[m]=(porMarca[m]||0)+(p.total||0);
    const e=p.estado||"Pendiente";porEstado[e]=(porEstado[e]||0)+1;
  });
  let html=`<div class="cliente-card">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;">
      <div><strong style="color:var(--primary);font-size:24px;">${pedidos.length}</strong><br><small style="color:#888;">Pedidos totales</small></div>
      <div><strong style="color:var(--primary);font-size:24px;">$${total.toFixed(0)}</strong><br><small style="color:#888;">Ingresos totales</small></div>
    </div>
    <hr class="order-summary-divider" style="margin:15px 0;">
    <strong style="color:#aaa;font-size:13px;">Por marca:</strong>
    <div style="margin-top:8px;">`;
  Object.entries(porMarca).forEach(([m,t])=>{html+=`<span style="display:inline-block;padding:6px 12px;margin:4px;background:#1a1a1a;border-radius:8px;font-size:13px;"><strong>${m}</strong>: $${t.toFixed(0)}</span>`;});
  html+=`</div><strong style="color:#aaa;font-size:13px;margin-top:10px;display:block;">Por estado:</strong><div style="margin-top:8px;">`;
  Object.entries(porEstado).forEach(([e,c])=>{html+=`<span style="display:inline-block;padding:6px 12px;margin:4px;background:#1a1a1a;border-radius:8px;font-size:13px;"><strong>${e}</strong>: ${c}</span>`;});
  html+=`</div></div>`;
  container.innerHTML=html;
}

function exportarCSV(){
  const fi=document.getElementById("reporteFechaInicio").value;
  const ff=document.getElementById("reporteFechaFin").value;
  let pedidos=[...allPedidos];
  if(fi) pedidos=pedidos.filter(p=>p.fecha&&p.fecha>=fi);
  if(ff) pedidos=pedidos.filter(p=>p.fecha&&p.fecha<=ff+"T23:59:59");
  let csv="Fecha,Cliente,WhatsApp,Marca,Direccion,Colonia,Estado,Total\n";
  pedidos.forEach(p=>{csv+=`"${p.fecha||""}","${p.cliente||""}","${p.telefono||""}","${p.marca||""}","${p.direccion||""}","${p.colonia||""}","${p.estado||""}",${p.total||0}\n`;});
  downloadFile(csv,"pedidos.csv","text/csv");
}

function exportarExcel(){
  const fi=document.getElementById("reporteFechaInicio").value;
  const ff=document.getElementById("reporteFechaFin").value;
  let pedidos=[...allPedidos];
  if(fi) pedidos=pedidos.filter(p=>p.fecha&&p.fecha>=fi);
  if(ff) pedidos=pedidos.filter(p=>p.fecha&&p.fecha<=ff+"T23:59:59");
  let xml='<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Pedidos"><Table>';
  xml+='<Row><Cell><Data ss:Type="String">Fecha</Data></Cell><Cell><Data ss:Type="String">Cliente</Data></Cell><Cell><Data ss:Type="String">WhatsApp</Data></Cell><Cell><Data ss:Type="String">Marca</Data></Cell><Cell><Data ss:Type="String">Estado</Data></Cell><Cell><Data ss:Type="String">Total</Data></Cell></Row>';
  pedidos.forEach(p=>{xml+=`<Row><Cell><Data ss:Type="String">${p.fecha||""}</Data></Cell><Cell><Data ss:Type="String">${p.cliente||""}</Data></Cell><Cell><Data ss:Type="String">${p.telefono||""}</Data></Cell><Cell><Data ss:Type="String">${p.marca||""}</Data></Cell><Cell><Data ss:Type="String">${p.estado||""}</Data></Cell><Cell><Data ss:Type="Number">${p.total||0}</Data></Cell></Row>`;});
  xml+='</Table></Worksheet></Workbook>';
  downloadFile(xml,"pedidos.xls","application/vnd.ms-excel");
}

function downloadFile(content,filename,type){
  const blob=new Blob([content],{type});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download=filename;a.click();
  URL.revokeObjectURL(url);
}

/* ====================================================
   RESPALDOS
   ==================================================== */
function exportarRespaldo(){
  const status=document.getElementById("backupStatus");
  status.textContent="Exportando...";
  const data={productos:JSON.parse(localStorage.getItem("productos")||"[]"),exportDate:new Date().toISOString(),version:"3.0"};
  if(typeof firebase!=="undefined"&&firebase.firestore){
    Promise.all([
      firebase.firestore().collection("pedidos").get(),
      firebase.firestore().collection("promociones").get(),
      firebase.firestore().collection("config").doc("logos").get(),
      firebase.firestore().collection("config").doc("general").get(),
      firebase.firestore().collection("config").doc("horarios").get(),
      firebase.firestore().collection("config").doc("zonas").get()
    ]).then(([pedidos,promos,logos,general,horarios,zonas])=>{
      data.pedidos=[];pedidos.forEach(d=>data.pedidos.push({id:d.id,...d.data()}));
      data.promociones=[];promos.forEach(d=>data.promociones.push({id:d.id,...d.data()}));
      if(logos.exists) data.logos=logos.data();
      if(general.exists) data.generalConfig=general.data();
      if(horarios.exists) data.horarios=horarios.data();
      if(zonas.exists) data.zonas=zonas.data();
      const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download="medio-urbano-backup-"+new Date().toISOString().split("T")[0]+".json";a.click();
      status.textContent="Respaldo exportado: "+new Date().toLocaleString();
    }).catch(e=>{status.textContent="Error: "+e.message;});
  }
}

function importarRespaldo(file){
  if(!file) return;
  if(!confirm("¿Importar respaldo? Esto reemplazará los datos actuales.")) return;
  const status=document.getElementById("backupStatus");
  status.textContent="Importando...";
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const data=JSON.parse(e.target.result);
      if(data.productos) localStorage.setItem("productos",JSON.stringify(data.productos));
      if(typeof firebase!=="undefined"&&firebase.firestore){
        const tasks=[];
        if(data.pedidos) data.pedidos.forEach(p=>tasks.push(firebase.firestore().collection("pedidos").doc(p.id).set(p)));
        if(data.promociones) data.promociones.forEach(p=>tasks.push(firebase.firestore().collection("promociones").doc(p.id||String(Date.now()+Math.random())).set(p)));
        if(data.logos) tasks.push(firebase.firestore().collection("config").doc("logos").set(data.logos));
        if(data.generalConfig) tasks.push(firebase.firestore().collection("config").doc("general").set(data.generalConfig));
        if(data.horarios) tasks.push(firebase.firestore().collection("config").doc("horarios").set(data.horarios));
        if(data.zonas) tasks.push(firebase.firestore().collection("config").doc("zonas").set(data.zonas));
        Promise.all(tasks).then(()=>{
          status.textContent="Importado correctamente. Recargando...";
          setTimeout(()=>location.reload(),1500);
        }).catch(err=>{status.textContent="Error: "+err.message;});
      }
    }catch(err){status.textContent="Error al leer archivo: "+err.message;}
  };
  reader.readAsText(file);
}

/* ====================================================
   SEGURIDAD
   ==================================================== */
function recordAccess(){
  const now=new Date().toISOString();
  localStorage.setItem("adminLastAccess",now);
  const el=document.getElementById("segUltimoAcceso");
  if(el) el.value=new Date(now).toLocaleString();
  logAdminAction("sistema","Acceso al panel","Último acceso: "+new Date(now).toLocaleString());
}

function renderSeguridadActividad(){
  const container=document.getElementById("segActividad");
  if(!container) return;
  const log=JSON.parse(localStorage.getItem("adminAccessLog")||"[]");
  container.innerHTML="";
  log.slice().reverse().forEach(l=>{
    container.innerHTML+=`<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px;color:#aaa;"><span style="color:#666;">${new Date(l.time).toLocaleString()}</span> — ${l.action}</div>`;
  });
}

function cambiarPassword(){
  const actual=document.getElementById("segPasswordActual").value;
  const nueva=document.getElementById("segPasswordNueva").value;
  const confirm=document.getElementById("segPasswordConfirm").value;
  if(actual!=="medio123"){alert("Contraseña actual incorrecta");return;}
  if(!nueva){alert("Ingresa nueva contraseña");return;}
  if(nueva!==confirm){alert("Las contraseñas no coinciden");return;}
  if(nueva.length<4){alert("Mínimo 4 caracteres");return;}
  localStorage.setItem("adminPassword",nueva);
  logAdminAction("seguridad","Contraseña cambiada","Acceso seguro verificado");
  alert("Contraseña cambiada. Usa la nueva contraseña la próxima vez.");
}

/* ====================================================
   BRAND IDENTITY EXTENDED
   ==================================================== */
function guardarBrandIdentity(){
  const data={
    colorPrimario:document.getElementById("brandColorPrimario").value,
    colorSecundario:document.getElementById("brandColorSecundario").value,
    slogan:document.getElementById("brandSlogan").value,
    descripcion:document.getElementById("brandDescripcion").value,
    updatedAt:new Date().toISOString()
  };
  firebase.firestore().collection("config").doc("brandIdentity").set(data,{merge:true})
    .then(()=>{alert("Identidad guardada");logAdminAction("config","Identidad de marca actualizada","Slogan: "+data.slogan);})
    .catch(e=>alert("Error: "+e.message));
}

/* ====================================================
   LOGS - REGISTRO DE ACTIVIDAD
   ==================================================== */
let allLogs=[];

function initLogs(){
  loadLogs();
}

function logAdminAction(tipo,accion,detalle){
  if(typeof firebase==="undefined"||!firebase.firestore) return;
  const entry={
    tipo:tipo||"sistema",
    accion:accion||"",
    detalle:detalle||"",
    usuario:"admin",
    fecha:new Date().toISOString()
  };
  firebase.firestore().collection("logs").add(entry)
    .then(()=>{
      allLogs.unshift(entry);
      if(allLogs.length>500) allLogs=allLogs.slice(0,500);
      renderLogs();
    }).catch(()=>{});
}

function loadLogs(){
  if(typeof firebase==="undefined"||!firebase.firestore) return;
  firebase.firestore().collection("logs").orderBy("fecha","desc").limit(500).get()
    .then(snap=>{
      allLogs=[];
      snap.forEach(doc=>allLogs.push({id:doc.id,...doc.data()}));
      renderLogs();
    }).catch(()=>{});
}

function renderLogs(){
  const container=document.getElementById("listaLogs");
  const statsEl=document.getElementById("logsStats");
  if(!container) return;
  const filtroTipo=document.getElementById("filtroLogTipo")?.value||"";
  const buscar=(document.getElementById("filtroLogBuscar")?.value||"").toLowerCase();
  const filtroFecha=document.getElementById("filtroLogFecha")?.value||"";
  let filtered=[...allLogs];
  if(filtroTipo) filtered=filtered.filter(l=>l.tipo===filtroTipo);
  if(buscar) filtered=filtered.filter(l=>(l.accion||"").toLowerCase().includes(buscar)||(l.detalle||"").toLowerCase().includes(buscar));
  if(filtroFecha) filtered=filtered.filter(l=>l.fecha&&l.fecha.startsWith(filtroFecha));
  if(statsEl){
    const porTipo={};
    allLogs.forEach(l=>{porTipo[l.tipo]=(porTipo[l.tipo]||0)+1;});
    statsEl.innerHTML=`Total: <strong>${allLogs.length}</strong> | Filtrados: <strong>${filtered.length}</strong> | Por tipo: ${Object.entries(porTipo).map(([t,c])=>`<span style="color:${tipoColor(t)}">${t}: ${c}</span>`).join(" · ")}`;
  }
  if(!filtered.length){container.innerHTML='<p style="color:#666;text-align:center;padding:30px;">Sin registros</p>';return;}
  container.innerHTML="";
  filtered.forEach(l=>{
    const f=l.fecha?new Date(l.fecha):new Date();
    const icon=tipoIcon(l.tipo);
    const color=tipoColor(l.tipo);
    container.innerHTML+=`
      <div style="display:flex;gap:14px;align-items:flex-start;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.05);transition:background .2s;" onmouseover="this.style.background='rgba(255,255,255,.03)'" onmouseout="this.style.background='transparent'">
        <div style="width:36px;height:36px;border-radius:10px;background:${color}22;color:${color};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px;">
          <i class="fas fa-${icon}"></i>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
            <strong style="font-size:13px;color:#e0e0e0;">${l.accion||"Sin acción"}</strong>
            <span style="font-size:11px;color:#666;white-space:nowrap;">${f.toLocaleDateString()} ${f.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>
          </div>
          <div style="font-size:12px;color:#888;margin-top:3px;">${l.detalle||""}</div>
          <div style="margin-top:5px;"><span style="display:inline-block;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;text-transform:uppercase;background:${color}22;color:${color};">${l.tipo||"sistema"}</span></div>
        </div>
      </div>`;
  });
}

function tipoIcon(tipo){
  const map={pedido:"receipt",producto:"utensils",promo:"tag",config:"cog",seguridad:"shield-alt",sistema:"power-off"};
  return map[tipo]||"info-circle";
}

function tipoColor(tipo){
  const map={pedido:"#2196f3",producto:"#ff9800",promo:"#e91e63",config:"#9c27b0",seguridad:"#ff3b30",sistema:"#607d8b"};
  return map[tipo]||"#888";
}

function limpiarLogs(){
  if(!confirm("¿Eliminar TODOS los logs? Esta acción no se puede deshacer.")) return;
  if(typeof firebase==="undefined"||!firebase.firestore) return;
  firebase.firestore().collection("logs").get()
    .then(snap=>{
      const batch=firebase.firestore().batch();
      snap.forEach(doc=>batch.delete(doc.ref));
      return batch.commit();
    })
    .then(()=>{allLogs=[];renderLogs();logAdminAction("sistema","Logs limpiados","Todos los registros eliminados");})
    .catch(e=>alert("Error: "+e.message));
}

function exportarLogs(){
  let csv="Fecha,Tipo,Acción,Detalle,Usuario\n";
  allLogs.forEach(l=>{
    csv+=`"${l.fecha||""}","${l.tipo||""}","${(l.accion||"").replace(/"/g,'""')}","${(l.detalle||"").replace(/"/g,'""')}","${l.usuario||""}"\n`;
  });
  const blob=new Blob([csv],{type:"text/csv"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="logs-"+new Date().toISOString().split("T")[0]+".csv";a.click();
  URL.revokeObjectURL(url);
  logAdminAction("sistema","Logs exportados",allLogs.length+" registros");
}
