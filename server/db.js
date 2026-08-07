import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = process.env.DB_PATH || '/data/lemessage/actualites.db';
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/data/lemessage/uploads';

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    seo_title TEXT,
    excerpt TEXT,
    meta_description TEXT,
    content_html TEXT NOT NULL DEFAULT '',
    content_text TEXT NOT NULL DEFAULT '',
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    cover_image TEXT,
    cover_image_alt TEXT,
    featured INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
    published_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS article_tags (
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
  );

  CREATE TABLE IF NOT EXISTS article_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    base_path TEXT NOT NULL,
    alt_text TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'writer' CHECK (role IN ('admin','writer')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admin_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_user TEXT NOT NULL,
    action TEXT NOT NULL,
    article_id INTEGER,
    details TEXT,
    ip TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5 (
    title, excerpt, content_text, content='articles', content_rowid='id'
  );

  CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
    INSERT INTO articles_fts(rowid, title, excerpt, content_text)
    VALUES (new.id, new.title, new.excerpt, new.content_text);
  END;

  CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
    INSERT INTO articles_fts(articles_fts, rowid, title, excerpt, content_text)
    VALUES ('delete', old.id, old.title, old.excerpt, old.content_text);
  END;

  CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
    INSERT INTO articles_fts(articles_fts, rowid, title, excerpt, content_text)
    VALUES ('delete', old.id, old.title, old.excerpt, old.content_text);
    INSERT INTO articles_fts(rowid, title, excerpt, content_text)
    VALUES (new.id, new.title, new.excerpt, new.content_text);
  END;
`);

// Amorçage idempotent : si aucun compte n'existe encore, on crée le premier
// compte admin à partir des variables d'environnement (ADMIN_USER /
// ADMIN_PASSWORD_HASH). Ensuite, tous les comptes vivent dans la base et se
// gèrent depuis l'interface d'administration (changement de mot de passe,
// ajout de rédacteurs) — les variables d'environnement ne servent plus.
const userCount = db.prepare('SELECT COUNT(*) c FROM admin_users').get().c;
if (userCount === 0 && process.env.ADMIN_USER && process.env.ADMIN_PASSWORD_HASH) {
  db.prepare('INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)').run(
    process.env.ADMIN_USER,
    process.env.ADMIN_PASSWORD_HASH,
    'admin'
  );
  console.log(`[db] Compte admin initial créé depuis les variables d'environnement : ${process.env.ADMIN_USER}`);
}

export { UPLOAD_DIR };
