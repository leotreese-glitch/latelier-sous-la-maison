import Link from "next/link";
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
          <a href="#" aria-disabled="true" title="Rédigées à l'étape 5">Licences</a>
          <a href="#" aria-disabled="true" title="Rédigées à l'étape 5">Mentions légales</a>
          <a href="#" aria-disabled="true" title="Rédigées à l'étape 5">Conditions de vente</a>
        </nav>
      </div>
      <p className="pied__note">© 2026 L'atelier sous la maison. Maquette de travail.</p>
    </footer>
  );
}
