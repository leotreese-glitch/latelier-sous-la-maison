import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Achat } from "@/components/Achat";
import { Apercu } from "@/components/Apercu";
import { Mosaique } from "@/components/Mosaique";
import { VoirSur } from "@/components/VoirSur";
import { COULEURS, DESIGNS, FAMILLES, memeTiroir, PERIODES, RECU, trouver, TYPES } from "@/lib/catalogue";

export const dynamicParams = false;

export function generateStaticParams() {
  return DESIGNS.map((d) => ({ slug: d.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = trouver((await params).slug);
  return d ? { title: d.titre, description: d.resume } : {};
}

export default async function FicheMotif({ params }: Props) {
  const d = trouver((await params).slug);
  if (!d) notFound();

  const famille = FAMILLES[d.famille];
  const periode = PERIODES.find((p) => p.cle === d.periode)?.nom;
  const voisins = memeTiroir(d);
  const coloriage = d.famille === "petit-atelier";

  return (
    <article className="contenu fiche">
      <nav className="fil" aria-label="Fil d'Ariane">
        <Link href="/explorer/">Explorer</Link> / <Link href={`/explorer/?famille=${d.famille}`}>{famille.nom}</Link>
      </nav>

      <div className="fiche__haut">
        <Apercu d={d} />

        <div className="fiche__infos">
          <h1>{d.titre}</h1>
          <p className="fiche__numero">N° {d.id}</p>
          <p className="fiche__resume">{d.resume}</p>
          {d.ia && <p className="fiche__ia">Création originale, réalisée avec l'assistance de l'IA.</p>}
          <Achat d={d} />
          <div className="recu">
            <h2>Ce que vous recevez</h2>
            <ul>
              {RECU[d.famille].map((ligne) => (
                <li key={ligne}>{ligne}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <section className="fiche-section" aria-labelledby="titre-cartel">
        <h2 id="titre-cartel">{d.famille === "retrouves" ? "Le cartel" : "Le cartel d'atelier"}</h2>
        <div className="cartel cartel--fiche">
          <div className="cartel__entete">
            <h3>{d.titre}</h3>
            <span>N° {d.id}</span>
          </div>
          <dl>
            <dt>Époque</dt>
            <dd>{d.date === periode ? d.date : `${d.date}, ${periode}`}</dd>
            <dt>Origine</dt>
            <dd>{d.origine}</dd>
            <dt>Technique</dt>
            <dd>{d.technique}</dd>
            <dt>Type de motif</dt>
            <dd>{TYPES[d.type]}</dd>
            {d.niveau && (
              <>
                <dt>Pour qui</dt>
                <dd>{d.niveau}</dd>
              </>
            )}
            {d.couleurs.length > 0 && (
              <>
                <dt>Couleurs</dt>
                <dd>
                  {d.couleurs.map((c) => {
                    const coul = COULEURS.find((x) => x.cle === c)!;
                    return (
                      <Link key={c} href={`/explorer/?couleur=${c}`} title={`Tous les designs en ${coul.nom.toLowerCase()}`} aria-label={coul.nom}>
                        <span className="pastille" style={{ background: coul.hex }} />
                      </Link>
                    );
                  })}
                </dd>
              </>
            )}
          </dl>
          <p className="cartel__texte">{d.cartel}</p>
          <p className="cartel__source">{d.source}</p>
        </div>
      </section>

      {!coloriage && (
        <section className="fiche-section" aria-labelledby="titre-voir-sur">
          <h2 id="titre-voir-sur">Voir sur</h2>
          <VoirSur d={d} />
        </section>
      )}

      <section className="fiche-section" aria-labelledby="titre-licence">
        <h2 id="titre-licence">La licence</h2>
        <p>
          {coloriage
            ? "Vous pouvez imprimer ces dessins autant de fois que vous voulez pour votre famille ou une classe. La revente des impressions et du fichier est interdite."
            : "Licence non exclusive, pour un seul acheteur, sans limite de durée. Vous pouvez utiliser le motif sur des produits que vous vendez. Il est interdit de revendre ou partager le fichier, de l'utiliser dans un logo ou de s'en servir pour entraîner une IA. Chaque achat produit un certificat de licence à votre nom."}
        </p>
      </section>

      {voisins.length > 0 && (
        <section className="fiche-section" aria-labelledby="titre-voisins">
          <h2 id="titre-voisins">Dans le même tiroir</h2>
          <Mosaique designs={voisins} etiquette="Dans le même tiroir" />
        </section>
      )}
    </article>
  );
}
