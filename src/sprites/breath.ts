export interface BreathLevelConfig {
  type: 'level';
  currentLevel: number;
  maxLevel: number;
  levelName?: string;
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
