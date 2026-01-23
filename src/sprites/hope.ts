export interface HopeGodTierConfig {
  type: 'godtier';
  characterName: string;
  aspect: string;
  class: string;
}

export const characterAspects: Record<string, string> = {
  'alexis': 'time',
  'austine': 'space',
  'chloe': 'breath',
  'isabell': 'light',
  'nicholas': 'heart',
  'opal': 'mind',
  'tyson': 'hope',
  'victor': 'rage',
  'alice': 'life',
  'audrey': 'doom',
  'clayton': 'blood',
  'irene': 'void',
  'nix': 'time',
  'nix2': 'space',
  'octavian': 'breath',
  'trenton': 'light',
  'vettia': 'heart',
  'okwos': 'mind',
  'gwenhas': 'hope',
  'dhesas': 'rage',
  'redacted': 'void'
};

export const hopeSprite = {
  type: 'godtier' as const,
  characterName: 'Unknown',
  aspect: 'hope',
  class: 'page'
};

export function createHopeConfig(
  pov?: string
): HopeGodTierConfig {
  return {
    type: 'godtier',
    characterName: pov || 'Unknown',
    aspect: pov ? (characterAspects[pov.toLowerCase()] || 'hope') : 'hope',
    class: 'page'
  };
}
