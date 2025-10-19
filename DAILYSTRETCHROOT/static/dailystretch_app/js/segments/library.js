const routines = [
  {
    title: "Desk Stretches",
    desc: "Quick stretches to relieve tension from sitting",
    category: "stretch", difficulty: "beginner", duration: "5 min",
    instructions: "Sit upright. Feet flat. Lift arms overhead. Stretch side to side, hold for 20 seconds each. Roll shoulders back three times. Interlace fingers behind, open chest and hold for 30 seconds. Repeat as needed."
  },
  {
    title: "Deep Breathing Exercise",
    desc: "Calm your mind and reduce stress with controlled breathing",
    category: "breathing", difficulty: "beginner", duration: "3 min",
    instructions: "Sit comfortably. Breathe in through your nose for 4 seconds, hold for 4 seconds, exhale through your mouth for 4 seconds, hold for 4 seconds. Repeat this cycle."
  },
  {
    title: "20-20-20 Eye Rest",
    desc: "Reduce eye strain from screen time",
    category: "eye-care", difficulty: "advanced", duration: "20 min",
    instructions: "Look at something 20 feet away for 20 seconds every 20 minutes. Blink slowly ten times to refresh eyes."
  },
  {
    title: "Standing Full Body Stretch",
    desc: "Energizing stretch routine for your whole body",
    category: "stretch", difficulty: "beginner", duration: "7 min",
    instructions: "Stand upright, feet hip-width apart. Reach arms to sky, stretch upwards. Lean gently left and right. Touch toes, hold 15 seconds. Roll up slowly. Repeat as needed."
  },
  {
    title: "Mindful Meditation",
    desc: "Short meditation to reset your mind",
    category: "meditation", difficulty: "beginner", duration: "5 min",
    instructions: "Sit comfortably, close your eyes. Breathe slowly and deeply. Focus on your breath. When thoughts appear, let them pass. Continue quietly."
  },
  {
    title: "Wrist and Hand Relief",
    desc: "Stretches for hands and wrists to prevent strain",
    category: "stretch", difficulty: "beginner", duration: "4 min",
    instructions: "Extend one arm forward, palm up. Gently pull fingers back with other hand. Switch hands after 20 seconds. Make a loose fist, roll wrists clockwise and counterclockwise."
  },
  {
    title: "Box Breathing",
    desc: "Advanced breathing technique for focus and calm",
    category: "breathing", difficulty: "intermediate", duration: "4 min",
    instructions: "Sit upright, shoulders relaxed. Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds. Repeat 8 cycles."
  },
  {
    title: "Hip and Lower Back Release",
    desc: "Gentle stretches for lower body relief",
    category: "stretch", difficulty: "intermediate", duration: "6 min",
    instructions: "Lie on back, hug knees in toward chest. Hold for 30 seconds. Cross right ankle over left knee, pull left thigh toward you. Switch sides after 30 seconds."
  },
  {
    title: "Progressive Muscle Relaxation",
    desc: "Systematic tension and release for deep relaxation",
    category: "meditation", difficulty: "intermediate", duration: "8 min",
    instructions: "Sit or lie down. Tense muscle groups gently (feet, calves, thighs, hands, arms, face). Hold 5 seconds, then release. Work through all groups from feet to head."
  },
  {
    title: "Energizing Morning Routine",
    desc: "Wake up your body and mind for the day ahead",
    category: "stretch", difficulty: "intermediate", duration: "10 min",
    instructions: "Stand, reach arms and legs out. Gentle jumping jacks and arm circles. Deep breaths in, stretching side to side. Finish with forward bend for 30 seconds."
  },
  {
    title: "Computer Vision Syndrome Relief",
    desc: "Comprehensive eye exercises for screen workers",
    category: "eye-care", difficulty: "intermediate", duration: "5 min",
    instructions: "Blink quickly for 10 seconds. Look left, right, up, down for 15 seconds each. Focus near and far objects for 30 seconds."
  },
  {
    title: "Posture Reset",
    desc: "Correct your posture and align your spine",
    category: "stretch", difficulty: "advanced", duration: "8 min",
    instructions: "Sit tall, shoulders relaxed. Pull chin backwards slightly. Hold arms out, rotate palms up and down. Stretch neck side to side."
  }
];

let timerInterval = null;

