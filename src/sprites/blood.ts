export type GristType =
  | 'Build'
  | 'Amber'
  | 'Amethyst'
  | 'Artifact'
  | 'Caulk'
  | 'Chalk'
  | 'Cobalt'
  | 'Diamond'
  | 'Garnet'
  | 'Gold'
  | 'Iodine'
  | 'Marble'
  | 'Mercury'
  | 'Quartz'
  | 'Ruby'
  | 'Rust'
  | 'Shale'
  | 'Sulfur'
  | 'Tar'
  | 'Uranium'
  | 'Zillium';

export const gristOrder: GristType[] = [
  'Build',
  'Amber',
  'Amethyst',
  'Artifact',
  'Caulk',
  'Chalk',
  'Cobalt',
  'Diamond',
  'Garnet',
  'Gold',
  'Iodine',
  'Marble',
  'Mercury',
  'Quartz',
  'Ruby',
  'Rust',
  'Shale',
  'Sulfur',
  'Tar',
  'Uranium',
  'Zillium'
];

export const gristIconPaths: Record<GristType, string> = {
  'Build': '/images/blood/build.png',
  'Amber': '/images/blood/amber.png',
  'Amethyst': '/images/blood/amethyst.png',
  'Artifact': '/images/blood/artifact.png',
  'Caulk': '/images/blood/caulk.png',
  'Chalk': '/images/blood/chalk.png',
  'Cobalt': '/images/blood/cobalt.png',
  'Diamond': '/images/blood/diamond.png',
  'Garnet': '/images/blood/garnet.png',
  'Gold': '/images/blood/gold.png',
  'Iodine': '/images/blood/iodine.png',
  'Marble': '/images/blood/marble.png',
  'Mercury': '/images/blood/mercury.png',
  'Quartz': '/images/blood/quartz.png',
  'Ruby': '/images/blood/ruby.png',
  'Rust': '/images/blood/rust.png',
  'Shale': '/images/blood/shale.png',
  'Sulfur': '/images/blood/sulfur.png',
  'Tar': '/images/blood/tar.png',
  'Uranium': '/images/blood/uranium.png',
  'Zillium': '/images/blood/zillium.png'
};

export interface GristDelta {
  [gristType: string]: number;
}

export interface PageGristConfig {
  character: string;
  pageNumber: number;
  deltas: GristDelta;
}

export interface BloodGristConfig {
  type: 'grist';
  character: string;
  pageNumber: number;
  deltas: GristDelta;
}

const characterGristInventory: Map<string, Map<number, GristDelta>> = new Map();

export function setPageGrist(character: string, pageNumber: number, deltas: GristDelta): void {
  if (!characterGristInventory.has(character)) {
    characterGristInventory.set(character, new Map());
  }
  characterGristInventory.get(character)!.set(pageNumber, deltas);
}

export function getCharacterGristAtPage(character: string, pageNumber: number): Record<GristType, number> {
  const inventory: Record<string, number> = {};

  if (!characterGristInventory.has(character)) {
    return inventory as Record<GristType, number>;
  }

  const characterPages = characterGristInventory.get(character)!;
  const sortedPages = Array.from(characterPages.keys()).sort((a, b) => a - b);

  for (const page of sortedPages) {
    if (page > pageNumber) break;

    const deltas = characterPages.get(page)!;
    for (const [gristType, amount] of Object.entries(deltas)) {
      inventory[gristType] = (inventory[gristType] || 0) + amount;
    }
  }

  return inventory as Record<GristType, number>;
}

export function createBloodConfig(
  pageNumber: number,
  deltas: GristDelta,
  character?: string
): BloodGristConfig {
  return {
    type: 'grist',
    character: character || '',
    pageNumber,
    deltas
  };
}

export const bloodSprite = {
  type: 'grist' as const,
  character: '',
  pageNumber: 0,
  deltas: {}
};
