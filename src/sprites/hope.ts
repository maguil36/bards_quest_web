export interface HopeGodTierConfig {
  type: 'godtier';
  characterName: string;
  aspect: string;
  class: string;
}

export const hopeSprite = {
  type: 'godtier' as const,
  characterName: 'Unknown',
  aspect: 'hope',
  class: 'page'
};

export function createHopeConfig(
  characterName: string,
  aspect: string,
  characterClass: string
): HopeGodTierConfig {
  return {
    type: 'godtier',
    characterName,
    aspect,
    class: characterClass
  };
}
