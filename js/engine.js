const canvas = document.getElementById("wheel-canvas");
const ctx = canvas.getContext("2d");

// Audio with AudioContext fallback for maximum browser compatibility
let audioCtx = null;
let spinBufferSource = null;
let spinGain = null;
let audioReady = false;
let audioFailed = false;

const spinSound = new Audio();
spinSound.src = "public/roleta.mp3";
spinSound.preload = "auto";
spinSound.load();

function playSpinSound() {
  if (!audioFailed) {
    try {
      spinSound.currentTime = 0;
      const promise = spinSound.play();
      if (promise) {
        promise.then(() => {
          audioReady = true;
        }).catch(err => {
          console.warn("Audio element play failed:", err.message, "— trying AudioContext fallback");
          playWithAudioContext();
        });
      } else {
        audioReady = true;
      }
    } catch (e) {
      if (!audioReady) playWithAudioContext();
    }
  }
}

function playWithAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    fetch("public/roleta.mp3")
      .then(res => res.arrayBuffer())
      .then(buffer => audioCtx.decodeAudioData(buffer))
      .then(decoded => {
        audioReady = true;
        spinBufferSource = decoded;
      })
      .catch(err => {
        audioFailed = true;
        console.error("Audio failed to load completely:", err);
      });
    return;
  }
  if (spinBufferSource) {
    const source = audioCtx.createBufferSource();
    source.buffer = spinBufferSource;
    if (!spinGain) {
      spinGain = audioCtx.createGain();
      spinGain.gain.value = 1;
      source.connect(spinGain).connect(audioCtx.destination);
    } else {
      source.connect(spinGain);
    }
    spinGain.gain.value = 1;
    source.start(0);
    spinBufferSource = spinBufferSource;
  }
}

let currentRotation = 0;
let isSpinning = false;
let lastTickIndex = -1;
let determinedWinner = -1;

function resetSpinState() {
  currentRotation = 0;
  isSpinning = false;
  lastTickIndex = -1;
  determinedWinner = -1;
}

function getWinningIndex(rotation, itemCount) {
  const arcSize = (2 * Math.PI) / itemCount;
  let normalized = (rotation + Math.PI / 2) % (2 * Math.PI);
  if (normalized < 0) normalized += 2 * Math.PI;
  let idx = (itemCount - Math.floor(normalized / arcSize)) % itemCount;
  if (idx < 0) idx += itemCount;
  return idx;
}

function drawWheel(mode) {
  const items = optionsList[mode].items;
  if (!items || items.length === 0) return;

  const numOptions = items.length;
  const arcSize = (2 * Math.PI) / numOptions;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 25;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 15, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fill();

  const outerGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  outerGrad.addColorStop(0, "#333");
  outerGrad.addColorStop(0.2, "#666");
  outerGrad.addColorStop(0.5, "#999");
  outerGrad.addColorStop(0.8, "#666");
  outerGrad.addColorStop(1, "#333");

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
  ctx.strokeStyle = outerGrad;
  ctx.lineWidth = 20;
  ctx.stroke();

  items.forEach((item, i) => {
    const angle = i * arcSize + currentRotation;
    ctx.beginPath();
    const grad = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius);
    
    if (i === determinedWinner) {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(1, "#ffcc00");
    } else if (i % 2 === 0) {
      grad.addColorStop(0, "#ff5e00");
      grad.addColorStop(1, "#8a2b00");
    } else {
      grad.addColorStop(0, "#2a2a2a");
      grad.addColorStop(1, "#0a0a0a");
    }
    
    ctx.fillStyle = grad;
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
    ctx.lineTo(centerX, centerY);
    ctx.fill();
    
    if (i === determinedWinner) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 4;
        ctx.stroke();
    } else {
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle + arcSize / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = i === determinedWinner ? "#000" : "white";
    ctx.font = "bold 16px Outfit";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 4;
    ctx.fillText(item.toUpperCase(), radius - 40, 6);
    ctx.restore();
  });

  ctx.beginPath();
  const hubGrad = ctx.createRadialGradient(centerX - 5, centerY - 5, 0, centerX, centerY, 40);
  hubGrad.addColorStop(0, "#ffffff");
  hubGrad.addColorStop(0.3, "#bbbbbb");
  hubGrad.addColorStop(0.7, "#444444");
  hubGrad.addColorStop(1, "#1a1a1a");
  ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
  ctx.fillStyle = hubGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
  ctx.fillStyle = "#ff4d00";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function runSpinAnimation(mode, showResultCallback) {
  if (isSpinning) return;
  isSpinning = true;
  determinedWinner = -1;
  document.getElementById("spin-btn").disabled = true;

  playSpinSound();

  const items = optionsList[mode].items;
  const numOptions = items.length;
  const spinDuration = 4000 + Math.random() * 2000;
  const startRotation = currentRotation;
  const extraSpins = 7 + Math.floor(Math.random() * 5);
  const targetRotation = startRotation + extraSpins * 2 * Math.PI + Math.random() * 2 * Math.PI;
  const startTime = Date.now();
  const pointer = document.getElementById("wheel-pointer");
  lastTickIndex = -1;

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / spinDuration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 4);
    currentRotation = startRotation + (targetRotation - startRotation) * easeOut;

    drawWheel(mode);

    if (progress > 0.8) {
      if (audioCtx && spinGain) {
        spinGain.gain.value = Math.max(0, (1 - progress) * 5);
      } else {
        spinSound.volume = Math.max(0, (1 - progress) * 5);
      }
    }

    const arcSize = (2 * Math.PI) / numOptions;
    const currentIndex = getWinningIndex(currentRotation, numOptions);

    if (currentIndex !== lastTickIndex && lastTickIndex !== -1) {
      pointer.style.transform = "translateX(-50%) scale(1.2) translateY(5px)";
      setTimeout(() => { pointer.style.transform = "translateX(-50%)"; }, 50);
      if (window.navigator.vibrate) window.navigator.vibrate(10);
    }
    lastTickIndex = currentIndex;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      determinedWinner = getWinningIndex(currentRotation, numOptions);
      isSpinning = false;
      document.getElementById("spin-btn").disabled = false;
      if (audioCtx && spinGain) {
        spinGain.gain.value = 1;
      } else {
        spinSound.pause();
        spinSound.volume = 1;
      }
      setTimeout(showResultCallback, 200);
    }
  }
  animate();
}
