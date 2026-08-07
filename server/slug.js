export function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'article';
}

export function uniqueSlug(db, baseSlug, excludeId = null) {
  let slug = baseSlug;
  let n = 2;
  const exists = (s) => {
    const row = excludeId
      ? db.prepare('SELECT id FROM articles WHERE slug = ? AND id != ?').get(s, excludeId)
      : db.prepare('SELECT id FROM articles WHERE slug = ?').get(s);
    return !!row;
  };
  while (exists(slug)) {
    slug = `${baseSlug}-${n}`;
    n += 1;
  }
  return slug;
}
