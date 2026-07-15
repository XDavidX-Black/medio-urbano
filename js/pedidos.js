/*====================================================
pedidos.js - MEDIO URBANO V3 - Gestion de Pedidos
====================================================*/

let pedidos=[];

function crearPedido(cliente,telefono,direccion,carrito){
  const pedido={
    id:Date.now(),cliente,telefono,direccion,
    productos:carrito,total:calcularTotalPedido(carrito),
    estado:"Pendiente",fecha:new Date().toLocaleString()
  };
  pedidos.push(pedido);
  guardarPedidos();
  return pedido;
}

function calcularTotalPedido(lista){
  return lista.reduce((sum,item)=>sum+item.precio*item.cantidad,0);
}

function guardarPedidos(){localStorage.setItem("pedidos",JSON.stringify(pedidos));}

function cargarPedidos(){
  const data=localStorage.getItem("pedidos");
  if(data) pedidos=JSON.parse(data);
}

function cambiarEstado(id,estado){
  const pedido=pedidos.find(p=>p.id===id);
  if(!pedido) return;
  pedido.estado=estado;
  guardarPedidos();
}

function eliminarPedido(id){pedidos=pedidos.filter(p=>p.id!==id);guardarPedidos();}

function obtenerPedido(id){return pedidos.find(p=>p.id===id);}

function renderPedidos(lista){
  const contenedor=document.querySelector("#listaPedidos");
  if(!contenedor) return;
  contenedor.innerHTML="";
  if(!lista||!lista.length){
    contenedor.innerHTML=`<p style="color:#666;text-align:center;padding:30px;">Sin pedidos aún</p>`;
    return;
  }
  lista.forEach(pedido=>{
    contenedor.innerHTML+=`
      <div class="order">
        <div><strong>#${pedido.id}</strong><br><small>${pedido.cliente}</small></div>
        <div>$${pedido.total}</div>
        <div><span class="status pending">${pedido.estado}</span></div>
      </div>`;
  });
}

function verPedido(id){
  const pedido=obtenerPedido(id);
  if(!pedido) return;
  let detalle=`Pedido #${pedido.id}\n\n`;
  pedido.productos.forEach(item=>{detalle+=`${item.nombre} x${item.cantidad}\n`;});
  detalle+=`\nTotal: $${pedido.total}`;
  alert(detalle);
}

window.addEventListener("load",()=>{cargarPedidos();renderPedidos(pedidos);});