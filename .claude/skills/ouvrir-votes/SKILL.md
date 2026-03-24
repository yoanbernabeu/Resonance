---
name: ouvrir-votes
description: Fermer les propositions et ouvrir la phase de votes sur l'issue du chapitre en cours
user-invocable: true
---

## Instructions

1. Trouver l'issue ouverte avec le label `phase:propositions` via `gh issue list --label "phase:propositions"`.
2. Retirer le label `phase:propositions` et ajouter le label `phase:votes` via `gh issue edit`.
3. Verrouiller l'issue pour empêcher de nouveaux commentaires (mais les réactions restent possibles) via `gh issue lock`.
4. Poster un commentaire sur l'issue annonçant l'ouverture des votes : "Les propositions sont fermées ! Votez maintenant avec 👍 ou 👎 sur les propositions ci-dessus."
5. Afficher un résumé du nombre de propositions reçues.
