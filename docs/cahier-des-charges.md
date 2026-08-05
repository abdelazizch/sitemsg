# Cahier des charges — Site web École Le Message (Pôle Formation + Pôle Santé)

> Document de référence unique, fusionnant `prompt-maquette-site-claude-design.md` (direction artistique) et `prompt-site-web-seo.md` (exigences techniques/SEO), enrichi des informations vérifiées sur le site actuel (`ecolemessage.com`) et de vos décisions. Les deux prompts d'origine sont conservés en archive dans ce même dossier `docs/`.
>
> Statut : document de cadrage, avant développement. Toute mention **[À CONFIRMER]** doit être validée avec l'établissement avant mise en production — aucune information de ce type ne doit être publiée telle quelle.

---

## 1. Identité de l'établissement

| Champ | Valeur | Statut |
|---|---|---|
| Raison sociale (officielle) | École Privée de Formation Professionnelle Le Message | Confirmé par le client |
| Nom court / communication et interface site | École Le Message | Confirmé par le client |
| Ville | Guercif, Maroc | Confirmé |
| Adresse | Boulevard Mohammed V, Rue Lot Rif 1, 35100 Guercif, Maroc | Confirmé par le client |
| Code postal | 35100 | Confirmé par le client |
| Téléphone fixe | +212 535 676 525 | Confirmé par le client |
| Téléphone mobile / WhatsApp | +212 654 855 724 | Confirmé par le client |
| Email de contact | ecolemessage@gmail.com | Confirmé par le client |
| Horaires d'ouverture | — | **[À CONFIRMER]** |
| Forme juridique | SARL | Confirmé par le client |
| Registre du Commerce (RC) | — | **[À CONFIRMER]** — client a choisi de laisser vide pour l'instant |
| ICE | — | **[À CONFIRMER]** — client a choisi de laisser vide pour l'instant |
| Responsable de publication | Le gérant de l'École Le Message | Confirmé par le client (fonction, pas de nom donné) |
| Nom de domaine — registrar | Namecheap, Inc. | Confirmé par le client |
| Domaine officiel | `https://ecolemessage.com/` | Confirmé par le client |
| Facebook | https://www.facebook.com/ecolemsg11122 | Conservé — validité à recontrôler une dernière fois avant mise en production |
| Instagram | https://www.instagram.com/ecole_alrrissala/ | Conservé — validité à recontrôler une dernière fois avant mise en production |
| Fiche Google Business Profile | Nom relevé : "مدرسة الرسالة للإعلاميات وتسيير المقاولات ECOLE LE MESSAGE" | À harmoniser ultérieurement avec la raison sociale officielle ci-dessus (action de suivi, ne bloque pas la rédaction de ce cahier des charges) |
| Ancienneté / autorisation initiale | Autorisation initiale du 3 mars 2004 | Confirmé par le client — formulation à utiliser : « École Le Message, à votre service depuis 2004. » (aucun autre chiffre ou taux de réussite à ajouter) |
| Accréditations formations actuelles | TSDI et TSGE présentés comme diplômes Bac+2 accrédités | Confirmé par le client |

### Incohérence traitée
Le HTML du site actuel (`canonical`, `og:url`) référence le domaine `ecolemsg.com`. Confirmé par le client : le domaine officiel est **`ecolemessage.com`**, à utiliser exclusivement dans toutes les balises techniques du nouveau site (canonical, og:url, JSON-LD, sitemap, robots.txt). Toutes les références à `ecolemsg.com` doivent être remplacées ; ce domaine ne doit plus apparaître nulle part sur le nouveau site.

---

## 2. Présentation de la marque et direction artistique

Le Message réunit deux pôles d'activité sous une seule marque :
1. **Pôle Formation** (historique) — TSDI, TSGE, soutien scolaire, activités parascolaires.
2. **Pôle Santé** (nouveau, en projet) — formations paramédicales, présentées comme "prochainement disponibles" tant que leur autorisation n'est pas confirmée.

### Identité visuelle
Logo existant à respecter tel quel (ne pas déformer, ne pas recréer) : calligraphie arabe du mot "Le Message" en noir et or, coiffe de diplôme (mortarboard) dorée, mention "Le message" en cursive dorée, texte "FORMATION PROFESSIONNELLE PRIVEE" en dégradé noir/or, style pochoir. Deux variantes fournies (dominante noire / dominante or), fond blanc — utilisées telles quelles en header, footer et favicon. Fichiers : `docs/logo-le-message1.png`, `docs/logo-le-message2.png` (ne pas modifier).

