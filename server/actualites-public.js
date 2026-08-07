import express from 'express';
import { db } from './db.js';
import { siteHeader, siteFooter, htmlHead } from './site-shell.js';

const router = express.Router();
const PAGE_SIZE = 9;

function page(activePath, headOpts, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
${htmlHead(headOpts)}
</head>
<body>
${siteHeader(activePath)}
<main id="contenu">
${bodyHtml}
</main>
${siteFooter()}
</body>
</html>`;
}

function coverImg(article, sizes) {
  if (!article.cover_image) return '';
  try {
    const { basePath, widths } = JSON.parse(article.cover_image);
    const srcset = widths.map((w) => `${basePath}-${w}w.webp ${w}w`).join(', ');
    const src = `${basePath}-${widths[widths.length - 1]}w.webp`;
    return `<img src="${src}" srcset="${srcset}" sizes="${sizes}" alt="${(article.cover_image_alt || '').replace(/"/g, '&quot;')}" loading="lazy">`;
  } catch {
    return '';
  }
}

function formatDate(dt) {
  if (!dt) return '';
  const d = new Date(dt.replace(' ', 'T') + 'Z');
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Casablanca' });
}

function articleCard(a) {
  return `
    <article class="pole-card" style="background:#fff; color:var(--noir); box-shadow:var(--ombre);">
      ${a.featured ? '<span class="badge-bientot" style="background:var(--or); color:var(--noir);">À la une</span>' : ''}
      ${coverImg(a, '(max-width: 700px) 100vw, 360px')}
      <h3><a href="/actualites/${a.slug}/">${a.title}</a></h3>
      <p style="color:var(--gris-chaud); font-size:0.85rem;">${formatDate(a.published_at)}${a.category_name ? ' · ' + a.category_name : ''}</p>
      <p>${a.excerpt || ''}</p>
      <a class="btn btn-outline-noir" href="/actualites/${a.slug}/">Lire l'article</a>
    </article>`;
}

