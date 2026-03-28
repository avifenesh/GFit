// ============================================
// GFit - Website Scripts
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Navbar scroll effect & Sticky CTA & WhatsApp visibility ---
  const navbar = document.getElementById('navbar');
  const stickyCta = document.getElementById('stickyCta');
  const contactSection = document.getElementById('contact');
  const waFloat = document.querySelector('.whatsapp-float');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    const contactTop = contactSection.getBoundingClientRect().top;
    const pastHero = currentScroll > window.innerHeight * 0.8;
    const nearContact = contactTop < window.innerHeight;

    // Show sticky CTA after hero, hide near contact
    if (stickyCta) {
      stickyCta.classList.toggle('visible', pastHero && !nearContact);
    }

    // Hide WhatsApp float near contact section
    if (waFloat) {
      waFloat.style.opacity = nearContact ? '0' : '';
      waFloat.style.pointerEvents = nearContact ? 'none' : '';
    }

    lastScroll = currentScroll;
  }, { passive: true });

  // --- Hamburger menu ---
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // --- Scroll reveal animations ---
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- FAQ accordion ---
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
      // Toggle clicked
      if (!isOpen) item.classList.add('open');
      btn.setAttribute('aria-expanded', !isOpen);
    });
  });

  // --- Smooth scroll for nav links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- Contact form → Email (Web3Forms) + WhatsApp ---
  const form = document.getElementById('contactForm');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();

    // Send to email via Web3Forms
    submitBtn.disabled = true;
    submitBtn.textContent = 'שולח...';

    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'f210c554-d4ac-4f15-950b-b8cc0c3bf968',
          subject: `פנייה חדשה מ-${name} - GFit`,
          from_name: 'GFit Website',
          name,
          phone,
          message
        })
      });
    } catch (_) {
      // Email send failed silently — WhatsApp still opens
    }

    // Also open WhatsApp
    let waMessage = `היי גד, אשמח לשיחת ייעוץ\n`;
    waMessage += `שם: ${name}\n`;
    if (phone) waMessage += `טלפון: ${phone}\n`;
    if (message) waMessage += `\n${message}`;

    const waNumber = '9720556624880';
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

    window.open(waUrl, '_blank');
    submitBtn.disabled = false;
    submitBtn.textContent = 'לתיאום שיחת ייעוץ';
  });

  // --- Testimonials Carousel ---
  const carousel = document.getElementById('testimonialCarousel');
  if (carousel) {
    const track = document.getElementById('carouselTrack');
    const slides = track.querySelectorAll('.carousel-slide');
    const dotsContainer = document.getElementById('carouselDots');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const total = slides.length;
    let current = 0;
    let autoTimer = null;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `המלצה ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    function goTo(index) {
      current = ((index % total) + total) % total;
      track.style.transform = `translateX(${current * 100}%)`;
      dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
      resetAuto();
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Auto-play
    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    }
    resetAuto();

    // Pause on hover
    carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
    carousel.addEventListener('mouseleave', resetAuto);

    // Touch swipe
    let startX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      clearInterval(autoTimer);
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        // RTL: swipe directions are inverted
        goTo(diff < 0 ? current - 1 : current + 1);
      }
      isDragging = false;
      resetAuto();
    }, { passive: true });
  }

  // --- Active nav link on scroll ---
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === `#${current}`) {
        link.style.color = '#fff';
      }
    });
  }, { passive: true });

});
