import type { Metadata } from "next";
import Link from "next/link";
import { Achat } from "@/components/Achat";
import { Apercu } from "@/components/Apercu";
import { Mosaique } from "@/components/Mosaique";
import { VoirSur } from "@/components/VoirSur";
import {
  COULEURS,
  lienSur,
  memeTiroir,
  nomCouleur,
  nomFamille,
  nomPeriode,
  nomType,
  prixEdition,
  RECU,
  texteDesign,
  type Design,
  type Livrable,
} from "@/lib/catalogue";
import { chemin, cheminMotif, LOCALE, type Langue } from "@/lib/i18n";
import { JOURS_ACCES } from "@/lib/licence";
import { adresseAbsolue, imageDesign, lienPinterest, metaPage, NOM_SITE } from "@/lib/partage";

const T = {
  fr: {
    fil: "Fil d'Ariane",
    explorer: "Explorer",
    numero: "N°",
    ia: "Création originale, réalisée avec l'assistance de l'IA.",
    recu: "Ce que vous recevez",
    certificat: "Le certificat de licence à votre nom, vérifiable en ligne, et le texte de la",
    licenceMot: "licence",
    acces: `Vos téléchargements restent ouverts ${JOURS_ACCES} jours après l'achat`,
    exemple: [] as string[],
    pinterest: "Enregistrer sur Pinterest",
    cartel: "Le cartel",
    cartelAtelier: "Le cartel d'atelier",
    epoque: "Époque",
    origine: "Origine",
    technique: "Technique",
    type: "Type de motif",
    pourQui: "Pour qui",
    couleurs: "Couleurs",
    tousEn: (c: string) => `Tous les designs en ${c.toLowerCase()}`,
    notice: "Voir la notice du musée",
    voirSur: "Voir sur",
    licence: "La licence",
    licenceStandard:
      "Licence non exclusive, pour un seul acheteur, sans limite de durée. Vous pouvez utiliser le motif sur des produits que vous vendez. Il est interdit de revendre ou partager le fichier, de l'utiliser dans un logo ou de s'en servir pour entraîner une IA. Chaque achat produit un certificat de licence à votre nom.",
    licenceColoriage:
      "Vous pouvez imprimer ces dessins autant de fois que vous voulez pour votre famille ou une classe. La revente des impressions et du fichier est interdite.",
    lireLicence: "Lire la licence complète",
    voisins: "Dans le même tiroir",
    alt: (titre: string) => `${titre}, aperçu filigrané`,
    svg: (taille: string) => `Fichier vectoriel SVG, agrandissable à toutes les tailles sans perte de qualité (${taille})`,
    fichier: (format: string, taille: string) => `Fichier ${format} (${taille})`,
    pixels: (format: string, l: string, h: string, cm: number, taille: string) =>
      `Fichier ${format} de ${l} × ${h} px, soit ${cm} cm sur le grand côté à 300 DPI (${taille})`,
    mo: "Mo",
    ko: "Ko",
  },
  en: {
    fil: "Breadcrumb",
    explorer: "Explore",
    numero: "No.",
    ia: "Original design, created with the assistance of AI.",
    recu: "What you receive",
    certificat: "The license certificate in your name, verifiable online, and the text of the",
    licenceMot: "license",
    acces: `Your downloads stay open for ${JOURS_ACCES} days after purchase`,
    exemple: ["Example from the mock-up: this design is not for sale."],
    pinterest: "Save to Pinterest",
    cartel: "The museum label",
    cartelAtelier: "The atelier label",
    epoque: "Period",
    origine: "Origin",
    technique: "Technique",
    type: "Pattern type",
    pourQui: "For",
    couleurs: "Colours",
    tousEn: (c: string) => `All designs in ${c.toLowerCase()}`,
    notice: "See the museum record",
    voirSur: "See it on",
    licence: "The license",
    licenceStandard:
      "A non-exclusive license for a single buyer, with no time limit. You may use the pattern on products you sell. You may not resell or share the file, use it in a logo or use it to train an AI. Every purchase comes with a license certificate in your name.",
    licenceColoriage:
      "You may print these drawings as many times as you like for your family or a class. Selling the prints or the file is not allowed.",
    lireLicence: "Read the full license",
    voisins: "In the same drawer",
    alt: (titre: string) => `${titre}, watermarked preview`,
    svg: (taille: string) => `SVG vector file, scalable to any size without loss of quality (${taille})`,
    fichier: (format: string, taille: string) => `${format} file (${taille})`,
    pixels: (format: string, l: string, h: string, cm: number, taille: string) =>
      `${format} file, ${l} × ${h} px, that is ${cm} cm (${(cm / 2.54).toFixed(1)} in) on the long side at 300 DPI (${taille})`,
    mo: "MB",
    ko: "KB",
  },
};

