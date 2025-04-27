document.addEventListener("DOMContentLoaded", function () {
  // Funcionalidad para las cards
  document.querySelectorAll(".card-header").forEach((header) => {
    header.addEventListener("click", () => {
      const card = header.parentElement;
      card.classList.toggle("active");

      const icon = header.querySelector("i");
      if (card.classList.contains("active")) {
        icon.classList.remove("fa-chevron-down");
        icon.classList.add("fa-chevron-up");
      } else {
        icon.classList.remove("fa-chevron-up");
        icon.classList.add("fa-chevron-down");
      }
    });
  });

  // Tema oscuro/claro
  const themeToggle = document.getElementById("themeToggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Comprobar preferencias del sistema
  if (prefersDarkScheme.matches) {
    document.documentElement.setAttribute("data-theme", "dark");
    updateToggleButton("dark");
  }

  // Alternar tema
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (currentTheme === "dark") {
      document.documentElement.removeAttribute("data-theme");
      updateToggleButton("light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      updateToggleButton("dark");
    }
  });

  function updateToggleButton(theme) {
    const icon = themeToggle.querySelector("i");
    if (theme === "dark") {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
    } else {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
    }
  }

  /// Smooth scrolling para navegación interna (solo para enlaces que comienzan con #)
  document.querySelectorAll("nav a").forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Solo aplica smooth scrolling si es un enlace interno (#)
      if (href.startsWith("#")) {
        e.preventDefault();
        const targetElement = document.querySelector(href);

        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 100,
            behavior: "smooth",
          });
        }
      }
      // Los enlaces normales (como index.html) se manejarán normalmente
    });
  });
});
