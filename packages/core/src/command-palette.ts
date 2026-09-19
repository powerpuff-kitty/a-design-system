export interface CommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  keywords?: readonly string[];
  disabled?: boolean;
}

export interface RankedCommandPaletteItem<T extends CommandPaletteItem = CommandPaletteItem> {
  item: T;
  score: number;
  index: number;
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function scoreField(field: string, query: string, terms: readonly string[], base: number): number {
  const value = normalize(field);
  if (!value) return 0;
  if (value === query) return base * 5;
  if (value.startsWith(query)) return base * 4;
  if (value.includes(query)) return base * 3;

  let score = 0;
  for (const term of terms) {
    if (value.startsWith(term)) score += base * 2;
    else if (value.includes(term)) score += base;
  }
  return score;
}

export function rankCommandPaletteItems<T extends CommandPaletteItem>(
  items: readonly T[],
  rawQuery: string,
): RankedCommandPaletteItem<T>[] {
  const query = normalize(rawQuery);
  if (!query) return items.map((item, index) => ({ item, score: 0, index }));

  const terms = query.split(/\s+/).filter(Boolean);
  return items
    .map((item, index): RankedCommandPaletteItem<T> | null => {
      const label = scoreField(item.label, query, terms, 100);
      const keywords = (item.keywords ?? []).reduce(
        (total, keyword) => total + scoreField(keyword, query, terms, 35),
        0,
      );
      const description = scoreField(item.description ?? '', query, terms, 10);
      const haystack = normalize([item.label, item.description ?? '', ...(item.keywords ?? [])].join(' '));
      if (!terms.every((term) => haystack.includes(term))) return null;
      return { item, score: label + keywords + description, index };
    })
    .filter((entry): entry is RankedCommandPaletteItem<T> => Boolean(entry))
    .sort((a, b) => b.score - a.score || a.index - b.index);
}
