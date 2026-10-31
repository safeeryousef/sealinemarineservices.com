// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.menu');
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  toggle.setAttribute('aria-expanded', false);
}));

// Services dropdown: click/tap toggles it (hover also opens it on desktop via CSS)
document.querySelectorAll('.has-sub').forEach(sub => {
  const btn = sub.querySelector('.sub-toggle');
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = sub.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  sub.addEventListener('keydown', e => {
    if (e.key === 'Escape') { sub.classList.remove('open'); btn.setAttribute('aria-expanded', false); btn.focus(); }
  });
});
document.addEventListener('click', e => {
  document.querySelectorAll('.has-sub.open').forEach(sub => {
    if (!sub.contains(e.target)) { sub.classList.remove('open'); sub.querySelector('.sub-toggle').setAttribute('aria-expanded', false); }
  });
});

// Footer year
document.getElementById('yr').textContent = new Date().getFullYear();

const isArabic = document.documentElement.lang === 'ar';

// Hero video: only on larger screens, and never when the visitor prefers reduced motion or saves data
const heroVideo = document.querySelector('.hero-video');
if (heroVideo
  && matchMedia('(min-width: 768px)').matches
  && !matchMedia('(prefers-reduced-motion: reduce)').matches
  && !(navigator.connection && navigator.connection.saveData)) {
  [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(([key, type]) => {
    const s = document.createElement('source');
    s.src = heroVideo.dataset[key];
    s.type = type;
    heroVideo.appendChild(s);
  });
  heroVideo.addEventListener('playing', () => heroVideo.classList.add('playing'), { once: true });
  heroVideo.load();
  heroVideo.play().catch(() => {});
}

// 3D boat scene: load three.js + the scene only on larger screens, once the rentals banner is near the viewport
const scene3d = document.querySelector('[data-scene3d]');
if (scene3d
  && matchMedia('(min-width: 981px)').matches
  && !matchMedia('(prefers-reduced-motion: reduce)').matches
  && 'IntersectionObserver' in window) {
  const loadScript = src => new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = src; s.onload = ok; s.onerror = fail;
    document.head.appendChild(s);
  });
  const watch = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    watch.disconnect();
    loadScript('https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js')
      .then(() => loadScript('/assets/js/scene3d.js?v=13'))
      .catch(() => {});
  }, { rootMargin: '300px' });
  watch.observe(scene3d);
}

// Reveal on scroll
const revealEls = document.querySelectorAll('.tile, .steps li, .svc-list li, .ci, .mv > div, .incl li');
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js');
  revealEls.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));
}

// Our Work lightbox
const lb = document.getElementById('lightbox');
if (lb) {
  const shots = [...document.querySelectorAll('.gallery .g')];
  const lbImg = lb.querySelector('img');
  const lbCap = lb.querySelector('figcaption');
  let shot = 0;
  const showShot = i => {
    shot = (i + shots.length) % shots.length;
    const g = shots[shot];
    lbImg.src = g.dataset.full;
    lbImg.alt = g.querySelector('img').alt;
    lbCap.textContent = g.querySelector('span').textContent;
  };
  // In RTL the "previous" arrow sits on the right, so arrow keys follow screen direction
  const step = isArabic ? -1 : 1;
  shots.forEach((g, i) => g.addEventListener('click', () => { showShot(i); lb.showModal(); }));
  lb.querySelector('.lb-close').addEventListener('click', () => lb.close());
  lb.querySelector('.lb-prev').addEventListener('click', () => showShot(shot - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => showShot(shot + 1));
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') showShot(shot - step);
    if (e.key === 'ArrowRight') showShot(shot + step);
  });
}

// Enquiry form: "Send Enquiry" posts to FormSubmit, which emails sales@ (static hosting has no mail server);
// the WhatsApp button hands the same message to WhatsApp instead.
const SALES = 'sales@sealinemarineservices.com';
const form = document.getElementById('enquiry');
if (form) {
  const status = document.getElementById('form-status');
  const sendBtn = form.querySelector('button[data-via="email"]');
  const t = isArabic
    ? { sending: 'جارٍ الإرسال…', ok: 'شكراً! تم إرسال استفسارك وسنتواصل معك قريباً.', fail: 'تعذّر الإرسال. يرجى مراسلتنا عبر واتساب أو على ' + SALES }
    : { sending: 'Sending…', ok: 'Thank you! Your enquiry has been sent – we\'ll get back to you shortly.', fail: 'Sorry, it could not be sent. Please WhatsApp us or email ' + SALES };
  let via = 'email';
  form.querySelectorAll('button[data-via]').forEach(b => b.addEventListener('click', () => { via = b.dataset.via; }));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const d = new FormData(form);
    if (d.get('_honey')) return;
    const text = isArabic
      ? `مرحباً سي لاين مارين،\n\nالاسم: ${d.get('name')}\nالهاتف: ${d.get('phone') || '-'}\nالخدمة: ${d.get('service')}\n\n${d.get('message')}`
      : `Hello Sea Line Marine,\n\nName: ${d.get('name')}\nPhone: ${d.get('phone') || '-'}\nService: ${d.get('service')}\n\n${d.get('message')}`;
    if (via === 'whatsapp') {
      window.open(`https://wa.me/971502045797?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      return;
    }
    status.className = 'form-note';
    status.textContent = t.sending;
    sendBtn.disabled = true;
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${SALES}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `Website enquiry – ${d.get('service')}${isArabic ? ' (Arabic site)' : ''}`,
          _template: 'table',
          _replyto: d.get('email') || undefined,
          Name: d.get('name'),
          Phone: d.get('phone'),
          Email: d.get('email') || '-',
          Service: d.get('service'),
          Message: d.get('message'),
          Page: location.href,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== 'true') throw new Error(json.message || res.status);
      form.reset();
      status.className = 'form-note ok';
      status.textContent = t.ok;
    } catch (err) {
      status.className = 'form-note err';
      status.textContent = t.fail;
    } finally {
      sendBtn.disabled = false;
    }
  });
}
