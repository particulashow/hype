const params = new URLSearchParams(window.location.search);

const domain = params.get("domain") || "http://localhost:3900";
const title = params.get("title") || "Hype Reactor";
const color = params.get("color") || "#00eaff";

document.getElementById("title").textContent = title;
document.documentElement.style.setProperty("--color", color);

const statusEl = document.getElementById("status");

let intensity = 20;

// ELEMENTOS
const core = document.querySelector(".core");
const rings = document.querySelectorAll(".ring");
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

function resizeCanvas(){
  const rect = document.getElementById("reactor").getBoundingClientRect();
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
    speed: 0.6 + Math.random() * (intensity / 30),
    size: 1.5 + Math.random() * 2.5,
    life: 30 + Math.random() * 40
  });
}

function updateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, i) => {
    p.x += Math.cos(p.angle) * p.speed;
    p.y += Math.sin(p.angle) * p.speed;
    p.life--;

    ctx.fillStyle = color;
    ctx.globalAlpha = p.life / 70;
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

  const scale = 1 + (intensity / 100) * 0.45;
  core.style.transform = `scale(${scale})`;

  rings.forEach((ring, i) => {
    const base = 8 + i * 3;
    ring.style.animationDuration = `${base / (1 + intensity / 40)}s`;
  });

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

    const boost = arr.length * 1.4;
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
