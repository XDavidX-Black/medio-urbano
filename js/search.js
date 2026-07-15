/*====================================================
search.js - MEDIO URBANO V3 - Buscador Inteligente
====================================================*/

let productosBusqueda=[];

function cargarProductosBusqueda(){
  const local=JSON.parse(localStorage.getItem("productos"));
  if(local && local.length){
    productosBusqueda=local;
    return;
  }
  Object.keys(categorias).forEach(cat=>{
    if(categorias[cat].productos){
      categorias[cat].productos.forEach(producto=>{
        productosBusqueda.push(producto);
      });
    }
  });
}

function buscarProducto(texto){
  texto=texto.toLowerCase().trim();
  const resultados=productosBusqueda.filter(producto=>{
    return(
      producto.nombre.toLowerCase().includes(texto)||
      producto.descripcion.toLowerCase().includes(texto)
    );
  });
  mostrarResultados(resultados);
}

function mostrarResultados(lista){
  const contenedor=document.querySelector("#resultadosBusqueda");
  if(!contenedor) return;
  contenedor.innerHTML="";
  if(lista.length===0){
    contenedor.innerHTML=`
      <div class="no-results">
        <i class="fas fa-search"></i>
        <h3>No encontramos productos.</h3>
      </div>`;
    return;
  }
  lista.forEach(producto=>{
    contenedor.innerHTML+=`
      <div class="producto">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion}</p>
        <strong>$${producto.precio}</strong>
        <button onclick='agregarCarrito(${JSON.stringify(producto)})'>Agregar</button>
      </div>`;
  });
}

const buscador=document.querySelector("#buscador");
if(buscador){
  buscador.addEventListener("keyup",e=>{buscarProducto(e.target.value);});
}

window.addEventListener("load",()=>{cargarProductosBusqueda();});

// AUTOCOMPLETE
function sugerencias(texto){
  const sug=productosBusqueda.filter(p=>
    p.nombre.toLowerCase().startsWith(texto.toLowerCase())
  );
  const caja=document.querySelector("#autocomplete");
  if(!caja) return;
  caja.innerHTML="";
  sug.slice(0,5).forEach(item=>{
    caja.innerHTML+=`
      <div class="suggestion" onclick="seleccionarBusqueda('${item.nombre}')">
        ${item.nombre}
      </div>`;
  });
}

function seleccionarBusqueda(nombre){
  document.querySelector("#buscador").value=nombre;
  buscarProducto(nombre);
  document.querySelector("#autocomplete").innerHTML="";
}

if(buscador){
  buscador.addEventListener("input",e=>{sugerencias(e.target.value);});
}

document.addEventListener("click",e=>{
  if(!e.target.closest(".search-box")){
    const box=document.querySelector("#autocomplete");
    if(box) box.innerHTML="";
  }
});