router.get('/actualites/', (req, res) => {
  const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
  const q = (req.query.q || '').trim();
  const categorySlug = req.query.categorie;
  const tagSlug = req.query.tag;

  let where = `a.status = 'published' AND a.published_at <= datetime('now')`;
  const params = {};
  let join = 'LEFT JOIN categories c ON c.id = a.category_id';

  if (categorySlug) {
    where += ' AND c.slug = @categorySlug';
    params.categorySlug = categorySlug;
  }
  if (tagSlug) {
    join += ' JOIN article_tags at2 ON at2.article_id = a.id JOIN tags t2 ON t2.id = at2.tag_id AND t2.slug = @tagSlug';
    params.tagSlug = tagSlug;
  }

  let rows;
  let total;
  if (q) {
    const ftsRows = db
      .prepare(`SELECT rowid FROM articles_fts WHERE articles_fts MATCH @q`)
      .all({ q: q.split(/\s+/).filter(Boolean).map((w) => `${w}*`).join(' ') });
    const ids = ftsRows.map((r) => r.rowid);
    if (ids.length === 0) {
      rows = [];
      total = 0;
    } else {
      const idList = ids.join(',');
      total = db.prepare(`SELECT COUNT(*) c FROM articles a ${join} WHERE ${where} AND a.id IN (${idList})`).get(params).c;
      rows = db
        .prepare(
          `SELECT a.*, c.name as category_name FROM articles a ${join} WHERE ${where} AND a.id IN (${idList}) ORDER BY a.featured DESC, a.published_at DESC LIMIT @limit OFFSET @offset`
        )
        .all({ ...params, limit: PAGE_SIZE, offset: (pageNum - 1) * PAGE_SIZE });
    }
  } else {
    total = db.prepare(`SELECT COUNT(*) c FROM articles a ${join} WHERE ${where}`).get(params).c;
    rows = db
      .prepare(
        `SELECT a.*, c.name as category_name FROM articles a ${join} WHERE ${where} ORDER BY a.featured DESC, a.published_at DESC LIMIT @limit OFFSET @offset`
      )
      .all({ ...params, limit: PAGE_SIZE, offset: (pageNum - 1) * PAGE_SIZE });
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const categories = db.prepare('SELECT slug, name FROM categories ORDER BY name').all();

  const pagination = totalPages > 1
    ? `<nav aria-label="Pagination" style="display:flex; gap:0.5rem; justify-content:center; margin-top:2rem;">
        ${Array.from({ length: totalPages }, (_, i) => i + 1)
          .map((p) => `<a class="btn ${p === pageNum ? 'btn-or' : 'btn-outline-noir'}" href="?page=${p}${q ? '&q=' + encodeURIComponent(q) : ''}">${p}</a>`)
          .join('')}
      </nav>`
    : '';

  const filterBar = `
    <form method="GET" action="/actualites/" style="display:flex; gap:0.75rem; flex-wrap:wrap; justify-content:center; margin-bottom:2rem;">
      <input type="text" name="q" value="${q.replace(/"/g, '&quot;')}" placeholder="Rechercher un article..." style="min-height:44px; padding:0 0.9rem; border-radius:8px; border:1px solid rgba(20,19,18,0.2); flex:1; min-width:200px;">
      <select name="categorie" style="min-height:44px; border-radius:8px; border:1px solid rgba(20,19,18,0.2);" onchange="this.form.submit()">
        <option value="">Toutes les catégories</option>
        ${categories.map((c) => `<option value="${c.slug}" ${c.slug === categorySlug ? 'selected' : ''}>${c.name}</option>`).join('')}
      </select>
      <button class="btn btn-or" type="submit">Rechercher</button>
    </form>`;

  const body = `
  <section class="hero hero-page">
    <div class="container">
      <nav class="fil-ariane" aria-label="Fil d'Ariane">
        <a href="/">Accueil</a> <span aria-hidden="true">/</span> <span aria-current="page">Actualités</span>
      </nav>
      <p class="eyebrow">Vie de l'école</p>
      <h1>Actualités de l'École Le Message</h1>
      <p class="lead">Annonces, événements et nouveautés de l'école à Guercif.</p>
    </div>
  </section>
  <section class="section">
    <div class="container">
      ${filterBar}
      <div class="poles" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));">
        ${rows.length ? rows.map(articleCard).join('') : '<p>Aucun article ne correspond à votre recherche.</p>'}
      </div>
      ${pagination}
    </div>
  </section>`;

  res.send(
    page('/actualites/', {
      title: "Actualités – École Le Message, Guercif",
      description: "Annonces, événements et nouveautés de l'École Le Message à Guercif.",
      canonical: 'https://ecolemessage.com/actualites/',
      extraJsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://ecolemessage.com/' },
            { '@type': 'ListItem', position: 2, name: 'Actualités', item: 'https://ecolemessage.com/actualites/' },
          ],
        },
      ],
    }, body)
  );
});

