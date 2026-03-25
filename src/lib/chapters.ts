import fs from 'node:fs/promises';
import path from 'node:path';
import type { ChapterMeta, Chapter } from './types';

const CHAPTERS_DIR = path.join(process.cwd(), 'chapitres');

export async function getAllChapters(): Promise<ChapterMeta[]> {
  const entries = await fs.readdir(CHAPTERS_DIR, { withFileTypes: true });
  const dirs = entries.filter(e => e.isDirectory());

  const chapters: ChapterMeta[] = [];

  for (const dir of dirs) {
    const metaPath = path.join(CHAPTERS_DIR, dir.name, 'meta.json');
    const contentPath = path.join(CHAPTERS_DIR, dir.name, 'content.md');
    try {
      const raw = await fs.readFile(metaPath, 'utf-8');
      const meta = JSON.parse(raw) as ChapterMeta;
      // Ne retourner que les chapitres publiés (avec titre et contenu)
      if (!meta.titre) continue;
      await fs.access(contentPath);
      chapters.push(meta);
    } catch {
      // skip directories without meta.json or content.md
    }
  }

  return chapters.sort((a, b) => a.numero - b.numero);
}

export async function getChapter(slug: string): Promise<Chapter | null> {
  const chapterDir = path.join(CHAPTERS_DIR, slug);

  try {
    const [metaRaw, content] = await Promise.all([
      fs.readFile(path.join(chapterDir, 'meta.json'), 'utf-8'),
      fs.readFile(path.join(chapterDir, 'content.md'), 'utf-8'),
    ]);

    return {
      meta: JSON.parse(metaRaw) as ChapterMeta,
      content,
    };
  } catch {
    return null;
  }
}
