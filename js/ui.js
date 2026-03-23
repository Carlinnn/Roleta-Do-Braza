let currentMode = "conta";
let latestResult = "";
let latestWinningIndex = -1;

function openRoulette(mode) {
  currentMode = mode;
  document.getElementById("roulette-title").innerText = optionsList[mode].title;
  document.getElementById("menu").classList.remove("active");
  document.getElementById("custom-view").classList.remove("active");
  document.getElementById("roulette-screen").classList.add("active");
  resetSpinState();
  drawWheel(currentMode);
}

function removeItem() {
  if (latestWinningIndex === -1) return;
  const items = optionsList[currentMode].items;
  if (items.length <= 2) {
    alert("Precisa de pelo menos 2 itens na BRAZA para continuar!");
    return;
  }
  items.splice(latestWinningIndex, 1);
  closeModal();
  drawWheel(currentMode);
  latestWinningIndex = -1;
}

function showMenu() {
  document.getElementById("roulette-screen").classList.remove("active");
  document.getElementById("custom-view").classList.remove("active");
  document.getElementById("result-modal").classList.remove("active");
  document.getElementById("menu").classList.add("active");
  resetSpinState();
}

function showCustomView() {
  document.getElementById("menu").classList.remove("active");
  document.getElementById("custom-view").classList.add("active");
}

function createCustomRoulette() {
  const input = document.getElementById("custom-input").value;
  const items = input
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  if (items.length < 2) {
    alert("Insira pelo menos 2 opções para girar a BRAZA!");
    return;
  }
  optionsList.personalizado.items = items;
  openRoulette("personalizado");
}

function spin() {
  runSpinAnimation(currentMode, showResult);
}

function shareResult() {
  const text = `🔥 O Destino do BRAZA decidiu: ${latestResult}! Gire a roleta em: ${window.location.href}`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

function showResult() {
  const items = optionsList[currentMode].items;
  const arcSize = (2 * Math.PI) / items.length;
  let normalizedRotation = currentRotation % (2 * Math.PI);
  let winningIndex = Math.floor(items.length - (normalizedRotation + Math.PI / 2) / arcSize) % items.length;
  if (winningIndex < 0) winningIndex += items.length;
  latestWinningIndex = winningIndex;
  setWinner(winningIndex);
  drawWheel(currentMode);
  latestResult = items[winningIndex];
  const incentiveText = optionsList[currentMode].incentive.replace("{result}", latestResult);
  document.getElementById("result-text").innerText = latestResult;
  document.getElementById("result-incentive").innerText = incentiveText;
  createBurst();
  setTimeout(() => {
    document.getElementById("result-modal").classList.add("active");
  }, 500);
}

function closeModal() {
  document.getElementById("result-modal").classList.remove("active");
}

function createSparks() {
  const container = document.getElementById("fire-container");
  const sparkCount = 15;
  for (let i = 0; i < sparkCount; i++) {
    setTimeout(() => {
      const spark = document.createElement("div");
      spark.className = "spark";
      const startX = Math.random() * 100;
      const duration = 2 + Math.random() * 3;
      const size = 2 + Math.random() * 3;
      spark.style.left = startX + "%";
      spark.style.width = size + "px";
      spark.style.height = size + "px";
      spark.style.animationDuration = duration + "s";
      spark.style.opacity = 0.3 + Math.random() * 0.7;
      container.appendChild(spark);
      setTimeout(() => { spark.remove(); }, duration * 1000);
    }, Math.random() * 5000);
  }
}

function createBurst() {
  const container = document.getElementById("fire-container");
  const count = 40;
  for (let i = 0; i < count; i++) {
    const spark = document.createElement("div");
    spark.className = "spark";
    const size = 4 + Math.random() * 6;
    spark.style.left = "50%";
    spark.style.bottom = "50%";
    spark.style.width = size + "px";
    spark.style.height = size + "px";
    spark.style.background = i % 2 === 0 ? "#ff4d00" : "#ffcc00";
    spark.style.boxShadow = "0 0 15px #ff4d00";
    const angle = Math.random() * Math.PI * 2;
    const velocity = 5 + Math.random() * 20;
    const tx = Math.cos(angle) * velocity * 20;
    const ty = Math.sin(angle) * velocity * 20;
    spark.animate([
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
    ], {
        duration: 1000 + Math.random() * 1000,
        easing: "cubic-bezier(0.1, 0.8, 0.3, 1)"
    });
    container.appendChild(spark);
    setTimeout(() => { spark.remove(); }, 2000);
  }
}
