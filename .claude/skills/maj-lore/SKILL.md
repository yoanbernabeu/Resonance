---
name: maj-lore
description: Analyser le dernier chapitre et mettre à jour lore.json avec les nouveaux éléments de l'univers
user-invocable: true
---

## Instructions

1. Identifier le dernier chapitre publié (le plus récent dans `chapitres/*/meta.json` par numéro).

2. Lire le contenu du chapitre (`content.md`).

3. Lire le `lore.json` actuel.

4. Analyser le chapitre pour extraire les éléments nouveaux ou modifiés :
   - **Personnages** : nouveaux personnages introduits, évolutions de personnages existants
   - **Lieux** : nouveaux mondes, stations, endroits mentionnés
   - **Factions** : nouvelles factions ou changement de statut
   - **Technologies** : nouvelles technologies découvertes
   - **Artefacts** : nouveaux artefacts des Bâtisseurs ou autres
   - **Événements clés** : événements importants qui se produisent dans le chapitre
   - **Époques** : mise à jour si pertinent

5. Mettre à jour `lore.json` :
   - **Ajouter** les nouvelles entrées avec `"chapitre": "chapitre-XX"`
   - **Modifier** les entrées existantes si leur statut a changé (ajouter la référence au chapitre)
   - **Ne jamais supprimer** d'entrées existantes
   - Incrémenter le champ `version`
   - Mettre à jour `derniereMiseAJour` avec la date du jour
   - Utiliser l'écriture inclusive dans les descriptions

6. Afficher un résumé des changements apportés au lore.
