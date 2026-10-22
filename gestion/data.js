/* Données de démonstration (fictives) — dates calculées par rapport à aujourd'hui */
(function () {
  function iso(off) {
    var d = new Date(); d.setDate(d.getDate() + off);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  window.O2S_SEED = function () {
    var patients = [
      { id: 'p1', nom: 'Marie Obame', tel: '+241 066 11 22 33', naissance: '1988-04-12', sexe: 'F', quartier: 'Louis', assurance: 'CNAMGS', allergies: 'Pénicilline', antecedents: 'Hypertension légère', notes: '' },
      { id: 'p2', nom: 'Jean-Claude Nzé', tel: '+241 077 44 55 66', naissance: '1975-09-30', sexe: 'M', quartier: 'Akanda', assurance: 'Aucune', allergies: '', antecedents: 'Diabète de type 2', notes: 'Renouvellement mensuel' },
      { id: 'p3', nom: 'Sandrine Mba', tel: '+241 062 77 88 99', naissance: '2016-02-08', sexe: 'F', quartier: 'Glass', assurance: 'Assurance privée', allergies: '', antecedents: '', notes: 'Enfant — parent : M. Mba' },
      { id: 'p4', nom: 'Paul Ndong', tel: '+241 074 12 34 56', naissance: '1992-11-21', sexe: 'M', quartier: 'Nzeng-Ayong', assurance: 'Aucune', allergies: 'Aucune connue', antecedents: '', notes: '' },
      { id: 'p5', nom: 'Aïcha Moussavou', tel: '+241 065 98 76 54', naissance: '1965-06-17', sexe: 'F', quartier: 'Batterie IV', assurance: 'CNAMGS', allergies: '', antecedents: 'Asthme', notes: '' }
    ];
    var rdv = [
      { id: 'r1', patientId: 'p2', type: 'telephone', date: iso(0), heure: '09:00', statut: 'confirme', motif: 'Renouvellement ordonnance diabète', adresse: '', pay: { mode: 'airtel', montant: 15000, ref: 'AM-48213', recu: true }, extra: 0, cr: '' },
      { id: 'r2', patientId: 'p3', type: 'domicile', date: iso(0), heure: '11:00', statut: 'confirme', motif: 'Fièvre depuis 2 jours', adresse: 'Glass, près de la pharmacie', pay: { mode: 'especes', montant: 30000, ref: '', recu: false }, extra: 0, cr: '' },
      { id: 'r3', patientId: 'p1', type: 'telephone', date: iso(0), heure: '15:30', statut: 'attente', motif: 'Maux de tête persistants', adresse: '', pay: { mode: 'airtel', montant: 15000, ref: '', recu: false }, extra: 0, cr: '' },
      { id: 'r4', patientId: 'p4', type: 'domicile', date: iso(1), heure: '10:00', statut: 'attente', motif: 'Douleur dorsale', adresse: 'Nzeng-Ayong, rue de l\'école', pay: { mode: 'airtel', montant: 30000, ref: '', recu: false }, extra: 0, cr: '' },
      { id: 'r5', patientId: 'p5', type: 'telephone', date: iso(-1), heure: '17:00', statut: 'realise', motif: 'Crise d\'asthme légère', adresse: '', pay: { mode: 'airtel', montant: 15000, ref: 'AM-47990', recu: true }, extra: 0, cr: 'Conseils donnés, traitement de fond rappelé. Contrôle si aggravation.' },
      { id: 'r6', patientId: 'p1', type: 'domicile', date: iso(-2), heure: '09:30', statut: 'realise', motif: 'Suivi tension', adresse: 'Louis', pay: { mode: 'especes', montant: 30000, ref: '', recu: true }, extra: 5000, cr: 'TA 14/9. Mesures hygiéno-diététiques. Petit pansement réalisé (soins additionnels).' },
      { id: 'r7', patientId: 'p2', type: 'telephone', date: iso(-3), heure: '12:00', statut: 'rembourse', motif: 'Annulation patient', adresse: '', pay: { mode: 'airtel', montant: 15000, ref: 'AM-47611', recu: true }, extra: 0, cr: '' },
      { id: 'r8', patientId: 'p3', type: 'telephone', date: iso(-4), heure: '18:00', statut: 'realise', motif: 'Toux', adresse: '', pay: { mode: 'airtel', montant: 15000, ref: 'AM-47412', recu: true }, extra: 0, cr: 'Toux virale probable. Hydratation, repos.' },
      { id: 'r9', patientId: 'p4', type: 'domicile', date: iso(-5), heure: '08:30', statut: 'realise', motif: 'Certificat médical', adresse: 'Nzeng-Ayong', pay: { mode: 'especes', montant: 30000, ref: '', recu: true }, extra: 0, cr: 'Certificat établi.' }
    ];
    var docs = [
      { id: 'd1', patientId: 'p5', rdvId: 'r5', kind: 'ordonnance', date: iso(-1), contenu: 'Salbutamol — 2 bouffées si gêne respiratoire.\nContrôle si aggravation.' },
      { id: 'd2', patientId: 'p4', rdvId: 'r9', kind: 'certificat', date: iso(-5), contenu: 'Atteste avoir examiné ce jour le patient et constate un état nécessitant 2 jours de repos.' }
    ];
    return { v: 1, patients: patients, rdv: rdv, docs: docs, set: { tel: 15000, dom: 30000, medecin: 'Dr (démo)', whatsapp: '241077062310', delaiTel: 1, delaiDom: 2 }, seq: 100 };
  };
})();
