"use client";

import Link from "next/link";
import { useState } from "react";
import { prixEdition, type Design } from "@/lib/modele";
import { formatPrix, Prix, useDevise } from "./Devise";

type Etat = { type: "repos" } | { type: "envoi" } | { type: "message"; texte: string; erreur?: boolean };

export function Achat({ d }: { d: Design }) {
  const { devise } = useDevise();
  const [cgv, setCgv] = useState(false);
  const [immediat, setImmediat] = useState(false);
  const [etat, setEtat] = useState<Etat>({ type: "repos" });
  const edition = prixEdition(d);
  const prix = edition ? edition.palier : d.prix;
  const coloriage = d.famille === "petit-atelier";
  // Liste vide : aucun fichier HD n'est encore déposé, rien à livrer. (Absente : catalogue fabriqué avant cette information.)
  const fichiersPrets = d.livrables === undefined || d.livrables.length > 0;
  const enVente = !d.exemple && (!d.edition || edition !== null) && fichiersPrets;

  const action = coloriage
    ? `Acheter la pochette, ${formatPrix(devise === "eur" ? prix.eur : prix.usd, devise)}`
    : `Acheter la licence, ${formatPrix(devise === "eur" ? prix.eur : prix.usd, devise)}`;

  const acheter = async () => {
    if (!cgv || !immediat) {
      setEtat({ type: "message", texte: "Cochez d'abord les deux cases ci-dessus.", erreur: true });
      return;
    }
    setEtat({ type: "envoi" });
    try {
      const rep = await fetch("/api/achat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ design: d.id, devise, cgv: true, consentement: true }),
      });
      const corps = (await rep.json().catch(() => ({}))) as { url?: string; erreur?: string; code?: string; detail?: string };
      if (rep.ok && corps.url) {
        window.location.assign(corps.url);
        return;
      }
      const texte =
        corps.code === "paiement-ferme"
          ? "Le paiement ouvre très bientôt : revenez dans quelques jours."
          : `${corps.erreur ?? "Le paiement n'a pas pu démarrer."}${corps.detail ? ` (${corps.detail})` : ""}`;
      setEtat({ type: "message", texte, erreur: true });
    } catch {
      setEtat({ type: "message", texte: "Connexion impossible : vérifiez votre accès à Internet.", erreur: true });
    }
  };

  return (
    <div className="achat">
      <p className="achat__prix">
        <Prix eur={prix.eur} usd={prix.usd} />
      </p>
      <p className="achat__licence">
        {coloriage
          ? `Pochette « ${d.pochette} » : 5 dessins à imprimer, pour la famille ou une classe.`
          : d.edition && !edition
            ? "Édition limitée épuisée : ce motif n'est plus en vente."
            : edition
              ? "Édition limitée à 30 licences. Le prix monte par paliers, puis le motif est retiré de la vente."
              : "Licence standard : usage personnel et commercial, sans limite de durée."}
      </p>

      {edition && d.edition && (
        <ol className="paliers" aria-label="Paliers de l'édition limitée">
          {d.edition.paliers.map((p, i) => (
            <li key={i} aria-current={i === edition.index ? "step" : undefined}>
              <span>
                {i === 0 ? "10 premières licences" : i === d.edition!.paliers.length - 1 ? "10 dernières licences" : "10 suivantes"}
                {i === edition.index ? `, encore ${edition.restantes}` : ""}
              </span>
              <span>
                <Prix eur={p.eur} usd={p.usd} />
              </span>
            </li>
          ))}
        </ol>
      )}

      {enVente ? (
        <>
          <div className="achat__accords">
            <label className="case achat__accord">
              <input
                type="checkbox"
                checked={cgv}
                onChange={(e) => {
                  setCgv(e.target.checked);
                  if (etat.type === "message") setEtat({ type: "repos" });
                }}
              />
              <span>
                J'ai lu et j'accepte les <Link href="/conditions-de-vente/">conditions de vente</Link> et{" "}
                <Link href="/licence/">la licence</Link>.
              </span>
            </label>
            <label className="case achat__accord">
              <input
                type="checkbox"
                checked={immediat}
                onChange={(e) => {
                  setImmediat(e.target.checked);
                  if (etat.type === "message") setEtat({ type: "repos" });
                }}
              />
              <span>
                Je demande l'accès immédiat aux fichiers et je reconnais perdre mon droit de rétractation dès leur mise à disposition.
              </span>
            </label>
          </div>
          <div className="achat__actions">
            <button type="button" className="bouton bouton--or" onClick={acheter} disabled={etat.type === "envoi"}>
              {etat.type === "envoi" ? "Ouverture du paiement…" : action}
            </button>
            <button
              type="button"
              className="bouton bouton--contour"
              onClick={() => setEtat({ type: "message", texte: "Les favoris arrivent avec les comptes, à l'étape 3." })}
            >
              Ajouter aux favoris
            </button>
          </div>
        </>
      ) : d.exemple ? (
        <p className="achat__statut">Exemple de la maquette : ce design n'est pas en vente.</p>
      ) : (
        !fichiersPrets && <p className="achat__statut">Les fichiers de ce design sont en préparation : il sera bientôt en vente.</p>
      )}
      {etat.type === "message" && (
        <p className={`achat__statut${etat.erreur ? " achat__statut--erreur" : ""}`} role="alert">
          {etat.texte}
        </p>
      )}
      <p className="achat__rassurance">
        Paiement sécurisé par Stripe. Les fichiers sont téléchargeables dès le paiement confirmé, avec le certificat de licence.
      </p>
    </div>
  );
}
