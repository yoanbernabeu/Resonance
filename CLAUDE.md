# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

**Résonance** — Roman de science-fiction collaboratif assisté par IA. La communauté propose des idées, vote, puis l'IA rédige le chapitre à partir des propositions gagnantes. Univers inspiré d'Hypérion (Dan Simmons).

- **Site :** resonance.histoires.io
- **Licence :** CC BY-NC-SA 4.0
- **Langue :** Tout en français (UI, contenu, commentaires, noms de variables)

## Commandes

```bash
npm run dev       # Serveur de développement Astro (SSR)
npm run build     # Build production (Netlify adapter)
npm run preview   # Prévisualisation du build
```

Pas de tests unitaires ni de linter configurés.

## Stack technique

- **Astro 6** en mode SSR (adapter Netlify, Node 22)
- **Tailwind CSS 4** (via plugin Vite `@tailwindcss/vite`)
- **TypeScript** strict (alias `@/*` → `./src/*`)
- **@octokit/rest** pour l'API GitHub
- **marked** pour le rendu Markdown
- **Pandoc** pour la génération EPUB (GitHub Actions)

## Architecture : GitHub-as-Backend

Aucune base de données. Tout repose sur l'API GitHub :

- **1 issue GitHub = 1 chapitre** (labels `phase:propositions`, `phase:votes`, `phase:redaction`)
- **1 commentaire = 1 proposition** (format : `**[Catégorie]** description`)
- **Réactions = votes** (👍 upvote, 👎 downvote, score = 👍 - 👎)
- **PAT serveur** pour les lectures API (5000 req/h), **tokens utilisateurs** pour les écritures
- **GitHub OAuth** pour l'authentification (cookie session, expiration 30 jours)

## Cycle de vie d'un chapitre (7 skills)

Chaque chapitre traverse 3 phases pilotées par des skills Claude Code dans `.claude/skills/` :

1. `/ouvrir-propositions` — Crée l'issue GitHub, ouvre la phase propositions
2. `/ouvrir-votes` — Verrouille l'issue, passe en phase votes
3. `/cloturer-votes` — Calcule les scores, génère le récap des gagnantes
4. `/generer-chapitre` — Rédige le chapitre à partir du lore + propositions gagnantes
5. `/maj-lore` — Extrait les nouveaux éléments d'univers vers `lore.json`
6. `/valider-chapitre` — Crée la GitHub Release (déclenche le build EPUB), ouvre le cycle suivant
7. `/recap-chapitres` — Résume tous les chapitres (utile comme contexte avant rédaction)

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `src/lib/github.ts` | Toute la logique d'interaction API GitHub (propositions, votes, issues) |
| `src/lib/chapters.ts` | Lecture des chapitres depuis le filesystem |
| `src/lib/phase.ts` | Détection de la phase active |
| `src/lib/types.ts` | Interfaces TypeScript (Chapter, Proposal, Phase, etc.) |
| `src/lib/auth.ts` | Utilitaires d'authentification |
| `src/lib/lore.ts` | Utilitaires pour lore.json |
| `src/middleware.ts` | Parsing de la session depuis les cookies |
| `lore.json` | État de l'univers (factions, lieux, personnages, événements) |
| `chapitres/*/content.md` | Contenu Markdown des chapitres |
| `chapitres/*/meta.json` | Métadonnées (titre, numéro, résumé, numéro d'issue) |

## Routes API

- `api/auth/login|callback|logout` — Flux OAuth GitHub
- `api/proposals/submit` — Soumission de proposition (vérification limite 3/user/chapitre)
- `api/votes/upvote|downvote` — Ajout de réaction sur un commentaire
- `api/admin/phase` — Création d'issue ou transition de phase (réservé au propriétaire du repo)

## Conventions

- **Nommage des chapitres :** `prologue`, `chapitre-01`, `chapitre-02`, etc.
- **Commits :** préfixes emoji (✨ nouveau, 🔧 fix/config, 🎨 design)
- **Styles :** Tailwind utility classes uniquement, pas de composants CSS custom
- **Interactivité :** Vanilla JS dans les composants Astro (pas de framework frontend)
- **Design :** fond `#0c0e1a`, accent `#00d4aa`, polices Geist (UI) et Newsreader (lecture)

## Variables d'environnement

Voir `.env.example`. Configurer dans `.env.local` (dev) et Netlify (prod) :
`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME`, `GITHUB_PAT`, `SITE_URL`

## Garde-fous

- 3 propositions max par utilisateur par chapitre (vérification côté serveur dans `/api/proposals/submit`)
- Le repo GitHub source doit être public (interactions issues via API)
- L'admin (`/admin`) est restreint au propriétaire du repo (`GITHUB_REPO_OWNER`)
