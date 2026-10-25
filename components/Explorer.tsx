"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  COULEURS,
  DESIGNS,
  nomCouleur,
  nomFamille,
  nomPeriode,
  nomType,
  PERIODES,
  texteDesign,
  TIROIRS_OUVERTS,
  type Couleur,
  type Famille,
  type Periode,
} from "@/lib/catalogue";
import type { Langue } from "@/lib/i18n";
import { Mosaique } from "./Mosaique";

const T = {
  fr: {
    rechercher: "Rechercher",
    placeholder: "Rechercher un motif",
    tiroir: "Tiroir",
    tout: "Tout",
    couleur: "Couleur",
    frise: "Frise chronologique",
    designs: (n: number) => `${n} ${n > 1 ? "designs" : "design"}`,
    en: (c: string) => ` en ${c.toLowerCase()}`,
    effacer: "Effacer les filtres",
    resultats: "Résultats",
    aucun: "Aucun design ne correspond à ces filtres. Retirez-en un pour élargir la recherche.",
  },
  en: {
    rechercher: "Search",
    placeholder: "Search for a pattern",
    tiroir: "Drawer",
    tout: "All",
    couleur: "Colour",
    frise: "Timeline",
    designs: (n: number) => `${n} ${n > 1 ? "designs" : "design"}`,
    en: (c: string) => ` in ${c.toLowerCase()}`,
    effacer: "Clear filters",
    resultats: "Results",
    aucun: "No design matches these filters. Remove one to widen the search.",
  },
};

const sansAccents = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

function texteRecherche(d: (typeof DESIGNS)[number], l: Langue) {
  const t = texteDesign(d, l);
  const couleurs = d.couleurs.map((c) => nomCouleur(c, l)).join(" ");
  return sansAccents(
    [t.titre, t.resume, t.origine, t.technique, t.date, nomPeriode(d.periode, l), couleurs, nomType(d.type, l), nomFamille(d.famille, l)].join(" "),
  );
}

export function Explorer({ l }: { l: Langue }) {
  const t = T[l];
  const params = useSearchParams();
  const familleInitiale = params.get("famille") as Famille | null;
  const couleurInitiale = params.get("couleur") as Couleur | null;

  const [famille, setFamille] = useState<Famille | null>(
    familleInitiale && TIROIRS_OUVERTS.includes(familleInitiale) ? familleInitiale : null,
  );
  const [couleur, setCouleur] = useState<Couleur | null>(
    couleurInitiale && COULEURS.some((c) => c.cle === couleurInitiale) ? couleurInitiale : null,
  );
  const [periode, setPeriode] = useState<Periode | null>(null);
  const [requete, setRequete] = useState("");

  const resultats = useMemo(() => {
    const mots = sansAccents(requete).split(/\s+/).filter(Boolean);
    return DESIGNS.filter((d) => {
      if (famille && d.famille !== famille) return false;
      if (couleur && !d.couleurs.includes(couleur)) return false;
      if (periode && d.periode !== periode) return false;
      if (mots.length) {
        const texte = texteRecherche(d, l);
        if (!mots.every((m) => texte.includes(m))) return false;
      }
      return true;
    });
  }, [famille, couleur, periode, requete, l]);

  const filtreActif = famille || couleur || periode || requete;
  const effacer = () => {
    setFamille(null);
    setCouleur(null);
    setPeriode(null);
    setRequete("");
  };

  const couleurChoisie = couleur ? nomCouleur(couleur, l) : null;

  return (
    <>
      <div className="filtres">
        <div className="contenu">
          <div className="filtres__ligne">
            <label className="recherche">
              <span className="sr-only">{t.rechercher}</span>
              <input
                type="search"
                value={requete}
                onChange={(e) => setRequete(e.target.value)}
                placeholder={t.placeholder}
              />
            </label>
            <div className="pilules" role="group" aria-label={t.tiroir}>
              <button type="button" className="pilule" aria-pressed={famille === null} onClick={() => setFamille(null)}>
                {t.tout}
              </button>
              {TIROIRS_OUVERTS.map((f) => (
                <button key={f} type="button" className="pilule" aria-pressed={famille === f} onClick={() => setFamille(famille === f ? null : f)}>
                  {nomFamille(f, l)}
                </button>
              ))}
            </div>
            <div className="teintes" role="group" aria-label={t.couleur}>
              {COULEURS.map((c) => (
                <button
                  key={c.cle}
                  type="button"
                  className="teinte-bouton"
                  style={{ background: c.hex }}
                  aria-pressed={couleur === c.cle}
                  aria-label={nomCouleur(c.cle, l)}
                  title={nomCouleur(c.cle, l)}
                  onClick={() => setCouleur(couleur === c.cle ? null : c.cle)}
                />
              ))}
            </div>
          </div>
          <nav className="frise" aria-label={t.frise}>
            <ol>
              {PERIODES.map((p) => (
                <li key={p.cle}>
                  <button type="button" aria-pressed={periode === p.cle} onClick={() => setPeriode(periode === p.cle ? null : p.cle)}>
                    {nomPeriode(p.cle, l)}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <p className="filtres__bilan" aria-live="polite">
            <span>
              {t.designs(resultats.length)}
              {couleurChoisie ? t.en(couleurChoisie) : ""}
            </span>
            {filtreActif && (
              <button type="button" className="effacer" onClick={effacer}>
                {t.effacer}
              </button>
            )}
          </p>
        </div>
      </div>

      <div className="contenu resultats">
        {resultats.length ? (
          <Mosaique designs={resultats} etiquette={t.resultats} l={l} />
        ) : (
          <div className="vide">
            <p>{t.aucun}</p>
            <button type="button" className="bouton bouton--contour" onClick={effacer}>
              {t.effacer}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
