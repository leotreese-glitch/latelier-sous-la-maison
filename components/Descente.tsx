"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Design } from "@/lib/catalogue";

// Étoiles à positions fixes (pas d'aléatoire : le rendu est identique à chaque visite).
const ETOILES: [number, number, number][] = [
  [6, 12, 1.2], [14, 30, 0.8], [22, 8, 1], [31, 22, 0.7], [38, 5, 1.1], [47, 16, 0.8], [55, 9, 1.3],
  [63, 27, 0.7], [71, 6, 1], [79, 19, 0.9], [88, 11, 1.2], [94, 28, 0.8], [10, 46, 0.7], [27, 40, 0.9],
  [44, 33, 0.6], [59, 44, 0.8], [83, 38, 0.7], [97, 50, 0.9], [3, 58, 0.6], [35, 55, 0.7],
];

const borne = (v: number) => Math.min(1, Math.max(0, v));

export function Descente({ mur }: { mur: Design[] }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduit.matches) return;
    el.classList.add("est-vivante");

    let image = 0;
    const maj = () => {
      image = 0;
      const r = el.getBoundingClientRect();
      const course = r.height - window.innerHeight;
      const p = borne(course > 0 ? -r.top / course : 0);
      el.style.setProperty("--p", p.toFixed(4));
      el.style.setProperty("--racines", borne((p - 0.1) / 0.55).toFixed(4));
      el.style.setProperty("--branches", borne((p - 0.22) / 0.5).toFixed(4));
      el.style.setProperty("--lueur", Math.max(0.35, borne(p / 0.25)).toFixed(4));
      el.style.setProperty("--lumiere", borne((p - 0.6) / 0.32).toFixed(4));
      el.style.setProperty("--texte", borne((p - 0.84) / 0.14).toFixed(4));
    };
    const demander = () => {
      if (!image) image = requestAnimationFrame(maj);
    };
    maj();
    window.addEventListener("scroll", demander, { passive: true });
    window.addEventListener("resize", demander);
    return () => {
      window.removeEventListener("scroll", demander);
      window.removeEventListener("resize", demander);
      cancelAnimationFrame(image);
      el.classList.remove("est-vivante");
    };
  }, []);

  const descendre = () => {
    const el = ref.current;
    if (!el) return;
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cible = el.classList.contains("est-vivante")
      ? el.offsetTop + el.offsetHeight - window.innerHeight
      : el.querySelector<HTMLElement>(".atelier")?.offsetTop ?? el.offsetTop;
    window.scrollTo({ top: cible, behavior: reduit ? "auto" : "smooth" });
  };

  return (
    <section ref={ref} className="descente" aria-labelledby="titre-accueil">
      <div className="descente__cadre">
        <div className="descente__monde">
          <div className="surface">
            <svg className="surface__etoiles" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
              {ETOILES.map(([x, y, r], i) => (
                <circle key={i} cx={x} cy={y} r={r * 0.18} />
              ))}
            </svg>
            <div className="surface__texte">
              <h1 id="titre-accueil" className="surface__titre">
                <span>L'atelier</span> <span>sous la maison</span>
              </h1>
              <p className="surface__phrase">Il y a, sous la maison, un atelier que peu de gens connaissent.</p>
              <button type="button" className="bouton bouton--or" onClick={descendre}>
                Descendre à l'atelier
              </button>
            </div>
            <svg className="surface__maison" viewBox="0 0 400 300" aria-hidden="true">
              <defs>
                <radialGradient id="lueur-soupirail" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#F1D58E" stopOpacity="0.9" />
                  <stop offset="0.45" stopColor="#C9A44C" stopOpacity="0.35" />
                  <stop offset="1" stopColor="#C9A44C" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse className="maison__halo" cx="200" cy="296" rx="120" ry="60" fill="url(#lueur-soupirail)" />
              <g className="maison__trait">
                <path d="M262 87 V58 H288 V107.6" />
                <path d="M56 152 L200 38 L344 152" />
                <path d="M82 132 V300 M318 132 V300" />
                <circle cx="200" cy="104" r="15" />
                <path d="M188 104 H212 M200 92 V116" />
                <path d="M118 300 V228 A22 22 0 0 1 162 228 V300" />
                <rect x="214" y="186" width="56" height="64" />
                <path d="M242 186 V250 M214 218 H270" />
                <rect x="104" y="166" width="36" height="34" />
                <path d="M122 166 V200" />
              </g>
              <path className="maison__soupirail" d="M180 300 V291 A20 14 0 0 1 220 291 V300 Z" />
            </svg>
            <div className="surface__sol" aria-hidden="true" />
          </div>

          <div className="terre" aria-hidden="true">
            <svg className="terre__strates" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 18 C20 14 40 22 60 17 S90 15 100 19" />
              <path d="M0 44 C25 40 45 49 70 43 S92 42 100 46" />
              <path d="M0 71 C18 67 42 75 64 69 S88 70 100 73" />
            </svg>
            <svg className="terre__racines" viewBox="0 0 200 400">
              <path className="racine racine--tronc" pathLength={1} d="M100 0 C100 60 70 90 85 150 S120 260 100 400" />
              <path className="racine" pathLength={1} d="M92 64 C60 76 30 116 45 158 C55 184 80 174 70 158" />
              <path className="racine" pathLength={1} d="M93 138 C140 148 176 190 160 230 C150 256 124 246 134 230" />
              <path className="racine" pathLength={1} d="M106 236 C60 258 40 300 60 340 C70 360 92 350 85 334" />
              <path className="racine" pathLength={1} d="M101 296 C132 318 152 350 142 388" />
              <path className="racine racine--fine" pathLength={1} d="M86 152 C70 200 76 232 58 262" />
              <path className="racine racine--fine" pathLength={1} d="M108 200 C130 222 128 252 150 276" />
            </svg>
          </div>

          <div className="atelier">
            <ul className="atelier__mur" aria-hidden="true">
              {mur.map((d) => (
                <li key={d.id}>
                  <img src={d.image} alt="" draggable={false} />
                </li>
              ))}
            </ul>
            <div className="atelier__cartel cartel">
              <h2 className="cartel__titre">Vous êtes dans l'atelier.</h2>
              <p>
                On y garde des motifs retrouvés dans les collections des musées, restaurés un à un. Des motifs nés ici,
                qu'on ne trouve nulle part ailleurs. Et des dessins à colorier pour les enfants.
              </p>
              <Link href="/explorer/" className="bouton bouton--encre">
                Explorer l'atelier
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
