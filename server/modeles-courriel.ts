// Modèles des e-mails envoyés par le site. HTML simple en tableaux et styles en ligne,
// pour un rendu correct dans Gmail, Outlook et Apple Mail. Aucune image distante.
import { chemin, LOCALE, type Langue } from "../lib/i18n";
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

export function formaterMontant(centimes: number, devise: string, l: Langue = "fr") {
  return new Intl.NumberFormat(LOCALE[l], { style: "currency", currency: devise.toUpperCase() }).format(centimes / 100);
}

export function formaterDate(iso: string, l: Langue = "fr") {
  return new Date(iso).toLocaleDateString(LOCALE[l], { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
}

/** « 16 octobre 2026 à 14 h 32 » ou « October 16, 2026 at 2:32 PM », heure de Paris. */
export function formaterDateHeure(iso: string, l: Langue = "fr") {
  const d = new Date(iso);
  if (l === "en") {
    const heure = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "Europe/Paris" });
    return `${formaterDate(iso, "en")} at ${heure}`;
  }
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
function page(options: { apercu: string; titre: string; corps: string; site: string; test: boolean; langue?: Langue }) {
  const en = options.langue === "en";
  const bandeauTest = options.test
    ? `<tr><td style="padding:10px 32px;background:#fff3cd;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b5000;text-align:center">${
        en ? "Test email: no real payment took place." : "E-mail de test : aucun paiement réel n'a eu lieu."
      }</td></tr>`
    : "";
  const contact = CONTACT.actif
    ? en
      ? ` Any questions? Write to ${lien(`mailto:${CONTACT.email}`, CONTACT.email)}.`
      : ` Une question ? Écrivez à ${lien(`mailto:${CONTACT.email}`, CONTACT.email)}.`
    : "";
  const signature = en ? "old patterns restored and original designs." : "motifs anciens restaurés et créations originales.";
  return `<!doctype html>
<html lang="${en ? "en" : "fr"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${echapper(options.titre)}</title></head>
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
${lien(options.site + (en ? "/en/" : ""), hote(options.site))}, ${signature}${contact}
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
  langue: Langue;
}

/**
 * Rappel, sur un support durable, de l'accord donné avant le paiement (article L221-13 du Code de la consommation) :
 * acceptation des conditions de vente, demande d'accès immédiat et perte du droit de rétractation.
 */
function recapAccord(c: InfosCommande, site: string) {
  if (!c.consentement || Number.isNaN(Date.parse(c.consentement))) return "";
  if (c.langue === "en") {
    const quand = `${formaterDateHeure(c.consentement, "en")} (Paris time)`;
    const cgv = c.versionCgv
      ? `you accepted the ${lien(`${site}${chemin("cgv", "en")}`, "terms of sale")} (version ${echapper(c.versionCgv)}) and the license, and `
      : "";
    return petit(
      `<strong>Your consent.</strong> On ${echapper(quand)}, before payment, ${cgv}you requested immediate access to the files and acknowledged that you lose your right of withdrawal once they are made available (article L221-28, 13°, of the French Consumer Code).`,
    );
  }
  const quand = `${formaterDateHeure(c.consentement)} (heure de Paris)`;
  const cgv = c.versionCgv
    ? `vous avez accepté les ${lien(`${site}${chemin("cgv", "fr")}`, "conditions de vente")} (version ${echapper(c.versionCgv)}) et la licence, et `
    : "";
  return petit(
    `<strong>Votre accord.</strong> Le ${echapper(quand)}, avant le paiement, ${cgv}vous avez demandé l'accès immédiat aux fichiers en reconnaissant perdre votre droit de rétractation dès leur mise à disposition (article L221-28, 13°, du Code de la consommation).`,
  );
}

