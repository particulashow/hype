// --- WebSocket do wordcloud ---
const domain = params.get("domain") || "default";

// Ligar ao servidor local
const ws = new WebSocket("ws://localhost:3900");

ws.onopen = () => {
  console.log("Ligado ao servidor wordcloud");
  ws.send(JSON.stringify({ type: "join", room: domain }));
};

ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);

    // Quando chega uma palavra individual
    if (data.type === "word") {
      applyWordcloudValue(5);
    }

    // Quando chegam várias palavras de uma vez
    if (data.type === "bulk") {
      applyWordcloudValue(data.words.length * 2);
    }

  } catch (e) {
    console.error("Erro ao processar mensagem:", e);
  }
};

ws.onerror = (err) => {
  console.error("Erro no WebSocket:", err);
};

ws.onclose = () => {
  console.warn("WebSocket fechado");
};
