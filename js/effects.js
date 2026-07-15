/*====================================================
effects.js - MEDIO URBANO V3 - Efectos Visuales
====================================================*/

// CURSOR GLOW
const glow=document.createElement("div");
glow.className="cursor-glow";
document.body.appendChild(glow);
document.addEventListener("mousemove",(e)=>{
  glow.style.left=e.clientX+"px";
  glow.style.top=e.clientY+"px";
});

// PARALLAX DATA-SPEED
window.addEventListener("mousemove",(e)=>{
  document.querySelectorAll("[data-speed]").forEach(layer=>{
    const speed=layer.dataset.speed;
    const x=(window.innerWidth-e.pageX*speed)/120;
    const y=(window.innerHeight-e.pageY*speed)/120;
    layer.style.transform=`translate(${x}px,${y}px)`;
  });
});

// BOTONES MAGNETICOS
document.querySelectorAll(".btn-primary,.btn-secondary,.btn-brand").forEach(btn=>{
  btn.addEventListener("mousemove",(e)=>{
    const rect=btn.getBoundingClientRect();
    const x=e.clientX-rect.left-rect.width/2;
    const y=e.clientY-rect.top-rect.height/2;
    btn.style.transform=`translate(${x*.15}px,${y*.15}px)`;
  });
  btn.addEventListener("mouseleave",()=>{btn.style.transform="translate(0,0)";});
});

// PARTICULAS
const canvas=document.createElement("canvas");
canvas.id="particles";
document.body.appendChild(canvas);
const ctx=canvas.getContext("2d");
function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
resizeCanvas();
window.addEventListener("resize",resizeCanvas);
const particles=[];
for(let i=0;i<90;i++){
  particles.push({
    x:Math.random()*canvas.width,y:Math.random()*canvas.height,
    r:Math.random()*3+1,dx:(Math.random()-.5)*0.4,dy:(Math.random()-.5)*0.4
  });
}
function drawParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle="rgba(255,208,40,.18)";
    ctx.fill();
    p.x+=p.dx;p.y+=p.dy;
    if(p.x<0)p.x=canvas.width;if(p.x>canvas.width)p.x=0;
    if(p.y<0)p.y=canvas.height;if(p.y>canvas.height)p.y=0;
  });
  requestAnimationFrame(drawParticles);
}
drawParticles();

// SCROLL PARALLAX
window.addEventListener("scroll",()=>{
  const scroll=window.scrollY;
  document.querySelectorAll(".parallax").forEach(el=>{
    el.style.transform=`translateY(${scroll*.18}px)`;
  });
});

// GLOW EN TARJETAS
document.querySelectorAll(".brand,.producto,.promo-card").forEach(card=>{
  card.addEventListener("mousemove",(e)=>{
    const rect=card.getBoundingClientRect();
    const x=e.clientX-rect.left;
    const y=e.clientY-rect.top;
    card.style.background=`radial-gradient(circle at ${x}px ${y}px,rgba(255,208,40,.18),#151515 65%)`;
  });
  card.addEventListener("mouseleave",()=>{card.style.background="#151515";});
});

// NUMEROS
document.querySelectorAll("[data-counter]").forEach(counter=>{
  let value=0;
  const target=Number(counter.dataset.counter);
  const timer=setInterval(()=>{
    value+=Math.ceil(target/100);
    if(value>=target){value=target;clearInterval(timer);}
    counter.innerHTML=value;
  },20);
});

// CONFETI
function lanzarConfeti(){
  for(let i=0;i<80;i++){
    const confeti=document.createElement("span");
    confeti.className="confeti";
    confeti.style.left=Math.random()*100+"vw";
    confeti.style.background=["#FFD028","#31C46D","#FF5722"][Math.floor(Math.random()*3)];
    confeti.style.animationDuration=(Math.random()*3+2)+"s";
    document.body.appendChild(confeti);
    setTimeout(()=>{confeti.remove();},5000);
  }
}

// SHAKE
function shake(element){
  element.animate([
    {transform:"translateX(-5px)"},{transform:"translateX(5px)"},
    {transform:"translateX(-5px)"},{transform:"translateX(0)"}
  ],{duration:400});
}