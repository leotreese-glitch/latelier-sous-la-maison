"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { api, envoyerFichier, ErreurApi, type DesignAdmin, type Fichier } from "@/lib/admin/api";
import { couleursDominantes, fabriquerApercu, IMAGES_LISIBLES, lireImage } from "@/lib/admin/images";
import {
  COULEURS,
  FAMILLES,
  HD_MINIMUM_PX,
  manquesPourPublier,
  PERIODES,
  slugifier,
  STATUTS_DROITS,
  TYPES,
  type Couleur,
  type Design,
  type Droits,
  type Palier,
  type Statut,
} from "@/lib/modele";

type Brouillon = Omit<Partial<Design>, "edition"> & { edition?: Design["edition"] | null };
type Message = { type: "ok" | "erreur" | "info"; texte: string; manques?: string[] };

const PALIERS_DEFAUT: Palier[] = [
  { licences: 10, eur: 12, usd: 14 },
  { licences: 10, eur: 18, usd: 21 },
  { licences: 10, eur: 25, usd: 29 },
];
const DROITS_VIDES: Droits = { musee: "", reference: "", url: "", statut: "a-verifier", conditions: "", consulteLe: "" };
const STATUTS_NOMS: Record<Statut, string> = { brouillon: "Brouillon", publie: "Publié", retire: "Retiré de la vente" };

