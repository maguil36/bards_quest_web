const FRAYMOTIF_BACKGROUNDS = {
  opal: 'fraymotif_space.png',
  isabela: 'fraymotif_blood.png',
  tyson: 'fraymotif_doom.png',
  chloe: 'fraymotif_life.png',
  austine: 'fraymotif_mind.png',
  nicholas: 'fraymotif_light.png',
  alexis: 'fraymotif_rage.png'
};

const FRAYMOTIF_ABILITIES = {
  opal: [
    {
      id: 'space_teleport',
      name: 'Spatial Symphony',
      description: 'Teleport behind enemy. Next attack is guaranteed critical hit.',
      cost: 1000,
      effect: { type: 'guaranteedCrit', duration: 1 }
    },
    {
      id: 'space_warp',
      name: 'Warp Waltz',
      description: 'Distort space around enemy. Lower all enemy stats by 2 stages.',
      cost: 1000,
      effect: { type: 'lowerAllStats', target: 'enemy', stages: -2 }
    },
    {
      id: 'space_clone',
      name: 'Echo Chamber',
      description: 'Create a clone. Next 3 attacks hit twice.',
      cost: 1000,
      effect: { type: 'doubleAttack', duration: 3 }
    },
    {
      id: 'space_void',
      name: 'Silent Stanza',
      description: 'Trap enemy in void. Enemy cannot move for 2 turns.',
      cost: 1000,
      effect: { type: 'skipTurns', target: 'enemy', duration: 2 }
    },
    {
      id: 'space_collapse',
      name: 'Crescendo Collapse',
      description: 'Collapse space on enemy. Deal damage equal to 50% of enemy max HP.',
      cost: 1000,
      effect: { type: 'percentDamage', target: 'enemy', percent: 0.5 }
    }
  ],
  isabela: [
    {
      id: 'blood_bond',
      name: 'Siphon Song',
      description: 'Create blood link. Drain 25% of enemy HP each turn for 3 turns.',
      cost: 1000,
      effect: { type: 'lifeDrain', percent: 0.25, duration: 3 }
    },
    {
      id: 'blood_rage',
      name: 'Crimson Crescendo',
      description: 'Channel blood power. +3 ATK and +2 SPD for 5 turns.',
      cost: 1000,
      effect: { type: 'statBoost', stats: { attack: 3, speed: 2 }, duration: 5 }
    },
    {
      id: 'blood_sacrifice',
      name: 'Sacrifice Serenade',
      description: 'Sacrifice 30% HP. Next attack deals 3x damage.',
      cost: 1000,
      effect: { type: 'sacrificePower', hpCost: 0.3, multiplier: 3 }
    },
    {
      id: 'blood_barrier',
      name: 'Hemlock Harmony',
      description: 'Create protective barrier. Block all damage for 1 turn.',
      cost: 1000,
      effect: { type: 'invincible', duration: 1 }
    },
    {
      id: 'blood_explosion',
      name: 'Scarlet Scream',
      description: 'Explosive blood attack. Deal 200 fixed damage, ignore defense.',
      cost: 1000,
      effect: { type: 'fixedDamage', amount: 200 }
    }
  ],
  tyson: [
    {
      id: 'doom_inevitability',
      name: 'Requiem\'s End',
      description: 'Mark enemy for doom. Enemy loses 15% max HP each turn for 4 turns.',
      cost: 1000,
      effect: { type: 'doomMark', percent: 0.15, duration: 4 }
    },
    {
      id: 'doom_rewind',
      name: 'Tempo Rewind',
      description: 'Rewind time. Restore your HP to full.',
      cost: 1000,
      effect: { type: 'fullHeal', target: 'self' }
    },
    {
      id: 'doom_accelerate',
      name: 'Accelerando of Doom',
      description: 'Speed up time. Take 3 turns in a row.',
      cost: 1000,
      effect: { type: 'extraTurns', count: 2 }
    },
    {
      id: 'doom_sacrifice',
      name: 'Funeral March',
      description: 'Accept doom. Set enemy HP to 1, but you also take heavy damage.',
      cost: 1000,
      effect: { type: 'mutualDoom', enemyHp: 1, selfDamage: 0.5 }
    },
    {
      id: 'doom_paradox',
      name: 'Bombastic Beat',
      description: 'Detonate all bombs instantly with 2x power, ignoring timer.',
      cost: 1000,
      effect: { type: 'megaBomb', multiplier: 2 }
    }
  ],
  chloe: [
    {
      id: 'life_regeneration',
      name: 'Vital Verse',
      description: 'Channel life energy. Restore 50% of max HP.',
      cost: 1000,
      effect: { type: 'healPercent', target: 'self', percent: 0.5 }
    },
    {
      id: 'life_growth',
      name: 'Flourish Forte',
      description: 'Grow stronger. +2 to all your stats for 5 turns.',
      cost: 1000,
      effect: { type: 'allStatBoost', target: 'self', stages: 2, duration: 5 }
    },
    {
      id: 'life_leech',
      name: 'Vitality Vibrato',
      description: 'Absorb life force. Next 4 attacks heal you for 100% damage dealt.',
      cost: 1000,
      effect: { type: 'lifeSteal', percent: 1.0, duration: 4 }
    },
    {
      id: 'life_resurrect',
      name: 'Encore of Life',
      description: 'Grant resurrection. If you fall to 0 HP, revive with 50% HP once.',
      cost: 1000,
      effect: { type: 'revive', percent: 0.5 }
    },
    {
      id: 'life_wither',
      name: 'Withering Waltz',
      description: 'Drain enemy vitality. Set enemy HP to 50% of current.',
      cost: 1000,
      effect: { type: 'percentCurrentDamage', target: 'enemy', percent: 0.5 }
    }
  ],
  austine: [
    {
      id: 'mind_predict',
      name: 'Prescient Prelude',
      description: 'See enemy moves. Perfect evasion for 3 turns.',
      cost: 1000,
      effect: { type: 'perfectEvasion', duration: 3 }
    },
    {
      id: 'mind_confuse',
      name: 'Discord Duet',
      description: 'Confuse enemy. Enemy attacks itself for 2 turns.',
      cost: 1000,
      effect: { type: 'confusion', duration: 2 }
    },
    {
      id: 'mind_amplify',
      name: 'Mental Melody',
      description: 'Focus mental power. +5 SP.ATK and +3 critical ratio.',
      cost: 1000,
      effect: { type: 'mentalBoost', specialAttack: 5, critStage: 3 }
    },
    {
      id: 'mind_copy',
      name: 'Mimic\'s Motif',
      description: 'Copy enemy stats. Match all enemy stat stages.',
      cost: 1000,
      effect: { type: 'copyStats', target: 'enemy' }
    },
    {
      id: 'mind_shatter',
      name: 'Shattered Sonata',
      description: 'Shatter mind. Deal 150 fixed damage + your SP.ATK as bonus damage.',
      cost: 1000,
      effect: { type: 'psychicBlast', baseDamage: 150 }
    }
  ],
  nicholas: [
    {
      id: 'light_illuminate',
      name: 'Luminous Lullaby',
      description: 'Flash of light. Enemy accuracy drops to 0 for 2 turns.',
      cost: 1000,
      effect: { type: 'blind', duration: 2 }
    },
    {
      id: 'light_laser',
      name: 'Laser Legato',
      description: 'Focused laser. Deal 250 fixed damage, cannot miss.',
      cost: 1000,
      effect: { type: 'fixedDamage', amount: 250, pierce: true }
    },
    {
      id: 'light_reflect',
      name: 'Radiant Refrain',
      description: 'Reflective shield. Reflect all damage back to enemy for 2 turns.',
      cost: 1000,
      effect: { type: 'reflect', duration: 2 }
    },
    {
      id: 'light_fortune',
      name: 'Lucky Lyric',
      description: 'Lucky blessing. All attacks are critical hits for 3 turns.',
      cost: 1000,
      effect: { type: 'alwaysCrit', duration: 3 }
    },
    {
      id: 'light_destruction',
      name: 'Brilliant Blast',
      description: 'Ultimate destruction. Deal damage equal to 75% of enemy current HP.',
      cost: 1000,
      effect: { type: 'percentCurrentDamage', target: 'enemy', percent: 0.75 }
    }
  ],
  alexis: [
    {
      id: 'rage_berserk',
      name: 'Furious Fortissimo',
      description: 'Unstoppable fury. +4 ATK, +3 SPD, -2 DEF for 4 turns.',
      cost: 1000,
      effect: { type: 'berserk', attack: 4, speed: 3, defense: -2, duration: 4 }
    },
    {
      id: 'rage_fury',
      name: 'Rage Rhapsody',
      description: 'Release pure rage. Next attack deals 4x damage.',
      cost: 1000,
      effect: { type: 'ragePower', multiplier: 4, duration: 1 }
    },
    {
      id: 'rage_intimidate',
      name: 'Howling Harmony',
      description: 'Intimidate enemy. Lower enemy ATK and SP.ATK by 3 stages.',
      cost: 1000,
      effect: { type: 'intimidate', target: 'enemy', attack: -3, specialAttack: -3 }
    },
    {
      id: 'rage_rampage',
      name: 'Chaotic Chorus',
      description: 'Chaotic assault. Hit enemy 5 times with moderate damage.',
      cost: 1000,
      effect: { type: 'multiHit', hits: 5, power: 60 }
    },
    {
      id: 'rage_vengeful',
      name: 'Vengeance Verse',
      description: 'Revenge attack. Deal damage equal to HP you\'ve lost.',
      cost: 1000,
      effect: { type: 'vengeance' }
    }
  ]
};

function getFraymotifAbilities(characterId) {
  return FRAYMOTIF_ABILITIES[characterId] || FRAYMOTIF_ABILITIES.opal;
}

function getFraymotifBackground(characterId) {
  return FRAYMOTIF_BACKGROUNDS[characterId] || FRAYMOTIF_BACKGROUNDS.opal;
}

export {
  FRAYMOTIF_ABILITIES,
  FRAYMOTIF_BACKGROUNDS,
  getFraymotifAbilities,
  getFraymotifBackground
};
