import { WEAPON_DATABASE } from './battleCombatData.js';
import { getFraymotifAbilities } from './battleFraymotifData.js';

export class FraymotifExecutor {
  constructor(combatSystem) {
    this.combat = combatSystem;
  }

  executeFraymotif(fraymotifId, attacker, defender) {
    const abilities = getFraymotifAbilities(attacker.id);
    const fraymotif = abilities.find(f => f.id === fraymotifId);

    if (!fraymotif) {
      console.error(`Fraymotif ${fraymotifId} not found for ${attacker.id}`);
      return { success: false };
    }

    if (attacker.fraymotifCharge < fraymotif.cost) {
      return { success: false, message: 'Not enough charge!' };
    }

    attacker.fraymotifCharge -= fraymotif.cost;

    this.combat.addLog(`${attacker.id} used ${fraymotif.name}!`);

    const result = this.executeEffect(fraymotif, attacker, defender);

    return { success: true, result };
  }

  executeEffect(fraymotif, attacker, defender) {
    const { category, power, effect } = fraymotif;

    switch (category) {
      case 'physical':
      case 'special':
        return this.executeDamageMove(fraymotif, attacker, defender);
      case 'status':
        return this.executeStatusMove(fraymotif, attacker, defender);
      default:
        return {};
    }
  }

  executeDamageMove(fraymotif, attacker, defender) {
    const { power, effect, category } = fraymotif;
    let totalDamage = 0;
    let hits = 1;

    const basePower = this.calculatePower(power, attacker, defender);
    
    if (effect.type === 'multiHit' || effect.type === 'multiHitDefensive') {
      hits = this.calculateHits(effect, attacker, defender);
    }

    const move = {
      power: basePower,
      type: category === 'physical' ? 'physical' : 'special',
      accuracy: effect.alwaysHits ? 100 : 100,
      priority: effect.priority || 0
    };

    if (effect.type === 'priorityBoost') {
      move.priority += effect.bonus;
    }

    for (let i = 0; i < hits; i++) {
      let hitPower = basePower;

      if (effect.type === 'crescendo' && effect.powerMultipliers) {
        const turnIndex = attacker.crescendoTurn || 0;
        hitPower = basePower * effect.powerMultipliers[turnIndex];
      }

      const moveForHit = { ...move, power: hitPower };
      
      let accuracy = 100;
      if (effect.independentAccuracy) {
        accuracy = this.combat.checkAccuracy(attacker, defender, 100) ? 100 : 0;
      } else if (!effect.alwaysHits) {
        accuracy = this.combat.checkAccuracy(attacker, defender, 100) ? 100 : 0;
      }

      if (accuracy > 0 || effect.alwaysHits) {
        const isCrit = effect.guaranteedCrit || this.combat.checkCritical(attacker, defender);
        const damage = this.calculateDamageWithModifiers(attacker, defender, moveForHit, isCrit, effect);
        
        totalDamage += damage;
        defender.hp = Math.max(0, defender.hp - damage);

        if (effect.type === 'lifeSteal') {
          const healAmount = Math.floor(damage * effect.percent);
          attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
          this.combat.addLog(`${attacker.id} recovered ${healAmount} HP!`);
        }
      }
    }

    if (totalDamage > 0) {
      this.combat.addLog(`Dealt ${totalDamage} damage!`);
    }

    this.applySecondaryEffects(effect, attacker, defender);

    return { damage: totalDamage, hits };
  }

