# AudioBook Communautaire — Idées & Cadrage

## Concept

Projet collaboratif avec la communauté (YoanDev YouTube, Yoan Bernabeu Twitter/LinkedIn).
Une app web pour co-construire un univers, un lore et une histoire de manière participative.

**Livrable final :** un epub d'environ 100 pages + une version audiolivre (ElevenLabs).

## Format

- **8 chapitres** de ~5 000 mots (~10-12 pages chacun)
- **Rythme hebdomadaire**, durée totale : **2 mois**
- **Rédaction via Claude Code**
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

- **Frontend :** Astro
- **Backend / BDD :** Supabase
- **Auth :** GitHub uniquement
- **Projet privé** (pas open source)

## Flow Participatif (par chapitre)

### Phase 1 — Propositions (jours 1-3)
- Les utilisateurs soumettent des idées (personnage, événement, twist, lieu, objet…)
- Chaque proposition est catégorisée

### Phase 2 — Votes (jours 4-5)
- La communauté upvote/downvote les propositions
- Les meilleures remontent

### Phase 3 — Génération (jours 6-7)
- Rédaction via Claude Code avec le **top 1 élément majeur** comme contrainte + pioche libre dans les autres
- Review et ajustements
- Publication → nouveau cycle

## Pages de l'App

1. **Accueil** — présentation du projet + chapitres publiés
2. **Chapitre** — lecture du dernier chapitre
3. **Vote** — propositions de la communauté avec système de vote
4. **Suggestions** — formulaire pour soumettre des idées
5. **Timeline / Lore** — récap de l'univers qui se construit au fil des chapitres

## Budget Audiolivre

- ~540 000 caractères pour 10h d'audio
- **ElevenLabs Plan Pro** (99 $/mois) + overage (~10 $) = **~109 $**
