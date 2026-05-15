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

/* --- Gallery lightbox --- */
const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox     = document.getElementById('lightbox');
const lbImg        = document.getElementById('lbImg');
const lbCaption    = document.getElementById('lbCaption');
const lbClose      = document.getElementById('lbClose');
const lbPrev       = document.getElementById('lbPrev');
const lbNext       = document.getElementById('lbNext');

const galleryData = galleryItems.map(item => ({
  src:     item.querySelector('img').src,
  alt:     item.querySelector('img').alt,
  caption: item.querySelector('.gi-overlay span')?.textContent ?? '',
}));

let currentIdx = 0;

function openLightbox(index) {
  currentIdx = index;
  setLightboxImage(index);
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function setLightboxImage(index) {
  lbImg.src        = galleryData[index].src;
  lbImg.alt        = galleryData[index].alt;
  lbCaption.textContent = galleryData[index].caption;
}

function navigate(dir) {
  currentIdx = (currentIdx + dir + galleryData.length) % galleryData.length;
  setLightboxImage(currentIdx);
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(i); });
});

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
lbPrev.addEventListener('click', e => { e.stopPropagation(); navigate(-1); });
lbNext.addEventListener('click', e => { e.stopPropagation(); navigate(1); });

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   navigate(-1);
  if (e.key === 'ArrowRight')  navigate(1);
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
  '.amenity-card, .gallery-item, .about-grid, .location-grid, .contact-card, .stat'
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
