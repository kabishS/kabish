/* ── Preloader ── */
(function () {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;

    const MIN_DISPLAY_TIME = 900; // ms, so it never just flashes on fast connections
    const shownAt = Date.now();

    function hidePreloader() {
        const elapsed = Date.now() - shownAt;
        const remaining = Math.max(MIN_DISPLAY_TIME - elapsed, 0);
        setTimeout(() => preloader.classList.add("loaded"), remaining);
    }

    // 'load' fires only once ALL resources (images, fonts, scripts) are done —
    // on a slow connection this naturally takes longer, no faking needed.
    if (document.readyState === "complete") {
        hidePreloader();
    } else {
        window.addEventListener("load", hidePreloader);
    }

    // Safety net: if something (e.g. a slow third-party script) never fires
    // 'load', don't trap the visitor behind the preloader forever.
    setTimeout(hidePreloader, 8000);
})();

document.getElementById("current-year").textContent = new Date().getFullYear();

/* ── Mobile Menu (fixed full-screen overlay) ── */
const navToggle = document.getElementById("mobile-menu-button");
const navList   = document.getElementById("main-nav");
const navClose  = document.getElementById("mobile-menu-close");

function openMobileMenu() {
    navList.classList.add("is-open");
    navToggle.classList.add("is-open");
    navClose.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close navigation menu");
    document.body.classList.add("menu-open");
}

function closeMobileMenu() {
    navList.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navClose.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("menu-open");
}

function toggleMobileMenu() {
    if (navList.classList.contains("is-open")) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

navToggle.addEventListener("click", toggleMobileMenu);
navClose.addEventListener("click", closeMobileMenu);

// Close when a nav link is tapped
navList.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", closeMobileMenu);
});

// Close on Escape
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navList.classList.contains("is-open")) {
        closeMobileMenu();
    }
});

// Close automatically if the viewport grows back to desktop width
window.addEventListener("resize", () => {
    if (window.innerWidth >= 768 && navList.classList.contains("is-open")) {
        closeMobileMenu();
    }
});

/* ── Smooth Scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        e.preventDefault();
        const header = document.querySelector(".site-header");
        const headerOffset = header ? header.offsetHeight : 0;
        const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset - 20;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        closeMobileMenu();
    });
});

/* ── Fade-in on scroll ── */
const faders = document.querySelectorAll(".fade-in");
const appearOnScroll = new IntersectionObserver(function (entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
    });
}, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

faders.forEach((fader, index) => {
    if (fader.parentElement.classList.contains("row")) {
        fader.style.transitionDelay = `${(index % 6) * 50}ms`;
    }
    appearOnScroll.observe(fader);
});

/* ── Typewriter ── */
const roleTextElement = document.getElementById("role-text");
const roles = ["Software Engineer", "Frontend Developer", "Backend Engineer"];
let roleIndex = 0, charIndex = 0, isDeleting = false;
const typingSpeed = 150;

function typeWriter() {
    const currentRole = roles[roleIndex];
    if (isDeleting) {
        roleTextElement.textContent = currentRole.substring(0, charIndex--);
    } else {
        roleTextElement.textContent = currentRole.substring(0, charIndex++);
    }
    let currentTypingSpeed = typingSpeed;
    if (isDeleting) currentTypingSpeed /= 2;
    if (!isDeleting && charIndex === currentRole.length + 1) {
        currentTypingSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === -1) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        currentTypingSpeed = 500;
    }
    setTimeout(typeWriter, currentTypingSpeed);
}
document.addEventListener("DOMContentLoaded", typeWriter);

/* ── Certificate Modal (event delegation, no inline onclick) ── */
const certModal    = document.getElementById("cert-modal");
const certModalImg = document.getElementById("cert-modal-img");
const certModalTitle = document.getElementById("cert-modal-title");
const certModalClose = document.getElementById("certModalClose");

function openCertModal(imgSrc, title) {
    certModalImg.src = imgSrc;
    certModalImg.alt = title;
    certModalTitle.textContent = title;
    certModal.classList.add("open");
    document.body.classList.add("menu-open");
}
function closeCertModal() {
    certModal.classList.remove("open");
    document.body.classList.remove("menu-open");
}

document.querySelectorAll(".cert-view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        openCertModal(btn.dataset.certImg, btn.dataset.certTitle);
    });
});

