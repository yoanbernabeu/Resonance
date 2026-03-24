---
name: ouvrir-propositions
description: Créer l'issue GitHub du prochain chapitre et ouvrir la phase de propositions
user-invocable: true
---

## Instructions

1. Lire tous les fichiers `chapitres/*/meta.json` pour déterminer le numéro du prochain chapitre.
2. Créer un nouveau dossier `chapitres/chapitre-XX/` (avec XX = numéro zéro-padded).
3. Créer un fichier `meta.json` minimal dans ce dossier avec le numéro et le slug, les autres champs seront remplis plus tard.
4. Créer une issue GitHub via `gh issue create` avec :
   - Titre : `Chapitre {N} — Propositions`
   - Body : explication des règles (3 propositions max, catégories disponibles : Personnage, Lieu, Événement, Objet/Artefact, Twist, Lore)
   - Label : `phase:propositions`
5. Si les labels `phase:propositions`, `phase:votes`, `phase:redaction` n'existent pas encore, les créer via `gh label create`.
6. Mettre à jour le `meta.json` avec le numéro de l'issue créée (`issueNumber`).
7. Afficher l'URL de l'issue créée.
