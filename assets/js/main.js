(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  var header = $('header'), totop = $('totop');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
    totop.classList.toggle('is-on', window.scrollY > 700);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // Menu mobile (bouton Fermer = sortie)
  var burger = $('burger'), nav = $('nav');
  function setNav(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setNav(!nav.classList.contains('is-open')); });
  $('nav-close').addEventListener('click', function () { setNav(false); });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });

  // Apparition au défilement
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add('is-visible'); }); }

  // Lien actif
  var links = nav.querySelectorAll('a[href^="#"]:not(.btn)');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (l) { var s = document.querySelector(l.getAttribute('href')); if (s) spy.observe(s); });
  }

  // Visionneuse des affiches
  var lb = $('lightbox'), lbImg = lb.querySelector('img');
  function closeLb() { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  document.querySelectorAll('.affiches figure').forEach(function (f) {
    f.addEventListener('click', function () {
      var im = f.querySelector('img'); lbImg.src = im.src; lbImg.alt = im.alt;
      lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
    });
  });
  lb.addEventListener('click', closeLb);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });

  // Formulaire de réservation -> WhatsApp (+ copie locale pour l'espace de gestion de démonstration)
  var form = $('book-form'), adrBox = $('f-adr-box'), adr = $('f-adr'), date = $('f-date');
  var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  date.min = today.toISOString().slice(0, 10);
  function syncType() {
    var dom = form.type.value === 'Domicile';
    adrBox.hidden = !dom; adr.required = dom;
  }
  form.querySelectorAll('input[name=type]').forEach(function (r) { r.addEventListener('change', syncType); });
  syncType();
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (f) {
      var v = f.value.trim() !== ''; f.classList.toggle('is-invalid', !v); if (!v) ok = false;
    });
    var note = $('form-note');
    if (!ok) { note.textContent = 'Merci de compléter les champs obligatoires.'; return; }
    var d = new FormData(form);
    var dom = d.get('type') === 'Domicile';
    var msg = 'Bonjour O2S Consult, je souhaite réserver une consultation ' + (dom ? 'à domicile (30 000 FCFA)' : 'par téléphone (15 000 FCFA)') + '.\n' +
      'Nom : ' + d.get('nom') + '\nTéléphone : ' + d.get('tel') + '\nDate : ' + d.get('date') + ' à ' + d.get('heure') +
      (dom ? '\nAdresse : ' + d.get('adresse') : '') + (d.get('motif') ? '\nMotif : ' + d.get('motif') : '');
    try {
      var list = JSON.parse(localStorage.getItem('o2s_demandes') || '[]');
      list.push({ nom: d.get('nom'), tel: d.get('tel'), type: dom ? 'domicile' : 'telephone', date: d.get('date'), heure: d.get('heure'), adresse: d.get('adresse') || '', motif: d.get('motif') || '', cree: Date.now() });
      localStorage.setItem('o2s_demandes', JSON.stringify(list));
    } catch (err) {}
    window.open('https://wa.me/' + form.dataset.wa + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    note.textContent = 'Votre demande est prête dans WhatsApp : envoyez le message pour la valider.';
  });

  $('mbar-chat').addEventListener('click', function () { $('chat-toggle').click(); });
  $('year').textContent = new Date().getFullYear();
})();
