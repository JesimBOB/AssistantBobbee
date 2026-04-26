# Jour 3 — Organigramme ruche

## Objectif

Créer une première base visuelle pour une page dédiée à l’organigramme interne, dans l’univers AssistantBobbee.

L’objectif n’est pas encore de construire un organigramme interactif complet, mais de poser une première version visible, simple et validable.

## Vision produit

L’organigramme cible doit être une page dédiée, accessible depuis la home.

L’idée retenue est une représentation en ruche :

- une grosse alvéole par équipe ;
- le nom de l’équipe au centre ;
- les collaborateurs autour dans des petites alvéoles ;
- nom, prénom et fonction pour chaque collaborateur ;
- code couleur par rôle ;
- sujets de l’équipe affichés sous forme de cartes ou tags séparés.

La page doit rester cohérente avec l’univers Bobbee :

- chaleureuse ;
- lisible ;
- un peu fun ;
- inspirée ruche / abeille ;
- utilisable dans un contexte de boîte informatique.

## Décisions prises

### Page dédiée

Une page `/organigramme` a été créée.

Elle affiche pour l’instant une image concept validée, sans logique interactive.

### Asset validé

L’image concept a été ajoutée dans :

```txt
public/organigramme/organigramme-ruche-concept.png