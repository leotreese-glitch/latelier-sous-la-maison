import type { NextConfig } from "next";

// Étape 1 (maquette) : export statique, hébergeable gratuitement partout.
// À l'étape 2, on passera sur Cloudflare Workers (OpenNext) pour les comptes,
// les paiements et la livraison des fichiers.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
