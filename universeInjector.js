(function() {
  // ---------- Create canvas ----------
  const canvas = document.createElement("canvas");
  canvas.id = "universe-bg-injector";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  canvas.style.position = "fixed";
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.zIndex = "-999";
  canvas.style.pointerEvents = "none"; // allow clicks on page
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // ---------- Universe Objects ----------
  let stars = [], asteroids = [], planets = [];
  const numStars = 150;
  const numAsteroids = 8;
  const numPlanets = 3;

  // Stars
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      alpha: Math.random(),
      dAlpha: (Math.random() * 0.02) - 0.01
    });
  }

  // Planets
  for (let i = 0; i < numPlanets; i++) {
    planets.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 40 + Math.random() * 30,
      color: `hsl(${Math.random()*360},70%,50%)`
    });
  }

  // Asteroids
  function createAsteroid() {
    let radius = 8 + Math.random() * 12;
    let points = 7 + Math.floor(Math.random() * 4);
    let shape = [];
    for (let i = 0; i < points; i++) {
      let angle = (i / points) * Math.PI * 2;
      let r = radius + (Math.random() - 0.5) * (radius * 0.4);
      shape.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
    }
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius,
      dx: (Math.random() - 0.5) * 1.5,
      dy: (Math.random() - 0.5) * 1.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      shape
    };
  }
  for (let i = 0; i < numAsteroids; i++) asteroids.push(createAsteroid());

  // ---------- Drawing Functions ----------
  function drawStars() {
    stars.forEach(s => {
      s.alpha += s.dAlpha;
      if (s.alpha <= 0 || s.alpha >= 1) s.dAlpha *= -1;
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2);
      ctx.fill();
    });
  }

  function drawPlanets() {
    planets.forEach(p => {
      const grad = ctx.createRadialGradient(p.x, p.y, p.radius*0.2, p.x, p.y, p.radius);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
      ctx.fill();
    });
  }

  function drawAsteroids() {
    asteroids.forEach(a => {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rotation);
      ctx.beginPath();
      a.shape.forEach((p, i) => {
        if (i===0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = `hsl(0,0%,${30 + Math.random()*15}%)`;
      ctx.fill();
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
      a.rotation += a.rotationSpeed;
    });
  }

  // ---------- Explosions ----------
  function explodeAt(x, y) {
    const container = document.body;
    for(let i=0;i<10;i++){
      const part = document.createElement("div");
      part.className = "ui-explosion";
      part.style.left = `${x}px`;
      part.style.top = `${y}px`;
      part.style.width = part.style.height = `${4 + Math.random()*6}px`;
      part.style.background = `hsl(${Math.random()*360},80%,60%)`;
      container.appendChild(part);
      setTimeout(()=>part.remove(),800);
    }
  }

  // ---------- Update Asteroids ----------
  function updateAsteroids() {
    asteroids.forEach((a,index)=>{
      a.x += a.dx;
      a.y += a.dy;
      if(a.x<0||a.x>canvas.width) a.dx*=-1;
      if(a.y<0||a.y>canvas.height) a.dy*=-1;

      document.querySelectorAll(".hover-zone").forEach(zone=>{
        const rect = zone.getBoundingClientRect();
        const cx = (rect.left+rect.right)/2;
        const cy = (rect.top+rect.bottom)/2;
        const dx = cx-a.x;
        const dy = cy-a.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist<200){ // attraction radius
          a.dx += (dx/dist)*0.02;
          a.dy += (dy/dist)*0.02;
        }
        // collision
        if(a.x>rect.left && a.x<rect.right && a.y>rect.top && a.y<rect.bottom){
          explodeAt(a.x,a.y);
          asteroids.splice(index,1);
          asteroids.push(createAsteroid());
        }
      });
    });
  }

  // ---------- Animate ----------
  function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawStars();
    drawPlanets();
    drawAsteroids();
    updateAsteroids();
    requestAnimationFrame(animate);
  }
  animate();

  // ---------- Responsive ----------
  window.addEventListener("resize",()=>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  // ---------- CSS Injection ----------
  const style = document.createElement("style");
  style.innerHTML=`
    .ui-explosion{position:absolute;border-radius:50%;pointer-events:none;animation:ui-explode 0.8s forwards;}
    @keyframes ui-explode{from{transform:scale(1);opacity:1;}to{transform:scale(3);opacity:0;}}
  `;
  document.head.appendChild(style);

})();
