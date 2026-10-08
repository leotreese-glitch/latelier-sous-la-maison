import Link from "next/link";
import { Descente } from "@/components/Descente";
import { Mosaique } from "@/components/Mosaique";
import { COULEURS, DESIGNS, FAMILLES, type Famille } from "@/lib/catalogue";

const VITRINE: Record<Famille, string> = {
  retrouves: "/motifs/dp-0004.svg",
  atelier: "/designs/orig-0001.webp",
  "petit-atelier": "/coloriages/col-0001.svg",
};

export default function Accueil() {
  const mur = DESIGNS.filter((d) => d.famille !== "petit-atelier").slice(0, 12);
  const trouvailles = DESIGNS.slice(0, 8);

  return (
    <>
      <Descente mur={mur} />

      <section className="section" aria-labelledby="titre-tiroirs">
        <div className="contenu">
          <h2 id="titre-tiroirs" className="section__titre">
            Trois tiroirs
          </h2>
          <p className="section__intro">Chaque design de l'atelier est rangé dans l'un de ces tiroirs.</p>
          <ul className="tiroirs">
            {(Object.keys(FAMILLES) as Famille[]).map((cle) => {
              const f = FAMILLES[cle];
              return (
                <li key={cle} className={`tiroir tiroir--${cle}`}>
                  <span className="porte-etiquette">
                    <span>{f.nom}</span>
                  </span>
                  <span className="tiroir__entrebaille" style={{ backgroundImage: `url(${VITRINE[cle]})` }} />
                  <p className="tiroir__phrase">{f.phrase}</p>
                  <p className="tiroir__nombre">{f.prevus} designs prévus au lancement</p>
                  <Link href={`/explorer/?famille=${cle}`} className="lien">
                    {f.ouvrir}
                  </Link>
                  <span className="tiroir__poignee" aria-hidden="true" />
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="titre-trouvailles">
        <div className="contenu">
          <div className="section__tete">
            <h2 id="titre-trouvailles" className="section__titre">
              Dernières trouvailles
            </h2>
            <Link href="/explorer/" className="lien">
              Tout explorer
            </Link>
          </div>
          <Mosaique designs={trouvailles} etiquette="Dernières trouvailles" />
        </div>
      </section>

      <section className="section section--couleurs" aria-labelledby="titre-couleurs">
        <div className="contenu">
          <h2 id="titre-couleurs" className="section__titre">
            Chercher par couleur
          </h2>
          <p className="section__intro">
            Choisissez une teinte : l'atelier sort tous les motifs qui la contiennent.
          </p>
          <ul className="nuancier">
            {COULEURS.map((c) => (
              <li key={c.cle}>
                <Link href={`/explorer/?couleur=${c.cle}`} className="nuancier__lien">
                  <span className="pastille pastille--grande" style={{ background: c.hex }} aria-hidden="true" />
                  {c.nom}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
