# L'atelier sous la maison

Site de L'atelier sous la maison : une bibliothèque de motifs anciens restaurés, de créations originales et de coloriages, livrés en haute définition avec leur licence.

**État actuel : étape 2, le socle du site.** Le catalogue vit dans une base de données, l'administration permet d'ajouter les designs, et les fichiers haute définition sont stockés en privé. Le paiement n'est pas encore branché (étape 4).

## Ce que contient le site

| Page | Adresse | Ce qu'on y voit |
| --- | --- | --- |
| Accueil | `/` | La descente sous la maison, les trois tiroirs, les dernières trouvailles, la recherche par couleur |
| Explorer | `/explorer/` | La grille en mosaïque, les filtres par tiroir, couleur et époque, la recherche par mots |
| Fiche design | `/motif/<nom-du-motif>/` | L'aperçu filigrané avec loupe, le prix en euros ou en dollars, l'édition limitée, le cartel, le motif sur quatre objets |
| Identité visuelle | `/identite/` | Les pistes de logo (les racines sont retenues), les couleurs, les typographies |
| Administration | `/admin/` | Réservée à Léo, protégée par mot de passe |

## Comment ça marche

1. Dans `/admin/`, on dépose un fichier haute définition et on remplit sa fiche. Le navigateur fabrique l'aperçu public (1200 px, filigrane incrusté) et détecte les couleurs.
2. Le fichier HD part dans le stockage privé R2, dans le dossier `hd/`. Il n'est jamais accessible au public : seul le dossier `apercus/` est servi par `/media/`.
3. Le bouton « Publier » vérifie que la fiche est complète. Un motif retrouvé exige ses preuves de droits.
4. Le bouton « Mettre le site à jour » demande à Cloudflare de reconstruire le site, en 2 à 3 minutes. Au moment de la fabrication, le site lit le catalogue publié depuis `/api/catalogue`.

Sécurité du catalogue : si l'API ne répond pas pendant une fabrication, celle-ci s'arrête et le site en ligne reste la version précédente. Un catalogue incomplet n'est jamais publié.

## Étape 2 : réglages à faire une seule fois dans Cloudflare (environ 15 minutes)

Les libellés de l'interface Cloudflare peuvent changer légèrement.

**A. Créer la base de données**
1. Dans le menu de gauche : **Storage & Databases**, puis **D1 SQL Database**, puis **Create**.
2. Nom : `atelier`. Valide avec **Create**. Il n'y a rien d'autre à faire : les tables se créent toutes seules.

**B. Créer le stockage des fichiers**
1. Dans le menu : **R2 Object Storage**. Cloudflare peut demander d'activer R2 avec un moyen de paiement. L'offre gratuite couvre 10 Go par mois.
2. **Create bucket**, nom : `atelier-medias`, emplacement automatique, puis **Create bucket**.

**C. Relier la base et le stockage au site**
1. **Workers & Pages**, projet `latelier-sous-la-maison`, onglet **Settings**, puis **Bindings**, puis **Add**.
2. Choisis **D1 database**. Nom de variable : `DB`, base : `atelier`. Enregistre.
3. Encore **Add**, puis **R2 bucket**. Nom de variable : `MEDIAS`, bucket : `atelier-medias`. Enregistre.

**D. Créer les secrets** (dans **Settings**, puis **Variables and Secrets**, puis **Add**, type **Secret**, environnement **Production**)

| Nom | Valeur |
| --- | --- |
| `ADMIN_MOT_DE_PASSE` | Ton mot de passe d'administration : au moins 12 caractères, utilisé nulle part ailleurs. Par exemple, 5 mots au hasard. |
| `SECRET_SESSION` | Au moins 32 caractères tapés au hasard. Tu n'auras jamais à le retaper. |

**E. Brancher le bouton « Mettre le site à jour »**
1. **Settings**, puis **Builds**, puis **Deploy hooks**, puis **Add deploy hook**. Nom : `admin`, branche : `main`. Enregistre.
2. Copie l'adresse affichée, puis crée un secret `CROCHET_DEPLOIEMENT` avec cette adresse pour valeur (comme à l'étape D).

**F. Relancer le site**
1. Onglet **Deployments**, sur le dernier déploiement : **…**, puis **Retry deployment**.
2. Quand c'est terminé, ouvre `/admin/`. La page indique ce qui est réglé ou manquant. Tout est bon quand tu vois l'écran de connexion.

## Ajouter un design

1. `/admin/`, puis **Nouveau** dans le bon tiroir. L'identifiant (`orig-0006`, `dp-0011`…) est attribué tout seul et ne changera jamais.
2. Dépose le fichier haute définition : au moins 3000 px sur le grand côté. L'aperçu et les couleurs se font tout seuls.
3. Remplis la fiche. La colonne de droite liste ce qui manque avant de pouvoir publier.
4. **Publier**, puis, une fois plusieurs designs prêts, **Mettre le site à jour**.

Les exemples de la maquette portent l'étiquette « Exemple » : supprime-les au fur et à mesure que tes vrais designs arrivent.

## Où se trouve quoi

| Dossier ou fichier | Rôle |
| --- | --- |
| `app/(site)/` | Les pages publiques |
| `app/admin/`, `components/admin/` | L'administration |
| `functions/` | Les fonctions Cloudflare : API du catalogue, administration, aperçus |
| `server/` | Le code commun des fonctions : base de données, sécurité, fichiers |
| `lib/modele.ts` | Les règles communes : tiroirs, époques, couleurs, contrôles avant publication |
| `lib/graines.json` | Le catalogue de départ, versé une seule fois dans la base |
| `next.config.ts` | Le chargement du catalogue au moment de la fabrication |
| `app/globals.css` | Toute l'identité visuelle |
| `docs/prompts-recraft.md` | Le guide pour créer les motifs avec Recraft |

## Règles de sécurité du dépôt

Le dépôt est public. Trois règles à ne jamais enfreindre :

1. **Aucun secret dans le dépôt.** Mots de passe et clés vont dans les secrets Cloudflare. En local, ils vont dans `.dev.vars`, qui est exclu du dépôt.
2. **Aucun fichier haute définition dans le dépôt.** Ils passent par l'administration et vont dans R2.
3. **Seuls les aperçus basse définition** vont dans `public/`.

## Travailler sur son ordinateur (facultatif)

Il faut [Node.js](https://nodejs.org) version 22.

```bash
npm install
npm run dev          # le site seul, avec le catalogue de départ
npm run build        # fabrique le site dans out/
npm run cloudflare   # simule Cloudflare (base, stockage, fonctions) sur http://localhost:8788
npm run verifier     # vérifie le code
```

Pour la simulation, crée un fichier `.dev.vars` avec `ADMIN_MOT_DE_PASSE=...` et `SECRET_SESSION=...`. Pour fabriquer le site depuis les données de départ, sans Internet : `CATALOGUE_SOURCE=graines npm run build`.

## Étapes suivantes

1. Maquette : identité visuelle, accueil, grille, fiche design (fait)
2. Socle du site : catalogue en base, administration, aperçus filigranés, stockage privé (fait)
3. Comptes : inscription, favoris, tableaux, historique d'achats
4. Paiement : Stripe en mode test, livraison HD par lien temporaire, certificats de licence
5. Finitions : anglais, pages légales, mesure d'audience sans cookies
