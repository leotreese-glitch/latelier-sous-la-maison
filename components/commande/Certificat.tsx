"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Marque } from "@/components/Logo";
import type { Licence } from "@/lib/licence";

interface DonneesCertificat {
  numero: string;
  valide: boolean;
  statut: "payee" | "remboursee";
  delivreLe: string;
  titulaire: string;
  email: string | null;
  design: { id: string; titre: string; slug: string; tiroir: string };
  licence: Licence;
  modeTest: boolean;
}

const FORMAT = /^LSM-[2-9A-Z]{4}-[2-9A-Z]{4}-[2-9A-Z]{4}$/;

function date(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function Verifier({ initial, message }: { initial: string; message: string }) {
  const [numero, setNumero] = useState(initial);
  const valider = (e: FormEvent) => {
    e.preventDefault();
    const n = numero.trim().toUpperCase();
    window.location.assign(`/certificat/?n=${encodeURIComponent(n)}`);
  };
  return (
    <>
      <h1>Vérifier un certificat</h1>
      <p className="page-texte__intro">
        Chaque licence vendue par L'atelier sous la maison porte un numéro de certificat. Saisissez-le pour vérifier qu'il est authentique.
      </p>
      <form className="certificat-verif" onSubmit={valider}>
        <label className="champ">
          <span>Numéro du certificat</span>
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
          Vérifier
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

export function Certificat() {
  const [numero, setNumero] = useState<string | null>(null);
  const [c, setC] = useState<DonneesCertificat | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const n = (new URLSearchParams(window.location.search).get("n") ?? "").trim().toUpperCase();
    setNumero(n);
    if (!n) return;
    if (!FORMAT.test(n)) {
      setMessage("Ce numéro n'a pas le bon format : LSM suivi de trois groupes de quatre caractères.");
      return;
    }
    fetch(`/api/certificat?n=${encodeURIComponent(n)}`, { cache: "no-store" })
      .then(async (rep) => {
        const corps = (await rep.json().catch(() => ({}))) as { certificat?: DonneesCertificat; erreur?: string };
        if (rep.ok && corps.certificat) setC(corps.certificat);
        else setMessage(corps.erreur ?? "Vérification impossible pour le moment.");
      })
      .catch(() => setMessage("Connexion impossible : vérifiez votre accès à Internet."));
  }, []);

  if (numero === null) return null;
  if (!numero || message) return <Verifier initial={numero} message={message} />;
  if (!c) return <p className="page-texte__intro">Vérification du certificat…</p>;

  const adresse = typeof window === "undefined" ? "" : `${window.location.origin}/certificat/?n=${c.numero}`;

  return (
    <>
      <div className="certificat-actions">
        <button type="button" className="bouton bouton--or" onClick={() => window.print()}>
          Imprimer ou enregistrer en PDF
        </button>
      </div>

      <article className={`certificat${c.valide && !c.modeTest ? "" : " certificat--annule"}`}>
        {(!c.valide || c.modeTest) && (
          <p className="certificat__alerte" role="status">
            {!c.valide ? "Certificat annulé : la commande a été remboursée." : "Certificat de test, sans valeur."}
          </p>
        )}
        <header className="certificat__entete">
          <Marque className="certificat__logo" />
          <div>
            <p className="certificat__maison">L'atelier sous la maison</p>
            <h1>Certificat de licence</h1>
          </div>
        </header>

        <dl className="certificat__infos">
          <dt>Numéro</dt>
          <dd className="certificat__numero">{c.numero}</dd>
          <dt>Titulaire</dt>
          <dd>{c.titulaire}</dd>
          <dt>Design</dt>
          <dd>
            {c.design.titre}, n° {c.design.id} ({c.design.tiroir})
          </dd>
          <dt>Licence</dt>
          <dd>
            {c.licence.nom}, version {c.licence.version}
          </dd>
          <dt>Délivré le</dt>
          <dd>{date(c.delivreLe)}</dd>
        </dl>

        <p className="certificat__resume">{c.licence.resume}</p>
        <div className="certificat__colonnes">
          <div>
            <h2>Autorisé</h2>
            <ul>
              {c.licence.permis.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Interdit</h2>
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
        <p className="certificat__verif">Vérifiable à l'adresse : {adresse}</p>
      </article>
    </>
  );
}
