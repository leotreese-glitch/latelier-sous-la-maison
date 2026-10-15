// Modèles des e-mails envoyés par le site. HTML simple en tableaux et styles en ligne,
// pour un rendu correct dans Gmail, Outlook et Apple Mail. Aucune image distante.
import { CONTACT } from "../lib/site";

/** Nom affiché du site dans les e-mails : l'hôte réel des liens, pour que le texte et l'adresse concordent. */
function hote(site: string) {
  try {
    return new URL(site).host;
  } catch {
    return site;
  }
}

const COULEURS = {
  fond: "#f3ecdc",
  papier: "#fffdf8",
  encre: "#1b2238",
  douce: "#5b5648",
  or: "#8a6a1f",
  filet: "#e2d6bb",
};

export function echapper(texte: string) {
  return texte.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function formaterMontant(centimes: number, devise: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: devise.toUpperCase() }).format(centimes / 100);
}

export function formaterDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
}

/** « 16 octobre 2026 à 14 h 32 », heure de Paris. */
export function formaterDateHeure(iso: string) {
  const d = new Date(iso);
  const heure = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" }).replace(":", " h ");
  return `${formaterDate(iso)} à ${heure}`;
}

function bouton(lien: string, texte: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0"><tr><td style="background:${COULEURS.encre};border-radius:3px">
<a href="${echapper(lien)}" style="display:inline-block;padding:13px 24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#ffffff;text-decoration:none;font-weight:bold">${echapper(texte)}</a>
</td></tr></table>`;
}

function lignes(paires: [string, string][]) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:8px 0 4px;border-top:1px solid ${COULEURS.filet}">
${paires
  .map(
    ([cle, valeur]) => `<tr>
<td style="padding:9px 12px 9px 0;border-bottom:1px solid ${COULEURS.filet};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${COULEURS.douce};white-space:nowrap;vertical-align:top">${echapper(cle)}</td>
<td style="padding:9px 0;border-bottom:1px solid ${COULEURS.filet};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${COULEURS.encre};font-weight:bold">${echapper(valeur)}</td>
</tr>`,
  )
  .join("\n")}
</table>`;
}

function paragraphe(html: string) {
  return `<p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${COULEURS.encre}">${html}</p>`;
}

function petit(html: string) {
  return `<p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.55;color:${COULEURS.douce}">${html}</p>`;
}

function lien(href: string, texte: string) {
  return `<a href="${echapper(href)}" style="color:${COULEURS.or}">${echapper(texte)}</a>`;
}

