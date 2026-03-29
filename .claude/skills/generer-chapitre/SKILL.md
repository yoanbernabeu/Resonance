---
name: generer-chapitre
description: Rédiger le prochain chapitre à partir des propositions gagnantes et du contexte de l'univers
user-invocable: true
---

## Instructions

### Phase 0 — Pré-vol : vérifier que tout le contexte est disponible

Avant toute rédaction, effectuer ces vérifications. **Si un problème est détecté, s'arrêter et proposer de le corriger avant de continuer.**

1. **Chapitres précédents complets** :
   - Pour chaque dossier `chapitres/*/` antérieur au chapitre en cours, vérifier que `content.md` ET `meta.json` existent.
   - Vérifier que chaque `meta.json` a un `titre` et un `resume` non nuls.
   - Si un résumé manque, le générer à partir du `content.md` et mettre à jour le `meta.json`.

2. **Lore à jour** :
   - Lire `lore.json` et vérifier qu'il contient des entrées pour le dernier chapitre publié.
   - Vérifier que le tableau `personnages` n'est pas vide si des personnages ont été introduits dans les chapitres précédents.
   - Si le lore semble incomplet (pas d'entrées liées au dernier chapitre), exécuter `/maj-lore` d'abord.

3. **Récapitulatif narratif** :
   - Exécuter `/recap-chapitres` pour obtenir un résumé structuré de tous les chapitres précédents.
   - Ce récap servira de fil conducteur pour la cohérence narrative.

4. **Propositions gagnantes** :
   - Vérifier que l'issue en `phase:redaction` contient bien le récapitulatif des votes (commentaire avec les résultats).
   - Si absent, recalculer les scores à partir des fichiers `votes/{issueNumber}/*.json`.

5. **Afficher un rapport de pré-vol** résumant :
   - ✅ / ❌ Chapitres précédents complets
   - ✅ / ❌ Lore à jour
   - ✅ / ❌ Récap narratif disponible
   - ✅ / ❌ Propositions gagnantes identifiées
   - Si tout est ✅, demander confirmation à l'utilisateur avant de lancer la rédaction.

---

### Phase 1 — Identification

1. Identifier le chapitre en cours de rédaction :
   - Trouver l'issue avec le label `phase:redaction`
   - Identifier le dossier `chapitres/chapitre-XX/` correspondant

### Phase 2 — Rassembler le contexte

2. Rassembler le contexte :
   - Lire `lore.json` pour l'état de l'univers
   - Lire le récapitulatif des votes (dernier commentaire de l'issue, ou re-calculer les scores)
   - Lire tous les chapitres précédents (`chapitres/*/content.md`) pour la continuité narrative
   - Utiliser le récap généré en phase 0 comme fil conducteur

### Phase 3 — Rédaction

3. Rédiger le chapitre en respectant ces contraintes :
   - **Ton** : style Hypérion (Dan Simmons) — littéraire, contemplatif, philosophique, poétique et brutal
   - **Contrainte principale** : intégrer le top 1 de chaque catégorie votée
   - **Liberté** : piocher dans les autres propositions selon l'inspiration
   - **Écriture inclusive** dans les descriptions hors-narration
   - **Longueur** : un chapitre substantiel et immersif
   - **Cohérence** : respecter le lore établi, les personnages existants et les événements précédents

### Phase 4 — Sauvegarde et validation

4. Sauvegarder le chapitre dans `chapitres/chapitre-XX/content.md`

5. Mettre à jour `chapitres/chapitre-XX/meta.json` avec :
   - `titre` : le titre du chapitre
   - `resume` : un résumé en 2-3 phrases
   - `datePublication` : la date du jour
   - `issueNumber` : le numéro de l'issue

6. Afficher le titre et le résumé pour validation.