  executeStatusMove(fraymotif, attacker, defender) {
    const { effect } = fraymotif;

    switch (effect.type) {
      case 'statBoost':
        this.applyStatChanges(effect.target === 'self' ? attacker : defender, effect.stats, effect.duration);
        break;
      
      case 'statLower':
        this.applyStatChanges(effect.target === 'enemy' ? defender : attacker, effect.stats, effect.duration);
        break;

      case 'dualStatChange':
        this.applyStatChanges(defender, effect.enemyStats, effect.duration);
        this.applyStatChanges(attacker, effect.selfStats, effect.duration);
        break;

      case 'hpEqualize':
        const totalHP = attacker.hp + defender.hp;
        const equalizedHP = Math.floor(totalHP / 2);
        attacker.hp = Math.min(attacker.maxHp, equalizedHP);
        defender.hp = Math.min(defender.maxHp, equalizedHP);
        this.combat.addLog(`HP was equalized! Both now at ${equalizedHP} HP.`);
        break;

      case 'heal':
        const healAmount = Math.floor(attacker.maxHp * effect.percent);
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
        this.combat.addLog(`${attacker.id} recovered ${healAmount} HP!`);
        break;

      case 'defenseDouble':
        attacker.statusEffects.defenseDouble = {
          multiplier: 2,
          turnsRemaining: effect.duration
        };
        this.combat.addLog(`${attacker.id}'s defenses doubled!`);
        break;

      case 'regeneration':
        attacker.statusEffects.regeneration = {
          healPerTurn: effect.healPerTurn,
          turnsRemaining: effect.duration,
          statProtection: effect.statProtection
        };
        this.combat.addLog(`${attacker.id} will regenerate HP each turn!`);
        break;

      case 'statSwap':
        if (effect.swapDefenseStats) {
          [attacker.defense, attacker.specialDefense, defender.defense, defender.specialDefense] = 
          [defender.defense, defender.specialDefense, attacker.defense, attacker.specialDefense];
          this.combat.addLog('Defense stats were swapped!');
        } else if (effect.swapAttackStats) {
          [attacker.attack, attacker.specialAttack, defender.attack, defender.specialAttack] = 
          [defender.attack, defender.specialAttack, attacker.attack, attacker.specialAttack];
          this.combat.addLog('Attack stats were swapped!');
        }
        break;

      case 'complexStatChange':
        if (effect.targetSelection) {
          this.applyStatChanges(attacker, effect.positiveStats, effect.duration);
          this.applyStatChanges(attacker, effect.negativeStats, effect.duration);
        }
        break;

      case 'residualDamage':
        defender.statusEffects.residualDamage = {
          damagePerTurn: effect.damagePerTurn,
          turnsRemaining: effect.duration
        };
        this.combat.addLog(`${defender.id} will take residual damage each turn!`);
        break;

      case 'accuracyLowerAndFlinch':
        this.applyStatChanges(defender, { accuracy: effect.accuracy }, effect.duration);
        defender.flinched = true;
        this.combat.addLog(`${defender.id} flinched!`);
        break;

      case 'temporaryAccuracyCrit':
        attacker.stages.accuracy += effect.accuracyBoost;
        attacker.nextAttackCrit = true;
        this.combat.addLog(`${attacker.id}'s accuracy rose sharply!`);
        break;

      default:
        console.warn(`Unknown status effect type: ${effect.type}`);
    }

    return { statusApplied: true };
  }

  calculatePower(powerDef, attacker, defender) {
    if (!powerDef) return 0;

    switch (powerDef.type) {
      case 'weapon':
        const weapon = WEAPON_DATABASE[attacker.weapon];
        return Math.floor((weapon?.power || 50) * powerDef.multiplier);

      case 'fixed':
        return powerDef.amount;

      case 'animalCompanion':
        const baseWeapon = WEAPON_DATABASE[attacker.weapon];
        return Math.floor((baseWeapon?.power || 50) * powerDef.multiplier);

      case 'damageScaling':
        const missingHP = attacker.maxHp - attacker.hp;
        return Math.floor(missingHP * powerDef.multiplier);

      default:
        return 100;
    }
  }

  calculateHits(effect, attacker, defender) {
    if (effect.hits) {
      return effect.hits;
    }

    if (effect.hitsBasedOnHP) {
      const hpPercent = attacker.hp / attacker.maxHp;
      for (const threshold of effect.hpThresholds) {
        if (hpPercent <= threshold.maxHP) {
          let hits = threshold.hits;
          const weapon = WEAPON_DATABASE[attacker.weapon];
          if (weapon?.ability === 'doubleHit' && effect.doubleHitBonus) {
            hits += effect.doubleHitBonus;
          }
          return hits;
        }
      }
      return 2;
    }

    if (effect.hitsBasedOnEnemyDebuffs) {
      let debuffCount = 0;
      for (const stat in defender.stages) {
        if (defender.stages[stat] < 0) {
          debuffCount += Math.abs(defender.stages[stat]);
        }
      }
      return Math.min(5, effect.baseHits + debuffCount);
    }

    return 1;
  }

