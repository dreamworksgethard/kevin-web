const navToggle = document.querySelector(".nav-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const nav = document.querySelector(".nav");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (navToggle && mobileMenu) {
  const setOpen = (open) => {
    mobileMenu.hidden = !open;
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };

  navToggle.addEventListener("click", () => {
    setOpen(mobileMenu.hidden);
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });
}

/* Nav background once the page leaves the top */
let navScrolled = false;
let ticking = false;

const onScrollFrame = () => {
  const scrolled = window.scrollY > 40;
  if (nav && scrolled !== navScrolled) {
    nav.classList.toggle("scrolled", scrolled);
    navScrolled = scrolled;
  }
  ticking = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      requestAnimationFrame(onScrollFrame);
      ticking = true;
    }
  },
  { passive: true }
);

onScrollFrame();

/* Bidirectional reveal effects */
const revealPlan = [
  { selector: ".section-inner > .eyebrow", variant: "reveal-up", delay: 0 },
  { selector: ".section-inner > h2", variant: "reveal-up", delay: 1 },
  { selector: ".section-inner > .lead", variant: "reveal-up", delay: 2 },
  { selector: ".about-block", variant: "reveal-up", stagger: true },
  { selector: ".video-block", variant: "reveal-scale", delay: 1 },
  { selector: ".stat", variant: "reveal-up", stagger: true },
  { selector: ".token-ctas", variant: "reveal-up", delay: 1 },
  { selector: ".token-visual", variant: "reveal-scale", delay: 1 },
  { selector: ".token-note", variant: "reveal-up", delay: 2 },
  { selector: ".token-links", variant: "reveal-up", delay: 3 },
  { selector: ".footer img", variant: "reveal-scale", delay: 0 },
  { selector: ".footer p", variant: "reveal-up", stagger: true },
];

const revealEls = [];

revealPlan.forEach(({ selector, variant, delay = 0, stagger = false }) => {
  document.querySelectorAll(selector).forEach((el, index) => {
    el.classList.add("reveal", variant);
    const d = stagger ? Math.min(index + 1, 5) : delay;
    if (d > 0) el.classList.add(`reveal-delay-${d}`);
    revealEls.push(el);
  });
});

if (!prefersReducedMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

/* Light hover tilt. One frame at a time so pointer moves stay cheap. */
if (!prefersReducedMotion) {
  document.querySelectorAll("[data-tilt]").forEach((cardWrap) => {
    const card = cardWrap.querySelector(".about-card");
    if (!card) return;

    const maxTilt = 8;
    let frame = 0;
    let rect = null;
    let px = 0.5;
    let py = 0.5;

    cardWrap.addEventListener("pointerenter", () => {
      rect = cardWrap.getBoundingClientRect();
    });

    cardWrap.addEventListener("pointermove", (event) => {
      if (!rect) rect = cardWrap.getBoundingClientRect();
      px = (event.clientX - rect.left) / rect.width;
      py = (event.clientY - rect.top) / rect.height;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const tiltY = (px - 0.5) * maxTilt * 2;
        const tiltX = (0.5 - py) * maxTilt * 2;
        card.style.transform = `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
      });
    });

    cardWrap.addEventListener("pointerleave", () => {
      rect = null;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      card.style.transform = "";
    });
  });
}

/* Third-party players stay unloaded until their section is near the screen. */
const embedObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const frame = entry.target;
      if (frame.dataset.src) frame.src = frame.dataset.src;
      embedObserver.unobserve(frame);
    });
  },
  { rootMargin: "160px 0px" }
);

document.querySelectorAll("iframe[data-src]").forEach((frame) => {
  embedObserver.observe(frame);
});
