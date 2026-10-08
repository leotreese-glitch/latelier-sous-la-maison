import { preparerBase } from "../../../server/base";
import { erreur, etatConfiguration, type Env } from "../../../server/env";
import { origineAutorisee, sessionValide } from "../../../server/securite";

/** Garde de toutes les routes /api/admin/* : configuration, origine, session. */
export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
  const chemin = new URL(request.url).pathname;
  const config = etatConfiguration(env);

  if (!config.base || !config.motDePasse || !config.secretSession) {
    return erreur(503, "L'administration n'est pas encore configurée.", { code: "non-configure", config });
  }
  if (!origineAutorisee(request)) return erreur(403, "Requête refusée : origine inconnue.");

  await preparerBase(env.DB!);

  if (chemin.replace(/\/$/, "") === "/api/admin/connexion") return next();
  if (!(await sessionValide(request, env))) return erreur(401, "Session expirée : reconnectez-vous.", { code: "deconnecte" });
  return next();
};
