function initSettingsDarkMode() {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const label = document.getElementById('theme-label');
  if (!darkModeToggle || !label) return;

  darkModeToggle.checked = localStorage.getItem('dark_mode_enabled') === 'true';
  label.textContent = darkModeToggle.checked ? 'Light Mode' : 'Dark Mode';

  darkModeToggle.onchange = () => {
    if (darkModeToggle.checked) {
      localStorage.setItem('dark_mode_enabled', 'true');
      label.textContent = 'Light Mode';
    } else {
      localStorage.setItem('dark_mode_enabled', 'false');
      label.textContent = 'Dark Mode';
    }
    if (typeof applyDarkModeIfEnabled === 'function') {
      applyDarkModeIfEnabled();
    }
  };
}

setTimeout(initSettingsDarkMode, 10);
