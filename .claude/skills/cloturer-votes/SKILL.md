---
name: cloturer-votes
description: Clôturer les votes et générer un récapitulatif des propositions gagnantes
user-invocable: true
---

## Instructions

1. Trouver l'issue ouverte avec le label `phase:votes` via `gh issue list --label "phase:votes"`.
2. Récupérer tous les commentaires de l'issue via `gh api`.
3. Pour chaque commentaire (proposition), récupérer les réactions via `gh api repos/{owner}/{repo}/issues/comments/{id}/reactions`.
4. Calculer le score net (👍 - 👎) pour chaque proposition.
5. Ignorer les commentaires masqués (minimized).
6. Générer un récapitulatif structuré par catégorie, trié par score décroissant :
   - Pour chaque catégorie : lister les propositions avec leur score, leur auteur·ice et leur description.
   - Mettre en évidence le **top 1** de chaque catégorie.
7. Poster ce récapitulatif comme commentaire sur l'issue.
8. Retirer le label `phase:votes` et ajouter le label `phase:redaction` via `gh issue edit`.
9. Afficher le récapitulatif complet dans la console pour review.
