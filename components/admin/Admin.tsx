"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, ErreurApi, type DesignAdmin, type EtatConfig } from "@/lib/admin/api";
import { FAMILLES, type Famille } from "@/lib/modele";

type Etat =
  | { ecran: "chargement" }
  | { ecran: "non-configure"; config?: EtatConfig }
  | { ecran: "connexion" }
  | { ecran: "liste" };

const LIGNES_CONFIG: { cle: keyof EtatConfig; nom: string; detail: string; requis: boolean }[] = [
  { cle: "base", nom: "Base de données", detail: "liaison D1 nommée DB", requis: true },
  { cle: "stockage", nom: "Stockage des fichiers", detail: "liaison R2 nommée MEDIAS", requis: true },
  { cle: "motDePasse", nom: "Mot de passe", detail: "secret ADMIN_MOT_DE_PASSE, 12 caractères minimum", requis: true },
  { cle: "secretSession", nom: "Secret de session", detail: "secret SECRET_SESSION, 32 caractères minimum", requis: true },
  { cle: "crochet", nom: "Mise à jour du site", detail: "secret CROCHET_DEPLOIEMENT", requis: false },
];

export function EtatConfiguration({ config }: { config?: EtatConfig }) {
  return (
    <div className="admin-carte">
      <h2>L'administration n'est pas encore configurée</h2>
      <p>Suivez le guide « Étape 2 » du fichier README de votre dépôt GitHub. Voici ce que Cloudflare transmet au site :</p>
      {config ? (
        <ul className="admin-config">
          {LIGNES_CONFIG.map((l) => (
            <li key={l.cle} className={config[l.cle] ? "est-ok" : "est-manquant"}>
              <strong>{config[l.cle] ? "Réglé" : l.requis ? "Manquant" : "Facultatif, manquant"}</strong>
              <span>
                {l.nom} ({l.detail})
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>Le site ne répond pas : les fonctions Cloudflare ne sont peut-être pas encore déployées.</p>
      )}
      <p className="admin-aide">Après chaque changement de réglage, relancez un déploiement dans Cloudflare (Deployments, puis Retry deployment).</p>
    </div>
  );
}

function Connexion({ surConnecte }: { surConnecte: () => void }) {
  const [motDePasse, setMotDePasse] = useState("");
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const valider = async (e: FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    setMessage("");
    try {
      await api.connexion(motDePasse);
      surConnecte();
    } catch (err) {
      setMessage(err instanceof ErreurApi ? err.message : "Connexion impossible.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <form className="admin-carte admin-connexion" onSubmit={valider}>
      <h1>Administration</h1>
      <label className="champ">
        <span>Mot de passe</span>
        <input type="password" autoComplete="current-password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />
      </label>
      {message && (
        <p className="admin-erreur" role="alert">
          {message}
        </p>
      )}
      <button type="submit" className="bouton bouton--or" disabled={envoi}>
        {envoi ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}

const STATUTS = { brouillon: "Brouillon", publie: "Publié", retire: "Retiré" } as const;

function dateCourte(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function Liste() {
  const router = useRouter();
  const [designs, setDesigns] = useState<DesignAdmin[] | null>(null);
  const [miseAJour, setMiseAJour] = useState<{ changements: number; crochet: boolean; derniereMiseAJour: string } | null>(null);
  const [message, setMessage] = useState("");
  const [filtre, setFiltre] = useState<Famille | "tout">("tout");

  const charger = useCallback(async () => {
    try {
      const [l, m] = await Promise.all([api.liste(), api.etatMiseAJour()]);
      setDesigns(l.designs);
      setMiseAJour(m);
    } catch (e) {
      setMessage(e instanceof ErreurApi ? e.message : "Chargement impossible.");
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const creer = async (famille: Famille) => {
    try {
      const { id } = await api.creer(famille);
      router.push(`/admin/design/?id=${id}`);
    } catch (e) {
      setMessage(e instanceof ErreurApi ? e.message : "Création impossible.");
    }
  };

  const mettreAJour = async () => {
    setMessage("");
    try {
      await api.miseAJour();
      setMessage("Reconstruction demandée : le site sera à jour dans 2 à 3 minutes.");
      charger();
    } catch (e) {
      setMessage(e instanceof ErreurApi ? e.message : "Demande impossible.");
    }
  };

  const visibles = (designs ?? []).filter((d) => filtre === "tout" || d.famille === filtre);

  return (
    <>
      <div className="admin-entete-page">
        <h1>Designs</h1>
        <div className="admin-actions">
          {(Object.keys(FAMILLES) as Famille[]).map((f) => (
            <button key={f} type="button" className="bouton bouton--contour" onClick={() => creer(f)}>
              Nouveau : {FAMILLES[f].nom.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-carte admin-maj">
        <div>
          <strong>
            {miseAJour == null
              ? "…"
              : miseAJour.changements === 0
                ? "Le site est à jour."
                : `${miseAJour.changements} ${miseAJour.changements > 1 ? "designs publiés ou retirés ont changé" : "design publié ou retiré a changé"} depuis la dernière mise à jour.`}
          </strong>
          <p>Les designs publiés n'apparaissent sur le site qu'après la mise à jour, qui prend 2 à 3 minutes.</p>
        </div>
        <button type="button" className="bouton bouton--or" onClick={mettreAJour} disabled={!miseAJour?.crochet}>
          Mettre le site à jour
        </button>
      </div>
      {miseAJour && !miseAJour.crochet && (
        <p className="admin-aide">Le bouton s'activera une fois le secret CROCHET_DEPLOIEMENT réglé dans Cloudflare.</p>
      )}
      {message && (
        <p className="admin-message" role="status">
          {message}
        </p>
      )}

      <div className="pilules admin-filtres" role="group" aria-label="Tiroir">
        <button type="button" className="pilule" aria-pressed={filtre === "tout"} onClick={() => setFiltre("tout")}>
          Tout ({designs?.length ?? 0})
        </button>
        {(Object.keys(FAMILLES) as Famille[]).map((f) => (
          <button key={f} type="button" className="pilule" aria-pressed={filtre === f} onClick={() => setFiltre(f)}>
            {FAMILLES[f].nom} ({designs?.filter((d) => d.famille === f).length ?? 0})
          </button>
        ))}
      </div>

      {designs === null ? (
        <p className="admin-aide">Chargement…</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Aperçu</th>
              <th scope="col">N°</th>
              <th scope="col">Titre</th>
              <th scope="col">Statut</th>
              <th scope="col">Fichiers HD</th>
              <th scope="col">Modifié</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((d) => (
              <tr key={d.id}>
                <td>{d.image ? <img src={d.image} alt="" className="admin-vignette" /> : <span className="admin-vignette admin-vignette--vide" />}</td>
                <td className="admin-num">{d.id}</td>
                <td>
                  <Link href={`/admin/design/?id=${d.id}`}>{d.titre || "Sans titre"}</Link>
                </td>
                <td>
                  <span className={`admin-statut admin-statut--${d.statut}`}>{STATUTS[d.statut ?? "brouillon"]}</span>
                  {d.exemple && <span className="admin-statut admin-statut--exemple">Exemple</span>}
                </td>
                <td className="admin-num">{d.fichiersHd ?? 0}</td>
                <td className="admin-num">{dateCourte(d.modifieLe)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

export function Admin() {
  const [etat, setEtat] = useState<Etat>({ ecran: "chargement" });

  const verifier = useCallback(async () => {
    try {
      const r = await api.etat();
      setEtat({ ecran: r.connecte ? "liste" : "connexion" });
    } catch (e) {
      if (e instanceof ErreurApi && e.code === "non-configure") setEtat({ ecran: "non-configure", config: e.config });
      else setEtat({ ecran: "non-configure" });
    }
  }, []);

  useEffect(() => {
    verifier();
  }, [verifier]);

  if (etat.ecran === "chargement") return <p className="admin-aide">Chargement…</p>;
  if (etat.ecran === "non-configure") return <EtatConfiguration config={etat.config} />;
  if (etat.ecran === "connexion") return <Connexion surConnecte={() => setEtat({ ecran: "liste" })} />;
  return <Liste />;
}
