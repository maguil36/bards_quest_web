export type QuadrantType = 'heart' | 'diamond' | 'spade' | 'club' | 'none';

export interface HeartQuadrantConfig {
  type: 'static';
  svg: string;
  quadrant: QuadrantType;
  targetName?: string;
}

export const heartQuadrantPaths: Record<QuadrantType, string> = {
  'heart': '/images/heart/heart.svg',
  'diamond': '/images/heart/diamond.svg',
  'spade': '/images/heart/spade.svg',
  'club': '/images/heart/club.svg',
  'none': '/images/heart/none.svg'
};

export const heartSprite = {
  type: 'static' as const,
  svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><image href="${heartQuadrantPaths['heart']}" x="0" y="0" width="100" height="100"/></svg>`,
  quadrant: 'heart' as QuadrantType
};

export async function createHeartConfig(
  quadrant: QuadrantType,
  targetName?: string
): Promise<HeartQuadrantConfig> {
  const quadrantPath = heartQuadrantPaths[quadrant.toLowerCase() as QuadrantType];

  if (!quadrantPath) {
    throw new Error(`Unknown quadrant type: ${quadrant}. Available: ${Object.keys(heartQuadrantPaths).join(', ')}`);
  }

  return {
    type: 'static',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><image href="${quadrantPath}" x="0" y="0" width="100" height="100"/></svg>`,
    quadrant,
    targetName
  };
}