router.get('/actualites/:slug/', (req, res) => {
  const article = db
    .prepare(`SELECT a.*, c.name as category_name, c.slug as category_slug FROM articles a LEFT JOIN categories c ON c.id = a.category_id WHERE a.slug = ?`)
    .get(req.params.slug);

  if (!article || article.status !== 'published' || article.published_at > new Date().toISOString().replace('T', ' ')) {
    return res.status(404).send(page('/actualites/', {
      title: 'Article introuvable – École Le Message',
      description: 'Cet article est introuvable.',
      canonical: `https://ecolemessage.com/actualites/${req.params.slug}/`,
      robots: 'noindex, follow',
    }, `<section class="section"><div class="container"><h1>Article introuvable</h1><p><a href="/actualites/">Retour aux actualités</a></p></div></section>`));
  }

  const tags = db
    .prepare('SELECT t.slug, t.name FROM tags t JOIN article_tags at ON at.tag_id = t.id WHERE at.article_id = ?')
    .all(article.id);

  const related = db
    .prepare(
      `SELECT DISTINCT a.slug, a.title, a.excerpt, a.cover_image, a.cover_image_alt, a.published_at, a.featured
       FROM articles a
       LEFT JOIN article_tags at ON at.article_id = a.id
       WHERE a.status = 'published' AND a.published_at <= datetime('now') AND a.id != @id
         AND (a.category_id = @categoryId OR at.tag_id IN (SELECT tag_id FROM article_tags WHERE article_id = @id))
       ORDER BY a.published_at DESC LIMIT 3`
    )
    .all({ id: article.id, categoryId: article.category_id });

  const prev = db
    .prepare(`SELECT slug, title FROM articles WHERE status='published' AND published_at < ? ORDER BY published_at DESC LIMIT 1`)
    .get(article.published_at);
  const next = db
    .prepare(`SELECT slug, title FROM articles WHERE status='published' AND published_at > ? ORDER BY published_at ASC LIMIT 1`)
    .get(article.published_at);

  let ogImage;
  try {
    const { basePath, widths } = JSON.parse(article.cover_image || 'null') || {};
    if (basePath) ogImage = `https://ecolemessage.com${basePath}-${widths[widths.length - 1]}w.webp`;
  } catch {}

  const body = `
  <section class="hero hero-page">
    <div class="container">
      <nav class="fil-ariane" aria-label="Fil d'Ariane">
        <a href="/">Accueil</a> <span aria-hidden="true">/</span>
        <a href="/actualites/">Actualités</a> <span aria-hidden="true">/</span>
        <span aria-current="page">${article.title}</span>
      </nav>
      <p class="eyebrow">${article.category_name || 'Actualité'} · ${formatDate(article.published_at)}</p>
      <h1>${article.title}</h1>
    </div>
  </section>
  <section class="section">
    <div class="container fiche-formation" style="max-width: 820px;">
      ${coverImg(article, '820px')}
      <div style="margin-top:1.5rem;">${article.content_html}</div>
      ${tags.length ? `<p style="margin-top:2rem;">${tags.map((t) => `<a class="btn btn-outline-noir" style="margin-right:0.4rem;" href="/actualites/?tag=${t.slug}">#${t.name}</a>`).join('')}</p>` : ''}

      <nav style="display:flex; justify-content:space-between; margin-top:2.5rem; border-top:1px solid rgba(20,19,18,0.1); padding-top:1.5rem;">
        <span>${prev ? `<a href="/actualites/${prev.slug}/">← ${prev.title}</a>` : ''}</span>
        <span>${next ? `<a href="/actualites/${next.slug}/">${next.title} →</a>` : ''}</span>
      </nav>

      ${related.length ? `
      <div class="section-head" style="margin-top:3rem;">
        <h2>Articles liés</h2>
      </div>
      <div class="poles" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
        ${related.map(articleCard).join('')}
      </div>` : ''}
    </div>
  </section>`;

  res.send(
    page('/actualites/', {
      title: article.seo_title || `${article.title} – École Le Message`,
      description: article.meta_description || article.excerpt || article.title,
      canonical: `https://ecolemessage.com/actualites/${article.slug}/`,
      ogImage,
      extraJsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://ecolemessage.com/' },
            { '@type': 'ListItem', position: 2, name: 'Actualités', item: 'https://ecolemessage.com/actualites/' },
            { '@type': 'ListItem', position: 3, name: article.title, item: `https://ecolemessage.com/actualites/${article.slug}/` },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: article.title,
          image: ogImage ? [ogImage] : undefined,
          datePublished: article.published_at,
          dateModified: article.updated_at,
          author: { '@type': 'Organization', name: 'École Le Message' },
          publisher: {
            '@type': 'Organization',
            name: 'École Le Message',
            logo: { '@type': 'ImageObject', url: 'https://ecolemessage.com/assets/img/logo-noir.png' },
          },
          mainEntityOfPage: `https://ecolemessage.com/actualites/${article.slug}/`,
        },
      ],
    }, body)
  );
});

export default router;
