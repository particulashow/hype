// ===============================
//   PARÂMETROS DA URL
// ===============================
const params = new URLSearchParams(window.location.search);

const color = params.get("color") || "#00eaff";
const speed = parseFloat(params.get("speed") || 1);
let intensity = parseInt(params.get("intensity") || 20);
const domain = params.get("domain") || "default";

// Aplicar cor ao CSS
document.documentElement.style.setProperty("--color", color);


// ===============================
//   ELEMENTOS DO REATOR
// ===============================
const core = document.querySelector(".core");
const rings = document.querySelectorAll(".ring");
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// ===============================
//   PARTÍCULAS
// ===============================
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


// ===============================
//   ANIMAÇÃO PRINCIPAL
// ===============================
function animate() {
  requestAnimationFrame(animate);

  // Pulsação do núcleo
  const scale = 1 + (intensity / 100) * 0.4;
  core.style.transform = `scale(${scale})`;

  // Velocidade dos anéis
  rings.forEach((ring, i) => {
    ring.style.animationDuration = `${(6 + i * 3) / speed / (1 + intensity / 50)}s`;
  });

  // Partículas
  if (Math.random() < intensity / 100) spawnParticle();
  updateParticles();
}

animate();


// ===============================
//   FUNÇÃO PARA AUMENTAR INTENSIDADE
// ===============================
function applyWordcloudValue(value) {
  intensity = Math.min(100, intensity + value);

  // Decaimento suave
  setTimeout(() => {
    intensity = Math.max(20, intensity - value);
  }, 1500);
}


// ===============================
//   LIGAÇÃO AO WORDCLOUD
// ===============================
const ws = new WebSocket("ws://localhost:3900");

ws.onopen = () => {
  console.log("Ligado ao servidor wordcloud");
  ws.send(JSON.stringify({ type: "join", room: domain }));
};

ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);

    // Mensagem individual
    if (data.type === "word") {
      applyWordcloudValue(5);
    }

    // Pacote de mensagens
    if (data.type === "bulk" && Array.isArray(data.words)) {
      applyWordcloudValue(data.words.length * 2);
    }

  } catch (err) {
    console.error("Erro ao processar mensagem:", err);
  }
};

ws.onerror = (err) => {
  console.error("Erro no WebSocket:", err);
};

ws.onclose = () => {
  console.warn("WebSocket fechado");
};
