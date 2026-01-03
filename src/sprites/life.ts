export interface LifeHealthConfig {
  type: 'healthbar';
  currentHealth: number;
  maxHealth: number;
  showNumbers?: boolean;
}

export const lifeSprite = {
  type: 'healthbar' as const,
  currentHealth: 100,
  maxHealth: 100,
  showNumbers: true
};

export function createLifeConfig(
  currentHealth: number,
  maxHealth: number = 100,
  showNumbers: boolean = true
): LifeHealthConfig {
  return {
    type: 'healthbar',
    currentHealth,
    maxHealth,
    showNumbers
  };
}
