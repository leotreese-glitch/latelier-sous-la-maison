import Link from "next/link";
import { CONTACT } from "@/lib/site";
import { Marque } from "./Logo";

export function PiedDePage() {
  return (
    <footer className="pied">
      <div className="pied__contenu">
        <div className="pied__marque">
          <Marque className="pied__logo" />
          <p className="pied__nom">L'atelier sous la maison</p>
          <p className="pied__phrase">Un lieu caché, où des motifs attendent qu'on les retrouve.</p>
        </div>
        <nav className="pied__liens" aria-label="Liens du pied de page">
          <Link href="/explorer/">Explorer</Link>
          <Link href="/identite/">Identité visuelle</Link>
          <Link href="/licence/">Licences</Link>
          <Link href="/certificat/">Vérifier un certificat</Link>
          <Link href="/commande/retrouver/">Retrouver mes commandes</Link>
          {CONTACT.actif && <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>}
          <Link href="/conditions-de-vente/">Conditions de vente</Link>
          <Link href="/mentions-legales/">Mentions légales</Link>
          <Link href="/confidentialite/">Confidentialité</Link>
        </nav>
      </div>
      <p className="pied__note">© 2026 L'atelier sous la maison. Site en préparation.</p>
    </footer>
  );
}
