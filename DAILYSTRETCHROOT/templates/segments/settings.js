document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("dark-mode-toggle");
    const label = document.getElementById("theme-label");

    // Load previous preference
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        toggle.checked = true;
        label.textContent = "Light Mode";
    }

    toggle.addEventListener("change", () => {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        label.textContent = isDark ? "Light Mode" : "Dark Mode";
    });
});