function prettyCategory(cat) {
  if (cat === "eye-care") return "Eye Care";
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}
function makeTags(r) {
  let tags = '';
  tags += `<span class="lib-tag blue">${prettyCategory(r.category)}</span>`;
  if (r.difficulty === "beginner") tags += `<span class="lib-tag green">Beginner</span>`;
  else if (r.difficulty === "intermediate") tags += `<span class="lib-tag orange">Intermediate</span>`;
  else if (r.difficulty === "advanced") tags += `<span class="lib-tag red">Advanced</span>`;
  tags += `<span class="lib-tag gray">${r.duration}</span>`;
  return tags;
}
function durationSeconds(dur) {
  const mins = parseInt(dur);
  return mins * 60;
}

function renderRoutines() {
  const cat = document.getElementById('category').value;
  const diff = document.getElementById('difficulty').value;
  const favs = JSON.parse(localStorage.getItem('favRoutines') || '[]');
  let grid = document.getElementById('libraryGrid');
  grid.innerHTML = '';
  routines.forEach((r, idx) => {
    if ((!cat || r.category === cat) && (!diff || r.difficulty === diff)) {
      const isFav = favs.includes(idx);
      grid.innerHTML += `
        <div class="lib-card" data-category="${r.category}" data-difficulty="${r.difficulty}">
          <div class="lib-card-header">
            <strong>${r.title}</strong>
            <span class="star" onclick="toggleFavorite(${idx}, this)" style="color:${isFav ? '#e7b900' : '#c6c6c6'}">&#9733;</span>
          </div>
          <p class="lib-desc">${r.desc}</p>
          <div class="lib-tags">${makeTags(r)}</div>
          <button class="routine-btn" onclick="openRoutine(${idx})">
            <span style="margin-right:7px;color:#61cfff">&#9654;</span> Start Routine
          </button>
        </div>`;
    }
  });
}
window.toggleFavorite = function(idx, star) {
  let favs = JSON.parse(localStorage.getItem('favRoutines') || '[]');
  if (favs.includes(idx)) favs = favs.filter(i => i !== idx);
  else favs.push(idx);
  localStorage.setItem('favRoutines', JSON.stringify(favs));
  renderRoutines();
};
window.openRoutine = function(idx) {
  if (timerInterval) clearInterval(timerInterval);
  const r = routines[idx];
  document.getElementById('modalBg').style.display = 'flex';
  document.getElementById('modalContent').innerHTML =
    `<strong>${r.title}</strong><br/><br/>
    <span>${r.instructions}</span>`;
  document.getElementById('routineTitle').innerText = r.title;
  document.getElementById('timerArea').style.display = 'none';
  document.getElementById('modalStartBtn').style.display = '';
  document.getElementById('modalStopBtn').style.display = 'none';
  document.getElementById('modalStartBtn').onclick = function() {
    startTimer(r.duration, r.title);
  };
  document.getElementById('modalStopBtn').onclick = function() {
    closeModal();
  };
  document.getElementById('modalBg').onclick = function(e) {
    if (e.target === document.getElementById('modalBg')) closeModal();
  };
};
function closeModal() {
  document.getElementById('modalBg').style.display = 'none';
  document.getElementById('timerArea').style.display = 'none';
  document.getElementById('modalStartBtn').style.display = '';
  document.getElementById('modalStopBtn').style.display = 'none';
  document.getElementById('timerDisplay').innerText = '';
  if (timerInterval) clearInterval(timerInterval);
}
function startTimer(duration, title) {
  document.getElementById('modalStartBtn').style.display = 'none';
  document.getElementById('modalStopBtn').style.display = '';
  document.getElementById('timerArea').style.display = '';
  document.getElementById('routineTitle').innerText = title;
  let seconds = durationSeconds(duration);
  updateTimer(seconds);

  timerInterval = setInterval(function() {
    seconds--;
    updateTimer(seconds);
    if (seconds <= 0) {
      clearInterval(timerInterval);
      document.getElementById('timerDisplay').innerText = "Routine Complete!";
      setTimeout(closeModal, 1500);
    }
  }, 1000);
}
function updateTimer(seconds) {
  let min = Math.floor(seconds / 60);
  let sec = seconds % 60;
  if (seconds < 0) seconds = 0;
  document.getElementById('timerDisplay').innerText = `${min}:${sec.toString().padStart(2, '0')}`;
}
document.getElementById('category').addEventListener('change', renderRoutines);
document.getElementById('difficulty').addEventListener('change', renderRoutines);
window.onload = () => renderRoutines();
