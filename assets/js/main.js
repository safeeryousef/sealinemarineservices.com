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

// Reveal on scroll
const revealEls = document.querySelectorAll('.card, .tile, .strip-grid > div, .ci, .split > *, .mv > div');
if ('IntersectionObserver' in window) {
  revealEls.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));
}

// Enquiry form: static hosting has no mail server, so hand the message to WhatsApp or the email app
const form = document.getElementById('enquiry');
let via = 'whatsapp';
form.querySelectorAll('button[data-via]').forEach(b => b.addEventListener('click', () => { via = b.dataset.via; }));
form.addEventListener('submit', e => {
  e.preventDefault();
  const d = new FormData(form);
  const text = `Hello Sea Line Marine,\n\nName: ${d.get('name')}\nPhone: ${d.get('phone') || '-'}\nService: ${d.get('service')}\n\n${d.get('message')}`;
  if (via === 'email') {
    location.href = `mailto:sales@sealinemarineservices.com?subject=${encodeURIComponent('Website enquiry – ' + d.get('service'))}&body=${encodeURIComponent(text)}`;
  } else {
    window.open(`https://wa.me/971502045797?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  }
});
