document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const contentArea = document.getElementById("content-area");

  // Global dark mode handler
  function applyDarkModeIfEnabled() {
    if (localStorage.getItem('dark_mode_enabled') === 'true') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  // Initial apply on page load
  applyDarkModeIfEnabled();

  const loadPage = async (page) => {
    try {
      const response = await fetch(page);
      const html = await response.text();
      contentArea.innerHTML = html;

      const scripts = Array.from(contentArea.querySelectorAll('script'));
      const loadPromises = scripts.map((oldScript) => {
        return new Promise((resolve) => {
          const newScript = document.createElement('script');
          if (oldScript.type) newScript.type = oldScript.type;
          if (oldScript.src) {
            newScript.src = oldScript.src;
            newScript.async = false;
            newScript.onload = () => resolve();
            newScript.onerror = (e) => { console.error('Failed loading script', oldScript.src, e); resolve(); };
            document.body.appendChild(newScript);
          } else {
            newScript.textContent = oldScript.textContent;
            document.body.appendChild(newScript);
            resolve();
          }
          try { oldScript.parentNode && oldScript.parentNode.removeChild(oldScript); } catch (e) {}
        });
      });

      await Promise.all(loadPromises);

      // If the page loads an initX function, run it (e.g. for dashboard, settings, etc)
      try {
        const parts = page.split('/').filter(Boolean);
        let last = parts.pop() || '';
        last = last.split('.').shift();
        if (last) {
          const initName = 'init' + last.charAt(0).toUpperCase() + last.slice(1);
          if (typeof window[initName] === 'function') {
            try {
              const flag = '__' + last + '_inited';
              if (contentArea && Object.prototype.hasOwnProperty.call(contentArea, flag)) {
                try { delete contentArea[flag]; } catch (e) { /* ignore */ }
              }
              window[initName](contentArea);
            } catch (err) { console.error('Error running', initName, err); }
          }
        }
      } catch (e) {}

      // <<<< THIS is the important call for dark mode!
      applyDarkModeIfEnabled();

    } catch (err) {
      contentArea.innerHTML = "<p>⚠️ Failed to load content.</p>";
      console.error(err);
    }
  };

  if (tabs && tabs[0]) loadPage(tabs[0].getAttribute("data-page"));

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      loadPage(tab.getAttribute("data-page"));
    });
  });

  // Make applyDarkModeIfEnabled globally accessible
  window.applyDarkModeIfEnabled = applyDarkModeIfEnabled;
});
