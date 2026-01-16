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
  'Build': '/images/blood/Build.webp',
  'Amber': '/images/blood/Amber.webp',
  'Amethyst': '/images/blood/Amethyst.webp',
  'Artifact': '/images/blood/Artifact.webp',
  'Caulk': '/images/blood/Caulk.webp',
  'Chalk': '/images/blood/Chalk.webp',
  'Cobalt': '/images/blood/Cobalt.webp',
  'Diamond': '/images/blood/Diamond.PNG.webp',
  'Garnet': '/images/blood/Garnet.webp',
  'Gold': '/images/blood/Gold.webp',
  'Iodine': '/images/blood/Iodine.webp',
  'Marble': '/images/blood/Marble.webp',
  'Mercury': '/images/blood/Mercury.webp',
  'Quartz': '/images/blood/Quartz.webp',
  'Ruby': '/images/blood/Ruby.webp',
  'Rust': '/images/blood/Rust.webp',
  'Shale': '/images/blood/Shale.webp',
  'Sulfur': '/images/blood/Sulfur.webp',
  'Tar': '/images/blood/Tar.webp',
  'Uranium': '/images/blood/Uranium.webp',
  'Zillium': '/images/blood/Zillion.webp'
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
