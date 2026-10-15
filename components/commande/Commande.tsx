"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CONTACT } from "@/lib/site";

interface FichierCommande {
  nom: string;
  taille: number;
  largeur: number | null;
  hauteur: number | null;
  url: string;
}

interface DonneesCommande {
  commande: {
    designId: string;
    titre: string;
    slug: string;
    famille: string;
    statut: "payee" | "remboursee";
    montant: number;
    devise: string;
    email: string | null;
    payeeLe: string;
    certificat: string;
    licence: string;
    modeTest: boolean;
    finAcces: string;
    ouvert: boolean;
    courrielActif?: boolean;
    courrielEnvoye?: boolean;
  };
  fichiers: FichierCommande[];
}

/** Les liens de téléchargement valent une heure : la page les renouvelle d'elle-même avant. */
const RENOUVELER_MS = 45 * 60 * 1000;

function taille(octets: number) {
  const mo = octets / 1024 / 1024;
  return mo >= 1 ? `${mo.toLocaleString("fr-FR", { maximumFractionDigits: mo < 10 ? 1 : 0 })} Mo` : `${Math.max(1, Math.round(octets / 1024))} Ko`;
}

function date(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function montant(centimes: number, devise: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: devise.toUpperCase() }).format(centimes / 100);
}

export function Commande() {
  const [donnees, setDonnees] = useState<DonneesCommande | null>(null);
  const [erreur, setErreur] = useState("");
  const [copie, setCopie] = useState(false);

  const charger = useCallback(async () => {
    const jeton = new URLSearchParams(window.location.search).get("t") ?? "";
    if (!jeton) {
      setErreur("Ce lien ne contient pas de numéro de commande.");
      return;
    }
    try {
      const rep = await fetch(`/api/commande?t=${encodeURIComponent(jeton)}`, { cache: "no-store" });
      const corps = (await rep.json().catch(() => ({}))) as DonneesCommande & { erreur?: string };
      if (!rep.ok) {
        setErreur(corps.erreur ?? "Commande introuvable.");
        return;
      }
      setDonnees(corps);
    } catch {
      setErreur("Connexion impossible : vérifiez votre accès à Internet, puis rechargez la page.");
    }
  }, []);

  useEffect(() => {
    charger();
    const minuteur = setInterval(charger, RENOUVELER_MS);
    return () => clearInterval(minuteur);
  }, [charger]);

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopie(true);
    } catch {
      setCopie(false);
    }
  };

  if (erreur && !donnees) {
    return (
      <>
        <h1>Commande introuvable</h1>
        <p className="page-texte__intro">{erreur}</p>
        <p>
          <Link href="/explorer/">Retour aux motifs</Link>
        </p>
      </>
    );
  }
  if (!donnees) return <p className="page-texte__intro">Chargement de votre commande…</p>;

  const { commande: c, fichiers } = donnees;
  const coloriage = c.famille === "petit-atelier";

  return (
    <>
      {c.modeTest && (
        <p className="commande__test">Commande de test : aucune carte réelle n'a été débitée, ce certificat n'a pas de valeur.</p>
      )}
      <h1>Votre commande</h1>
      <p className="page-texte__intro">
        {coloriage ? "Pochette" : "Licence"} pour <Link href={`/motif/${c.slug}/`}>{c.titre}</Link> (n° {c.designId}), payée{" "}
        {montant(c.montant, c.devise)} le {date(c.payeeLe)}.
      </p>

      <div className="commande__garder">
        <p>
          <strong>Gardez le lien de cette page.</strong> C'est votre accès à vos fichiers et à votre certificat.{" "}
          {c.courrielActif ? (
            <>
              {c.courrielEnvoye ? "Nous vous l'avons aussi envoyé" : "Nous vous l'envoyons aussi"} par e-mail
              {c.email ? ` à ${c.email}` : ""}. En cas de perte, <Link href="/commande/retrouver/">retrouvez vos commandes</Link> avec votre
              adresse.
            </>
          ) : (
            "Aucun e-mail ne vous sera envoyé pour l'instant."
          )}
        </p>
        <button type="button" className="bouton bouton--contour" onClick={copier}>
          {copie ? "Lien copié" : "Copier le lien de cette page"}
        </button>
      </div>

      {c.statut === "remboursee" ? (
        <section className="commande__bloc" aria-labelledby="titre-fichiers">
          <h2 id="titre-fichiers">Commande remboursée</h2>
          <p>Cette commande a été remboursée : la licence est annulée et les fichiers ne sont plus téléchargeables.</p>
        </section>
      ) : (
        <section className="commande__bloc" aria-labelledby="titre-fichiers">
          <h2 id="titre-fichiers">Vos fichiers</h2>
          {c.ouvert ? (
            <>
              <ul className="commande__fichiers">
                {fichiers.map((f) => (
                  <li key={f.nom}>
                    <span>
                      <strong>{f.nom}</strong>
                      <small>
                        {f.largeur && f.hauteur ? `${f.largeur.toLocaleString("fr-FR")} × ${f.hauteur.toLocaleString("fr-FR")} px, ` : ""}
                        {taille(f.taille)}
                      </small>
                    </span>
                    <a className="bouton bouton--or" href={f.url} download={f.nom}>
                      Télécharger
                    </a>
                  </li>
                ))}
              </ul>
              <p className="commande__note">Téléchargements ouverts jusqu'au {date(c.finAcces)}. Pensez à enregistrer vos fichiers en lieu sûr.</p>
            </>
          ) : (
            <p>La période de téléchargement de {date(c.finAcces)} est terminée. Votre licence, elle, reste valable sans limite de durée.</p>
          )}
        </section>
      )}

      <section className="commande__bloc" aria-labelledby="titre-certificat">
        <h2 id="titre-certificat">Votre certificat</h2>
        <p>
          {c.licence}, certificat n° <strong className="commande__numero">{c.certificat}</strong>. Il prouve votre droit d'utiliser ce motif :
          vous pouvez l'imprimer ou l'enregistrer en PDF.
        </p>
        <p>
          <Link className="bouton bouton--contour" href={`/certificat/?n=${c.certificat}`}>
            Voir le certificat
          </Link>
        </p>
      </section>
      {CONTACT.actif && (
        <p className="commande__note">
          Une question sur votre commande ? Écrivez à <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> en indiquant le numéro de votre
          certificat.
        </p>
      )}
    </>
  );
}
