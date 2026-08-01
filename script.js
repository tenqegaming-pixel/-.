const MODRINTH_URL = "https://modrinth.com/plugin/custom-items-";
const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => [
  ...parent.querySelectorAll(selector),
];

qsa('a[href*="modrinth.com"]').forEach((link) => {
  link.href = MODRINTH_URL;
});

window.addEventListener("load", () => document.body.classList.add("is-ready"), {
  once: true,
});

const header = qs("[data-header]");
const progressBar = qs(".page-progress span");
const updateScrollUi = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  header?.classList.toggle("is-scrolled", window.scrollY > 35);
  if (progressBar) progressBar.style.width = `${progress * 100}%`;
};
updateScrollUi();
window.addEventListener("scroll", updateScrollUi, { passive: true });

const menuButton = qs(".menu-button");
const menuPanel = qs(".menu-panel");
const setMenu = (open) => {
  menuButton?.setAttribute("aria-expanded", String(open));
  menuPanel?.setAttribute("aria-hidden", String(!open));
  menuPanel?.classList.toggle("is-open", open);
  if (menuPanel) menuPanel.inert = !open;
  document.body.classList.toggle("menu-open", open);
};
menuButton?.addEventListener("click", () =>
  setMenu(menuButton.getAttribute("aria-expanded") !== "true"),
);
qsa("a", menuPanel).forEach((link) =>
  link.addEventListener("click", () => setMenu(false)),
);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -6%" },
);
qsa(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${(index % 4) * 65}ms`;
  revealObserver.observe(element);
});

const cursorDot = qs(".cursor-dot");
const cursorRing = qs(".cursor-ring");
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  let x = -100;
  let y = -100;
  let ringX = -100;
  let ringY = -100;
  window.addEventListener("pointermove", (event) => {
    x = event.clientX;
    y = event.clientY;
    cursorDot.style.opacity = "1";
    cursorRing.style.opacity = "1";
    cursorDot.style.transform = `translate(${x - 3}px, ${y - 3}px)`;
  });
  const animateCursor = () => {
    ringX += (x - ringX) * 0.16;
    ringY += (y - ringY) * 0.16;
    cursorRing.style.transform = `translate(${ringX - 17}px, ${ringY - 17}px)`;
    requestAnimationFrame(animateCursor);
  };
  animateCursor();
  qsa("a, button").forEach((element) => {
    element.addEventListener("pointerenter", () =>
      cursorRing.classList.add("is-hovering"),
    );
    element.addEventListener("pointerleave", () =>
      cursorRing.classList.remove("is-hovering"),
    );
  });
  qsa(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      element.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * 0.08}px, ${(event.clientY - rect.top - rect.height / 2) * 0.1}px)`;
    });
    element.addEventListener("pointerleave", () => {
      element.style.transform = "translate(0, 0)";
    });
  });
}

const heroMedia = qs("[data-parallax]");
if (
  heroMedia &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  window.addEventListener(
    "pointermove",
    (event) => {
      if (window.scrollY > window.innerHeight) return;
      heroMedia.style.transform = `translate3d(${(event.clientX / window.innerWidth - 0.5) * 14}px, ${(event.clientY / window.innerHeight - 0.5) * 10}px, 0) scale(1.02)`;
    },
    { passive: true },
  );
}

const rollSection = qs("[data-roll]");
const rollSteps = qsa(".rift-run__steps span");
const updateRoll = () => {
  if (!rollSection) return;
  const rect = rollSection.getBoundingClientRect();
  const distance = Math.max(1, rollSection.offsetHeight - window.innerHeight);
  const value = Math.max(0, Math.min(1, -rect.top / distance));
  rollSection.style.setProperty("--roll", value.toFixed(4));
  const activeIndex = Math.min(2, Math.floor(value * 3));
  rollSteps.forEach((step, index) =>
    step.classList.toggle("is-active", index === activeIndex),
  );
};
updateRoll();
window.addEventListener("scroll", updateRoll, { passive: true });
window.addEventListener("resize", updateRoll);

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  qsa("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -5;
      const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

const audio = qs("#site-audio");
const soundButton = qs("[data-sound]");
const soundLabel = qs("[data-sound-label]");
if (audio && soundButton) {
  audio.volume = 0.26;
  soundButton.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        return;
      }
      soundButton.classList.add("is-playing");
      soundButton.setAttribute("aria-pressed", "true");
      soundButton.setAttribute("aria-label", "Pause background music");
      soundLabel.textContent = "Sound on";
    } else {
      audio.pause();
      soundButton.classList.remove("is-playing");
      soundButton.setAttribute("aria-pressed", "false");
      soundButton.setAttribute("aria-label", "Play background music");
      soundLabel.textContent = "Sound off";
    }
  });
}

const toast = qs(".toast");
let toastTimer;
qsa("[data-copy]").forEach((button) =>
  button.addEventListener("click", async () => {
    const command = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      const input = document.createElement("textarea");
      input.value = command;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    const label = qs("i", button);
    const original = label.textContent;
    label.textContent = "Copied";
    toast.textContent = `${command} copied`;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
      label.textContent = original;
    }, 1800);
  }),
);
