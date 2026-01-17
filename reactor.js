// --- Ler parâmetros da URL ---
const params = new URLSearchParams(window.location.search);

const color = params.get("color") || "#00eaff";
const speed = parseFloat(params.get("speed") || 1);
let intensity = parseInt(params.get("intensity") || 20);

// Aplicar cor
document.documentElement.style.setProperty("--color", color);

// --- Elementos ---
const core = document.querySelector(".core");
const rings = document.querySelectorAll(".ring");
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- Partículas ---
const particles = [];

function spawnParticle() {
  particles.push({
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: Math.random() * Math.PI * 2,
    speed: 1 + Math.random() * (intensity / 20),
    size: 2 + Math.random() * 3,
    life: 40 + Math.random() * 40
  });
}

function updateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, i) => {
    p.x += Math.cos(p.angle) * p.speed;
    p.y += Math.sin(p.angle) * p.speed;
    p.life--;

    ctx.fillStyle = color;
    ctx.globalAlpha = p.life / 80;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    if (p.life <= 0) particles.splice(i, 1);
  });
}

// --- Animação principal ---
function animate() {
  requestAnimationFrame(animate);

  // Core pulse
  const scale = 1 + intensity / 100 * 0.4;
  core.style.transform = `scale(${scale})`;

  // Rings speed
  rings.forEach((ring, i) => {
    ring.style.animationDuration = `${(6 + i * 3) / speed / (1 + intensity / 50)}s`;
  });

  // Particles
  if (Math.random() < intensity / 100) spawnParticle();
  updateParticles();
}

animate();

// --- Hook para wordcloud (placeholder) ---
function applyWordcloudValue(value) {
  intensity = Math.min(100, intensity + value);
  setTimeout(() => intensity = Math.max(20, intensity - value), 1500);
}
