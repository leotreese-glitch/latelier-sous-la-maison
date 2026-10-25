import Link from "next/link";
import { cheminMotif, type Langue } from "@/lib/i18n";
import { nomFamille, prixEdition, texteDesign, type Design } from "@/lib/modele";
import { Prix } from "./Devise";

export function Tuile({ d, l = "fr" }: { d: Design; l?: Langue }) {
  const edition = prixEdition(d);
  const prix = edition ? edition.palier : d.prix;
  const t = texteDesign(d, l);
  return (
    <Link href={cheminMotif(d.slug, l)} className={`tuile tuile--${d.famille}`}>
      <span className="tuile__image">
        <img src={d.image} alt={t.resume} width={600} height={Math.round(600 * d.ratio)} loading="lazy" draggable={false} />
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
