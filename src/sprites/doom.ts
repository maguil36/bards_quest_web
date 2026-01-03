export interface DoomInventoryItem {
  name: string;
  code?: string;
}

export interface DoomInventoryConfig {
  type: 'inventory';
  items: DoomInventoryItem[];
  maxSlots?: number;
}

export const doomSprite = {
  type: 'inventory' as const,
  items: [],
  maxSlots: 8
};

export function createDoomConfig(
  items: DoomInventoryItem[],
  maxSlots: number = 8
): DoomInventoryConfig {
  return {
    type: 'inventory',
    items,
    maxSlots
  };
}
