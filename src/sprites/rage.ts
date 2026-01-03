export interface RageSpecibusConfig {
  type: 'static';
  svg: string;
  weaponType: string;
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

export const rageSprite = {
  type: 'static' as const,
  svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><image href="${rageWeaponPaths['sword']}" x="0" y="0" width="100" height="100"/></svg>`,
  weaponType: 'sword'
};

export async function createRageConfig(
  weaponType: string,
  weaponName?: string
): Promise<RageSpecibusConfig> {
  const weaponPath = rageWeaponPaths[weaponType.toLowerCase()];

  if (!weaponPath) {
    throw new Error(`Unknown weapon type: ${weaponType}. Available: ${Object.keys(rageWeaponPaths).join(', ')}`);
  }

  return {
    type: 'static',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><image href="${weaponPath}" x="0" y="0" width="100" height="100"/></svg>`,
    weaponType,
    weaponName
  };
}
