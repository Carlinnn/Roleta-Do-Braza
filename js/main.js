function init() {
  createSparks();
  setInterval(createSparks, 2000);
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

window.addEventListener('DOMContentLoaded', init);
