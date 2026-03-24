---
name: generer-chapitre
description: Rédiger le prochain chapitre à partir des propositions gagnantes et du contexte de l'univers
user-invocable: true
---

## Instructions

1. Identifier le chapitre en cours de rédaction :
   - Trouver l'issue avec le label `phase:redaction`
   - Identifier le dossier `chapitres/chapitre-XX/` correspondant

2. Rassembler le contexte :
   - Lire `lore.json` pour l'état de l'univers
   - Lire le récapitulatif des votes (dernier commentaire de l'issue, ou re-calculer les scores)
   - Lire tous les chapitres précédents (`chapitres/*/content.md`) pour la continuité narrative
   - Si beaucoup de chapitres existent, utiliser `/recap-chapitres` d'abord

3. Rédiger le chapitre en respectant ces contraintes :
   - **Ton** : style Hypérion (Dan Simmons) — littéraire, contemplatif, philosophique, poétique et brutal
   - **Contrainte principale** : intégrer le top 1 de chaque catégorie votée
   - **Liberté** : piocher dans les autres propositions selon l'inspiration
   - **Écriture inclusive** dans les descriptions hors-narration
   - **Longueur** : un chapitre substantiel et immersif
   - **Cohérence** : respecter le lore établi et les événements précédents

4. Sauvegarder le chapitre dans `chapitres/chapitre-XX/content.md`

5. Mettre à jour `chapitres/chapitre-XX/meta.json` avec :
   - `titre` : le titre du chapitre
   - `resume` : un résumé en 2-3 phrases
   - `datePublication` : la date du jour
   - `issueNumber` : le numéro de l'issue

6. Afficher le titre et le résumé pour validation.