  calculateDamageWithModifiers(attacker, defender, move, isCritical, effect) {
    let damage = this.combat.calculateDamage(attacker, defender, move, isCritical);

    if (effect.type === 'damageBasedOnMissingHP') {
      const missingHP = attacker.maxHp - attacker.hp;
      damage = Math.floor(missingHP * 1.25);
    }

    if (effect.type === 'damageScaledByMissingHP') {
      const hpPercent = attacker.hp / attacker.maxHp;
      const damageMultiplier = Math.max(effect.minPercent || 0.1, hpPercent);
      damage = Math.floor(damage * damageMultiplier);
    }

    if (effect.type === 'doubleStages') {
      const originalAttackStage = attacker.stages.attack || 0;
      const originalSpAttackStage = attacker.stages.specialAttack || 0;
      const originalDefenseStage = defender.stages.defense || 0;
      const originalSpDefenseStage = defender.stages.specialDefense || 0;

      attacker.stages.attack *= 2;
      attacker.stages.specialAttack *= 2;
      defender.stages.defense *= 2;
      defender.stages.specialDefense *= 2;

      damage = this.combat.calculateDamage(attacker, defender, move, isCritical);

      attacker.stages.attack = originalAttackStage;
      attacker.stages.specialAttack = originalSpAttackStage;
      defender.stages.defense = originalDefenseStage;
      defender.stages.specialDefense = originalSpDefenseStage;
    }

    if (effect.type === 'alternateStatCalculation' && effect.useDefenseForAttack) {
      const level = attacker.level || 50;
      const attack = effect.special ? attacker.specialDefense : attacker.defense;
      const defense = effect.special ? defender.specialDefense : defender.defense;
      damage = Math.floor(((level * 2 / 5) + 2) * move.power * (attack / defense) / 50);
      damage = Math.floor(damage * 1.5) + 2;
    }

    if (effect.type === 'multiHitDefensive' && effect.useDefenseForAttack) {
      const level = attacker.level || 50;
      const attack = attacker.defense;
      const defense = defender.defense;
      damage = Math.floor(((level * 2 / 5) + 2) * move.power * (attack / defense) / 50);
      damage = Math.floor(damage * 1.5) + 2;
    }

    return damage;
  }

  applySecondaryEffects(effect, attacker, defender) {
    if (effect.type === 'disableAnimalCompanion') {
      attacker.statusEffects.animalCompanionDisabled = {
        turnsRemaining: effect.duration
      };
      this.combat.addLog(`${attacker.id}'s animal companion is exhausted!`);
    }

    if (effect.type === 'crescendo' && effect.locked) {
      attacker.statusEffects.crescendoLocked = {
        turnsRemaining: effect.duration,
        currentTurn: 0
      };
      attacker.crescendoTurn = 0;
    }

    if (effect.disableWeaponAbilities) {
      attacker.statusEffects.weaponAbilitiesDisabled = {
        turnsRemaining: 3
      };
      this.combat.addLog('Weapon abilities disabled!');
    }

    if (effect.type && effect.stats) {
      this.applyStatChanges(effect.target === 'enemy' ? defender : attacker, effect.stats, effect.duration);
    }
  }

  applyStatChanges(target, stats, duration) {
    for (const stat in stats) {
      const change = stats[stat];
      if (!target.stageModifiers) {
        target.stageModifiers = [];
      }

      target.stages[stat] = (target.stages[stat] || 0) + change;
      target.stages[stat] = Math.max(-6, Math.min(6, target.stages[stat]));

      target.stageModifiers.push({
        stat: stat,
        stages: change,
        turnsRemaining: duration,
        applied: Date.now()
      });

      const direction = change > 0 ? 'rose' : 'fell';
      const amount = Math.abs(change);
      this.combat.addLog(`${target.id}'s ${stat} ${direction} by ${amount}!`);
    }
  }
}

export function createFraymotifExecutor(combatSystem) {
  return new FraymotifExecutor(combatSystem);
}