const mo = (octets: number) => `${(octets / 1024 / 1024).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;

function Section({ titre, aide, children }: { titre: string; aide?: string; children: ReactNode }) {
  return (
    <section className="admin-carte admin-section">
      <h2>{titre}</h2>
      {aide && <p className="admin-aide">{aide}</p>}
      {children}
    </section>
  );
}

function Champ({ etiquette, aide, children }: { etiquette: string; aide?: string; children: ReactNode }) {
  return (
    <label className="champ">
      <span>{etiquette}</span>
      {children}
      {aide && <small>{aide}</small>}
    </label>
  );
}

export function Editeur() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id") ?? "";

  const [design, setDesign] = useState<DesignAdmin | null>(null);
  const [fichiers, setFichiers] = useState<Fichier[]>([]);
  const [b, setB] = useState<Brouillon>({});
  const [sale, setSale] = useState(false);
  const [slugManuel, setSlugManuel] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [envoi, setEnvoi] = useState<{ etape: string; pourcent: number } | null>(null);
  const [suggestions, setSuggestions] = useState<{ cle: Couleur; part: number }[]>([]);
  const [occupe, setOccupe] = useState(false);

  const recevoir = useCallback((d: DesignAdmin, f: Fichier[]) => {
    setDesign(d);
    setFichiers(f);
    setB(d);
    setSale(false);
  }, []);

  useEffect(() => {
    if (!id) return;
    api
      .lire(id)
      .then((r) => recevoir(r.design, r.fichiers))
      .catch((e) => {
        if (e instanceof ErreurApi && (e.statut === 401 || e.code === "non-configure")) router.replace("/admin/");
        else setMessage({ type: "erreur", texte: e instanceof ErreurApi ? e.message : "Chargement impossible." });
      });
  }, [id, recevoir, router]);

  useEffect(() => {
    const avertir = (e: BeforeUnloadEvent) => {
      if (sale) e.preventDefault();
    };
    window.addEventListener("beforeunload", avertir);
    return () => window.removeEventListener("beforeunload", avertir);
  }, [sale]);

  const maj = <K extends keyof Brouillon>(cle: K, valeur: Brouillon[K]) => {
    setB((avant) => {
      const suite = { ...avant, [cle]: valeur };
      if (cle === "titre" && !design?.publieLe && !slugManuel) suite.slug = slugifier(String(valeur)) || design?.id;
      return suite;
    });
    setSale(true);
  };
  const majDroits = (cle: keyof Droits, valeur: string) => maj("droits", { ...DROITS_VIDES, ...b.droits, [cle]: valeur } as Droits);

  const nbHd = fichiers.filter((f) => f.role === "hd").length;
  const manques = useMemo(() => manquesPourPublier({ ...b, edition: b.edition ?? undefined }, nbHd), [b, nbHd]);

  const enregistrer = async (statut: Statut, texteOk: string) => {
    if (!design) return;
    setOccupe(true);
    setMessage(null);
    try {
      const corps = { ...b, edition: b.edition ?? null } as unknown as Partial<Design>;
      const r = await api.enregistrer(design.id, corps, statut);
      recevoir(r.design, r.fichiers);
      setMessage({ type: "ok", texte: texteOk });
    } catch (e) {
      if (e instanceof ErreurApi && e.statut === 401) return router.replace("/admin/");
      setMessage({
        type: "erreur",
        texte: e instanceof ErreurApi ? e.message : "Enregistrement impossible.",
        manques: e instanceof ErreurApi ? e.manques : undefined,
      });
    } finally {
      setOccupe(false);
    }
  };

  /** Intègre ce que le serveur a calculé (aperçu, dimensions) sans perdre les modifications en cours. */
  const integrer = (d: DesignAdmin, f: Fichier[]) => {
    setDesign(d);
    setFichiers(f);
    setB((avant) => ({ ...avant, image: d.image, ratio: d.ratio, filigraneIntegre: d.filigraneIntegre, hd: d.hd }));
  };

  const envoyerApercu = async (fichier: File) => {
    const image = await lireImage(fichier);
    try {
      setEnvoi({ etape: "Fabrication de l'aperçu filigrané", pourcent: 0 });
      const apercu = await fabriquerApercu(image);
      setEnvoi({ etape: "Envoi de l'aperçu", pourcent: 0 });
      const r = await envoyerFichier({
        design: id,
        role: "apercu",
        fichier: apercu.blob,
        nom: `apercu.${apercu.type === "image/webp" ? "webp" : "jpg"}`,
        type: apercu.type,
        largeur: apercu.largeur,
        hauteur: apercu.hauteur,
        surProgres: (p) => setEnvoi({ etape: "Envoi de l'aperçu", pourcent: p }),
      });
      integrer(r.design, r.fichiers);
      return couleursDominantes(image);
    } finally {
      image.liberer();
    }
  };

  const deposerHd = async (e: ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier || !design) return;
    setMessage(null);
    const lisible = IMAGES_LISIBLES.includes(fichier.type);
    const avertissements: string[] = [];
    try {
      let largeur: number | undefined;
      let hauteur: number | undefined;
      if (lisible && fichier.type !== "image/svg+xml") {
        const image = await lireImage(fichier);
        largeur = image.largeur;
        hauteur = image.hauteur;
        image.liberer();
        if (Math.max(largeur, hauteur) < HD_MINIMUM_PX) {
          avertissements.push(
            `Ce fichier fait ${largeur} × ${hauteur} px : c'est trop petit pour être vendu en haute définition (${HD_MINIMUM_PX} px minimum conseillés sur le grand côté).`,
          );
        }
      }
      setEnvoi({ etape: "Envoi du fichier haute définition", pourcent: 0 });
      const r = await envoyerFichier({
        design: design.id,
        role: "hd",
        fichier,
        nom: fichier.name,
        type: fichier.type || "application/octet-stream",
        largeur,
        hauteur,
        surProgres: (p) => setEnvoi({ etape: "Envoi du fichier haute définition", pourcent: p }),
      });
      integrer(r.design, r.fichiers);

      // L'aperçu n'est fabriqué qu'à partir du premier fichier HD (ou s'il manque encore un aperçu filigrané).
      // Pour le changer ensuite : « Remplacer seulement l'aperçu ».
      const apercuAFaire = !r.design.image || !r.design.filigraneIntegre;
      let texte = "Fichier envoyé.";
      if (lisible && apercuAFaire) {
        const couleurs = await envoyerApercu(fichier);
        setSuggestions(couleurs);
        if (!b.couleurs?.length && couleurs.length) maj("couleurs", couleurs.map((c) => c.cle));
        texte = "Fichier envoyé. L'aperçu filigrané et les couleurs sont prêts.";
      } else if (lisible) {
        texte = "Fichier ajouté. L'aperçu actuel est conservé : pour le changer, utilisez « Remplacer seulement l'aperçu ».";
      } else if (!r.design.image) {
        avertissements.push("Ce format ne s'affiche pas dans le navigateur : déposez aussi une image d'aperçu (PNG ou JPEG).");
      }
      setMessage({
        type: avertissements.length ? "info" : "ok",
        texte: avertissements.length ? [texte, ...avertissements].join(" ") : texte,
      });
    } catch (err) {
      setMessage({ type: "erreur", texte: err instanceof Error ? err.message : "L'envoi a échoué." });
    } finally {
      setEnvoi(null);
    }
  };

  const deposerApercu = async (e: ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;
    setMessage(null);
    try {
      const couleurs = await envoyerApercu(fichier);
      setSuggestions(couleurs);
      setMessage({ type: "ok", texte: "Nouvel aperçu filigrané en place." });
    } catch (err) {
      setMessage({ type: "erreur", texte: err instanceof Error ? err.message : "L'envoi a échoué." });
    } finally {
      setEnvoi(null);
    }
  };

  const supprimerFichier = async (f: Fichier) => {
    if (!confirm(`Supprimer le fichier ${f.nom} ?`)) return;
    try {
      const r = await api.supprimerFichier(f.cle);
      setFichiers(r.fichiers);
    } catch (e) {
      setMessage({ type: "erreur", texte: e instanceof ErreurApi ? e.message : "Suppression impossible." });
    }
  };

  const supprimerDesign = async () => {
    if (!design || !confirm(`Supprimer définitivement ${design.id} et ses fichiers ?`)) return;
    try {
      await api.supprimer(design.id);
      setSale(false);
      router.push("/admin/");
    } catch (e) {
      setMessage({ type: "erreur", texte: e instanceof ErreurApi ? e.message : "Suppression impossible." });
    }
  };

  if (!id) return <p className="admin-erreur">Aucun design indiqué.</p>;
  if (!design) return <p className="admin-aide">{message?.texte ?? "Chargement…"}</p>;

  const famille = design.famille;
  const coloriage = famille === "petit-atelier";
  const publieUneFois = Boolean(design.publieLe);
  const supprimable = !publieUneFois || design.exemple;

  return (
    <div className="admin-editeur">
      <div className="admin-entete-page">
        <div>
          <p className="admin-fil">
            <Link href="/admin/">Designs</Link> / {FAMILLES[famille].nom}
          </p>
          <h1>{b.titre || "Sans titre"}</h1>
          <p className="admin-num">
            N° {design.id}, {STATUTS_NOMS[design.statut ?? "brouillon"]}
            {design.exemple ? ", exemple de la maquette" : ""}
          </p>
        </div>
      </div>

      <div className="admin-barre-actions">
        <div className="admin-boutons">
          <button type="button" className="bouton bouton--contour" disabled={occupe || Boolean(envoi)} onClick={() => enregistrer(design.statut ?? "brouillon", "Enregistré.")}>
            Enregistrer
          </button>
          {design.statut !== "publie" && (
            <button
              type="button"
              className="bouton bouton--or"
              disabled={occupe || Boolean(envoi)}
              onClick={() => enregistrer("publie", "Publié. Il apparaîtra sur le site après la prochaine mise à jour.")}
            >
              {design.statut === "retire" ? "Remettre en vente" : "Publier"}
            </button>
          )}
          {design.statut === "publie" && (
            <button type="button" className="bouton bouton--contour" disabled={occupe} onClick={() => enregistrer("retire", "Retiré de la vente après la prochaine mise à jour.")}>
              Retirer de la vente
            </button>
          )}
          <span className="admin-barre-actions__etat">
            {STATUTS_NOMS[design.statut ?? "brouillon"]}
            {sale ? ", modifications non enregistrées" : ""}
          </span>
        </div>
        {message && (
          <div className={`admin-message admin-message--${message.type}`} role={message.type === "erreur" ? "alert" : "status"}>
            <p>{message.texte}</p>
            {message.manques && (
              <ul>
                {message.manques.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="admin-colonnes">
        <div className="admin-formulaire">
          <Section
            titre="Fichiers"
            aide="Déposez le fichier haute définition à livrer : le site en tire tout seul l'aperçu filigrané de 1200 px et les couleurs. Le fichier HD reste privé."
          >
            <div className="admin-fichiers">
              <div className="admin-apercu">
                {b.image ? <img src={b.image} alt="Aperçu actuel" /> : <span className="admin-vignette--vide">Pas encore d'aperçu</span>}
                {b.filigraneIntegre && <small>Filigrane incrusté</small>}
              </div>
              <div className="admin-depots">
                <label className="admin-depot">
                  <strong>Fichier haute définition</strong>
                  <span>PNG, JPEG, WebP, SVG, TIFF, PDF ou ZIP. Jusqu'à plusieurs centaines de Mo.</span>
                  <input type="file" accept=".png,.jpg,.jpeg,.webp,.svg,.tif,.tiff,.pdf,.zip" onChange={deposerHd} disabled={Boolean(envoi)} />
                </label>
                <label className="admin-depot admin-depot--secondaire">
                  <strong>Remplacer seulement l'aperçu</strong>
                  <span>Pour un fichier HD en TIFF, PDF ou ZIP, ou pour montrer un détail.</span>
                  <input type="file" accept=".png,.jpg,.jpeg,.webp,.svg" onChange={deposerApercu} disabled={Boolean(envoi)} />
                </label>
                {envoi && (
                  <div className="admin-progres" role="status">
                    <span>
                      {envoi.etape} : {envoi.pourcent} %
                    </span>
                    <progress max={100} value={envoi.pourcent} />
                  </div>
                )}
              </div>
            </div>
            {nbHd > 0 && (
              <table className="admin-table admin-table--compacte">
                <thead>
                  <tr>
                    <th scope="col">Fichier livré</th>
                    <th scope="col">Dimensions</th>
                    <th scope="col">Taille</th>
                    <th scope="col">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fichiers
                    .filter((f) => f.role === "hd")
                    .map((f) => (
                      <tr key={f.cle}>
                        <td>{f.nom}</td>
                        <td className="admin-num">{f.largeur && f.hauteur ? `${f.largeur} × ${f.hauteur} px` : "vectoriel ou document"}</td>
                        <td className="admin-num">{mo(f.taille)}</td>
                        <td>
                          <button type="button" className="effacer" onClick={() => supprimerFichier(f)}>
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </Section>

          <Section titre="La fiche">
            <div className="admin-grille">
              <Champ etiquette="Titre">
                <input value={b.titre ?? ""} onChange={(e) => maj("titre", e.target.value)} maxLength={90} />
              </Champ>
              <Champ
                etiquette="Adresse de la fiche"
                aide={publieUneFois ? "Figée depuis la première publication, pour ne jamais casser un lien." : "Calculée depuis le titre. Elle sera figée à la publication."}
              >
                <div className="champ-prefixe">
                  <span>/motif/</span>
                  <input
                    value={b.slug ?? ""}
                    disabled={publieUneFois}
                    onChange={(e) => {
                      setSlugManuel(true);
                      maj("slug", e.target.value);
                    }}
                  />
                </div>
              </Champ>
              <Champ etiquette="Époque (pour la frise)">
                <select value={b.periode ?? ""} onChange={(e) => maj("periode", e.target.value as Design["periode"])}>
                  {PERIODES.map((p) => (
                    <option key={p.cle} value={p.cle}>
                      {p.nom}
                    </option>
                  ))}
                </select>
              </Champ>
              <Champ etiquette="Date affichée" aide="Par exemple : vers 1780, XVIIIe siècle, 2026.">
                <input value={b.date ?? ""} onChange={(e) => maj("date", e.target.value)} />
              </Champ>
              <Champ etiquette="Origine" aide="Pays ou région, ou « L'atelier sous la maison » pour une création.">
                <input value={b.origine ?? ""} onChange={(e) => maj("origine", e.target.value)} />
              </Champ>
              <Champ etiquette="Technique">
                <input value={b.technique ?? ""} onChange={(e) => maj("technique", e.target.value)} />
              </Champ>
              <Champ etiquette="Type de motif">
                <select value={b.type ?? ""} onChange={(e) => maj("type", e.target.value as Design["type"])}>
                  {Object.entries(TYPES).map(([cle, nom]) => (
                    <option key={cle} value={cle}>
                      {nom}
                    </option>
                  ))}
                </select>
              </Champ>
              {coloriage && (
                <>
                  <Champ etiquette="Pour qui">
                    <select value={b.niveau ?? "Tout-petits"} onChange={(e) => maj("niveau", e.target.value as Design["niveau"])}>
                      <option value="Tout-petits">Tout-petits (gros traits)</option>
                      <option value="Petits dessinateurs">Petits dessinateurs (traits fins)</option>
                    </select>
                  </Champ>
                  <Champ etiquette="Pochette" aide="Nom de la pochette de 5 dessins qui contient ce coloriage.">
                    <input value={b.pochette ?? ""} onChange={(e) => maj("pochette", e.target.value)} />
                  </Champ>
                </>
              )}
            </div>
            <Champ etiquette="Résumé" aide="Une ou deux phrases factuelles, affichées sous le titre et lues par les moteurs de recherche.">
              <textarea rows={2} maxLength={240} value={b.resume ?? ""} onChange={(e) => maj("resume", e.target.value)} />
            </Champ>
            <Champ
              etiquette={famille === "retrouves" ? "Texte du cartel" : "Texte du cartel d'atelier"}
              aide={famille === "retrouves" ? "L'histoire du motif, d'après la notice du musée." : "L'inspiration et la palette. Pas de fausse histoire."}
            >
              <textarea rows={4} value={b.cartel ?? ""} onChange={(e) => maj("cartel", e.target.value)} />
            </Champ>
            <Champ etiquette="Source" aide="Affichée en bas du cartel.">
              <input value={b.source ?? ""} onChange={(e) => maj("source", e.target.value)} />
            </Champ>
            {famille !== "retrouves" && (
              <label className="case">
                <input type="checkbox" checked={Boolean(b.ia)} onChange={(e) => maj("ia", e.target.checked)} />
                <span>Créé avec l'assistance de l'IA (mention affichée sur la fiche)</span>
              </label>
            )}
          </Section>

          {!coloriage && (
            <Section titre="Couleurs" aide="Elles servent à la recherche par couleur. Les couleurs détectées dans l'image sont précochées.">
              <div className="admin-couleurs">
                {COULEURS.map((c) => {
                  const part = suggestions.find((s) => s.cle === c.cle)?.part;
                  const coche = b.couleurs?.includes(c.cle) ?? false;
                  return (
                    <label key={c.cle} className="case">
                      <input
                        type="checkbox"
                        checked={coche}
                        onChange={(e) =>
                          maj("couleurs", e.target.checked ? [...(b.couleurs ?? []), c.cle] : (b.couleurs ?? []).filter((x) => x !== c.cle))
                        }
                      />
                      <span className="pastille" style={{ background: c.hex }} aria-hidden="true" />
                      <span>
                        {c.nom}
                        {part ? ` (${part} %)` : ""}
                      </span>
                    </label>
                  );
                })}
              </div>
            </Section>
          )}

          <Section titre="Prix" aide="Prix TTC. En dessous de 5 €, les frais de paiement mangent la marge.">
            <div className="admin-grille admin-grille--etroite">
              <Champ etiquette={coloriage ? "Prix de la pochette en euros" : "Prix en euros"}>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={b.prix?.eur ?? ""}
                  onChange={(e) => maj("prix", { eur: Number(e.target.value), usd: b.prix?.usd ?? 0 })}
                />
              </Champ>
              <Champ etiquette={coloriage ? "Prix de la pochette en dollars" : "Prix en dollars"}>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={b.prix?.usd ?? ""}
                  onChange={(e) => maj("prix", { eur: b.prix?.eur ?? 0, usd: Number(e.target.value) })}
                />
              </Champ>
            </div>
            {famille === "atelier" && (
              <>
                <label className="case">
                  <input
                    type="checkbox"
                    checked={Boolean(b.edition)}
                    onChange={(e) => maj("edition", e.target.checked ? { paliers: PALIERS_DEFAUT, vendues: 0 } : null)}
                  />
                  <span>Édition limitée : le prix monte par paliers, puis le design est retiré de la vente</span>
                </label>
                {b.edition && (
                  <table className="admin-table admin-table--compacte">
                    <thead>
                      <tr>
                        <th scope="col">Palier</th>
                        <th scope="col">Licences</th>
                        <th scope="col">Prix €</th>
                        <th scope="col">Prix $</th>
                      </tr>
                    </thead>
                    <tbody>
                      {b.edition.paliers.map((p, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          {(["licences", "eur", "usd"] as const).map((k) => (
                            <td key={k}>
                              <input
                                type="number"
                                min={0}
                                step={k === "licences" ? 1 : 0.1}
                                aria-label={`Palier ${i + 1}, ${k}`}
                                value={p[k]}
                                onChange={(e) => {
                                  const paliers = b.edition!.paliers.map((x, j) => (j === i ? { ...x, [k]: Number(e.target.value) } : x));
                                  maj("edition", { ...b.edition!, paliers });
                                }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </Section>

          {famille === "retrouves" && (
            <Section
              titre="Preuves de droits"
              aide="Obligatoire pour publier un motif retrouvé. Gardez la trace de la notice du musée qui prouve que l'œuvre et sa photo sont libres de droits."
            >
              <div className="admin-grille">
                <Champ etiquette="Musée">
                  <input value={b.droits?.musee ?? ""} onChange={(e) => majDroits("musee", e.target.value)} />
                </Champ>
                <Champ etiquette="Référence de l'objet" aide="Numéro d'inventaire.">
                  <input value={b.droits?.reference ?? ""} onChange={(e) => majDroits("reference", e.target.value)} />
                </Champ>
                <Champ etiquette="Lien vers la notice">
                  <input type="url" value={b.droits?.url ?? ""} onChange={(e) => majDroits("url", e.target.value)} placeholder="https://" />
                </Champ>
                <Champ etiquette="Conditions de réutilisation" aide="Par exemple : CC0, Licence Ouverte, domaine public.">
                  <input value={b.droits?.conditions ?? ""} onChange={(e) => majDroits("conditions", e.target.value)} />
                </Champ>
                <Champ etiquette="Date de consultation">
                  <input type="date" value={b.droits?.consulteLe ?? ""} onChange={(e) => majDroits("consulteLe", e.target.value)} />
                </Champ>
                <Champ etiquette="Statut des droits">
                  <select value={b.droits?.statut ?? "a-verifier"} onChange={(e) => majDroits("statut", e.target.value)}>
                    {Object.entries(STATUTS_DROITS).map(([cle, nom]) => (
                      <option key={cle} value={cle}>
                        {nom}
                      </option>
                    ))}
                  </select>
                </Champ>
              </div>
              <Champ etiquette="Note interne" aide="Jamais publiée.">
                <textarea rows={2} value={b.droits?.note ?? ""} onChange={(e) => majDroits("note", e.target.value)} />
              </Champ>
            </Section>
          )}
        </div>

        <aside className="admin-cote">
          <div className="admin-carte admin-collant">
            <div className="admin-verif">
              <h2>Avant de publier</h2>
              {manques.length === 0 ? (
                <p className="admin-ok">Tout est prêt.</p>
              ) : (
                <ul>
                  {manques.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
            {design.statut === "publie" && (
              <p className="admin-aide">
                Fiche publique : <a href={`/motif/${design.slug}/`}>/motif/{design.slug}/</a> (visible après la mise à jour du site).
              </p>
            )}
            {supprimable && (
              <button type="button" className="effacer admin-supprimer" onClick={supprimerDesign}>
                Supprimer ce design
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
