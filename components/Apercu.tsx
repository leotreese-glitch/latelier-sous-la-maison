"use client";

import { useRef, useState, type PointerEvent } from "react";
import type { Design } from "@/lib/modele";

const ZOOM = 2.2;
const RAYON = 95;

/**
 * Aperçu filigrané avec loupe.
 * En production, le filigrane sera incrusté dans l'image côté serveur ;
 * ici il est superposé pour la maquette.
 */
export function Apercu({ d }: { d: Design }) {
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
        <img src={d.image} alt={d.resume} width={600} height={Math.round(600 * d.ratio)} draggable={false} />
        {!d.filigraneIntegre && <div className="apercu__filigrane" aria-hidden="true" />}
        <span className="apercu__mention">Aperçu basse définition</span>
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
        <span className="apercu__survol">Survolez l'image pour l'examiner à la loupe. </span>
        Le fichier livré est en haute définition, sans filigrane.
      </p>
    </div>
  );
}
