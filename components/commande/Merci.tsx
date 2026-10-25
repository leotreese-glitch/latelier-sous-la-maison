"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { chemin, type Langue } from "@/lib/i18n";
import { CONTACT } from "@/lib/site";

const T = {
  fr: {
    sansReference: "Ce lien ne contient pas de référence de paiement.",
    introuvable: "Ce paiement est introuvable.",
    souci: "Un souci avec ce lien",
    siPaye: "Si vous avez payé, vous pouvez",
    retrouver: "retrouver vos commandes",
    avecAdresse: "avec l'adresse e-mail utilisée lors du paiement.",
    sinon: "Sinon, écrivez à",
    reference: "avec la référence de votre reçu Stripe.",
    merci: "Merci !",
    attente: "Nous attendons la confirmation de votre paiement. Vos fichiers arrivent dans quelques secondes…",
    longue:
      "La confirmation prend plus longtemps que prévu, ce qui arrive avec certains moyens de paiement. Laissez cette page ouverte : elle s'ouvrira sur vos fichiers dès que le paiement sera confirmé.",
    favoris: "Vous pouvez aussi garder l'adresse de cette page dans vos favoris et y revenir plus tard : elle mènera toujours à votre commande.",
  },
  en: {
    sansReference: "This link does not contain a payment reference.",
    introuvable: "We could not find this payment.",
    souci: "Something is wrong with this link",
    siPaye: "If you have paid, you can",
    retrouver: "find your orders",
    avecAdresse: "with the email address used for the payment.",
    sinon: "Otherwise, write to",
    reference: "with the reference on your Stripe receipt.",
    merci: "Thank you!",
    attente: "We are waiting for your payment to be confirmed. Your files will be ready in a few seconds…",
    longue:
      "Confirmation is taking longer than expected, which happens with some payment methods. Keep this page open: it will take you to your files as soon as the payment is confirmed.",
    favoris: "You can also bookmark this page and come back later: it will always lead to your order.",
  },
};

type Etat = "attente" | "longue" | "erreur";

const INTERVALLE_MS = 2000;
const ESSAIS_AVANT_PATIENCE = 15;

/**
 * Page d'arrivée après Stripe : attend la confirmation du paiement,
 * puis envoie l'acheteur sur sa page de commande.
 */
export function Merci({ l = "fr" }: { l?: Langue }) {
  const t = T[l];
  const [etat, setEtat] = useState<Etat>("attente");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const session = new URLSearchParams(window.location.search).get("session") ?? "";
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(session)) {
      setEtat("erreur");
      setMessage(t.sansReference);
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
          window.location.replace(`${chemin("commande", l)}?t=${encodeURIComponent(corps.jeton)}`);
          return;
        }
        if (rep.status >= 400 && rep.status < 500) {
          setEtat("erreur");
          setMessage(l === "en" ? t.introuvable : (corps.erreur ?? t.introuvable));
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
        <h1>{t.souci}</h1>
        <p className="page-texte__intro">{message}</p>
        <p>
          {t.siPaye} <Link href={chemin("retrouver", l)}>{t.retrouver}</Link> {t.avecAdresse}
          {CONTACT.actif && (
            <>
              {" "}
              {t.sinon} <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> {t.reference}
            </>
          )}
        </p>
      </>
    );
  }

  return (
    <>
      <h1>{t.merci}</h1>
      <p className="page-texte__intro" role="status">
        {etat === "attente" ? t.attente : t.longue}
      </p>
      {etat === "longue" && <p>{t.favoris}</p>}
    </>
  );
}
