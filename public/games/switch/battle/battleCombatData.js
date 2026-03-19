const CHARACTER_STATS = {
  opal: {
    hp: 345,
    maxHp: 345,
    attack: 214,
    defense: 280,
    specialAttack: 280,
    specialDefense: 250,
    speed: 220,
    level: 100
  },
  alexis: {
    hp: 358,
    maxHp: 358,
    attack: 439,
    defense: 270,
    specialAttack: 279,
    specialDefense: 202,
    speed: 306,
    level: 100
  },
  tyson: {
    hp: 331,
    maxHp: 331,
    attack: 199,
    defense: 396,
    specialAttack: 296,
    specialDefense: 224,
    speed: 174,
    level: 100
  },
  chloe: {
    hp: 342,
    maxHp: 342,
    attack: 222,
    defense: 244,
    specialAttack: 237,
    specialDefense: 250,
    speed: 172,
    level: 98
  },
  isabela: {
    hp: 295,
    maxHp: 295,
    attack: 288,
    defense: 214,
    specialAttack: 291,
    specialDefense: 167,
    speed: 243,
    level: 100
  },
  nicholas: {
    hp: 278,
    maxHp: 278,
    attack: 166,
    defense: 168,
    specialAttack: 380,
    specialDefense: 250,
    speed: 248,
    level: 100
  },
  austine: {
    hp: 312,
    maxHp: 312,
    attack: 180,
    defense: 215,
    specialAttack: 225,
    specialDefense: 276,
    speed: 205,
    level: 100
  },
  victor: {
    hp: 265,
    maxHp: 265,
    attack: 136,
    defense: 195,
    specialAttack: 413,
    specialDefense: 213,
    speed: 399,
    level: 100
  },
  derseGuard: {
    hp: 400,
    maxHp: 400,
    attack: 107,
    defense: 65,
    specialAttack: 144,
    specialDefense: 105,
    speed: 87,
    level: 50,
    xpDrop: 125000
  },
  derseAgent: {
    hp: 400,
    maxHp: 400,
    attack: 219,
    defense: 181,
    specialAttack: 125,
    specialDefense: 139,
    speed: 144,
    level: 70,
    xpDrop: 343000
  },
  derseArchagent: {
    hp: 750,
    maxHp: 750,
    attack: 235,
    defense: 196,
    specialAttack: 221,
    specialDefense: 189,
    speed: 203,
    level: 80,
    xpDrop: 512000
  },
    dd: {
    hp: 900,
    maxHp: 900,
    attack: 213,
    defense: 210,
    specialAttack: 275,
    specialDefense: 229,
    speed: 298,
    level: 90,
    xpDrop: 1093500
  },
    cd: {
    hp: 1000,
    maxHp: 1000,
    attack: 203,
    defense: 273,
    specialAttack: 266,
    specialDefense: 290,
    speed: 134,
    level: 90,
    xpDrop: 1093500
  },
    hb: {
    hp: 1250,
    maxHp: 1250,
    attack: 319,
    defense: 284,
    specialAttack: 190,
    specialDefense: 259,
    speed: 194,
    level: 90,
    xpDrop: 1093500
  },
    ss: {
    hp: 1500,
    maxHp: 1500,
    attack: 339,
    defense: 236,
    specialAttack: 276,
    specialDefense: 213,
    speed: 306,
    level: 100,
    xpDrop: 1500000
  },

};

