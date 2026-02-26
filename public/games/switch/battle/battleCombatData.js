const CHARACTER_STATS = {
  opal: {
    hp: 120,
    maxHp: 120,
    attack: 60,
    defense: 70,
    specialAttack: 70,
    specialDefense: 70,
    speed: 60
  },
  alexis: {
    hp: 100,
    maxHp: 100,
    attack: 90,
    defense: 45,
    specialAttack: 40,
    specialDefense: 45,
    speed: 90
  },
  tyson: {
    hp: 200,
    maxHp: 200,
    attack: 50,
    defense: 60,
    specialAttack: 50,
    specialDefense: 60,
    speed: 60
  },
  chloe: {
    hp: 90,
    maxHp: 90,
    attack: 50,
    defense: 40,
    specialAttack: 50,
    specialDefense: 40,
    speed: 65
  },
  isabell: {
    hp: 80,
    maxHp: 80,
    attack: 50,
    defense: 40,
    specialAttack: 40,
    specialDefense: 60,
    speed: 50
  },
  nicholas: {
    hp: 80,
    maxHp: 80,
    attack: 45,
    defense: 45,
    specialAttack: 65,
    specialDefense: 35,
    speed: 50
  },
  austine: {
    hp: 75,
    maxHp: 75,
    attack: 50,
    defense: 50,
    specialAttack: 50,
    specialDefense: 50,
    speed: 50
  },
  victor: {
    hp: 100,
    maxHp: 100,
    attack: 50,
    defense: 50,
    specialAttack: 50,
    specialDefense: 50,
    speed: 50
  },
  derseAgent: {
    hp: 75,
    maxHp: 75,
    attack: 60,
    defense: 50,
    specialAttack: 40,
    specialDefense: 40,
    speed: 60
  },
  derseArchagent: {
    hp: 125,
    maxHp: 125,
    attack: 80,
    defense: 60,
    specialAttack: 70,
    specialDefense: 50,
    speed: 80
  }
};

const WEAPON_DATABASE = {
  dualKnife: {
    id: 'dualKnife',
    name: 'Dual Knife',
    power: 45,
    type: 'physical',
    ability: 'doubleHit',
    description: 'Always hits twice'
  },
  inferiorKnife: {
    id: 'inferiorKnife',
    name: 'Inferior Knife',
    power: 40,
    type: 'physical',
    ability: 'doubleHit',
    description: 'Inferior dual knife from Alexis'
  },
  inferiorPolearm: {
    id: 'inferiorPolearm',
    name: 'Inferior Polearm',
    power: 70,
    type: 'physical',
    ability: 'doubleHit',
    description: 'Inferior polearm from Opal'
  },
  inferiorRifle: {
    id: 'inferiorRifle',
    name: 'Inferior Rifle',
    power: 85,
    type: 'physical',
    ability: 'doubleHit',
    description: 'Inferior rifle from Nicholas'
  },
  inferiorWhip: {
    id: 'inferiorWhip',
    name: 'Inferior Whip',
    power: 65,
    type: 'physical',
    ability: 'doubleHit',
    description: 'Inferior whip from Chloe'
  },
  inferiorBomb: {
    id: 'inferiorBomb',
    name: 'Inferior Bomb',
    power: 20,
    type: 'physical',
    ability: 'doubleHit',
    description: 'Inferior bomb from Tyson'
  },
  inferiorHatchet: {
    id: 'inferiorHatchet',
    name: 'Inferior Hatchet',
    power: 70,
    type: 'physical',
    ability: 'doubleHit',
    description: 'Inferior hatchet from Isabela'
  },
  inferiorCrossbow: {
    id: 'inferiorCrossbow',
    name: 'Inferior Crossbow',
    power: 75,
    type: 'physical',
    ability: 'doubleHit',
    description: 'Inferior crossbow from Austine'
  },
  mace: {
    id: 'mace',
    name: 'Mace',
    power: 65,
    type: 'physical',
    ability: 'ignorePositiveModifiers',
    description: 'Ignores positive enemy modifiers'
  },
  polearm: {
    id: 'polearm',
    name: 'Polearm',
    power: 75,
    type: 'physical',
    ability: 'priority',
    description: 'Attacks have priority +1'
  },
  rifle: {
    id: 'rifle',
    name: 'Rifle',
    power: 90,
    type: 'special',
    ability: 'hitsSpecialDef',
    description: 'Hits against special defense'
  },
  whip: {
    id: 'whip',
    name: 'Whip',
    power: 70,
    type: 'physical',
    ability: 'lowerSpeed',
    description: 'Decreases enemy speed by 1 stage on hit'
  },
  bomb: {
    id: 'bomb',
    name: 'Bomb',
    power: 25,
    type: 'special',
    ability: 'oneTimeUse',
    description: 'One-time use, activate for scaling damage'
  },
  fist: {
    id: 'fist',
    name: 'Fist Kind',
    power: 20,
    type: 'physical',
    ability: null,
    description: 'Backup weapon'
  },
  hatchet: {
    id: 'hatchet',
    name: 'Hatchet',
    power: 75,
    type: 'physical',
    ability: 'critDefHalved',
    description: 'Defense halved on critical hits'
  },
  hatchetUpgraded: {
    id: 'hatchetUpgraded',
    name: 'Hatchet+',
    power: 80,
    type: 'physical',
    ability: 'critDefHalved',
    description: 'Defense halved on critical hits (upgraded)'
  },
  crossbow: {
    id: 'crossbow',
    name: 'Crossbow',
    power: 80,
    type: 'physical',
    ability: 'critBoost',
    description: '+1 stage critical hit ratio'
  },
};

