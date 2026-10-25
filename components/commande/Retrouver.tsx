"use client";

import { useState, type FormEvent } from "react";
import type { Langue } from "@/lib/i18n";

const T = {
  fr: {
    envoyee: "Demande envoyée.",
    echec: "La demande n'a pas pu aboutir.",
    connexion: "Connexion impossible : vérifiez votre accès à Internet.",
    titre: "Retrouver mes commandes",
    intro:
      "Saisissez l'adresse e-mail utilisée lors du paiement : nous vous enverrons les liens de toutes vos commandes, avec vos fichiers et vos certificats.",
    adresse: "Adresse e-mail",
    envoi: "Envoi…",
    recevoir: "Recevoir mes liens",
    reponse: "",
    invalide: "",
    tropDeDemandes: "",
  },
  en: {
    envoyee: "Request sent.",
    echec: "The request could not be completed.",
    connexion: "Connection failed: please check your internet access.",
    titre: "Find my orders",
    intro: "Enter the email address you used for the payment: we will send you the links to all your orders, with your files and certificates.",
    adresse: "Email address",
    envoi: "Sending…",
    recevoir: "Send me my links",
    reponse: "If any orders are linked to this address, we have just sent you an email with their links. Remember to check your spam folder.",
    invalide: "This email address does not look valid.",
    tropDeDemandes: "Too many requests. Please try again in an hour.",
  },
};

type Etat = { type: "repos" } | { type: "envoi" } | { type: "fait"; texte: string } | { type: "erreur"; texte: string };

export function Retrouver({ l = "fr" }: { l?: Langue }) {
  const t = T[l];
  const [email, setEmail] = useState("");
  const [etat, setEtat] = useState<Etat>({ type: "repos" });

  const valider = async (e: FormEvent) => {
    e.preventDefault();
    setEtat({ type: "envoi" });
    try {
      const rep = await fetch("/api/commandes/retrouver", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), langue: l }),
      });
      const corps = (await rep.json().catch(() => ({}))) as { message?: string; erreur?: string };
      // Le serveur répond en français : sur le site anglais, on affiche nos propres messages.
      if (rep.ok) setEtat({ type: "fait", texte: l === "en" ? t.reponse : (corps.message ?? t.envoyee) });
      else if (l === "en")
        setEtat({ type: "erreur", texte: rep.status === 400 ? t.invalide : rep.status === 429 ? t.tropDeDemandes : t.echec });
      else setEtat({ type: "erreur", texte: corps.erreur ?? t.echec });
    } catch {
      setEtat({ type: "erreur", texte: t.connexion });
    }
  };

  return (
    <>
      <h1>{t.titre}</h1>
      <p className="page-texte__intro">{t.intro}</p>
      {etat.type === "fait" ? (
        <p className="commande__garder" role="status">
          {etat.texte}
        </p>
      ) : (
        <form className="certificat-verif" onSubmit={valider}>
          <label className="champ">
            <span>{t.adresse}</span>
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button type="submit" className="bouton bouton--or" disabled={etat.type === "envoi"}>
            {etat.type === "envoi" ? t.envoi : t.recevoir}
          </button>
        </form>
      )}
      {etat.type === "erreur" && (
        <p className="achat__statut achat__statut--erreur" role="alert">
          {etat.texte}
        </p>
      )}
    </>
  );
}
