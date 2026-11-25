# AssistantBobbee

Portail interne Bobbee (V2) pour accueillir les nouveaux arrivants : https://assistant-bobbee.vercel.app

## Statut

Le site est en ligne. Il sert à **découvrir** : parcours d'arrivée (accueil), organigramme, histoire de Bobbee, liens essentiels, et la page « L'assistant Bobbee » qui explique comment paramétrer Claude. Les **questions** se posent dans Claude (voir « Poser une question à Bobbee »).

Le repo contient aussi les règles de gouvernance et les décisions techniques (fichiers `.md` à la racine et dans `docs/`). Elles datent de la construction ; les parties qui parlent d'un chat intégré au site sont dépassées depuis le 24/11/2026.

## Stack

- Next.js
- App Router
- TypeScript
- ESLint
- Tailwind
- pnpm

## Prérequis

- Node.js 20+
- Corepack activé (`corepack enable`)

## Lancement local

```bash
corepack enable
pnpm install
pnpm dev
```

En local, le site demande le mot de passe défini dans `.env.local` (voir « Mot de passe du site »).

## Exploitation : les rituels

Les données du site ne se mettent pas à jour toutes seules. Chaque rituel ci-dessous peut être confié à Claude (Claude Code, dans ce dossier) avec la phrase indiquée.

### Mise à jour de l'organigramme (chaque semaine)

Source qui fait foi : le board Klaxoon « Organigramme MAIDO public ».

1. Dans Klaxoon, dézoomer jusqu'à voir **tout** le board, puis menu du board → **Exporter** → **PDF**.
2. Dire à Claude : *« Mets à jour l'organigramme avec ce PDF »* en joignant le fichier.
3. Commande lancée :

   ```bash
   node scripts/import-organigramme.mjs "<chemin du PDF>"
   ```

   Elle régénère `data/organigramme.json` (lu par le site) et `data/organigramme.csv` (version lisible), et affiche les arrivées, départs et changements de rôle à valider avant de commiter.

La date de l'export est lue dans le nom du fichier (`AAAA-MM-JJ`) et affichée sur la page Organigramme.

**Automatique, chaque lundi à 9 h** (tâche planifiée « Bobbee : mettre à jour l'organigramme depuis Klaxoon » dans l'application Claude) : avec l'extension Claude in Chrome, Claude ouvre le board dans Chrome (session Klaxoon déjà connectée), exécute `scripts/klaxoon-export.js` qui télécharge `klaxoon-organigramme-AAAA-MM-JJ.json` dans Téléchargements, puis lance :

```bash
node scripts/import-organigramme.mjs "<Téléchargements>/klaxoon-organigramme-AAAA-MM-JJ.json"
```

Il montre les changements sans commiter ni pousser. Si Chrome n'est pas ouvert ou que Klaxoon demande une connexion, revenir à l'export PDF ci-dessus.

### Actualisation des sujets Jira (chaque mois conseillé)

