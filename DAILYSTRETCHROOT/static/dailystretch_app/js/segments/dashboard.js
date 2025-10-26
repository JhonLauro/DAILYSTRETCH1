window.initDashboard = window.initDashboard || function initDashboard(root) {
  try {
    if (!root || !(root instanceof Element)) { root = document; }
    if (root.__dashboard_inited) return;
    root.__dashboard_inited = true;

    const q = (sel) => root.querySelector(sel);
    const timeDisplay = q('#time-display');
    const startBtn = q('#start-btn');
    const resetBtn = q('#reset-btn');
    const switchBtn = q('#switch-btn');
    const progressEl = q('.progress');
    const belowBtn = q('#below');
    const quickStudy = document.getElementById('quick-study-duration');
    const quickBreak = document.getElementById('quick-break-duration');
    if (!timeDisplay || !startBtn || !resetBtn || !switchBtn || !progressEl || !belowBtn) { return; }

    let state = {
      isRunning: false,
      isStudy: true,
      timerSeconds: window.studyDuration * 60,
      initialSeconds: window.studyDuration * 60,
      lastUpdate: null,
    };
    function formatTime(s) {
      const m = Math.floor(s / 60).toString().padStart(2, '0');
      const sec = (s % 60).toString().padStart(2, '0');
      return `${m}:${sec}`;
    }
    function render() {
      timeDisplay.textContent = formatTime(state.timerSeconds);
      const pct = 100 - Math.round((state.timerSeconds / state.initialSeconds) * 100);
      progressEl.style.width = pct + '%';
      belowBtn.textContent = state.isStudy ? `Focus for ${window.studyDuration} minutes` : `Break for ${window.breakDuration} minutes`;
      switchBtn.textContent = state.isStudy ? 'Switch to Break' : 'Switch to Study';
      if (quickStudy) quickStudy.textContent = `${window.studyDuration} min`;
      if (quickBreak) quickBreak.textContent = `${window.breakDuration} min`;
    }
    let timerInterval = null;
    function tick() {
      if (state.isRunning && state.lastUpdate) {
        const now = Date.now();
        const elapsed = Math.floor((now - state.lastUpdate) / 1000);
        if (elapsed > 0) {
          state.timerSeconds = Math.max(0, state.timerSeconds - elapsed);
          state.lastUpdate = now;
          if (state.timerSeconds === 0) {
            clearInterval(timerInterval); state.isRunning = false;
          }
        }
      }
      if (state.isRunning) {
        state.timerSeconds = Math.max(0, state.timerSeconds - 1);
        if (state.timerSeconds === 0) {
          clearInterval(timerInterval); state.isRunning = false;
        }
      }
      render();
    }
    function startTimer() {
      if (state.isRunning) return;
      state.isRunning = true;
      state.lastUpdate = Date.now();
      startBtn.textContent = '\u23f8 Pause';
      clearInterval(timerInterval);
      timerInterval = setInterval(tick, 1000);
    }
    function pauseTimer() {
      if (!state.isRunning) return;
      state.isRunning = false;
      startBtn.textContent = '\u25b6 Start';
      clearInterval(timerInterval);
      state.lastUpdate = null;
    }
    function resetTimer() {
      pauseTimer();
      state.timerSeconds = state.initialSeconds;
      render();
    }
    function switchMode() {
      pauseTimer();
      state.isStudy = !state.isStudy;
      state.initialSeconds = state.isStudy ? (window.studyDuration * 60) : (window.breakDuration * 60);
      state.timerSeconds = state.initialSeconds;
      render();
    }

    startBtn.addEventListener('click', () => { state.isRunning ? pauseTimer() : startTimer(); });
    resetBtn.addEventListener('click', resetTimer);
    switchBtn.addEventListener('click', switchMode);
    belowBtn.addEventListener('click', startTimer);

    // Force always fresh values from Django on every dashboard load:
    state.timerSeconds = window.studyDuration * 60;
    state.initialSeconds = window.studyDuration * 60;
    state.isStudy = true;
    render();
    return state;
  } catch (err) {}
};
try {
  if (document.querySelector && document.querySelector('#time-display')) {
    window.initDashboard(document);
  }
} catch (e) {}
