# L'atelier sous la maison

Site de L'atelier sous la maison : une bibliothèque de motifs anciens restaurés, de créations originales et de coloriages, livrés en haute définition avec leur licence.

**État actuel : étape 1, la maquette.** Les pages sont en place, mais les contenus et les prix sont des exemples, et le paiement n'est pas branché.

## Ce que contient la maquette

| Page | Adresse | Ce qu'on y voit |
| --- | --- | --- |
| Accueil | `/` | La descente sous la maison, les trois tiroirs, les dernières trouvailles, la recherche par couleur |
| Explorer | `/explorer/` | La grille en mosaïque, les filtres par tiroir, couleur et époque, la recherche par mots |
| Fiche design | `/motif/<nom-du-motif>/` | L'aperçu filigrané avec loupe, le prix en euros ou en dollars, l'édition limitée, le cartel, le motif sur quatre objets |
| Identité visuelle | `/identite/` | Les trois pistes de logo, les couleurs, les typographies |

Les trois designs `orig-0001` à `orig-0003` sont les vrais designs de l'atelier. Tous les autres visuels sont des exemples dessinés pour la maquette : dans `lib/catalogue.ts`, ils portent la mention `exemple: true`.

## Mettre le site en ligne avec Cloudflare Pages (gratuit)

À faire une seule fois. Ensuite, chaque modification envoyée sur GitHub remet le site à jour toute seule.

1. Crée un compte gratuit sur [dash.cloudflare.com](https://dash.cloudflare.com).
2. Va dans **Workers & Pages**, clique **Create application**, puis l'onglet **Pages**.
3. Choisis **Import an existing Git repository**, connecte ton GitHub et sélectionne `latelier-sous-la-maison`, puis **Begin setup**.
4. Dans **Framework preset**, choisis **Next.js (Static HTML Export)**. Vérifie que la commande de build est `npx next build` et le dossier de sortie `out`.
5. Clique **Save and Deploy**. Après quelques minutes, le site est en ligne à une adresse en `.pages.dev`.

Le nom de domaine `lateliersouslamaison.com` se branche ensuite dans l'onglet **Custom domains** du projet.

Source : [guide officiel Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/). Les libellés de l'interface peuvent changer légèrement.

## Lancer le site sur son ordinateur (facultatif)

Il faut [Node.js](https://nodejs.org) version 22.

```bash
npm install
npm run dev
```

Puis ouvre http://localhost:3000.

## Où se trouve quoi

| Dossier ou fichier | Rôle |
| --- | --- |
| `lib/catalogue.ts` | Le catalogue : chaque design, son cartel, ses couleurs, son prix |
| `public/designs/` | Les aperçus des vrais designs |
| `public/motifs/`, `public/coloriages/` | Les visuels d'exemple, à supprimer avant le lancement |
| `app/` | Les pages du site |
| `components/` | Les éléments réutilisés : logo, descente, mosaïque, loupe, achat |
| `app/globals.css` | Toute l'identité visuelle : couleurs, typographies, mise en page |

## Règles de sécurité du dépôt

Le dépôt est public. Trois règles à ne jamais enfreindre :

1. **Aucune clé secrète dans le dépôt** (Stripe, base de données, e-mails). Elles vont dans les réglages secrets de Cloudflare.
2. **Aucun fichier haute définition dans le dépôt.** Ils iront dans un stockage privé, livrés par lien temporaire après paiement.
3. **Seuls les aperçus basse définition** vont dans `public/`.

## Étapes suivantes

1. Maquette : identité visuelle, accueil, grille, fiche design (fait)
2. Socle du site : vrai catalogue, administration, filigrane incrusté côté serveur
3. Comptes : inscription, favoris, tableaux, historique d'achats
4. Paiement en mode test : Stripe, livraison HD, certificats de licence
5. Finitions : anglais, pages légales, mesure d'audience sans cookies

À l'étape 2, le site passera d'un export statique à un hébergement avec serveur (Cloudflare Workers), nécessaire pour les comptes et les paiements.