const WEAPON_DATABASE = {
  fist: {
    id: 'fist',
    name: 'Fist Kind',
    power: 25,
    accuracy: 95,
    type: 'physical',
    ability: null,
    description: 'Backup weapon'
  },
  dualKnife: {
    id: 'dualKnife',
    name: 'Dual Knife',
    power: 65,
    accuracy: 100,
    type: 'physical',
    ability: 'doubleHit',
    description: 'Always hits twice'
  },
  inferiorPolearm: {
    id: 'inferiorPolearm',
    name: 'Inferior Polearm',
    power: 80,
    accuracy: 100,
    type: 'physical',
    ability: 'doubleHit',
    description: 'Inferior polearm from Opal'
  },
  polearm: {
    id: 'polearm',
    name: 'Polearm',
    power: 100,
    accuracy: 100,
    type: 'physical',
    ability: 'priority',
    description: 'Attacks have priority +1 if the enemy uses a physical attack'
  },
  inferiorRifle: {
    id: 'inferiorRifle',
    name: 'Inferior Rifle',
    power: 80,
    accuracy: 90,
    type: 'special',
    ability: 'sniper',
    description: 'Inferior rifle from Nicholas'
  },
  rifle: {
    id: 'rifle',
    name: 'Rifle',
    power: 120,
    accuracy: 100,
    type: 'special',
    ability: 'sniper',
    description: '1.5x power on critical hits'
  },
  inferiorWhip: {
    id: 'inferiorWhip',
    name: 'Inferior Whip',
    power: 45,
    accuracy: 95,
    type: 'physical',
    ability: 'lowerSpeed',
    description: 'Decreases enemy speed by 1 stage on hit'
  },
  whip: {
    id: 'whip',
    name: 'Whip',
    power: 60,
    accuracy: 95,
    type: 'physical',
    ability: 'lowerSpeed',
    description: 'Decreases enemy speed by 1 stage on hit'
  },
  animalCompanion: {
    id: 'animalCompanion',
    name: 'Animal Companion',
    power: 130,
    accuracy: 85,
    type: 'physical',
    ability: 'awaitingCommand',
    description: '-1 priority'
  },
  inferiorHatchet: {
    id: 'inferiorHatchet',
    name: 'Inferior Hatchet',
    power: 70,
    accuracy: 100,
    type: 'physical',
    ability: 'critDefHalved',
    description: 'Inferior hatchet from Isabela'
  },
  hatchet: {
    id: 'hatchet',
    name: 'Hatchet',
    power: 80,
    accuracy: 100,
    type: 'physical',
    ability: 'decreaseDef',
    description: '20% chance to decrease def on hit'
  },
  inferiorCrossbow: {
    id: 'inferiorCrossbow',
    name: 'Inferior Crossbow',
    power: 75,
    accuracy: 95,
    type: 'physical',
    ability: 'doubleHit',
    description: 'Inferior crossbow from Austine'
  },
  crossbow: {
    id: 'crossbow',
    name: 'Crossbow',
    power: 110,
    accuracy: 95,
    type: 'special',
    ability: 'critBoost',
    description: '+1 stage critical hit ratio'
  },
  crossbowRed: {
    id: 'crossbow',
    name: 'Crossbow',
    power: 110,
    accuracy: 95,
    type: 'special',
    ability: 'critBoost',
    description: '+1 stage critical hit ratio'
  },
  crossbowBlue: {
    id: 'crossbow',
    name: 'Crossbow',
    power: 110,
    accuracy: 95,
    type: 'physical',
    ability: 'critBoost',
    description: '+1 stage critical hit ratio'
  },
  crossbowGreen: {
    id: 'crossbow',
    name: 'Crossbow',
    power: 110,
    accuracy: 95,
    type: 'physical',
    ability: 'hitsSpecialDef',
    description: 'Hits against special defense'
  },
  bomb: {
    id: 'bomb',
    name: 'Bomb',
    power: 30,
    accuracy: 100,
    type: 'special',
    ability: 'oneTimeUse',
    description: 'One-time use, activate for scaling damage'
  },
  guardBaton: {
    id: 'crossbow',
    name: 'Crossbow',
    power: 50,
    accuracy: 90,
    type: 'physical',
    ability: 'non-leathal',
    description: 'non lethal weapon, made to keep enemies subdued'
  },
  agentPistol: {
    id: 'mace',
    name: 'Mace',
    power: 90,
    accuracy: 95,
    type: 'special',
    ability: null,
    description: 'Ignores positive enemy modifiers'
  },
  agentKnife: {
    id: 'mace',
    name: 'Mace',
    power: 50,
    accuracy: 100,
    type: 'physical',
    ability: null,
    description: 'Ignores positive enemy modifiers'
  },
  archAgentKnife: {
    id: 'mace',
    name: 'Mace',
    power: 55,
    accuracy: 100,
    type: 'physical',
    ability: 'ignorePositiveModifiers',
    description: 'Ignores positive enemy modifiers'
  },
  archAgentTommyGun: {
    id: 'mace',
    name: 'Mace',
    power: 90,
    accuracy: 65,
    type: 'special',
    ability: 'tripleHit', 
    description: 'Ignores positive enemy modifiers'
  },
  ssKnife: {
    id: 'crossbow',
    name: 'Crossbow',
    power: 60,
    accuracy: 100,
    type: 'physical',
    ability: 'tripleHit',
    description: '+1 stage critical hit ratio'
  },
  hbMace: {
    id: 'mace',
    name: 'Mace',
    power: 160,
    accuracy: 85,
    type: 'physical',
    ability: 'ignorePositiveModifiers',
    description: 'Ignores positive enemy modifiers'
  },
  ddSpear: {
    id: 'mace',
    name: 'Mace',
    power: 100,
    type: 'physical',
    ability: 'ignorePositiveModifiers',
    description: 'Ignores positive enemy modifiers'
  },
  cdBomb: {
    id: 'mace',
    name: 'Mace',
    power: 30,
    accuracy: 100,
    type: 'physical',
    ability: 'ignorePositiveModifiers',
    description: 'Ignores positive enemy modifiers'
  },


};

