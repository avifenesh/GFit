// GFit site behavior: nav state, mobile bar, goal chips, contact form, analytics.
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav');
  const bar = document.getElementById('bar');
  const hero = document.querySelector('.hero');
  const contact = document.getElementById('contact');

  // Nav border once scrolled.
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile bar: visible after the hero, hidden while the contact section is on screen.
  let heroVisible = true;
  let contactVisible = false;
  const syncBar = () => bar.classList.toggle('show', !heroVisible && !contactVisible);
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; syncBar(); }).observe(hero);
  new IntersectionObserver(([e]) => { contactVisible = e.isIntersecting; syncBar(); }).observe(contact);

  // Analytics (GoatCounter events).
  const track = (path, title) => {
    if (window.goatcounter && window.goatcounter.count) {
      window.goatcounter.count({ path, title: title || path, event: true });
    }
  };
  document.querySelectorAll('[data-track]').forEach((el) =>
    el.addEventListener('click', () => track('click-' + el.dataset.track)));
  
  // Goal chips fill the goal field.
  const goal = document.getElementById('goal');
  const chips = document.querySelectorAll('.chips button');
  chips.forEach((chip) => {
    chip.setAttribute('aria-pressed', 'false');
    chip.addEventListener('click', () => {
      const on = chip.getAttribute('aria-pressed') !== 'true';
      chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', String(on));
      goal.value = on ? chip.dataset.goal : '';
    });
  });
  goal.addEventListener('input', () => chips.forEach((c) => c.setAttribute('aria-pressed', 'false')));

  // Contact form, sent by email through Web3Forms.
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const submit = form.querySelector('button[type="submit"]');
  const label = submit.textContent;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const field = (n) => form.elements.namedItem(n);
    const name = field('name').value.trim();
    const phone = field('phone').value.trim();
    const goalText = field('goal').value.trim();

    field('name').classList.toggle('invalid', !name);
    const phoneOk = phone.replace(/\D/g, '').length >= 9;
    field('phone').classList.toggle('invalid', !phoneOk);
    status.className = 'form-status';
    if (!name || !phoneOk) {
      status.textContent = !name ? 'נשאר רק למלא שם' : 'נראה שמספר הטלפון חסר או לא מלא';
      status.classList.add('err');
      return;
    }

    track('form-submit');
    submit.disabled = true;
    submit.textContent = 'שולח...';
    status.textContent = '';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: 'f210c554-d4ac-4f15-950b-b8cc0c3bf968',
          subject: `פנייה חדשה מ-${name} - GFit`,
          from_name: 'GFit Website',
          name,
          phone,
          goal: goalText || 'לא צוין',
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
      status.textContent = 'תודה! קיבלתי, ואחזור אליכם בקרוב.';
      status.classList.add('ok');
      track('form-success');
    } catch (_) {
      status.textContent = 'משהו השתבש בשליחה. נסו שוב או שלחו הודעה בוואטסאפ.';
      status.classList.add('err');
    } finally {
      submit.disabled = false;
      submit.textContent = label;
    }
  });

  // Scroll depth, once per mark.
  const marks = [25, 50, 75, 100];
  const fired = new Set();
  window.addEventListener('scroll', () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    if (max <= 0) return;
    const pct = (window.scrollY / max) * 100;
    marks.forEach((m) => {
      if (pct >= m - 1 && !fired.has(m)) { fired.add(m); track('scroll-' + m); }
    });
  }, { passive: true });
});
