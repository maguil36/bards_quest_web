export interface RageSpecibusConfig {
  type: 'static';
  svg: string;
  weaponName?: string;
}

export const rageWeaponPaths: Record<string, string> = {
  'sword': '/images/rage/sword.svg',
  'hammer': '/images/rage/hammer.svg',
  'spear': '/images/rage/spear.svg',
  'bow': '/images/rage/bow.svg',
  'axe': '/images/rage/axe.svg',
  'mace': '/images/rage/mace.svg',
  'staff': '/images/rage/staff.svg',
  'dagger': '/images/rage/dagger.svg'
};

export const characterWeapons: Record<string, string> = {
  'alexis': 'dagger',
  'austine': 'hammer',
  'chloe': 'spear',
  'isabell': 'bow',
  'nicholas': 'axe',
  'opal': 'mace',
  'tyson': 'staff',
  'victor': 'dagger',
  'alice': 'sword',
  'audrey': 'hammer',
  'clayton': 'spear',
  'irene': 'bow',
  'nix': 'axe',
  'nix2': 'mace',
  'octavian': 'staff',
  'trenton': 'dagger',
  'vettia': 'sword',
  'okwos': 'hammer',
  'gwenhas': 'spear',
  'dhesas': 'bow',
  'redacted': 'sword'
};

export const rageSprite = {
  type: 'static' as const,
  svg: '',
  weaponName: ''
};

export function createRageConfig(
  weaponName?: string
): RageSpecibusConfig {
  return {
    type: 'static',
    svg: '',
    weaponName
  };
}
