"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { chemin, cheminMotif, LOCALE, type Langue } from "@/lib/i18n";
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
    titreEn?: string | null;
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

const T = {
  fr: {
    sansNumero: "Ce lien ne contient pas de numéro de commande.",
    introuvable: "Commande introuvable.",
    connexion: "Connexion impossible : vérifiez votre accès à Internet, puis rechargez la page.",
    titreIntrouvable: "Commande introuvable",
    retour: "Retour aux motifs",
    chargement: "Chargement de votre commande…",
    test: "Commande de test : aucune carte réelle n'a été débitée, ce certificat n'a pas de valeur.",
    titre: "Votre commande",
    pochette: "Pochette",
    licence: "Licence",
    pour: "pour",
    numero: "n°",
    payee: "payée",
    le: "le",
    garder: "Gardez le lien de cette page.",
    garderSuite: "C'est votre accès à vos fichiers et à votre certificat.",
    envoye: "Nous vous l'avons aussi envoyé",
    envoie: "Nous vous l'envoyons aussi",
    parEmail: "par e-mail",
    a: (e: string) => ` à ${e}`,
    perte: "En cas de perte,",
    retrouver: "retrouvez vos commandes",
    avecAdresse: "avec votre adresse.",
    aucunEmail: "Aucun e-mail ne vous sera envoyé pour l'instant.",
    copie: "Lien copié",
    copier: "Copier le lien de cette page",
    remboursee: "Commande remboursée",
    rembourseeTexte: "Cette commande a été remboursée : la licence est annulée et les fichiers ne sont plus téléchargeables.",
    fichiers: "Vos fichiers",
    telecharger: "Télécharger",
    ouverts: (d: string) => `Téléchargements ouverts jusqu'au ${d}. Pensez à enregistrer vos fichiers en lieu sûr.`,
    fermes: (d: string) => `La période de téléchargement de ${d} est terminée. Votre licence, elle, reste valable sans limite de durée.`,
    certificat: "Votre certificat",
    certificatNo: "certificat n°",
    prouve: "Il prouve votre droit d'utiliser ce motif : vous pouvez l'imprimer ou l'enregistrer en PDF.",
    voir: "Voir le certificat",
    question: "Une question sur votre commande ? Écrivez à",
    questionSuite: "en indiquant le numéro de votre certificat.",
    mo: "Mo",
    ko: "Ko",
  },
  en: {
    sansNumero: "This link does not contain an order number.",
    introuvable: "We could not find this order.",
    connexion: "Connection failed: please check your internet access, then reload the page.",
    titreIntrouvable: "Order not found",
    retour: "Back to the patterns",
    chargement: "Loading your order…",
    test: "Test order: no real card was charged, and this certificate has no value.",
    titre: "Your order",
    pochette: "Pack",
    licence: "License",
    pour: "for",
    numero: "no.",
    payee: "paid",
    le: "on",
    garder: "Keep the link to this page.",
    garderSuite: "It is your access to your files and your certificate.",
    envoye: "We have also sent it to you",
    envoie: "We are also sending it to you",
    parEmail: "by email",
    a: (e: string) => ` at ${e}`,
    perte: "If you lose it,",
    retrouver: "find your orders",
    avecAdresse: "with your email address.",
    aucunEmail: "No email will be sent to you for now.",
    copie: "Link copied",
    copier: "Copy the link to this page",
    remboursee: "Order refunded",
    rembourseeTexte: "This order has been refunded: the license is cancelled and the files can no longer be downloaded.",
    fichiers: "Your files",
    telecharger: "Download",
    ouverts: (d: string) => `Downloads open until ${d}. Remember to save your files somewhere safe.`,
    fermes: (d: string) => `The download period ended on ${d}. Your license, however, remains valid with no time limit.`,
    certificat: "Your certificate",
    certificatNo: "certificate no.",
    prouve: "It proves your right to use this pattern: you can print it or save it as a PDF.",
    voir: "View the certificate",
    question: "A question about your order? Write to",
    questionSuite: "with your certificate number.",
    mo: "MB",
    ko: "KB",
  },
};

/** Les liens de téléchargement valent une heure : la page les renouvelle d'elle-même avant. */
const RENOUVELER_MS = 45 * 60 * 1000;

