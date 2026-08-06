import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_BASE64 = fs.readFileSync(path.join(__dirname, 'assets', 'logo.png')).toString('base64');

const BASE_STYLE = `
  @page { margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Noto Sans", "DejaVu Sans", Arial, sans-serif;
    color: #141312;
    font-size: 13px;
  }
  .page { padding: 28px 40px 0 40px; }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid #141312;
    padding-bottom: 14px;
    margin-bottom: 18px;
  }
  .header .col { font-size: 11px; line-height: 1.6; }
  .header .col.right { text-align: right; }
  .header .logo { text-align: center; }
  .header .logo img { height: 68px; }
  .header .logo .autorisation {
    margin-top: 4px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
  h1.titre {
    text-align: center;
    font-size: 19px;
    letter-spacing: 1px;
    margin: 4px 0 20px 0;
    text-transform: uppercase;
  }
  table.champs { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
  table.champs td {
    padding: 7px 4px;
    border-bottom: 1px dotted #999;
    vertical-align: bottom;
    font-size: 13px;
  }
  table.champs td.fr { width: 62%; }
  table.champs td.fr .label { font-weight: 700; }
  table.champs td.fr .valeur { margin-left: 6px; }
  table.champs td.ar {
    width: 38%;
    text-align: right;
    direction: rtl;
    font-family: "Noto Naskh Arabic", "Noto Sans Arabic", "Arial", sans-serif;
    font-size: 13px;
    color: #3a3a3a;
  }
  .banniere {
    background: #141312;
    color: #fff;
    text-align: center;
    padding: 14px 10px;
    margin: 22px 0 16px 0;
    font-weight: 700;
    letter-spacing: 0.5px;
    line-height: 1.6;
  }
  .banniere .ligne1 { font-size: 14px; }
  .banniere .ligne2 { font-size: 16px; text-transform: uppercase; }
  .filieres { margin-bottom: 20px; }
  .filiere {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 10px 16px;
    margin-bottom: 10px;
    font-weight: 700;
    letter-spacing: 0.3px;
  }
  .filiere.coche { background: #f4ecd8; border-color: #b8952e; }
  .case {
    width: 18px;
    height: 18px;
    border: 2px solid #141312;
    display: inline-block;
    text-align: center;
    line-height: 14px;
    font-size: 14px;
    font-weight: 700;
  }
  .case.pleine { background: #141312; color: #fff; }
  .meta {
    font-size: 11px;
    color: #555;
    margin-top: 8px;
  }
  .footer {
    background: #141312;
    color: #fff;
    text-align: center;
    padding: 10px;
    font-size: 11px;
    letter-spacing: 0.3px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }
`;

function headerHtml() {
  return `
    <div class="header">
      <div class="col left">
        www.ecolemessage.com<br>
        Boulevard Mohammed V, Rue Lot Rif 1<br>
        35100 Guercif, Maroc
      </div>
      <div class="logo">
        <img src="data:image/png;base64,${LOGO_BASE64}" alt="École Le Message">
        <div class="autorisation">AUTORISATION MINISTÉRIELLE — 3 mars 2004</div>
      </div>
      <div class="col right">
        +212 535 676 525<br>
        +212 654 855 724 (WhatsApp)<br>
        ecolelemessage@gmail.com
      </div>
    </div>
  `;
}

function footerHtml() {
  return `<div class="footer">École Le Message — Boulevard Mohammed V, Rue Lot Rif 1, 35100 Guercif, Maroc</div>`;
}

function nowFr() {
  return new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' });
}

export function buildAdmissionHtml(f) {
  const rows = [
    ['Nom', f.nom, 'الاسم العائلي'],
    ['Prénom', f.prenom, 'الاسم الشخصي'],
    ['Date de naissance', f.dateNaissance, 'تاريخ الازدياد'],
    ['Lieu de naissance', f.lieuNaissance, 'مكان الازدياد'],
    ['Téléphone', f.telephone, 'الهاتف'],
    ['Adresse e-mail', f.email, 'العنوان الالكتروني'],
    ['Adresse', f.adresse, 'العنوان'],
    ['Ville', f.ville, 'المدينة'],
    ['Nom du père ou tuteur', f.nomTuteur, 'اسم الاب او ولي الامر'],
    ['Téléphone du père ou tuteur', f.telTuteur, 'هاتف الاب او ولي الامر'],
  ];

  const rowsHtml = rows
    .map(
      ([label, value, ar]) => `
      <tr>
        <td class="fr"><span class="label">${label} :</span><span class="valeur">${value || ''}</span></td>
        <td class="ar">${ar} :</td>
      </tr>`
    )
    .join('');

  const isTsdi = f.specialite === 'TSDI';
  const isTsge = f.specialite === 'TSGE';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<style>${BASE_STYLE}</style>
</head>
<body>
  <div class="page">
    ${headerHtml()}
    <h1 class="titre">Demande d'inscription</h1>
    <table class="champs">${rowsHtml}</table>
    <div class="meta">Date d'inscription : ${nowFr()}</div>

    <div class="banniere">
      <div class="ligne1">J'ai l'honneur de solliciter mon inscription :</div>
      <div class="ligne2">Technicien Spécialisé en</div>
    </div>

    <div class="filieres">
      <div class="filiere ${isTsdi ? 'coche' : ''}">
        <span>Développement Informatique (TSDI)</span>
        <span class="case ${isTsdi ? 'pleine' : ''}">${isTsdi ? '&#10003;' : ''}</span>
      </div>
      <div class="filiere ${isTsge ? 'coche' : ''}">
        <span>Gestion d'Entreprise (TSGE)</span>
        <span class="case ${isTsge ? 'pleine' : ''}">${isTsge ? '&#10003;' : ''}</span>
      </div>
    </div>
  </div>
  ${footerHtml()}
</body>
</html>`;
}

export function buildContactHtml(f) {
  const rows = [
    ['Nom complet', f.nom],
    ['Email', f.email],
    ['Téléphone', f.telephone],
    ['Sujet', f.sujet],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) => `
      <tr>
        <td class="fr" style="width:100%;"><span class="label">${label} :</span><span class="valeur">${value || ''}</span></td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<style>${BASE_STYLE}</style>
</head>
<body>
  <div class="page">
    ${headerHtml()}
    <h1 class="titre">Nouveau message de contact</h1>
    <table class="champs">${rowsHtml}</table>
    <div class="meta">Reçu le : ${nowFr()}</div>

    <div class="banniere">
      <div class="ligne2">Message</div>
    </div>
    <p style="white-space:pre-wrap; line-height:1.6; font-size:13px;">${(f.message || '').replace(/</g, '&lt;')}</p>
  </div>
  ${footerHtml()}
</body>
</html>`;
}