const DEFAULT_WEAPONS = {
  alexis: 'dualKnife',
  opal: 'polearm',
  nicholas: 'rifle',
  chloe: 'whip',
  tyson: 'bomb',
  isabela: 'hatchet',
  austine: 'crossbow',
  derseAgent: 'fist',
  derseGuard: 'fist',
  derseArchagent: 'fist',
  dd: 'fist',
  cd: 'fist',
  hb: 'fist',
  ss: 'fist'
};

const STRIFE_OPTIONS = {
  alexis: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
    { id: 'alternate', name: 'ALTERNATE', category: 'item', tooltip: 'Swap weapon in strife deck.' },
    { id: 'antagonize', name: 'ANTAGONIZE', category: 'status', tooltip: '+2 ATK for you, +1 ATK for enemy for 4 turns.' },
    { id: 'abuse', name: 'ABUSE', category: 'status', tooltip: 'Decrease enemy DEF by 1 stage for 4 turns.' },
    { id: 'avenge', name: 'AVENGE', category: 'damage', tooltip: 'x2 damage. Lower your DEF and SP.DEF by 1 stage for 4 turns.' },
    { id: 'anthem', name: 'ANTHEM', category: 'fraymotif', tooltip: 'Activate fraymotif (requires 1000 charge).' }
  ],
  opal: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
    { id: 'aggress', name: 'AGGRESS', category: 'status', tooltip: '+1 ATK for 4 turns. Gain your ATK stat as fraymotif points.' },
    { id: 'accost', name: 'ACCOST', category: 'status', tooltip: 'Lower enemy ATK by 1 stage for 4 turns.' },
    { id: 'assail', name: 'ASSAIL', category: 'damage', tooltip: '0.5x power, hits 2-5 times. Lower DEF by 1 stage for 4 turns.' },
    { id: 'apparate', name: 'APPARATE', category: 'combat', tooltip: 'Priority 3. Leave combat immidately and turn to starting location.' },
    { id: 'anthem', name: 'ANTHEM', category: 'fraymotif', tooltip: 'Activate fraymotif (requires 1000 charge).' }
  ],
  nicholas: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
    { id: 'align', name: 'ALIGN', category: 'status', tooltip: '+1 accuracy for 4 turns.' },
    { id: 'accuse', name: 'ACCUSE', category: 'status', tooltip: '+1 SP.ATK for 4 turns.' },
    { id: 'afflict', name: 'AFFLICT', category: 'status', tooltip: 'Lower enemy SP.DEF by 1 stage for 4 turns.' },
    { id: 'annihilate', name: 'ANNIHILATE', category: 'damage', tooltip: '2x damage but lower SP.ATK and accuracy by 1 stage for 4 turns.' },
    { id: 'anthem', name: 'ANTHEM', category: 'fraymotif', tooltip: 'Activate fraymotif (requires 1000 charge).' }
  ],
  chloe: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
    { id: 'aggress', name:'AGGRESS', category: 'status', tooltip: '+1 ATK for 4 turns. Gain your ATK stat as fraymotif points.' },
    { id: 'ameliorate', name: 'AMELIORATE', category: 'combat', tooltip: 'Removes all negative stages' },
    { id: 'avoid', name: 'AVOID', category: 'status', tooltip: '+1 evasion for 4 turns.' },
    { id: 'adjudge', name: 'ADJUDGE', category: 'damage', tooltip: 'Removes -1 priority on animal companion weapon.' },
    { id: 'anthem', name: 'ANTHEM', category: 'fraymotif', tooltip: 'Activate fraymotif (requires 1000 charge).' }
  ],
  tyson: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
    { id: 'abstain', name: 'ABSTAIN', category: 'combat', tooltip: 'Skip turn to charge bomb for next ACTIVATE.' },
    { id: 'apologize', name: 'APOLOGIZE', category: 'status', tooltip: '-1 your ATK, -1 enemy ATK and SP.ATK for 4 turns.' },
    { id: 'activate', name: 'ACTIVATE', category: 'item', tooltip: 'Detonate thrown bomb (100 power per turn).' },
    { id: 'abscond', name: 'ABSCOND', category: 'abscond', tooltip: 'Leave combat immidately and turn to starting location.' },
    { id: 'anthem', name: 'ANTHEM', category: 'fraymotif', tooltip: 'Activate fraymotif (requires 1000 charge).' }
  ],
  isabela: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
    { id: 'abjure', name: 'ABJURE', category: 'combat', tooltip: 'Priority 3. Block next attack, take no damage.' },
    { id: 'alchemize', name: 'ALCHEMIZE', category: 'item', tooltip: 'Spend grist for stat boosts or quest weapon.' },
    { id: 'analyze', name: 'ANALYZE', category: 'status', tooltip: '+1 critical hit ratio for 4 turns.' },
    { id: 'assault', name: 'ASSAULT', category: 'damage', tooltip: '2x power, -1 speed for 4 turns.' },
    { id: 'anthem', name: 'ANTHEM', category: 'fraymotif', tooltip: 'Activate fraymotif (requires 300 charge).' }
  ],
  austine: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
    { id: 'aggress', name: 'AGGRESS', category: 'status', tooltip: '+1 ATK for 4 turns. Gain your ATK stat as fraymotif points.' },
    { id: 'alternate', name: 'ALTERNATE', category: 'item', tooltip: 'Switch crossbow bolt type.' },
    { id: 'accuse', name: 'ACCUSE', category: 'status', tooltip: '+1 SP.ATK for 4 turns.' },
    { id: 'analyze', name: 'ANALYZE', category: 'status', tooltip: '+1 critical hit ratio for 4 turns.' },
    { id: 'anthem', name: 'ANTHEM', category: 'fraymotif', tooltip: 'Activate fraymotif (requires 1000 charge).' }
  ],
  derseGuard: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
  ],
  derseAgent: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
  ],
  derseArchAgent: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
  ],
  derseSS: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
  ],
  derseHB: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
  ],
  derseCB: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
  ],
  derseDD: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
  ],
};

