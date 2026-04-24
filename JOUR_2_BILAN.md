# Jour 2 — Bilan AssistantBobbee

## Objectif du jour

Poser une première home V2 centrée sur Bobbee, avec une interaction de chat locale minimale, sans construire encore le vrai assistant complet.

## Ce qui a été réalisé

- Ajout des trois assets Bobbee dans `public/bobbee/` :
  - `bobbee-idle.png`
  - `bobbee-thinking.png`
  - `bobbee-found.png`
- Affichage de Bobbee sur la home page.
- Ajout d'une micro-animation CSS légère sur l'état idle.
- Ajout d'un shell visuel de chat sous Bobbee.
- Ajout d'une interaction locale minimale :
  - saisie utilisateur
  - affichage du message utilisateur
  - réponse statique de Bobbee
- Connexion des trois états visuels de Bobbee au cycle local du chat :
  - idle au repos
  - thinking pendant le traitement simulé
  - found après réponse
  - retour à idle
- Intégration des données compétences :
  - ajout du fichier brut `data/competences.raw.jsonl`
  - génération du fichier exploitable `data/competences.json`

## Décisions confirmées

- La home n'est pas une page vitrine classique.
- Bobbee est l'élément central de l'interface.
- Le chat est l'interaction principale.
- Le projet continue d'avancer par petites étapes validables.
- Les données restent en fichiers statiques pour l'instant.
- Aucune base de données n'est introduite à ce stade.
- Aucune API n'est créée à ce stade.
- Aucune dépendance supplémentaire n'est ajoutée.

## Points volontairement repoussés

- Correction définitive du fond transparent des images Bobbee.
- Recherche réelle dans les compétences.
- Branchement du chat aux données.
- API ou logique serveur.
- Base de données.
- Back-office.
- Design system.
- Gestion avancée des conversations.

## État Git attendu en fin de journée

Le repo doit être propre :

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

## Prochaine étape recommandée

Faire une première recherche locale très simple dans `data/competences.json`, sans API ni base de données.

Objectif de la prochaine étape :

- lire les compétences statiques
- filtrer localement sur une question simple
- retourner une réponse minimale dans le chat
- garder la logique locale et réversible

## Point de vigilance

Ne pas transformer la prochaine étape en vrai moteur de recherche complet.
La priorité reste : simplicité, stabilité, progressivité.
