// Library fragment script
// Priority for data sources:
// 1) window.INIT_ROUTINES (server-injected JSON)
// 2) /api/routines/ (session-authenticated Django endpoint)
// 3) Supabase client (if SUPABASE_URL and SUPABASE_ANON_KEY are provided)

let libraryTimerInterval = null;

function prettyCategory(cat) {
  if (!cat) return '';
  if (cat === 'eye-care') return 'Eye Care';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

function makeTags(r) {
  let tags = '';
  tags += `<span class="lib-tag blue">${prettyCategory(r.category)}</span>`;
  if (r.difficulty === 'beginner') tags += `<span class="lib-tag green">Beginner</span>`;
  else if (r.difficulty === 'intermediate') tags += `<span class="lib-tag orange">Intermediate</span>`;
  else if (r.difficulty === 'advanced') tags += `<span class="lib-tag red">Advanced</span>`;
  const dur = r.duration_text || (r.duration_minutes ? String(r.duration_minutes) + ' min' : (r.duration || ''));
  if (dur) tags += `<span class="lib-tag gray">${dur}</span>`;
  return tags;
}

function durationSeconds(dur) {
  if (!dur) return 5 * 60; // default 5 minutes
  const m = parseInt(String(dur).replace(/[^0-9]/g, ''), 10);
  return (isNaN(m) ? 5 : m) * 60;
}

window.initLibrary = window.initLibrary || function initLibrary(root) {
  try {
    if (!root || !(root instanceof Element)) root = document;
    console.debug('initLibrary called', root);
    try { root.__library_inited = true; } catch (e) { /* ignore */ }

    async function fetchApiRoutines() {
      try {
        const resp = await fetch('/api/routines/', { credentials: 'same-origin' });
        console.debug('library: /api/routines/ status', resp.status, resp.headers.get('content-type'));
        if (!resp.ok) return null;
        const ct = (resp.headers.get('content-type') || '').toLowerCase();
        if (ct.includes('application/json')) return await resp.json();
        const txt = await resp.text();
        try { return JSON.parse(txt); } catch (e) { console.warn('library: /api/routines/ returned non-json', txt); return null; }
      } catch (e) { console.warn('library: error fetching /api/routines/', e); return null; }
    }

    async function fetchSupabaseRoutines() {
      if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) return null;
      try {
        const lib = window.supabaseJs || window.supabase || (typeof createClient === 'function' ? { createClient } : null);
        if (!lib) { console.warn('library: supabase client not found on window'); return null; }
        const client = lib.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        const { data, error } = await client.from('routines').select('id, title, description, category, difficulty, duration_text, duration_minutes, instructions').order('id', { ascending: true });
        if (error) { console.warn('library: supabase error', error); return null; }
        return data || null;
      } catch (e) { console.warn('library: supabase fetch failed', e); return null; }
    }

    async function renderRoutines() {
      const catEl = root.querySelector('#category');
      const diffEl = root.querySelector('#difficulty');
      const cat = catEl ? catEl.value : '';
      const diff = diffEl ? diffEl.value : '';
  let favs = JSON.parse(localStorage.getItem('favRoutines') || '[]');
  if (!Array.isArray(favs)) favs = [];
  // normalize stored fav ids to numbers to avoid type/idx confusion
  favs = favs.map(n => Number(n));
      const grid = root.querySelector('#libraryGrid');
      if (!grid) return;
      grid.innerHTML = '';

      let items = null;
      if (window.INIT_ROUTINES && Array.isArray(window.INIT_ROUTINES) && window.INIT_ROUTINES.length) {
        items = window.INIT_ROUTINES;
        console.debug('library: using window.INIT_ROUTINES with', items.length, 'items');
      }

      if (!items) {
        const apiItems = await fetchApiRoutines();
        if (Array.isArray(apiItems) && apiItems.length) items = apiItems;
      }

      if (!items) {
        const supaItems = await fetchSupabaseRoutines();
        if (Array.isArray(supaItems) && supaItems.length) items = supaItems;
      }

      if (!Array.isArray(items) || items.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'lib-empty';
        empty.innerHTML = '<div style="text-align:center;padding:40px;color:#666"><div style="font-size:20px;margin-bottom:8px">No routines found</div><div style="font-size:13px">Add routines via the admin, the /api/routines/ endpoint, or connect Supabase and add rows to your `routines` table.</div></div>';
        grid.appendChild(empty);
        try { root.__library_items = []; } catch (e) { /* ignore */ }
        return;
      }

      // normalize items and save to root
      const normalized = items.map((r, i) => ({
        id: r.id ?? (r.pk ?? i),
        title: r.title ?? r.name ?? ('Routine ' + (i+1)),
        description: r.description ?? r.desc ?? '',
        category: r.category ?? '',
        difficulty: r.difficulty ?? '',
        duration_text: r.duration_text ?? r.duration ?? (r.duration_minutes ? String(r.duration_minutes) + ' min' : ''),
        duration_minutes: r.duration_minutes ?? (r.duration ? parseInt(String(r.duration).replace(/[^0-9]/g,''),10) : null),
        instructions: r.instructions ?? ''
      }));

      try { root.__library_items = normalized; } catch (e) { /* ignore */ }

      normalized.forEach((r, idx) => {
        const catMatch = !cat || r.category === cat;
        const diffMatch = !diff || r.difficulty === diff;
        if (!catMatch || !diffMatch) return;
  const isFav = favs.includes(Number(r.id));
        const card = document.createElement('div');
        card.className = 'lib-card';
        card.setAttribute('data-category', r.category || '');
        card.setAttribute('data-difficulty', r.difficulty || '');
        card.innerHTML = `<div class="lib-card-header"><strong>${r.title}</strong><span class="star" data-idx="${r.id}" style="color:${isFav ? '#e7b900' : '#c6c6c6'}">★</span></div><p class="lib-desc">${r.description || ''}</p><div class="lib-tags">${makeTags(r)}</div><button class="routine-btn" data-idx="${r.id}"><span style="margin-right:7px;color:#61cfff">▶</span> Start Routine</button>`;
        grid.appendChild(card);
      });

      // wire up actions
      Array.from(grid.querySelectorAll('.star')).forEach(el => {
        el.onclick = function(e) { e.stopPropagation(); toggleFavorite(parseInt(el.getAttribute('data-idx'),10), el); };
      });
      Array.from(grid.querySelectorAll('.routine-btn')).forEach(btn => {
        btn.onclick = function() { openRoutine(parseInt(btn.getAttribute('data-idx'),10)); };
      });

      try { console.debug('renderRoutines: rendered', grid.children.length, 'cards'); } catch (e) { /* ignore */ }
    }

    window.toggleFavorite = function(idx, starEl) {
      const itemsColl = root.__library_items || [];
      if (!itemsColl || itemsColl.length === 0) return;
      let favs = JSON.parse(localStorage.getItem('favRoutines') || '[]');
      if (!Array.isArray(favs)) favs = [];
      favs = favs.map(n => Number(n));
      const idNum = Number(idx);
      const wasFav = favs.includes(idNum);
      if (wasFav) favs = favs.filter(i => i !== idNum);
      else favs.push(idNum);
      localStorage.setItem('favRoutines', JSON.stringify(favs));
      // optimistic UI update: change only the clicked star color
      try { if (starEl) starEl.style.color = wasFav ? '#c6c6c6' : '#e7b900'; } catch (e) { /* ignore */ }
      // do not re-render entire grid here (avoids sluggishness); the change is persisted
    };

    window.openRoutine = function(idx) {
      if (libraryTimerInterval) clearInterval(libraryTimerInterval);
      const itemsColl = root.__library_items || [];
      let r = null;
      try { r = itemsColl.find(it => String(it.id) === String(idx)); } catch (e) { /* ignore */ }
      if (!r) {
        r = itemsColl[idx] || null;
        if (!r) { console.warn('openRoutine: not found for idx', idx); return; }
      }
      const modalBg = root.querySelector('#modalBg');
      const modalContent = root.querySelector('#modalContent');
      const routineTitle = root.querySelector('#routineTitle');
      const timerArea = root.querySelector('#timerArea');
      const modalStartBtn = root.querySelector('#modalStartBtn');
      const modalStopBtn = root.querySelector('#modalStopBtn');
      const timerDisplay = root.querySelector('#timerDisplay');
      if (!modalBg || !modalContent) return;
      modalBg.style.display = 'flex';
      modalContent.innerHTML = `<strong>${r.title}</strong><br/><br/><span>${r.instructions || r.description || ''}</span>`;
      if (routineTitle) routineTitle.innerText = r.title;
      if (timerArea) timerArea.style.display = 'none';
      if (modalStartBtn) modalStartBtn.style.display = '';
      if (modalStopBtn) modalStopBtn.style.display = 'none';
      const durationArg = r.duration_text || (r.duration_minutes ? String(r.duration_minutes) + ' min' : '5 min');
      if (modalStartBtn) modalStartBtn.onclick = function() { startTimer(durationArg, r.title); };
      if (modalStopBtn) modalStopBtn.onclick = function() { closeModal(); };
      modalBg.onclick = function(e) { if (e.target === modalBg) closeModal(); };
    };

    function closeModal() {
      const modalBg = root.querySelector('#modalBg');
      const timerArea = root.querySelector('#timerArea');
      const modalStartBtn = root.querySelector('#modalStartBtn');
      const modalStopBtn = root.querySelector('#modalStopBtn');
      const timerDisplay = root.querySelector('#timerDisplay');
      if (modalBg) modalBg.style.display = 'none';
      if (timerArea) timerArea.style.display = 'none';
      if (modalStartBtn) modalStartBtn.style.display = '';
      if (modalStopBtn) modalStopBtn.style.display = 'none';
      if (timerDisplay) timerDisplay.innerText = '';
      if (libraryTimerInterval) clearInterval(libraryTimerInterval);
    }

    function startTimer(duration, title) {
      const modalStartBtn = root.querySelector('#modalStartBtn');
      const modalStopBtn = root.querySelector('#modalStopBtn');
      const timerArea = root.querySelector('#timerArea');
      const routineTitle = root.querySelector('#routineTitle');
      const timerDisplay = root.querySelector('#timerDisplay');
      if (modalStartBtn) modalStartBtn.style.display = 'none';
      if (modalStopBtn) modalStopBtn.style.display = '';
      if (timerArea) timerArea.style.display = '';
      if (routineTitle) routineTitle.innerText = title;
      let seconds = durationSeconds(duration);
      updateTimerDisplay(seconds);
      libraryTimerInterval = setInterval(function() {
        seconds--;
        updateTimerDisplay(seconds);
        if (seconds <= 0) {
          clearInterval(libraryTimerInterval);
          if (timerDisplay) timerDisplay.innerText = 'Routine Complete!';
          setTimeout(closeModal, 1500);
        }
      }, 1000);
    }

    function updateTimerDisplay(seconds) {
      const timerDisplay = root.querySelector('#timerDisplay');
      let min = Math.floor(seconds / 60);
      let sec = seconds % 60;
      if (seconds < 0) seconds = 0;
      if (timerDisplay) timerDisplay.innerText = `${min}:${sec.toString().padStart(2, '0')}`;
    }

    const catEl = root.querySelector('#category');
    const diffEl = root.querySelector('#difficulty');
    if (catEl) catEl.onchange = renderRoutines;
    if (diffEl) diffEl.onchange = renderRoutines;

    // initial render
    renderRoutines();

    return { render: renderRoutines };
  } catch (err) {
    console.error('initLibrary failed', err);
  }
};

// Auto-init when loaded as a full page
try {
  if (document.querySelector && document.querySelector('#libraryGrid')) window.initLibrary(document);
} catch (e) { /* ignore */ }
