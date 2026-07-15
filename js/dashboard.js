/*====================================================
dashboard.js - MEDIO URBANO V3
Stats reales desde Firestore + gráficas
=====================================================*/

const dashboard={};
let brandLogosCache={};

function cargarDashboard(){
  if(typeof firebase==="undefined"||!firebase.firestore) return;
  Promise.all([
    firebase.firestore().collection("pedidos").get(),
    firebase.firestore().collection("config").doc("logos").get()
  ]).then(([pedidosSnap,logosDoc])=>{
    if(logosDoc.exists) brandLogosCache=logosDoc.data();
    const pedidos=[];
    pedidosSnap.forEach(doc=>pedidos.push({id:doc.id,...doc.data()}));
    const now=new Date();
    const today=now.toISOString().split("T")[0];
    const weekAgo=new Date(now-7*86400000).toISOString().split("T")[0];
    const monthStart=new Date(now.getFullYear(),now.getMonth(),1).toISOString().split("T")[0];

    const hoy=pedidos.filter(p=>p.fecha&&p.fecha.startsWith(today));
    const semana=pedidos.filter(p=>p.fecha&&p.fecha>=weekAgo);
    const mes=pedidos.filter(p=>p.fecha&&p.fecha>=monthStart);

    dashboard.pedidosHoy=hoy.length;
    dashboard.pendientes=hoy.filter(p=>p.estado==="Pendiente").length;
    dashboard.preparando=hoy.filter(p=>p.estado==="Preparando").length;
    dashboard.reparto=hoy.filter(p=>p.estado==="En reparto").length;
    dashboard.entregados=hoy.filter(p=>p.estado==="Entregado").length;
    dashboard.ingresosHoy=hoy.reduce((s,p)=>s+(p.total||0),0);
    dashboard.ingresosSem=semana.reduce((s,p)=>s+(p.total||0),0);
    dashboard.ingresosMes=mes.reduce((s,p)=>s+(p.total||0),0);

    // Producto más vendido
    const prodCount={};
    pedidos.forEach(p=>(p.productos||[]).forEach(item=>{prodCount[item.nombre]=(prodCount[item.nombre]||0)+item.cantidad;}));
    const topProd=Object.entries(prodCount).sort((a,b)=>b[1]-a[1])[0];
    dashboard.masVendido=topProd?topProd[0]:"-";

    // Marca más vendida
    const marcaCount={};
    pedidos.forEach(p=>{const m=p.marca||"general";marcaCount[m]=(marcaCount[m]||0)+(p.total||0);});
    const topMarca=Object.entries(marcaCount).sort((a,b)=>b[1]-a[1])[0];
    dashboard.marcaTop=topMarca?topMarca[0]:"-";

    actualizarCards();
    ultimosPedidos(pedidos);
    actividadReciente(pedidos);
    graficaVentas(semana);
    graficaMarcas(marcaCount);
  }).catch(err=>console.warn("Dashboard error:",err));
}

function getLogoForBrand(brand){
  return brandLogosCache[brand]||"";
}

function actualizarCards(){
  const map={statProductos:()=>document.getElementById("statProductos")&&(document.getElementById("statProductos").textContent=JSON.parse(localStorage.getItem("productos")||"[]").length),statPromos:()=>{},statPedidos:()=>setTxt("statPedidos",dashboard.pedidosHoy),statPendientes:()=>setTxt("statPendientes",dashboard.pendientes),statPreparando:()=>setTxt("statPreparando",dashboard.preparando),statReparto:()=>setTxt("statReparto",dashboard.reparto),statEntregados:()=>setTxt("statEntregados",dashboard.entregados),statIngresos:()=>setTxt("statIngresos","$"+dashboard.ingresosHoy.toFixed(0)),statIngresosSem:()=>setTxt("statIngresosSem","$"+dashboard.ingresosSem.toFixed(0)),statIngresosMes:()=>setTxt("statIngresosMes","$"+dashboard.ingresosMes.toFixed(0)),statClientes:()=>setTxt("statClientes","-"),statMasVendido:()=>setTxt("statMasVendido",dashboard.masVendido),statMarcaTop:()=>setTxt("statMarcaTop",dashboard.marcaTop)};
  Object.values(map).forEach(fn=>fn());
  // Clientes count
  if(typeof firebase!=="undefined"&&firebase.firestore){
    firebase.firestore().collection("pedidos").get().then(snap=>{
      const phones=new Set();
      snap.forEach(d=>{const t=(d.data().telefono||"").trim();if(t)phones.add(t);});
      setTxt("statClientes",phones.size);
    }).catch(()=>{});
  }
}

function setTxt(id,txt){const el=document.getElementById(id);if(el)el.textContent=txt;}

