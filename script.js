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
