# L'atelier sous la maison

Site de L'atelier sous la maison : une bibliothèque de motifs anciens restaurés, de créations originales et de coloriages, livrés en haute définition avec leur licence.

**État actuel : étape 4, le paiement en mode test.** Le catalogue vit dans une base de données, l'administration permet d'ajouter les designs, les fichiers haute définition sont stockés en privé, et l'achat fonctionne avec Stripe en mode test : page de commande, téléchargement des fichiers HD, certificat de licence. Avant le paiement réel, il reste les courriels, le nom de domaine et les pages légales.

## Ce que contient le site

| Page | Adresse | Ce qu'on y voit |
| --- | --- | --- |
| Accueil | `/` | La descente sous la maison, les trois tiroirs, les dernières trouvailles, la recherche par couleur |
| Explorer | `/explorer/` | La grille en mosaïque, les filtres par tiroir, couleur et époque, la recherche par mots |
| Fiche design | `/motif/<nom-du-motif>/` | L'aperçu filigrané avec loupe, le prix en euros ou en dollars, l'édition limitée, le cartel, le motif sur quatre objets |
| Identité visuelle | `/identite/` | Les pistes de logo (les racines sont retenues), les couleurs, les typographies |
| Licences | `/licence/` | Le texte des deux licences (standard et coloriage) |
| Commande | `/commande/?t=…` | Après l'achat : les fichiers à télécharger et le certificat. Lien secret, propre à chaque acheteur |
| Certificat | `/certificat/?n=LSM-…` | Le certificat de licence, imprimable, et la vérification d'un numéro |
| Retrouver mes commandes | `/commande/retrouver/` | L'acheteur saisit son e-mail et reçoit à nouveau ses liens de commande |
| Administration | `/admin/`, `/admin/ventes/` | Réservée à Léo, protégée par mot de passe : designs et ventes |

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

## Étape 4 : brancher Stripe en mode test (environ 15 minutes)

Le paiement passe par **Stripe Managed Payments** : Stripe devient le vendeur officiel auprès de l'acheteur (« merchant of record »). Il calcule, collecte et reverse la TVA de chaque pays, et gère les litiges. En échange, ses frais sont plus élevés que le paiement classique, et le relevé bancaire de l'acheteur affiche `LINK.COM*`. Les libellés de Stripe peuvent changer légèrement.

