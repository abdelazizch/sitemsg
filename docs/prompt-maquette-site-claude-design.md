# Prompt complet - Maquette de site statique (Ecole Le Message + Pole Sante)

> A coller directement dans Claude Design pour generer une maquette complete du site.

---

## 1. Presentation de la marque

Cree une maquette complete de site web statique pour "Le Message", un groupe qui reunit deux poles d'activite :

1. Formation professionnelle privee (pole historique - TSDI, TSGE, soutien scolaire, activites parascolaires)
2. Pole Sante (nouveau - a preciser : clinique / centre de formation paramedicale / cabinet / centre de bien-etre)

Le logo existant (a respecter comme identite visuelle) est une calligraphie arabe du mot "Le Message" en noir et or, avec une coiffe de diplome (mortarboard) doree posee au sommet de la lettre, et la mention "Le message" en cursive doree. En dessous, le texte "FORMATION PROFESSIONNELLE PRIVEE" en degrade noir/or, typographie condensee et impactante (style pochoir). Le style general est premium, prestigieux, elegant, avec une forte identite arabo-calligraphique, sur fond blanc pur.

Je fournis deux fichiers logo en piece jointe (fond blanc, variante noire dominante et variante or dominante) - utilise-les tels quels dans la maquette (header, footer, favicon).

---

## 2. Direction artistique demandee

- Style global : premium, institutionnel mais chaleureux, inspire de l'identite calligraphique du logo. Eviter le generique "template d'ecole" - identite forte et memorable.
- Deux ambiances a faire cohabiter dans une seule charte :
  - Le pole Formation garde la dominante noir / or / blanc du logo actuel.
  - Le pole Sante introduit une couleur secondaire propre au secteur medical, tout en restant dans la meme famille visuelle (pas de rupture brutale).

### Palette de couleurs proposee (a ajuster)

| Usage | Couleur | Code approximatif |
|---|---|---|
| Noir profond (texte, fond sections premium) | Noir charbon | #141312 |
| Or signature (logo, accents, CTA formation) | Or elegant | #C9A24B (degrade #8A6A22 vers #E8C97A) |
| Blanc / fond principal | Blanc casse | #FBFAF7 |
| Accent Sante - bleu medical (confiance, serenite) | Bleu petrole | #1E4D5C |
| Accent Sante secondaire - vert doux (soin, bien-etre) | Vert sauge | #7FA98C |
| Gris neutre (textes secondaires, bordures) | Gris chaud | #6B6560 |

Logique : l'or et le noir restent le fil conducteur de toute la marque (header, logo, boutons principaux, footer) ; le bleu petrole / vert sauge apparaissent uniquement dans les sections/pages dediees au pole Sante, comme un accent qui distingue sans trahir l'identite mere.

### Typographie
- Titres : une police serif ou semi-serif elegante avec du caractere (ex : Playfair Display, Fraunces, ou equivalent) pour rappeler le raffinement de la calligraphie du logo.
- Corps de texte : une sans-serif lisible et moderne (ex : Inter, Manrope) pour le contenu et les formulaires.
- Prevoir le support de l'arabe (police compatible, direction RTL) pour les portions de contenu en arabe si besoin.

---

## 3. Structure de la maquette (pages/sections a generer)

### Page d'accueil (Home)
1. Header : logo a gauche, menu (Accueil / Formation / Sante / A propos / Contact), bouton CTA "S'inscrire" en or.
2. Hero : accroche forte sur les deux poles reunis sous une meme marque, avec deux boutons clairs : "Decouvrir nos formations" et "Decouvrir le pole Sante".
3. Section "Deux poles, une seule mission" : presentation en deux cartes cote a cote (Formation en noir/or, Sante en bleu petrole/vert), chacune avec icone, description courte, lien "En savoir plus".
4. Chiffres cles / points de confiance (accreditation, annees d'experience - placeholders a remplir).
5. Temoignages (carousel ou grille).
6. Section contact / localisation avec carte.
7. Footer : logo, coordonnees, reseaux sociaux, liens legaux.

### Page Formation professionnelle
- Hero dedie (dominante noir/or)
- Liste des filieres (TSDI, TSGE, soutien scolaire, parascolaire) en cartes cliquables
- Section "Pourquoi choisir Le Message"
- CTA inscription

### Page Pole Sante (nouveau)
- Hero dedie (dominante bleu petrole/vert sauge, toujours avec touches d'or pour garder le lien de marque)
- Presentation des services/formations sante proposes
- Section confiance (equipe, certifications, hygiene/securite si pertinent)
- CTA prise de rendez-vous / inscription

### Page Contact
- Formulaire avec labels visibles (nom, email, telephone, sujet - Formation ou Sante, message)
- Carte + coordonnees + horaires

---

## 4. Contraintes techniques

- Site statique (HTML/CSS, pas de backend requis pour la maquette).
- Entierement responsive (mobile, tablette, desktop) - priorite mobile-first.
- Boutons et zones cliquables suffisamment grands pour le tactile (min 44x44px).
- Contraste de texte conforme accessibilite (AA minimum), surtout pour le texte clair sur fond noir ou or.
- Utiliser le logo fourni tel quel, sans le deformer ; prevoir une version simplifiee/monochrome pour le favicon et les usages en petite taille.
- Structure HTML semantique propre (header, nav, main, section, footer) - pensee pour etre facilement optimisee SEO ensuite (un seul H1 par page, hierarchie logique des titres).

---

## 5. Ton et style redactionnel des textes de demonstration

Utilise des textes de demonstration realistes en francais (pas de "Lorem ipsum"), avec un ton institutionnel mais chaleureux, oriente confiance et excellence. Exemple de ton pour le hero : "Une seule marque, deux missions : former les talents de demain et prendre soin de votre sante."

---

### Note d'usage
Remplace les placeholders (accreditations, chiffres, nom exact des services sante) par les vraies informations avant la mise en production. Les deux logos fournis doivent etre utilises tels quels, sans recreation.
