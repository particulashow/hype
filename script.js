const params = new URLSearchParams(window.location.search);

const domain = params.get("domain") || "http://localhost:3900";
const title = params.get("title") || "Aura do Streamer";
const auraColor = params.get("auraColor") || "#00eaff";

document.getElementById("title").textContent = title;
document.documentElement.style.setProperty("--auraColor", auraColor);

const statusEl = document.getElementById("status");

let intensity = 20;

// ELEMENTOS
const glow = document.querySelector(".glow");
const ring = document.querySelector(".ring");
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

function resizeCanvas(){
  const rect = document.getElementById("aura").getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// PARTÍCULAS
const particles = [];

function spawnParticle() {
  particles.push({
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: Math.random() * Math.PI * 2,
    speed: 0.4 + Math.random() * (intensity / 40),
    size: 1 + Math.random() * 2,
    life: 20 + Math.random() * 40
  });
}

function updateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, i) => {
    p.x += Math.cos(p.angle) * p.speed;
    p.y += Math.sin(p.angle) * p.speed;
    p.life--;

    ctx.fillStyle = auraColor;
    ctx.globalAlpha = p.life / 60;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    if (p.life <= 0) particles.splice(i, 1);
  });

  ctx.globalAlpha = 1;
}

// ANIMAÇÃO
function animate() {
  requestAnimationFrame(animate);

  const scale = 1 + (intensity / 100) * 0.35;
  glow.style.transform = `scale(${scale})`;
  glow.style.opacity = 0.5 + intensity / 200;

  ring.style.animationDuration = `${12 / (1 + intensity / 40)}s`;

  if (Math.random() < intensity / 100) spawnParticle();
  updateParticles();
}

animate();

// INTENSIDADE
function bumpIntensity(amount) {
  intensity = Math.min(100, intensity + amount);

  setTimeout(() => {
    intensity = Math.max(15, intensity - amount);
  }, 1500);
}

// NORMALIZAÇÃO
function norm(s){
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// FETCH WORDCLOUD
async function fetchData(){
  try{
    const res = await fetch(`${domain}/wordcloud`, { cache: "no-store" });
    const data = await res.json();

    const arr = (data.wordcloud || "")
      .split(",")
      .map(norm)
      .filter(Boolean);

    const boost = arr.length * 1.2;
    if (boost > 0){
      bumpIntensity(boost);
      if (statusEl.textContent.startsWith("A ligar") || statusEl.textContent.startsWith("Sem ligação")){
        statusEl.textContent = "A ler comentários…";
      }
    }
  } catch(e){
    statusEl.textContent = "Sem ligação ao servidor";
    console.error("Erro ao ler wordcloud", e);
  }
}

setInterval(fetchData, 1000);
