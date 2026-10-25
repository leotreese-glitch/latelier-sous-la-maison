import Link from "next/link";
import { chemin, type Langue } from "@/lib/i18n";
import { CONTACT } from "@/lib/site";
import { Marque } from "./Logo";

const T = {
  fr: {
    phrase: "Un lieu caché, où des motifs attendent qu'on les retrouve.",
    liens: "Liens du pied de page",
    explorer: "Explorer",
    identite: "Identité visuelle",
    licence: "Licences",
    certificat: "Vérifier un certificat",
    retrouver: "Retrouver mes commandes",
    cgv: "Conditions de vente",
    mentions: "Mentions légales",
    confidentialite: "Confidentialité",
    autre: "English version",
    note: "© 2026 L'atelier sous la maison. Site en préparation.",
  },
  en: {
    phrase: "A hidden place, where patterns wait to be rediscovered.",
    liens: "Footer links",
    explorer: "Explore",
    identite: "",
    licence: "Licenses",
    certificat: "Verify a certificate",
    retrouver: "Find my orders",
    cgv: "Terms of sale",
    mentions: "Legal notice",
    confidentialite: "Privacy",
    autre: "Version française",
    note: "© 2026 L'atelier sous la maison. Site in preparation.",
  },
};

export function PiedDePage({ l }: { l: Langue }) {
  const t = T[l];
  return (
    <footer className="pied">
      <div className="pied__contenu">
        <div className="pied__marque">
          <Marque className="pied__logo" />
          <p className="pied__nom">L'atelier sous la maison</p>
          <p className="pied__phrase">{t.phrase}</p>
        </div>
        <nav className="pied__liens" aria-label={t.liens}>
          <Link href={chemin("explorer", l)}>{t.explorer}</Link>
          {l === "fr" && <Link href="/identite/">{t.identite}</Link>}
          <Link href={chemin("licence", l)}>{t.licence}</Link>
          <Link href={chemin("certificat", l)}>{t.certificat}</Link>
          <Link href={chemin("retrouver", l)}>{t.retrouver}</Link>
          {CONTACT.actif && <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>}
          <Link href={chemin("cgv", l)}>{t.cgv}</Link>
          <Link href={chemin("mentions", l)}>{t.mentions}</Link>
          <Link href={chemin("confidentialite", l)}>{t.confidentialite}</Link>
          <a href={chemin("accueil", l === "fr" ? "en" : "fr")} hrefLang={l === "fr" ? "en" : "fr"} lang={l === "fr" ? "en" : "fr"}>
            {t.autre}
          </a>
        </nav>
      </div>
      <p className="pied__note">{t.note}</p>
    </footer>
  );
}
