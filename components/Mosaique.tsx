import Link from "next/link";
import { cheminMotif, type Langue } from "@/lib/i18n";
import { imageGrille, nomFamille, prixEdition, texteDesign, type Design } from "@/lib/modele";
import { Prix } from "./Devise";

/** Largeur affichée d'une tuile : une colonne sur téléphone, deux sur tablette, trois ou quatre sur ordinateur. */
const TAILLES_TUILE = "(max-width: 560px) 92vw, (max-width: 960px) 46vw, 380px";

export function Tuile({ d, l = "fr" }: { d: Design; l?: Langue }) {
  const edition = prixEdition(d);
  const prix = edition ? edition.palier : d.prix;
  const t = texteDesign(d, l);
  return (
    // Pas de préchargement des fiches : avec des dizaines de tuiles, il alourdissait le défilement.
    <Link href={cheminMotif(d.slug, l)} className={`tuile tuile--${d.famille}`} prefetch={false}>
      <span className="tuile__image">
        <img
          {...imageGrille(d)}
          sizes={TAILLES_TUILE}
          alt={t.resume}
          width={600}
          height={Math.round(600 * d.ratio)}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </span>
      <span className="tuile__legende">
        <span className="tuile__titre">{t.titre}</span>
        <span className="tuile__prix">
          <Prix eur={prix.eur} usd={prix.usd} />
        </span>
        <span className="tuile__detail">
          {d.famille === "petit-atelier" ? d.niveau : t.date}
          {edition ? (l === "en" ? ", limited edition" : ", édition limitée") : ""}
        </span>
      </span>
    </Link>
  );
}

export function Mosaique({ designs, etiquette, l = "fr" }: { designs: Design[]; etiquette?: string; l?: Langue }) {
  return (
    <ul className="mosaique" aria-label={etiquette}>
      {designs.map((d) => (
        <li key={d.id}>
          <Tuile d={d} l={l} />
        </li>
      ))}
    </ul>
  );
}

export function nomTiroir(d: Design, l: Langue = "fr") {
  return nomFamille(d.famille, l);
}
