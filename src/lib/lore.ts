import fs from 'node:fs/promises';
import path from 'node:path';

const LORE_PATH = path.join(process.cwd(), 'lore.json');

export interface LoreData {
  version: number;
  derniereMiseAJour: string;
  epoques: Array<{ nom: string; description: string; statut?: string; duree?: string; anneesEcoulees?: number; chapitre: string }>;
  factions: Array<{ nom: string; statut: string; description: string; chapitre: string }>;
  lieux: Array<{ nom: string; type: string; description: string; chapitre: string }>;
  technologies: Array<{ nom: string; description: string; statut: string; chapitre: string }>;
  personnages: Array<{ nom: string; description: string; chapitre: string }>;
  artefacts: Array<{ nom: string; description: string; chapitre: string }>;
  evenementsCles: Array<{ nom: string; description: string; chapitre: string }>;
}

export async function getLore(): Promise<LoreData> {
  const raw = await fs.readFile(LORE_PATH, 'utf-8');
  return JSON.parse(raw) as LoreData;
}
