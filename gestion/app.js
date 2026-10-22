/* O2S Gestion — application interne de démonstration (données locales) */
(function () {
  'use strict';
  var KEY = 'o2s_gestion_v1';
  var DB;
  function load() {
    try { DB = JSON.parse(localStorage.getItem(KEY)); } catch (e) { DB = null; }
    if (!DB || DB.v !== 1) DB = window.O2S_SEED();
    importSite();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) {} }
  function uid(p) { return p + (++DB.seq); }

  // Demandes envoyées depuis le formulaire du site (même navigateur)
  function importSite() {
    var list = [];
    try { list = JSON.parse(localStorage.getItem('o2s_demandes') || '[]'); } catch (e) {}
    if (!list.length) return;
    list.forEach(function (d) {
      var p = DB.patients.filter(function (x) { return x.nom.toLowerCase() === d.nom.toLowerCase(); })[0];
      if (!p) { p = { id: uid('p'), nom: d.nom, tel: d.tel, naissance: '', sexe: '', quartier: '', assurance: '', allergies: '', antecedents: '', notes: 'Créé depuis le site' }; DB.patients.push(p); }
      DB.rdv.push({ id: uid('r'), patientId: p.id, type: d.type, date: d.date, heure: d.heure, statut: 'demande', motif: d.motif, adresse: d.adresse, pay: { mode: d.type === 'domicile' ? 'especes' : 'airtel', montant: d.type === 'domicile' ? DB.set.dom : DB.set.tel, ref: '', recu: false }, extra: 0, cr: '' });
    });
    try { localStorage.removeItem('o2s_demandes'); } catch (e) {}
    save();
  }

  // ---------- Utilitaires ----------
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fcfa(n) { return Math.round(n || 0).toLocaleString('fr-FR').replace(/ | /g, ' ') + ' FCFA'; }
  function todayISO() { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
  function addDays(iso, n) { var d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  function fdate(iso, long) { if (!iso) return '—'; return new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', long ? { weekday: 'long', day: 'numeric', month: 'long' } : { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  function age(iso) { if (!iso) return ''; var d = new Date(iso), n = new Date(); var a = n.getFullYear() - d.getFullYear(); if (n < new Date(n.getFullYear(), d.getMonth(), d.getDate())) a--; return a + ' ans'; }
  function initials(n) { return n.split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase(); }
  function pat(id) { return DB.patients.filter(function (p) { return p.id === id; })[0] || { nom: '?', tel: '' }; }
  function rdvById(id) { return DB.rdv.filter(function (r) { return r.id === id; })[0]; }
  function price(type) { return type === 'domicile' ? DB.set.dom : DB.set.tel; }
  function ic(n) {
    var p = { home: 'M3 11l9-7 9 7M5 10v10h14V10', cal: 'M4 5h16v15H4zM8 3v4M16 3v4M4 10h16', list: 'M5 6h14M5 12h14M5 18h14', users: 'M9 11a3 3 0 100-6 3 3 0 000 6zM3 20a6 6 0 0112 0M17 11a3 3 0 100-6M21 20a6 6 0 00-4-5.600', cash: 'M3 7h18v12H3zM3 11h18M7 15h3', doc: 'M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6', cog: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12l2 1-2 3-2-.5-1.500 1 .3 2.500h-3.600L11.500 16.500 10 15.500 8 16l-2-3 2-1V10L6 9l2-3 2 .5L11.500 5.500h3.600L15.500 8l1.500-1 2 .5 2 3-2 1z', plus: 'M12 5v14M5 12h14', more: 'M5 12h.01M12 12h.01M19 12h.01' };
    return '<svg class="i" viewBox="0 0 24 24"><path d="' + (p[n] || '') + '"/></svg>';
  }
  function toast(t) { var e = document.createElement('div'); e.className = 'toast'; e.textContent = t; document.body.appendChild(e); setTimeout(function () { e.remove(); }, 2400); }
  var STAT = { demande: 'Demande', attente: 'Attente paiement', confirme: 'Confirmé', realise: 'Réalisé', annule: 'Annulé', rembourse: 'Remboursé' };
  function badge(s) { return '<span class="badge b-' + s + '">' + STAT[s] + '</span>'; }
  function tbadge(t) { return t === 'domicile' ? '<span class="badge b-dom">Domicile</span>' : '<span class="badge b-tel">Téléphone</span>'; }
  function wa(tel, text) { return 'https://wa.me/' + String(tel).replace(/\D/g, '') + '?text=' + encodeURIComponent(text); }
  function sorted(list) { return list.slice().sort(function (a, b) { return (a.date + a.heure).localeCompare(b.date + b.heure); }); }
  function revenue(r) { return r.pay.recu && (r.statut === 'confirme' || r.statut === 'realise') ? r.pay.montant + (r.statut === 'realise' ? (r.extra || 0) : 0) : 0; }

  // ---------- Routes ----------
  var ROUTES = [
    { id: 'dashboard', label: 'Tableau de bord', ico: 'home', tab: 'Accueil' },
    { id: 'rdv', label: 'Réservations', ico: 'list', tab: 'RDV' },
    { id: 'agenda', label: 'Agenda', ico: 'cal', tab: 'Agenda' },
    { id: 'patients', label: 'Patients', ico: 'users', tab: 'Patients' },
    { id: 'paiements', label: 'Paiements', ico: 'cash' },
    { id: 'documents', label: 'Documents', ico: 'doc' },
    { id: 'parametres', label: 'Paramètres', ico: 'cog' }
  ];
  var state = { filtre: 'tous', q: '', day: todayISO(), pq: '' };

  function route() {
    var h = (location.hash || '#/dashboard').replace('#/', '').split('/');
    var id = h[0] || 'dashboard', arg = h[1];
    var r = ROUTES.filter(function (x) { return x.id === id; })[0] || ROUTES[0];
    $('#title').textContent = id === 'patient' ? 'Fiche patient' : r.label;
    $('#date').textContent = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    var active = id === 'patient' ? 'patients' : r.id;
    $('#nav').innerHTML = ROUTES.map(function (x) { return '<a href="#/' + x.id + '" class="' + (x.id === active ? 'on' : '') + '">' + ic(x.ico) + x.label + '</a>'; }).join('');
    var more = ['paiements', 'documents', 'parametres'].indexOf(active) >= 0;
    $('#tabbar').innerHTML = ROUTES.slice(0, 4).map(function (x) { return '<a href="#/' + x.id + '" class="' + (x.id === active ? 'on' : '') + '">' + ic(x.ico) + x.tab + '</a>'; }).join('') +
      '<a href="#/paiements" class="' + (more ? 'on' : '') + '">' + ic('more') + 'Plus</a>';
    $('#back').classList.toggle('off', active === 'dashboard');
    var v = $('#view');
    if (id === 'patient') v.innerHTML = vFiche(arg);
    else v.innerHTML = ({ dashboard: vDash, rdv: vRdv, agenda: vAgenda, patients: vPatients, paiements: vPaie, documents: vDocs, parametres: vParam }[r.id])();
    window.scrollTo(0, 0);
  }
  function refresh() { var y = window.scrollY; route(); window.scrollTo(0, y); }

  // ---------- Vues ----------
  function rdvItem(r, opt) {
    var p = pat(r.patientId);
    return '<div class="item"><div class="item__time"><b>' + esc(r.heure) + '</b><small>' + (opt && opt.date ? fdate(r.date) : (r.date === todayISO() ? "Aujourd'hui" : fdate(r.date))) + '</small></div>' +
      '<div class="item__main"><b>' + esc(p.nom) + '</b><small>' + esc(r.motif || 'Motif non précisé') + (r.type === 'domicile' && r.adresse ? ' · ' + esc(r.adresse) : '') + '</small><div style="margin-top:.3rem;display:flex;gap:.3rem;flex-wrap:wrap">' + tbadge(r.type) + badge(r.statut) + '<span class="badge ' + (r.pay.recu ? 'b-ok' : 'b-warn') + '">' + (r.pay.recu ? 'Payé' : 'Non payé') + '</span></div></div>' +
      '<div class="item__act">' + rdvActions(r) + '</div></div>';
  }
  function rdvActions(r) {
    var a = [], id = 'data-id="' + r.id + '"';
    if (r.statut === 'demande') a.push('<button class="btn btn--sky btn--sm" data-act="ask-pay" ' + id + '>Demander le paiement</button>');
    if (r.statut === 'demande' || r.statut === 'attente') a.push('<button class="btn btn--ok btn--sm" data-act="paid" ' + id + '>' + (r.type === 'domicile' ? 'Confirmer' : 'Paiement reçu') + '</button>');
    if (r.statut === 'confirme') a.push('<button class="btn btn--pri btn--sm" data-act="consult" ' + id + '>Consultation</button>');
    if (r.statut === 'realise') a.push('<button class="btn btn--pri btn--sm" data-act="consult" ' + id + '>Compte rendu</button>');
    if (['demande', 'attente', 'confirme'].indexOf(r.statut) >= 0) a.push('<button class="btn btn--line btn--sm" data-act="cancel" ' + id + '>Annuler</button>');
    a.push('<button class="btn btn--line btn--sm" data-act="edit-rdv" ' + id + '>Modifier</button>');
    return a.join('');
  }
  function vDash() {
    var t = todayISO(), ym = t.slice(0, 7);
    var today = sorted(DB.rdv.filter(function (r) { return r.date === t && r.statut !== 'annule' && r.statut !== 'rembourse'; }));
    var todo = DB.rdv.filter(function (r) { return r.statut === 'demande' || r.statut === 'attente'; });
    var ca = DB.rdv.filter(function (r) { return r.date.slice(0, 7) === ym; }).reduce(function (s, r) { return s + revenue(r); }, 0);
    var refund = DB.rdv.filter(function (r) { return r.pay.refund === 'due'; });
    var bars = '';
    var max = 1, days = [];
    for (var i = 6; i >= 0; i--) { var d = addDays(t, -i); var v = DB.rdv.filter(function (r) { return r.date === d; }).reduce(function (s, r) { return s + revenue(r); }, 0); days.push([d, v]); if (v > max) max = v; }
    days.forEach(function (x) { bars += '<div><small>' + (x[1] ? Math.round(x[1] / 1000) + 'k' : '') + '</small><i style="height:' + Math.max(3, x[1] / max * 100) + '%"></i>' + new Date(x[0] + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3) + '</div>'; });
    return '<div class="kpis">' +
      '<div class="kpi"><small>RDV aujourd\'hui</small><b>' + today.length + '</b><span>' + today.filter(function (r) { return r.type === 'domicile'; }).length + ' à domicile</span></div>' +
      '<div class="kpi"><small>À traiter</small><b>' + todo.length + '</b><span>demandes / paiements en attente</span></div>' +
      '<div class="kpi"><small>Encaissé ce mois</small><b>' + fcfa(ca).replace(' FCFA', '') + '</b><span>FCFA</span></div>' +
      '<div class="kpi"><small>À rembourser</small><b>' + refund.length + '</b><span>Airtel Money</span></div></div>' +
      '<div class="cols"><div class="stack"><div class="card"><h3>Rendez-vous du jour <button class="btn btn--line btn--sm" data-act="new-rdv">+ Nouveau</button></h3><div class="list">' +
      (today.length ? today.map(function (r) { return rdvItem(r); }).join('') : '<p class="empty">Aucun rendez-vous aujourd\'hui.</p>') + '</div></div></div>' +
      '<div class="stack"><div class="card"><h3>À traiter</h3><div class="list">' + (todo.length ? sorted(todo).slice(0, 4).map(function (r) { return rdvItem(r, { date: 1 }); }).join('') : '<p class="empty">Tout est à jour ✔</p>') + '</div></div>' +
      '<div class="card"><h3>Encaissements — 7 jours</h3><div class="bars">' + bars + '</div></div></div></div>';
  }
  function vRdv() {
    var f = state.filtre, q = state.q.toLowerCase();
    var list = sorted(DB.rdv).reverse().filter(function (r) {
      if (f !== 'tous' && r.statut !== f) return false;
      return !q || (pat(r.patientId).nom + ' ' + r.motif).toLowerCase().indexOf(q) >= 0;
    });
    var chips = ['tous', 'demande', 'attente', 'confirme', 'realise', 'annule', 'rembourse'].map(function (s) { return '<button class="chip ' + (f === s ? 'on' : '') + '" data-act="filtre" data-v="' + s + '">' + (s === 'tous' ? 'Tous' : STAT[s]) + '</button>'; }).join('');
    return '<div class="tools"><div class="field"><input id="q" placeholder="Rechercher un patient ou un motif" value="' + esc(state.q) + '" data-act="search"></div><button class="btn btn--pri" data-act="new-rdv">' + ic('plus') + 'Nouveau</button></div><div class="chips" style="margin-bottom:1rem">' + chips + '</div>' +
      '<div class="list">' + (list.length ? list.map(function (r) { return rdvItem(r, { date: 1 }); }).join('') : '<p class="empty">Aucune réservation.</p>') + '</div>';
  }
  function vAgenda() {
    var d = state.day, hrs = [];
    for (var h = 7; h <= 21; h++) hrs.push((h < 10 ? '0' : '') + h + ':00');
    var evs = DB.rdv.filter(function (r) { return r.date === d && r.statut !== 'annule' && r.statut !== 'rembourse'; });
    var rows = hrs.map(function (hh) {
      var e = evs.filter(function (r) { return r.heure.slice(0, 2) === hh.slice(0, 2); });
      return '<div class="slot"><b>' + hh + '</b>' + (e.length ? '<div class="slot__box">' + e.map(function (r) { return '<div class="ev ' + (r.type === 'domicile' ? 'dom' : '') + '" data-act="edit-rdv" data-id="' + r.id + '"><b>' + esc(r.heure) + ' · ' + esc(pat(r.patientId).nom) + '</b><small>' + (r.type === 'domicile' ? 'Domicile' : 'Téléphone') + ' · ' + STAT[r.statut] + (r.motif ? ' · ' + esc(r.motif) : '') + '</small></div>'; }).join('') + '</div>'
        : '<div class="slot__box free" data-act="new-rdv" data-date="' + d + '" data-heure="' + hh + '">+ Créneau libre</div>') + '</div>';
    }).join('');
    return '<div class="dayhead"><button class="btn btn--line btn--sm" data-act="day" data-v="-1">‹</button><h2>' + fdate(d, true) + '</h2><button class="btn btn--line btn--sm" data-act="day" data-v="1">›</button><button class="btn btn--line btn--sm" data-act="day" data-v="0">Aujourd\'hui</button></div><div class="slots">' + rows + '</div>';
  }
  function vPatients() {
    var q = state.pq.toLowerCase();
    var list = DB.patients.filter(function (p) { return !q || (p.nom + p.tel + p.quartier).toLowerCase().indexOf(q) >= 0; });
    return '<div class="tools"><div class="field"><input placeholder="Rechercher un patient" value="' + esc(state.pq) + '" data-act="psearch"></div><button class="btn btn--pri" data-act="new-patient">' + ic('plus') + 'Nouveau patient</button></div><div class="list">' +
      list.map(function (p) {
        var n = DB.rdv.filter(function (r) { return r.patientId === p.id; }).length;
        return '<a class="item" href="#/patient/' + p.id + '"><span class="avatar" style="width:46px;height:46px;background:var(--blue);color:#fff">' + initials(p.nom) + '</span><div class="item__main"><b>' + esc(p.nom) + '</b><small>' + esc(p.tel) + (p.naissance ? ' · ' + age(p.naissance) : '') + ' · ' + esc(p.quartier || 'Quartier ?') + '</small></div><span class="badge b-info">' + n + ' RDV</span></a>';
      }).join('') + (list.length ? '' : '<p class="empty">Aucun patient.</p>') + '</div>';
  }
  function vFiche(id) {
    var p = DB.patients.filter(function (x) { return x.id === id; })[0];
    if (!p) return '<p class="empty">Patient introuvable.</p>';
    var hist = sorted(DB.rdv.filter(function (r) { return r.patientId === id; })).reverse();
    var docs = DB.docs.filter(function (d) { return d.patientId === id; });
    return '<div class="fiche"><div class="card fiche__id"><span class="avatar">' + initials(p.nom) + '</span><h3 style="justify-content:center">' + esc(p.nom) + '</h3><small style="color:var(--muted)">' + esc(p.tel) + '</small>' +
      '<div class="kv"><div><span>Naissance</span><b>' + (p.naissance ? fdate(p.naissance) + ' (' + age(p.naissance) + ')' : '—') + '</b></div><div><span>Sexe</span><b>' + esc(p.sexe || '—') + '</b></div><div><span>Quartier</span><b>' + esc(p.quartier || '—') + '</b></div><div><span>Assurance</span><b>' + esc(p.assurance || '—') + '</b></div><div><span>Allergies</span><b>' + esc(p.allergies || '—') + '</b></div><div><span>Antécédents</span><b>' + esc(p.antecedents || '—') + '</b></div></div>' +
      (p.notes ? '<p class="notice info" style="margin-top:1rem;text-align:left">' + esc(p.notes) + '</p>' : '') +
      '<div style="display:grid;gap:.5rem;margin-top:1rem"><a class="btn btn--sky" target="_blank" rel="noopener" href="' + wa(p.tel, 'Bonjour ' + p.nom + ', ici O2S Consult.') + '">Écrire sur WhatsApp</a><button class="btn btn--line" data-act="edit-patient" data-id="' + p.id + '">Modifier la fiche</button><button class="btn btn--pri" data-act="new-rdv" data-patient="' + p.id + '">Nouveau rendez-vous</button></div></div>' +
      '<div class="stack"><div class="card"><h3>Historique des consultations</h3>' + (hist.length ? '<ul class="tl">' + hist.map(function (r) { return '<li><b>' + fdate(r.date) + ' ' + esc(r.heure) + '</b> ' + tbadge(r.type) + ' ' + badge(r.statut) + '<br>' + esc(r.motif) + (r.cr ? '<br><small>' + esc(r.cr) + '</small>' : '') + '</li>'; }).join('') + '</ul>' : '<p class="empty">Aucune consultation.</p>') + '</div>' +
      '<div class="card"><h3>Ordonnances et certificats</h3>' + (docs.length ? '<ul class="tl">' + docs.map(function (d) { return '<li><b>' + (d.kind === 'ordonnance' ? 'Ordonnance' : 'Certificat') + '</b> · ' + fdate(d.date) + ' <button class="btn btn--line btn--sm" data-act="print-doc" data-id="' + d.id + '">Imprimer</button></li>'; }).join('') + '</ul>' : '<p class="empty">Aucun document.</p>') + '</div></div></div>';
  }
  function vPaie() {
    var rows = sorted(DB.rdv).reverse().filter(function (r) { return r.statut !== 'demande'; });
    var tot = DB.rdv.reduce(function (s, r) { return s + revenue(r); }, 0);
    var due = DB.rdv.filter(function (r) { return r.pay.refund === 'due'; });
    return '<div class="kpis"><div class="kpi"><small>Total encaissé</small><b>' + fcfa(tot).replace(' FCFA', '') + '</b><span>FCFA</span></div><div class="kpi"><small>En attente</small><b>' + DB.rdv.filter(function (r) { return r.statut === 'attente'; }).length + '</b><span>paiements</span></div><div class="kpi"><small>Remboursements dus</small><b>' + due.length + '</b><span>Airtel Money</span></div><div class="kpi"><small>Soins additionnels</small><b>' + fcfa(DB.rdv.reduce(function (s, r) { return s + (r.statut === 'realise' ? (r.extra || 0) : 0); }, 0)).replace(' FCFA', '') + '</b><span>FCFA</span></div></div>' +
      '<div class="card"><div class="tblwrap"><table class="tbl"><thead><tr><th>Date</th><th>Patient</th><th>Mode</th><th>Réf.</th><th>Montant</th><th>État</th><th></th></tr></thead><tbody>' +
      rows.map(function (r) {
        var etat = r.pay.refund === 'due' ? '<span class="badge b-warn">À rembourser</span>' : r.statut === 'rembourse' ? '<span class="badge b-rembourse">Remboursé</span>' : r.pay.recu ? '<span class="badge b-ok">Reçu</span>' : '<span class="badge b-warn">En attente</span>';
        var act = r.pay.refund === 'due' ? '<button class="btn btn--sm btn--pri" data-act="refunded" data-id="' + r.id + '">Marquer remboursé</button>' : (!r.pay.recu && (r.statut === 'attente') ? '<button class="btn btn--sm btn--ok" data-act="paid" data-id="' + r.id + '">Reçu</button>' : '');
        return '<tr><td>' + fdate(r.date) + '</td><td>' + esc(pat(r.patientId).nom) + '</td><td>' + (r.pay.mode === 'airtel' ? 'Airtel Money' : 'Espèces') + '</td><td>' + esc(r.pay.ref || '—') + '</td><td><b>' + fcfa(r.pay.montant + (r.statut === 'realise' ? (r.extra || 0) : 0)) + '</b></td><td>' + etat + '</td><td>' + act + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }
  function vDocs() {
    var l = DB.docs.slice().reverse();
    return '<div class="tools"><button class="btn btn--pri" data-act="new-doc" data-kind="ordonnance">' + ic('plus') + 'Ordonnance</button><button class="btn btn--sky" data-act="new-doc" data-kind="certificat">' + ic('plus') + 'Certificat médical</button></div><div class="list">' +
      (l.length ? l.map(function (d) { return '<div class="item"><div class="item__time"><b>' + (d.kind === 'ordonnance' ? 'Ord.' : 'Cert.') + '</b><small>' + fdate(d.date) + '</small></div><div class="item__main"><b>' + esc(pat(d.patientId).nom) + '</b><small>' + esc(d.contenu.slice(0, 80)) + '…</small></div><div class="item__act"><button class="btn btn--line btn--sm" data-act="print-doc" data-id="' + d.id + '">Imprimer</button><button class="btn btn--line btn--sm" data-act="send-doc" data-id="' + d.id + '">WhatsApp</button></div></div>'; }).join('') : '<p class="empty">Aucun document.</p>') + '</div>';
  }
  function vParam() {
    var s = DB.set;
    return '<div class="card" style="max-width:640px"><h3>Tarifs et règles</h3><div class="grid2"><div class="field"><label>Consultation téléphone (FCFA)</label><input id="s-tel" type="number" value="' + s.tel + '"></div><div class="field"><label>Consultation à domicile (FCFA)</label><input id="s-dom" type="number" value="' + s.dom + '"></div><div class="field"><label>Annulation téléphone (heures avant)</label><input id="s-dt" type="number" value="' + s.delaiTel + '"></div><div class="field"><label>Annulation domicile (heures avant)</label><input id="s-dd" type="number" value="' + s.delaiDom + '"></div></div><div class="field" style="margin-top:.8rem"><label>Nom du médecin (en-tête des documents)</label><input id="s-med" value="' + esc(s.medecin) + '"></div><div style="display:flex;gap:.6rem;margin-top:1rem;flex-wrap:wrap"><button class="btn btn--pri" data-act="save-set">Enregistrer</button><button class="btn btn--line" data-act="export">Exporter les données</button><button class="btn btn--bad" data-act="reset">Réinitialiser la démo</button></div></div>' +
      '<p class="notice info" style="max-width:640px;margin-top:1rem">Démonstration : les données restent dans ce navigateur. En production : compte sécurisé, sauvegardes et hébergement conforme aux données de santé.</p>';
  }

  // ---------- Modales ----------
  function modal(title, body, foot) {
    $('#modals').innerHTML = '<div class="modal" data-act="mclose-bg"><div class="modal__box" role="dialog" aria-label="' + esc(title) + '"><div class="modal__head"><h3>' + esc(title) + '</h3><button class="x" data-act="mclose" aria-label="Fermer">&times;</button></div><div class="modal__body">' + body + '</div><div class="modal__foot">' + foot + '</div></div></div>';
  }
  function closeModal() { $('#modals').innerHTML = ''; }
  function patientOptions(sel) { return DB.patients.map(function (p) { return '<option value="' + p.id + '"' + (p.id === sel ? ' selected' : '') + '>' + esc(p.nom) + '</option>'; }).join(''); }

  function rdvModal(id, pre) {
    var r = id ? rdvById(id) : { patientId: (pre && pre.patient) || DB.patients[0].id, type: 'telephone', date: (pre && pre.date) || todayISO(), heure: (pre && pre.heure) || '09:00', statut: 'attente', motif: '', adresse: '', pay: { mode: 'airtel', montant: DB.set.tel, ref: '', recu: false }, extra: 0, cr: '' };
    modal(id ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous',
      '<div class="field"><label>Patient</label><select id="m-pat">' + patientOptions(r.patientId) + '</select></div>' +
      '<div class="grid2"><div class="field"><label>Type</label><select id="m-type"><option value="telephone"' + (r.type === 'telephone' ? ' selected' : '') + '>Téléphone — ' + fcfa(DB.set.tel) + '</option><option value="domicile"' + (r.type === 'domicile' ? ' selected' : '') + '>Domicile — ' + fcfa(DB.set.dom) + '</option></select></div>' +
      '<div class="field"><label>Mode de paiement</label><select id="m-mode"><option value="airtel"' + (r.pay.mode === 'airtel' ? ' selected' : '') + '>Airtel Money</option><option value="especes"' + (r.pay.mode === 'especes' ? ' selected' : '') + '>Espèces (domicile)</option></select></div>' +
      '<div class="field"><label>Date</label><input id="m-date" type="date" value="' + r.date + '"></div><div class="field"><label>Heure</label><input id="m-heure" type="time" value="' + r.heure + '"></div></div>' +
      '<div class="field"><label>Adresse (domicile)</label><input id="m-adr" value="' + esc(r.adresse) + '"></div>' +
      '<div class="field"><label>Motif</label><textarea id="m-motif" rows="2">' + esc(r.motif) + '</textarea></div>' +
      '<div class="grid2"><div class="field"><label>Référence Airtel Money</label><input id="m-ref" value="' + esc(r.pay.ref) + '"></div><div class="field"><label>Statut</label><select id="m-stat">' + Object.keys(STAT).map(function (k) { return '<option value="' + k + '"' + (r.statut === k ? ' selected' : '') + '>' + STAT[k] + '</option>'; }).join('') + '</select></div></div>',
      (id ? '<button class="btn btn--bad" data-act="del-rdv" data-id="' + id + '">Supprimer</button>' : '') + '<button class="btn btn--line" data-act="mclose">Fermer</button><button class="btn btn--pri" data-act="save-rdv" data-id="' + (id || '') + '">Enregistrer</button>');
  }
  function patientModal(id) {
    var p = id ? pat(id) : { nom: '', tel: '', naissance: '', sexe: 'F', quartier: '', assurance: '', allergies: '', antecedents: '', notes: '' };
    modal(id ? 'Modifier la fiche' : 'Nouveau patient',
      '<div class="grid2"><div class="field"><label>Nom et prénom *</label><input id="p-nom" value="' + esc(p.nom) + '"></div><div class="field"><label>Téléphone *</label><input id="p-tel" value="' + esc(p.tel) + '"></div>' +
      '<div class="field"><label>Date de naissance</label><input id="p-nai" type="date" value="' + esc(p.naissance) + '"></div><div class="field"><label>Sexe</label><select id="p-sexe"><option' + (p.sexe === 'F' ? ' selected' : '') + '>F</option><option' + (p.sexe === 'M' ? ' selected' : '') + '>M</option></select></div>' +
      '<div class="field"><label>Quartier</label><input id="p-qua" value="' + esc(p.quartier) + '"></div><div class="field"><label>Assurance</label><input id="p-ass" value="' + esc(p.assurance) + '"></div></div>' +
      '<div class="field"><label>Allergies</label><input id="p-all" value="' + esc(p.allergies) + '"></div><div class="field"><label>Antécédents</label><textarea id="p-ant" rows="2">' + esc(p.antecedents) + '</textarea></div><div class="field"><label>Notes</label><textarea id="p-not" rows="2">' + esc(p.notes) + '</textarea></div>',
      '<button class="btn btn--line" data-act="mclose">Fermer</button><button class="btn btn--pri" data-act="save-patient" data-id="' + (id || '') + '">Enregistrer</button>');
  }
  function consultModal(id) {
    var r = rdvById(id), p = pat(r.patientId);
    modal('Consultation — ' + p.nom,
      '<p class="notice info">' + fdate(r.date) + ' ' + esc(r.heure) + ' · ' + (r.type === 'domicile' ? 'Domicile' : 'Téléphone') + ' · Motif : ' + esc(r.motif || '—') + (p.allergies ? '<br><b>Allergies : ' + esc(p.allergies) + '</b>' : '') + '</p>' +
      '<div class="field"><label>Compte rendu (examen, diagnostic, conduite à tenir)</label><textarea id="c-cr" rows="5">' + esc(r.cr) + '</textarea></div>' +
      '<div class="field"><label>Soins additionnels facturés en plus (FCFA)</label><input id="c-extra" type="number" min="0" value="' + (r.extra || 0) + '"></div>',
      '<button class="btn btn--line" data-act="new-doc" data-kind="certificat" data-rdv="' + id + '">Certificat</button><button class="btn btn--sky" data-act="new-doc" data-kind="ordonnance" data-rdv="' + id + '">Ordonnance</button><button class="btn btn--pri" data-act="save-consult" data-id="' + id + '">Terminer la consultation</button>');
  }
  function docModal(kind, rdvId, patId) {
    var r = rdvId ? rdvById(rdvId) : null;
    var pid = r ? r.patientId : (patId || DB.patients[0].id);
    var tpl = kind === 'ordonnance' ? '' : 'Je soussigné(e), certifie avoir examiné ce jour le(la) patient(e) et constate un état de santé nécessitant …';
    modal(kind === 'ordonnance' ? 'Nouvelle ordonnance' : 'Nouveau certificat médical',
      '<div class="field"><label>Patient</label><select id="d-pat">' + patientOptions(pid) + '</select></div><div class="field"><label>' + (kind === 'ordonnance' ? 'Prescription (un médicament par ligne : nom, posologie, durée)' : 'Contenu du certificat') + '</label><textarea id="d-txt" rows="7">' + tpl + '</textarea></div>' +
      (kind === 'ordonnance' ? '<p class="notice">Selon vos conditions : ordonnance envoyée via WhatsApp (hors assurance uniquement).</p>' : ''),
      '<button class="btn btn--line" data-act="mclose">Fermer</button><button class="btn btn--pri" data-act="save-doc" data-kind="' + kind + '" data-rdv="' + (rdvId || '') + '">Enregistrer</button>');
  }
  function cancelModal(id) {
    var r = rdvById(id), p = pat(r.patientId);
    var when = new Date(r.date + 'T' + r.heure + ':00'), hrs = (when - new Date()) / 36e5, need = r.type === 'domicile' ? DB.set.delaiDom : DB.set.delaiTel, ok = hrs >= need;
    modal('Annuler le rendez-vous',
      '<p><b>' + esc(p.nom) + '</b> — ' + fdate(r.date) + ' ' + esc(r.heure) + ' (' + (r.type === 'domicile' ? 'domicile' : 'téléphone') + ')</p>' +
      '<p class="notice ' + (ok ? 'ok' : '') + '">' + (ok ? 'Annulation dans les délais (au moins ' + need + ' h avant).' : 'Hors délai : il faut annuler au moins ' + need + ' h avant le rendez-vous. Remboursement non dû selon vos conditions.') + '</p>' +
      (r.pay.recu ? '<p class="notice info">Paiement déjà reçu : ' + fcfa(r.pay.montant) + '. Le remboursement se fait sans frais via Airtel Money.</p>' : ''),
      '<button class="btn btn--line" data-act="mclose">Retour</button><button class="btn btn--bad" data-act="do-cancel" data-id="' + id + '" data-refund="0">Annuler sans remboursement</button>' + (r.pay.recu ? '<button class="btn btn--pri" data-act="do-cancel" data-id="' + id + '" data-refund="1">Annuler et rembourser</button>' : ''));
  }
  function docHTML(d) {
    var p = pat(d.patientId);
    return '<!doctype html><meta charset="utf-8"><title>' + (d.kind === 'ordonnance' ? 'Ordonnance' : 'Certificat médical') + '</title><style>body{font-family:Georgia,serif;margin:0;padding:40px;color:#1b2240}header{display:flex;gap:16px;align-items:center;border-bottom:3px solid #3f4fa3;padding-bottom:14px}header img{width:70px;height:70px;border-radius:50%}h1{font-size:22px;margin:0;color:#141c52}small{color:#56607f;font-family:Arial}h2{text-align:center;margin:34px 0 22px;letter-spacing:.1em;text-transform:uppercase;font-size:20px}pre{font-family:Georgia,serif;font-size:16px;white-space:pre-wrap;line-height:1.7;min-height:260px}.sig{margin-top:60px;text-align:right}footer{position:fixed;bottom:30px;left:40px;right:40px;border-top:1px solid #ccd;padding-top:8px;font:12px Arial;color:#56607f;text-align:center}</style>' +
      '<header><img src="' + location.origin + location.pathname.replace(/gestion\/.*$/, '') + 'assets/img/logo.png"><div><h1>O2S Consult</h1><small>Votre santé notre priorité · Libreville, Gabon</small></div></header><h2>' + (d.kind === 'ordonnance' ? 'Ordonnance' : 'Certificat médical') + '</h2>' +
      '<p><b>Patient :</b> ' + esc(p.nom) + (p.naissance ? ' — ' + age(p.naissance) : '') + '<br><b>Date :</b> ' + fdate(d.date) + '</p><pre>' + esc(d.contenu) + '</pre><div class="sig">' + esc(DB.set.medecin) + '<br><small>Signature et cachet</small></div><footer>WhatsApp +241 077 06 23 10 · o2sconsult26@gmail.com — Document de démonstration</footer><script>setTimeout(function(){print()},400)<\/script>';
  }

  // ---------- Actions ----------
  function val(id) { var e = document.getElementById(id); return e ? e.value : ''; }
  var A = {
    enter: function () { try { sessionStorage.setItem('o2sIn', '1'); } catch (e) {} $('#login').hidden = true; },
    logout: function () { try { sessionStorage.removeItem('o2sIn'); } catch (e) {} $('#login').hidden = false; },
    back: function () { if (history.length > 1) history.back(); else location.hash = '#/dashboard'; },
    mclose: closeModal,
    'mclose-bg': function (e) { if (e.target.classList.contains('modal')) closeModal(); },
    'new-rdv': function (e, el) { rdvModal(null, { patient: el.dataset.patient, date: el.dataset.date, heure: el.dataset.heure }); },
    'edit-rdv': function (e, el) { rdvModal(el.dataset.id); },
    'save-rdv': function (e, el) {
      var id = el.dataset.id, type = val('m-type'), mode = val('m-mode');
      if (type === 'telephone' && mode === 'especes') mode = 'airtel';
      var r = id ? rdvById(id) : { id: uid('r'), pay: { recu: false }, extra: 0, cr: '' };
      var changedType = r.type !== type;
      r.patientId = val('m-pat'); r.type = type; r.date = val('m-date'); r.heure = val('m-heure'); r.adresse = val('m-adr'); r.motif = val('m-motif'); r.statut = val('m-stat');
      r.pay.mode = mode; r.pay.ref = val('m-ref'); if (!id || changedType) r.pay.montant = price(type);
      if (r.statut === 'confirme' || r.statut === 'realise') r.pay.recu = true;
      if (!id) DB.rdv.push(r);
      save(); closeModal(); refresh(); toast('Rendez-vous enregistré');
    },
    'del-rdv': function (e, el) { if (confirm('Supprimer ce rendez-vous ?')) { DB.rdv = DB.rdv.filter(function (r) { return r.id !== el.dataset.id; }); save(); closeModal(); refresh(); } },
    'ask-pay': function (e, el) {
      var r = rdvById(el.dataset.id), p = pat(r.patientId); r.statut = 'attente'; save(); refresh();
      var msg = 'Bonjour ' + p.nom + ', ici O2S Consult. Pour confirmer votre consultation ' + (r.type === 'domicile' ? 'à domicile' : 'téléphonique') + ' du ' + fdate(r.date) + ' à ' + r.heure + ', merci de régler ' + fcfa(price(r.type)) + ' via Airtel Money puis de nous envoyer la preuve de règlement.';
      window.open(wa(p.tel, msg), '_blank', 'noopener');
    },
    paid: function (e, el) {
      var r = rdvById(el.dataset.id); r.statut = 'confirme'; r.pay.recu = true;
      if (r.pay.mode === 'airtel' && !r.pay.ref) r.pay.ref = 'AM-' + Math.floor(40000 + Math.random() * 9999);
      save(); refresh(); toast('Paiement enregistré — rendez-vous confirmé');
    },
    consult: function (e, el) { consultModal(el.dataset.id); },
    'save-consult': function (e, el) { var r = rdvById(el.dataset.id); r.cr = val('c-cr'); r.extra = +val('c-extra') || 0; r.statut = 'realise'; r.pay.recu = true; save(); closeModal(); refresh(); toast('Consultation enregistrée'); },
    cancel: function (e, el) { cancelModal(el.dataset.id); },
    'do-cancel': function (e, el) { var r = rdvById(el.dataset.id); r.statut = 'annule'; if (el.dataset.refund === '1') r.pay.refund = 'due'; save(); closeModal(); refresh(); toast(el.dataset.refund === '1' ? 'Annulé — remboursement à effectuer' : 'Rendez-vous annulé'); },
    refunded: function (e, el) { var r = rdvById(el.dataset.id); r.statut = 'rembourse'; r.pay.refund = 'done'; save(); refresh(); toast('Remboursement enregistré'); },
    filtre: function (e, el) { state.filtre = el.dataset.v; refresh(); },
    search: function (e, el) { state.q = el.value; var p = el.selectionStart; refresh(); var i = $('#q'); i.focus(); i.setSelectionRange(p, p); },
    psearch: function (e, el) { state.pq = el.value; var p = el.selectionStart; refresh(); var i = $('input[data-act=psearch]'); i.focus(); i.setSelectionRange(p, p); },
    day: function (e, el) { var v = +el.dataset.v; state.day = v === 0 ? todayISO() : addDays(state.day, v); refresh(); },
    'new-patient': function () { patientModal(); },
    'edit-patient': function (e, el) { patientModal(el.dataset.id); },
    'save-patient': function (e, el) {
      if (!val('p-nom').trim() || !val('p-tel').trim()) { toast('Nom et téléphone obligatoires'); return; }
      var id = el.dataset.id, p = id ? pat(id) : { id: uid('p') };
      p.nom = val('p-nom').trim(); p.tel = val('p-tel').trim(); p.naissance = val('p-nai'); p.sexe = val('p-sexe'); p.quartier = val('p-qua'); p.assurance = val('p-ass'); p.allergies = val('p-all'); p.antecedents = val('p-ant'); p.notes = val('p-not');
      if (!id) DB.patients.push(p);
      save(); closeModal(); refresh(); toast('Fiche enregistrée');
    },
    'new-doc': function (e, el) { var rid = el.dataset.rdv || ''; if (rid) { var r = rdvById(rid); closeModal(); docModal(el.dataset.kind, rid); } else docModal(el.dataset.kind); },
    'save-doc': function (e, el) {
      var d = { id: uid('d'), patientId: val('d-pat'), rdvId: el.dataset.rdv || '', kind: el.dataset.kind, date: todayISO(), contenu: val('d-txt') };
      DB.docs.push(d); save(); closeModal(); refresh(); toast('Document enregistré');
      var w = window.open('', '_blank'); if (w) { w.document.write(docHTML(d)); w.document.close(); }
    },
    'print-doc': function (e, el) { var d = DB.docs.filter(function (x) { return x.id === el.dataset.id; })[0]; var w = window.open('', '_blank'); if (w) { w.document.write(docHTML(d)); w.document.close(); } },
    'send-doc': function (e, el) { var d = DB.docs.filter(function (x) { return x.id === el.dataset.id; })[0], p = pat(d.patientId); window.open(wa(p.tel, 'Bonjour ' + p.nom + ', voici votre ' + (d.kind === 'ordonnance' ? 'ordonnance' : 'certificat médical') + ' (O2S Consult) :\n\n' + d.contenu), '_blank', 'noopener'); },
    'save-set': function () { var s = DB.set; s.tel = +val('s-tel') || 0; s.dom = +val('s-dom') || 0; s.delaiTel = +val('s-dt') || 0; s.delaiDom = +val('s-dd') || 0; s.medecin = val('s-med'); save(); toast('Paramètres enregistrés'); },
    export: function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(DB, null, 1)], { type: 'application/json' })); a.download = 'o2s-gestion-export.json'; a.click(); },
    reset: function () { if (confirm('Remettre les données de démonstration ?')) { DB = window.O2S_SEED(); save(); refresh(); toast('Démo réinitialisée'); } }
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || el.tagName === 'INPUT') return;
    var f = A[el.dataset.act]; if (f) { if (el.tagName === 'A') e.preventDefault(); f(e, el); }
  });
  document.addEventListener('input', function (e) { var el = e.target; if (el.dataset && (el.dataset.act === 'search' || el.dataset.act === 'psearch')) A[el.dataset.act](e, el); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  window.addEventListener('hashchange', route);

  load(); route();
  try { if (sessionStorage.getItem('o2sIn')) $('#login').hidden = true; } catch (e) {}
})();
