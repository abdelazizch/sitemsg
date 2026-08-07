import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { UPLOAD_DIR } from './db.js';

const WIDTHS = [480, 960, 1600];
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error('Format d\'image non supporté (JPEG, PNG, WebP ou GIF uniquement).'));
    }
    cb(null, true);
  },
});

// Processes an uploaded image buffer: writes WebP variants at several widths.
// Returns { basePath, widths } where basePath is a public URL prefix like
// /uploads/2026/08/ab12cd34 and files exist as `${basePath}-{width}w.webp`.
export async function processImage(buffer) {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dir = path.join(UPLOAD_DIR, yyyy, mm);
  fs.mkdirSync(dir, { recursive: true });

  const name = crypto.randomBytes(8).toString('hex');
  const image = sharp(buffer).rotate();
  const metadata = await image.metadata();
  const sourceWidth = metadata.width || 1600;

  const widths = WIDTHS.filter((w) => w <= sourceWidth);
  if (widths.length === 0) widths.push(sourceWidth);

  await Promise.all(
    widths.map((w) =>
      sharp(buffer)
        .rotate()
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(path.join(dir, `${name}-${w}w.webp`))
    )
  );

  return { basePath: `/uploads/${yyyy}/${mm}/${name}`, widths };
}

export function buildSrcset(basePath, widths) {
  return widths.map((w) => `${basePath}-${w}w.webp ${w}w`).join(', ');
}

export function largestVariant(basePath, widths) {
  const w = widths[widths.length - 1];
  return `${basePath}-${w}w.webp`;
}
