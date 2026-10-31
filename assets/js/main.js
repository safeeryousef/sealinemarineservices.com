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

// Footer year
document.getElementById('yr').textContent = new Date().getFullYear();

const isArabic = document.documentElement.lang === 'ar';

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

// Enquiry form: static hosting has no mail server, so hand the message to WhatsApp or the email app
const form = document.getElementById('enquiry');
if (form) {
  let via = 'whatsapp';
  form.querySelectorAll('button[data-via]').forEach(b => b.addEventListener('click', () => { via = b.dataset.via; }));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form);
    const text = isArabic
      ? `مرحباً سي لاين مارين،\n\nالاسم: ${d.get('name')}\nالهاتف: ${d.get('phone') || '-'}\nالخدمة: ${d.get('service')}\n\n${d.get('message')}`
      : `Hello Sea Line Marine,\n\nName: ${d.get('name')}\nPhone: ${d.get('phone') || '-'}\nService: ${d.get('service')}\n\n${d.get('message')}`;
    if (via === 'email') {
      const subject = (isArabic ? 'استفسار من الموقع – ' : 'Website enquiry – ') + d.get('service');
      location.href = `mailto:sales@sealinemarineservices.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    } else {
      window.open(`https://wa.me/971502045797?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    }
  });
}