Régénère `data/jira-sujets.json`. Depuis le 24/11/2026, plus aucune page du site ne lit ce fichier (l'ancien chat a été retiré) ; il est conservé pour d'éventuels usages côté Claude (skill Bobbee).

La tâche planifiée mensuelle « Bobbee : actualiser les sujets Jira » (le 1er à 9 h) est **en pause depuis le 25/11/2026**, car plus rien ne lit ce fichier ; elle se réactive dans l'application Claude (Tâches planifiées). Manuellement :

1. Dire à Claude : *« Mets à jour les sujets Jira »*.
2. Claude exporte les tickets via le connecteur Atlassian dans un fichier `.ndjson` temporaire (non versionné), une ligne par ticket : `{"key","summary","assignee","resolved"}`. Requête utilisée :

   ```text
   project = MP AND statusCategory = Done AND resolved >= -52w AND assignee is not EMPTY AND (summary ~ "TVA" OR summary ~ "immobilisation" OR summary ~ "immo" OR summary ~ "facturation" OR summary ~ "facture" OR summary ~ "banque" OR summary ~ "bancaire" OR summary ~ "clôture" OR summary ~ "révision" OR summary ~ "liasse" OR summary ~ "\"états financiers\"" OR summary ~ "FEC" OR summary ~ "stock" OR summary ~ "licence" OR summary ~ "offre" OR summary ~ "profil" OR summary ~ "emprunt" OR summary ~ "lettrage" OR summary ~ "OCR" OR summary ~ "IA" OR summary ~ "Chift" OR summary ~ "intégration" OR summary ~ "\"grand livre\"" OR summary ~ "mobile" OR summary ~ "tablette" OR summary ~ "\"crédit bail\"" OR summary ~ "budget" OR summary ~ "prévisionnel" OR summary ~ "analytique" OR summary ~ "\"plan comptable\"" OR summary ~ "fiscal" OR summary ~ "fiscalité" OR summary ~ "fiscale" OR summary ~ "reprise" OR summary ~ "dossier" OR summary ~ "paiement" OR summary ~ "document" OR summary ~ "GED" OR summary ~ "utilisateur" OR summary ~ "droits" OR summary ~ "SAML") ORDER BY key ASC
   ```

3. Commande lancée :

   ```bash
   node scripts/build-jira-sujets.mjs "<export des tickets .ndjson>"
   ```

   Elle régénère `data/jira-sujets.json`. La liste des 25 sujets et leurs mots-clés sont définis en tête du script.

Règles :
- Jira fait foi pour l'orthographe des noms ; l'organigramme indique qui est encore là, son rôle et son pôle.
- Une personne présente dans Jira mais absente de l'organigramme a quitté l'entreprise : elle n'est pas affichée.
- **Mettre à jour l'organigramme avant Jira**, pour que les rôles et départs soient justes.

### Mot de passe du site

Le site entier est protégé par un mot de passe commun (fichier `proxy.ts`), lu dans la variable d'environnement `SITE_PASSWORD`. Sans cette variable, le site reste fermé.

- **En ligne :** Vercel → projet `assistant-bobbee` → menu de gauche **Environment Variables** → `SITE_PASSWORD`. Après un changement, relancer un déploiement (Deployments → dernier déploiement → **Redeploy**).
- **En local :** fichier `.env.local` à la racine (ignoré par Git), contenant `SITE_PASSWORD=...`.
- À la connexion, n'importe quel nom d'utilisateur est accepté : seul le mot de passe compte.

### Mise en ligne et retour arrière

- Tout `git push` sur la branche `main` déclenche une mise en ligne automatique sur Vercel (environ 1 minute) : https://assistant-bobbee.vercel.app
- En cas de problème : Vercel → projet → **Overview** → bouton **Instant Rollback** pour revenir à la version précédente.

### Poser une question à Bobbee (Claude)

Le site ne répond pas lui-même aux questions : il les envoie à Claude. Un projet Claude ne peut pas être partagé entre les organisations Claude de l'entreprise (Isagri R&D 1 à 4, contrainte de l'éditeur confirmée par l'administrateur le 25/11/2026), donc le site n'utilise aucun projet.

- Le champ « Pose ta question » de l'accueil, le bouton « Poser une question » du menu et le bouton de la page `/assistant` ouvrent un **nouveau chat** Claude (`https://claude.ai/new?q=…`) dont le premier message contient un court rappel de consignes, puis la question.
- Ce rappel (rôle, tutoiement, ordre de recherche Confluence puis Teams, Outlook, SharePoint, format de réponse, ne rien inventer) est la constante `BOBBEE_CONTEXT` dans `app/manga.tsx`. La fonction `claudeChatUrl` construit le lien. Pour changer le comportement de l'assistant, c'est là qu'il faut modifier.
- Chaque personne doit **connecter ses propres outils** dans Claude (Atlassian MCP pour Confluence et Jira, Microsoft 365 pour Outlook, Teams et SharePoint). C'est l'étape « Connecter tes outils » de la page `/assistant`, qui est la seule procédure d'installation.
- Le compte Claude est créé automatiquement, 24 à 48 heures après l'arrivée de la personne.