function ultimosPedidos(pedidos){
  const lista=document.getElementById("listaPedidos");
  if(!lista) return;
  const recent=pedidos.slice(-5).reverse();
  if(!recent.length){lista.innerHTML='<p style="color:#666;text-align:center;padding:30px;">Sin pedidos</p>';return;}
  lista.innerHTML="";
  recent.forEach(p=>{
    const logo=getLogoForBrand(p.marca);
    const estado=p.estado||"Pendiente";
    const cls="status-"+(estado.toLowerCase().replace(" ",""));
    lista.innerHTML+=`<div class="order" style="display:flex;align-items:center;gap:12px;padding:14px;border-bottom:1px solid rgba(255,255,255,.06);">
      ${logo?`<img src="${logo}" style="width:36px;height:36px;object-fit:contain;border-radius:8px;background:#1a1a1a;padding:4px;">`:`<div style="width:36px;height:36px;background:#1a1a1a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;">🍔</div>`}
      <div style="flex:1;"><strong style="font-size:13px;">${p.cliente||"Cliente"}</strong><br><small style="color:#888;">${p.marca?(p.marca.charAt(0).toUpperCase()+p.marca.slice(1)):"General"}</small></div>
      <div style="text-align:right;"><div style="font-weight:700;color:var(--primary);">$${(p.total||0).toFixed(0)}</div><span class="status-badge ${cls}" style="font-size:11px;">${estado}</span></div>
    </div>`;
  });
}

function actividadReciente(pedidos){
  const act=document.getElementById("listaActividad");
  if(!act) return;
  act.innerHTML="";
  const recent=pedidos.slice(-6).reverse();
  if(!recent.length){act.innerHTML='<li><i class="fas fa-circle"></i><div><strong>Sistema iniciado</strong><br><small>Ahora</small></div></li>';return;}
  recent.forEach(p=>{
    act.innerHTML+=`<li><i class="fas fa-circle"></i><div><strong>Pedido de ${p.cliente||"Cliente"}</strong><br><small>${p.marca?(p.marca.charAt(0).toUpperCase()+p.marca.slice(1)):"General"} · $${(p.total||0).toFixed(0)} · ${p.fecha?new Date(p.fecha).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):""}</small></div></li>`;
  });
}

function graficaVentas(semana){
  const chart=document.getElementById("chartVentas");
  if(!chart) return;
  const days=[];
  for(let i=6;i>=0;i--){
    const d=new Date();d.setDate(d.getDate()-i);
    const key=d.toISOString().split("T")[0];
    const label=d.toLocaleDateString("es",{weekday:"short"});
    const total=semana.filter(p=>p.fecha&&p.fecha.startsWith(key)).reduce((s,p)=>s+(p.total||0),0);
    days.push({label,total});
  }
  const max=Math.max(...days.map(d=>d.total),1);
  chart.innerHTML="";
  chart.style.display="flex";chart.style.alignItems="flex-end";chart.style.gap="8px";chart.style.padding="20px 10px 40px";
  days.forEach(d=>{
    const h=Math.max((d.total/max)*180,4);
    chart.innerHTML+=`<div class="chart-bar" style="height:${h}px;"><span>$${d.total.toFixed(0)}</span><div style="position:absolute;bottom:-25px;left:50%;transform:translateX(-50%);font-size:11px;color:#666;white-space:nowrap;">${d.label}</div></div>`;
  });
}

function graficaMarcas(marcaCount){
  const chart=document.getElementById("chartMarcas");
  if(!chart) return;
  const entries=Object.entries(marcaCount).sort((a,b)=>b[1]-a[1]);
  if(!entries.length){chart.innerHTML='<p style="color:#666;text-align:center;width:100%;">Sin datos</p>';return;}
  const max=entries[0][1]||1;
  chart.innerHTML="";chart.style.display="flex";chart.style.alignItems="flex-end";chart.style.gap="12px";chart.style.padding="20px 10px 40px";
  entries.forEach(([marca,total])=>{
    const h=Math.max((total/max)*150,20);
    chart.innerHTML+=`<div class="chart-bar" style="height:${h}px;background:${marca==='burgers'?'#ff6b35':marca==='cocina'?'#e74c3c':marca==='pasta'?'#f39c12':marca==='salad'?'#27ae60':'var(--primary)'};"><span>$${total.toFixed(0)}</span><div style="position:absolute;bottom:-25px;left:50%;transform:translateX(-50%);font-size:11px;color:#666;white-space:nowrap;">${marca}</div></div>`;
  });
}

function cargarDashboardLocal(){
  const pedidos=JSON.parse(localStorage.getItem("pedidos"))||[];
  dashboard.pedidosHoy=pedidos.length;dashboard.pendientes=0;dashboard.preparando=0;dashboard.reparto=0;dashboard.entregados=0;
  dashboard.ingresosHoy=0;dashboard.ingresosSem=0;dashboard.ingresosMes=0;
  dashboard.masVendido="-";dashboard.marcaTop="-";
  pedidos.forEach(p=>{dashboard.ingresosHoy+=Number(p.total);});
  actualizarCards();
}

setInterval(cargarDashboard,15000);
window.addEventListener("load",()=>{cargarDashboard();});
