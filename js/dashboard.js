/*====================================================
dashboard.js - MEDIO URBANO V3
====================================================*/

const dashboard={ventasHoy:0,pedidosHoy:0,clientes:0,productos:0};

function cargarDashboard(){
  const pedidos=JSON.parse(localStorage.getItem("pedidos"))||[];
  const productos=JSON.parse(localStorage.getItem("productos"))||[];
  dashboard.pedidosHoy=pedidos.length;
  dashboard.productos=productos.length;
  dashboard.ventasHoy=0;
  pedidos.forEach(p=>{dashboard.ventasHoy+=Number(p.total);});
  dashboard.clientes=new Set(pedidos.map(p=>p.cliente)).size;
  actualizarCards();
  ultimosPedidos();
  actividadReciente();
}

function actualizarCards(){
  const v=document.querySelector("#ventasHoy");
  const p=document.querySelector("#pedidosHoy");
  const c=document.querySelector("#clientes");
  const pr=document.querySelector("#productos");
  if(v) v.innerHTML="$"+dashboard.ventasHoy.toFixed(2);
  if(p) p.innerHTML=dashboard.pedidosHoy;
  if(c) c.innerHTML=dashboard.clientes;
  if(pr) pr.innerHTML=dashboard.productos;
}

function ultimosPedidos(){
  const pedidos=JSON.parse(localStorage.getItem("pedidos"))||[];
  const lista=document.querySelector("#ultimosPedidos");
  if(!lista) return;
  lista.innerHTML="";
  pedidos.reverse().slice(0,10).forEach(p=>{
    lista.innerHTML+=`
      <div class="order">
        <div><strong>#${p.id}</strong><br><small>${p.cliente}</small></div>
        <div>$${p.total}</div>
        <div><span class="status completed">Completado</span></div>
      </div>`;
  });
}

function actividadReciente(){
  const act=document.querySelector("#actividad");
  if(!act) return;
  act.innerHTML="";
  const eventos=["Nuevo pedido recibido","Producto agregado","Promoción creada","Cliente registrado","Pedido entregado","Precio actualizado"];
  for(let i=0;i<8;i++){
    act.innerHTML+=`
      <li>
        <i class="fas fa-circle"></i>
        ${eventos[Math.floor(Math.random()*eventos.length)]}
      </li>`;
  }
}

function generarGrafica(){
  const chart=document.querySelector("#grafica");
  if(!chart) return;
  let html="";
  for(let i=0;i<12;i++){
    const altura=Math.floor(Math.random()*180)+40;
    html+=`<div class="bar" style="height:${altura}px"></div>`;
  }
  chart.innerHTML=html;
}

setInterval(cargarDashboard,5000);

window.addEventListener("load",()=>{
  cargarDashboard();
  generarGrafica();
});