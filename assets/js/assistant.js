(function () {
  'use strict';

  var WA_NUMBER = '241077062310';
  var chat = document.getElementById('chat');
  var toggle = document.getElementById('chat-toggle');
  var body = document.getElementById('chat-body');
  var chipsBox = document.getElementById('chat-chips');
  var form = document.getElementById('chat-form');
  var input = document.getElementById('chat-input');
  var fab = document.getElementById('fab');
  var started = false;

  function waLink(text) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text); }
  function waButton(text, label) {
    return '<a class="chat__cta" href="' + waLink(text) + '" target="_blank" rel="noopener">' + (label || 'Continuer sur WhatsApp') + '</a>';
  }
  var DEVIS_WA = 'Bonjour O2S Consult, je souhaite réserver une consultation.';

  // Base de connaissances issue des affiches O2S Consult
  var KB = [
    { id: 'bonjour', keys: ['bonjour', 'bonsoir', 'salut', 'hello', 'coucou', 'bjr'],
      answer: "Bonjour et bienvenue chez <strong>O2S Consult</strong> ! Je peux vous renseigner sur nos consultations, nos tarifs, le paiement ou la réservation d'un créneau." },
    { id: 'services', keys: ['service', 'prestation', 'que faites', 'proposez', 'offre', 'soins', 'propose'],
      answer: "Nos services :<ul><li>Conseils</li><li>Consultations de médecine générale (enfants et adultes)</li><li>Soins de petite chirurgie</li><li>Renouvellement d'ordonnances</li><li>Établissement de certificats médicaux</li></ul>",
      chips: ['Tarifs', 'Réserver', 'Ordonnance'] },
    { id: 'tarifs', keys: ['tarif', 'prix', 'combien', 'cout', 'coute', 'cher', 'montant', 'fcfa', 'payant'],
      answer: "<ul><li><strong>Au téléphone</strong> : 15 000 FCFA</li><li><strong>À domicile</strong> : 30 000 FCFA</li></ul>Ces tarifs sont <strong>hors frais relatifs aux soins additionnels</strong>.",
      chips: ['Réserver', 'Paiement', 'Annulation'] },
    { id: 'telephone', keys: ['telephone', 'distance', 'appel', 'appelle', 'par tel', 'teleconsult', 'video'],
      answer: "La <strong>consultation par téléphone</strong> coûte 15 000 FCFA. Vous confirmez la réservation en réglant via Airtel Money ; le médecin vous appelle au créneau réservé, après réception de la preuve de règlement. Annulation possible jusqu'à 1 heure avant.",
      chips: ['Paiement', 'Réserver'] },
    { id: 'domicile', keys: ['domicile', 'chez moi', 'deplace', 'deplacer', 'visite', 'maison', 'venir', 'vient'],
      answer: "Pour la <strong>consultation à domicile</strong> (30 000 FCFA), le médecin se déplace au créneau réservé. Règlement en espèces ou via Airtel Money. Annulation possible jusqu'à 2 heures avant.",
      chips: ['Paiement', 'Réserver'] },
    { id: 'reserver', keys: ['reserv', 'rendez', 'rdv', 'creneau', 'prendre', 'consulter', 'consultation', 'horaire', 'heure', 'dispon', 'urgence', 'urgent'],
      answer: "Pour réserver : <strong>1)</strong> contactez-nous sur WhatsApp, <strong>2)</strong> suivez les instructions et donnez les informations demandées, <strong>3)</strong> choisissez téléphone ou domicile en réservant un créneau.<br>" + waButton(DEVIS_WA, 'Réserver sur WhatsApp') + '<a class="chat__link" href="#reserver" data-close>ou remplir le formulaire de réservation</a><br><small>En cas d\'urgence vitale, contactez immédiatement les services d\'urgence les plus proches.</small>' },
    { id: 'paiement', keys: ['paiement', 'payer', 'regler', 'reglement', 'airtel', 'money', 'especes', 'cash', 'preuve', 'virement'],
      answer: "<ul><li><strong>Téléphone</strong> : règlement via Airtel Money pour confirmer la réservation ; le médecin vous appelle après réception de la preuve.</li><li><strong>Domicile</strong> : règlement en espèces ou via Airtel Money.</li></ul>",
      chips: ['Annulation', 'Tarifs'] },
    { id: 'annulation', keys: ['annul', 'rembours', 'reporter', 'decaler', 'changer', 'modifier'],
      answer: "Annulation : <strong>1 heure minimum</strong> avant le rendez-vous pour une consultation téléphonique, <strong>2 heures minimum</strong> pour une visite à domicile. Le remboursement se fait sans frais via Airtel Money.",
      chips: ['Réserver', 'Contact'] },
    { id: 'ordonnance', keys: ['ordonnance', 'renouvel', 'medicament', 'traitement', 'prescription'],
      answer: "Nous assurons le <strong>renouvellement d'ordonnances</strong>. Les ordonnances sont envoyées via WhatsApp (hors assurance uniquement, selon nos conditions).",
      chips: ['Réserver', 'Certificat'] },
    { id: 'certificat', keys: ['certificat', 'arret', 'attestation'],
      answer: "Nous établissons des <strong>certificats médicaux</strong> après consultation. Réservez un créneau et précisez votre besoin.",
      chips: ['Réserver', 'Tarifs'] },
    { id: 'chirurgie', keys: ['chirurgie', 'suture', 'plaie', 'pansement', 'abces', 'point de suture'],
      answer: "Nous réalisons des <strong>soins de petite chirurgie</strong>. Ils peuvent donner lieu à des frais de soins additionnels, non compris dans le tarif de consultation. Décrivez votre besoin au médecin lors de la réservation.",
      chips: ['Tarifs', 'Réserver'] },
    { id: 'enfants', keys: ['enfant', 'bebe', 'pediatr', 'adulte', 'famille', 'fille', 'garcon'],
      answer: "Nos consultations de médecine générale s'adressent aux <strong>enfants et aux adultes</strong>.",
      chips: ['Réserver', 'Tarifs'] },
    { id: 'assurance', keys: ['assurance', 'cnamgs', 'mutuelle', 'prise en charge'],
      answer: "Nos affiches précisent que les ordonnances sont envoyées via WhatsApp « hors assurance uniquement ». Pour toute question sur une assurance, écrivez-nous :" + waButton('Bonjour O2S Consult, j\'ai une question sur mon assurance.', 'Poser ma question') },
    { id: 'horaires', keys: ['ouvert', 'dimanche', 'samedi', 'nuit', 'week', '24h', 'jour ferie', 'ferme'],
      answer: "Les consultations se font <strong>sur créneau réservé</strong>. Écrivez-nous sur WhatsApp en indiquant le jour et l'heure souhaités : l'équipe vous confirme la disponibilité." + waButton(DEVIS_WA, 'Demander un créneau') },
    { id: 'zone', keys: ['ou etes', 'vous etes ou ', 'adresse', 'situe', 'localisation', 'libreville', 'zone', 'quartier', 'gabon', 'cabinet', 'lieu'],
      answer: "O2S Consult intervient à <strong>Libreville, Gabon</strong>. Pour une visite à domicile, indiquez votre quartier lors de la réservation.",
      chips: ['Domicile', 'Contact'] },
    { id: 'contact', keys: ['contact', 'numero', 'joindre', 'mail', 'email', 'courriel', 'whatsapp', 'parler', 'humain', 'medecin', 'docteur'],
      answer: "Nous joindre :<ul><li>WhatsApp : <a href=\"https://wa.me/241077062310\" target=\"_blank\" rel=\"noopener\">+241 077 06 23 10</a></li><li>E-mail : <a href=\"mailto:o2sconsult26@gmail.com\">o2sconsult26@gmail.com</a></li><li>Libreville, Gabon</li></ul>" + waButton('Bonjour O2S Consult, je souhaite des informations.') },
    { id: 'merci', keys: ['merci', 'au revoir', 'bye', 'a bientot', 'parfait', 'super', 'ok merci'],
      answer: "Avec plaisir ! Prenez soin de vous. <strong>O2S Consult — votre santé, notre priorité.</strong>" }
  ];

  var CHIP_MAP = {
    'Nos services': 'services', 'Tarifs': 'tarifs', 'Réserver': 'reserver', 'Paiement': 'paiement',
    'Annulation': 'annulation', 'Domicile': 'domicile', 'Ordonnance': 'ordonnance', 'Certificat': 'certificat',
    'Contact': 'contact', 'Où êtes-vous ?': 'zone'
  };
  var DEFAULT_CHIPS = ['Tarifs', 'Réserver', 'Nos services', 'Paiement', 'Contact'];

  function norm(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9+ ]/g, ' ').replace(/\s+/g, ' ');
  }

  function findAnswer(q) {
    var t = ' ' + norm(q) + ' ';
    var best = null, bestScore = 0;
    KB.forEach(function (e) {
      var score = 0;
      e.keys.forEach(function (k) { if (t.indexOf(' ' + k) !== -1) score += k.length > 5 ? 2 : 1; });
      if (e.id === 'bonjour' && score) score = 0.5;
      if (score > bestScore) { bestScore = score; best = e; }
    });
    return best;
  }

  function addMsg(html, who) {
    var m = document.createElement('div');
    m.className = 'chat__msg chat__msg--' + who;
    m.innerHTML = html;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
    return m;
  }

  function setChips(list) {
    chipsBox.innerHTML = '';
    (list || DEFAULT_CHIPS).forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chat__chip';
      b.textContent = c;
      b.addEventListener('click', function () { ask(c, CHIP_MAP[c]); });
      chipsBox.appendChild(b);
    });
  }

  function botReply(html, chips) {
    var typing = addMsg('<span class="chat__typing"><i></i><i></i><i></i></span>', 'bot');
    setTimeout(function () {
      typing.innerHTML = html;
      body.scrollTop = body.scrollHeight;
      setChips(chips);
    }, 550 + Math.min(html.length, 400));
  }

  function ask(text, forcedId) {
    addMsg(text.replace(/</g, '&lt;'), 'user');
    var entry = null;
    if (forcedId) KB.forEach(function (e) { if (e.id === forcedId) entry = e; });
    if (!entry) entry = findAnswer(text);
    if (entry) {
      botReply(entry.answer, entry.chips);
    } else {
      botReply("Je n'ai pas la réponse précise à cette question. Je suis un assistant programmé : l'équipe peut vous répondre directement.<br>" +
        waButton('Bonjour O2S Consult, j\'ai une question : ' + text, 'Poser ma question sur WhatsApp'));
    }
  }

  function open() {
    chat.classList.add('is-open');
    fab.classList.add('is-chat-open');
    chat.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    if (!started) {
      started = true;
      botReply("Bonjour 👋 Je suis l'assistant programmé d'<strong>O2S Consult</strong>. Posez-moi vos questions sur les tarifs, le paiement ou la réservation d'un créneau.");
    }
    setTimeout(function () { input.focus(); }, 300);
  }
  function close() {
    chat.classList.remove('is-open');
    fab.classList.remove('is-chat-open');
    chat.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () { chat.classList.contains('is-open') ? close() : open(); });
  document.getElementById('chat-close').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && chat.classList.contains('is-open')) close(); });
  body.addEventListener('click', function (e) { if (e.target.closest('a[data-close]')) close(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) return;
    input.value = '';
    ask(q);
  });

  setTimeout(function () {
    try { if (sessionStorage.getItem('o2sChatHint')) return; sessionStorage.setItem('o2sChatHint', '1'); } catch (e) {}
    if (!chat.classList.contains('is-open')) fab.classList.add('is-hint');
    setTimeout(function () { fab.classList.remove('is-hint'); }, 6000);
  }, 5000);
})();
