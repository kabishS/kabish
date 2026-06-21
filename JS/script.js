  document.getElementById("current-year").textContent = new Date().getFullYear();
 
/* ── Mobile Menu ── */
const mobileMenuButton      = document.getElementById("mobile-menu-button");
const mobileMenuOverlay     = document.getElementById("mobile-menu-overlay");
const closeMobileMenuButton = document.getElementById("close-mobile-menu");
 
function toggleMobileMenu() {
    mobileMenuOverlay.classList.toggle("hidden");
    document.body.classList.toggle("overflow-hidden");
}
function closeMobileMenu() {
    mobileMenuOverlay.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
}
 
mobileMenuButton.addEventListener("click", toggleMobileMenu);
closeMobileMenuButton.addEventListener("click", closeMobileMenu);
mobileMenuOverlay.addEventListener("click", (e) => {
    if (e.target === mobileMenuOverlay) closeMobileMenu();
});
 
/* ── Smooth Scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);
        const headerOffset = document.querySelector("header").offsetHeight;
        if (targetElement) {
            const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset - 20;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
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
    if (fader.parentElement.classList.contains("grid")) {
        fader.style.transitionDelay = `${index * 50}ms`;
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
 
/* ── Certificate Modal ── */
function openCertModal(imgSrc, title) {
    document.getElementById("cert-modal-img").src           = imgSrc;
    document.getElementById("cert-modal-img").alt           = title;
    document.getElementById("cert-modal-title").textContent = title;
    document.getElementById("cert-modal").classList.add("open");
    document.body.classList.add("overflow-hidden");
}
function closeCertModal() {
    document.getElementById("cert-modal").classList.remove("open");
    document.body.classList.remove("overflow-hidden");
}
document.getElementById("cert-modal").addEventListener("click", function(e) {
    if (e.target === this) closeCertModal();
});
document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") closeCertModal();
});
 
/* ── Certificate Carousel ── */
let certIdx      = 0;
const certTotal  = 3;
const certDelay  = 2000;
let certElapsed  = 0;
let certLast     = null;
let certAF;
 
const certTrack    = document.getElementById("certTrack");
const certDots     = document.querySelectorAll("#certDots .cert-dot");
const certProgress = document.getElementById("certProgress");
 
function certGo(n) {
    certIdx = ((n % certTotal) + certTotal) % certTotal;
    certTrack.style.transform = "translateX(-" + (certIdx * 100) + "%)";
    certDots.forEach((d, i) => d.classList.toggle("active", i === certIdx));
    certElapsed = 0;
    certProgress.style.width = "0%";
    certLast = null;
}
 
function certTick(ts) {
    if (!certLast) certLast = ts;
    certElapsed += ts - certLast;
    certLast = ts;
    const pct = Math.min((certElapsed / certDelay) * 100, 100);
    certProgress.style.width = pct + "%";
    if (certElapsed >= certDelay) certGo(certIdx + 1);
    certAF = requestAnimationFrame(certTick);
}
certAF = requestAnimationFrame(certTick);
 
/* ── Contact Form ── */
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("form-message");
 
contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    formMessage.textContent = "Sending message...";
    formMessage.className = "text-center text-sm font-medium text-text-secondary";
    const formData = new FormData(contactForm);
    try {
        const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
        const result   = await response.json();
        if (result.success) {
            formMessage.textContent = "Message sent successfully! Thank you for reaching out.";
            formMessage.className   = "text-center text-sm font-medium text-lime-400";
            contactForm.reset();
        } else {
            formMessage.textContent = "Failed to send message. Please try again.";
            formMessage.className   = "text-center text-sm font-medium text-red-500";
        }
    } catch (error) {
        formMessage.textContent = "Something went wrong. Please try again later.";
        formMessage.className   = "text-center text-sm font-medium text-red-500";
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