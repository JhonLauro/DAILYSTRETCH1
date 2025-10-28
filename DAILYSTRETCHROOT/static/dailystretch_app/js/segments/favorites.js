// Simple modal and timer logic for Favorites page
let favoritesTimerInterval = null;
function openRoutineModal(title, instructions, durationText) {
  if (favoritesTimerInterval) clearInterval(favoritesTimerInterval);
  const modalBg = document.getElementById('modalBg');
  const modalContent = document.getElementById('modalContent');
  const routineTitle = document.getElementById('routineTitle');
  const timerArea = document.getElementById('timerArea');
  const modalStartBtn = document.getElementById('modalStartBtn');
  const modalStopBtn = document.getElementById('modalStopBtn');
  const timerDisplay = document.getElementById('timerDisplay');
  if (!modalBg || !modalContent) return;
  modalBg.style.display = 'flex';
  modalContent.innerHTML = `<strong>${title}</strong><br/><br/><span>${instructions || ''}</span>`;
  if (routineTitle) routineTitle.innerText = title;
  if (timerArea) timerArea.style.display = 'none';
  if (modalStartBtn) modalStartBtn.style.display = '';
  if (modalStopBtn) modalStopBtn.style.display = 'none';
  const durationArg = durationText || '5 min';
  if (modalStartBtn) modalStartBtn.onclick = function() { startFavoritesTimer(durationArg, title); };
  if (modalStopBtn) modalStopBtn.onclick = function() { closeFavoritesModal(); };
  modalBg.onclick = function(e) { if (e.target === modalBg) closeFavoritesModal(); };
}
function closeFavoritesModal() {
  const modalBg = document.getElementById('modalBg');
  const timerArea = document.getElementById('timerArea');
  const modalStartBtn = document.getElementById('modalStartBtn');
  const modalStopBtn = document.getElementById('modalStopBtn');
  const timerDisplay = document.getElementById('timerDisplay');
  if (modalBg) modalBg.style.display = 'none';
  if (timerArea) timerArea.style.display = 'none';
  if (modalStartBtn) modalStartBtn.style.display = '';
  if (modalStopBtn) modalStopBtn.style.display = 'none';
  if (timerDisplay) timerDisplay.innerText = '';
  if (favoritesTimerInterval) clearInterval(favoritesTimerInterval);
}
function startFavoritesTimer(duration, title) {
  const modalStartBtn = document.getElementById('modalStartBtn');
  const modalStopBtn = document.getElementById('modalStopBtn');
  const timerArea = document.getElementById('timerArea');
  const routineTitle = document.getElementById('routineTitle');
  const timerDisplay = document.getElementById('timerDisplay');
  if (modalStartBtn) modalStartBtn.style.display = 'none';
  if (modalStopBtn) modalStopBtn.style.display = '';
  if (timerArea) timerArea.style.display = '';
  if (routineTitle) routineTitle.innerText = title;
  let seconds = durationSeconds(duration);
  updateFavoritesTimerDisplay(seconds);
  favoritesTimerInterval = setInterval(function() {
    seconds--;
    updateFavoritesTimerDisplay(seconds);
    if (seconds <= 0) {
      clearInterval(favoritesTimerInterval);
      if (timerDisplay) timerDisplay.innerText = 'Routine Complete!';
      setTimeout(closeFavoritesModal, 1500);
    }
  }, 1000);
}
function updateFavoritesTimerDisplay(seconds) {
  const timerDisplay = document.getElementById('timerDisplay');
  let min = Math.floor(seconds / 60);
  let sec = seconds % 60;
  if (seconds < 0) seconds = 0;
  if (timerDisplay) timerDisplay.innerText = `${min}:${sec.toString().padStart(2, '0')}`;
}
function durationSeconds(dur) {
  if (!dur) return 5 * 60; // default 5 minutes
  const m = parseInt(String(dur).replace(/[^0-9]/g, ''), 10);
  return (isNaN(m) ? 5 : m) * 60;
}
