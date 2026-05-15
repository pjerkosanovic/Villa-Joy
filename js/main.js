'use strict';

/* --- Navbar scroll --- */
const navbar   = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* --- Mobile nav toggle --- */
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* --- Smooth scroll (supplement CSS for older browsers) --- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});

/* --- Hero slideshow --- */
const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
const heroDots   = Array.from(document.querySelectorAll('.hero-dot'));
let heroIdx = 0;
let heroTimer;

function showHeroSlide(n) {
  heroSlides[heroIdx].classList.remove('active');
  heroDots[heroIdx].classList.remove('active');
  heroIdx = ((n % heroSlides.length) + heroSlides.length) % heroSlides.length;
  heroSlides[heroIdx].classList.add('active');
  heroDots[heroIdx].classList.add('active');
}

function startHeroAuto() {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => showHeroSlide(heroIdx + 1), 5500);
}

heroDots.forEach((dot, i) => {
  dot.addEventListener('click', () => { showHeroSlide(i); startHeroAuto(); });
});

startHeroAuto();

/* --- Apartment sliders --- */
document.querySelectorAll('.apt-slider').forEach(slider => {
  const track = slider.querySelector('.apt-slides');
  const items = slider.querySelectorAll('.apt-slide');
  const dots  = Array.from(slider.querySelectorAll('.slider-dot'));
  let cur = 0;

  function goTo(n) {
    cur = ((n % items.length) + items.length) % items.length;
    track.style.transform = `translateX(-${cur * slider.offsetWidth}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === cur));
  }

  slider.querySelector('.slider-prev').addEventListener('click', e => { e.stopPropagation(); goTo(cur - 1); });
  slider.querySelector('.slider-next').addEventListener('click', e => { e.stopPropagation(); goTo(cur + 1); });
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  let touchX = 0;
  slider.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const dx = touchX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) goTo(cur + (dx > 0 ? 1 : -1));
  }, { passive: true });
});

/* --- Apartment quick-select from "Inquire about X" buttons --- */
document.querySelectorAll('.apt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const aptSelect = document.getElementById('apartment');
    if (aptSelect) aptSelect.value = btn.dataset.apt || '';
  });
});

/* --- Date inputs min values --- */
const checkinEl  = document.getElementById('checkin');
const checkoutEl = document.getElementById('checkout');
const today      = new Date().toISOString().split('T')[0];
checkinEl.min    = today;
checkoutEl.min   = today;

checkinEl.addEventListener('change', () => {
  if (checkoutEl.value && checkoutEl.value <= checkinEl.value) {
    checkoutEl.value = '';
  }
  checkoutEl.min = checkinEl.value || today;
});

/* --- Booking form --- */
const bookingForm = document.getElementById('bookingForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn   = document.getElementById('submitBtn');

const requiredFields = ['firstName', 'lastName', 'email', 'apartment', 'checkin', 'checkout', 'guests'];

requiredFields.forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    document.getElementById(id).classList.remove('error');
  });
});

function validateEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

bookingForm.addEventListener('submit', e => {
  e.preventDefault();

  let valid = true;
  requiredFields.forEach(id => {
    const el = document.getElementById(id);
    const empty = !el.value.trim();
    const badEmail = id === 'email' && !empty && !validateEmail(el.value);
    if (empty || badEmail) {
      el.classList.add('error');
      valid = false;
    }
  });

  if (!valid) {
    const firstErr = bookingForm.querySelector('.error');
    firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstErr?.focus();
    return;
  }

  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  /* Simulated async submit — replace with real fetch() call */
  setTimeout(() => {
    formSuccess.classList.add('visible');
    formSuccess.focus();
  }, 900);
});

/* --- Intersection Observer: fade-in on scroll --- */
const fadeTargets = document.querySelectorAll(
  '.amenity-card, .about-grid, .location-grid, .contact-card, .stat'
);

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeTargets.forEach(el => {
  el.style.opacity  = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .6s ease, transform .6s ease';
  fadeObserver.observe(el);
});

document.head.insertAdjacentHTML('beforeend', `
  <style>
    .fade-in {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
    .amenity-card.fade-in { transition-delay: calc(var(--i, 0) * 60ms); }
  </style>
`);

/* stagger amenity cards */
document.querySelectorAll('.amenity-card').forEach((el, i) => {
  el.style.setProperty('--i', i);
});