function decrireLivrable(f: Livrable, l: Langue) {
  const t = T[l];
  const loc = LOCALE[l];
  const mo = f.taille / 1024 / 1024;
  const taille =
    mo >= 1 ? `${mo.toLocaleString(loc, { maximumFractionDigits: mo < 10 ? 1 : 0 })} ${t.mo}` : `${Math.max(1, Math.round(f.taille / 1024))} ${t.ko}`;
  if (f.format === "SVG") return t.svg(taille);
  if (!f.largeur || !f.hauteur) return t.fichier(f.format, taille);
  const cm = Math.round((Math.max(f.largeur, f.hauteur) / 300) * 2.54);
  return t.pixels(f.format, f.largeur.toLocaleString(loc), f.hauteur.toLocaleString(loc), cm, taille);
}

/** Métadonnées d'une fiche dans une langue, avec l'adresse de la même fiche dans l'autre. */
export function metaFiche(d: Design, l: Langue): Metadata {
  const t = texteDesign(d, l);
  return metaPage({
    chemin: cheminMotif(d.slug, l),
    autre: cheminMotif(d.slug, l === "fr" ? "en" : "fr"),
    langue: l,
    titre: t.titre,
    description: t.resume,
    image: imageDesign(d),
    alt: T[l].alt(t.titre),
    // Les exemples de la maquette ne sont pas en vente : jamais dans les moteurs de recherche.
    indexable: !d.exemple,
  });
}

/** Données produit lues par Google et Pinterest (prix, disponibilité, image filigranée). */
function donneesProduit(d: Design, l: Langue) {
  const image = imageDesign(d);
  if (!image) return null;
  const t = texteDesign(d, l);
  const edition = prixEdition(d);
  const prix = edition ? edition.palier : d.prix;
  const fichiersPrets = d.livrables === undefined || d.livrables.length > 0;
  const enVente = (!d.edition || edition !== null) && fichiersPrets;
  const json = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: t.titre,
    description: t.resume,
    image: [adresseAbsolue(image)],
    sku: d.id,
    brand: { "@type": "Brand", name: NOM_SITE },
    offers: {
      "@type": "Offer",
      url: adresseAbsolue(cheminMotif(d.slug, l)),
      price: (l === "en" ? prix.usd : prix.eur).toFixed(2),
      priceCurrency: l === "en" ? "USD" : "EUR",
      availability: enVente ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    },
  };
  // Échappement de « < » : le texte ne peut pas refermer la balise script.
  return JSON.stringify(json).replace(/</g, "\\u003c");
}

