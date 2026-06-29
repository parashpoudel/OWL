
// MODAL FUNCTIONS (top-level so they can be called from HTML onclick handlers)
function openModal(e){
  e&&e.preventDefault();
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(){
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow='';
}
function sendEmail(){
  const name=document.querySelector('[placeholder="Full name"]').value;
  const email=document.querySelector('[placeholder="your@email.com"]').value;
  const background=document.querySelector('select').value;
  const message=document.querySelector('[placeholder="No pitch needed. Just the truth about where you\'ve been and what draws you to this."]').value;
  
  if(!name||!email||!background||!message){
    alert('Please fill in all fields');
    return;
  }
  
  const subject='OWL Access Request';
  const body=`Name: ${name}%0AEmail: ${email}%0ABackground: ${background}%0A%0AMessage:%0A${message}`;
  window.location.href=`mailto:paraspaudel1021@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
  
  setTimeout(()=>{
    const modal=document.getElementById('modal');
    modal.querySelector('.modal').innerHTML=`
      <button class="modal-close" onclick="closeModal()" style="position:absolute;top:24px;right:24px;background:none;border:none;font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c4621a;padding:8px;cursor:pointer;">✕ Close</button>
      <div style="text-align:center;padding:60px 32px 40px;min-height:300px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:clamp(48px,10vw,72px);color:#c4621a;letter-spacing:4px;margin-bottom:24px;line-height:1;">Received.</div>
        <p style="color:#b0a898;font-size:15px;line-height:1.8;max-width:420px;margin:0 auto 32px;font-weight:300;">We'll be in touch if you're the right fit. No automated response. A real message from the founder.</p>
        <button onclick="closeModal()" style="font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;background:#c4621a;color:#1a1612;border:1px solid #c4621a;padding:14px 36px;cursor:pointer;font-weight:600;transition:all 0.3s;">Close</button>
      </div>
    `;
  },300);
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  
// CUSTOM CURSOR
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  cursor.style.left=mx+'px';cursor.style.top=my+'px';
});
function animRing(){
  rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;
  ring.style.left=rx+'px';ring.style.top=ry+'px';
  requestAnimationFrame(animRing);
}
animRing();
document.querySelectorAll('a,button,.model-card,.rule').forEach(el=>{
  el.addEventListener('mouseenter',()=>{ring.style.transform='translate(-50%,-50%) scale(1.8)';cursor.style.transform='translate(-50%,-50%) scale(0.5)';});
  el.addEventListener('mouseleave',()=>{ring.style.transform='translate(-50%,-50%) scale(1)';cursor.style.transform='translate(-50%,-50%) scale(1)';});
});

// HERO 3D MOUNTAIN (Three.js)
(function(){
  const canvas = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(canvas.offsetWidth,canvas.offsetHeight);
  renderer.setClearColor(0x000000,0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60,canvas.offsetWidth/canvas.offsetHeight,0.1,1000);
  camera.position.set(0,30,80);
  camera.lookAt(0,0,0);

  // Fog
  scene.fog = new THREE.FogExp2(0x0d0b09,0.008);

  // Terrain geometry
  const size=120,segs=100;
  const geo = new THREE.PlaneGeometry(size,size,segs,segs);
  const pos = geo.attributes.position;
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),z=pos.getZ(i);
    const r=Math.sqrt(x*x+z*z);
    let h=0;
    h+=Math.sin(x*0.08)*8+Math.sin(z*0.06)*6;
    h+=Math.sin(x*0.15+z*0.12)*4;
    h+=Math.cos(x*0.25)*2+Math.sin(z*0.3)*2;
    h+=Math.random()*1.5;
    // Raise center like a peak
    h+=Math.max(0,(20-r)*0.8);
    pos.setY(i,h);
  }
  geo.computeVertexNormals();

  // Terrain material
  const mat = new THREE.MeshPhongMaterial({
    color:0x2d2820,
    specular:0x442200,
    shininess:8,
    wireframe:false,
    vertexColors:false,
  });

  const terrain = new THREE.Mesh(geo,mat);
  terrain.rotation.x=-Math.PI/2;
  terrain.position.y=-10;
  scene.add(terrain);

  // Snow cap
  const snowGeo = new THREE.PlaneGeometry(size,size,segs,segs);
  const snowPos = snowGeo.attributes.position;
  for(let i=0;i<snowPos.count;i++){
    const x=pos.getX(i),z=pos.getZ(i);
    const y=pos.getY(i);
    snowPos.setY(i,y+0.3);
  }
  snowGeo.computeVertexNormals();
  const snowMat = new THREE.MeshPhongMaterial({color:0xe8e4dc,transparent:true,opacity:0.6,wireframe:false});
  const snow = new THREE.Mesh(snowGeo,snowMat);
  snow.rotation.x=-Math.PI/2;
  snow.position.y=-5;
  scene.add(snow);

  // Wireframe overlay (subtle)
  const wireMat = new THREE.MeshBasicMaterial({color:0xc4621a,wireframe:true,transparent:true,opacity:0.04});
  const wire = new THREE.Mesh(geo.clone(),wireMat);
  wire.rotation.x=-Math.PI/2;
  wire.position.y=-9.8;
  scene.add(wire);

  // Stars
  const starGeo = new THREE.BufferGeometry();
  const starVerts=[];
  for(let i=0;i<1200;i++){
    starVerts.push((Math.random()-0.5)*400,(Math.random()*150)+20,(Math.random()-0.5)*400);
  }
  starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starVerts,3));
  const starMat = new THREE.PointsMaterial({color:0xa8bcc4,size:0.4,transparent:true,opacity:0.7});
  scene.add(new THREE.Points(starGeo,starMat));

  // Lights
  scene.add(new THREE.AmbientLight(0x1a1410,2));
  const dir1=new THREE.DirectionalLight(0xc4621a,1.2);
  dir1.position.set(40,60,30);
  scene.add(dir1);
  const dir2=new THREE.DirectionalLight(0x4a6d7c,0.4);
  dir2.position.set(-40,40,-20);
  scene.add(dir2);

  let t=0,scrollY=0;
  window.addEventListener('scroll',()=>{scrollY=window.scrollY;});

  function animate(){
    requestAnimationFrame(animate);
    t+=0.003;
    terrain.rotation.z=t*0.05;
    wire.rotation.z=t*0.05;
    snow.rotation.z=t*0.05;
    camera.position.y=30+scrollY*0.02;
    camera.position.z=80-scrollY*0.05;
    camera.lookAt(0,0,0);
    renderer.render(scene,camera);
  }
  animate();

  window.addEventListener('resize',()=>{
    renderer.setSize(canvas.offsetWidth,canvas.offsetHeight);
    camera.aspect=canvas.offsetWidth/canvas.offsetHeight;
    camera.updateProjectionMatrix();
  });
})();

// HERO ANIMATIONS
window.addEventListener('load',()=>{
  setTimeout(()=>{
    const ey=document.querySelector('.hero-eyebrow');
    const et=document.querySelector('.hero-title');
    const es=document.querySelector('.hero-sub');
    const eg=document.querySelector('.hero-tagline');
    const sh=document.querySelector('.scroll-hint');
    ey.style.transition='opacity 1s, transform 1s';
    ey.style.opacity='1';
    setTimeout(()=>{
      et.style.transition='opacity 1.2s, transform 1.2s';
      et.style.opacity='1';
      et.style.transform='translateY(0)';
    },400);
    setTimeout(()=>{
      es.style.transition='opacity 1s';
      es.style.opacity='1';
    },900);
    setTimeout(()=>{
      eg.style.transition='opacity 1s';
      eg.style.opacity='1';
    },1200);
    setTimeout(()=>{
      sh.style.transition='opacity 1s';
      sh.style.opacity='1';
    },1800);
  },300);
});

// PARALLAX SCROLL
window.addEventListener('scroll',()=>{
  const sy=window.scrollY;
  document.querySelectorAll('.scene-bg').forEach(bg=>{
    const section=bg.parentElement;
    const top=section.offsetTop;
    const diff=sy-top;
    bg.style.transform=`scale(1.1) translate3d(0,${diff*0.3}px,0)`;
  });
});

// INTERSECTION OBSERVER for fade-up elements
const observer=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.style.transition='opacity 0.8s ease, transform 0.8s ease';
      entry.target.style.opacity='1';
      entry.target.style.transform='translateY(0)';
    }
  });
},{threshold:0.1,rootMargin:'0px 0px -60px 0px'});
document.querySelectorAll('.fade-up').forEach(el=>observer.observe(el));

const observer2=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.style.transition='opacity 1.2s ease';
      entry.target.style.opacity='1';
    }
  });
},{threshold:0.1});
document.querySelectorAll('.fade-in').forEach(el=>observer2.observe(el));

// NAV SCROLL
window.addEventListener('scroll',()=>{
  const nav=document.getElementById('mainNav');
  if(window.scrollY>100){
    nav.style.background='rgba(13,11,9,0.95)';
    nav.style.borderBottom='1px solid rgba(196,98,26,0.15)';
    nav.style.transition='background 0.4s, border-bottom 0.4s';
  } else {
    nav.style.background='transparent';
    nav.style.borderBottom='none';
  }
});

// TERRAIN MAP (Canvas 2D)
(function(){
  const canvas=document.getElementById('map-canvas');
  const ctx=canvas.getContext('2d');
  canvas.width=canvas.offsetWidth;
  canvas.height=500;

  // Waypoints (schematic of the Darchula-Humla route)
  const W=canvas.width,H=canvas.height;
  const pts=[
    {x:0.08,y:0.75,label:'Darchula',type:'start',alt:'895m',desc:'Starting village — Darchula district HQ'},
    {x:0.18,y:0.60,label:'Khela',type:'camp',alt:'1,800m',desc:'First camp — entering the gorge zone'},
    {x:0.26,y:0.45,label:'Malika Pass',type:'pass',alt:'4,200m',desc:'First high pass — technical scramble'},
    {x:0.36,y:0.50,label:'Api River',type:'river',alt:'2,100m',desc:'River crossing — swift glacial melt'},
    {x:0.44,y:0.30,label:'Api Base',type:'camp',alt:'3,900m',desc:'Camp below Api Himal — 7,132m peak'},
    {x:0.54,y:0.22,label:'Surnaya La',type:'pass',alt:'5,400m',desc:'Highest point of traverse'},
    {x:0.62,y:0.38,label:'Saipal Valley',type:'camp',alt:'3,200m',desc:'Remote valley — no outside contact'},
    {x:0.72,y:0.52,label:'Karnali',type:'river',alt:'1,600m',desc:'Karnali river crossing — key egress'},
    {x:0.82,y:0.45,label:'Dharma',type:'camp',alt:'2,400m',desc:'Last full camp before Humla'},
    {x:0.92,y:0.35,label:'Simikot',type:'end',alt:'2,910m',desc:'End point — Humla district HQ'},
  ];
  const mapped=pts.map(p=>({...p,px:p.x*W,py:p.y*H}));

  let hovered=null;
  let animFrame=0;

  // Draw elevation profile as background
  function drawTerrain(){
    ctx.clearRect(0,0,W,H);
    // Dark bg
    ctx.fillStyle='#0f1318';
    ctx.fillRect(0,0,W,H);

    // Grid lines
    ctx.strokeStyle='rgba(196,98,26,0.05)';
    ctx.lineWidth=1;
    for(let x=0;x<W;x+=W/10){
      ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();
    }
    for(let y=0;y<H;y+=H/5){
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
    }

    // Elevation gradient terrain fill
    const elevPts=mapped.map(p=>({x:p.px,y:p.py}));
    if(elevPts.length>1){
      ctx.beginPath();
      ctx.moveTo(0,H);
      ctx.lineTo(elevPts[0].x,elevPts[0].y);
      for(let i=1;i<elevPts.length;i++){
        const cp={x:(elevPts[i-1].x+elevPts[i].x)/2,y:(elevPts[i-1].y+elevPts[i].y)/2};
        ctx.quadraticCurveTo(elevPts[i-1].x,elevPts[i-1].y,cp.x,cp.y);
      }
      ctx.lineTo(elevPts[elevPts.length-1].x,elevPts[elevPts.length-1].y);
      ctx.lineTo(W,H);
      ctx.closePath();
      const grad=ctx.createLinearGradient(0,0,0,H);
      grad.addColorStop(0,'rgba(196,98,26,0.25)');
      grad.addColorStop(0.5,'rgba(74,109,124,0.15)');
      grad.addColorStop(1,'rgba(13,11,9,0)');
      ctx.fillStyle=grad;
      ctx.fill();
    }

    // Route line
    if(mapped.length>1){
      ctx.beginPath();
      ctx.moveTo(mapped[0].px,mapped[0].py);
      for(let i=1;i<mapped.length;i++){
        const cp={x:(mapped[i-1].px+mapped[i].px)/2,y:(mapped[i-1].py+mapped[i].py)/2};
        ctx.quadraticCurveTo(mapped[i-1].px,mapped[i-1].py,cp.x,cp.y);
      }
      ctx.strokeStyle='rgba(196,98,26,0.5)';
      ctx.lineWidth=1.5;
      ctx.setLineDash([4,4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Animated scout dot
    const progress=(animFrame/200)%1;
    const totalPts=mapped.length-1;
    const seg=Math.floor(progress*totalPts);
    const segT=(progress*totalPts)%1;
    if(seg<totalPts){
      const a=mapped[seg],b=mapped[seg+1];
      const scoutX=a.px+(b.px-a.px)*segT;
      const scoutY=a.py+(b.py-a.py)*segT;
      ctx.beginPath();
      ctx.arc(scoutX,scoutY,4,0,Math.PI*2);
      ctx.fillStyle='#d4930a';
      ctx.fill();
      // Pulse ring
      const pulse=(animFrame%30)/30;
      ctx.beginPath();
      ctx.arc(scoutX,scoutY,8+pulse*8,0,Math.PI*2);
      ctx.strokeStyle=`rgba(212,147,10,${0.6-pulse*0.6})`;
      ctx.lineWidth=1;
      ctx.stroke();
    }

    // Waypoints
    const colors={start:'#c4621a',end:'#c4621a',pass:'#d4930a',river:'#4a6d7c',camp:'#6b8f6b'};
    mapped.forEach((p,i)=>{
      const isHov=(hovered===i);
      const c=colors[p.type]||'#888';
      ctx.beginPath();
      ctx.arc(p.px,p.py,isHov?10:6,0,Math.PI*2);
      ctx.fillStyle=isHov?c:'rgba(13,11,9,0.8)';
      ctx.strokeStyle=c;
      ctx.lineWidth=isHov?2:1.5;
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.font=isHov?'bold 11px Barlow Condensed, sans-serif':'10px Barlow Condensed, sans-serif';
      ctx.fillStyle=isHov?'#e8e4dc':'rgba(176,168,152,0.7)';
      ctx.letterSpacing='2px';
      const tx=p.px,ty=p.py-16;
      ctx.textAlign='center';
      ctx.fillText(p.label.toUpperCase(),tx,ty);

      // Alt
      if(isHov){
        ctx.font='10px Barlow, sans-serif';
        ctx.fillStyle='rgba(196,98,26,0.9)';
        ctx.fillText(p.alt,tx,ty-13);
      }
    });

    // Altitude axis label
    ctx.font='9px Barlow Condensed, sans-serif';
    ctx.fillStyle='rgba(196,98,26,0.3)';
    ctx.textAlign='left';
    ctx.fillText('HIGH ↑',8,20);
    ctx.fillText('LOW ↓',8,H-10);
    ctx.textAlign='right';
    ctx.fillText('DARCHULA → HUMLA',W-12,H-10);

    animFrame++;
    requestAnimationFrame(drawTerrain);
  }
  drawTerrain();

  // Hover
  canvas.addEventListener('mousemove',e=>{
    const rect=canvas.getBoundingClientRect();
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    const scaleX=canvas.width/rect.width,scaleY=canvas.height/rect.height;
    const cx=mx*scaleX,cy=my*scaleY;
    const tip=document.getElementById('mapTooltip');
    let found=null;
    mapped.forEach((p,i)=>{
      if(Math.hypot(cx-p.px,cy-p.py)<20){found=i;}
    });
    hovered=found;
    if(found!==null){
      const p=mapped[found];
      tip.style.display='block';
      tip.style.left=(p.px/canvas.width*rect.width+10)+'px';
      tip.style.top=(p.py/canvas.height*rect.height-40)+'px';
      tip.innerHTML=`<strong style="color:#c4621a;letter-spacing:2px;">${p.label.toUpperCase()}</strong><br>${p.alt} · ${p.desc}`;
      canvas.style.cursor='crosshair';
    } else {
      tip.style.display='none';
      canvas.style.cursor='default';
    }
  });
  canvas.addEventListener('mouseleave',()=>{
    hovered=null;
    document.getElementById('mapTooltip').style.display='none';
  });
  window.addEventListener('resize',()=>{
    canvas.width=canvas.offsetWidth;
    canvas.height=500;
  });
})();

// Modal click overlay handler
document.getElementById('modal').addEventListener('click',function(e){
  if(e.target===this)closeModal();
});

}); // End DOMContentLoaded