### Style général
Premium, institutionnel mais chaleureux, forte identité arabo-calligraphique. Éviter le générique "template d'école".

### Palette de couleurs (à ajuster en phase design)

| Usage | Couleur | Code approximatif |
|---|---|---|
| Noir profond (texte, fonds premium) | Noir charbon | #141312 |
| Or signature (logo, accents, CTA Formation) | Or élégant | #C9A24B (dégradé #8A6A22 → #E8C97A) |
| Blanc / fond principal | Blanc cassé | #FBFAF7 |
| Accent Pôle Santé — bleu médical | Bleu pétrole | #1E4D5C |
| Accent Pôle Santé secondaire — vert doux | Vert sauge | #7FA98C |
| Gris neutre (textes secondaires, bordures) | Gris chaud | #6B6560 |

Logique : l'or et le noir restent le fil conducteur de toute la marque (header, logo, boutons principaux, footer) ; le bleu pétrole / vert sauge apparaissent uniquement dans les pages du Pôle Santé, comme un accent qui distingue sans trahir l'identité mère.

### Typographie
- Titres : serif ou semi-serif élégante (ex. Playfair Display, Fraunces) pour rappeler la calligraphie du logo.
- Corps de texte : sans-serif lisible et moderne (ex. Inter, Manrope).
- Support de l'arabe prévu (police compatible, direction RTL) pour les portions de contenu en arabe.

### Ton rédactionnel
Institutionnel mais chaleureux, orienté confiance et excellence. Textes de démonstration réalistes en français (jamais de "Lorem ipsum"). Exemple de ton pour le hero : « Une seule marque, deux missions : former les talents de demain et prendre soin de votre santé. »

---

## 3. Arborescence finale du site

```
/                                          Accueil
/ecole/                                    À propos (présentation de l'établissement)
/formations/                               Page pilier — toutes les filières Formation en cartes
  /formations/tsdi-guercif/                Page SEO dédiée — TSDI (Bac+2, accrédité)
  /formations/tsge-guercif/                Page SEO dédiée — TSGE (Bac+2, accrédité)
  (Soutien scolaire et Activités parascolaires : présentés en section générale sur la page pilier /formations/, pas de page SEO dédiée tant qu'un contenu réel et suffisamment détaillé n'est pas fourni — cf. section 4)
/pole-sante/                               Page présentation du Pôle Santé (nouveau, statut "prochainement disponible")
  /pole-sante/aide-soignant-guercif/       Prochainement disponible
  /pole-sante/infirmier-polyvalent-guercif/  Prochainement disponible
  /pole-sante/prothese-dentaire-guercif/   Prochainement disponible
/admission/                                Formulaire d'inscription (remplace contacts.html)
/contact/                                  Coordonnées, carte, horaires
/espace-stagiaire/                         Portail stagiaires (reste "à venir" tant que non développé)
/mentions-legales/
/politique-de-confidentialite/
```