export function FicheMotif({ d, l }: { d: Design; l: Langue }) {
  const t = T[l];
  const texte = texteDesign(d, l);
  const periode = nomPeriode(d.periode, l);
  const voisins = memeTiroir(d);
  const coloriage = d.famille === "petit-atelier";
  const produit = donneesProduit(d, l);
  const pinterest = lienPinterest({ ...d, titre: texte.titre }, cheminMotif(d.slug, l));
  const explorer = chemin("explorer", l);

  return (
    <article className="contenu fiche">
      {produit && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: produit }} />}
      <nav className="fil" aria-label={t.fil}>
        <Link href={explorer}>{t.explorer}</Link> / <Link href={`${explorer}?famille=${d.famille}`}>{nomFamille(d.famille, l)}</Link>
      </nav>

      <div className="fiche__haut">
        <Apercu d={d} l={l} />

        <div className="fiche__infos">
          <h1>{texte.titre}</h1>
          <p className="fiche__numero">
            {t.numero} {d.id}
          </p>
          <p className="fiche__resume">{texte.resume}</p>
          {d.ia && <p className="fiche__ia">{t.ia}</p>}
          <Achat d={d} l={l} />
          <div className="recu">
            <h2>{t.recu}</h2>
            <ul>
              {d.exemple ? (
                (l === "fr" ? RECU[d.famille] : t.exemple).map((ligne) => <li key={ligne}>{ligne}</li>)
              ) : (
                <>
                  {d.livrables && d.livrables.length > 0
                    ? d.livrables.map((f, i) => <li key={i}>{decrireLivrable(f, l)}</li>)
                    : d.hd && <li>{decrireLivrable(d.hd, l)}</li>}
                  <li>
                    {t.certificat} <Link href={chemin("licence", l)}>{t.licenceMot}</Link>
                  </li>
                  <li>{t.acces}</li>
                </>
              )}
            </ul>
          </div>
          {pinterest && (
            <p className="fiche__partage">
              <a href={pinterest} target="_blank" rel="noopener noreferrer">
                {t.pinterest}
              </a>
            </p>
          )}
        </div>
      </div>

      <section className="fiche-section" aria-labelledby="titre-cartel">
        <h2 id="titre-cartel">{d.famille === "retrouves" ? t.cartel : t.cartelAtelier}</h2>
        <div className="cartel cartel--fiche">
          <div className="cartel__entete">
            <h3>{texte.titre}</h3>
            <span>
              {t.numero} {d.id}
            </span>
          </div>
          <dl>
            <dt>{t.epoque}</dt>
            <dd>{texte.date === periode ? texte.date : `${texte.date}, ${periode}`}</dd>
            <dt>{t.origine}</dt>
            <dd>{texte.origine}</dd>
            <dt>{t.technique}</dt>
            <dd>{texte.technique}</dd>
            <dt>{t.type}</dt>
            <dd>{nomType(d.type, l)}</dd>
            {d.niveau && (
              <>
                <dt>{t.pourQui}</dt>
                <dd>{d.niveau}</dd>
              </>
            )}
            {d.couleurs.length > 0 && (
              <>
                <dt>{t.couleurs}</dt>
                <dd>
                  {d.couleurs.map((c) => {
                    const coul = COULEURS.find((x) => x.cle === c)!;
                    const nom = nomCouleur(c, l);
                    return (
                      <Link key={c} href={`${explorer}?couleur=${c}`} title={t.tousEn(nom)} aria-label={nom}>
                        <span className="pastille" style={{ background: coul.hex }} />
                      </Link>
                    );
                  })}
                </dd>
              </>
            )}
          </dl>
          <p className="cartel__texte">{texte.cartel}</p>
          <p className="cartel__source">
            {d.droits?.musee ? (
              <>
                {d.droits.musee}, {d.droits.reference}.{" "}
                {lienSur(d.droits.url) && (
                  <a href={d.droits.url} target="_blank" rel="noopener noreferrer">
                    {t.notice}
                  </a>
                )}{" "}
                {texte.source}
              </>
            ) : (
              texte.source
            )}
          </p>
        </div>
      </section>

      {!coloriage && (
        <section className="fiche-section" aria-labelledby="titre-voir-sur">
          <h2 id="titre-voir-sur">{t.voirSur}</h2>
          <VoirSur d={d} l={l} />
        </section>
      )}

      <section className="fiche-section" aria-labelledby="titre-licence">
        <h2 id="titre-licence">{t.licence}</h2>
        <p>{coloriage ? t.licenceColoriage : t.licenceStandard}</p>
        <p className="fiche-section__lien">
          <Link href={chemin("licence", l)}>{t.lireLicence}</Link>
        </p>
      </section>

      {voisins.length > 0 && (
        <section className="fiche-section" aria-labelledby="titre-voisins">
          <h2 id="titre-voisins">{t.voisins}</h2>
          <Mosaique designs={voisins} etiquette={t.voisins} l={l} />
        </section>
      )}
    </article>
  );
}
