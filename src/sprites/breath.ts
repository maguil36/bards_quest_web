import type { SpriteConfig } from '../components/SpriteConfig.astro';

export interface BreathConfig extends SpriteConfig {
  type: 'breath';
  currentLevel: number;
  pov: string;
}

export const characterLevelNames: Record<string, string[]> = {
  alexis: [
    'Greenhorn', 'Novice', 'Amateur', 'Apprentice', 'Neophyte',
    'Dabbler', 'Learner', 'Trainee', 'Recruit', 'Initiate',
    'Student', 'Practitioner', 'Journeyman', 'Adept', 'Expert',
    'Specialist', 'Professional', 'Veteran', 'Master', 'Champion',
    'Hero', 'Legend', 'Paragon', 'Virtuoso', 'Ace',
    'Elite', 'Grandmaster', 'Titan', 'Demigod', 'Immortal',
    'Mythic', 'Legendary', 'Transcendent', 'Ascendant', 'Divine',
    'Celestial', 'Cosmic', 'Universal', 'Omnipotent', 'Eternal',
    'Infinite', 'Absolute', 'Supreme', 'Ultimate', 'Apex',
    'Zenith', 'Pinnacle', 'Acme', 'Culmination', 'Apotheosis'
  ],
  isabell: [
    'Dreamer', 'Wanderer', 'Seeker', 'Explorer', 'Voyager',
    'Pathfinder', 'Trailblazer', 'Pioneer', 'Adventurer', 'Wayfarer',
    'Navigator', 'Scout', 'Ranger', 'Tracker', 'Hunter',
    'Stalker', 'Predator', 'Slayer', 'Warrior', 'Berserker',
    'Champion', 'Conqueror', 'Vanquisher', 'Destroyer', 'Annihilator',
    'Devastator', 'Obliterator', 'Eradicator', 'Exterminator', 'Terminator',
    'Nemesis', 'Scourge', 'Bane', 'Doom', 'Ruin',
    'Cataclysm', 'Apocalypse', 'Armageddon', 'Ragnarok', 'Oblivion',
    'Void', 'Abyss', 'Nihility', 'Entropy', 'Chaos',
    'Pandemonium', 'Maelstrom', 'Tempest', 'Cataclysm', 'Eschaton'
  ],
  irene: [
    'Pickpocket', 'Thief', 'Burglar', 'Rogue', 'Scoundrel',
    'Bandit', 'Outlaw', 'Marauder', 'Pirate', 'Corsair',
    'Raider', 'Plunderer', 'Looter', 'Pillager', 'Brigand',
    'Highwayman', 'Cutthroat', 'Assassin', 'Shadow', 'Phantom',
    'Wraith', 'Specter', 'Ghost', 'Shade', 'Revenant',
    'Nightblade', 'Shadowdancer', 'Voidwalker', 'Darkstrider', 'Umbramancer',
    'Eclipse', 'Nightfall', 'Duskbringer', 'Twilight', 'Eventide',
    'Penumbra', 'Obscura', 'Tenebrous', 'Cimmerian', 'Stygian',
    'Abyssal', 'Nethermancer', 'Voidlord', 'Shadowking', 'Darklord',
    'Nightmaster', 'Umbralich', 'Voidgod', 'Shadowemperor', 'Darkdivine'
  ],
  default: [
    'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5',
    'Level 6', 'Level 7', 'Level 8', 'Level 9', 'Level 10',
    'Level 11', 'Level 12', 'Level 13', 'Level 14', 'Level 15',
    'Level 16', 'Level 17', 'Level 18', 'Level 19', 'Level 20',
    'Level 21', 'Level 22', 'Level 23', 'Level 24', 'Level 25',
    'Level 26', 'Level 27', 'Level 28', 'Level 29', 'Level 30',
    'Level 31', 'Level 32', 'Level 33', 'Level 34', 'Level 35',
    'Level 36', 'Level 37', 'Level 38', 'Level 39', 'Level 40',
    'Level 41', 'Level 42', 'Level 43', 'Level 44', 'Level 45',
    'Level 46', 'Level 47', 'Level 48', 'Level 49', 'Level 50'
  ]
};

const characterLevels: Record<string, number> = {};

export function setCharacterLevel(character: string, level: number): void {
  characterLevels[character.toLowerCase()] = level;
}

export function getCharacterLevel(character: string): number {
  return characterLevels[character.toLowerCase()] || 1;
}

export function getLevelName(character: string, level: number): string {
  const names = characterLevelNames[character.toLowerCase()] || characterLevelNames.default;
  return names[level - 1] || `Level ${level}`;
}

export function createBreathConfig(levelOrPov: number | string, pov?: string): BreathConfig {
  let actualLevel: number;
  let actualPov: string;

  if (typeof levelOrPov === 'string') {
    actualPov = levelOrPov.toLowerCase();
    actualLevel = getCharacterLevel(actualPov);
  } else {
    actualLevel = levelOrPov;
    if (pov) {
      actualPov = pov.toLowerCase();
      setCharacterLevel(actualPov, actualLevel);
    } else {
      actualPov = '';
    }
  }

  return {
    type: 'breath',
    currentLevel: actualLevel,
    pov: actualPov
  };
}

export const breathSprite = (config: BreathConfig): string => {
  return '';
};
