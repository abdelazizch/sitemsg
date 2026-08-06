import express from 'express';
import rateLimit from 'express-rate-limit';
import { renderPdf } from './render.js';
import { buildAdmissionHtml, buildContactHtml } from './templates.js';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);

function clientIp(req) {
  return req.headers['cf-connecting-ip'] || req.ip;
}

function formLimiter(redirectTo) {
  return rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: clientIp,
    handler: (req, res) => res.redirect(303, `${redirectTo}?erreur=limite`),
  });
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = process.env.TO_EMAIL || 'ecolelemessage@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

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

app.post('/api/contact', formLimiter('/contact/'), async (req, res) => {
  try {
    if (req.body._honey) return res.redirect(303, '/contact/merci/');
    const html = buildContactHtml(req.body);
    const pdf = await renderPdf(html);
    await sendEmail({
      subject: 'Nouveau message — site École Le Message',
      pdfBuffer: pdf,
      filename: 'message-contact.pdf',
    });
    res.redirect(303, '/contact/merci/');
  } catch (err) {
    console.error(err);
    res.redirect(303, '/contact/?erreur=envoi');
  }
});

app.post('/api/admission', formLimiter('/admission/'), async (req, res) => {
  try {
    if (req.body._honey) return res.redirect(303, '/admission/merci/');
    const html = buildAdmissionHtml(req.body);
    const pdf = await renderPdf(html);
    await sendEmail({
      subject: "Nouvelle demande d'inscription — site École Le Message",
      pdfBuffer: pdf,
      filename: 'demande-admission.pdf',
    });
    res.redirect(303, '/admission/merci/');
  } catch (err) {
    console.error(err);
    res.redirect(303, '/admission/?erreur=envoi');
  }
});

app.listen(3000, () => console.log('API listening on :3000'));
