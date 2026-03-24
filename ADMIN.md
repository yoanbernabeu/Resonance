# Résonance — Guide d'administration

## Setup initial

### 1. GitHub OAuth App

Créer une OAuth App sur [github.com/settings/developers](https://github.com/settings/developers) :

- **Application name :** Résonance
- **Homepage URL :** `https://resonance.histoires.io`
- **Authorization callback URL :** `https://resonance.histoires.io/api/auth/callback`

Récupérer le `Client ID` et générer un `Client Secret`.

### 2. Personal Access Token (PAT)

Créer un PAT sur [github.com/settings/tokens](https://github.com/settings/tokens) avec le scope `public_repo`. Ce token est utilisé côté serveur pour lire les issues sans consommer le rate limit des utilisateur·ice·s.

### 3. Variables d'environnement

Copier `.env.example` en `.env.local` et remplir :

```
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GITHUB_REPO_OWNER=yoanbernabeu
GITHUB_REPO_NAME=Resonance
GITHUB_PAT=ghp_xxx
SITE_URL=https://resonance.histoires.io
```

Configurer les mêmes variables dans Netlify (Site settings → Environment variables).

### 4. DNS

Ajouter un CNAME `resonance.histoires.io` pointant vers le domaine Netlify du site.

### 5. Déploiement

```bash
npm install
npm run build
```

Le déploiement sur Netlify est automatique à chaque push sur `main`.

---

## Cycle de vie d'un chapitre

Chaque chapitre passe par **3 phases**, pilotées par des skills Claude Code. Voici l'ordre exact des commandes à exécuter.

### Phase 1 — Ouvrir les propositions

```
/ouvrir-propositions
```

**Ce que ça fait :**
- Crée une issue GitHub "Chapitre N — Propositions" avec le label `phase:propositions`
- Crée le dossier `chapitres/chapitre-XX/` avec un `meta.json` initial
- Les labels de phase sont créés automatiquement s'ils n'existent pas

**Ensuite :** Communiquer l'ouverture à la communauté. Les contributeur·ice·s soumettent leurs idées via le site (max 3 par personne). Laisser quelques jours.

---

### Phase 2 — Ouvrir les votes

```
/ouvrir-votes
```

**Ce que ça fait :**
- Passe l'issue en `phase:votes`
- Verrouille l'issue (plus de nouveaux commentaires, mais les réactions 👍/👎 restent possibles)
- Poste un commentaire annonçant l'ouverture des votes

**Ensuite :** Laisser la communauté voter quelques jours.

---

### Phase 3 — Clôturer les votes

```
/cloturer-votes
```

**Ce que ça fait :**
- Récupère toutes les propositions et leurs scores (👍 - 👎)
- Génère un récapitulatif par catégorie avec les top propositions
- Poste le récap sur l'issue
- Passe l'issue en `phase:redaction`

**Ensuite :** Relire le récapitulatif avant de passer à la rédaction.

---

### Phase 4 — Rédiger le chapitre

```
/generer-chapitre
```

**Ce que ça fait :**
- Lit le lore (`lore.json`), les chapitres précédents, et les propositions gagnantes
- Rédige le chapitre en respectant le ton Hypérion
- Sauvegarde dans `chapitres/chapitre-XX/content.md` et met à jour `meta.json`

**Ensuite :** Relire, ajuster si nécessaire, puis committer.

---

### Phase 5 — Mettre à jour le lore

```
/maj-lore
```

**Ce que ça fait :**
- Analyse le chapitre qui vient d'être écrit
- Extrait les nouveaux personnages, lieux, factions, événements, artefacts, technologies
- Met à jour `lore.json` sans supprimer les entrées existantes

**Ensuite :** Vérifier les modifications dans `lore.json`, committer et pousser.

---

### Phase 6 — Valider le chapitre et ouvrir le cycle suivant

```
/valider-chapitre
```

**Ce que ça fait :**
- Vérifie que le chapitre est complet (`content.md` et `meta.json`)
- Crée une **GitHub Release** (ex: `v0.2.0 — Le Seuil d'Achéron`)
- La release **déclenche automatiquement** la GitHub Action qui génère l'epub et l'attache comme asset
- L'epub inclut tous les chapitres + la liste des contributeur·ice·s en fin de livre + la licence
- Ferme l'issue du chapitre en cours
- Ouvre l'issue du prochain chapitre avec le label `phase:propositions`

**Ensuite :** Communiquer la publication à la communauté. Le cycle recommence.

---

## Commandes utilitaires

### Récapitulatif des chapitres

```
/recap-chapitres
```

Résume tous les chapitres existants. Utile avant de rédiger un nouveau chapitre quand il y en a beaucoup, pour garder la cohérence narrative.

---

## Interface admin web

L'interface admin est accessible sur `/admin` (réservée au propriétaire du repo). Elle permet de :

- Créer une issue pour un nouveau chapitre
- Passer d'une phase à l'autre via des boutons

Les skills Claude Code sont recommandées car elles font plus de choses (récaps, lock d'issue, etc.), mais l'interface web permet de dépanner rapidement.

---

## Limites et garde-fous

- **3 propositions max par utilisateur·ice par chapitre** — vérifié côté serveur + GitHub Action qui masque les excédentaires
- **Le repo doit être public** pour que les utilisateur·ice·s puissent interagir avec les issues via l'API GitHub
- **Rate limiting GitHub API** — 5000 requêtes/heure avec un token auth, 60/heure sans. Le PAT serveur gère les lectures, les tokens users gèrent les écritures.
- **Le cookie de session expire après 30 jours** — l'utilisateur·ice devra se reconnecter

---

## Structure du projet

```
chapitres/           ← Contenu des chapitres (content.md + meta.json)
lore.json            ← État de l'univers (auto-généré par /maj-lore)
src/
  pages/             ← Pages Astro (accueil, lecture, votes, admin…)
  pages/api/         ← Routes API (auth, propositions, votes, admin)
  lib/               ← Logique métier (github.ts, chapters.ts, lore.ts, auth.ts)
  components/        ← Composants Astro (Header, Footer, badges…)
  layouts/           ← Layouts (Base, Chapter)
.claude/skills/      ← 7 skills Claude Code
.github/workflows/   ← GitHub Actions (limite propositions + build epub)
```
