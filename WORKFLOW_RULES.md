# WORKFLOW_RULES.md — AssistantBobbee

## Objet

Ce document définit la manière dont l’agent doit travailler dans ce repository.

Il complète :

- `AGENTS.md` pour le comportement strict
- `PROJECT_CONTEXT.md` pour la compréhension du projet

`WORKFLOW_RULES.md` définit la méthode de travail concrète.

---

## 1. Principe général

Le projet avance par petites étapes.
Chaque tâche doit être :

- ciblée
- compréhensible
- testable
- réversible
- limitée en périmètre

L’agent ne doit jamais transformer une petite demande en chantier large.

---

## 2. Hiérarchie des interventions

Toujours choisir le niveau d’intervention le plus faible suffisant.

Ordre à respecter :

1. modification de texte
2. ajustement visuel local
3. ajustement de composant local
4. ajout limité de composant
5. création de page simple
6. ajout de logique locale
7. évolution d’architecture uniquement si explicitement demandée

L’agent doit toujours privilégier le plus petit niveau utile.

---

## 3. Une tâche = un objectif

Chaque intervention doit correspondre à un seul objectif principal.

Exemples corrects :

- modifier un libellé
- ajuster un bloc hero
- créer une page d’accueil minimale
- ajouter un composant de chat vide
- brancher une source de données simple

Exemples incorrects :

- refaire toute la home page + optimiser l’architecture
- créer le chat + revoir la navigation + refactorer les composants
- ajouter la base de données + nettoyer la structure du repo

---

## 4. Politique de découpage

Si une demande semble large, l’agent doit naturellement la découper en sous-étapes.

Exemple :

Au lieu de :
- “Je vais créer toute l’architecture du chat”

L’agent doit proposer :
1. créer le shell visuel du chat
2. connecter l’input
3. afficher des messages statiques
4. brancher ensuite une logique réelle
5. brancher ensuite une persistance éventuelle

Le découpage doit réduire le risque.

---

## 5. Politique de création de fichiers

L’agent ne crée un nouveau fichier que si c’est réellement utile.

Avant de créer un fichier, il doit se demander :

- est-ce indispensable ?
- peut-on rester dans la structure déjà présente ?
- ce fichier a-t-il une responsabilité claire ?
- évite-t-on la duplication ?

Créer des fichiers “au cas où” est interdit.

---

## 6. Politique de composants

Un composant ne doit être créé que si au moins une de ces conditions est remplie :

- il a une responsabilité claire
- il améliore nettement la lisibilité
- il sera réutilisé
- il évite une complexité locale excessive

Un composant ne doit pas être extrait trop tôt.

Interdits :

- micro-composants inutiles
- composants créés uniquement “pour faire propre”
- abstractions prématurées

---

## 7. Politique de dépendances

Aucune dépendance ne doit être ajoutée sans raison claire.

Avant d’ajouter une dépendance, l’agent doit expliquer :

1. pourquoi elle est nécessaire
2. quelle alternative native a été considérée
3. quel fichier ou fonctionnalité en dépendra
4. quel est l’impact sur le projet

Par défaut, on préfère :
- les capacités natives
- les dépendances déjà présentes
- les solutions simples

---

## 8. Politique d’architecture

L’agent ne doit jamais inventer une architecture complète sans demande explicite.

Il ne doit pas :

- imposer un pattern
- sur-organiser les dossiers
- introduire une séparation artificielle
- créer une architecture “future-proof” excessive

Il doit partir de l’existant et faire évoluer progressivement.

---

## 9. Politique de style et de design

L’agent doit préserver la cohérence visuelle.

Pour toute intervention UI :

- modifier localement
- conserver le style existant si aucune nouvelle direction n’a été validée
- ne pas “améliorer” le design de sa propre initiative
- ne pas injecter d’effets, animations ou décorations non demandés

---

## 10. Politique de logique métier

L’agent ne doit pas inventer des règles métier absentes.

S’il manque une règle, il doit :

- signaler l’absence
- proposer une implémentation minimale
- éviter toute interprétation métier forte

Par défaut :
- logique simple
- comportement explicite
- hypothèses minimales

---

## 11. Politique de données

Avant d’introduire une structure de données nouvelle, l’agent doit rester simple.

Il doit préférer :

1. données statiques locales
2. structure simple
3. forme facilement remplaçable plus tard
4. zéro complexité prématurée

Tant qu’aucune base réelle n’est branchée, éviter les modèles trop ambitieux.

---

## 12. Politique de pages

Créer une page doit rester simple.

Une nouvelle page doit d’abord être :

- fonctionnelle
- lisible
- minimale
- facile à faire évoluer

La première version d’une page ne doit pas chercher à être définitive.

---

## 13. Politique de chat / agent conversationnel

Pour les fonctionnalités de chat, l’agent doit avancer par couches :

1. shell visuel
2. messages statiques
3. interaction locale simple
4. branchement réel
5. persistance éventuelle
6. enrichissements UX

Il ne doit jamais essayer de construire “le vrai assistant complet” en une seule tâche.

---

## 14. Politique base de données

Pour les sujets base de données, l’agent doit avancer par couches :

1. définir le besoin exact
2. proposer le schéma minimal
3. créer la connexion minimale
4. brancher un premier cas simple
5. valider avant extension

Interdits :

- schémas trop vastes
- tables spéculatives
- modélisation de futurs besoins non validés

---

## 15. Politique de validation

La validation doit être proportionnée à la tâche.

Exemples :
- texte : vérification locale
- composant : build ou lint ciblé si pertinent
- nouvelle page : vérification d’affichage
- logique : test du flux concerné

L’agent ne doit pas surcharger la validation.

---

## 16. Politique de non-régression

À chaque tâche, l’agent doit protéger les zones non concernées.

Il doit explicitement indiquer :

- ce qu’il a modifié
- ce qu’il n’a pas modifié
- pourquoi le reste a été préservé

---

## 17. Politique de proposition

Quand l’agent propose une suite de travail, il doit proposer peu d’options et rester concret.

Bon format :
- prochaine étape minimale
- impact attendu
- périmètre touché

Mauvais format :
- roadmap floue
- liste d’idées trop large
- suggestions non actionnables

---

## 18. Politique de frein

Si la demande est trop large, l’agent doit freiner.

Réponse attendue :

- identifier le noyau minimal faisable
- proposer une première étape
- éviter une implémentation trop vaste
- protéger le repo contre les gros changements non cadrés

---

## 19. Règle spéciale AssistantBobbee

Pour ce projet, l’ordre de priorité est :

1. stabilité
2. lisibilité
3. progressivité
4. cohérence
5. évolutivité

L’évolutivité ne doit jamais dégrader la simplicité immédiate.

---

## 20. Résultat attendu

Une bonne intervention dans ce repo est une intervention :

- petite
- propre
- compréhensible
- vérifiable
- sans surprise
- sans dégâts collatéraux