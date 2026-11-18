# AssistantBobbee

Socle initial de la V2 du portail interne Bobbee.

## Statut

Projet en cours de construction.

À ce stade, le repo contient :
- un socle Next.js minimal
- les règles de gouvernance du repo
- les premières décisions techniques

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

### Actualisation des sujets Jira (chaque mois conseillé)

Alimente la rubrique « Ont travaillé dessus » du chat.

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

### Assistant de recherche Claude

Le projet Claude « Assistant documentation » (recherche dans Confluence, Teams et Outlook) est partagé avec l'organisation et accessible depuis la page Essentiels et le chat (quand Bobbee ne trouve rien). Ses consignes se modifient dans claude.ai, pas dans ce repo.
