# ENGINEERING_RULES.md — AssistantBobbee

## Objet

Ce document définit les règles d’ingénierie à appliquer dans ce repository.

Il complète :

- `AGENTS.md` : cadre strict de comportement
- `PROJECT_CONTEXT.md` : finalité du projet
- `WORKFLOW_RULES.md` : méthode de travail

`ENGINEERING_RULES.md` précise comment écrire, organiser et faire évoluer le code.

---

## 1. Principe général

Le code doit rester :

- simple
- lisible
- local
- progressif
- réversible

On privilégie toujours la solution la plus petite suffisante.

---

## 2. Philosophie de construction

Construire d’abord :

1. une base fonctionnelle
2. un rendu lisible
3. une structure claire
4. une évolution progressive

Ne pas construire trop tôt :

- une architecture trop ambitieuse
- des abstractions prématurées
- des modèles de données spéculatifs
- des composants trop génériques

---

## 3. Règle de simplicité

Avant toute implémentation, toujours préférer :

- une solution locale plutôt qu’un système
- un composant simple plutôt qu’une abstraction
- une donnée statique plutôt qu’un faux moteur
- une structure minimale plutôt qu’une organisation “future-proof”

---

## 4. Politique des fichiers

Créer un nouveau fichier seulement si au moins une de ces conditions est remplie :

- le fichier a une responsabilité claire
- la lisibilité s’améliore réellement
- le code serait trop dense sinon
- la réutilisation est plausible à court terme

Interdits :

- fichiers “au cas où”
- découpage excessif
- multiplication de wrappers inutiles
- réorganisation prématurée

---

## 5. Politique des composants

Un composant doit avoir une responsabilité nette.

Créer un composant si :

- il représente un bloc UI identifiable
- il est réutilisable ou quasi réutilisable
- il améliore clairement la lisibilité
- il évite une complexité locale excessive

Ne pas créer de composant si :

- le bloc est très petit
- il n’est utilisé qu’une fois sans complexité
- l’extraction n’apporte pas de clarté

---

## 6. Taille et granularité

Par défaut :

- garder les composants courts et lisibles
- éviter les fichiers trop longs si une séparation naturelle existe
- éviter aussi les micro-fichiers dispersés

Règle pratique :
- si un bloc peut être compris d’un coup d’œil, le laisser local
- si un bloc demande une vraie lecture séparée, l’extraire

---

## 7. Nommage

Les noms doivent être :

- explicites
- sobres
- cohérents
- orientés métier ou UI réelle

Privilégier :
- `BobbyHero`
- `ChatPanel`
- `OnboardingStepCard`
- `UsefulLinksSection`

Éviter :
- noms vagues
- noms trop abstraits
- sigles non évidents
- noms techniques sans lien avec le rôle réel

---

## 8. Organisation du code

Toujours partir de la structure existante du repo.

Ne pas imposer une architecture nouvelle sans demande explicite.

Par défaut :

- garder les pages dans la structure prévue par le framework
- garder les composants proches de leur usage si cela reste lisible
- extraire seulement les éléments clairement partagés
- éviter les couches artificielles

---

## 9. Politique de logique

La logique doit rester explicite.

Privilégier :

- lecture simple
- conditions lisibles
- transformations courtes
- comportement prévisible

Éviter :

- logique trop indirecte
- helpers en cascade
- abstraction prématurée
- effet “framework maison”

---

## 10. Politique d’état

Toujours choisir le niveau d’état le plus local possible.

Ordre de préférence :

1. état local du composant
2. props simples
3. remontée contrôlée si nécessaire
4. état partagé uniquement si le besoin est réel

Ne pas mettre en place de gestion d’état globale trop tôt.

---

## 11. Politique des données temporaires

Tant qu’aucune base réelle n’est branchée, préférer :

- constantes locales simples
- petits jeux de données lisibles
- structures faciles à remplacer plus tard

Éviter :

- faux repository complexes
- couches de service inutiles
- modèles simulés trop ambitieux

---

## 12. Politique de styles

Les styles doivent rester cohérents et locaux.

Privilégier :

- classes ou styles déjà cohérents avec le repo
- impact visuel local
- sobriété

Éviter :

- refonte globale non demandée
- effets décoratifs gratuits
- variations de style incohérentes
- changement de design “par goût”

---

## 13. Politique responsive

Le responsive doit être conservé ou amélioré seulement si la tâche le demande directement.

Par défaut :

- ne pas casser le responsive existant
- ne pas ouvrir un chantier responsive large pour une retouche locale
- garder les layouts simples

---

## 14. Politique accessibilité

Par défaut, préserver les fondamentaux :

- boutons réels pour actions
- liens réels pour navigation
- textes compréhensibles
- labels quand c’est pertinent
- structure lisible

