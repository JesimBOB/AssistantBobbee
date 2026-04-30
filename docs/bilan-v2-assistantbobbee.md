# Bilan V2 - AssistantBobbee

**Document de travail interne**  
**Objet :** méthode, rythme, périmètre, déploiement, design et stabilité  
**Date :** 30 avril 2026

---

## Période couverte

V2 du portail interne AssistantBobbee, jusqu'à la première mise en ligne Vercel.

## Objet du bilan

Conserver les bonnes pratiques qui ont permis une progression sans accroc.

## Angle retenu

Ce bilan porte sur la méthode et le pilotage de la V2. Les sujets V3 - données, sécurité applicative, vrai assistant - sont volontairement sortis du bilan.

---

## Synthèse courte

La V2 a fonctionné parce que le projet a été conduit comme une suite de petites décisions validables : cadrage explicite, périmètre limité, design lisible, aucune complexité technique ajoutée trop tôt, puis déploiement Vercel simple et testé.

---

## 1. Ce que la V2 a installé

- Une intention produit claire : passer d'un portail d'onboarding à une interface plus incarnée, centrée sur Bobbee et sur une logique de chat.
- Un cadre de travail strict : avant chaque action, expliciter ce qui est visé, exclu, modifié et vérifié.
- Une progression par couches : d'abord les fondations, puis la présence de Bobbee, puis les pages utiles, puis la mise en ligne.
- Un résultat partageable : un site Vercel accessible aux collègues, avec les pages principales testées.

---

## 2. Méthode : les pratiques à conserver

| Bonne pratique | Effet concret |
|---|---|
| Une demande = un objectif | Ne pas mélanger design, architecture, contenu, données et déploiement dans une même intervention. |
| Avant action / après action | Annoncer le périmètre avant d'intervenir, puis résumer les fichiers touchés, les vérifications et les zones préservées. |
| Diff minimal | Modifier le moins de fichiers possible et éviter tout refactoring opportuniste. |
| Sources de cadrage | Garder `PROJECT_CONTEXT`, `AGENTS`, `ENGINEERING_RULES`, `TECH_DECISIONS` et `WORKFLOW_RULES` comme garde-fous. |
| Validation visible | Contrôler le rendu par captures, lecture directe et tests de routes, pas seulement par intuition. |
| Décision explicite | Quand un choix n'est pas tranché, ne pas l'inventer silencieusement : le signaler et prendre l'option minimale. |

---

## 3. Rythme : pourquoi le projet n'a pas dérapé

- Les étapes étaient petites, donc faciles à relire et à annuler.
- Les validations étaient proches de la modification : on évitait les longs tunnels.
- Le périmètre a été protégé : pas de base de données, pas d'API, pas de back-office, pas de dépendance ajoutée sans besoin.
- Le déploiement a été traité comme une étape de publication, pas comme une refonte technique.

---

## 4. Périmètre V2 : ce qui a été visé

| Axe | Réalisation V2 |
|---|---|
| Produit | Une home plus identitaire : Bobbee au centre, chat comme action principale, ton chaleureux et accessible. |
| Pages | Un socle de navigation autour des besoins utiles : accueil, présentation, organigramme, essentiels. |
| Technique | Socle Next.js / App Router / TypeScript / Tailwind / pnpm, sans dépendance additionnelle inutile. |
| Déploiement | Connexion GitHub à Vercel, autorisation limitée au repo AssistantBobbee, déploiement production, test du lien public. |

---

## 5. Design et ergonomie

### Principe ergonomique

L'interface devait être comprise rapidement par des utilisateurs internes : un repère visuel fort, une action principale évidente, peu de bruit autour.

- **Bobbee comme repère :** le personnage donne une identité immédiate et rend l'expérience plus humaine.
- **Chat comme point d'entrée :** l'utilisateur comprend qu'il peut poser une question sans chercher une arborescence complexe.
- **Épuré plutôt que complet :** la V2 ne cherche pas à montrer toutes les fonctions futures. Elle pose une direction lisible.
- **Rassurer sans surcharger :** les contenus autour du chat restent limités pour ne pas diluer l'action principale.

---

## 6. Déploiement : pratiques qui ont bien marché

1. Connecter Vercel au compte GitHub plutôt que créer un projet vide.
2. Autoriser uniquement le repository `AssistantBobbee` dans GitHub App.
3. Laisser Vercel détecter le preset Next.js et conserver les réglages par défaut tant que le build passe.
4. Vérifier le statut `Ready`, puis tester l'URL publique depuis un navigateur et avec un collègue.
5. Distinguer clairement URL publique du site et URL du dashboard Vercel.

---

## 7. Stabilité : ce qu'il faut reproduire

- Ne pas corriger un warning non bloquant au moment où l'objectif principal est atteint.
- Ne pas ajouter une couche technique pour anticiper un besoin futur.
- Toujours fermer une étape quand elle est validée, afin d'éviter le glissement de périmètre.
- Reporter les sujets structurants à la V3 avec un cadrage propre : données, sécurité, API, vrai assistant.

---

## 8. Conclusion opérationnelle

La principale réussite de la V2 n'est pas seulement le rendu final : c'est la manière de travailler. Le projet a avancé parce que les décisions étaient petites, explicites et vérifiables. Cette méthode doit devenir le standard de lancement V3.

---

## Sources internes utilisées

- `PROJECT_CONTEXT.md`
- `AGENTS.md`
- `ENGINEERING_RULES.md`
- `TECH_DECISIONS.md`
- `WORKFLOW_RULES.md`
- `JOUR_2_PLAN_ACTION.md`
- Échanges de mise en ligne Vercel
- Validations utilisateur
