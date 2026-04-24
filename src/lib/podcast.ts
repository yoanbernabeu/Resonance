export interface PodcastEpisode {
  title: string;
  audioUrl: string;
  pubDate: string;
  duration: string;
  description: string;
  guid: string;
  episodeNumber: number | null;
}

const FEED_URL = 'https://anchor.fm/s/111d8ce14/podcast/rss';

function cleanCdata(s: string | undefined | null): string {
  if (!s) return '';
  return s.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function stripHtml(s: string): string {
  return decodeEntities(s.replace(/<[^>]*>/g, '')).trim();
}

export async function getPodcastEpisodes(): Promise<PodcastEpisode[]> {
  try {
    const res = await fetch(FEED_URL, { headers: { 'User-Agent': 'Resonance/1.0' } });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    return items.map((m) => {
      const body = m[1];
      const title = cleanCdata(body.match(/<title>([\s\S]*?)<\/title>/)?.[1]);
      const description = stripHtml(cleanCdata(body.match(/<description>([\s\S]*?)<\/description>/)?.[1]));
      const audioUrl = body.match(/<enclosure[^>]+url="([^"]+)"/)?.[1] || '';
      const pubDate = body.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1]?.trim() || '';
      const duration = body.match(/<itunes:duration>([^<]+)<\/itunes:duration>/)?.[1]?.trim() || '';
      const guid = body.match(/<guid[^>]*>([^<]+)<\/guid>/)?.[1]?.trim() || '';
      const epNum = body.match(/<itunes:episode>(\d+)<\/itunes:episode>/)?.[1];
      return {
        title,
        description,
        audioUrl,
        pubDate,
        duration,
        guid,
        episodeNumber: epNum ? Number(epNum) : null,
      };
    });
  } catch {
    return [];
  }
}

export function formatPubDate(pubDate: string): string {
  try {
    const d = new Date(pubDate);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return pubDate;
  }
}
