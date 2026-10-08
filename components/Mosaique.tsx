import Link from "next/link";
import { FAMILLES, prixEdition, type Design } from "@/lib/catalogue";
import { Prix } from "./Devise";

export function Tuile({ d }: { d: Design }) {
  const edition = prixEdition(d);
  const prix = edition ? edition.palier : d.prix;
  return (
    <Link href={`/motif/${d.slug}/`} className={`tuile tuile--${d.famille}`}>
      <span className="tuile__image">
        <img src={d.image} alt={d.resume} width={600} height={Math.round(600 * d.ratio)} loading="lazy" draggable={false} />
      </span>
      <span className="tuile__legende">
        <span className="tuile__titre">{d.titre}</span>
        <span className="tuile__prix">
          <Prix eur={prix.eur} usd={prix.usd} />
        </span>
        <span className="tuile__detail">
          {d.famille === "petit-atelier" ? d.niveau : d.date}
          {edition ? ", édition limitée" : ""}
        </span>
      </span>
    </Link>
  );
}

export function Mosaique({ designs, etiquette }: { designs: Design[]; etiquette?: string }) {
  return (
    <ul className="mosaique" aria-label={etiquette}>
      {designs.map((d) => (
        <li key={d.id}>
          <Tuile d={d} />
        </li>
      ))}
    </ul>
  );
}

export function nomFamille(d: Design) {
  return FAMILLES[d.famille].nom;
}
