export const grammarQueryKeys = {
  stats: () => ["grammar", "stats"] as const,
  levels: () => ["grammar", "levels"] as const,
  points: (levelId?: string) => ["grammar", "points", levelId ?? "all"] as const,
};
