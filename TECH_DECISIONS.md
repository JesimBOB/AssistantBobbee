# TECH_DECISIONS.md — AssistantBobbee

## Objet

Ce document fige les premières décisions techniques du projet.

Il ne décrit pas toute l’architecture cible.
Il sert à éviter les décisions implicites ou contradictoires pendant les premières étapes du projet.

Les décisions pourront évoluer, mais uniquement explicitement.

## Décision initiale de socle

Le socle initial retenu pour AssistantBobbee est :
- Next.js
- App Router
- TypeScript
- ESLint
- Tailwind
- pnpm

Aucune base de données n’est introduite à ce stade.
Aucune dépendance additionnelle n’est autorisée à ce stade sans décision explicite.

---

## 1. Statut du projet

AssistantBobbee est un nouveau projet.

Le projet doit être construit proprement dès le départ, sans réutiliser implicitement des choix techniques hérités d’un autre repo.

La V1 peut servir de référence fonctionnelle ou visuelle, mais pas de contrainte structurelle automatique.

---

## 2. Principe de départ

Le projet doit démarrer avec une base technique minimale, lisible et stable.

Priorité actuelle :

1. poser une fondation saine
2. éviter les choix trop tôt
3. avancer par couches
4. garder une forte réversibilité

---

## 3. Framework applicatif

Le projet est pensé pour une application web moderne déployée sur Vercel.

Décision de départ :
- utiliser l’approche standard du framework choisi dans le repo
- éviter toute structure exotique ou personnalisée
- rester au plus proche des conventions natives

Tant qu’aucune contrainte forte n’impose autre chose, les conventions natives priment.

---

## 4. Architecture initiale

Décision de départ :
- démarrer avec une architecture simple
- éviter toute sur-organisation
- ne pas créer trop tôt des couches techniques artificielles

Cela signifie notamment :
- pages simples
- composants locaux si pertinent
- logique locale d’abord
- séparation seulement quand elle devient utile

---

## 5. Stratégie d’implémentation

Le projet sera construit par étapes successives.

Ordre logique privilégié :

1. socle applicatif minimal
2. page d’accueil minimale
3. shell du personnage-guide
4. shell du chat
5. premiers contenus statiques
6. branchement de données simples
7. base de données réelle plus tard
8. enrichissements progressifs

Aucune étape ne doit essayer de “faire le futur” trop tôt.

---

## 6. Position actuelle sur le design

Aucune direction UI détaillée n’est figée à ce stade.

Décision de départ :
- privilégier un rendu simple, propre, lisible
- éviter les effets décoratifs précoces
- ne pas surinvestir l’habillage avant la structure produit

Le design détaillé viendra après les premières bases stables.

---

## 7. Position actuelle sur Bobby

Bobby est un élément important de la vision produit.

Décision de départ :
- Bobby doit être traité comme un futur personnage-guide central
- mais son implémentation initiale doit rester simple
- on ne construit pas tout de suite une expérience complexe autour de lui

Au début, Bobby peut exister comme présence UI minimale avant toute logique avancée.

---

## 8. Position actuelle sur le chat

Le chat est une brique centrale de la V2, mais pas à construire intégralement dès le départ.

Décision de départ :
- commencer par un shell visuel simple
- puis une interaction locale minimale
- puis un branchement réel dans un second temps

Le chat sera construit en couches, pas en one shot.

---

## 9. Position actuelle sur les données

Au départ, les contenus peuvent être statiques si cela permet d’avancer proprement.

Décision de départ :
- ne pas introduire une base de données avant d’avoir un premier besoin concret
- préférer des données simples et remplaçables au début
- préparer l’évolutivité sans surconcevoir

---

## 10. Position actuelle sur la base de données

La base de données est prévue, mais pas encore définie en détail.

Décision de départ :
- ne choisir la solution de persistance qu’au moment où un premier cas réel l’exige
- définir le schéma minimal utile au moment venu
- éviter les tables spéculatives

Aucune modélisation complète n’est attendue à ce stade.

---

## 11. Position actuelle sur l’agent / assistant

L’assistant futur ne doit pas être conçu trop tôt comme un système complexe.

Décision de départ :
- séparer autant que possible UI, logique conversationnelle et données
- éviter les prompts géants dès le début
- construire d’abord une expérience simple, lisible et testable

---

## 12. Dépendances

Décision de départ :
- limiter les dépendances au strict nécessaire
- privilégier le natif et l’existant
- n’ajouter une librairie que pour un besoin concret et justifié

Le confort de développement seul n’est pas une raison suffisante.

---

## 13. Composants

Décision de départ :
- ne créer des composants que lorsqu’ils ont une responsabilité claire
- éviter la fragmentation prématurée
- garder les composants proches de leur usage au début si cela reste lisible

---

## 14. Données et contenu

Décision de départ :
- ne pas détailler tout le contenu métier de la V2 maintenant
- commencer avec des contenus de démonstration minimaux si besoin
- garder les structures de contenu simples et faciles à faire évoluer

---

## 15. Niveau d’ambition immédiat

Décision de départ :
- viser une base sérieuse mais petite
- ne pas chercher à construire un produit complet trop tôt
- protéger la lisibilité et la stabilité avant la richesse fonctionnelle

---

## 16. Décisions explicitement non prises à ce stade

À ce jour, les points suivants ne sont pas encore figés :

- structure détaillée des pages
- architecture détaillée du chat
- solution exacte de base de données
- schéma de données complet
- design system détaillé
- logique conversationnelle complète
- back-office éventuel
- stratégie fine de contenu

L’agent ne doit donc pas inventer ces décisions silencieusement.

---

## 17. Règle de prudence

Si une tâche nécessite de trancher un point non décidé ici, l’agent doit :

1. signaler le point
2. proposer l’option minimale
3. éviter toute généralisation excessive
4. ne pas transformer une absence de décision en architecture lourde

---

## 18. Résultat attendu

Le projet doit évoluer avec des décisions :

- explicites
- petites
- traçables
- réversibles
- cohérentes entre elles