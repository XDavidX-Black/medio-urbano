/*====================================================
dashboard.js - MEDIO URBANO V3
Carga pedidos desde Firestore y muestra logos de marca
=====================================================*/

const dashboard={ventasHoy:0,pedidosHoy:0,clientes:0,productos:0};
let brandLogosCache={};

function cargarDashboard(){
  const productos=JSON.parse(localStorage.getItem("productos"))||[];
  dashboard.productos=productos.length;

  if(typeof firebase!=="undefined"&&firebase.firestore){
    Promise.all([
      firebase.firestore().collection("pedidos").get(),
      firebase.firestore().collection("config").doc("logos").get()
    ]).then(([pedidosSnap,logosDoc])=>{
      if(logosDoc.exists) brandLogosCache=logosDoc.data();

      const pedidos=[];
      pedidosSnap.forEach(doc=>pedidos.push({id:doc.id,...doc.data()}));

      dashboard.pedidosHoy=pedidos.length;
      dashboard.ventasHoy=0;
      pedidos.forEach(p=>{dashboard.ventasHoy+=Number(p.total)||0;});
      dashboard.clientes=new Set(pedidos.map(p=>p.cliente)).size;

      actualizarCards();
      ultimosPedidos(pedidos);
      renderPedidosAdmin(pedidos);
      actividadReciente(pedidos);
    }).catch(err=>{
      console.warn("Error loading dashboard:",err);
      cargarDashboardLocal();
    });
  }else{
    cargarDashboardLocal();
  }
}

function cargarDashboardLocal(){
  const pedidos=JSON.parse(localStorage.getItem("pedidos"))||[];
  const productos=JSON.parse(localStorage.getItem("productos"))||[];
  dashboard.pedidosHoy=pedidos.length;
  dashboard.productos=productos.length;
  dashboard.ventasHoy=0;
  pedidos.forEach(p=>{dashboard.ventasHoy+=Number(p.total);});
  dashboard.clientes=new Set(pedidos.map(p=>p.cliente)).size;
  actualizarCards();
  ultimosPedidos(pedidos);
  actividadReciente(pedidos);
}

function actualizarCards(){
  const v=document.getElementById("statIngresos");
  const p=document.getElementById("statPedidos");
  if(v) v.textContent="$"+dashboard.ventasHoy.toFixed(0);
  if(p) p.textContent=dashboard.pedidosHoy;
}

function getLogoForBrand(brand){
  if(!brand||!brandLogosCache[brand]) return "";
  return brandLogosCache[brand];
}

function ultimosPedidos(pedidos){
  const lista=document.getElementById("listaPedidos");
  if(!lista) return;
  if(!pedidos||!pedidos.length){
    lista.innerHTML="<p style='color:#666;text-align:center;padding:30px;'>Sin pedidos aún</p>";
    return;
  }
  lista.innerHTML="";
  pedidos.slice(-5).reverse().forEach(p=>{
    const logo=getLogoForBrand(p.marca);
    lista.innerHTML+=`
      <div class="order" style="display:flex;align-items:center;gap:12px;padding:14px;border-bottom:1px solid rgba(255,255,255,.06);">
        ${logo?`<img src="${logo}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:#1a1a1a;padding:4px;">`:`<div style="width:36px;height:36px;background:#1a1a1a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;">🍔</div>`}
        <div style="flex:1;">
          <strong style="font-size:13px;">${p.cliente||"Cliente"}</strong><br>
          <small style="color:#888;">${p.marca?(p.marca.charAt(0).toUpperCase()+p.marca.slice(1)):"General"} · ${p.fecha?new Date(p.fecha).toLocaleDateString():"Hoy"}</small>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:700;color:var(--primary);">$${p.total||0}</div>
          <small style="color:${p.estado==='Entregado'?'var(--success)':'#ff9500'};">${p.estado||'Pendiente'}</small>
        </div>
      </div>`;
  });
}

function renderPedidosAdmin(pedidos){
  const container=document.getElementById("listaPedidosFull");
  if(!container) return;
  if(!pedidos||!pedidos.length){
    container.innerHTML="<p style='color:#666;text-align:center;padding:30px;'>Sin pedidos aún</p>";
    return;
  }
  container.innerHTML="";
  pedidos.slice().reverse().forEach(p=>{
    const logo=getLogoForBrand(p.marca);
    const productos=(p.productos||[]).map(pr=>`${pr.nombre} x${pr.cantidad}`).join(", ");
    container.innerHTML+=`
      <div style="background:#1a1a1a;border-radius:16px;padding:20px;margin-bottom:15px;border:1px solid rgba(255,255,255,.06);">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
          ${logo?`<img src="${logo}" style="width:48px;height:48px;object-fit:contain;border-radius:12px;background:#111;padding:6px;">`:`<div style="width:48px;height:48px;background:#111;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;">🍔</div>`}
          <div style="flex:1;">
            <strong>${p.cliente||"Cliente"}</strong>
            <div style="color:var(--primary);font-size:12px;letter-spacing:1px;">${p.marca?(p.marca.charAt(0).toUpperCase()+p.marca.slice(1)):"General"}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:700;color:var(--primary);font-size:18px;">$${p.total||0}</div>
            <small style="color:${p.estado==='Entregado'?'var(--success)':'#ff9500'};">${p.estado||'Pendiente'}</small>
          </div>
        </div>
        <div style="font-size:13px;color:#aaa;">
          <span><i class="fas fa-phone" style="margin-right:5px;"></i>${p.telefono||""}</span> · 
          <span><i class="fas fa-map-marker-alt" style="margin-right:5px;"></i>${p.direccion||""}</span>
        </div>
        ${p.extras&&p.extras.length?`<div style="margin-top:8px;font-size:12px;color:#888;"><i class="fas fa-plus-circle" style="margin-right:4px;"></i>Extras: ${p.extras.join(", ")}</div>`:""}
        ${p.comentarios?`<div style="margin-top:6px;font-size:12px;color:#888;"><i class="fas fa-comment" style="margin-right:4px;"></i>${p.comentarios}</div>`:""}
        <div style="margin-top:10px;font-size:12px;color:#666;">${p.fecha?new Date(p.fecha).toLocaleString():""}</div>
      </div>`;
  });
}

function actividadReciente(pedidos){
  const act=document.getElementById("listaActividad");
  if(!act) return;
  act.innerHTML="";
  if(!pedidos||!pedidos.length){
    act.innerHTML="<li><i class='fas fa-circle'></i><div><strong>Sistema iniciado</strong><br><small>Ahora</small></div></li>";
    return;
  }
  pedidos.slice(-6).reverse().forEach(p=>{
    act.innerHTML+=`
      <li>
        <i class="fas fa-circle"></i>
        <div><strong>Nuevo pedido de ${p.cliente||"Cliente"}</strong><br><small>${p.marca?(p.marca.charAt(0).toUpperCase()+p.marca.slice(1)):"General"} · $${p.total||0} · ${p.fecha?new Date(p.fecha).toLocaleTimeString():"Ahora"}</small></div>
      </li>`;
  });
}

setInterval(cargarDashboard,10000);

window.addEventListener("load",()=>{cargarDashboard();});