/** E-mail envoyé à l'acheteur après le paiement : son lien de commande, sa licence et son certificat. */
export function modeleConfirmation(c: InfosCommande & { nom: string | null }, site: string) {
  const l = c.langue;
  const lienCommande = `${site}${chemin("commande", l)}?t=${encodeURIComponent(c.jeton)}`;
  const lienCertificat = `${site}${chemin("certificat", l)}?n=${encodeURIComponent(c.certificat)}`;
  const lienLicence = `${site}${chemin("licence", l)}`;
  const prenom = c.nom ? echapper(c.nom.split(" ")[0]) : "";
  if (l === "en") {
    const objet = c.coloriage ? "pack" : "license";
    const sujet = `${c.modeTest ? "[TEST] " : ""}Your ${objet} for “${c.titre}”: your files are ready`;
    const corps = [
      paragraphe(prenom ? `Hello ${prenom},` : "Hello,"),
      paragraphe(`Thank you for your purchase. Your high-definition files and your license certificate are ready.`),
      bouton(lienCommande, "Download my files"),
      petit(
        `This link is personal: keep this email. Downloads stay open until ${echapper(formaterDate(c.finAcces, "en"))}; the license itself never expires.`,
      ),
      lignes([
        ["Design", `${c.titre} (no. ${c.designId})`],
        ["License", c.licence],
        ["Certificate", c.certificat],
        ["Amount paid", formaterMontant(c.montant, c.devise, "en")],
        ["Date", formaterDate(c.payeeLe, "en")],
      ]),
      recapAccord(c, site),
      petit(`Your certificate can be viewed and printed at any time: ${lien(lienCertificat, "view the certificate")}.`),
      petit(`The full text of the license: ${lien(lienLicence, `${hote(site)}${chemin("licence", "en").replace(/\/$/, "")}`)}.`),
      petit(`The payment receipt and invoice are sent to you separately by Link (Stripe group), our payment provider.`),
    ].join("\n");
    return {
      sujet,
      html: page({ apercu: `Your files and certificate ${c.certificat} are ready.`, titre: "Thank you for your purchase", corps, site, test: c.modeTest, langue: "en" }),
    };
  }
  const objet = c.coloriage ? "pochette" : "licence";
  const sujet = `${c.modeTest ? "[TEST] " : ""}Votre ${objet} « ${c.titre} » : vos fichiers vous attendent`;
  const corps = [
    paragraphe(prenom ? `Bonjour ${prenom},` : "Bonjour,"),
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
    petit(`Le texte complet de la licence : ${lien(lienLicence, `${hote(site)}/licence`)}.`),
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
      ["Site", c.langue === "en" ? "version anglaise" : "version française"],
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
export function modeleRetrouver(commandes: CommandeRetrouvee[], site: string, l: Langue = "fr") {
  const en = l === "en";
  const test = commandes.length > 0 && commandes.every((c) => c.modeTest);
  const liste = commandes
    .map((c) => {
      const etat = c.remboursee ? (en ? " (refunded)" : " (remboursée)") : c.modeTest ? " (test)" : "";
      const achat = en ? `Bought on ${echapper(formaterDate(c.payeeLe, "en"))}` : `Achat du ${echapper(formaterDate(c.payeeLe))}`;
      return `<tr><td style="padding:10px 0;border-bottom:1px solid ${COULEURS.filet};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${COULEURS.encre}">
${lien(`${site}${chemin("commande", l)}?t=${encodeURIComponent(c.jeton)}`, `${c.titre} (${en ? "no." : "n°"} ${c.designId})`)}<br>
<span style="color:${COULEURS.douce};font-size:13px">${achat}${etat}</span>
</td></tr>`;
    })
    .join("\n");
  const corps = [
    paragraphe(en ? `You asked to find your orders. Here are the links to each of them:` : `Vous avez demandé à retrouver vos commandes. Voici les liens vers chacune d'elles :`),
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:6px 0 18px;border-top:1px solid ${COULEURS.filet}">${liste}</table>`,
    petit(
      en
        ? `Each link is personal: do not forward it. If you did not make this request, simply ignore this email.`
        : `Chaque lien est personnel : ne le transférez pas. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.`,
    ),
  ].join("\n");
  const n = commandes.length;
  return {
    sujet: `${test ? "[TEST] " : ""}${en ? "Your orders at L'atelier sous la maison" : "Vos commandes à L'atelier sous la maison"}`,
    html: page({
      apercu: en ? `${n} order${n > 1 ? "s" : ""} found` : `${n} commande${n > 1 ? "s" : ""} retrouvée${n > 1 ? "s" : ""}`,
      titre: en ? "Your orders" : "Vos commandes",
      corps,
      site,
      test,
      langue: l,
    }),
  };
}
