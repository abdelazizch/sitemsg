import express from 'express';
import { db } from './db.js';
import { requireAdmin, requireRole, verifyAdminCredentials, issueCsrfToken, verifyCsrf, loginLimiter, hashPassword } from './auth.js';
import bcrypt from 'bcryptjs';
import { sanitizeArticleHtml, htmlToPlainText } from './sanitize.js';
import { slugify, uniqueSlug } from './slug.js';
import { upload, processImage, buildSrcset, largestVariant } from './uploads.js';
import { logAction } from './audit.js';
import { siteHeader, siteFooter } from './site-shell.js';

const router = express.Router();

function clientIp(req) {
  return req.headers['cf-connecting-ip'] || req.ip;
}

function adminPage({ title, csrfToken, body }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — Administration</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" type="image/png" href="/assets/img/logo-noir.png">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css">
<link rel="stylesheet" href="/assets/vendor/quill/quill.snow.css">
<link rel="stylesheet" href="/assets/vendor/quill/quill-better-table.css">
<style>
  .admin-shell { max-width: 960px; margin: 2.5rem auto; padding: 0 1.25rem; }
  .admin-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
  .admin-table th, .admin-table td { text-align: left; padding: 0.6rem 0.5rem; border-bottom: 1px solid rgba(20,19,18,0.1); font-size: 0.92rem; }
  .admin-badge { display: inline-block; padding: 0.15rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
  .admin-badge.draft { background: #eee; color: #555; }
  .admin-badge.published { background: #dff3e3; color: #1e6b34; }
  .admin-badge.featured { background: #f4ecd8; color: #8A6A22; margin-left: 0.4rem; }
  .admin-actions a, .admin-actions button { font-size: 0.85rem; margin-right: 0.5rem; }
  .admin-form .champ { margin-bottom: 1.1rem; }
  .admin-form label { display: block; font-weight: 600; margin-bottom: 0.3rem; font-size: 0.9rem; }
  .admin-form input[type=text], .admin-form input[type=datetime-local], .admin-form textarea, .admin-form select {
    width: 100%; padding: 0.6rem 0.7rem; border-radius: 8px; border: 1px solid rgba(20,19,18,0.2); font-family: inherit; font-size: 0.95rem;
  }
  #editor { background: #fff; min-height: 320px; }
  .admin-error { background: #fdecea; color: #b3261e; padding: 0.8rem 1rem; border-radius: 8px; margin-bottom: 1.2rem; }
  .admin-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .btn-link { background: none; border: none; color: var(--bleu-petrole, #1E4D5C); text-decoration: underline; cursor: pointer; padding: 0; font: inherit; font-size: 0.85rem; }
</style>
</head>
<body>
<div class="admin-shell">
${body}
</div>
${csrfToken !== undefined ? '' : ''}
</body>
</html>`;
}

function csrfField(token) {
  return `<input type="hidden" name="_csrf" value="${token}">`;
}

// --- Auth ---

router.get('/admin/login', (req, res) => {
  if (req.session.admin) return res.redirect(302, '/admin/');
  const token = issueCsrfToken(req);
  const erreur = req.query.erreur === '1' ? '<p class="admin-error">Identifiants incorrects.</p>' : '';
  res.send(
    adminPage({
      title: 'Connexion',
      body: `
      <h1>Administration — École Le Message</h1>
      ${erreur}
      <form class="admin-form" method="POST" action="/admin/login" style="max-width:360px;">
        ${csrfField(token)}
        <div class="champ">
          <label for="username">Identifiant</label>
          <input type="text" id="username" name="username" required autocomplete="username">
        </div>
        <div class="champ">
          <label for="password">Mot de passe</label>
          <input type="password" id="password" name="password" required autocomplete="current-password">
        </div>
        <button class="btn btn-or" type="submit">Se connecter</button>
      </form>`,
    })
  );
});

router.post('/admin/login', loginLimiter, verifyCsrf, (req, res) => {
  const { username, password } = req.body;
  const user = verifyAdminCredentials(username, password);
  if (user) {
    req.session.admin = user.username;
    req.session.role = user.role;
    logAction(db, { user: user.username, action: 'login', ip: clientIp(req) });
    return res.redirect(302, '/admin/');
  }
  res.redirect(302, '/admin/login?erreur=1');
});

router.post('/admin/logout', requireAdmin, (req, res) => {
  logAction(db, { user: req.session.admin, action: 'logout', ip: clientIp(req) });
  req.session = null;
  res.redirect(302, '/admin/login');
});

// --- Dashboard ---

router.get('/admin/', requireAdmin, (req, res) => {
  const token = issueCsrfToken(req);
  const articles = db
    .prepare(`SELECT id, slug, title, status, featured, published_at, updated_at FROM articles ORDER BY updated_at DESC`)
    .all();

  const rows = articles
    .map(
      (a) => `
      <tr>
        <td>${a.title}</td>
        <td>
          <span class="admin-badge ${a.status}">${a.status === 'published' ? 'Publié' : 'Brouillon'}</span>
          ${a.featured ? '<span class="admin-badge featured">Épinglé</span>' : ''}
        </td>
        <td>${a.published_at ? a.published_at.slice(0, 16).replace('T', ' ') : '—'}</td>
        <td class="admin-actions">
          <a href="/admin/articles/${a.id}/edit">Modifier</a>
          <form style="display:inline" method="POST" action="/admin/articles/${a.id}/${a.status === 'published' ? 'unpublish' : 'publish'}">
            ${csrfField(token)}
            <button type="submit" class="btn-link">${a.status === 'published' ? 'Dépublier' : 'Publier'}</button>
          </form>
          <form style="display:inline" method="POST" action="/admin/articles/${a.id}/delete" onsubmit="return confirm('Supprimer définitivement cet article ?');">
            ${csrfField(token)}
            <button type="submit" class="btn-link">Supprimer</button>
          </form>
        </td>
      </tr>`
    )
    .join('');

  res.send(
    adminPage({
      title: 'Tableau de bord',
      body: `
      <div class="admin-topbar">
        <h1>Actualités — Administration</h1>
        <div>
          <a class="btn btn-outline-noir" href="/admin/journal">Journal</a>
          ${req.session.role === 'admin' ? '<a class="btn btn-outline-noir" href="/admin/utilisateurs">Utilisateurs</a>' : ''}
          <a class="btn btn-outline-noir" href="/admin/mot-de-passe">Mon mot de passe</a>
          <a class="btn btn-or" href="/admin/articles/new">+ Nouvel article</a>
          <form style="display:inline" method="POST" action="/admin/logout">${csrfField(token)}<button class="btn-link" type="submit">Déconnexion</button></form>
        </div>
      </div>
      <table class="admin-table">
        <thead><tr><th>Titre</th><th>Statut</th><th>Publication</th><th>Actions</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4">Aucun article pour le moment.</td></tr>'}</tbody>
      </table>`,
    })
  );
});

router.get('/admin/journal', requireAdmin, (req, res) => {
  const logs = db.prepare(`SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT 200`).all();
  const rows = logs
    .map((l) => `<tr><td>${l.created_at}</td><td>${l.admin_user}</td><td>${l.action}</td><td>${l.article_id || '—'}</td><td>${l.ip || '—'}</td></tr>`)
    .join('');
  res.send(
    adminPage({
      title: 'Journal',
      body: `
      <div class="admin-topbar"><h1>Journal d'activité</h1><a class="btn btn-outline-noir" href="/admin/">← Retour</a></div>
      <table class="admin-table">
        <thead><tr><th>Date</th><th>Admin</th><th>Action</th><th>Article</th><th>IP</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5">Aucune entrée.</td></tr>'}</tbody>
      </table>`,
    })
  );
});

// --- Mon mot de passe ---

router.get('/admin/mot-de-passe', requireAdmin, (req, res) => {
  const token = issueCsrfToken(req);
  const erreur = req.query.erreur ? `<p class="admin-error">${req.query.erreur === 'incorrect' ? 'Mot de passe actuel incorrect.' : req.query.erreur === 'mismatch' ? 'Les deux nouveaux mots de passe ne correspondent pas.' : 'Le nouveau mot de passe doit contenir au moins 8 caractères.'}</p>` : '';
  const succes = req.query.ok ? '<p style="background:#dff3e3; color:#1e6b34; padding:0.8rem 1rem; border-radius:8px; margin-bottom:1.2rem;">Mot de passe mis à jour.</p>' : '';
  res.send(
    adminPage({
      title: 'Mon mot de passe',
      body: `
      <div class="admin-topbar"><h1>Changer mon mot de passe</h1><a class="btn btn-outline-noir" href="/admin/">← Retour</a></div>
      ${erreur}${succes}
      <form class="admin-form" method="POST" action="/admin/mot-de-passe" style="max-width:360px;">
        ${csrfField(token)}
        <div class="champ">
          <label for="current_password">Mot de passe actuel</label>
          <input type="password" id="current_password" name="current_password" required autocomplete="current-password">
        </div>
        <div class="champ">
          <label for="new_password">Nouveau mot de passe (8 caractères minimum)</label>
          <input type="password" id="new_password" name="new_password" required minlength="8" autocomplete="new-password">
        </div>
        <div class="champ">
          <label for="new_password_confirm">Confirmer le nouveau mot de passe</label>
          <input type="password" id="new_password_confirm" name="new_password_confirm" required minlength="8" autocomplete="new-password">
        </div>
        <button class="btn btn-or" type="submit">Mettre à jour</button>
      </form>`,
    })
  );
});

router.post('/admin/mot-de-passe', requireAdmin, verifyCsrf, (req, res) => {
  const { current_password, new_password, new_password_confirm } = req.body;
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(req.session.admin);
  if (!user || !bcrypt.compareSync(current_password || '', user.password_hash)) {
    return res.redirect(302, '/admin/mot-de-passe?erreur=incorrect');
  }
  if (!new_password || new_password.length < 8) {
    return res.redirect(302, '/admin/mot-de-passe?erreur=court');
  }
  if (new_password !== new_password_confirm) {
    return res.redirect(302, '/admin/mot-de-passe?erreur=mismatch');
  }
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(hashPassword(new_password), user.id);
  logAction(db, { user: user.username, action: 'password_change', ip: clientIp(req) });
  res.redirect(302, '/admin/mot-de-passe?ok=1');
});

// --- Gestion des utilisateurs (admin uniquement) ---

router.get('/admin/utilisateurs', requireRole('admin'), (req, res) => {
  const token = issueCsrfToken(req);
  const users = db.prepare('SELECT id, username, role, created_at FROM admin_users ORDER BY created_at').all();
  const erreur = req.query.erreur ? `<p class="admin-error">${req.query.erreur === 'exists' ? 'Cet identifiant existe déjà.' : req.query.erreur === 'last' ? 'Impossible de supprimer le dernier compte administrateur.' : 'Mot de passe trop court (8 caractères minimum).'}</p>` : '';

  const rows = users
    .map(
      (u) => `
      <tr>
        <td>${u.username}</td>
        <td>${u.role === 'admin' ? 'Administrateur' : 'Rédacteur'}</td>
        <td>${u.created_at.slice(0, 10)}</td>
        <td class="admin-actions">
          ${u.username === req.session.admin ? '' : `
          <form style="display:inline" method="POST" action="/admin/utilisateurs/${u.id}/supprimer" onsubmit="return confirm('Supprimer ce compte ?');">
            ${csrfField(token)}
            <button type="submit" class="btn-link">Supprimer</button>
          </form>`}
        </td>
      </tr>`
    )
    .join('');

  res.send(
    adminPage({
      title: 'Utilisateurs',
      body: `
      <div class="admin-topbar"><h1>Utilisateurs</h1><a class="btn btn-outline-noir" href="/admin/">← Retour</a></div>
      ${erreur}
      <table class="admin-table">
        <thead><tr><th>Identifiant</th><th>Rôle</th><th>Créé le</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>

      <h2 style="margin-top:2.5rem;">Ajouter un rédacteur</h2>
      <form class="admin-form" method="POST" action="/admin/utilisateurs" style="max-width:360px;">
        ${csrfField(token)}
        <div class="champ">
          <label for="new_username">Identifiant</label>
          <input type="text" id="new_username" name="username" required autocomplete="off">
        </div>
        <div class="champ">
          <label for="new_user_password">Mot de passe (8 caractères minimum)</label>
          <input type="password" id="new_user_password" name="password" required minlength="8" autocomplete="new-password">
        </div>
        <div class="champ">
          <label><input type="checkbox" name="role_admin" value="1" style="width:auto; display:inline-block; margin-right:0.4rem;">Compte administrateur (peut gérer les autres comptes)</label>
        </div>
        <button class="btn btn-or" type="submit">Créer le compte</button>
      </form>`,
    })
  );
});

router.post('/admin/utilisateurs', requireRole('admin'), verifyCsrf, (req, res) => {
  const { username, password, role_admin } = req.body;
  if (!username || !password || password.length < 8) {
    return res.redirect(302, '/admin/utilisateurs?erreur=court');
  }
  const existing = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(username);
  if (existing) {
    return res.redirect(302, '/admin/utilisateurs?erreur=exists');
  }
  db.prepare('INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)').run(
    username,
    hashPassword(password),
    role_admin ? 'admin' : 'writer'
  );
  logAction(db, { user: req.session.admin, action: 'create_user', details: username, ip: clientIp(req) });
  res.redirect(302, '/admin/utilisateurs');
});

router.post('/admin/utilisateurs/:id/supprimer', requireRole('admin'), verifyCsrf, (req, res) => {
  const target = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.params.id);
  if (!target) return res.redirect(302, '/admin/utilisateurs');
  if (target.username === req.session.admin) return res.redirect(302, '/admin/utilisateurs');

  const adminCount = db.prepare("SELECT COUNT(*) c FROM admin_users WHERE role = 'admin'").get().c;
  if (target.role === 'admin' && adminCount <= 1) {
    return res.redirect(302, '/admin/utilisateurs?erreur=last');
  }

  db.prepare('DELETE FROM admin_users WHERE id = ?').run(target.id);
  logAction(db, { user: req.session.admin, action: 'delete_user', details: target.username, ip: clientIp(req) });
  res.redirect(302, '/admin/utilisateurs');
});

// --- Article form (shared by create/edit) ---

function articleForm({ csrfToken, article, categories, tags, error, action }) {
  const publishedAtValue = article?.published_at ? article.published_at.slice(0, 16) : '';
  return `
    <div class="admin-topbar"><h1>${article ? 'Modifier' : 'Nouvel'} article</h1><a class="btn btn-outline-noir" href="/admin/">← Retour</a></div>
    ${error ? `<p class="admin-error">${error}</p>` : ''}
    <form class="admin-form" method="POST" action="${action}" enctype="multipart/form-data">
      ${csrfField(csrfToken)}
      <div class="champ">
        <label for="title">Titre</label>
        <input type="text" id="title" name="title" required value="${article?.title || ''}">
      </div>
      <div class="champ">
        <label for="slug">Slug (URL)</label>
        <input type="text" id="slug" name="slug" value="${article?.slug || ''}" placeholder="généré automatiquement si vide">
      </div>
      <div class="champ">
        <label for="excerpt">Extrait (résumé court)</label>
        <textarea id="excerpt" name="excerpt" rows="2">${article?.excerpt || ''}</textarea>
      </div>
      <div class="champ">
        <label for="content_html">Contenu</label>
        <div id="editor">${article?.content_html || ''}</div>
        <textarea name="content_html" id="content_html_field" style="display:none"></textarea>
      </div>
      <div class="champ">
        <label for="cover">Image de couverture ${article?.cover_image ? '(remplacer)' : ''}</label>
        <input type="file" id="cover" name="cover" accept="image/*">
        <input type="text" name="cover_image_alt" placeholder="Texte alternatif de l'image de couverture" value="${article?.cover_image_alt || ''}" style="margin-top:0.5rem;">
      </div>
      <div class="champ">
        <label for="category">Catégorie</label>
        <input type="text" id="category" name="category" list="categories-list" value="${article?.category_name || ''}" placeholder="ex. Vie scolaire">
        <datalist id="categories-list">${categories.map((c) => `<option value="${c.name}">`).join('')}</datalist>
      </div>
      <div class="champ">
        <label for="tags">Tags (séparés par des virgules)</label>
        <input type="text" id="tags" name="tags" value="${article?.tag_names || ''}" placeholder="ex. inscription, tsdi, portes ouvertes">
      </div>
      <div class="champ">
        <label for="seo_title">Titre SEO (optionnel, sinon le titre est réutilisé)</label>
        <input type="text" id="seo_title" name="seo_title" value="${article?.seo_title || ''}">
      </div>
      <div class="champ">
        <label for="meta_description">Meta description SEO (optionnel, sinon l'extrait est réutilisé)</label>
        <textarea id="meta_description" name="meta_description" rows="2">${article?.meta_description || ''}</textarea>
      </div>
      <div class="champ">
        <label><input type="checkbox" name="featured" value="1" ${article?.featured ? 'checked' : ''} style="width:auto; display:inline-block; margin-right:0.4rem;">Article épinglé (mis en avant)</label>
      </div>
      <div class="champ">
        <label for="published_at">Date de publication (laisser vide = brouillon ; date future = publication programmée)</label>
        <input type="datetime-local" id="published_at" name="published_at" value="${publishedAtValue}">
      </div>
      <button class="btn btn-or" type="submit">Enregistrer</button>
    </form>

    <script src="/assets/vendor/quill/quill.min.js"></script>
    <script src="/assets/vendor/quill/quill-better-table.js"></script>
    <script src="/assets/admin/editor.js"></script>
  `;
}

function getCategoriesAndTagsMeta() {
  const categories = db.prepare('SELECT id, slug, name FROM categories ORDER BY name').all();
  return { categories };
}

router.get('/admin/articles/new', requireAdmin, (req, res) => {
  const token = issueCsrfToken(req);
  const { categories } = getCategoriesAndTagsMeta();
  res.send(adminPage({ title: 'Nouvel article', body: articleForm({ csrfToken: token, article: null, categories, action: '/admin/articles' }) }));
});

router.get('/admin/articles/:id/edit', requireAdmin, (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).send('Article introuvable.');
  const cat = article.category_id ? db.prepare('SELECT name FROM categories WHERE id = ?').get(article.category_id) : null;
  const tagRows = db
    .prepare('SELECT t.name FROM tags t JOIN article_tags at ON at.tag_id = t.id WHERE at.article_id = ?')
    .all(article.id);
  article.category_name = cat?.name || '';
  article.tag_names = tagRows.map((t) => t.name).join(', ');

  const token = issueCsrfToken(req);
  const { categories } = getCategoriesAndTagsMeta();
  res.send(
    adminPage({ title: 'Modifier l’article', body: articleForm({ csrfToken: token, article, categories, action: `/admin/articles/${article.id}` }) })
  );
});

// --- Helpers for save ---

function resolveCategoryId(categoryName) {
  const name = (categoryName || '').trim();
  if (!name) return null;
  const slug = slugify(name);
  const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
  if (existing) return existing.id;
  const info = db.prepare('INSERT INTO categories (slug, name) VALUES (?, ?)').run(slug, name);
  return info.lastInsertRowid;
}

function resolveTagIds(tagsCsv) {
  const names = (tagsCsv || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  return names.map((name) => {
    const slug = slugify(name);
    const existing = db.prepare('SELECT id FROM tags WHERE slug = ?').get(slug);
    if (existing) return existing.id;
    const info = db.prepare('INSERT INTO tags (slug, name) VALUES (?, ?)').run(slug, name);
    return info.lastInsertRowid;
  });
}

function wrapCaptions(html) {
  return html.replace(
    /<img([^>]*?)\sdata-caption="([^"]*)"([^>]*)>/g,
    (m, before, caption, after) => {
      if (!caption) return `<img${before}${after}>`;
      return `<figure><img${before}${after}><figcaption>${caption}</figcaption></figure>`;
    }
  );
}

async function saveArticle(req, res, { existing }) {
  try {
    const { title, excerpt, seo_title, meta_description, category, tags, published_at } = req.body;
    let contentHtml = sanitizeArticleHtml(wrapCaptions(req.body.content_html || ''));
    const contentText = htmlToPlainText(contentHtml);

    if (!title || !title.trim()) {
      throw new Error('Le titre est obligatoire.');
    }

    let slug = (req.body.slug || '').trim();
    slug = slug ? slugify(slug) : slugify(title);
    slug = uniqueSlug(db, slug, existing ? existing.id : null);

    const categoryId = resolveCategoryId(category);
    const tagIds = resolveTagIds(tags);
    const featured = req.body.featured ? 1 : 0;
    const publishedAtIso = published_at ? published_at.replace('T', ' ') + ':00' : null;
    const status = publishedAtIso ? 'published' : 'draft';

    let coverImage = existing?.cover_image || null;
    const coverAlt = req.body.cover_image_alt || '';

    if (req.file) {
      const { basePath, widths } = await processImage(req.file.buffer);
      coverImage = JSON.stringify({ basePath, widths });
    }

    let articleId;
    if (existing) {
      db.prepare(
        `UPDATE articles SET title=?, seo_title=?, excerpt=?, meta_description=?, content_html=?, content_text=?, category_id=?, cover_image=?, cover_image_alt=?, featured=?, status=?, published_at=?, slug=?, updated_at=datetime('now') WHERE id=?`
      ).run(title, seo_title || null, excerpt || null, meta_description || null, contentHtml, contentText, categoryId, coverImage, coverAlt, featured, status, publishedAtIso, slug, existing.id);
      articleId = existing.id;
      db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(articleId);
    } else {
      const info = db
        .prepare(
          `INSERT INTO articles (slug, title, seo_title, excerpt, meta_description, content_html, content_text, category_id, cover_image, cover_image_alt, featured, status, published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
        )
        .run(slug, title, seo_title || null, excerpt || null, meta_description || null, contentHtml, contentText, categoryId, coverImage, coverAlt, featured, status, publishedAtIso);
      articleId = info.lastInsertRowid;
    }

    for (const tagId of tagIds) {
      db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)').run(articleId, tagId);
    }

    logAction(db, { user: req.session.admin, action: existing ? 'update' : 'create', articleId, ip: clientIp(req) });
    res.redirect(302, '/admin/');
  } catch (err) {
    console.error(err);
    const { categories } = getCategoriesAndTagsMeta();
    const token = issueCsrfToken(req);
    res.status(400).send(
      adminPage({
        title: existing ? 'Modifier l’article' : 'Nouvel article',
        body: articleForm({
          csrfToken: token,
          article: { ...req.body, id: existing?.id, category_name: req.body.category, tag_names: req.body.tags },
          categories,
          error: `Échec de l'enregistrement : ${err.message}`,
          action: existing ? `/admin/articles/${existing.id}` : '/admin/articles',
        }),
      })
    );
  }
}

router.post('/admin/articles', requireAdmin, upload.single('cover'), verifyCsrf, (req, res) => saveArticle(req, res, { existing: null }));

router.post('/admin/articles/:id', requireAdmin, upload.single('cover'), verifyCsrf, (req, res) => {
  const existing = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).send('Article introuvable.');
  return saveArticle(req, res, { existing });
});

router.post('/admin/articles/:id/publish', requireAdmin, verifyCsrf, (req, res) => {
  db.prepare(`UPDATE articles SET status='published', published_at=COALESCE(published_at, datetime('now')), updated_at=datetime('now') WHERE id=?`).run(req.params.id);
  logAction(db, { user: req.session.admin, action: 'publish', articleId: req.params.id, ip: clientIp(req) });
  res.redirect(302, '/admin/');
});

router.post('/admin/articles/:id/unpublish', requireAdmin, verifyCsrf, (req, res) => {
  db.prepare(`UPDATE articles SET status='draft', updated_at=datetime('now') WHERE id=?`).run(req.params.id);
  logAction(db, { user: req.session.admin, action: 'unpublish', articleId: req.params.id, ip: clientIp(req) });
  res.redirect(302, '/admin/');
});

router.post('/admin/articles/:id/delete', requireAdmin, verifyCsrf, (req, res) => {
  db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
  logAction(db, { user: req.session.admin, action: 'delete', articleId: req.params.id, ip: clientIp(req) });
  res.redirect(302, '/admin/');
});

// --- Image upload for the rich editor ---

router.post('/api/admin/upload', requireAdmin, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Échec de l'upload de l'image." });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier reçu.' });
    }
    try {
      const { basePath, widths } = await processImage(req.file.buffer);
      const url = largestVariant(basePath, widths);
      const srcset = buildSrcset(basePath, widths);
      db.prepare('INSERT INTO article_images (base_path, alt_text) VALUES (?, ?)').run(basePath, '');
      res.json({ url, srcset, sizes: '(max-width: 800px) 100vw, 800px' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Erreur serveur lors du traitement de l'image." });
    }
  });
});

export default router;