certModalClose.addEventListener("click", closeCertModal);
certModal.addEventListener("click", function (e) {
    if (e.target === this) closeCertModal();
});
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeCertModal();
});

/* ── Certificate Carousel ── */
let certIdx      = 0;
const certTotal  = 3;
const certDelay  = 4000;
let certElapsed  = 0;
let certLast     = null;
let certAF;
let certPaused   = false;

const certTrack    = document.getElementById("certTrack");
const certDots     = document.querySelectorAll("#certDots .cert-dot");
const certProgress = document.getElementById("certProgress");
const certPrevBtn  = document.getElementById("certPrev");
const certNextBtn  = document.getElementById("certNext");
const certWrap     = document.querySelector(".cert-carousel-wrap");

function certGo(n) {
    certIdx = ((n % certTotal) + certTotal) % certTotal;
    certTrack.style.transform = "translateX(-" + (certIdx * 100) + "%)";
    certDots.forEach((d, i) => d.classList.toggle("active", i === certIdx));
    certElapsed = 0;
    certProgress.style.width = "0%";
    certLast = null;
}

function certTick(ts) {
    if (!certPaused) {
        if (!certLast) certLast = ts;
        certElapsed += ts - certLast;
        certLast = ts;
        const pct = Math.min((certElapsed / certDelay) * 100, 100);
        certProgress.style.width = pct + "%";
        if (certElapsed >= certDelay) certGo(certIdx + 1);
    } else {
        certLast = ts;
    }
    certAF = requestAnimationFrame(certTick);
}
certAF = requestAnimationFrame(certTick);

certPrevBtn.addEventListener("click", () => certGo(certIdx - 1));
certNextBtn.addEventListener("click", () => certGo(certIdx + 1));
certDots.forEach(dot => {
    dot.addEventListener("click", () => certGo(parseInt(dot.dataset.idx, 10)));
});

// Pause autoplay while hovering/focusing the carousel
if (certWrap) {
    certWrap.addEventListener("mouseenter", () => certPaused = true);
    certWrap.addEventListener("mouseleave", () => certPaused = false);
}

/* ── Contact Form ── */
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("form-message");

contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    formMessage.textContent = "Sending message...";
    formMessage.className = "form-status pending";
    const formData = new FormData(contactForm);
    try {
        const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
        const result   = await response.json();
        if (result.success) {
            formMessage.textContent = "Message sent successfully! Thank you for reaching out.";
            formMessage.className   = "form-status success";
            contactForm.reset();
        } else {
            formMessage.textContent = "Failed to send message. Please try again.";
            formMessage.className   = "form-status error";
        }
    } catch (error) {
        formMessage.textContent = "Something went wrong. Please try again later.";
        formMessage.className   = "form-status error";
    }
});

/* Focus-glow on contact icons */
document.querySelectorAll('.field-group input, .field-group textarea').forEach(el => {
    el.addEventListener('focus', function() {
        const icon = this.parentElement.querySelector('.field-icon, .textarea-icon');
        if (icon) icon.style.color = 'var(--accent-lime)';
    });
    el.addEventListener('blur', function() {
        const icon = this.parentElement.querySelector('.field-icon, .textarea-icon');
        if (icon) icon.style.color = 'var(--text-secondary)';
    });
});

/* ── Tidio: lazy-load so it never blocks first paint/interactivity ──
   Loads after the visitor scrolls/touches/moves the mouse, or after a
   short fallback delay — whichever happens first. Keeps Tidio fully
   functional while removing it from the critical render path. */
(function loadTidioLazily() {
    let tidioLoaded = false;

    function injectTidio() {
        if (tidioLoaded) return;
        tidioLoaded = true;
        const script = document.createElement("script");
        script.src = "//code.tidio.co/1ecdniecfvgzqolltjbpslhthzzcosn3.js";
        script.async = true;
        document.body.appendChild(script);
        ["scroll", "mousemove", "touchstart", "keydown"].forEach(evt =>
            window.removeEventListener(evt, injectTidio)
        );
    }

    ["scroll", "mousemove", "touchstart", "keydown"].forEach(evt =>
        window.addEventListener(evt, injectTidio, { passive: true, once: true })
    );

    // Fallback: load anyway after 5s if the visitor never interacts
    setTimeout(injectTidio, 5000);
})();
