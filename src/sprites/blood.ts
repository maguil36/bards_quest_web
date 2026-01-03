export type QuadrantType = 'heart' | 'diamond' | 'spade' | 'club' | 'none';

export interface BloodQuadrantConfig {
  type: 'static';
  svg: string;
  quadrant: QuadrantType;
  targetName?: string;
}

export const bloodQuadrantPaths: Record<QuadrantType, string> = {
  'heart': '/images/blood/heart.svg',
  'diamond': '/images/blood/diamond.svg',
  'spade': '/images/blood/spade.svg',
  'club': '/images/blood/club.svg',
  'none': '/images/blood/none.svg'
};

export const bloodSprite = {
  type: 'static' as const,
  svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><image href="${bloodQuadrantPaths['heart']}" x="0" y="0" width="100" height="100"/></svg>`,
  quadrant: 'heart' as QuadrantType
};

export async function createBloodConfig(
  quadrant: QuadrantType,
  targetName?: string
): Promise<BloodQuadrantConfig> {
  const quadrantPath = bloodQuadrantPaths[quadrant.toLowerCase() as QuadrantType];

  if (!quadrantPath) {
    throw new Error(`Unknown quadrant type: ${quadrant}. Available: ${Object.keys(bloodQuadrantPaths).join(', ')}`);
  }

  return {
    type: 'static',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><image href="${quadrantPath}" x="0" y="0" width="100" height="100"/></svg>`,
    quadrant,
    targetName
  };
}
