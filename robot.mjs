// Robot Sacem — Artiste Averti. Voir README.md. Journal sans données personnelles.
import { chromium } from "playwright";

const { ROBOT_CLE, SITE, COMMANDE, ACTION, DRY_RUN = "1" } = process.env;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const log = (...m) => console.log(`[${COMMANDE}] [${ACTION}]`, ...m);

async function api(chemin, corps) {
  const r = await fetch(SITE + "/api/robot" + chemin, {
    method: corps ? "POST" : "GET",
    headers: { "x-robot-cle": ROBOT_CLE, "content-type": "application/json" },
    body: corps ? JSON.stringify(corps) : undefined,
  });
  if (!r.ok) throw new Error("API " + chemin + " : " + r.status);
  return r.json();
}
const etat = (etape, extra = {}) => api("/etat", { commande: COMMANDE, etape, ...extra });

async function navigateur() {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 }, locale: "fr-FR", userAgent: UA });
  return { b, p };
}

async function refuserCookies(p) {
  const bt = p.locator("#onetrust-reject-all-handler");
  if (await bt.isVisible().catch(() => false)) await bt.click();
}

async function envoyer(p, bouton, quoi) {
  if (DRY_RUN === "1") { log(`DRY_RUN : arrêt avant « ${quoi} »`); return false; }
  await bouton.click();
  return true;
}

// ---------- action « remplir »
async function remplir() {
  const { commande } = await api("/commande?id=" + encodeURIComponent(COMMANDE));
  const { b, p } = await navigateur();
  try {
    await p.goto("https://www.adhesion.sacem.fr/", { waitUntil: "networkidle", timeout: 60000 });
    await refuserCookies(p);
    // Étape 1 : adresse e-mail de suivi (relevée le 19/11/2026 : input[name=email] + bouton « Suivant »)
    await p.fill('input[name="email"]', commande.email_suivi);
    log("étape 1 remplie (adresse de suivi)");
    if (!(await envoyer(p, p.getByRole("button", { name: "Suivant" }), "Suivant étape 1"))) return;
    // Étapes 2 à 8 : à relever sur le premier vrai dossier (voir procédure).
    throw new Error("étapes 2 à 8 pas encore programmées");
  } finally { await b.close(); }
}

const actions = { remplir };
try {
  if (!actions[ACTION]) throw new Error("action inconnue");
  await actions[ACTION]();
  log("terminé");
} catch (e) {
  log("ERREUR", e.message);
  try { await etat("erreur", { message: e.message.slice(0, 300) }); } catch {}
  process.exit(1);
}
