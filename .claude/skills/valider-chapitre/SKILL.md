---
name: valider-chapitre
description: Valider le chapitre en cours, créer une GitHub Release (qui déclenche le build epub), et ouvrir les propositions du chapitre suivant
user-invocable: true
---

## Instructions

Cette skill enchaîne trois actions : validation, release, et ouverture du cycle suivant.

### 1. Vérifier le chapitre en cours

- Identifier le chapitre en `phase:redaction` (via `gh issue list --label "phase:redaction"`)
- Vérifier que son `content.md` et `meta.json` existent et sont complets (titre, résumé, datePublication)
- Si quelque chose manque, le signaler et arrêter

### 2. Créer la GitHub Release

- Déterminer le tag de version :
  - Lister les tags existants via `gh release list`
  - Format : `v0.1.0` pour le prologue, `v0.2.0` pour le chapitre 1, `v0.3.0` pour le chapitre 2, etc.
  - Incrémenter le minor version
- Créer la release via :
  ```bash
  gh release create vX.Y.0 --title "Résonance vX.Y.0 — {titre du chapitre}" --notes "$(cat <<'EOF'
  ## {titre du chapitre}

  {résumé du chapitre depuis meta.json}

  L'epub sera automatiquement généré et attaché à cette release.

  ---
  Licence : CC BY-NC-SA 4.0
  EOF
  )"
  ```
- La création de la release déclenche automatiquement la GitHub Action `build-epub.yml` qui génère et attache l'epub

### 3. Fermer l'issue du chapitre

- Retirer le label `phase:redaction` de l'issue
- Fermer l'issue via `gh issue close`

### 4. Ouvrir les propositions du chapitre suivant

- Exécuter les mêmes étapes que la skill `/ouvrir-propositions` :
  - Déterminer le numéro du prochain chapitre
  - Créer le dossier `chapitres/chapitre-XX/`
  - Créer l'issue GitHub avec le label `phase:propositions`
  - Mettre à jour le `meta.json` avec le numéro de l'issue

### 5. Résumé

Afficher :
- Le tag de la release créée
- Le lien vers la release (l'epub sera disponible dans quelques minutes)
- Le numéro de l'issue ouverte pour le prochain chapitre