const STRIFE_CATEGORIES = {
  damage: { color: '#ff0000', name: 'Damage' },
  status: { color: '#ffff00', name: 'Status Change' },
  combat: { color: '#add8e6', name: 'Other Combat' },
  item: { color: '#00008b', name: 'Item Manipulation' },
  abscond: { color: '#ffc0cb', name: 'Abscond' },
  fraymotif: { color: '#800080', name: 'Fraymotif' }
};


const ABILITIES = {
  opal: { name: 'Teleport', effect: 'evasionBoost', value: 1, description: '10% less likely to be hit' },
  tyson: { name: 'Doomed', effect: 'noCrits', description: 'Prevents critical hits' },
  nicholas: { name: 'Light Destroyer', effect: 'lowAccuracyHighDamage', description: 'Doubles damage when using rifle weapon, but halves accuracy' },
  alexis: { name: 'Adaptation', effect: 'defenseOnHit', description: 'Everytime hit by physical damage increase def by 1 stage, every time hit by special damage increase sp.def by 1 stage' },
  isabela: { name: 'blood alchemy', effect: 'endturnheal', description: 'Heals 1/16 fo damage at end of the battle sequence' },
  chloe: { name: 'Animal Companion', effect: 'pairbond', description: 'Second attack is made by Chloe with animalCompanion weapon.' },
  austine: { name: 'Tactician', effect: 'doubleStatChanges', description: 'Doubles the effect of stat changes.' }
};