export function Commande({ l = "fr" }: { l?: Langue }) {
  const t = T[l];
  const loc = LOCALE[l];
  const [donnees, setDonnees] = useState<DonneesCommande | null>(null);
  const [erreur, setErreur] = useState("");
  const [copie, setCopie] = useState(false);

  const taille = (octets: number) => {
    const mo = octets / 1024 / 1024;
    return mo >= 1 ? `${mo.toLocaleString(loc, { maximumFractionDigits: mo < 10 ? 1 : 0 })} ${t.mo}` : `${Math.max(1, Math.round(octets / 1024))} ${t.ko}`;
  };
  const date = (iso: string) => new Date(iso).toLocaleDateString(loc, { day: "numeric", month: "long", year: "numeric" });
  const montant = (centimes: number, devise: string) =>
    new Intl.NumberFormat(loc, { style: "currency", currency: devise.toUpperCase() }).format(centimes / 100);

  const charger = useCallback(async () => {
    const jeton = new URLSearchParams(window.location.search).get("t") ?? "";
    if (!jeton) {
      setErreur(t.sansNumero);
      return;
    }
    try {
      const rep = await fetch(`/api/commande?t=${encodeURIComponent(jeton)}`, { cache: "no-store" });
      const corps = (await rep.json().catch(() => ({}))) as DonneesCommande & { erreur?: string };
      if (!rep.ok) {
        setErreur(l === "en" ? t.introuvable : (corps.erreur ?? t.introuvable));
        return;
      }
      setDonnees(corps);
    } catch {
      setErreur(t.connexion);
    }
  }, [l, t]);

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
        <h1>{t.titreIntrouvable}</h1>
        <p className="page-texte__intro">{erreur}</p>
        <p>
          <Link href={chemin("explorer", l)}>{t.retour}</Link>
        </p>
      </>
    );
  }
  if (!donnees) return <p className="page-texte__intro">{t.chargement}</p>;

  const { commande: c, fichiers } = donnees;
  const coloriage = c.famille === "petit-atelier";
  const titre = l === "en" && c.titreEn ? c.titreEn : c.titre;

  return (
    <>
      {c.modeTest && <p className="commande__test">{t.test}</p>}
      <h1>{t.titre}</h1>
      <p className="page-texte__intro">
        {coloriage ? t.pochette : t.licence} {t.pour} <Link href={cheminMotif(c.slug, l)}>{titre}</Link> ({t.numero} {c.designId}),{" "}
        {t.payee} {montant(c.montant, c.devise)} {t.le} {date(c.payeeLe)}.
      </p>

      <div className="commande__garder">
        <p>
          <strong>{t.garder}</strong> {t.garderSuite}{" "}
          {c.courrielActif ? (
            <>
              {c.courrielEnvoye ? t.envoye : t.envoie} {t.parEmail}
              {c.email ? t.a(c.email) : ""}. {t.perte} <Link href={chemin("retrouver", l)}>{t.retrouver}</Link> {t.avecAdresse}
            </>
          ) : (
            t.aucunEmail
          )}
        </p>
        <button type="button" className="bouton bouton--contour" onClick={copier}>
          {copie ? t.copie : t.copier}
        </button>
      </div>

      {c.statut === "remboursee" ? (
        <section className="commande__bloc" aria-labelledby="titre-fichiers">
          <h2 id="titre-fichiers">{t.remboursee}</h2>
          <p>{t.rembourseeTexte}</p>
        </section>
      ) : (
        <section className="commande__bloc" aria-labelledby="titre-fichiers">
          <h2 id="titre-fichiers">{t.fichiers}</h2>
          {c.ouvert ? (
            <>
              <ul className="commande__fichiers">
                {fichiers.map((f) => (
                  <li key={f.nom}>
                    <span>
                      <strong>{f.nom}</strong>
                      <small>
                        {f.largeur && f.hauteur ? `${f.largeur.toLocaleString(loc)} × ${f.hauteur.toLocaleString(loc)} px, ` : ""}
                        {taille(f.taille)}
                      </small>
                    </span>
                    <a className="bouton bouton--or" href={f.url} download={f.nom}>
                      {t.telecharger}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="commande__note">{t.ouverts(date(c.finAcces))}</p>
            </>
          ) : (
            <p>{t.fermes(date(c.finAcces))}</p>
          )}
        </section>
      )}

      <section className="commande__bloc" aria-labelledby="titre-certificat">
        <h2 id="titre-certificat">{t.certificat}</h2>
        <p>
          {c.licence}, {t.certificatNo} <strong className="commande__numero">{c.certificat}</strong>. {t.prouve}
        </p>
        <p>
          <Link className="bouton bouton--contour" href={`${chemin("certificat", l)}?n=${c.certificat}`}>
            {t.voir}
          </Link>
        </p>
      </section>
      {CONTACT.actif && (
        <p className="commande__note">
          {t.question} <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> {t.questionSuite}
        </p>
      )}
    </>
  );
}
