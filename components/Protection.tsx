"use client";

import { useEffect } from "react";

/**
 * Bloque le clic droit et le glisser-déposer sur les images.
 * Ça ne décourage que les curieux : la vraie protection, c'est que le fichier
 * haute définition n'est jamais envoyé au navigateur.
 */
export function Protection() {
  useEffect(() => {
    const bloquer = (e: Event) => {
      const cible = e.target as HTMLElement | null;
      if (cible?.closest("img, .apercu, .voir-sur")) e.preventDefault();
    };
    document.addEventListener("contextmenu", bloquer);
    document.addEventListener("dragstart", bloquer);
    return () => {
      document.removeEventListener("contextmenu", bloquer);
      document.removeEventListener("dragstart", bloquer);
    };
  }, []);
  return null;
}
