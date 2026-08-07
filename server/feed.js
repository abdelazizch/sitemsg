function escapeXml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
}

export function feedHandler(db) {
  return (req, res) => {
    const articles = db
      .prepare(
        `SELECT slug, title, excerpt, published_at FROM articles WHERE status = 'published' AND published_at <= datetime('now') ORDER BY published_at DESC LIMIT 30`
      )
      .all();

    const items = articles
      .map((a) => {
        const url = `https://ecolemessage.com/actualites/${a.slug}/`;
        const pubDate = new Date(a.published_at.replace(' ', 'T') + 'Z').toUTCString();
        return `  <item>
    <title>${escapeXml(a.title)}</title>
    <link>${url}</link>
    <guid>${url}</guid>
    <description>${escapeXml(a.excerpt || '')}</description>
    <pubDate>${pubDate}</pubDate>
  </item>`;
      })
      .join('\n');

    res.type('application/rss+xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Actualités — École Le Message</title>
  <link>https://ecolemessage.com/actualites/</link>
  <description>Nouveautés et annonces de l'École Le Message à Guercif.</description>
  <language>fr</language>
${items}
</channel>
</rss>
`
    );
  };
}
