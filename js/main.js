const MAX_SPARKS = 60;

let sparksInterval = null;

function enforceSparkLimit() {
  const container = document.getElementById("fire-container");
  if (!container) return;
  const sparks = container.querySelectorAll(".spark");
  for (let i = 0; i < sparks.length - MAX_SPARKS; i++) {
    sparks[i].remove();
  }
}

function startSparks() {
  createSparks();
  enforceSparkLimit();
}

function init() {
  sparksInterval = setInterval(startSparks, 2000);

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  } else {
    window.addEventListener("load", () => {
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }
}

window.addEventListener('DOMContentLoaded', init);
window.addEventListener('beforeunload', () => clearInterval(sparksInterval));
