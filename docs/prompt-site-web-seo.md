# Prompt complet — Création d'un site web (SEO local, prêt avant Septembre)

> À copier-coller tel quel à un développeur, une agence, ou une IA de génération de site (ex: Claude, ChatGPT, Lovable, Framer AI...). Objectif : site prêt et indexable avant la période d'inscriptions (mois 9).

---

## 1. Contexte et objectif

Je veux créer un site web professionnel pour [NOM DE L'ÉTABLISSEMENT / ENTREPRISE], situé à [VILLE, PAYS]. Le site doit être **optimisé SEO dès sa conception** (pas en correction après coup), rapide, accessible, et **entièrement prêt à être mis en ligne et indexé par Google avant le [DATE LIMITE, ex: 25 août]**, car la période d'inscriptions/vente démarre en septembre.

Secteur d'activité : [ex: école de formation professionnelle]
Ville / zone ciblée : [ex: Guercif, Maroc]
Formations / produits / services proposés : [liste-les tous, un par un — chacun aura sa propre page]
Nom de domaine prévu : [ex: exemple.com]

**Contrainte non-négociable : chaque page doit être fonctionnelle en SEO dès sa mise en ligne** (balises, structure, contenu réel — pas de "Lorem ipsum" ni de "à venir").

---

## 2. Arborescence du site (obligatoire, ne pas simplifier)

```
/                              (Accueil)
/a-propos/                     (Présentation de l'établissement)
/formations/                   (page pilier — liste toutes les formations/services)
  /formations/[nom-formation-1-ville]/
  /formations/[nom-formation-2-ville]/
  /formations/[nom-formation-3-ville]/
/admission/  ou  /inscription/ (formulaire, process, dates, conditions)
/contact/                      (coordonnées, carte, téléphone, horaires)
/blog/                         (articles, optionnel mais recommandé)
/mentions-legales/
/politique-de-confidentialite/
```

Règle : **une page HTML propre par sujet/formation**, avec sa propre URL, son propre `<title>`, sa propre meta description, son propre H1 — jamais de contenu condensé en simple section d'une autre page. Chaque formation/service doit pouvoir se positionner seule sur Google.

---

## 3. Exigences SEO techniques (obligatoires sur CHAQUE page)

- `<html lang="fr">` correct (ou `lang` adapté à la vraie langue du contenu ; utiliser `<span lang="ar">` si des portions sont en arabe).
- **Un seul `<h1>` par page**, unique, contenant le mot-clé principal de la page.
- Hiérarchie logique `<h2>`, `<h3>` pour structurer le contenu (pas de saut de niveau).
- `<title>` unique par page (50-60 caractères), formule : `Mot-clé principal – Ville | Nom de la marque`.
- `<meta name="description">` **unique par page** (140-160 caractères), incitant au clic, jamais dupliquée d'une page à l'autre.
- `<link rel="canonical" href="...">` pointant **toujours vers le bon domaine final**, jamais vers un domaine de test/ancien domaine.
- Open Graph (`og:title`, `og:description`, `og:image`, `og:url`) et Twitter Card corrects, pointant vers le domaine final.
- URLs propres, courtes, en minuscules, avec tirets (`/formations/technicien-informatique-guercif/`), jamais de paramètres type `?id=12`.
- **sitemap.xml** généré automatiquement, à jour, incluant toutes les pages réelles, soumis à Google Search Console dès la mise en ligne.
- **robots.txt** propre, autorisant Googlebot, avec une ligne `Sitemap: https://[domaine]/sitemap.xml`.
- Aucune balise `noindex` oubliée par erreur sur une page qui doit être indexée.
- Données structurées JSON-LD (schema.org) sur chaque page pertinente :
  - `EducationalOrganization` ou `LocalBusiness` sur l'accueil et la page contact (nom, adresse, téléphone, horaires, géolocalisation — cohérents avec Google Business Profile).
  - `Course` sur chaque page formation.
  - `BreadcrumbList` sur toutes les pages internes.
  - `FAQPage` si une section FAQ existe.

---

## 4. Cohérence NAP et présence locale (critique)

Le **Nom, l'Adresse et le Téléphone (NAP)** doivent être **identiques au caractère près** entre :
- Le site web (footer + page contact + schema JSON-LD)
- La fiche Google Business Profile
- Les pages Facebook/Instagram officielles
- Tout annuaire local existant

Avant le lancement : vérifier que la fiche Google Business Profile est active (statut "Ouvert", jamais "Fermé"), à jour, avec les bons horaires, et liée au bon site web.

---

## 5. Performance (obligatoire, pas en option)

- Toutes les images en **WebP ou AVIF**, compressées, **exportées à la taille réelle d'affichage** (jamais une image 2000px affichée en 200px).
- `loading="lazy"` sur toutes les images sous la ligne de flottaison ; l'image principale (LCP) chargée en priorité, sans lazy loading.
- `alt` descriptif et pertinent sur **chaque image**, incluant le mot-clé local quand c'est naturel (ex: `alt="Formation développement informatique à Guercif"`).
- Compression Gzip/Brotli activée côté serveur ou CDN.
- Mise en cache navigateur (`Cache-Control`) sur les assets statiques (CSS, JS, images, polices).
- Objectif Core Web Vitals à valider avec PageSpeed Insights après mise en ligne : LCP < 2,5s, CLS < 0,1, INP < 200ms.
- Pas de scripts JS qui plantent en erreur console sur une page où l'élément ciblé n'existe pas (toujours vérifier `if (element)` avant manipulation DOM).

---

## 6. Accessibilité (obligatoire)

- Tous les champs de formulaire avec `<label for="id">` explicite (jamais de placeholder seul en guise de label).
- Contraste de texte suffisant (ratio AA minimum, surtout texte clair sur fond coloré).
- Navigation complète possible au clavier (Tab, Entrée) sur menu, formulaire, boutons.
- Champs adaptés au type de données (`type="date"` pour une date de naissance, `type="tel"` pour un téléphone, `type="email"` pour un email).
- Boutons flottants (WhatsApp, chat) ne doivent **jamais chevaucher le contenu**, surtout sur mobile — marge de sécurité obligatoire.

---

## 7. Sécurité (en-têtes HTTP de base)

À activer via l'hébergeur ou le CDN (ex: Cloudflare) :
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options` ou `Content-Security-Policy: frame-ancestors`
- `Referrer-Policy`

---

## 8. Contenu — mots-clés et structure éditoriale

Pour chaque page formation/service, fournir obligatoirement :
1. Introduction répondant à l'intention de recherche (« Quelle formation X à [Ville] ? »).
2. Objectifs de la formation/service.
3. Programme / modules détaillés.
4. Durée, niveau d'admission, conditions.
5. Débouchés métiers (si formation).
6. Modalités d'inscription (lien clair vers `/admission/`).
7. FAQ (3 à 5 questions réelles).
8. Appel à l'action clair (téléphone, WhatsApp, formulaire).

Règle éditoriale stricte : **aucune information factuelle inventée** (dates, chiffres de réussite, accréditations, effectifs). Toute donnée doit être fournie et validée par [NOM ÉTABLISSEMENT] avant publication. Ne jamais publier de statistiques non vérifiées.

Mots-clés à cibler en priorité (à adapter/compléter) :
- [mot-clé principal 1] + [ville]
- [mot-clé principal 2] + [ville]
- "formation professionnelle [ville]"
- "inscription [ville]" / "école [ville]"

---

## 9. Mobile-first

- Design responsive testé sur mobile réel (pas seulement en simulateur navigateur).
- Menu hamburger accessible (nom accessible via `aria-label` ou texte caché type `visually-hidden`).
- Boutons cliquables suffisamment grands (min 44×44px) et espacés.
- Formulaire d'inscription utilisable entièrement au doigt, sans zoom nécessaire.

---

## 10. Avant la mise en ligne — checklist de validation finale

- [ ] Chaque page a un `<h1>` unique et pertinent
- [ ] Chaque page a un title et une meta description uniques
- [ ] Toutes les canonical/og:url pointent vers le domaine final (jamais un domaine de test)
- [ ] sitemap.xml généré et accessible (`/sitemap.xml` répond en 200, pas 404)
- [ ] robots.txt correct avec ligne Sitemap
- [ ] Toutes les images compressées, en WebP/AVIF, avec alt
- [ ] Aucune erreur dans la console navigateur sur aucune page
- [ ] NAP identique site / Google Business Profile / réseaux sociaux
- [ ] Fiche Google Business Profile active et liée au bon site
- [ ] Formulaire d'inscription testé de bout en bout (envoi réel, confirmation reçue)
- [ ] Site testé sur mobile réel (Android + iPhone si possible)
- [ ] JSON-LD validé sans erreur (Google Rich Results Test)
- [ ] Site soumis à Google Search Console avec sitemap envoyé

---

## 11. Planning suggéré (si lancement prévu avant Septembre)

- **Semaine 1** : validation arborescence + contenu réel de chaque page (textes fournis par l'établissement)
- **Semaine 2** : développement des pages, intégration SEO technique, images optimisées
- **Semaine 3** : tests (mobile, formulaire, vitesse, accessibilité), corrections
- **Semaine 4** : mise en ligne, soumission Search Console, vérification/mise à jour Google Business Profile, derniers ajustements

---

### Note d'usage
Remplace tous les `[...]` par les informations réelles avant d'envoyer ce prompt à un développeur ou de le coller dans un outil de génération de site.
