# PROJECT_CONTEXT.md — AssistantBobbee

## Nom du projet

AssistantBobbee

## Finalité

AssistantBobbee est la V2 du portail d’onboarding BOBBEE.

Le projet ne vise pas un simple site vitrine.
Il vise un assistant d’onboarding évolutif, clair et utile, centré sur un personnage-guide et un chat.

## Intention produit

L’expérience cible repose sur 4 piliers :

1. un personnage-guide identifiable
2. un chat d’accompagnement
3. une base de données pour rendre les contenus évolutifs
4. une interface simple, propre et progressive

## Priorités actuelles

Les priorités du projet sont les suivantes :

1. construire une base technique saine
2. éviter les régressions et les modifications parasites
3. avancer par petites étapes validables
4. garder un haut niveau de lisibilité produit
5. préparer une évolution vers un vrai assistant utile

## Contraintes de réalisation

Le projet doit être développé progressivement.
On privilégie :

- la simplicité
- la stabilité
- les changements atomiques
- les composants clairs
- la réversibilité

On évite :

- la sur-ingénierie
- les refontes trop larges
- les abstractions prématurées
- les modifications non demandées
- les dépendances ajoutées trop tôt

## Vision fonctionnelle cible

À terme, AssistantBobbee pourra inclure :

- une page d’accueil incarnée par Bobby
- un chat d’assistance onboarding
- des contenus d’onboarding structurés
- des liens et ressources utiles
- un accès à des informations d’équipe / organisation
- une base de données pour gérer les contenus
- potentiellement un petit back-office d’administration

## Périmètre de travail actuel

Au stade actuel, il faut construire les fondations.
Le projet doit avancer pas à pas.

Cela signifie :

- poser le cadre agent
- poser le contexte projet
- définir ensuite l’architecture minimale
- puis seulement commencer l’implémentation

## Règle de comportement attendue

Si une demande est locale, la réponse doit être locale.
Si une demande est exploratoire, ne pas implémenter trop vite.
Si une architecture n’a pas encore été décidée, ne pas l’inventer silencieusement.

## Important

Le projet est piloté de manière prudente.
Toute intervention doit respecter `AGENTS.md`.

`PROJECT_CONTEXT.md` sert à comprendre la finalité du projet.
`AGENTS.md` sert à cadrer strictement le comportement d’exécution.