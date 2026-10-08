"use client";

import { useState } from "react";
import { prixEdition, type Design } from "@/lib/modele";
import { formatPrix, Prix, useDevise } from "./Devise";

export function Achat({ d }: { d: Design }) {
  const { devise } = useDevise();
  const [clic, setClic] = useState(false);
  const edition = prixEdition(d);
  const prix = edition ? edition.palier : d.prix;
  const coloriage = d.famille === "petit-atelier";

  const action = coloriage
    ? `Acheter la pochette, ${formatPrix(devise === "eur" ? prix.eur : prix.usd, devise)}`
    : `Acheter la licence, ${formatPrix(devise === "eur" ? prix.eur : prix.usd, devise)}`;

  return (
    <div className="achat">
      <p className="achat__prix">
        <Prix eur={prix.eur} usd={prix.usd} />
      </p>
      <p className="achat__licence">
        {coloriage
          ? `Pochette « ${d.pochette} » : 5 dessins à imprimer, pour la famille ou une classe.`
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

      <div className="achat__actions">
        <button type="button" className="bouton bouton--or" onClick={() => setClic(true)}>
          {action}
        </button>
        <button type="button" className="bouton bouton--contour" onClick={() => setClic(true)}>
          Ajouter aux favoris
        </button>
      </div>
      {clic && (
        <p className="achat__statut" role="status">
          Maquette : les favoris arrivent à l'étape 3, le paiement à l'étape 4.
        </p>
      )}
      <p className="achat__rassurance">
        Paiement sécurisé par Stripe. Les fichiers sont téléchargeables dès le paiement confirmé.
      </p>
    </div>
  );
}
