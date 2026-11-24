const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

const revealElements = document.querySelectorAll(".reveal");

const revealOnScroll = () => {
  const trigger = window.innerHeight * 0.88;

  revealElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < trigger) {
      element.classList.add("visible");
    }
  });
};

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

const counters = document.querySelectorAll("[data-count]");
let countersStarted = false;

const animateCounters = () => {
  if (countersStarted || counters.length === 0) return;

  const statsSectionVisible = [...counters].some((counter) => {
    const rect = counter.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.9;
  });

  if (!statsSectionVisible) return;

  countersStarted = true;

  counters.forEach((counter) => {
    const target = Number(counter.dataset.count);
    let current = 0;
    const increment = Math.max(1, Math.ceil(target / 40));

    const updateCounter = () => {
      current += increment;

      if (current >= target) {
        counter.textContent = target;
      } else {
        counter.textContent = current;
        requestAnimationFrame(updateCounter);
      }
    };

    updateCounter();
  });
};

window.addEventListener("scroll", animateCounters);
window.addEventListener("load", animateCounters);

const switchButtons = document.querySelectorAll(".switch-btn");
const skillPanels = document.querySelectorAll(".skill-panel");

if (switchButtons.length && skillPanels.length) {
  switchButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.skillTarget;

      switchButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });

      skillPanels.forEach((panel) => {
        panel.classList.remove("active");
      });

      button.classList.add("active");
      button.setAttribute("aria-selected", "true");

      const activePanel = document.querySelector(`[data-skill-panel="${target}"]`);
      if (activePanel) {
        activePanel.classList.add("active");
      }
    });
  });
}

const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

if (filterButtons.length && projectCards.length) {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      projectCards.forEach((card) => {
        const categories = card.dataset.category || "";

        if (filter === "all" || categories.includes(filter)) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });
}

const sections = document.querySelectorAll("main section[id], header[id]");
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const updateActiveNav = () => {
  let currentSection = "";

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 140 && rect.bottom >= 140) {
      currentSection = section.id;
    }
  });

  navAnchors.forEach((anchor) => {
    anchor.classList.remove("active");
    if (anchor.getAttribute("href") === `#${currentSection}`) {
      anchor.classList.add("active");
    }
  });
};

if (navAnchors.length) {
  window.addEventListener("scroll", updateActiveNav);
  window.addEventListener("load", updateActiveNav);
}

/* ==========================================================================
   CAPA 2 · CRISTAL Y DINAMISMO
   ========================================================================== */

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* --- Menú móvil: icono animado, cerrar al tocar fuera o con Escape --- */
  const toggle = document.getElementById("menuToggle");
  const links = document.getElementById("navLinks");

  if (toggle && links) {
    const sync = () => {
      const open = links.classList.contains("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    };

    new MutationObserver(sync).observe(links, { attributes: true, attributeFilter: ["class"] });
    sync();

    document.addEventListener("click", (e) => {
      if (links.classList.contains("open") && !links.contains(e.target) && !toggle.contains(e.target)) {
        links.classList.remove("open");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") links.classList.remove("open");
    });
  }

  /* --- Barra de progreso y navbar de cristal al hacer scroll --- */
  const navbar = document.querySelector(".navbar");
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.setProperty("--p", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
      if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 20);
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* --- Apariciones escalonadas con IntersectionObserver --- */
  const groups = [".hero-stats", ".projects-grid", ".three-columns", ".two-columns"];
  groups.forEach((sel) => {
    document.querySelectorAll(sel).forEach((group) => {
      [...group.children].forEach((child, i) => {
        child.classList.add("reveal");
        child.style.setProperty("--delay", `${Math.min(i, 6) * 80}ms`);
      });
    });
  });

  const revealables = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("visible"));
  }

  /* --- Pastillas de skills: entrada en cascada --- */
  document.querySelectorAll(".skill-list").forEach((list) => {
    [...list.children].forEach((pill, i) => pill.style.setProperty("--i", i));
  });

  /* --- Filtro de proyectos: animar las tarjetas que aparecen --- */
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".project-card:not(.hidden)").forEach((card) => {
        card.classList.remove("fade-in", "reveal");
        void card.offsetWidth;
        card.classList.add("fade-in");
      });
    });
  });

  /* --- Solo escritorio con ratón: luz del cursor, reflejos e inclinación 3D --- */
  if (!finePointer || reduceMotion) return;

  const light = document.createElement("div");
  light.className = "cursor-light";
  document.body.appendChild(light);

  let lx = 0, ly = 0, tx = 0, ty = 0, running = false;
  const follow = () => {
    lx += (tx - lx) * 0.12;
    ly += (ty - ly) * 0.12;
    light.style.transform = `translate(${lx}px, ${ly}px)`;
    if (Math.abs(tx - lx) > 0.5 || Math.abs(ty - ly) > 0.5) {
      requestAnimationFrame(follow);
    } else {
      running = false;
    }
  };

  window.addEventListener("pointermove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
    light.classList.add("on");
    if (!running) {
      running = true;
      requestAnimationFrame(follow);
    }
  }, { passive: true });

  document.addEventListener("pointerleave", () => light.classList.remove("on"));

  const tiltCards = document.querySelectorAll(
    ".project-card, .subject-card, .stat-card, .value-card, .hero-panel, .experience-card"
  );
  const glowCards = document.querySelectorAll(".glass-card, .stat-card");

  glowCards.forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  tiltCards.forEach((card) => {
    card.addEventListener("pointerenter", () => {
      card.style.transition = "transform 0.15s ease-out, box-shadow 0.45s ease";
    });
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s ease";
      card.style.transform = "";
    });
  });
})();

