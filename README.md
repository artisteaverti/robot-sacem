# Robot Sacem — Artiste Averti (Diskelia)

Remplit les dossiers d'adhésion Sacem des clients d'Artiste Averti sur adhesion.sacem.fr.
Dépôt **public** (minutes GitHub Actions gratuites) : il ne contient que du code.
Aucune donnée client ici : tout vient de la base des commandes (API du site, clé `ROBOT_CLE` en secret GitHub).

## Règles
- **Jamais de donnée personnelle dans le journal** (ni nom, ni e-mail, ni téléphone, ni adresse) : seulement l'id de commande et l'étape.
- `DRY_RUN=1` (par défaut) : le robot s'arrête **avant** tout bouton qui envoie quelque chose à la Sacem.
- User-Agent Chrome normal obligatoire (le site ne sert pas son application aux navigateurs « robots »).

## Déclenchement
- `repository_dispatch` (type `sacem`) envoyé par le site/Echo, avec `{ "commande": "<id>", "action": "<action>" }`.
- `workflow_dispatch` à la main (mêmes champs).

## Actions
| action | quand | ce que fait le robot |
|---|---|---|
| `remplir` | après paiement de la commande | crée le dossier avec l'adresse de suivi, remplit les étapes 1 à 8, s'arrête avant la signature, enregistre le n° de suivi |
| `signer` | le client a répondu OK | reprend le dossier (lien reçu sur l'adresse de suivi), coche, demande le code SMS, attend le code (15 min), signe |
| `payer` | après signature | paie les 100 € (carte Diskelia, à définir) |

## État
- 19/11/2026 : squelette. Étape 1 (adresse e-mail) relevée. Les étapes 2 à 10 seront relevées sur le premier vrai dossier (voir procédure dans le projet Claude : `claude/procedure-inscription-sacem.md`).