export function getCombatantData(characterId) {
  const stats = CHARACTER_STATS[characterId];
  if (!stats) {
    console.error(`Character stats not found for: ${characterId}`);
    return null;
  }

  const weapon = DEFAULT_WEAPONS[characterId] || 'fist';
  const weaponData = WEAPON_DATABASE[weapon];
  const strifeOptions = STRIFE_OPTIONS[characterId] || [];
  const ability = ABILITIES[characterId] || null;

  const moves = weaponData ? [{
    name: weaponData.name,
    type: weaponData.type,
    power: weaponData.power,
    accuracy: 100,
    effect: weaponData.ability ? { type: weaponData.ability } : null
  }] : [];

  return {
    id: characterId,
    name: characterId.charAt(0).toUpperCase() + characterId.slice(1),
    health: stats.hp,
    maxHealth: stats.maxHp,
    attack: stats.attack,
    defense: stats.defense,
    specialAttack: stats.specialAttack,
    specialDefense: stats.specialDefense,
    speed: stats.speed,
    weapon: weapon,
    weaponData: weaponData,
    moves: moves,
    strifeOptions: strifeOptions,
    ability: ability
  };
}

const ABILITY_DESCRIPTIONS = {
  weaponSteal: 'Can steal weapons from enemies in combat',
  invincibleInCombat: 'Cannot be defeated in battle',
  autoSolvePuzzle: 'Automatically solves puzzles',
  healOthers: 'Can heal other party members',
  healSelf: 'Can heal self during combat',
  gristCreator: 'Can create grist resources',
  buildStructures: 'Can build structures in the game world',
  damageBoost: 'Deals increased damage in combat',
  teleport: 'Can teleport to different locations',
  spatialManipulation: 'Can manipulate space and positioning',
  largeInventory: 'Has expanded inventory capacity',
  gameBreaker: 'Has abilities that break game mechanics'
};

if (typeof window !== 'undefined') {
  window.CHARACTER_STATS = CHARACTER_STATS;
  window.WEAPON_DATABASE = WEAPON_DATABASE;
  window.DEFAULT_WEAPONS = DEFAULT_WEAPONS;
  window.ABILITY_DESCRIPTIONS = ABILITY_DESCRIPTIONS;
  window.STRIFE_OPTIONS = STRIFE_OPTIONS;
  window.STRIFE_CATEGORIES = STRIFE_CATEGORIES;
  window.ABILITIES = ABILITIES;
}

export {
  CHARACTER_STATS,
  WEAPON_DATABASE,
  DEFAULT_WEAPONS,
  ABILITY_DESCRIPTIONS,
  STRIFE_OPTIONS,
  STRIFE_CATEGORIES,
  ABILITIES
};