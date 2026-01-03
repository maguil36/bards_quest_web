export type EmotionType = 'happy' | 'sad' | 'angry' | 'excited' | 'nervous' | 'calm' | 'confused' | 'determined';

export interface HeartEmotionConfig {
  type: 'emotion';
  emotion: EmotionType | string;
  intensity?: number;
}

export const heartSprite = {
  type: 'emotion' as const,
  emotion: 'calm' as EmotionType,
  intensity: 5
};

export function createHeartConfig(
  emotion: EmotionType | string,
  intensity: number = 5
): HeartEmotionConfig {
  return {
    type: 'emotion',
    emotion,
    intensity
  };
}