**A. Le compte Stripe**
1. Crée un compte sur [dashboard.stripe.com/register](https://dashboard.stripe.com/register). Tu arrives dans un environnement de test (sandbox) : rien n'y est réellement débité.
2. **Settings**, puis **Managed Payments** ([dashboard.stripe.com/settings/managed-payments](https://dashboard.stripe.com/settings/managed-payments)) : active-le et accepte ses conditions. S'il ne s'affiche pas, voir « Sans Managed Payments » plus bas.
3. **Settings**, puis **Business**, puis **Public details** : renseigne un e-mail d'assistance. Il apparaît sur les reçus.

**B. La clé secrète**
1. **Developers**, puis **API keys** : révèle la **Secret key** (elle commence par `sk_test_`).
2. Dans Cloudflare, projet du site : **Settings**, puis **Variables and Secrets**, puis **Add**. Type **Secret**, nom `STRIPE_CLE_SECRETE`, valeur : la clé. Ne la colle jamais ailleurs.

**C. Le webhook (la confirmation des paiements)**
1. **Workbench**, onglet **Webhooks** ([dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)), puis **Create an event destination**.
2. **Your account**, puis le format **Snapshot** (pas « Thin », même s'il est recommandé : le site lit le contenu complet des événements). Garde la version d'API proposée.
3. Événements : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`. **Continue**, type **Webhook endpoint**, **Continue**.
4. Adresse : `https://latelier-sous-la-maison.pages.dev/api/stripe/webhook`, puis crée la destination.
5. Sur la page du webhook, **Reveal secret** (il commence par `whsec_`). Ajoute-le dans Cloudflare comme secret `STRIPE_SECRET_WEBHOOK`.

**D. Relancer le site**
1. Cloudflare, onglet **Deployments**, sur le dernier déploiement : **…**, puis **Retry deployment**.
2. Ouvre `/admin/ventes/` : la carte du haut doit dire « Paiement actif en mode test ».

**E. Faire un achat d'essai**
1. Sur une fiche, coche la case, puis **Acheter la licence**.
2. Carte `4242 4242 4242 4242`, une date future, n'importe quel code à 3 chiffres. Si Stripe demande un code Link, c'est `000000` en test.
3. Tu reviens sur la page de commande : télécharge le fichier, ouvre le certificat. La vente apparaît dans `/admin/ventes/`.
4. Pour tester un remboursement : dans Stripe, **Payments**, ouvre le paiement, **Refund**. La page de commande indique alors « remboursée » et les fichiers ne sont plus téléchargeables.

**Sans Managed Payments.** Si l'option n'est pas disponible pour ton compte, ajoute dans Cloudflare la variable `STRIPE_MANAGED_PAYMENTS` avec la valeur `non`. Le paiement fonctionne alors en mode classique : c'est toi qui vends, et la TVA est à ta charge.

**Comment se passe un achat.** La case à cocher enregistre l'accord de l'acheteur pour un accès immédiat (il renonce au droit de rétractation de 14 jours). Le prix est toujours calculé par le serveur. Après le paiement, l'acheteur arrive sur sa page de commande, à une adresse secrète : il y télécharge ses fichiers pendant 30 jours, par des liens valables une heure. Chaque achat reçoit un certificat numéroté (`LSM-XXXX-XXXX-XXXX`), avec le texte de la licence figé au jour de l'achat. Une édition limitée compte ses ventes et se retire seule une fois épuisée.

**Ce qui est livré.** La fiche liste exactement les fichiers HD déposés dans l'administration. Pour livrer un SVG, un carreau raccordable ou des déclinaisons de couleurs, dépose-les comme fichiers HD supplémentaires (PNG, JPEG, WebP, SVG, TIFF, PDF ou ZIP).

**Avant de passer en paiement réel**, il faudra : les e-mails branchés (voir « E-mails et nom de domaine ») ; les pages légales et les conditions de vente ; la relecture de la licence (`lib/licence.ts`) par un juriste ; l'activation du compte Stripe (identité, compte bancaire), puis une clé `sk_live_` et un webhook en mode réel.

## E-mails et nom de domaine

Le site envoie quatre sortes d'e-mails, par **Brevo** (entreprise française, données en Europe) :
la confirmation de commande à l'acheteur (lien de commande, certificat), une alerte à chaque vente pour Léo,
les liens de « Retrouver mes commandes », et le renvoi d'une confirmation depuis `/admin/ventes/`.
Chaque confirmation ne part qu'une fois, même si Stripe envoie l'événement plusieurs fois ; si Brevo est indisponible,
la vente est quand même enregistrée et l'e-mail peut être renvoyé depuis l'administration.

**Réglages, une seule fois :**
1. Cloudflare, **Domain Registration**, puis **Register Domains** : acheter `latelier-sous-la-maison.com`.
2. Projet Pages, onglet **Custom domains** : ajouter `latelier-sous-la-maison.com`, puis `www.latelier-sous-la-maison.com`.
3. **Compute**, **Email Service**, **Email Routing** (ou, selon l'affichage, le domaine puis **Email**, **Email Routing**) : **Onboard Domain** sur le domaine, ajouter la boîte de Léo dans **Destination Addresses** et la vérifier, puis **Routing Rules**, **Create routing rule** : `contact` → **Send to an email** → cette boîte.
4. Brevo : créer le compte, puis **Settings**, **Senders, Domains, IPs**, **Domains** : ajouter le domaine (authentification automatique avec Cloudflare, ou recopier les enregistrements DNS en mettant les CNAME en « DNS only »).
5. Brevo, onglet **Senders** : déclarer `commandes@latelier-sous-la-maison.com`, nom « L'atelier sous la maison ».
6. Brevo, **SMTP & API**, **API keys** : générer une clé et l'ajouter dans Cloudflare comme secret `BREVO_CLE_API`.
7. Cloudflare, variables de type **Text** : `EMAIL_ALERTE_VENTES` (l'adresse qui reçoit les alertes de vente) et `ADRESSE_SITE` (`https://latelier-sous-la-maison.com`, une fois le domaine actif).
8. Relancer un déploiement. `/admin/ventes/` indique si les e-mails sont actifs.

**Adresse de contact.** Elle n'est affichée sur le site et dans les e-mails qu'une fois vérifiée : passer `actif` à `true` dans `lib/site.ts`.

## Pages légales

Les trois pages (`/conditions-de-vente/`, `/mentions-legales/`, `/confidentialite/`) lisent leurs informations dans `lib/legal.ts`. Tant qu'un champ y est vide, la page affiche « à compléter » et un avertissement qui liste ce qui manque.

À remplir une fois la micro-entreprise créée : nom suivi de « EI », adresse (une domiciliation convient), téléphone, SIRET, mention de TVA (« TVA non applicable, article 293 B du CGI » en franchise), et le médiateur de la consommation choisi (nom, adresse, site). Changer aussi `MISE_A_JOUR_LEGALE`, et `VERSION_CGV` si le texte des conditions de vente change.

Avant de payer, l'acheteur coche deux cases distinctes : conditions de vente et licence ; accès immédiat avec perte du droit de rétractation. Le serveur refuse l'achat sans les deux. L'heure de l'accord et la version des conditions sont gardées dans la commande et rappelées dans l'e-mail de confirmation.

Dans Stripe, Paramètres > Checkout : renseigner l'adresse des conditions d'utilisation (`https://latelier-sous-la-maison.com/conditions-de-vente/`) et de la politique de confidentialité (`https://latelier-sous-la-maison.com/confidentialite/`).

Ces textes sont une base de travail : à faire relire par un juriste avant le passage en paiement réel.

## Visibilité : Google, partage, Pinterest

- Chaque page a son adresse canonique (sur le .com) et un aperçu de partage. La fiche d'un design montre son aperçu filigrané ; les autres pages montrent `public/partage.png`.
- La fiche d'un design donne à Google et Pinterest ses données produit (prix, disponibilité) et propose un lien « Enregistrer sur Pinterest », sans aucun script de Pinterest sur le site.
- `sitemap.xml` et `robots.txt` sont fabriqués avec le site. Les adresses en `pages.dev` ne sont jamais indexées.
- **Indexation par Google : fermée pour l'instant.** Au lancement (ou deux à trois semaines avant), passer `INDEXATION` à `true` dans `lib/site.ts`, puis déclarer le site et son `sitemap.xml` dans Google Search Console.

## Ajouter un design

1. `/admin/`, puis **Nouveau** dans le bon tiroir. L'identifiant (`orig-0006`, `dp-0011`…) est attribué tout seul et ne changera jamais.
2. Dépose le fichier haute définition : au moins 3000 px sur le grand côté. L'aperçu et les couleurs se font tout seuls.
3. Remplis la fiche. La colonne de droite liste ce qui manque avant de pouvoir publier.
4. **Publier**, puis, une fois plusieurs designs prêts, **Mettre le site à jour**.

Un fichier SVG (vectoriel, par exemple exporté de Recraft) est accepté comme fichier haute définition : l'aperçu se fabrique pareil, et la fiche l'annonce comme agrandissable à toutes les tailles.

Les exemples de la maquette portent l'étiquette « Exemple » : supprime-les au fur et à mesure que tes vrais designs arrivent.

## Où se trouve quoi

| Dossier ou fichier | Rôle |
| --- | --- |
| `app/(site)/` | Les pages publiques |
| `app/admin/`, `components/admin/` | L'administration |
| `functions/` | Les fonctions Cloudflare : API du catalogue, administration, aperçus |
| `server/` | Le code commun des fonctions : base de données, sécurité, fichiers, Stripe, commandes |
| `functions/api/achat.ts`, `functions/api/stripe/webhook.ts` | Le départ vers Stripe et la confirmation des paiements |
| `functions/api/commande.ts`, `telecharger.ts`, `certificat.ts` | La page de commande, les téléchargements signés, les certificats |
| `lib/licence.ts` | Le texte des licences, recopié dans chaque commande |
| `lib/site.ts` | Le domaine, l'adresse de contact et l'expéditeur des e-mails |
| `server/courriel.ts`, `server/modeles-courriel.ts` | L'envoi par Brevo et le texte des e-mails |
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

Pour la simulation, crée un fichier `.dev.vars` avec `ADMIN_MOT_DE_PASSE=...` et `SECRET_SESSION=...`, plus `STRIPE_CLE_SECRETE=sk_test_...` et `STRIPE_SECRET_WEBHOOK=whsec_...` pour le paiement, et `BREVO_CLE_API=...` pour les e-mails. Pour fabriquer le site depuis les données de départ, sans Internet : `CATALOGUE_SOURCE=graines npm run build`.

## Étapes suivantes

1. Maquette : identité visuelle, accueil, grille, fiche design (fait)
2. Socle du site : catalogue en base, administration, aperçus filigranés, stockage privé (fait)
3. Comptes : inscription, favoris, tableaux, historique d'achats
4. Paiement : Stripe en mode test, livraison HD par lien temporaire, certificats de licence, e-mails (fait en mode test)
5. Finitions : pages légales (rédigées, à compléter et à faire relire), anglais, mesure d'audience sans cookies
