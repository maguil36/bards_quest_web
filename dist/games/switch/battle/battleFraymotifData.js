const FRAYMOTIF_BACKGROUNDS = {
  opal: 'fraymotifs/fraymotif_space.png',
  isabela: 'fraymotifs/fraymotif_blood.png',
  tyson: 'fraymotifs/fraymotif_doom.png',
  chloe: 'fraymotifs/fraymotif_life.png',
  austine: 'fraymotifs/fraymotif_mind.png',
  nicholas: 'fraymotifs/fraymotif_light.png',
  alexis: 'fraymotifs/fraymotif_rage.png'
};

const FRAYMOTIF_ABILITIES = {
  alexis: [
    {
      id: 'fury_fugue',
      name: 'Fury Fugue',
      description: 'Multi-hit attack (2-5 hits based on user HP). Lower HP = more hits.',
      category: 'physical',
      cost: 1000,
      power: { type: 'weapon', multiplier: 0.8 },
      effect: {
        type: 'multiHit',
        hitsBasedOnHP: true,
        hpThresholds: [
          { maxHP: 0.25, hits: 5 },
          { maxHP: 0.50, hits: 4 },
          { maxHP: 0.75, hits: 3 },
          { maxHP: 1.00, hits: 2 }
        ],
        doubleHitBonus: 1
      }
    },
    {
      id: 'tempest_tonic',
      name: 'Tempest Tonic',
      description: 'High priority physical attack. 1.25x weapon power, +2 priority.',
      category: 'physical',
      cost: 1000,
      power: { type: 'weapon', multiplier: 1.25 },
      effect: { type: 'priorityBoost', bonus: 2 }
    },
    {
      id: 'vengeful_vibrato',
      name: 'Vengeful Vibrato',
      description: 'Raises Attack and Sp. Attack by 2 stages for 4 turns.',
      category: 'status',
      cost: 1000,
      effect: {
        type: 'statBoost',
        target: 'self',
        stats: { attack: 2, specialAttack: 2 },
        duration: 4
      }
    },
    {
      id: 'raucous_ritardando',
      name: 'Raucous Ritardando',
      description: 'Lowers enemy Defense, Sp. Defense, and Speed by 1 stage for 4 turns.',
      category: 'status',
      cost: 1000,
      effect: {
        type: 'statLower',
        target: 'enemy',
        stats: { defense: -1, specialDefense: -1, speed: -1 },
        duration: 4
      }
    },
    {
      id: 'discordant_crescendo',
      name: 'Discordant Crescendo',
      description: 'Escalating attack over 3 turns (1x → 2x → 4x power). Locks user into move.',
      category: 'physical',
      cost: 1000,
      power: { type: 'weapon', multiplier: 1 },
      effect: {
        type: 'crescendo',
        duration: 3,
        locked: true,
        powerMultipliers: [1, 2, 4]
      }
    }
  ],
  tyson: [
    {
      id: 'oblivion_oratorio',
      name: 'Oblivion Oratorio',
      description: 'Special attack that deals more damage based on missing HP. 1.25x multiplier.',
      category: 'special',
      cost: 1000,
      power: { type: 'damageScaling', multiplier: 1.25 },
      effect: { type: 'damageBasedOnMissingHP' }
    },
    {
      id: 'dire_dissonance',
      name: 'Dire Dissonance',
      description: 'Lowers enemy Defense and Sp. Defense by 2 stages for 4 turns.',
      category: 'status',
      cost: 1000,
      effect: {
        type: 'statLower',
        target: 'enemy',
        stats: { defense: -2, specialDefense: -2 },
        duration: 4
      }
    },
    {
      id: 'final_fugato',
      name: 'Final Fugato',
      description: 'Fixed 200 damage special attack. Lowers enemy Defense by 1 stage for 4 turns.',
      category: 'special',
      cost: 1000,
      power: { type: 'fixed', amount: 200 },
      effect: {
        type: 'statLower',
        target: 'enemy',
        stats: { defense: -1 },
        duration: 4
      }
    },
    {
      id: 'sombre_syncopation',
      name: 'Sombre Syncopation',
      description: 'Lowers enemy Attack and Sp. Attack by 2 stages for 4 turns.',
      category: 'status',
      cost: 1000,
      effect: {
        type: 'statLower',
        target: 'enemy',
        stats: { attack: -2, specialAttack: -2 },
        duration: 4
      }
    },
    {
      id: 'crisis_chaconne',
      name: 'Crisis Chaconne',
      description: 'Multi-hit attack (2 base + 1 per enemy debuff). 0.8x weapon power per hit.',
      category: 'physical',
      cost: 1000,
      power: { type: 'weapon', multiplier: 0.8 },
      effect: {
        type: 'multiHit',
        hitsBasedOnEnemyDebuffs: true,
        baseHits: 2
      }
    }
  ],
  chloe: [
    {
      id: 'vital_variation',
      name: 'Vital Variation',
      description: 'Equalizes HP between user and enemy (average of both).',
      category: 'status',
      cost: 1000,
      effect: {
        type: 'hpEqualize',
        description: 'Sum up the remaining hp of both the enemy and the rogue of life. Split it in half, and both go with what remains.'
      }
    },
    {
      id: 'lush_legato',
      name: 'Lush Legato',
      description: 'Lowers enemy Attack/Sp. Attack by 1. Raises user Defense/Sp. Defense by 1. 4 turns.',
      category: 'status',
      cost: 1000,
      effect: {
        type: 'dualStatChange',
        target: 'enemy',
        enemyStats: { attack: -1, specialAttack: -1 },
        selfStats: { defense: 1, specialDefense: 1 },
        duration: 4
      }
    },
    {
      id: 'rejuvenating_recitative',
      name: 'Rejuvenating Recitative',
      description: 'Fixed 100 damage special attack. Heals user for 50% of damage dealt.',
      category: 'special',
      cost: 1000,
      power: { type: 'fixed', amount: 100 },
      effect: { type: 'lifeSteal', percent: 0.5 }
    },
    {
      id: 'breathless_beat',
      name: 'Breathless Beat',
      description: 'Fixed 200 damage special attack. Damage scales with missing HP (10% minimum).',
      category: 'special',
      cost: 1000,
      power: { type: 'fixed', amount: 200 },
      effect: {
        type: 'damageScaledByMissingHP',
        minPercent: 0.1
      }
    },
    {
      id: 'resonant_rise',
      name: 'Resonant Rise',
      description: 'Animal companion attack (3x power). Always hits. Disables companion for 4 turns.',
      category: 'physical',
      cost: 1000,
      power: { type: 'animalCompanion', multiplier: 3 },
      effect: {
        type: 'disableAnimalCompanion',
        duration: 4,
        alwaysHits: true
      }
    }
  ],
  isabela: [
    {
      id: 'crimson_cantata',
      name: 'Crimson Cantata',
      description: 'Fixed 150 damage special attack. Doubles stat stages for damage calculation.',
      category: 'special',
      cost: 1000,
      power: { type: 'fixed', amount: 150 },
      effect: { type: 'doubleStages' }
    },
    {
      id: 'vein_vibrato',
      name: 'Vein Vibrato',
      description: 'Choose target: Lower Defense/Sp. Def by 2 OR raise Atk/Sp. Atk by 2 + Speed by 1. 4 turns.',
      category: 'status',
      cost: 1000,
      effect: {
        type: 'complexStatChange',
        targetSelection: true,
        negativeStats: { defense: -2, specialDefense: -2 },
        positiveStats: { attack: 2, specialAttack: 2, speed: 1 },
        duration: 4
      }
    },
    {
      id: 'pulse_pizzicato',
      name: 'Pulse Pizzicato',
      description: '3-hit physical attack. 1.2x weapon power. Disables weapon abilities.',
      category: 'physical',
      cost: 1000,
      power: { type: 'weapon', multiplier: 1.2 },
      effect: {
        type: 'multiHit',
        hits: 3,
        disableWeaponAbilities: true
      }
    },
    {
      id: 'scarlet_serenade',
      name: 'Scarlet Serenade',
      description: 'Choose target: Heal self or enemy for 50% of their max HP.',
      category: 'status',
      cost: 1000,
      effect: {
        type: 'heal',
        targetSelection: true,
        percent: 0.5
      }
    },
    {
      id: 'bloodborne_ballad',
      name: 'Bloodborne Ballad',
      description: 'Regeneration: Heals 12.5% HP per turn for 5 turns. Protects from stat changes.',
      category: 'status',
      cost: 1000,
      effect: {
        type: 'regeneration',
        healPerTurn: 0.125,
        statProtection: true,
        duration: 5
      }
    }
  ],
  opal: [
    {
      id: 'celestial_cadenza',
      name: 'Celestial Cadenza',
      description: 'Fixed 130 damage special attack. Raises Sp. Attack and Sp. Defense by 1 for 4 turns.',
      category: 'special',
      cost: 1000,
      power: { type: 'fixed', amount: 130 },
      effect: {
        type: 'statBoost',
        target: 'self',
        stats: { specialAttack: 1, specialDefense: 1 },
        duration: 4
      }
    },
    {
      id: 'spatial_sonata',
      name: 'Spatial Sonata',
      description: 'Doubles Defense and Sp. Defense for damage calculations for 5 turns.',
      category: 'status',
      cost: 1000,
      effect: {
        type: 'defenseDouble',
        duration: 5
      }
    },
    {
      id: 'vortex_valse',
      name: 'Vortex Valse',
      description: 'Fixed 90 damage special attack. Inflicts 6.25% residual damage per turn for 5 turns.',
      category: 'special',
      cost: 1000,
      power: { type: 'fixed', amount: 90 },
      effect: {
        type: 'residualDamage',
        damagePerTurn: 0.0625,
        duration: 5
      }
    },
    {
      id: 'quantum_quasi',
      name: 'Quantum Quasi',
      description: '1.5x weapon power physical attack. Lowers enemy Attack and Defense by 1 for 4 turns.',
      category: 'physical',
      cost: 1000,
      power: { type: 'weapon', multiplier: 1.5 },
      effect: {
        type: 'statLower',
        target: 'enemy',
        stats: { attack: -1, defense: -1 },
        duration: 4
      }
    },
    {
      id: 'cosmic_canon',
      name: 'Cosmic Canon',
      description: 'Fixed 250 damage physical attack. Lowers enemy Speed by 1 for 4 turns.',
      category: 'physical',
      cost: 1000,
      power: { type: 'fixed', amount: 250 },
      effect: {
        type: 'statLower',
        target: 'enemy',
        stats: { speed: -1 },
        duration: 4
      }
    }
  ],
  nicholas: [
    {
      id: 'blinding_bolero',
      name: 'Blinding Bolero',
      description: 'Fixed 30 damage special attack. +3 priority. Lowers enemy Accuracy by 3 and causes flinch for 4 turns.',
      category: 'special',
      cost: 1000,
      power: { type: 'fixed', amount: 30 },
      effect: {
        type: 'accuracyLowerAndFlinch',
        target: 'enemy',
        accuracy: -3,
        flinch: true,
        priority: 3,
        duration: 4
      }
    },
    {
      id: 'lucid_lament',
      name: 'Lucid Lament',
      description: '1x weapon power special attack. Temporarily raises Accuracy by 2 and guarantees critical hit.',
      category: 'special',
      cost: 1000,
      power: { type: 'weapon', multiplier: 1 },
      effect: {
        type: 'temporaryAccuracyCrit',
        accuracyBoost: 2,
        guaranteedCrit: true
      }
    },
    {
      id: 'radiant_rhapsody',
      name: 'Radiant Rhapsody',
      description: '1x weapon power special attack. Raises Sp. Attack by 3 stages for 4 turns.',
      category: 'special',
      cost: 1000,
      power: { type: 'weapon', multiplier: 1 },
      effect: {
        type: 'statBoost',
        target: 'self',
        stats: { specialAttack: 3 },
        duration: 4
      }
    },
    {
      id: 'solar_sforzando',
      name: 'Solar Sforzando',
      description: 'Fixed 300 damage special attack. Always hits.',
      category: 'special',
      cost: 1000,
      power: { type: 'fixed', amount: 300 },
      effect: { type: 'alwaysHits' }
    },
    {
      id: 'flare_fugue',
      name: 'Flare Fugue',
      description: '10-hit special attack. 0.25x weapon power per hit. Each hit has independent accuracy.',
      category: 'special',
      cost: 1000,
      power: { type: 'weapon', multiplier: 0.25 },
      effect: {
        type: 'multiHit',
        hits: 10,
        independentAccuracy: true
      }
    }
  ],
  austine: [
    {
      id: 'cerebral_coda',
      name: 'Cerebral Coda',
      description: '1.5x weapon power special attack. Uses Defense stat instead of Sp. Attack for damage.',
      category: 'special',
      cost: 1000,
      power: { type: 'weapon', multiplier: 1.5 },
      effect: {
        type: 'alternateStatCalculation',
        useDefenseForAttack: true,
        special: true
      }
    },
    {
      id: 'perceptive_pizzicato',
      name: 'Perceptive Pizzicato',
      description: '3-hit physical attack. 0.75x weapon power. Uses Defense stat instead of Attack.',
      category: 'physical',
      cost: 1000,
      power: { type: 'weapon', multiplier: 0.75 },
      effect: {
        type: 'multiHitDefensive',
        hits: 3,
        useDefenseForAttack: true
      }
    },
    {
      id: 'intellectual_interval',
      name: 'Intellectual Interval',
      description: 'Raises all stats (Attack, Defense, Sp. Attack, Sp. Defense, Speed) by 1 for 4 turns.',
      category: 'status',
      cost: 1000,
      effect: {
        type: 'statBoost',
        target: 'self',
        stats: { attack: 1, defense: 1, specialAttack: 1, specialDefense: 1, speed: 1 },
        duration: 4
      }
    },
    {
      id: 'cognitive_cadence',
      name: 'Cognitive Cadence',
      description: 'Swaps Defense and Sp. Defense stats between user and enemy.',
      category: 'status',
      cost: 1000,
      effect: {
        type: 'statSwap',
        swapDefenseStats: true
      }
    },
    {
      id: 'harmonic_hypothesis',
      name: 'Harmonic Hypothesis',
      description: 'Swaps Attack and Sp. Attack stats between user and enemy.',
      category: 'status',
      cost: 1000,
      effect: {
        type: 'statSwap',
        swapAttackStats: true
      }
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

if (typeof window !== 'undefined') {
  window.getFraymotifAbilities = getFraymotifAbilities;
  window.getFraymotifBackground = getFraymotifBackground;
}