Ne pas introduire une complexité accessibilité disproportionnée sur une micro-tâche, mais ne jamais dégrader l’existant.

---

## 15. Politique d’erreurs

Quand une fonctionnalité implique un risque d’échec, choisir une gestion simple et visible.

Privilégier :

- message clair
- fallback minimal
- comportement prévisible

Éviter :

- silence complet
- couche de gestion d’erreurs surdimensionnée
- logique défensive excessive trop tôt

---

## 16. Politique des dépendances

Aucune dépendance sans justification forte.

Avant toute proposition d’ajout, l’agent doit expliciter :

1. le besoin précis
2. l’alternative native envisagée
3. le bénéfice concret
4. l’impact sur la maintenance

Par défaut :
- préférer le natif
- préférer l’existant
- préférer la sobriété

---

## 17. Politique pages

Une page doit d’abord être :

- claire
- utilisable
- minimalement propre
- facile à enrichir

La V1 d’une page n’a pas besoin d’être définitive.

Elle doit surtout :
- poser la bonne structure
- éviter les pièges de complexité
- rendre la suite facile

---

## 18. Politique composants métier futurs

Pour les blocs majeurs de la V2, avancer par briques séparées :

- personnage-guide
- panneau de chat
- ressources / contenus
- modules onboarding
- données évolutives

Ne pas fusionner trop tôt plusieurs responsabilités dans un même composant.

---

## 19. Politique chat

Pour le chat, toujours avancer par couches :

1. shell visuel
2. messages d’exemple
3. input local
4. boucle d’échange simple
5. branchement API
6. persistance éventuelle
7. raffinements UX

Interdits :
- construire tout le système final d’un coup
- anticiper toute la mémoire ou l’orchestration dès le départ
- mélanger UI, logique, stockage et prompts dans une seule tâche

---

## 20. Politique prompts / comportement agentique

Tout prompt ou comportement de l’assistant doit être :

- explicite
- minimal au départ
- facile à modifier
- séparé du rendu UI autant que possible

Éviter :

- prompts géants trop tôt
- logique agentique floue
- règles invisibles disséminées partout

---

## 21. Politique base de données

Quand la base sera introduite, partir du schéma minimal utile.

Ordre recommandé :

1. identifier le premier cas d’usage réel
2. définir les entités minimales
3. implémenter le strict nécessaire
4. tester un flux simple
5. élargir ensuite

Éviter :

- tables spéculatives
- schémas “complets” dès le départ
- modélisation de besoins non validés

---

## 22. Politique de persistance

Toute persistance doit répondre à un usage clair.

Ne pas stocker “par principe”.

Avant de persister une donnée, se demander :
- à quoi sert-elle ?
- qui la relit ?
- à quel moment ?
- quel bénéfice concret apporte sa conservation ?

---

## 23. Politique de configuration

La configuration doit rester sobre.

- ne créer que les variables nécessaires
- nommer clairement les variables d’environnement
- éviter les couches de config multiples sans besoin réel
- documenter toute nouvelle config si elle est utile au projet

---

## 24. Politique de commentaires

Les commentaires doivent être rares et utiles.

Autorisé :
- expliquer un choix non évident
- clarifier une contrainte
- signaler un point d’attention réel

Éviter :
- commenter l’évidence
- décrire ligne par ligne ce que fait le code
- laisser des commentaires spéculatifs

---

## 25. Politique de TODO

Les TODO sont autorisés seulement si :

- le point est réellement reporté
- il est concret
- il est court
- il évite une ambiguïté future

Éviter les TODO vagues ou permanents.

---

## 26. Politique de validation technique

La validation doit être proportionnée.

Exemples :
- texte : contrôle local
- style : contrôle visuel local
- composant : vérification de rendu
- logique : test du flux concerné
- structure plus large : build ou lint si pertinent

Ne pas transformer chaque tâche en chantier QA.

---

## 27. Politique de non-régression

Avant de terminer, toujours vérifier mentalement ou explicitement :

- qu’aucune zone non demandée n’a été modifiée
- que l’impact est bien local
- que le changement est réversible
- que la solution n’introduit pas de dette inutile

---

## 28. Politique de proposition technique

Quand l’agent propose une solution technique, il doit proposer :

- une option simple
- un périmètre clair
- un impact limité
- une suite logique

Éviter :
- proposer trois architectures
- ouvrir trop d’options
- lancer un débat technique trop tôt

---

## 29. Règle spéciale AssistantBobbee

Pour ce projet, l’ordre de priorité technique est :

1. clarté
2. stabilité
3. simplicité
4. progressivité
5. évolutivité

L’évolutivité ne doit jamais justifier une complexité prématurée.

---

## 30. Résultat attendu

Un bon résultat technique dans ce repo est :

- lisible
- petit
- utile
- cohérent
- sans surprise
- facile à reprendre ensuite