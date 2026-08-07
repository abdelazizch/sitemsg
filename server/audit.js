export function logAction(db, { user, action, articleId = null, details = null, ip = null }) {
  db.prepare(
    `INSERT INTO admin_audit_log (admin_user, action, article_id, details, ip) VALUES (?, ?, ?, ?, ?)`
  ).run(user, action, articleId, details, ip);
}
