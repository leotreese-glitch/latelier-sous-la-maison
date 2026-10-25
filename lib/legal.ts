// Informations légales du site. Les champs vides sont à remplir une fois la micro-entreprise créée :
// tant qu'il en manque, les pages légales affichent un avertissement « projet ».
// Textes rédigés comme base de travail : à faire relire par un professionnel du droit avant le paiement réel.
import { CONTACT, DOMAINE } from "./site";

export const VERSION_CGV = "2026-10";
export const MISE_A_JOUR_LEGALE = "25 octobre 2026";
export const MISE_A_JOUR_LEGALE_EN = "October 25, 2026";

/** Durée de conservation des commandes, annoncée dans la page Confidentialité. */
export const CONSERVATION_COMMANDES_ANS = 10;

/** Éditeur du site et fournisseur des fichiers (entrepreneur individuel). */
export const EDITEUR = {
  /** Prénom et nom, suivis de la mention « EI » (obligatoire pour un entrepreneur individuel). */
  nom: "",
  /** Nom commercial. */
  enseigne: "L'atelier sous la maison",
  /** Adresse professionnelle ou de domiciliation. */
  adresse: "",
  telephone: "",
  siret: "",
  /** Numéro d'inscription au RCS ou au RNE, si applicable. */
  immatriculation: "",
  /** Mention de TVA : numéro intracommunautaire, ou « TVA non applicable, article 293 B du CGI » en franchise. */
  tva: "",
  email: CONTACT.email,
  site: `https://${DOMAINE}`,
};

/** Médiateur de la consommation auquel l'éditeur adhère (obligatoire pour vendre à des particuliers). */
export const MEDIATEUR = {
  nom: "",
  adresse: "",
  site: "",
};

export const HEBERGEUR = {
  nom: "Cloudflare, Inc.",
  adresse: "101 Townsend St., San Francisco, CA 94107, États-Unis",
  telephone: "+1 (650) 319-8930",
  site: "https://www.cloudflare.com",
};

export const PRESTATAIRES = {
  paiement: {
    nom: "Link, service du groupe Stripe",
    detail: "vendeur officiel (« merchant of record ») : encaissement, reçus, factures et taxes",
    confidentialite: "https://link.com/privacy",
  },
  courriel: {
    nom: "Brevo (Sendinblue SAS)",
    detail: "17 rue de Salneuve, 75017 Paris, France ; données hébergées dans l'Union européenne",
  },
};

/** Champs encore vides, pour afficher l'avertissement et pour l'administration. */
export function infosLegalesManquantes(l: "fr" | "en" = "fr") {
  const en = l === "en";
  const manques: string[] = [];
  if (!EDITEUR.nom) manques.push(en ? "owner's name (followed by « EI »)" : "nom de l'entrepreneur (suivi de « EI »)");
  if (!EDITEUR.adresse) manques.push(en ? "address" : "adresse");
  if (!EDITEUR.telephone) manques.push(en ? "phone number" : "téléphone");
  if (!EDITEUR.siret) manques.push(en ? "SIRET number" : "numéro SIRET");
  if (!EDITEUR.tva) manques.push(en ? "VAT statement" : "mention de TVA");
  if (!MEDIATEUR.nom) manques.push(en ? "consumer mediator" : "médiateur de la consommation");
  return manques;
}
