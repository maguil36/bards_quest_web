export interface LightTooltipConfig {
  type: 'tooltip';
  hiddenFact: string;
}

export const lightSprite = {
  type: 'tooltip' as const,
  hiddenFact: 'A secret fact'
};

export function createLightConfig(hiddenFact: string): LightTooltipConfig {
  return {
    type: 'tooltip',
    hiddenFact
  };
}
