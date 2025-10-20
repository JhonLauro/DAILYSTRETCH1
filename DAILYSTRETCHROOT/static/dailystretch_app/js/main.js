document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const contentArea = document.getElementById("content-area");

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

      try {
        const parts = page.split('/').filter(Boolean);
        let last = parts.pop() || '';
        last = last.split('.').shift();
        if (last) {
          const initName = 'init' + last.charAt(0).toUpperCase() + last.slice(1);
          if (typeof window[initName] === 'function') {
            try {
              // clear any fragment-specific init flag on the content area so
              // the fragment's idempotent initializer can run again when the
              // segment is re-injected. e.g. __library_inited, __dashboard_inited
              try {
                const flag = '__' + last + '_inited';
                if (contentArea && Object.prototype.hasOwnProperty.call(contentArea, flag)) {
                  try { delete contentArea[flag]; } catch (e) { /* ignore */ }
                }
              } catch (e) { /* ignore */ }
              window[initName](contentArea);
            } catch (err) { console.error('Error running', initName, err); }
          }
        }
      } catch (e) {}
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
});
