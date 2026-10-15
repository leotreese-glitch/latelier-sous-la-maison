"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONTACT } from "@/lib/site";

type Etat = "attente" | "longue" | "erreur";

const INTERVALLE_MS = 2000;
const ESSAIS_AVANT_PATIENCE = 15;

/**
 * Page d'arrivée après Stripe : attend la confirmation du paiement,
 * puis envoie l'acheteur sur sa page de commande.
 */
export function Merci() {
  const [etat, setEtat] = useState<Etat>("attente");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const session = new URLSearchParams(window.location.search).get("session") ?? "";
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(session)) {
      setEtat("erreur");
      setMessage("Ce lien ne contient pas de référence de paiement.");
      return;
    }
    let essais = 0;
    let fini = false;
    let minuteur: ReturnType<typeof setTimeout>;

    const verifier = async () => {
      essais++;
      try {
        const rep = await fetch(`/api/commande?session=${encodeURIComponent(session)}`, { cache: "no-store" });
        const corps = (await rep.json().catch(() => ({}))) as { statut?: string; jeton?: string; erreur?: string };
        if (fini) return;
        if (rep.ok && corps.statut === "payee" && corps.jeton) {
          fini = true;
          window.location.replace(`/commande/?t=${encodeURIComponent(corps.jeton)}`);
          return;
        }
        if (rep.status >= 400 && rep.status < 500) {
          setEtat("erreur");
          setMessage(corps.erreur ?? "Ce paiement est introuvable.");
          return;
        }
      } catch {
        // Réseau coupé un instant : on réessaie.
      }
      if (essais >= ESSAIS_AVANT_PATIENCE) setEtat("longue");
      minuteur = setTimeout(verifier, essais < ESSAIS_AVANT_PATIENCE ? INTERVALLE_MS : INTERVALLE_MS * 5);
    };
    verifier();
    return () => {
      fini = true;
      clearTimeout(minuteur);
    };
  }, []);

  if (etat === "erreur") {
    return (
      <>
        <h1>Un souci avec ce lien</h1>
        <p className="page-texte__intro">{message}</p>
        <p>
          Si vous avez payé, vous pouvez <Link href="/commande/retrouver/">retrouver vos commandes</Link> avec l'adresse e-mail utilisée lors
          du paiement.
          {CONTACT.actif && (
            <>
              {" "}
              Sinon, écrivez à <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> avec la référence de votre reçu Stripe.
            </>
          )}
        </p>
      </>
    );
  }

  return (
    <>
      <h1>Merci !</h1>
      <p className="page-texte__intro" role="status">
        {etat === "attente"
          ? "Nous attendons la confirmation de votre paiement. Vos fichiers arrivent dans quelques secondes…"
          : "La confirmation prend plus longtemps que prévu, ce qui arrive avec certains moyens de paiement. Laissez cette page ouverte : elle s'ouvrira sur vos fichiers dès que le paiement sera confirmé."}
      </p>
      {etat === "longue" && (
        <p>Vous pouvez aussi garder l'adresse de cette page dans vos favoris et y revenir plus tard : elle mènera toujours à votre commande.</p>
      )}
    </>
  );
}