/* ==========================================================================
   CAPA 3 · TRANSICIONES
   ========================================================================== */

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Título palabra a palabra */
  if (!reduceMotion) {
    document.querySelectorAll("h1").forEach((h1) => {
      if (h1.children.length) return;
      const words = h1.textContent.trim().split(/\s+/);
      h1.setAttribute("aria-label", h1.textContent.trim());
      h1.textContent = "";
      words.forEach((word, i) => {
        const span = document.createElement("span");
        span.className = "word";
        span.setAttribute("aria-hidden", "true");
        span.style.setProperty("--w", i);
        span.textContent = word;
        h1.appendChild(span);
        if (i < words.length - 1) h1.appendChild(document.createTextNode(" "));
      });
    });
  }

  /* Pestañas de skills: el panel entra desde el lado hacia el que avanzas */
  const tabs = [...document.querySelectorAll(".switch-btn")];
  let current = tabs.findIndex((t) => t.classList.contains("active"));
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => {
      const panel = document.querySelector(`[data-skill-panel="${tab.dataset.skillTarget}"]`);
      if (panel) panel.style.setProperty("--dir", i >= current ? "18px" : "-18px");
      current = i;
    });
  });
})();

/* ==========================================================================
   CAPA 4 · MENÚ DESLIZABLE: mantiene a la vista el enlace activo
   ========================================================================== */

(() => {
  const strip = document.getElementById("navLinks");
  if (!strip) return;

  let lastActive = null;
  const centerActive = () => {
    if (strip.scrollWidth <= strip.clientWidth) return;
    const active = strip.querySelector("a.active");
    if (!active || active === lastActive) return;
    lastActive = active;
    const target = active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2;
    strip.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  };

  new MutationObserver(centerActive).observe(strip, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
  window.addEventListener("load", centerActive);
})();

/* ==========================================================================
   CAPA 5 · TEMARIO PLEGABLE
   - Pestañas de grado (ASIR / DAM)
   - Dentro de cada grado, solo un curso abierto a la vez
   - Enlaces directos: temario.html#asir-2, temario.html#dam-1, temario.html#dam
   ========================================================================== */

(() => {
  const tabs = [...document.querySelectorAll(".degree-tab")];
  if (!tabs.length) return;

  const panels = [...document.querySelectorAll(".degree-panel")];
  const navOffset = () => (document.querySelector(".navbar")?.offsetHeight || 0) + 24;

  /* Resumen automático de cada curso: nº de asignaturas y nota media */
  document.querySelectorAll(".course").forEach((course) => {
    const meta = course.querySelector("[data-course-meta]");
    const subjects = course.querySelectorAll(".subject-top h2");
    const grades = [...course.querySelectorAll(".grade-pill")]
      .map((g) => parseFloat(g.textContent.replace(",", ".")))
      .filter((n) => !Number.isNaN(n));

    course.querySelectorAll(".subject-card").forEach((card, i) => card.style.setProperty("--i", i));

    if (!meta || !subjects.length) return;
    let text = `${subjects.length} asignaturas`;
    if (grades.length) {
      const avg = grades.reduce((a, b) => a + b, 0) / grades.length;
      text += ` · Nota media ${avg.toFixed(1).replace(".", ",")}`;
    }
    meta.textContent = text;
  });

  const setCourse = (course, open) => {
    course.classList.toggle("open", open);
    course.querySelector(".course-toggle")?.setAttribute("aria-expanded", open ? "true" : "false");
  };

  const openCourse = (course, scroll) => {
    const panel = course.closest(".degree-panel");
    panel.querySelectorAll(".course").forEach((c) => setCourse(c, c === course));

    if (scroll) {
      /* Espera a que termine de plegarse el curso anterior y lleva el nuevo a la vista */
      setTimeout(() => {
        const top = course.getBoundingClientRect().top + window.scrollY - navOffset();
        if (Math.abs(top - window.scrollY) > 40) window.scrollTo({ top, behavior: "smooth" });
      }, 540);
    }
  };

  const showDegree = (name) => {
    tabs.forEach((t) => {
      const on = t.dataset.degree === name;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach((p) => p.classList.toggle("active", p.dataset.degreePanel === name));
  };

  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      showDegree(tab.dataset.degree);
      history.replaceState(null, "", `#${tab.dataset.degree}`);
    })
  );

  document.querySelectorAll(".course-toggle").forEach((btn) =>
    btn.addEventListener("click", () => {
      const course = btn.closest(".course");
      if (course.classList.contains("open")) {
        setCourse(course, false);
      } else {
        openCourse(course, true);
        history.replaceState(null, "", `#${course.id}`);
      }
    })
  );

  /* Abrir lo que indique la dirección (#asir-2, #dam-1, #dam...) */
  const fromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const course = document.getElementById(id);
    if (course && course.classList.contains("course")) {
      showDegree(course.closest(".degree-panel").dataset.degreePanel);
      openCourse(course, false);
    } else if (panels.some((p) => p.dataset.degreePanel === id)) {
      showDegree(id);
    }
  };

  fromHash();
  window.addEventListener("hashchange", fromHash);
})();

/* Safari en iPhone solo aplica :active al tocar si hay un escuchador táctil */
document.addEventListener("touchstart", () => {}, { passive: true });
