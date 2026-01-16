export interface BreathLevelConfig {
  type: 'level';
  currentLevel: number;
  maxLevel: number;
  levelName?: string;
}

const characterLevels: Map<string, Map<number, number>> = new Map();

export function setCharacterLevel(character: string, pageNumber: number, level: number): void {
  if (!characterLevels.has(character)) {
    characterLevels.set(character, new Map());
  }
  characterLevels.get(character)!.set(pageNumber, level);
}

export function getCharacterLevel(character: string, pageNumber: number): number {
  if (!characterLevels.has(character)) {
    return 1;
  }

  const levels = characterLevels.get(character)!;
  const sortedPages = Array.from(levels.keys()).sort((a, b) => a - b);

  let currentLevel = 1;
  for (const page of sortedPages) {
    if (page > pageNumber) break;
    currentLevel = levels.get(page)!;
  }

  return currentLevel;
}

export const breathSprite = {
  type: 'level' as const,
  currentLevel: 1,
  maxLevel: 10
};

export function createBreathConfig(
  currentLevel: number,
  maxLevel: number = 10,
  levelName?: string
): BreathLevelConfig {
  return {
    type: 'level',
    currentLevel,
    maxLevel,
    levelName
  };
}
