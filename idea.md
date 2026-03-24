# Résonance — Cadrage du Projet

## Concept

**Une expérience d'écriture collective assistée par IA.** Projet collaboratif avec la communauté (YoanDev YouTube, Yoan Bernabeu Twitter/LinkedIn). Une app web pour co-construire un univers, un lore et une histoire de manière participative. La rédaction des chapitres est réalisée avec l'aide de Claude Code (IA), à partir des idées proposées et votées par les contributeur·ice·s.

**GitHub as a Backend** : les issues et réactions GitHub servent de base de données pour les propositions et les votes.

**Livrable final :** un epub versionné, enrichi chapitre après chapitre (build incrémental).

> **Note importante :** Ce projet est une expérience créative et communautaire. Il ne remplace en rien le travail des auteur·ice·s. Nous encourageons vivement les contributeur·ice·s à lire et soutenir de vrais auteur·ice·s de science-fiction et de fantasy.

## Format

- **Chapitres** publiés au fil de l'eau, au rythme des contributions de la communauté
- **Rédaction assistée par IA** via Claude Code (skills dédiées pour chaque étape du workflow)
- Un **prologue** écrit en amont pose les bases de l'univers (sans personnages)

## Genre & Ton

- **Sci-fi dominante** avec une légère touche de **fantasy**
- Ton **style Hypérion** (Dan Simmons) : littéraire, contemplatif, philosophique, poétique et brutal

## Univers (Lore)

### Époque & Cadre
- Futur lointain (~3000+), humanité interstellaire
- L'histoire se déroule dans **la Lisière** : systèmes périphériques semi-anarchiques

### Les Bâtisseurs
- Civilisation alien **disparue**, aucune trace de leur apparence
- Ruines et artefacts mystérieux découverts sur de nombreux mondes
- Leur technologie semble encore "active" par résonance

### Les Éveillés
- Humains ayant **évolué** avec des capacités extraordinaires (perception, télékinésie, télépathie…)
- Apparition liée à la proximité des vestiges des Bâtisseurs
- **Craints et persécutés**, vivent cachés

### L'Hégémonie Solaire
- Ancien empire unifié (37 systèmes, 200 mondes habités)
- **Effondré il y a ~53 ans** (la Fracture) à cause de la peur des Éveillés
- Décrets de Containment → purges → guerre civile → effondrement

### Les Veines
- Réseau de transit supraluminique entre les systèmes
- Partiellement détruit/instable depuis la Fracture

## Stack Technique

- **Frontend :** Astro + Tailwind (design sci-fi sombre, lisible, épuré)
- **Backend :** GitHub Issues & Reactions (API GitHub)
- **Auth :** GitHub OAuth
- **Déploiement :** Netlify (sous-domaine de histoires.io)
- **Repo :** public, open source (un seul repo pour le code + les issues)
- **Epub :** build automatique via GitHub Action à chaque Release (Pandoc), attaché comme asset de release
- **Licence :** CC BY-NC-SA 4.0 (code et contenu)

## Architecture GitHub

### Stockage des chapitres
```
/chapitres
  /prologue
    content.md    ← le texte
    meta.json     ← titre, résumé, date de publication, numéro
  /chapitre-01
    content.md
    meta.json
  ...
```

### Issues comme backend
- **Une issue par chapitre** (ex: "Chapitre 1 — Propositions")
- Chaque **commentaire** = une proposition (format structuré avec catégorie)
- Les **réactions** 👍/👎 sur les commentaires = les votes (score net)
- La **phase** est contrôlée par un label sur l'issue (`phase:propositions`, `phase:votes`, `phase:redaction`)

### Catégories de propositions
- **Personnage** — un nouveau personnage ou trait de personnage
- **Lieu** — un monde, une station, un endroit
- **Événement** — quelque chose qui se passe dans l'histoire
- **Objet/Artefact** — un objet, une technologie, un vestige
- **Twist** — un retournement, une révélation
- **Lore** — un élément d'univers, d'histoire ou de contexte

### Limite de propositions
- **3 propositions max par utilisateur par chapitre**
- GitHub Action déclenchée sur `issue_comment.created` : si un utilisateur dépasse 3 propositions, les excédentaires reçoivent un label `hors-limite`
- Le front ignore les propositions avec ce label

## Flow Participatif (par chapitre)

### Phase 1 — Propositions
- L'issue du chapitre est ouverte avec le label `phase:propositions`
- Les utilisateurs soumettent via le front (formulaire avec choix de catégorie)
- Le commentaire GitHub est formaté : `[catégorie] description`

### Phase 2 — Votes
- Les propositions sont fermées, label `phase:votes`
- La communauté upvote/downvote (👍/👎) les propositions existantes
- Score net = 👍 - 👎

### Phase 3 — Rédaction
- Les votes sont fermés, label `phase:redaction`
- Rédaction via Claude Code avec les top propositions comme contraintes
- Publication du chapitre → nouveau cycle

## Skills Claude Code

| Skill | Description |
|-------|-------------|
| `/ouvrir-propositions` | Crée l'issue du chapitre, met le label `phase:propositions` |
| `/ouvrir-votes` | Ferme les propositions, passe en `phase:votes` |
| `/cloturer-votes` | Ferme les votes, génère un récap des top propositions |
| `/generer-chapitre` | Récupère les propositions gagnantes, écrit le chapitre |
| `/maj-lore` | Analyse le chapitre validé, met à jour le lore automatiquement |
| `/recap-chapitres` | Résume les événements clés de tous les chapitres (contexte pour écriture) |
| `/valider-chapitre` | Valide le chapitre, crée une GitHub Release (→ build epub auto), ouvre le cycle suivant |

Toutes les skills sont lancées manuellement. Le build de l'epub est automatisé via GitHub Action (déclenché par la Release).

## Pages de l'App

1. **Accueil** — présentation du projet, ambiance immersive, accès aux chapitres publiés
2. **Lecture** — chapitres en markdown rendus en HTML, table des matières, navigation chapitre par chapitre
3. **Propositions** — formulaire de soumission avec catégorie (auth GitHub requise)
4. **Votes** — propositions affichées par catégorie, système upvote/downvote (auth GitHub requise)
5. **Timeline / Lore** — récap de l'univers généré automatiquement, enrichi à chaque chapitre
6. **Profil** — "mes propositions" et "mes votes"
7. **Admin** — interface pour changer les phases (boutons pour passer d'une phase à l'autre)
8. **Téléchargement** — epub versionné en téléchargement

