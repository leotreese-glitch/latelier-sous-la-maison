"use client";

import Link from "next/link";
import { useState } from "react";
import { chemin, type Langue } from "@/lib/i18n";
import { prixEdition, type Design } from "@/lib/modele";
import { formatPrix, Prix, useDevise } from "./Devise";

const T = {
  fr: {
    acheterPochette: "Acheter la pochette",
    acheterLicence: "Acheter la licence",
    cocher: "Cochez d'abord les deux cases ci-dessus.",
    ferme: "Le paiement ouvre très bientôt : revenez dans quelques jours.",
    echec: "Le paiement n'a pas pu démarrer.",
    connexion: "Connexion impossible : vérifiez votre accès à Internet.",
    pochette: (nom?: string) => `Pochette « ${nom} » : 5 dessins à imprimer, pour la famille ou une classe.`,
    epuisee: "Édition limitée épuisée : ce motif n'est plus en vente.",
    edition: "Édition limitée à 30 licences. Le prix monte par paliers, puis le motif est retiré de la vente.",
    standard: "Licence standard : usage personnel et commercial, sans limite de durée.",
    paliers: "Paliers de l'édition limitée",
    premieres: "10 premières licences",
    dernieres: "10 dernières licences",
    suivantes: "10 suivantes",
    encore: (n: number) => `, encore ${n}`,
    accepte: "J'ai lu et j'accepte les",
    cgv: "conditions de vente",
    et: "et",
    laLicence: "la licence",
    immediat: "Je demande l'accès immédiat aux fichiers et je reconnais perdre mon droit de rétractation dès leur mise à disposition.",
    ouverture: "Ouverture du paiement…",
    exemple: "Exemple de la maquette : ce design n'est pas en vente.",
    preparation: "Les fichiers de ce design sont en préparation : il sera bientôt en vente.",
    rassurance: "Paiement sécurisé par Stripe. Les fichiers sont téléchargeables dès le paiement confirmé, avec le certificat de licence.",
  },
  en: {
    acheterPochette: "Buy the pack",
    acheterLicence: "Buy the license",
    cocher: "Please tick both boxes above first.",
    ferme: "Checkout opens very soon: please come back in a few days.",
    echec: "Checkout could not start. Please try again in a moment.",
    connexion: "Connection failed: please check your internet access.",
    pochette: (nom?: string) => `“${nom}” pack: 5 drawings to print, for a family or a class.`,
    epuisee: "Limited edition sold out: this pattern is no longer for sale.",
    edition: "Limited edition of 30 licenses. The price rises in steps, then the pattern is withdrawn from sale.",
    standard: "Standard license: personal and commercial use, with no time limit.",
    paliers: "Limited edition price steps",
    premieres: "First 10 licenses",
    dernieres: "Last 10 licenses",
    suivantes: "Next 10",
    encore: (n: number) => `, ${n} left`,
    accepte: "I have read and accept the",
    cgv: "terms of sale",
    et: "and",
    laLicence: "the license",
    immediat: "I request immediate access to the files and acknowledge that I lose my right of withdrawal once they are made available.",
    ouverture: "Opening checkout…",
    exemple: "Example from the mock-up: this design is not for sale.",
    preparation: "The files for this design are being prepared: it will be for sale soon.",
    rassurance: "Secure payment by Stripe. Files can be downloaded as soon as payment is confirmed, with the license certificate.",
  },
};

type Etat = { type: "repos" } | { type: "envoi" } | { type: "message"; texte: string; erreur?: boolean };

export function Achat({ d, l = "fr" }: { d: Design; l?: Langue }) {
  const t = T[l];
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

  const action = `${coloriage ? t.acheterPochette : t.acheterLicence}, ${formatPrix(devise === "eur" ? prix.eur : prix.usd, devise, l)}`;

  const acheter = async () => {
    if (!cgv || !immediat) {
      setEtat({ type: "message", texte: t.cocher, erreur: true });
      return;
    }
    setEtat({ type: "envoi" });
    try {
      const rep = await fetch("/api/achat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ design: d.id, devise, cgv: true, consentement: true, langue: l }),
      });
      const corps = (await rep.json().catch(() => ({}))) as { url?: string; erreur?: string; code?: string; detail?: string };
      if (rep.ok && corps.url) {
        window.location.assign(corps.url);
        return;
      }
      // Sur le site anglais, les messages du serveur (en français) sont remplacés par un message anglais.
      const texte =
        corps.code === "paiement-ferme"
          ? t.ferme
          : l === "en"
            ? `${t.echec}${corps.detail ? ` (${corps.detail})` : ""}`
            : `${corps.erreur ?? t.echec}${corps.detail ? ` (${corps.detail})` : ""}`;
      setEtat({ type: "message", texte, erreur: true });
    } catch {
      setEtat({ type: "message", texte: t.connexion, erreur: true });
    }
  };

  return (
    <div className="achat">
      <p className="achat__prix">
        <Prix eur={prix.eur} usd={prix.usd} />
      </p>
      <p className="achat__licence">
        {coloriage ? t.pochette(d.pochette) : d.edition && !edition ? t.epuisee : edition ? t.edition : t.standard}
      </p>

      {edition && d.edition && (
        <ol className="paliers" aria-label={t.paliers}>
          {d.edition.paliers.map((p, i) => (
            <li key={i} aria-current={i === edition.index ? "step" : undefined}>
              <span>
                {i === 0 ? t.premieres : i === d.edition!.paliers.length - 1 ? t.dernieres : t.suivantes}
                {i === edition.index ? t.encore(edition.restantes) : ""}
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
                {t.accepte} <Link href={chemin("cgv", l)}>{t.cgv}</Link> {t.et} <Link href={chemin("licence", l)}>{t.laLicence}</Link>.
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
              <span>{t.immediat}</span>
            </label>
          </div>
          <div className="achat__actions">
            <button type="button" className="bouton bouton--or" onClick={acheter} disabled={etat.type === "envoi"}>
              {etat.type === "envoi" ? t.ouverture : action}
            </button>
          </div>
        </>
      ) : d.exemple ? (
        <p className="achat__statut">{t.exemple}</p>
      ) : (
        !fichiersPrets && <p className="achat__statut">{t.preparation}</p>
      )}
      {etat.type === "message" && (
        <p className={`achat__statut${etat.erreur ? " achat__statut--erreur" : ""}`} role="alert">
          {etat.texte}
        </p>
      )}
      <p className="achat__rassurance">{t.rassurance}</p>
    </div>
  );
}
