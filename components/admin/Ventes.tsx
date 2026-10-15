"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ErreurApi, type Vente } from "@/lib/admin/api";

type Donnees = Awaited<ReturnType<typeof api.ventes>>;

function montant(centimes: number, devise: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: devise.toUpperCase() }).format(centimes / 100);
}

function dateCourte(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function Ventes() {
  const [donnees, setDonnees] = useState<Donnees | null>(null);
  const [message, setMessage] = useState("");
  const [avis, setAvis] = useState<{ texte: string; erreur?: boolean } | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState<string | null>(null);

  const charger = () =>
    api
      .ventes()
      .then(setDonnees)
      .catch((e) => setMessage(e instanceof ErreurApi && e.statut === 401 ? "deconnecte" : e instanceof ErreurApi ? e.message : "Chargement impossible."));

  useEffect(() => {
    charger();
  }, []);

  const renvoyer = async (v: Vente) => {
    setAvis(null);
    setEnvoiEnCours(v.certificat);
    try {
      await api.renvoyerCourriel(v.certificat);
      setAvis({ texte: `E-mail de confirmation renvoyé à ${v.email ?? "l'acheteur"}.` });
      await charger();
    } catch (e) {
      setAvis({ texte: e instanceof ErreurApi ? e.message : "Envoi impossible.", erreur: true });
    } finally {
      setEnvoiEnCours(null);
    }
  };

  if (message === "deconnecte") {
    return (
      <p className="admin-aide">
        Session expirée : <Link href="/admin/">reconnectez-vous</Link>.
      </p>
    );
  }
  if (message) return <p className="admin-erreur">{message}</p>;
  if (!donnees) return <p className="admin-aide">Chargement…</p>;

  const { ventes, totaux, config } = donnees;
  return (
    <>
      <div className="admin-entete-page">
        <h1>Ventes</h1>
      </div>

      <div className={`admin-carte admin-maj${config.paiement && config.webhook ? "" : " admin-maj--attente"}`}>
        <div>
          <strong>
            {!config.paiement
              ? "Le paiement n'est pas encore branché."
              : !config.webhook
                ? "La clé Stripe est réglée, il manque le secret du webhook."
                : config.modeTest
                  ? "Paiement actif en mode test : aucune carte réelle n'est débitée."
                  : "Paiement actif en mode réel."}
          </strong>
          <p>
            {config.paiement && config.webhook
              ? "Carte de test : 4242 4242 4242 4242, une date future, n'importe quel code."
              : "Réglez STRIPE_CLE_SECRETE et STRIPE_SECRET_WEBHOOK dans Cloudflare (voir le guide « Étape 4 » du README)."}
          </p>
          <p>
            {config.courriel
              ? `E-mails actifs : chaque acheteur reçoit son lien de commande${config.alerteVentes ? ", et vous recevez une alerte à chaque vente" : " (alerte de vente : variable EMAIL_ALERTE_VENTES à régler)"}.`
              : "E-mails pas encore branchés : réglez le secret BREVO_CLE_API dans Cloudflare."}
          </p>
        </div>
      </div>
      {avis && (
        <p className={`admin-message${avis.erreur ? " admin-message--erreur" : " admin-message--ok"}`} role="status">
          {avis.texte}
        </p>
      )}

      <ul className="admin-totaux">
        {Object.entries(totaux).map(([devise, t]) => (
          <li key={devise}>
            {t.reel > 0 && <strong>{montant(t.reel, devise)}</strong>}
            {t.test > 0 && <span>{montant(t.test, devise)} en test</span>}
          </li>
        ))}
        <li>
          <span>
            {ventes.length} {ventes.length > 1 ? "commandes" : "commande"}
          </span>
        </li>
      </ul>

      {ventes.length === 0 ? (
        <p className="admin-aide">Aucune vente pour l'instant. Les achats apparaîtront ici dès leur paiement.</p>
      ) : (
        <div className="admin-defile">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Design</th>
                <th scope="col">Montant</th>
                <th scope="col">Acheteur</th>
                <th scope="col">Certificat</th>
                <th scope="col">E-mail</th>
                <th scope="col">Téléch.</th>
              </tr>
            </thead>
            <tbody>
              {ventes.map((v: Vente) => (
                <tr key={v.certificat}>
                  <td className="admin-num">{dateCourte(v.date)}</td>
                  <td>
                    <Link href={`/admin/design/?id=${v.designId}`}>{v.titre}</Link>
                  </td>
                  <td className="admin-num">
                    {montant(v.montant, v.devise)}
                    {v.modeTest && <span className="admin-statut admin-statut--exemple">Test</span>}
                    {v.statut === "remboursee" && <span className="admin-statut admin-statut--retire">Remboursé</span>}
                  </td>
                  <td>
                    {v.email ?? "?"}
                    {v.pays ? ` (${v.pays})` : ""}
                  </td>
                  <td className="admin-num">
                    <a href={`/certificat/?n=${v.certificat}`} target="_blank" rel="noopener">
                      {v.certificat}
                    </a>
                  </td>
                  <td className="admin-num">
                    {v.courrielEnvoye ? "Envoyé" : config.courriel ? "Non envoyé" : "Inactif"}
                    {config.courriel && v.email && (
                      <button type="button" className="admin-lien-bouton" onClick={() => renvoyer(v)} disabled={envoiEnCours !== null}>
                        {envoiEnCours === v.certificat ? "Envoi…" : "Renvoyer"}
                      </button>
                    )}
                  </td>
                  <td className="admin-num">{v.telechargements}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