/** Enveloppe commune : en-tête au nom de l'atelier, carte papier, pied de page. */
function page(options: { apercu: string; titre: string; corps: string; site: string; test: boolean }) {
  const bandeauTest = options.test
    ? `<tr><td style="padding:10px 32px;background:#fff3cd;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b5000;text-align:center">E-mail de test : aucun paiement réel n'a eu lieu.</td></tr>`
    : "";
  const contact = CONTACT.actif ? ` Une question ? Écrivez à ${lien(`mailto:${CONTACT.email}`, CONTACT.email)}.` : "";
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${echapper(options.titre)}</title></head>
<body style="margin:0;padding:0;background:${COULEURS.fond}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${echapper(options.apercu)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COULEURS.fond}"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px">
<tr><td style="padding:0 4px 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${COULEURS.encre}">L'atelier sous la maison</td></tr>
<tr><td style="background:${COULEURS.papier};border:1px solid ${COULEURS.filet};border-radius:4px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
${bandeauTest}
<tr><td style="padding:28px 32px 20px">
<h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:normal;line-height:1.2;color:${COULEURS.encre}">${echapper(options.titre)}</h1>
${options.corps}
</td></tr></table>
</td></tr>
<tr><td style="padding:16px 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.55;color:${COULEURS.douce}">
${lien(options.site, hote(options.site))}, motifs anciens restaurés et créations originales.${contact}
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export interface InfosCommande {
  titre: string;
  designId: string;
  coloriage: boolean;
  licence: string;
  certificat: string;
  montant: number;
  devise: string;
  payeeLe: string;
  finAcces: string;
  jeton: string;
  modeTest: boolean;
  consentement: string | null;
  versionCgv: string | null;
}

/**
 * Rappel, sur un support durable, de l'accord donné avant le paiement (article L221-13 du Code de la consommation) :
 * acceptation des conditions de vente, demande d'accès immédiat et perte du droit de rétractation.
 */
function recapAccord(c: InfosCommande, site: string) {
  if (!c.consentement || Number.isNaN(Date.parse(c.consentement))) return "";
  const quand = `${formaterDateHeure(c.consentement)} (heure de Paris)`;
  const cgv = c.versionCgv
    ? `vous avez accepté les ${lien(`${site}/conditions-de-vente/`, "conditions de vente")} (version ${echapper(c.versionCgv)}) et la licence, et `
    : "";
  return petit(
    `<strong>Votre accord.</strong> Le ${echapper(quand)}, avant le paiement, ${cgv}vous avez demandé l'accès immédiat aux fichiers en reconnaissant perdre votre droit de rétractation dès leur mise à disposition (article L221-28, 13°, du Code de la consommation).`,
  );
}

/** E-mail envoyé à l'acheteur après le paiement : son lien de commande, sa licence et son certificat. */
export function modeleConfirmation(c: InfosCommande & { nom: string | null }, site: string) {
  const lienCommande = `${site}/commande/?t=${encodeURIComponent(c.jeton)}`;
  const lienCertificat = `${site}/certificat/?n=${encodeURIComponent(c.certificat)}`;
  const objet = c.coloriage ? "pochette" : "licence";
  const sujet = `${c.modeTest ? "[TEST] " : ""}Votre ${objet} « ${c.titre} » : vos fichiers vous attendent`;
  const corps = [
    paragraphe(`${c.nom ? `Bonjour ${echapper(c.nom.split(" ")[0])},` : "Bonjour,"}`),
    paragraphe(`Merci pour votre achat. Vos fichiers en haute définition et votre certificat de licence sont prêts.`),
    bouton(lienCommande, "Télécharger mes fichiers"),
    petit(
      `Ce lien est personnel : gardez cet e-mail. Les téléchargements restent ouverts jusqu'au ${echapper(formaterDate(c.finAcces))} ; la licence, elle, n'expire pas.`,
    ),
    lignes([
      ["Design", `${c.titre} (n° ${c.designId})`],
      ["Licence", c.licence],
      ["Certificat", c.certificat],
      ["Montant payé", formaterMontant(c.montant, c.devise)],
      ["Date", formaterDate(c.payeeLe)],
    ]),
    recapAccord(c, site),
    petit(`Votre certificat est consultable et imprimable à tout moment : ${lien(lienCertificat, "voir le certificat")}.`),
    petit(`Le texte complet de la licence : ${lien(`${site}/licence/`, `${hote(site)}/licence`)}.`),
    petit(`Le reçu et la facture du paiement vous sont envoyés séparément par Link (groupe Stripe), notre prestataire de paiement.`),
  ].join("\n");
  return {
    sujet,
    html: page({ apercu: `Vos fichiers et votre certificat ${c.certificat} sont prêts.`, titre: "Merci pour votre achat", corps, site, test: c.modeTest }),
  };
}

/** E-mail envoyé à Léo à chaque vente. */
export function modeleAlerteVente(c: InfosCommande & { email: string | null; pays: string | null }, site: string) {
  const sujet = `${c.modeTest ? "[TEST] " : ""}Nouvelle vente : ${c.titre} (${formaterMontant(c.montant, c.devise)})`;
  const corps = [
    paragraphe(`Une ${c.coloriage ? "pochette" : "licence"} vient d'être vendue.`),
    lignes([
      ["Design", `${c.titre} (n° ${c.designId})`],
      ["Montant", formaterMontant(c.montant, c.devise)],
      ["Acheteur", `${c.email ?? "adresse inconnue"}${c.pays ? ` (${c.pays})` : ""}`],
      ["Certificat", c.certificat],
    ]),
    bouton(`${site}/admin/ventes/`, "Voir les ventes"),
  ].join("\n");
  return { sujet, html: page({ apercu: `${c.titre}, ${formaterMontant(c.montant, c.devise)}`, titre: "Nouvelle vente", corps, site, test: c.modeTest }) };
}

export interface CommandeRetrouvee {
  titre: string;
  designId: string;
  payeeLe: string;
  jeton: string;
  remboursee: boolean;
  modeTest: boolean;
}

/** E-mail « Retrouver mes commandes » : la liste des liens de commande liés à une adresse. */
export function modeleRetrouver(commandes: CommandeRetrouvee[], site: string) {
  const test = commandes.length > 0 && commandes.every((c) => c.modeTest);
  const liste = commandes
    .map((c) => {
      const etat = c.remboursee ? " (remboursée)" : c.modeTest ? " (test)" : "";
      return `<tr><td style="padding:10px 0;border-bottom:1px solid ${COULEURS.filet};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${COULEURS.encre}">
${lien(`${site}/commande/?t=${encodeURIComponent(c.jeton)}`, `${c.titre} (n° ${c.designId})`)}<br>
<span style="color:${COULEURS.douce};font-size:13px">Achat du ${echapper(formaterDate(c.payeeLe))}${etat}</span>
</td></tr>`;
    })
    .join("\n");
  const corps = [
    paragraphe(`Vous avez demandé à retrouver vos commandes. Voici les liens vers chacune d'elles :`),
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:6px 0 18px;border-top:1px solid ${COULEURS.filet}">${liste}</table>`,
    petit(`Chaque lien est personnel : ne le transférez pas. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.`),
  ].join("\n");
  return {
    sujet: `${test ? "[TEST] " : ""}Vos commandes à L'atelier sous la maison`,
    html: page({ apercu: `${commandes.length} commande${commandes.length > 1 ? "s" : ""} retrouvée${commandes.length > 1 ? "s" : ""}`, titre: "Vos commandes", corps, site, test }),
  };
}