Règle SEO stricte (héritée du prompt technique d'origine) : une page HTML propre par sujet/formation, avec son propre `<title>`, sa propre meta description, son propre `<h1>` — jamais de contenu condensé en simple section d'une autre page.

### Pôle Santé — traitement éditorial obligatoire
- Les démarches d'autorisation sont en cours ; aucune date officielle d'ouverture ne doit être annoncée pour le moment.
- Les trois formations (Aide-Soignant, Infirmier Polyvalent, Prothèse Dentaire) portent la mention obligatoire, en évidence sur chaque page : **« Prochainement disponible — ouverture sous réserve d'obtention des autorisations nécessaires. »**
- Ne jamais les présenter comme actuellement autorisées, accréditées ou ouvertes aux inscriptions.
- Schema.org : utiliser `EducationalOrganization` (jamais `MedicalOrganization`, l'établissement n'étant ni une clinique ni un cabinet médical).
- Indexation : `noindex, follow` appliqué temporairement à ces trois pages tant que les autorisations et le contenu définitif ne sont pas validés (cf. section 6). Elles pourront être indexées ultérieurement après confirmation officielle.
- Prévoir un mécanisme simple pour basculer chaque page filière de "prochainement disponible" à "ouverte aux inscriptions" (et retirer le `noindex`) une fois l'autorisation confirmée, sans refonte de page.

---

## 4. Contenu — structure éditoriale par page

### Page d'accueil
1. Header : logo à gauche, menu (Accueil / Formation / Santé / École / Contact), CTA "S'inscrire" en or.
2. Hero : accroche sur les deux pôles réunis sous une même marque, deux boutons : "Découvrir nos formations" et "Découvrir le pôle Santé".
3. Section "Deux pôles, une seule mission" : deux cartes (Formation en noir/or, Santé en bleu pétrole/vert), icône, description courte, lien "En savoir plus".
4. Chiffres clés / points de confiance — **uniquement des données validées**, sinon section omise ou marquée à venir.
5. Témoignages — **uniquement des témoignages réels et autorisés**, sinon section omise.
6. Section contact / localisation avec carte.
7. Footer : logo, coordonnées, réseaux sociaux, liens légaux.

### Page Formation (pilier `/formations/`)
- Hero dédié (dominante noir/or).
- Cartes cliquables vers les pages SEO dédiées TSDI et TSGE.
- Section générale "Soutien scolaire" et "Activités parascolaires" (texte de présentation courte, sans page dédiée tant qu'un contenu réel et détaillé n'est pas fourni par l'établissement — cf. section 15).
- Section "Pourquoi choisir Le Message".
- CTA inscription vers `/admission/`.

### Pages filières Formation (`/formations/tsdi-guercif/`, `/formations/tsge-guercif/`, etc.)
Pour chaque page, structure éditoriale obligatoire :
1. Introduction répondant à l'intention de recherche ("Quelle formation TSDI à Guercif ?").
2. Objectifs de la formation.
3. Programme / modules détaillés.
4. Durée, niveau d'admission, conditions (2 ans, Bac+2 pour TSDI/TSGE — confirmé).
5. Débouchés métiers.
6. Modalités d'inscription (lien vers `/admission/`).
7. FAQ (3 à 5 questions réelles, fournies par l'établissement).
8. Appel à l'action clair (téléphone, WhatsApp, formulaire).

### Page Pôle Santé (pilier `/pole-sante/`)
- Hero dédié (dominante bleu pétrole/vert sauge, touches d'or pour garder le lien de marque).
- Présentation du projet de pôle paramédical (Aide-Soignant, Infirmier Polyvalent, Prothèse Dentaire), démarches d'autorisation en cours — statut « Prochainement disponible — ouverture sous réserve d'obtention des autorisations nécessaires » mis en avant, sans date d'ouverture annoncée.
- Cartes vers les trois pages filières.
- Section confiance (équipe, certifications) — uniquement si informations validées.
- CTA : formulaire de pré-inscription / demande d'information (pas d'inscription ferme tant que non autorisé).

### Pages filières Pôle Santé
Même structure éditoriale que les filières Formation, adaptée :
- Mention « Prochainement disponible — ouverture sous réserve d'obtention des autorisations nécessaires » en évidence dans le H1 ou immédiatement sous celui-ci, sans date d'ouverture.
- Pas de section "débouchés"/"admission" définitive tant que non autorisé — remplacer par "Laissez-nous vos coordonnées pour être informé(e) de l'ouverture".
- `noindex, follow` appliqué tant que le statut n'est pas confirmé (cf. section 3 et 6).

### Page Contact / Admission
- Formulaire avec labels visibles (nom, email, téléphone, sujet — Formation ou Santé, message). Reprend les champs déjà présents sur le site actuel (nom, prénom, date/lieu de naissance, téléphone, email, adresse, ville, nom et téléphone du tuteur, spécialité).
- Carte + coordonnées + horaires (horaires **[À CONFIRMER]**).

---

## 5. Contraintes techniques

- Site statique (HTML/CSS), pas de backend requis pour la maquette.
- Entièrement responsive, mobile-first.
- Boutons et zones cliquables ≥ 44×44px.
- Contraste de texte conforme AA minimum, en particulier texte clair sur fond noir ou or.
- Logo utilisé tel quel, sans déformation ; version simplifiée/monochrome prévue pour favicon et petits formats.
- Structure HTML sémantique (header, nav, main, section, footer), un seul `<h1>` par page, hiérarchie logique des titres.

---

## 6. Exigences SEO techniques (obligatoires sur chaque page)

- `<html lang="fr">` (ou `lang` adapté ; `<span lang="ar">` pour les portions en arabe).
- Un seul `<h1>` par page, contenant le mot-clé principal.
- Hiérarchie logique `<h2>`, `<h3>`, sans saut de niveau.
- `<title>` unique par page (50-60 caractères) : `Mot-clé principal – Guercif | Le Message`.
- `<meta name="description">` unique par page (140-160 caractères), jamais dupliquée.
- `<link rel="canonical">` pointant toujours vers `https://ecolemessage.com/...` (jamais vers `ecolemsg.com` ni un domaine de test).
- Open Graph et Twitter Card corrects, pointant vers le domaine final.
- URLs propres, minuscules, tirets (`/formations/tsdi-guercif/`), jamais de paramètres `?id=`.
- `sitemap.xml` généré, à jour, soumis à Google Search Console dès la mise en ligne.
- `robots.txt` propre, autorisant Googlebot, avec `Sitemap: https://ecolemessage.com/sitemap.xml`.
- Aucune balise `noindex` oubliée par erreur sur une page destinée à être indexée. À l'inverse, les trois pages filières Pôle Santé (`/pole-sante/aide-soignant-guercif/`, `/pole-sante/infirmier-polyvalent-guercif/`, `/pole-sante/prothese-dentaire-guercif/`) doivent porter `noindex, follow` tant que les autorisations et le contenu définitif ne sont pas validés (cf. section 3 et 4) ; à retirer une fois l'autorisation officielle confirmée.
- Données structurées JSON-LD :
  - `EducationalOrganization` sur l'accueil et la page contact (nom, adresse, téléphone, horaires — cohérents avec la fiche Google Business Profile une fois harmonisée).
  - `Course` sur chaque page filière (Formation et Santé, avec mention du statut pour ces dernières).
  - `BreadcrumbList` sur toutes les pages internes.
  - `FAQPage` si une section FAQ existe.

---

## 7. Cohérence NAP et présence locale

Le Nom, l'Adresse et le Téléphone doivent être identiques au caractère près entre : le site, la fiche Google Business Profile, Facebook/Instagram, et tout annuaire local. Nom, adresse et téléphones sont confirmés (section 1) et peuvent être utilisés pour le développement ; l'harmonisation du nom affiché sur la fiche Google Business Profile reste une action de suivi (cf. section 15, point 1) qui n'empêche pas d'avancer.

Avant lancement : vérifier que la fiche Google Business Profile est active (statut "Ouvert"), à jour, horaires corrects, liée au bon site web.

---

## 8. Performance

- Images en WebP/AVIF, compressées, exportées à la taille réelle d'affichage.
- `loading="lazy"` sous la ligne de flottaison ; image LCP chargée en priorité, sans lazy loading.
- `alt` descriptif sur chaque image, incluant le mot-clé local quand naturel (ex. `alt="Formation TSDI à Guercif"`).
- Compression Gzip/Brotli, mise en cache navigateur sur les assets statiques.
- Objectifs Core Web Vitals à valider post-lancement : LCP < 2,5s, CLS < 0,1, INP < 200ms.
- Pas de script JS plantant en erreur console (`if (element)` avant manipulation DOM) — point de vigilance vu que le site actuel utilise déjà plusieurs scripts (WhatsApp flottant, typewriter, scroll-to-top).

---

## 9. Accessibilité

- `<label for="id">` explicite sur tous les champs de formulaire (le formulaire actuel utilise déjà des labels visibles bilingues FR/AR — à conserver comme bonne pratique).
- Contraste AA minimum.
- Navigation clavier complète (Tab, Entrée) sur menu, formulaire, boutons.
- Champs adaptés (`type="date"`, `type="tel"`, `type="email"`).
- Bouton WhatsApp flottant (déjà présent sur le site actuel) : ne doit jamais chevaucher le contenu, marge de sécurité obligatoire sur mobile.

---

## 10. Sécurité (en-têtes HTTP)

À activer via l'hébergeur/CDN : `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options` ou `Content-Security-Policy: frame-ancestors`, `Referrer-Policy`.

---

## 11. Règle éditoriale stricte

Aucune information factuelle inventée (dates, chiffres de réussite, accréditations, autorisations, prix, horaires, contenu légal, témoignages). Toute donnée doit être fournie et validée par l'établissement avant publication. Les formations du Pôle Santé ne doivent jamais être présentées comme autorisées tant que la confirmation officielle n'est pas obtenue.

---

## 12. Mobile-first

- Design responsive testé sur mobile réel.
- Menu hamburger accessible (`aria-label` ou texte caché).
- Boutons ≥ 44×44px, espacés.
- Formulaire d'inscription utilisable entièrement au doigt, sans zoom.

---

## 13. Checklist de validation finale avant mise en ligne

- [ ] Chaque page a un `<h1>` unique et pertinent
- [ ] Chaque page a un title et une meta description uniques
- [ ] Toutes les canonical/og:url pointent vers `ecolemessage.com` (jamais `ecolemsg.com` ni un domaine de test)
- [ ] sitemap.xml généré et accessible (`/sitemap.xml` répond en 200)
- [ ] robots.txt correct avec ligne Sitemap
- [ ] Toutes les images compressées, en WebP/AVIF, avec alt
- [ ] Aucune erreur dans la console navigateur sur aucune page
- [ ] NAP identique site / Google Business Profile / réseaux sociaux (nom harmonisé, cf. section 7)
- [ ] Fiche Google Business Profile active et liée au bon site
- [ ] Formulaire d'inscription testé de bout en bout (envoi réel, confirmation reçue)
- [ ] Site testé sur mobile réel (Android + iPhone si possible)
- [ ] JSON-LD validé sans erreur (Google Rich Results Test)
- [ ] Site soumis à Google Search Console avec sitemap envoyé
- [ ] Aucune page Pôle Santé ne présente une formation comme autorisée sans confirmation écrite de l'établissement
- [ ] Les trois pages filières Pôle Santé portent bien `noindex, follow` tant que l'autorisation officielle n'est pas confirmée
- [ ] Aucune date d'ouverture n'est annoncée sur les pages Pôle Santé

---

## 14. Planning suggéré (deadline : première version fonctionnelle avant septembre 2026)

- **Phase 1** : validation de toutes les informations **[À CONFIRMER]** listées en section 1 et 15 + contenu réel de chaque page.
- **Phase 2** : maquette visuelle (Claude Design) sur la base des sections 2 et 3.
- **Phase 3** : développement des pages, intégration SEO technique, images optimisées.
- **Phase 4** : tests (mobile, formulaire, vitesse, accessibilité), corrections.
- **Phase 5** : mise en ligne, soumission Search Console, vérification/mise à jour Google Business Profile.

---

## 15. Informations restant à confirmer avant développement

Décisions actées lors des échanges précédents (ne plus rouvrir sans nouvelle instruction du client) :
- Raison sociale officielle : École Privée de Formation Professionnelle Le Message / nom court : École Le Message.
- Domaine officiel : `https://ecolemessage.com/` (remplace `ecolemsg.com` partout).
- Adresse actuelle à utiliser : Boulevard Mohammed V, Rue Lot Rif 1, Guercif, Maroc.
- Téléphone fixe +212 535 676 525 / mobile-WhatsApp +212 654 855 724.
- Formulation d'ancienneté : « École Le Message, à votre service depuis 2004 » (autorisation initiale du 3 mars 2004).
- Pôle Santé : 3 formations (Aide-Soignant, Infirmier Polyvalent, Prothèse Dentaire), mention obligatoire « Prochainement disponible — ouverture sous réserve d'obtention des autorisations nécessaires », pas de date d'ouverture, `noindex, follow` temporaire.
- Pas de pages SEO dédiées pour Soutien scolaire / Activités parascolaires pour l'instant — section générale sur la page pilier `/formations/`.

Points encore ouverts :
1. Harmonisation du nom affiché sur la fiche Google Business Profile ("مدرسة الرسالة للإعلاميات وتسيير المقاولات ECOLE LE MESSAGE") avec la raison sociale officielle — action de suivi, à traiter ultérieurement, ne bloque pas la suite.
2. Code postal de l'adresse — à confirmer, ne pas inventer.
3. Email de contact officiel — à confirmer, ne pas inventer.
4. Horaires d'ouverture — à confirmer.
5. Validité actuelle des comptes Facebook (https://www.facebook.com/ecolemsg11122) et Instagram (https://www.instagram.com/ecole_alrrissala/) — à recontrôler une dernière fois avant mise en production.
6. Contenu réel et détaillé pour Soutien scolaire et Activités parascolaires, si et quand une page SEO dédiée devient pertinente.
7. Accès complet à la fiche Google Maps (horaires, avis, photos) — à traiter ultérieurement, ne bloque pas la suite ; nécessite soit connexion de l'extension Chrome, soit export manuel par vos soins.

---

### Note d'usage
Ce document remplace, en les fusionnant, `prompt-maquette-site-claude-design.md` (direction artistique) et `prompt-site-web-seo.md` (exigences SEO/techniques), conservés tels quels dans `docs/` à titre d'archive. Les deux fichiers logo ne doivent pas être modifiés ou recréés.
