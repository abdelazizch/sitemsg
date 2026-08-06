import express from 'express';
import PDFDocument from 'pdfkit';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true);

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = process.env.TO_EMAIL || 'ecolelemessage@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

const CONTACT_LABELS = {
  nom: 'Nom complet',
  email: 'Email',
  telephone: 'Téléphone',
  sujet: 'Sujet',
  message: 'Message',
};

const ADMISSION_LABELS = {
  nom: 'Nom',
  prenom: 'Prénom',
  dateNaissance: 'Date de naissance',
  lieuNaissance: 'Lieu de naissance',
  telephone: 'Téléphone',
  email: 'Email',
  adresse: 'Adresse',
  ville: 'Ville',
  nomTuteur: 'Nom du père ou tuteur',
  telTuteur: 'Téléphone du père ou tuteur',
  specialite: 'Spécialisation',
};

function extractFields(body, labels) {
  const out = {};
  for (const [key, label] of Object.entries(labels)) {
    out[label] = body[key];
  }
  return out;
}

function buildPdf(title, fields) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text(title, { underline: true });
    doc.moveDown();
    doc.fontSize(10).fillColor('gray').text(
      new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Casablanca' })
    );
    doc.moveDown();
    doc.fontSize(12).fillColor('black');
    for (const [label, value] of Object.entries(fields)) {
      doc.font('Helvetica-Bold').text(`${label} :`);
      doc.font('Helvetica').text(String(value || '-'));
      doc.moveDown(0.5);
    }
    doc.end();
  });
}

async function sendEmail({ subject, pdfBuffer, filename }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `École Le Message <${FROM_EMAIL}>`,
      to: [TO_EMAIL],
      subject,
      text: 'Voir le PDF ci-joint.',
      attachments: [
        {
          filename,
          content: pdfBuffer.toString('base64'),
        },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error ${res.status}: ${text}`);
  }
}

app.post('/api/contact', async (req, res) => {
  try {
    if (req.body._honey) return res.redirect(303, '/contact/merci/');
    const fields = extractFields(req.body, CONTACT_LABELS);
    const pdf = await buildPdf('Nouveau message — Site École Le Message', fields);
    await sendEmail({
      subject: 'Nouveau message — site École Le Message',
      pdfBuffer: pdf,
      filename: 'message-contact.pdf',
    });
    res.redirect(303, '/contact/merci/');
  } catch (err) {
    console.error(err);
    res.redirect(303, '/contact/?erreur=1');
  }
});

app.post('/api/admission', async (req, res) => {
  try {
    if (req.body._honey) return res.redirect(303, '/admission/merci/');
    const fields = extractFields(req.body, ADMISSION_LABELS);
    const pdf = await buildPdf("Nouvelle demande d'inscription — Site École Le Message", fields);
    await sendEmail({
      subject: "Nouvelle demande d'inscription — site École Le Message",
      pdfBuffer: pdf,
      filename: 'demande-admission.pdf',
    });
    res.redirect(303, '/admission/merci/');
  } catch (err) {
    console.error(err);
    res.redirect(303, '/admission/?erreur=1');
  }
});

app.listen(3000, () => console.log('API listening on :3000'));
