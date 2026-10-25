"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Marque } from "@/components/Logo";
import { chemin, LOCALE, type Langue } from "@/lib/i18n";
import type { Licence } from "@/lib/licence";
import { nomFamille, type Famille } from "@/lib/modele";

const T = {
  fr: {
    verifier: "Vérifier un certificat",
    intro:
      "Chaque licence vendue par L'atelier sous la maison porte un numéro de certificat. Saisissez-le pour vérifier qu'il est authentique.",
    numero: "Numéro du certificat",
    bouton: "Vérifier",
    format: "Ce numéro n'a pas le bon format : LSM suivi de trois groupes de quatre caractères.",
    introuvable: "Aucun certificat ne porte ce numéro.",
    impossible: "Vérification impossible pour le moment.",
    connexion: "Connexion impossible : vérifiez votre accès à Internet.",
    chargement: "Vérification du certificat…",
    imprimer: "Imprimer ou enregistrer en PDF",
    annule: "Certificat annulé : la commande a été remboursée.",
    test: "Certificat de test, sans valeur.",
    titre: "Certificat de licence",
    numeroCourt: "Numéro",
    titulaire: "Titulaire",
    design: "Design",
    no: "n°",
    licence: "Licence",
    version: "version",
    delivre: "Délivré le",
    autorise: "Autorisé",
    interdit: "Interdit",
    verifiable: "Vérifiable à l'adresse :",
  },
  en: {
    verifier: "Verify a certificate",
    intro: "Every license sold by L'atelier sous la maison has a certificate number. Enter it to check that it is genuine.",
    numero: "Certificate number",
    bouton: "Verify",
    format: "This number does not have the right format: LSM followed by three groups of four characters.",
    introuvable: "No certificate has this number.",
    impossible: "Verification is not possible at the moment.",
    connexion: "Connection failed: please check your internet access.",
    chargement: "Verifying the certificate…",
    imprimer: "Print or save as PDF",
    annule: "Certificate cancelled: the order was refunded.",
    test: "Test certificate, with no value.",
    titre: "License certificate",
    numeroCourt: "Number",
    titulaire: "Holder",
    design: "Design",
    no: "no.",
    licence: "License",
    version: "version",
    delivre: "Issued on",
    autorise: "Allowed",
    interdit: "Not allowed",
    verifiable: "Verify at:",
  },
};

interface DonneesCertificat {
  numero: string;
  valide: boolean;
  statut: "payee" | "remboursee";
  delivreLe: string;
  titulaire: string;
  email?: string | null;
  design: { id: string; titre: string; titreEn?: string | null; slug: string; tiroir: string; famille?: Famille };
  licence: Licence;
  modeTest: boolean;
}

const FORMAT = /^LSM-[2-9A-Z]{4}-[2-9A-Z]{4}-[2-9A-Z]{4}$/;

function Verifier({ initial, message, l }: { initial: string; message: string; l: Langue }) {
  const t = T[l];
  const [numero, setNumero] = useState(initial);
  const valider = (e: FormEvent) => {
    e.preventDefault();
    const n = numero.trim().toUpperCase();
    window.location.assign(`${chemin("certificat", l)}?n=${encodeURIComponent(n)}`);
  };
  return (
    <>
      <h1>{t.verifier}</h1>
      <p className="page-texte__intro">{t.intro}</p>
      <form className="certificat-verif" onSubmit={valider}>
        <label className="champ">
          <span>{t.numero}</span>
          <input
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="LSM-XXXX-XXXX-XXXX"
            autoComplete="off"
            spellCheck={false}
            required
          />
        </label>
        <button type="submit" className="bouton bouton--or">
          {t.bouton}
        </button>
      </form>
      {message && (
        <p className="achat__statut achat__statut--erreur" role="alert">
          {message}
        </p>
      )}
    </>
  );
}

export function Certificat({ l = "fr" }: { l?: Langue }) {
  const t = T[l];
  const date = (iso: string) => new Date(iso).toLocaleDateString(LOCALE[l], { day: "numeric", month: "long", year: "numeric" });
  const [numero, setNumero] = useState<string | null>(null);
  const [c, setC] = useState<DonneesCertificat | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const n = (new URLSearchParams(window.location.search).get("n") ?? "").trim().toUpperCase();
    setNumero(n);
    if (!n) return;
    if (!FORMAT.test(n)) {
      setMessage(t.format);
      return;
    }
    fetch(`/api/certificat?n=${encodeURIComponent(n)}`, { cache: "no-store" })
      .then(async (rep) => {
        const corps = (await rep.json().catch(() => ({}))) as { certificat?: DonneesCertificat; erreur?: string };
        if (rep.ok && corps.certificat) setC(corps.certificat);
        else if (l === "en") setMessage(rep.status === 404 ? t.introuvable : t.impossible);
        else setMessage(corps.erreur ?? t.impossible);
      })
      .catch(() => setMessage(t.connexion));
  }, [l, t]);

  if (numero === null) return null;
  if (!numero || message) return <Verifier initial={numero} message={message} l={l} />;
  if (!c) return <p className="page-texte__intro">{t.chargement}</p>;

  const adresse = typeof window === "undefined" ? "" : `${window.location.origin}${chemin("certificat", l)}?n=${c.numero}`;
  const titre = l === "en" && c.design.titreEn ? c.design.titreEn : c.design.titre;
  const tiroir = c.design.famille ? nomFamille(c.design.famille, l) : c.design.tiroir;

  return (
    <>
      <div className="certificat-actions">
        <button type="button" className="bouton bouton--or" onClick={() => window.print()}>
          {t.imprimer}
        </button>
      </div>

      <article className={`certificat${c.valide && !c.modeTest ? "" : " certificat--annule"}`}>
        {(!c.valide || c.modeTest) && (
          <p className="certificat__alerte" role="status">
            {!c.valide ? t.annule : t.test}
          </p>
        )}
        <header className="certificat__entete">
          <Marque className="certificat__logo" />
          <div>
            <p className="certificat__maison">L'atelier sous la maison</p>
            <h1>{t.titre}</h1>
          </div>
        </header>

        <dl className="certificat__infos">
          <dt>{t.numeroCourt}</dt>
          <dd className="certificat__numero">{c.numero}</dd>
          <dt>{t.titulaire}</dt>
          <dd>{c.titulaire}</dd>
          <dt>{t.design}</dt>
          <dd>
            {titre}, {t.no} {c.design.id} ({tiroir})
          </dd>
          <dt>{t.licence}</dt>
          <dd>
            {c.licence.nom}, {t.version} {c.licence.version}
          </dd>
          <dt>{t.delivre}</dt>
          <dd>{date(c.delivreLe)}</dd>
        </dl>

        <p className="certificat__resume">{c.licence.resume}</p>
        <div className="certificat__colonnes">
          <div>
            <h2>{t.autorise}</h2>
            <ul>
              {c.licence.permis.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{t.interdit}</h2>
            <ul>
              {c.licence.interdit.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
        <ul className="certificat__mentions">
          {c.licence.mentions.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="certificat__verif">
          {t.verifiable} {adresse}
        </p>
      </article>
    </>
  );
}
