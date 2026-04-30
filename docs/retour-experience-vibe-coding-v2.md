# AssistantBobbee V2 - Retour d'expérience Vibe Coding

**Synthèse pour la direction**  
**Sujet :** de l'idée au déploiement par un profil non-développeur  
**Date :** 30 avril 2026

---

## Message clé

La V2 montre qu'un projet web interne peut être prototypé, cadré, validé et mis en ligne par un profil non-développeur grâce au vibe coding, à condition d'être piloté avec une méthode stricte : périmètre clair, petits pas, contrôle humain et déploiement simple.

| Élément | Description |
|---|---|
| Projet | AssistantBobbee - V2 du portail d'onboarding BOBBEE. |
| Résultat | Un portail accessible en ligne, avec une expérience plus incarnée autour de Bobbee et du chat. |
| URL publique | `https://assistant-bobbee.vercel.app` |
| Public visé | Collaborateurs internes et parties prenantes souhaitant tester le parcours. |

---

## 1. Pourquoi ce projet

AssistantBobbee n'a pas été pensé comme un simple site vitrine. L'objectif était de poser les bases d'un assistant d'onboarding : un point d'entrée clair, un personnage-guide identifiable, une interface chaleureuse et une future capacité à répondre aux questions utiles des collaborateurs.

- Faciliter l'orientation dans les informations d'onboarding.
- Rendre l'expérience plus humaine grâce à Bobbee.
- Centraliser progressivement les contenus utiles.
- Préparer une évolution vers un assistant plus intelligent en V3, sans la construire trop tôt.

---

## 2. Ce que la V2 a produit

| Livrable | Valeur apportée |
|---|---|
| Accueil | Une home plus claire, centrée sur Bobbee, avec une interaction principale sous forme de chat. |
| Parcours | Des pages et accès structurants pour guider l'utilisateur : présentation, organigramme, essentiels. |
| Identité | Une expérience plus reconnaissable, chaleureuse et moins technique. |
| Publication | Un déploiement Vercel opérationnel et partageable avec les collègues. |

---

## 3. Les routes validées

| Route | Rôle dans la V2 |
|---|---|
| `/` | Accueil : point d'entrée, Bobbee, chat visuel et navigation principale. |
| `/presentation` | Présentation de Bobbee et de son rôle dans l'onboarding. |
| `/organigramme` | Accès à l'organisation et aux équipes. |
| `/essentiels` | Ressources et informations utiles pour démarrer. |

---

## 4. Méthode de vibe coding utilisée

### Point important

Le vibe coding n'a pas été utilisé comme une génération libre de code. Il a été encadré comme une méthode de pilotage : intentions explicites, contraintes, relecture, validation et déploiement progressif.

1. Cadrer le besoin avant d'agir : objectif, fichiers visés, fichiers exclus, impact attendu, risques.
2. Demander des changements courts et atomiques.
3. Vérifier chaque résultat visuellement et fonctionnellement.
4. Refuser les refontes opportunistes ou les dépendances non nécessaires.
5. Déployer seulement quand le périmètre V2 est stable.

---

## 5. Suivi des grandes étapes

| Étape | Objectif | Action | Validation |
|---|---|---|---|
| 1 | Cadrage | Formaliser le contexte, les règles agent et les décisions techniques initiales. | Sources projet stabilisées. |
| 2 | Direction produit | Positionner Bobbee comme guide et le chat comme action centrale. | Vision home clarifiée. |
| 3 | Construction UI | Créer une interface simple, chaleureuse, sans complexité applicative prématurée. | Contrôle visuel. |
| 4 | Pages utiles | Structurer les accès présentation, organigramme et essentiels. | Navigation testée. |
| 5 | GitHub / Vercel | Relier le repository à Vercel avec accès limité au seul repo. | Deploy `Ready`. |
| 6 | Partage | Tester le lien public avec des collègues. | Accès confirmé. |

---

