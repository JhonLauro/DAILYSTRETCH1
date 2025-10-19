
window.initDashboard = window.initDashboard || function initDashboard(root) {
  try {
    if (!root || !(root instanceof Element)) {

      root = document;
    }


    if (root.__dashboard_inited) return;
    root.__dashboard_inited = true;


    const q = (sel) => root.querySelector(sel);
    const alarm = new Audio('/static/dailystretch_app/audio/alarm.mp3');
    const timeDisplay = q('#time-display');
    const startBtn = q('#start-btn');
    const resetBtn = q('#reset-btn');
    const switchBtn = q('#switch-btn');
    const progressEl = q('.progress');
    const belowBtn = q('#below');

  const stretchToggle = q('#stretch-toggle');
  const hydrationToggle = q('#hydration-toggle');

  const intervalBtns = root.querySelectorAll ? root.querySelectorAll('.interval-btns button') : [];


    if (!timeDisplay || !startBtn || !resetBtn || !switchBtn || !progressEl || !belowBtn) {
      console.warn('dashboard: some expected elements are missing; initialization skipped for this root.');
      return;
    }

    // State (persisted)
    const STORAGE_KEY = 'dailystretch_dashboard_state_v1';
    const REMINDER_KEY = 'dailystretch_reminders_v1';
    let state = {
      isRunning: false,
      isStudy: true,
      timerSeconds: 25 * 60,
      initialSeconds: 25 * 60,
      lastUpdate: null
    };

    // Reminders (separate from study timer)
    let reminders = {
      stretchEnabled: false,
      hydrationEnabled: false,
      intervalMinutes: 30
    };
    let reminderTimerId = null;

    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const s = JSON.parse(raw);

        if (typeof s.timerSeconds === 'number') {
          state = Object.assign(state, s);
        }
      } catch (e) { console.warn('dashboard: failed to load state', e); }
    }

    function saveState() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    }

    function loadReminders() {
      try {
        const raw = localStorage.getItem(REMINDER_KEY);
        if (!raw) return;
        const r = JSON.parse(raw);
        if (typeof r.intervalMinutes === 'number') {
          reminders = Object.assign(reminders, r);
        }
      } catch (e) { console.warn('reminders: failed to load', e); }
    }

    function saveReminders() {
      try { localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders)); } catch (e) { /* ignore */ }
    }

    function startReminders() {
      stopReminders();
      if (!reminders.stretchEnabled && !reminders.hydrationEnabled) return;
      // schedule reminders at the chosen interval
      reminderTimerId = setInterval(() => {
        if (reminders.stretchEnabled) {
          try { new Notification('Stretch reminder', { body: 'Time to stretch!' }); } catch (e) { /*ignore*/ }
          try { alarm.play(); } catch (e) { /*ignore*/ }
        }
        if (reminders.hydrationEnabled) {
          try { new Notification('Hydration reminder', { body: 'Time to drink water!' }); } catch (e) { /*ignore*/ }
          try { alarm.play(); } catch (e) { /*ignore*/ }
        }
      }, reminders.intervalMinutes * 60 * 1000);
    }

    function stopReminders() {
      if (reminderTimerId) { clearInterval(reminderTimerId); reminderTimerId = null; }
    }

    function formatTime(s) {
      const m = Math.floor(s / 60).toString().padStart(2, '0');
      const sec = (s % 60).toString().padStart(2, '0');
      return `${m}:${sec}`;
    }

    function render() {
        timeDisplay.textContent = formatTime(state.timerSeconds);
        const pct = 100 - Math.round((state.timerSeconds / state.initialSeconds) * 100);
      progressEl.style.width = pct + '%';
      belowBtn.textContent = state.isStudy ? `Focus for ${Math.floor(state.initialSeconds/60)} minutes` : `Break for ${Math.floor(state.initialSeconds/60)} minutes`;
      switchBtn.textContent = state.isStudy ? 'Switch to Break' : 'Switch to Study';
      saveState();
    }

    function renderReminders() {
      if (stretchToggle) stretchToggle.checked = !!reminders.stretchEnabled;
      if (hydrationToggle) hydrationToggle.checked = !!reminders.hydrationEnabled;
      Array.from(intervalBtns || []).forEach(b => b.classList.remove('active'));
      const active = Array.from(intervalBtns || []).find(b => parseInt(b.textContent,10) === reminders.intervalMinutes);
      if (active) active.classList.add('active');
      saveReminders();
    }

    // Small toast popup used for quick feedback
    function showToast(text, duration = 1500) {
      try {
        let toast = document.getElementById('ds-toast');
        if (!toast) {
          toast = document.createElement('div');
          toast.id = 'ds-toast';
          document.body.appendChild(toast);
        }
        toast.textContent = text;
        // trigger CSS animation
        toast.classList.add('show');
        // remove after duration
        setTimeout(() => {
          if (toast) toast.classList.remove('show');
        }, duration);
      } catch (e) { /* ignore */ }
    }

    let timerInterval = null;

    function tick() {
      // reconcile with wall clock if lastUpdate present to survive tab switches
      if (state.isRunning && state.lastUpdate) {
        const now = Date.now();
        const elapsed = Math.floor((now - state.lastUpdate) / 1000);
        if (elapsed > 0) {
          state.timerSeconds = Math.max(0, state.timerSeconds - elapsed);
          state.lastUpdate = now;
          if (state.timerSeconds === 0) {
            // finished
            clearInterval(timerInterval);
            state.isRunning = false;
            notifyFinish();
          }
        }
      }
      if (state.isRunning) {
        state.timerSeconds = Math.max(0, state.timerSeconds - 1);
        if (state.timerSeconds === 0) {
          clearInterval(timerInterval);
          state.isRunning = false;
          notifyFinish();
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
      saveState();
    }

    function pauseTimer() {
      if (!state.isRunning) return;
      state.isRunning = false;
      startBtn.textContent = '\u25b6 Start';
      clearInterval(timerInterval);
      state.lastUpdate = null;
      saveState();
    }

    function resetTimer() {
      pauseTimer();
      state.timerSeconds = state.initialSeconds;
      render();
    }

    function switchMode() {
      pauseTimer();
      state.isStudy = !state.isStudy;
      state.initialSeconds = state.isStudy ? 25 * 60 : 5 * 60;
      state.timerSeconds = state.initialSeconds;
      render();
    }

    function notifyFinish() {
      try {
        if (window.Notification && Notification.permission === 'granted') {
          new Notification('Session complete', { body: state.isStudy ? 'Time for a break!' : 'Back to work!' });
          alarm.play();
        } else if (window.Notification && Notification.permission !== 'denied') {
          Notification.requestPermission().then(p => { if (p === 'granted') new Notification('Session complete'); });
          alarm.play();
        }
      } catch (e) { console.warn('notify failed', e); }
    }

    // Wire up UI
    startBtn.addEventListener('click', () => { state.isRunning ? pauseTimer() : startTimer(); });
    resetBtn.addEventListener('click', resetTimer);
    switchBtn.addEventListener('click', switchMode);
    belowBtn.addEventListener('click', startTimer);

    Array.from(intervalBtns || []).forEach(btn => {
      btn.addEventListener('click', (e) => {
        Array.from(intervalBtns || []).forEach(b => b.classList.remove('active'));
        const target = e.currentTarget || e.target;
        target.classList.add('active');
        const text = target.textContent.trim();
        const minutes = parseInt(text.split(' ')[0], 10);
        if (!Number.isNaN(minutes) && minutes > 0) {
          // Interval buttons control Reminder interval only (do not affect study timer).
          reminders.intervalMinutes = minutes;
          renderReminders();
          startReminders();
          // quick UI feedback
          showToast('Reminder has been set to every ' + minutes + ' minutes');
        }
      });
    });

    if (stretchToggle) stretchToggle.addEventListener('change', (e) => {
      reminders.stretchEnabled = e.target.checked;
      renderReminders();
      startReminders();
    });
    if (hydrationToggle) hydrationToggle.addEventListener('change', (e) => {
      reminders.hydrationEnabled = e.target.checked;
      renderReminders();
      startReminders();
    });

  // Load persisted state and start tick if needed
  loadState();
  loadReminders();
    // Reconcile wall-clock since last update if running
    if (state.isRunning && state.lastUpdate) {
      const elapsed = Math.floor((Date.now() - state.lastUpdate) / 1000);
      state.timerSeconds = Math.max(0, state.timerSeconds - elapsed);
      if (state.timerSeconds === 0) { state.isRunning = false; notifyFinish(); }
    }
    render();
    if (state.isRunning) {
      clearInterval(timerInterval);
      timerInterval = setInterval(tick, 1000);
    }

    // start reminders if enabled
    renderReminders();
    startReminders();

    // expose small API for debugging/tests
    return {
      getState: () => Object.assign({}, state),
      start: startTimer,
      pause: pauseTimer,
      reset: resetTimer
    };
  } catch (err) {
    console.error('initDashboard failed', err);
  }
};


try {
  if (document.querySelector && document.querySelector('#time-display')) {
    window.initDashboard(document);
  }
} catch (e) { /* ignore */ }

