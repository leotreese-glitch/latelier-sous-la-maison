import type { Metadata } from "next";
import Link from "next/link";
import { Deconnexion } from "@/components/admin/Deconnexion";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin">
      <header className="admin-barre">
        <Link href="/admin/" className="entete__accueil" aria-label="Administration, liste des designs">
          <Logo />
        </Link>
        <span className="admin-barre__nom">Administration</span>
        <nav className="admin-barre__liens" aria-label="Administration">
          <Link href="/admin/">Designs</Link>
          <a href="/" target="_blank" rel="noopener">
            Voir le site
          </a>
          <Deconnexion />
        </nav>
      </header>
      <main id="contenu" className="admin-contenu">
        {children}
      </main>
    </div>
  );
}