const DEFAULT_WEAPONS = {
  alexis: 'dualKnife',
  opal: 'polearm',
  nicholas: 'rifle',
  chloe: 'whip',
  tyson: 'bomb',
  isabela: 'hatchet',
  austine: 'crossbow'
};

const STRIFE_OPTIONS = {
  alexis: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
    { id: 'alternate', name: 'ALTERNATE', category: 'item', tooltip: 'Swap weapon in strife deck.' },
    { id: 'antagonize', name: 'ANTAGONIZE', category: 'status', tooltip: '+2 ATK for you, +1 ATK for enemy for 3 turns.' },
    { id: 'abuse', name: 'ABUSE', category: 'status', tooltip: 'Decrease enemy DEF by 1 stage for 3 turns.' },
    { id: 'avenge', name: 'AVENGE', category: 'damage', tooltip: '0.5x power, hits 2-5 times. Lower enemy SP.DEF by 1 stage for 3 turns.' },
    { id: 'anthem', name: 'ANTHEM', category: 'fraymotif', tooltip: 'Activate fraymotif (requires 300 charge).' }
  ],
  opal: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
    { id: 'aggress', name: 'AGGRESS', category: 'status', tooltip: '+1 ATK for 3 turns. Gain your ATK stat as fraymotif points.' },
    { id: 'apparate', name: 'APPARATE', category: 'combat', tooltip: 'Priority 4. Block next attack, +1 crit ratio next turn.' },
    { id: 'accost', name: 'ACCOST', category: 'status', tooltip: 'Lower enemy ATK by 1 stage for 3 turns.' },
    { id: 'assail', name: 'ASSAIL', category: 'damage', tooltip: '0.5x power, hits 2-5 times. Lower DEF by 1 stage for 3 turns.' },
    { id: 'anthem', name: 'ANTHEM', category: 'fraymotif', tooltip: 'Activate fraymotif (requires 300 charge).' }
  ],
  nicholas: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
    { id: 'align', name: 'ALIGN', category: 'status', tooltip: '+1 accuracy for 3 turns.' },
    { id: 'accuse', name: 'ACCUSE', category: 'status', tooltip: '+1 SP.ATK for 3 turns.' },
    { id: 'afflict', name: 'AFFLICT', category: 'status', tooltip: 'Lower enemy SP.DEF by 1 stage for 3 turns.' },
    { id: 'annihilate', name: 'ANNIHILATE', category: 'damage', tooltip: '3x damage but -1 accuracy for 3 turns.' },
    { id: 'anthem', name: 'ANTHEM', category: 'fraymotif', tooltip: 'Activate fraymotif (requires 300 charge).' }
  ],
  chloe: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
    { id: 'aggress', name:'AGGRESS', category: 'status', tooltip: '+1 ATK for 3 turns. Gain your ATK stat as fraymotif points.' },
    { id: 'ameliorate', name: 'AMELIORATE', category: 'combat', tooltip: 'Heal 1/16 HP per turn for 5 turns.' },
    { id: 'avoid', name: 'AVOID', category: 'status', tooltip: '+1 evasion for 3 turns.' },
    { id: 'adjudge', name: 'ADJUDGE', category: 'damage', tooltip: '120 power but speed halved this turn.' },
    { id: 'anthem', name: 'ANTHEM', category: 'fraymotif', tooltip: 'Activate fraymotif (requires 300 charge).' }
  ],
  tyson: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
    { id: 'abstain', name: 'ABSTAIN', category: 'combat', tooltip: 'Skip turn to charge bomb for next ACTIVATE.' },
    { id: 'apologize', name: 'APOLOGIZE', category: 'status', tooltip: '-1 your ATK, -1 enemy ATK and SP.ATK for 3 turns.' },
    { id: 'activate', name: 'ACTIVATE', category: 'item', tooltip: 'Detonate thrown bomb (100 power per turn).' },
    { id: 'abscond', name: 'ABSCOND', category: 'abscond', tooltip: 'Flee from battle.' },
    { id: 'anthem', name: 'ANTHEM', category: 'fraymotif', tooltip: 'Activate fraymotif (requires 300 charge).' }
  ],
  isabela: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
    { id: 'abjure', name: 'ABJURE', category: 'combat', tooltip: 'Priority 4. Block next attack, take no damage.' },
    { id: 'alchemize', name: 'ALCHEMIZE', category: 'item', tooltip: 'Spend grist for stat boosts or quest weapon.' },
    { id: 'analyze', name: 'ANALYZE', category: 'status', tooltip: '+1 critical hit ratio for 3 turns.' },
    { id: 'assault', name: 'ASSAULT', category: 'damage', tooltip: '2x power, -1 speed for 3 turns.' },
    { id: 'anthem', name: 'ANTHEM', category: 'fraymotif', tooltip: 'Activate fraymotif (requires 300 charge).' }
  ],
  austine: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
    { id: 'aggress', name: 'AGGRESS', category: 'status', tooltip: '+1 ATK for 3 turns. Gain your ATK stat as fraymotif points.' },
    { id: 'alternate', name: 'ALTERNATE', category: 'item', tooltip: 'Switch crossbow bolt type.' },
    { id: 'accuse', name: 'ACCUSE', category: 'status', tooltip: '+1 SP.ATK for 3 turns.' },
    { id: 'analyze', name: 'ANALYZE', category: 'status', tooltip: '+1 critical hit ratio for 3 turns.' },
    { id: 'anthem', name: 'ANTHEM', category: 'fraymotif', tooltip: 'Activate fraymotif (requires 300 charge).' }
  ],
  derseSoldier: [
    { id: 'aggrieve', name: 'AGGRIEVE', category: 'damage', tooltip: 'Standard attack. Gain damage dealt as fraymotif points.' },
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
  opal: { name: 'Teleport', effect: 'evasionBoost', value: 1 },
  tyson: { name: 'Doomed', effect: 'noCrits' },
  nicholas: { name: 'Light Destroyer', effect: 'lowAccuracyHighDamage' },
  alexis: { name: 'Adaptation', effect: 'defenseOnHit' },
  isabell: { name: 'Singer', effect: 'endTurnHeal' },
  chloe: { name: 'Life Player', effect: 'startCombatLowerAttack' },
  austine: { name: 'Tactician', effect: 'doubleStatChanges' }
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

if (typeof window !== 'undefined') {
  window.CHARACTER_STATS = CHARACTER_STATS;
  window.WEAPON_DATABASE = WEAPON_DATABASE;
  window.DEFAULT_WEAPONS = DEFAULT_WEAPONS;
  window.STRIFE_OPTIONS = STRIFE_OPTIONS;
  window.STRIFE_CATEGORIES = STRIFE_CATEGORIES;
  window.ABILITIES = ABILITIES;
  window.getCombatantData = getCombatantData;
}

export {
  CHARACTER_STATS,
  WEAPON_DATABASE,
  DEFAULT_WEAPONS,
  STRIFE_OPTIONS,
  STRIFE_CATEGORIES,
  ABILITIES
};
