"use client";

import { useRef, useState, type PointerEvent } from "react";
import type { Langue } from "@/lib/i18n";
import { texteDesign, type Design } from "@/lib/modele";

const T = {
  fr: { mention: "Aperçu basse définition", survol: "Survolez l'image pour l'examiner à la loupe. ", hd: "Le fichier livré est en haute définition, sans filigrane." },
  en: { mention: "Low-resolution preview", survol: "Hover over the image to examine it with the magnifier. ", hd: "The file you receive is in high definition, without watermark." },
};

const ZOOM = 2.2;
const RAYON = 95;

/**
 * Aperçu filigrané avec loupe.
 * En production, le filigrane sera incrusté dans l'image côté serveur ;
 * ici il est superposé pour la maquette.
 */
export function Apercu({ d, l = "fr" }: { d: Design; l?: Langue }) {
  const t = T[l];
  const cadre = useRef<HTMLDivElement>(null);
  const [loupe, setLoupe] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const bouger = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !cadre.current) return;
    const r = cadre.current.getBoundingClientRect();
    setLoupe({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height });
  };

  return (
    <div className="apercu">
      <div
        ref={cadre}
        className="apercu__cadre"
        onPointerMove={bouger}
        onPointerLeave={() => setLoupe(null)}
        style={{ cursor: loupe ? "none" : undefined }}
      >
        <img src={d.image} alt={texteDesign(d, l).resume} width={600} height={Math.round(600 * d.ratio)} draggable={false} />
        {!d.filigraneIntegre && <div className="apercu__filigrane" aria-hidden="true" />}
        <span className="apercu__mention">{t.mention}</span>
        {loupe && (
          <div
            className="loupe"
            aria-hidden="true"
            style={{
              left: loupe.x,
              top: loupe.y,
              backgroundImage: `url(${d.image})`,
              backgroundSize: `${loupe.w * ZOOM}px ${loupe.h * ZOOM}px`,
              backgroundPosition: `${-(loupe.x * ZOOM - RAYON)}px ${-(loupe.y * ZOOM - RAYON)}px`,
            }}
          />
        )}
      </div>
      <p className="apercu__aide">
        <span className="apercu__survol">{t.survol}</span>
        {t.hd}
      </p>
    </div>
  );
}
