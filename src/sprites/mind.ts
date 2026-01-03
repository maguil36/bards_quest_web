export interface MindTooltipConfig {
  type: 'tooltip';
  mentalState: string;
}

export const mindSprite = {
  type: 'tooltip' as const,
  mentalState: 'focused'
};

export function createMindConfig(mentalState: string): MindTooltipConfig {
  return {
    type: 'tooltip',
    mentalState
  };
}
