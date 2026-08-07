import bcrypt from 'bcryptjs';
import cookieSession from 'cookie-session';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

const SESSION_SECRET = process.env.SESSION_SECRET;
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

if (!SESSION_SECRET) {
  console.warn('[auth] SESSION_SECRET is not set — admin login will not work until it is configured.');
}

export function sessionMiddleware() {
  return cookieSession({
    name: 'lm_admin_session',
    secret: SESSION_SECRET || 'dev-only-insecure-secret',
    maxAge: 12 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
  });
}

export function verifyAdminCredentials(username, password) {
  if (!ADMIN_USER || !ADMIN_PASSWORD_HASH) return false;
  if (username !== ADMIN_USER) return false;
  return bcrypt.compareSync(password || '', ADMIN_PASSWORD_HASH);
}

export function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  return res.redirect(302, '/admin/login');
}

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['cf-connecting-ip'] || req.ip,
  message: 'Trop de tentatives de connexion. Réessayez dans quelques minutes.',
});

export function issueCsrfToken(req) {
  if (!req.session.csrf) {
    req.session.csrf = crypto.randomBytes(24).toString('hex');
  }
  return req.session.csrf;
}

export function verifyCsrf(req, res, next) {
  const token = req.body._csrf;
  if (!token || !req.session.csrf || token !== req.session.csrf) {
    return res.status(403).send('Session expirée ou jeton de sécurité invalide. Rechargez la page et réessayez.');
  }
  next();
}
