import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Achat } from "@/components/Achat";
import { Apercu } from "@/components/Apercu";
import { Mosaique } from "@/components/Mosaique";
import { VoirSur } from "@/components/VoirSur";
import { COULEURS, DESIGNS, FAMILLES, lienSur, memeTiroir, PERIODES, RECU, trouver, TYPES, type Livrable } from "@/lib/catalogue";
import { JOURS_ACCES } from "@/lib/licence";

export const dynamicParams = false;

export function generateStaticParams() {
  return DESIGNS.map((d) => ({ slug: d.slug }));
}

type Props = { params: Promise<{ slug: string }> };

function decrireLivrable(f: Livrable) {
  const mo = f.taille / 1024 / 1024;
  const taille = mo >= 1 ? `${mo.toLocaleString("fr-FR", { maximumFractionDigits: mo < 10 ? 1 : 0 })} Mo` : `${Math.max(1, Math.round(f.taille / 1024))} Ko`;
  if (!f.largeur || !f.hauteur) return `Fichier ${f.format} (${taille})`;
  const cm = Math.round((Math.max(f.largeur, f.hauteur) / 300) * 2.54);
  return `Fichier ${f.format} de ${f.largeur.toLocaleString("fr-FR")} × ${f.hauteur.toLocaleString("fr-FR")} px, soit ${cm} cm sur le grand côté à 300 DPI (${taille})`;
}

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
              {d.exemple ? (
                RECU[d.famille].map((ligne) => <li key={ligne}>{ligne}</li>)
              ) : (
                <>
                  {d.livrables && d.livrables.length > 0
                    ? d.livrables.map((f, i) => <li key={i}>{decrireLivrable(f)}</li>)
                    : d.hd && <li>{decrireLivrable(d.hd)}</li>}
                  <li>
                    Le certificat de licence à votre nom, vérifiable en ligne, et le texte de la <Link href="/licence/">licence</Link>
                  </li>
                  <li>Vos téléchargements restent ouverts {JOURS_ACCES} jours après l'achat</li>
                </>
              )}
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
          <p className="cartel__source">
            {d.droits?.musee ? (
              <>
                {d.droits.musee}, {d.droits.reference}.{" "}
                {lienSur(d.droits.url) && (
                  <a href={d.droits.url} target="_blank" rel="noopener noreferrer">
                    Voir la notice du musée
                  </a>
                )}{" "}
                {d.source}
              </>
            ) : (
              d.source
            )}
          </p>
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
        <p className="fiche-section__lien">
          <Link href="/licence/">Lire la licence complète</Link>
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