## 6. Pourquoi les contraintes ergonomiques étaient importantes

Le public cible n'est pas un public technique. L'interface devait donc réduire l'effort de compréhension : un personnage identifiable, une question possible, des accès simples, et une ambiance moins institutionnelle qu'un portail classique.

- **Lisibilité :** l'utilisateur doit comprendre en quelques secondes ce qu'il peut faire.
- **Confiance :** Bobbee rend l'interface plus accueillante et moins administrative.
- **Progressivité :** ne pas afficher trop de fonctions futures pour ne pas créer de fausses attentes.
- **Action unique :** le chat devient l'entrée naturelle, même si la vraie intelligence viendra plus tard.

---

## 7. Ce qui s'est bien passé

| Point fort | Observation |
|---|---|
| Pilotage non-développeur | Le porteur projet a pu exprimer l'intention, arbitrer le rendu, contrôler les risques et conduire la mise en ligne. |
| Collaboration IA | L'assistant a servi d'exécutant cadré, pas de décideur autonome. |
| Qualité du processus | Les prompts sont devenus plus précis, avec une meilleure séparation entre idée, périmètre et validation. |
| Déploiement | La publication a été menée sans intervention lourde : GitHub, Vercel, URL publique et test collègue. |

---

## 8. Progrès observés dans la pratique du vibe coding

- Meilleure capacité à formuler une demande courte et vérifiable.
- Réflexe de cadrer les fichiers touchés et les fichiers exclus.
- Passage d'une logique de génération à une logique de pilotage.
- Meilleure lecture des écrans techniques : GitHub App, Vercel, permissions, lien public, dashboard.
- Capacité à différencier un warning non bloquant d'un problème réel.

---

## 9. Enseignements pour la direction

### Enseignement principal

Le facteur de succès n'est pas seulement l'outil d'IA. C'est la combinaison : intention produit claire, garde-fous, validations humaines et petits incréments.

- Le vibe coding accélère la mise en forme des idées, mais il doit être encadré par des règles de non-régression.
- Un profil non-développeur peut piloter un prototype web s'il sait poser les contraintes, relire et valider.
- La simplicité est un choix de sécurité projet, pas un manque d'ambition.
- La V2 est un bon socle, car elle donne une expérience visible sans engager trop tôt des choix lourds.

---

## 10. Limites volontairement acceptées

| Choix V2 | Raison |
|---|---|
| Pas de vraie IA connectée | La V2 pose le shell et l'expérience ; la logique assistant est gardée pour une étape dédiée. |
| Pas de base de données | Les contenus restent simples tant que le premier cas d'usage data n'est pas tranché. |
| Pas de back-office | L'administration n'est pertinente que lorsque les contenus et rôles seront stabilisés. |
| Pas de surcouche sécurité applicative | Aucune donnée sensible ni espace connecté n'est manipulé à ce stade. |

---

## 11. Conclusion

La V2 valide une méthode autant qu'un produit. Elle montre qu'une démarche de vibe coding peut produire un résultat concret, partageable et stable, même lorsqu'elle est pilotée par une personne non-développeuse. Le point à conserver pour la suite est la discipline : une intention claire, un périmètre court, des validations régulières et des décisions explicites.

Pour la V3, la recommandation est de garder cette méthode et de traiter les sujets structurants - données, sécurité, assistant réel, API - comme des chantiers séparés et priorisés.

---

## Sources internes utilisées

- `PROJECT_CONTEXT.md` - finalité du produit et intention assistant.
- `AGENTS.md` - cadre d'exécution prudent et non-régression.
- `ENGINEERING_RULES.md` - règles de simplicité, dépendances et progressivité.
- `TECH_DECISIONS.md` - socle technique initial.
- `WORKFLOW_RULES.md` - rythme de travail par petites étapes.
- `JOUR_2_PLAN_ACTION.md` - direction visuelle de la home V2.
- Session de déploiement Vercel et tests d'accès collègue.
