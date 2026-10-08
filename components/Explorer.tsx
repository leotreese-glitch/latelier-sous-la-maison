"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { COULEURS, DESIGNS, FAMILLES, PERIODES, TYPES, type Couleur, type Famille, type Periode } from "@/lib/catalogue";
import { Mosaique } from "./Mosaique";

const sansAccents = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

function texteRecherche(d: (typeof DESIGNS)[number]) {
  const couleurs = d.couleurs.map((c) => COULEURS.find((x) => x.cle === c)?.nom ?? "").join(" ");
  const periode = PERIODES.find((p) => p.cle === d.periode)?.nom ?? "";
  return sansAccents(
    [d.titre, d.resume, d.origine, d.technique, d.date, periode, couleurs, TYPES[d.type], FAMILLES[d.famille].nom, d.niveau ?? ""].join(" "),
  );
}

export function Explorer() {
  const params = useSearchParams();
  const familleInitiale = params.get("famille") as Famille | null;
  const couleurInitiale = params.get("couleur") as Couleur | null;

  const [famille, setFamille] = useState<Famille | null>(familleInitiale && familleInitiale in FAMILLES ? familleInitiale : null);
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
        const t = texteRecherche(d);
        if (!mots.every((m) => t.includes(m))) return false;
      }
      return true;
    });
  }, [famille, couleur, periode, requete]);

  const filtreActif = famille || couleur || periode || requete;
  const effacer = () => {
    setFamille(null);
    setCouleur(null);
    setPeriode(null);
    setRequete("");
  };

  const nomCouleur = couleur ? COULEURS.find((c) => c.cle === couleur)?.nom : null;

  return (
    <>
      <div className="filtres">
        <div className="contenu">
          <div className="filtres__ligne">
            <label className="recherche">
              <span className="sr-only">Rechercher</span>
              <input
                type="search"
                value={requete}
                onChange={(e) => setRequete(e.target.value)}
                placeholder="Rechercher un motif"
              />
            </label>
            <div className="pilules" role="group" aria-label="Tiroir">
              <button type="button" className="pilule" aria-pressed={famille === null} onClick={() => setFamille(null)}>
                Tout
              </button>
              {(Object.keys(FAMILLES) as Famille[]).map((f) => (
                <button key={f} type="button" className="pilule" aria-pressed={famille === f} onClick={() => setFamille(famille === f ? null : f)}>
                  {FAMILLES[f].nom}
                </button>
              ))}
            </div>
            <div className="teintes" role="group" aria-label="Couleur">
              {COULEURS.map((c) => (
                <button
                  key={c.cle}
                  type="button"
                  className="teinte-bouton"
                  style={{ background: c.hex }}
                  aria-pressed={couleur === c.cle}
                  aria-label={c.nom}
                  title={c.nom}
                  onClick={() => setCouleur(couleur === c.cle ? null : c.cle)}
                />
              ))}
            </div>
          </div>
          <nav className="frise" aria-label="Frise chronologique">
            <ol>
              {PERIODES.map((p) => (
                <li key={p.cle}>
                  <button type="button" aria-pressed={periode === p.cle} onClick={() => setPeriode(periode === p.cle ? null : p.cle)}>
                    {p.nom}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <p className="filtres__bilan" aria-live="polite">
            <span>
              {resultats.length} {resultats.length > 1 ? "designs" : "design"}
              {nomCouleur ? ` en ${nomCouleur.toLowerCase()}` : ""}
            </span>
            {filtreActif && (
              <button type="button" className="effacer" onClick={effacer}>
                Effacer les filtres
              </button>
            )}
          </p>
        </div>
      </div>

      <div className="contenu resultats">
        {resultats.length ? (
          <Mosaique designs={resultats} etiquette="Résultats" />
        ) : (
          <div className="vide">
            <p>Aucun design ne correspond à ces filtres. Retirez-en un pour élargir la recherche.</p>
            <button type="button" className="bouton bouton--contour" onClick={effacer}>
              Effacer les filtres
            </button>
          </div>
        )}
      </div>
    </>
  );
}
