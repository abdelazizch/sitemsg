const STATIC_URLS = [
  { loc: 'https://ecolemessage.com/', changefreq: 'weekly', priority: '1.0' },
  { loc: 'https://ecolemessage.com/formations/', changefreq: 'monthly', priority: '0.9' },
  { loc: 'https://ecolemessage.com/formations/tsdi-guercif/', changefreq: 'monthly', priority: '0.8' },
  { loc: 'https://ecolemessage.com/formations/tsge-guercif/', changefreq: 'monthly', priority: '0.8' },
  { loc: 'https://ecolemessage.com/pole-sante/', changefreq: 'monthly', priority: '0.7' },
  { loc: 'https://ecolemessage.com/ecole/', changefreq: 'monthly', priority: '0.6' },
  { loc: 'https://ecolemessage.com/contact/', changefreq: 'yearly', priority: '0.6' },
  { loc: 'https://ecolemessage.com/admission/', changefreq: 'yearly', priority: '0.7' },
  { loc: 'https://ecolemessage.com/actualites/', changefreq: 'weekly', priority: '0.7' },
];

export function sitemapHandler(db) {
  return (req, res) => {
    const articles = db
      .prepare(`SELECT slug, updated_at FROM articles WHERE status = 'published' AND published_at <= datetime('now') ORDER BY published_at DESC`)
      .all();

    const urls = [
      ...STATIC_URLS.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`),
      ...articles.map(
        (a) =>
          `  <url>\n    <loc>https://ecolemessage.com/actualites/${a.slug}/</loc>\n    <lastmod>${a.updated_at.slice(0, 10)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`
      ),
    ].join('\n');

    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
    );
  };
}
