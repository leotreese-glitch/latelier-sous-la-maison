import Link from "next/link";
import { Descente } from "@/components/Descente";
import { Mosaique } from "@/components/Mosaique";
import { COULEURS, DESIGNS, FAMILLES, FAMILLES_EN, nomCouleur, TIROIRS_OUVERTS, type Famille } from "@/lib/catalogue";
import { chemin, type Langue } from "@/lib/i18n";

const VITRINE: Record<Famille, string> = {
  retrouves: "/motifs/dp-0004.svg",
  atelier: "/designs/orig-0001.webp",
  "petit-atelier": "/coloriages/col-0001.svg",
};

const T = {
  fr: {
    tiroirs: "Deux tiroirs",
    tiroirsIntro: "Chaque design de l'atelier est rangé dans l'un de ces tiroirs.",
    nombre: (n: number) => `${n} design${n > 1 ? "s" : ""} à découvrir`,
    prevus: (n: number) => `${n} designs prévus au lancement`,
    trouvailles: "Dernières trouvailles",
    toutExplorer: "Tout explorer",
    couleurs: "Chercher par couleur",
    couleursIntro: "Choisissez une teinte : l'atelier sort tous les motifs qui la contiennent.",
  },
  en: {
    tiroirs: "Two drawers",
    tiroirsIntro: "Every design in the atelier is kept in one of these drawers.",
    nombre: (n: number) => `${n} design${n > 1 ? "s" : ""} to discover`,
    prevus: (n: number) => `${n} designs planned for the launch`,
    trouvailles: "Latest finds",
    toutExplorer: "Explore everything",
    couleurs: "Search by colour",
    couleursIntro: "Pick a shade: the atelier brings out every pattern that contains it.",
  },
};

export function Accueil({ l }: { l: Langue }) {
  const t = T[l];
  const explorer = chemin("explorer", l);
  const mur = DESIGNS.slice(0, 12);
  const trouvailles = DESIGNS.slice(0, 8);

  return (
    <>
      <Descente mur={mur} l={l} />

      <section className="section" aria-labelledby="titre-tiroirs">
        <div className="contenu">
          <h2 id="titre-tiroirs" className="section__titre">
            {t.tiroirs}
          </h2>
          <p className="section__intro">{t.tiroirsIntro}</p>
          <ul className="tiroirs">
            {TIROIRS_OUVERTS.map((cle) => {
              const f = FAMILLES[cle];
              const texte = l === "en" ? FAMILLES_EN[cle] : f;
              const reels = DESIGNS.filter((d) => d.famille === cle && !d.exemple);
              const image = reels.find((d) => d.image)?.image ?? VITRINE[cle];
              return (
                <li key={cle} className={`tiroir tiroir--${cle}`}>
                  <span className="porte-etiquette">
                    <span>{texte.nom}</span>
                  </span>
                  <span className="tiroir__entrebaille" style={{ backgroundImage: `url(${image})` }} />
                  <p className="tiroir__phrase">{texte.phrase}</p>
                  <p className="tiroir__nombre">{reels.length > 0 ? t.nombre(reels.length) : t.prevus(f.prevus)}</p>
                  <Link href={`${explorer}?famille=${cle}`} className="lien">
                    {texte.ouvrir}
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
              {t.trouvailles}
            </h2>
            <Link href={explorer} className="lien">
              {t.toutExplorer}
            </Link>
          </div>
          <Mosaique designs={trouvailles} etiquette={t.trouvailles} l={l} />
        </div>
      </section>

      <section className="section section--couleurs" aria-labelledby="titre-couleurs">
        <div className="contenu">
          <h2 id="titre-couleurs" className="section__titre">
            {t.couleurs}
          </h2>
          <p className="section__intro">{t.couleursIntro}</p>
          <ul className="nuancier">
            {COULEURS.map((c) => (
              <li key={c.cle}>
                <Link href={`${explorer}?couleur=${c.cle}`} className="nuancier__lien">
                  <span className="pastille pastille--grande" style={{ background: c.hex }} aria-hidden="true" />
                  {nomCouleur(c.cle, l)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
