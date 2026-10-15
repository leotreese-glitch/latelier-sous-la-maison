"use client";

import { useState, type FormEvent } from "react";

type Etat = { type: "repos" } | { type: "envoi" } | { type: "fait"; texte: string } | { type: "erreur"; texte: string };

export function Retrouver() {
  const [email, setEmail] = useState("");
  const [etat, setEtat] = useState<Etat>({ type: "repos" });

  const valider = async (e: FormEvent) => {
    e.preventDefault();
    setEtat({ type: "envoi" });
    try {
      const rep = await fetch("/api/commandes/retrouver", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const corps = (await rep.json().catch(() => ({}))) as { message?: string; erreur?: string };
      if (rep.ok) setEtat({ type: "fait", texte: corps.message ?? "Demande envoyée." });
      else setEtat({ type: "erreur", texte: corps.erreur ?? "La demande n'a pas pu aboutir." });
    } catch {
      setEtat({ type: "erreur", texte: "Connexion impossible : vérifiez votre accès à Internet." });
    }
  };

  return (
    <>
      <h1>Retrouver mes commandes</h1>
      <p className="page-texte__intro">
        Saisissez l'adresse e-mail utilisée lors du paiement : nous vous enverrons les liens de toutes vos commandes, avec vos fichiers et vos
        certificats.
      </p>
      {etat.type === "fait" ? (
        <p className="commande__garder" role="status">
          {etat.texte}
        </p>
      ) : (
        <form className="certificat-verif" onSubmit={valider}>
          <label className="champ">
            <span>Adresse e-mail</span>
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button type="submit" className="bouton bouton--or" disabled={etat.type === "envoi"}>
            {etat.type === "envoi" ? "Envoi…" : "Recevoir mes liens"}
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
