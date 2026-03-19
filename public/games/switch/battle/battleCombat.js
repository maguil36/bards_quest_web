import {
  CHARACTER_STATS,
  WEAPON_DATABASE,
  DEFAULT_WEAPONS,
  STRIFE_OPTIONS,
  STRIFE_CATEGORIES,
  ABILITIES
} from './battleCombatData.js';
import { createFraymotifExecutor } from './battleCombatFrayMotif.js';
import { getFraymotifAbilities } from './battleFraymotifData.js';

function createStageModifier(stat, stages, duration = 3) {
  return {
    stat: stat,
    stages: Math.max(-6, Math.min(6, stages)),
    turnsRemaining: duration,
    applied: Date.now()
  };
}

function decrementStageModifiers(modifiers) {
  return modifiers.filter(mod => {
    mod.turnsRemaining--;
    return mod.turnsRemaining > 0;
  });
}

class PokemonCombatSystem {
  constructor(gameState) {
    this.gameState = gameState;
    this.inCombat = false;
    this.playerTurn = true;

    this.player = null;
    this.enemy = null;

    this.battleLog = [];
    this.turnCount = 0;

    this.playerLastMove = null;
    this.playerMoveUsageCount = {};

    this.delayedMoves = [];

    this.playerWeapon = null;
    this.playerWeaponDeck = [];
    this.playerBombsRemaining = 10;
    this.playerAbstainCharged = false;
    this.playerThrownBombs = [];
    this.playerFragmotifCharge = 0;
    this.playerStageModifiers = [];

    this.enemyStageModifiers = [];

    this.pendingActions = [];
    this.currentTurnData = null;

    this.fraymotifExecutor = createFraymotifExecutor(this);
  }

  initBattler(isPlayer, characterId, customEnemy = null) {
    const defaultStats = {
      hp: 100,
      maxHp: 100,
      attack: 50,
      defense: 50,
      specialAttack: 50,
      specialDefense: 50,
      speed: 50
    };

    const stages = {
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
      accuracy: 0,
      evasion: 0
    };

    if (isPlayer) {
      const baseStats = CHARACTER_STATS[characterId] || defaultStats;
      const savedHp = this.gameState.characters[characterId]?.currentHp;
      const currentHp = savedHp !== undefined ? savedHp : baseStats.hp;
      const savedCharge = this.gameState.characters[characterId]?.fraymotifCharge;
      const fraymotifCharge = savedCharge !== undefined ? Math.min(1000, savedCharge) : 0;

      return {
        id: characterId,
        ...baseStats,
        hp: currentHp,
        stages: { ...stages },
        ability: ABILITIES[characterId] || ABILITIES.opal,
        moves: STRIFE_OPTIONS[characterId] || STRIFE_OPTIONS.opal,
        weapon: DEFAULT_WEAPONS[characterId] || 'fist',
        weaponDeck: [DEFAULT_WEAPONS[characterId]],
        stageModifiers: [],
        fraymotifCharge: fraymotifCharge,
        critStage: 0,
        statusEffects: {},
        isPlayer: true
      };
    } else {
      if (customEnemy) {
        const baseStats = CHARACTER_STATS[customEnemy.id] || defaultStats;
        return {
          id: customEnemy.id || 'derseAgent',
          name: customEnemy.name || 'Derse Agent',
          hp: customEnemy.health || baseStats.hp,
          maxHp: customEnemy.maxHealth || baseStats.maxHp,
          attack: customEnemy.attack || baseStats.attack,
          defense: customEnemy.defense || baseStats.defense,
          specialAttack: customEnemy.specialAttack || baseStats.specialAttack,
          specialDefense: customEnemy.specialDefense || baseStats.specialDefense,
          speed: customEnemy.speed || baseStats.speed,
          stages: { ...stages },
          ability: { name: 'None', effect: 'none' },
          moves: STRIFE_OPTIONS[customEnemy.id] || STRIFE_OPTIONS.derseAgent,
          statusEffects: {},
          isPlayer: false
        };
      }

      const baseStats = CHARACTER_STATS.derseAgent || defaultStats;
      return {
        id: 'derseAgent',
        name: 'Derse Agent',
        ...baseStats,
        stages: { ...stages },
        weapon: null,
        stageModifiers: [],
        critStage: 0,
        ability: { name: 'None', effect: 'none' },
        moves: STRIFE_OPTIONS.derseAgent,
        statusEffects: {},
        isPlayer: false
      };
    }
  }

  getPriority(battler, actionType, opponentAction = null) {
    let priority = 0;

    if (actionType === 'abjure' || actionType === 'apparate') {
      priority = 4;
    }

    if (battler.weapon) {
      const weapon = WEAPON_DATABASE[battler.weapon];
      if (weapon && weapon.ability === 'priority') {
        if (opponentAction && opponentAction.move) {
          if (opponentAction.move.type === 'physical') {
            priority += 1;
          }
        } else {
          priority += 1;
        }
      }
    }

    return priority;
  }

  determineActionOrder(playerAction, enemyAction) {
    const playerPriority = this.getPriority(this.player, playerAction.type, enemyAction);
    const enemyPriority = this.getPriority(this.enemy, enemyAction.type, playerAction);

    if (playerPriority !== enemyPriority) {
      return playerPriority > enemyPriority ? 'player' : 'enemy';
    }

    const playerSpeed = this.player.speed * this.getStatStageMultiplier(this.player.stages.speed);
    const enemySpeed = this.enemy.speed * this.getStatStageMultiplier(this.enemy.stages.speed);

    if (playerAction.type === 'adjudge') {
      const halvedPlayerSpeed = Math.floor(playerSpeed / 2);
      return halvedPlayerSpeed >= enemySpeed ? 'player' : 'enemy';
    }

    if (playerSpeed !== enemySpeed) {
      return playerSpeed > enemySpeed ? 'player' : 'enemy';
    }

    return Math.random() < 0.5 ? 'player' : 'enemy';
  }

  startCombat(enemy = null, player = null) {
    this.inCombat = true;
    this.playerTurn = true;
    this.turnCount = 0;
    this.battleLog = [];
    this.playerLastMove = null;
    this.playerMoveUsageCount = {};
    this.delayedMoves = [];

    const currentChar = player || this.gameState.getCurrentCharacter();
    this.player = this.initBattler(true, currentChar.id);
    this.enemy = this.initBattler(false, null, enemy);

    this.applyAbilityOnStart();
    this.addLog(`Battle started against ${this.enemy.name}!`);

    return {
      player: this.player,
      enemy: this.enemy
    };
  }

  applyAbilityOnStart() {
    if (this.player.ability.effect === 'enemyAccuracy') {
      this.enemy.stages.accuracy += (this.player.ability.value / 10);
      this.addLog(`${this.player.id}'s ${this.player.ability.name} lowered enemy accuracy!`);
    }

    if (this.player.ability.effect === 'evasionBoost') {
      this.player.stages.evasion += this.player.ability.value;
      this.addLog(`${this.player.id}'s ${this.player.ability.name} raised evasion!`);
    }

    if (this.player.ability.effect === 'startCombatLowerAttack') {
      this.enemy.stages.attack -= 1;
      this.addLog(`${this.player.id}'s ${this.player.ability.name} lowered enemy attack!`);
    }
  }

  getStatStageMultiplier(stage) {
    const clampedStage = Math.max(-6, Math.min(6, stage));

    if (clampedStage === 0) {
      return 1;
    } else if (clampedStage > 0) {
      return 1 + (clampedStage / 2);
    } else {
      return 1 / (1 + (Math.abs(clampedStage) / 2));
    }
  }

  getAccuracyEvasionMultiplier(accuracyStage, evasionStage) {
    const netStage = accuracyStage - evasionStage;
    return this.getStatStageMultiplier(netStage);
  }

  checkAccuracy(attacker, defender, moveAccuracy) {
    if (moveAccuracy === 100 && attacker.stages.accuracy === 0 && defender.stages.evasion === 0) {
      return true;
    }

    const accuracyMult = this.getAccuracyEvasionMultiplier(attacker.stages.accuracy, defender.stages.evasion);
    const finalAccuracy = moveAccuracy * accuracyMult;
    
    return Math.random() * 100 < finalAccuracy;
  }

  checkCritical(attacker, defender) {
    if (defender && defender.ability && defender.ability.effect === 'noCrits') {
      return false;
    }

    const critStage = attacker.critStage || 0;

    const critChances = {
      0: 1/24,
      1: 1/8,
      2: 1/2,
      3: 1.0
    };

    const clampedStage = Math.max(0, Math.min(3, critStage));
    const critChance = critChances[clampedStage];

    return Math.random() < critChance;
  }

  calculateDamage(attacker, defender, move, isCritical = false) {
    if (move.power === 0) return 0;

    const level = attacker.level || 50;
    const isPhysical = move.type === 'physical';

    let attack = isPhysical ? attacker.attack : attacker.specialAttack;
    let defense = isPhysical ? defender.defense : defender.specialDefense;

    const attackStage = isPhysical ? attacker.stages.attack : attacker.stages.specialAttack;
    const defenseStage = isPhysical ? defender.stages.defense : defender.stages.specialDefense;

    // Apply accuracy/evasion modifiers
    const accuracyMultiplier = this.getAccuracyEvasionMultiplier(
      attacker.stages.accuracy || 0,
      defender.stages.evasion || 0
    );

    if (!isCritical || attackStage > 0) {
      attack *= this.getStatStageMultiplier(attackStage);
    }

    if (!isCritical || defenseStage < 0) {
      defense *= this.getStatStageMultiplier(defenseStage);
    }

    if (defender.statusEffects.defenseBoost) {
      defense *= defender.statusEffects.defenseBoost.multiplier;
    }

    let damage = Math.floor(((level * 2 / 5) + 2) * move.power * (attack / defense) / 50);

    const randomFactor = 0.85 + Math.random() * 0.15;
    damage = Math.floor(damage * randomFactor);

    if (isCritical) {
      damage = Math.floor(damage * 1.5);
    }

    if (attacker.ability.effect === 'lowAccuracyHighDamage' && !isPhysical) {
      damage = Math.floor(damage * 2);
    }

    if (attacker.isPlayer && this.playerLastMove === move.name && attacker.ability.effect === 'repeatMoveHalved') {
      damage = Math.floor(damage / 2);
    }

    return Math.max(1, damage);
  }

  changeStats(target, statChanges, sourceAbility = null) {
    const messages = [];

    for (const [stat, change] of Object.entries(statChanges)) {
      let actualChange = change;

      if (this.player && this.player.ability && this.player.ability.effect === 'doubleStatChanges') {
        actualChange = change * 2;
      }

      if (!target.isPlayer && sourceAbility === 'Tactician' && change < 0) {
        actualChange = change * 2;
      }

      const oldStage = target.stages[stat];
      target.stages[stat] = Math.max(-6, Math.min(6, target.stages[stat] + actualChange));
      const netChange = target.stages[stat] - oldStage;

      if (netChange !== 0) {
        const targetName = target.isPlayer ? this.player.id : this.enemy.name;
        const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
        const changeDesc = netChange > 0 ? 'rose' : 'fell';
        const amount = Math.abs(netChange) === 1 ? '' : ` sharply`;
        messages.push(`${targetName}'s ${statName}${amount} ${changeDesc}!`);
      }
    }

    return messages;
  }

  executeMove(attacker, defender, moveIndex) {
    if (moveIndex < 0 || moveIndex >= attacker.moves.length) {
      return { success: false, message: 'Invalid move!' };
    }

    const move = attacker.moves[moveIndex];
    const results = { success: true, messages: [], damage: 0, critical: false, moveName: move.name };
    
    if (move.requiresQuest && attacker.isPlayer) {
      const hasCompletedQuest = this.gameState.hasItem('lostAnimal');
      if (!hasCompletedQuest) {
        results.success = false;
        results.messages.push(`Cannot use ${move.name} - quest not completed!`);
        return results;
      }
    }
    
    if (move.upgradedPower && attacker.isPlayer) {
      const hasUpgrade = this.gameState.questProgress.isabelaUpgrade === true;
      if (hasUpgrade) {
        move.power = move.upgradedPower;
      }
    }

    results.messages.push(`${attacker.isPlayer ? attacker.id : attacker.name} used ${move.name}!`);

    if (!this.checkAccuracy(attacker, defender, move.accuracy)) {
      results.messages.push(`The attack missed!`);
      return results;
    }

    if (move.type === 'status') {
      this.handleStatusMove(attacker, defender, move, results);
    } else {
      this.handleDamageMove(attacker, defender, move, results);
    }

    return results;
  }

  handleStatusMove(attacker, defender, move, results) {
    if (!move.effect) return;

    switch (move.effect.type) {
      case 'statChange':
        const target = move.effect.target === 'self' ? attacker : defender;
        const sourceAbility = attacker.ability.name === 'Tactician' ? 'Tactician' : null;
        const statMessages = this.changeStats(target, move.effect.stats, sourceAbility);
        results.statChanges = move.effect.stats;
        results.statTarget = move.effect.target;
        results.messages.push(...statMessages);
        break;

      case 'heal':
        const healAmount = Math.floor(attacker.maxHp * (move.effect.percent / 100));
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
        results.healAmount = healAmount;
        results.messages.push(`${attacker.isPlayer ? attacker.id : attacker.name} restored ${healAmount} HP!`);
        break;

      case 'defenseBoost':
        attacker.statusEffects.defenseBoost = {
          turnsLeft: move.effect.turns,
          multiplier: move.effect.multiplier
        };
        results.messages.push(`${attacker.isPlayer ? attacker.id : attacker.name}'s defense doubled!`);
        break;

      case 'delayed':
        this.delayedMoves.push({
          move: move,
          turnsLeft: move.effect.turns,
          attacker: attacker,
          defender: defender
        });
        results.messages.push(`${attacker.isPlayer ? attacker.id : attacker.name} is preparing Doom Attack!`);
        break;

      case 'selfKO':
        attacker.hp = 0;
        results.messages.push(`${attacker.isPlayer ? attacker.id : attacker.name} sacrificed itself!`);
        break;
    }
  }

  handleDamageMove(attacker, defender, move, results) {
    if (defender.statusEffects.abjure) {
      results.messages.push(`${defender.isPlayer ? defender.id : defender.name} blocked the attack with ABJURE!`);
      delete defender.statusEffects.abjure;
      return;
    }

    if (defender.statusEffects.apparate) {
      results.messages.push(`${defender.isPlayer ? defender.id : defender.name} evaded the attack with APPARATE!`);
      return;
    }

    const checkCrit = move.effect?.type === 'alwaysCrit' || this.checkCritical(attacker, defender);

    if (move.effect?.type === 'multihit') {
      const { min, max } = move.effect;
      const hits = Math.floor(Math.random() * (max - min + 1)) + min;
      let totalDamage = 0;
      results.multiHitData = [];

      for (let i = 0; i < hits; i++) {
        const damage = this.calculateDamage(attacker, defender, move, false);
        defender.hp = Math.max(0, defender.hp - damage);
        totalDamage += damage;
        results.multiHitData.push({
          hitNumber: i + 1,
          damage: damage,
          defenderHp: defender.hp
        });
      }

      results.damage = totalDamage;
      results.hits = hits;
      results.messages.push(`Hit ${hits} time(s)!`);
    } else {
      const damage = this.calculateDamage(attacker, defender, move, checkCrit);
      defender.hp = Math.max(0, defender.hp - damage);
      results.damage = damage;

      if (checkCrit) {
        results.critical = true;
        results.messages.push(`A critical hit!`);
        attacker.critStage = 0;
      }

      results.messages.push(`Dealt ${damage} damage!`);
    }

    if (defender.ability && defender.ability.effect === 'defenseOnHit' && results.damage > 0) {
      const isPhysical = move.type === 'physical';
      const statToRaise = isPhysical ? 'defense' : 'specialDefense';
      const statMessages = this.changeStats(defender, { [statToRaise]: 1 });
      results.messages.push(...statMessages);
    }

    if (move.effect?.type === 'statChange') {
      const target = move.effect.target === 'self' ? attacker : defender;
      const sourceAbility = attacker.ability.name === 'Tactician' ? 'Tactician' : null;
      const statMessages = this.changeStats(target, move.effect.stats, sourceAbility);
      results.statChanges = move.effect.stats;
      results.statTarget = move.effect.target;
      results.messages.push(...statMessages);
    }
  }

  executeStrifeOption(strifeOptionId) {
    const results = { success: true, messages: [], damage: 0, critical: false };

    switch (strifeOptionId) {
      case 'aggrieve':
        return this.strifeAggrieve();
      case 'assault':
        return this.strifeAssault();
      case 'avenge':
        return this.strifeAvenge();
      case 'assail':
        return this.strifeAssail();
      case 'adjudge':
        return this.strifeAdjudge();
      case 'annihilate':
        return this.strifeAnnihilate();
      case 'abuse':
        return this.strifeAbuse();
      case 'accost':
        return this.strifeAccost();
      case 'antagonize':
        return this.strifeAntagonize();
      case 'afflict':
        return this.strifeAfflict();
      case 'aggress':
        return this.strifeAggress();
      case 'accuse':
        return this.strifeAccuse();
      case 'align':
        return this.strifeAlign();
      case 'avoid':
        return this.strifeAvoid();
      case 'analyze':
        return this.strifeAnalyze();
      case 'apologize':
        return this.strifeApologize();
      case 'abjure':
        return this.strifeAbjure();
      case 'apparate':
        return this.strifeApparate();
      case 'ameliorate':
        return this.strifeAmeliorate();
      case 'abstain':
        return this.strifeAbstain();
      case 'activate':
        return this.strifeActivate();
      case 'alternate':
        return this.strifeAlternate();
      case 'alchemize':
        return this.strifeAlchemize();
      case 'abscond':
        return this.strifeAbscond();
      case 'anthem':
        return this.strifeAnthem();
      default:
        results.success = false;
        results.messages.push(`Strife option ${strifeOptionId} not yet implemented!`);
        return results;
    }
  }

  calculateWeaponDamage(attacker, defender, weaponPower, damageMultiplier = 1, isCritical = false) {
    const weapon = WEAPON_DATABASE[attacker.weapon];
    if (!weapon) return 0;

    const level = attacker.level || 50;
    const isPhysical = weapon.type === 'physical';

    let attack = isPhysical ? attacker.attack : attacker.specialAttack;
    let defense = isPhysical ? defender.defense : defender.specialDefense;

    const attackStage = isPhysical ? attacker.stages.attack : attacker.stages.specialAttack;
    const defenseStage = isPhysical ? defender.stages.defense : defender.stages.specialDefense;

    if (!isCritical || attackStage > 0) {
      attack *= this.getStatStageMultiplier(attackStage);
    }

    if (!isCritical || defenseStage < 0) {
      defense *= this.getStatStageMultiplier(defenseStage);
    }

    if (defender.statusEffects.defenseBoost) {
      defense *= defender.statusEffects.defenseBoost.multiplier;
    }

    let damage = Math.floor(((level * 2 / 5) + 2) * weaponPower * (attack / defense) / 50);

    const randomFactor = 0.85 + Math.random() * 0.15;
    damage = Math.floor(damage * randomFactor);

    damage = Math.floor(damage * damageMultiplier);

    if (isCritical) {
      damage = Math.floor(damage * 1.5);
    }

    return Math.max(1, damage);
  }

  strifeAggrieve() {
    const results = { success: true, messages: [], damage: 0, critical: false };

    const weapon = WEAPON_DATABASE[this.player.weapon];
    if (!weapon) {
      results.success = false;
      results.messages.push('No weapon equipped!');
      return results;
    }

    results.messages.push(`${this.player.id} used AGGRIEVE!`);

    if (this.player.id === 'tyson') {
      if (!this.player.statusEffects.thrownBombs) {
        this.player.statusEffects.thrownBombs = [];
      }

      if (this.player.statusEffects.bombsRemaining === undefined) {
        this.player.statusEffects.bombsRemaining = 10;
      }

      if (this.player.statusEffects.bombsRemaining > 0) {
        const charged = this.player.statusEffects.abstainCharged || false;
        this.player.statusEffects.thrownBombs.push({
          turnsActive: 0,
          charged: charged,
          autoDetonated: false
        });
        this.player.statusEffects.bombsRemaining--;
        this.player.statusEffects.abstainCharged = false;

        results.messages.push(`Bomb thrown! (${this.player.statusEffects.bombsRemaining} bombs remaining)`);
        return results;
      } else {
        results.success = false;
        results.messages.push(`No bombs remaining!`);
        return results;
      }
    }

    if (!this.checkAccuracy(this.player, this.enemy, 100)) {
      results.messages.push(`The attack missed!`);
      return results;
    }

    const isCritical = this.checkCritical(this.player, this.enemy);

    if (weapon.ability === 'doubleHit') {
      let totalDamage = 0;
      for (let i = 0; i < 2; i++) {
        const damage = this.calculateWeaponDamage(this.player, this.enemy, weapon.power, 1, false);
        this.enemy.hp = Math.max(0, this.enemy.hp - damage);
        totalDamage += damage;
      }
      results.damage = totalDamage;
      results.messages.push(`Hit twice for ${totalDamage} damage!`);
    } else {
      const damage = this.calculateWeaponDamage(this.player, this.enemy, weapon.power, 1, isCritical);
      this.enemy.hp = Math.max(0, this.enemy.hp - damage);
      results.damage = damage;

      if (isCritical) {
        results.critical = true;
        results.messages.push(`A critical hit!`);
        this.player.critStage = 0;
      }

      results.messages.push(`Dealt ${damage} damage!`);
    }

    this.player.fraymotifCharge = Math.min(1000, this.player.fraymotifCharge + results.damage);

    if (weapon.ability === 'lowerSpeed') {
      const statMessages = this.changeStats(this.enemy, { speed: -1 });
      results.messages.push(...statMessages);
    }

    return results;
  }

  strifeAssault() {
    const results = { success: true, messages: [], damage: 0, critical: false };

    const weapon = WEAPON_DATABASE[this.player.weapon];
    if (!weapon) {
      results.success = false;
      results.messages.push('No weapon equipped!');
      return results;
    }

    results.messages.push(`${this.player.id} used ASSAULT!`);

    if (!this.checkAccuracy(this.player, this.enemy, 100)) {
      results.messages.push(`The attack missed!`);
      return results;
    }

    const isCritical = this.checkCritical(this.player, this.enemy);
    const damage = this.calculateWeaponDamage(this.player, this.enemy, weapon.power, 2, isCritical);
    this.enemy.hp = Math.max(0, this.enemy.hp - damage);
    results.damage = damage;

    if (isCritical) {
      results.critical = true;
      results.messages.push(`A critical hit!`);
      this.player.critStage = 0;
    }

    results.messages.push(`Dealt ${damage} damage!`);

    const statMessages = this.changeStats(this.player, { speed: -1 });
    results.messages.push(...statMessages);

    return results;
  }

  strifeAvenge() {
    const results = { success: true, messages: [], damage: 0, critical: false };

    const weapon = WEAPON_DATABASE[this.player.weapon];
    if (!weapon) {
      results.success = false;
      results.messages.push('No weapon equipped!');
      return results;
    }

    results.messages.push(`${this.player.id} used AVENGE!`);

    if (!this.checkAccuracy(this.player, this.enemy, 100)) {
      results.messages.push(`The attack missed!`);
      return results;
    }

    const hits = Math.floor(Math.random() * 4) + 2;
    let totalDamage = 0;
    results.multiHitData = [];

    for (let i = 0; i < hits; i++) {
      const damage = this.calculateWeaponDamage(this.player, this.enemy, weapon.power, 0.5, false);
      this.enemy.hp = Math.max(0, this.enemy.hp - damage);
      totalDamage += damage;
      results.multiHitData.push({
        hitNumber: i + 1,
        damage: damage,
        defenderHp: this.enemy.hp
      });
    }

    results.damage = totalDamage;
    results.hits = hits;

    const statMessages = this.changeStats(this.enemy, { specialDefense: -1 });
    results.messages.push(...statMessages);

    results.statChanges = { specialDefense: -1 };
    results.statTarget = 'enemy';

    return results;
  }

  strifeAssail() {
    const results = { success: true, messages: [], damage: 0, critical: false };

    const weapon = WEAPON_DATABASE[this.player.weapon];
    if (!weapon) {
      results.success = false;
      results.messages.push('No weapon equipped!');
      return results;
    }

    results.messages.push(`${this.player.id} used ASSAIL!`);

    if (!this.checkAccuracy(this.player, this.enemy, 100)) {
      results.messages.push(`The attack missed!`);
      return results;
    }

    const hits = Math.floor(Math.random() * 4) + 2;
    let totalDamage = 0;
    results.multiHitData = [];

    for (let i = 0; i < hits; i++) {
      const damage = this.calculateWeaponDamage(this.player, this.enemy, weapon.power, 0.5, false);
      this.enemy.hp = Math.max(0, this.enemy.hp - damage);
      totalDamage += damage;
      results.multiHitData.push({
        hitNumber: i + 1,
        damage: damage,
        defenderHp: this.enemy.hp
      });
    }

    results.damage = totalDamage;
    results.hits = hits;

    const statMessages = this.changeStats(this.player, { defense: -1 });
    results.messages.push(...statMessages);

    results.statChanges = { defense: -1 };
    results.statTarget = 'self';

    return results;
  }

  strifeAdjudge() {
    const results = { success: true, messages: [], damage: 0, critical: false };

    results.messages.push(`${this.player.id} used ADJUDGE!`);

    if (!this.checkAccuracy(this.player, this.enemy, 100)) {
      results.messages.push(`The attack missed!`);
      return results;
    }

    const isCritical = this.checkCritical(this.player, this.enemy);
    const damage = this.calculateWeaponDamage(this.player, this.enemy, 120, 1, isCritical);
    this.enemy.hp = Math.max(0, this.enemy.hp - damage);
    results.damage = damage;

    if (isCritical) {
      results.critical = true;
      results.messages.push(`A critical hit!`);
      this.player.critStage = 0;
    }

    results.messages.push(`Dealt ${damage} damage!`);

    return results;
  }

  strifeAnnihilate() {
    const results = { success: true, messages: [], damage: 0, critical: false };

    const weapon = WEAPON_DATABASE[this.player.weapon];
    if (!weapon) {
      results.success = false;
      results.messages.push('No weapon equipped!');
      return results;
    }

    results.messages.push(`${this.player.id} used ANNIHILATE!`);

    if (!this.checkAccuracy(this.player, this.enemy, 100)) {
      results.messages.push(`The attack missed!`);
      return results;
    }

    const isCritical = this.checkCritical(this.player, this.enemy);
    const damage = this.calculateWeaponDamage(this.player, this.enemy, weapon.power, 3, isCritical);
    this.enemy.hp = Math.max(0, this.enemy.hp - damage);
    results.damage = damage;

    if (isCritical) {
      results.critical = true;
      results.messages.push(`A critical hit!`);
      this.player.critStage = 0;
    }

    results.messages.push(`Dealt ${damage} damage!`);

    const statMessages = this.changeStats(this.player, { accuracy: -1 });
    results.messages.push(...statMessages);

    results.statChanges = { accuracy: -1 };
    results.statTarget = 'self';

    return results;
  }

  strifeAbuse() {
    const results = { success: true, messages: [], damage: 0 };

    results.messages.push(`${this.player.id} used ABUSE!`);

    const statMessages = this.changeStats(this.enemy, { defense: -1 });
    results.messages.push(...statMessages);

    results.statChanges = { defense: -1 };
    results.statTarget = 'enemy';

    return results;
  }

  strifeAccost() {
    const results = { success: true, messages: [], damage: 0 };

    results.messages.push(`${this.player.id} used ACCOST!`);

    const statMessages = this.changeStats(this.enemy, { attack: -1 });
    results.messages.push(...statMessages);

    results.statChanges = { attack: -1 };
    results.statTarget = 'enemy';

    return results;
  }

  strifeAntagonize() {
    const results = { success: true, messages: [], damage: 0 };

    results.messages.push(`${this.player.id} used ANTAGONIZE!`);

    const selfMessages = this.changeStats(this.player, { attack: 2 });
    results.messages.push(...selfMessages);

    const enemyMessages = this.changeStats(this.enemy, { attack: 1 });
    results.messages.push(...enemyMessages);

    results.statChanges = { attack: 2 };
    results.statTarget = 'self';
    results.enemyStatChanges = { attack: 1 };

    return results;
  }

  strifeAfflict() {
    const results = { success: true, messages: [], damage: 0 };

    results.messages.push(`${this.player.id} used AFFLICT!`);

    const statMessages = this.changeStats(this.enemy, { specialDefense: -1 });
    results.messages.push(...statMessages);

    results.statChanges = { specialDefense: -1 };
    results.statTarget = 'enemy';

    return results;
  }

  strifeAggress() {
    const results = { success: true, messages: [], damage: 0 };

    results.messages.push(`${this.player.id} used AGGRESS!`);

    const statMessages = this.changeStats(this.player, { attack: 1 });
    results.messages.push(...statMessages);

    this.player.fraymotifCharge = Math.min(1000, this.player.fraymotifCharge + this.player.attack);
    results.messages.push(`Gained ${this.player.attack} fraymotif charge!`);

    results.statChanges = { attack: 1 };
    results.statTarget = 'self';

    return results;
  }

  strifeAccuse() {
    const results = { success: true, messages: [], damage: 0 };

    results.messages.push(`${this.player.id} used ACCUSE!`);

    const statMessages = this.changeStats(this.player, { specialAttack: 1 });
    results.messages.push(...statMessages);

    results.statChanges = { specialAttack: 1 };
    results.statTarget = 'self';

    return results;
  }

  strifeAlign() {
    const results = { success: true, messages: [], damage: 0 };

    results.messages.push(`${this.player.id} used ALIGN!`);

    const statMessages = this.changeStats(this.player, { accuracy: 1 });
    results.messages.push(...statMessages);

    results.statChanges = { accuracy: 1 };
    results.statTarget = 'self';

    return results;
  }

  strifeAvoid() {
    const results = { success: true, messages: [], damage: 0 };

    results.messages.push(`${this.player.id} used AVOID!`);

    const statMessages = this.changeStats(this.player, { evasion: 1 });
    results.messages.push(...statMessages);

    results.statChanges = { evasion: 1 };
    results.statTarget = 'self';

    return results;
  }

  strifeAnalyze() {
    const results = { success: true, messages: [], damage: 0 };

    results.messages.push(`${this.player.id} used ANALYZE!`);

    this.player.critStage = Math.min(3, this.player.critStage + 1);
    results.messages.push(`${this.player.id}'s critical hit ratio rose!`);

    results.statChanges = { critical: 1 };
    results.statTarget = 'self';

    return results;
  }

  strifeApologize() {
    const results = { success: true, messages: [], damage: 0 };

    results.messages.push(`${this.player.id} used APOLOGIZE!`);

    const selfMessages = this.changeStats(this.player, { attack: -1 });
    results.messages.push(...selfMessages);

    const enemyMessages = this.changeStats(this.enemy, { attack: -1, specialAttack: -1 });
    results.messages.push(...enemyMessages);

    results.statChanges = { attack: -1 };
    results.statTarget = 'self';
    results.enemyStatChanges = { attack: -1, specialAttack: -1 };

    return results;
  }

  strifeAbjure() {
    const results = { success: true, messages: [], damage: 0 };

    results.messages.push(`${this.player.id} used ABJURE!`);

    this.player.statusEffects.abjure = true;
    results.messages.push(`${this.player.id} is preparing to block the next attack!`);

    return results;
  }

  strifeApparate() {
    const results = { success: true, messages: [], damage: 0 };

    results.messages.push(`${this.player.id} used APPARATE!`);

    this.player.statusEffects.apparate = true;
    results.messages.push(`${this.player.id} is preparing to evade!`);

    return results;
  }

  strifeAmeliorate() {
    const results = { success: true, messages: [], damage: 0 };

    results.messages.push(`${this.player.id} used AMELIORATE!`);

    this.player.statusEffects.ameliorate = {
      turnsLeft: 5
    };
    results.messages.push(`${this.player.id} will regenerate HP for 5 turns!`);

    return results;
  }

  strifeAbstain() {
    const results = { success: true, messages: [], damage: 0 };

    results.messages.push(`${this.player.id} used ABSTAIN!`);

    this.player.statusEffects.abstainCharged = true;
    results.messages.push(`${this.player.id} charged the next bomb!`);

    return results;
  }

  strifeActivate() {
    const results = { success: true, messages: [], damage: 0 };

    if (!this.player.statusEffects.thrownBombs || this.player.statusEffects.thrownBombs.length === 0) {
      results.success = false;
      results.messages.push(`${this.player.id} used ACTIVATE!`);
      results.messages.push(`No bombs to detonate!`);
      return results;
    }

    results.messages.push(`${this.player.id} used ACTIVATE!`);

    let totalDamage = 0;
    const bombs = [...this.player.statusEffects.thrownBombs];

    for (const bomb of bombs) {
      const power = bomb.charged ? 300 : 100 * bomb.turnsActive;
      const damage = this.calculateWeaponDamage(this.player, this.enemy, power, 1, false);
      this.enemy.hp = Math.max(0, this.enemy.hp - damage);
      totalDamage += damage;
      results.messages.push(`Bomb detonated for ${damage} damage!`);
    }

    this.player.statusEffects.thrownBombs = [];
    results.damage = totalDamage;
    results.messages.push(`Total damage: ${totalDamage}!`);

    return results;
  }

  strifeAlternate() {
    const results = { success: true, messages: [], damage: 0 };

    results.messages.push(`${this.player.id} used ALTERNATE!`);

    if (this.player.id === 'alexis') {
      if (!this.player.weaponDeck || this.player.weaponDeck.length <= 1) {
        results.success = false;
        results.messages.push(`No other weapons in deck!`);
        return results;
      }

      const currentIndex = this.player.weaponDeck.indexOf(this.player.weapon);
      const nextIndex = (currentIndex + 1) % this.player.weaponDeck.length;
      this.player.weapon = this.player.weaponDeck[nextIndex];

      const weaponInfo = WEAPON_DATABASE[this.player.weapon];
      results.messages.push(`Switched to ${weaponInfo.name}!`);
    } else if (this.player.id === 'austine') {
      results.messages.push(`Switched crossbow bolt type!`);
    } else {
      results.success = false;
      results.messages.push(`This character cannot use ALTERNATE!`);
    }

    return results;
  }

  strifeAlchemize() {
    const results = { success: true, messages: [], damage: 0 };

    results.messages.push(`${this.player.id} used ALCHEMIZE!`);
    results.messages.push(`ALCHEMIZE UI not yet implemented - requires grist system integration.`);

    return results;
  }

  strifeAbscond() {
    const results = { success: true, messages: [], damage: 0, abscond: true };

    results.messages.push(`${this.player.id} used ABSCOND!`);
    results.messages.push(`Fled from battle!`);

    return results;
  }

  strifeAnthem() {
    const results = { success: true, messages: [], openFraymotif: true };

    if (this.player.fraymotifCharge < 1000) {
      results.success = false;
      results.openFraymotif = false;
      results.messages.push(`${this.player.id} used ANTHEM!`);
      results.messages.push(`Not enough charge! (${this.player.fraymotifCharge}/1000)`);
      return results;
    }

    results.messages.push(`${this.player.id} used ANTHEM!`);
    results.messages.push(`Opening fraymotif menu...`);

    return results;
  }

  handleEndOfTurn() {
    const messages = [];

    if (this.player.statusEffects.ameliorate) {
      const healAmount = Math.floor(this.player.maxHp / 16);
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
      messages.push(`${this.player.id} restored ${healAmount} HP from AMELIORATE!`);

      this.player.statusEffects.ameliorate.turnsLeft--;
      if (this.player.statusEffects.ameliorate.turnsLeft <= 0) {
        delete this.player.statusEffects.ameliorate;
        messages.push(`AMELIORATE effect ended!`);
      }
    }

    if (this.player.statusEffects.apparate) {
      this.player.critStage = Math.min(3, this.player.critStage + 1);
      messages.push(`${this.player.id}'s critical hit ratio rose from APPARATE!`);
      delete this.player.statusEffects.apparate;
    }

    if (this.player.statusEffects.thrownBombs) {
      for (const bomb of this.player.statusEffects.thrownBombs) {
        bomb.turnsActive++;
        if (bomb.turnsActive >= 3 && !bomb.autoDetonated) {
          const power = bomb.charged ? 300 : 100 * bomb.turnsActive;
          const damage = this.calculateWeaponDamage(this.player, this.enemy, power, 1, false);
          this.enemy.hp = Math.max(0, this.enemy.hp - damage);
          messages.push(`Bomb auto-detonated for ${damage} damage!`);
          bomb.autoDetonated = true;
        }
      }
      this.player.statusEffects.thrownBombs = this.player.statusEffects.thrownBombs.filter(b => !b.autoDetonated);
    }

    if (this.player.statusEffects.defenseBoost) {
      this.player.statusEffects.defenseBoost.turnsLeft--;
      if (this.player.statusEffects.defenseBoost.turnsLeft <= 0) {
        delete this.player.statusEffects.defenseBoost;
        messages.push(`${this.player.id}'s defense boost wore off!`);
      }
    }

    if (this.player.ability.effect === 'endTurnHeal') {
      const healAmount = Math.floor(this.player.maxHp / 16);
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
      messages.push(`${this.player.id} restored ${healAmount} HP from Life Player!`);
    }

    this.delayedMoves = this.delayedMoves.filter(dm => {
      dm.turnsLeft--;
      if (dm.turnsLeft <= 0) {
        messages.push(dm.move.effect.failMessage || 'Delayed attack activated!');
        return false;
      }
      return true;
    });

    return messages;
  }

  getEffectiveSpeed(battler) {
    const speedMultiplier = this.getStatStageMultiplier(battler.stages.speed);
    return battler.speed * speedMultiplier;
  }

  playerStrifeAction(strifeOptionId) {
    if (!this.inCombat || !this.playerTurn) return null;

    this.pendingActions = [];

    const playerAction = { type: strifeOptionId };
    const enemyAction = { type: 'move' };

    const actionOrder = this.determineActionOrder(playerAction, enemyAction);

    if (actionOrder === 'player') {
      const oldPlayerHP = this.player.hp;
      const oldEnemyHP = this.enemy.hp;
      const result = this.executeStrifeOption(strifeOptionId);

      if (result.abscond) {
        return this.endCombat(false, result.messages);
      }

      this.queueActionResult('player', result, oldPlayerHP, oldEnemyHP);

      if (this.enemy.hp <= 0) {
        return this.endCombat(true, []);
      }

      const endTurnMessages = this.handleEndOfTurn();
      if (endTurnMessages.length > 0) {
        this.pendingActions.push({
          type: 'endTurn',
          messages: endTurnMessages
        });
      }

      const enemyOldPlayerHP = this.player.hp;
      const enemyOldEnemyHP = this.enemy.hp;
      const enemyResult = this.executeMove(this.enemy, this.player, Math.floor(Math.random() * this.enemy.moves.length));
      this.queueActionResult('enemy', enemyResult, enemyOldPlayerHP, enemyOldEnemyHP);

      if (this.player.hp <= 0) {
        return this.endCombat(false, []);
      }
    } else {
      const enemyOldPlayerHP = this.player.hp;
      const enemyOldEnemyHP = this.enemy.hp;
      const enemyResult = this.executeMove(this.enemy, this.player, Math.floor(Math.random() * this.enemy.moves.length));
      this.queueActionResult('enemy', enemyResult, enemyOldPlayerHP, enemyOldEnemyHP);

      if (this.player.hp <= 0) {
        return this.endCombat(false, []);
      }

      const oldPlayerHP = this.player.hp;
      const oldEnemyHP = this.enemy.hp;
      const result = this.executeStrifeOption(strifeOptionId);

      if (result.abscond) {
        return this.endCombat(false, result.messages);
      }

      this.queueActionResult('player', result, oldPlayerHP, oldEnemyHP);

      if (this.enemy.hp <= 0) {
        return this.endCombat(true, []);
      }

      const endTurnMessages = this.handleEndOfTurn();
      if (endTurnMessages.length > 0) {
        this.pendingActions.push({
          type: 'endTurn',
          messages: endTurnMessages
        });
      }
    }

    this.playerTurn = true;

    return this.getNextAction();
  }

  queueActionResult(actor, result, oldPlayerHP, oldEnemyHP) {
    if (result.multiHitData && result.multiHitData.length > 0) {
      const attackerName = actor === 'player' ? this.player.id : this.enemy.name;
      const moveName = result.moveName || 'an attack';

      const otherMessages = result.messages.filter(msg => !msg.includes('Hit') && !msg.includes('time(s)') && !msg.includes('used'));
      if (otherMessages.length > 0) {
        this.pendingActions.push({
          type: 'afterEffect',
          actor: actor,
          messages: otherMessages,
          playerHP: this.player.hp,
          enemyHP: this.enemy.hp,
          oldPlayerHP: this.player.hp,
          oldEnemyHP: this.enemy.hp
        });
      }
    } else {
      this.pendingActions.push({
        type: 'singleAttack',
        actor: actor,
        messages: result.messages,
        playerHP: this.player.hp,
        enemyHP: this.enemy.hp,
        oldPlayerHP: oldPlayerHP,
        oldEnemyHP: oldEnemyHP
      });
    }
  }

  playerAttack(moveIndex) {
    if (!this.inCombat || !this.playerTurn) return null;

    const playerSpeed = this.getEffectiveSpeed(this.player);
    const enemySpeed = this.getEffectiveSpeed(this.enemy);
    const playerGoesFirst = playerSpeed >= enemySpeed;

    let allMessages = [];

    if (playerGoesFirst) {
      const result = this.executeMove(this.player, this.enemy, moveIndex);
      allMessages.push(...result.messages);

      if (this.player.moves[moveIndex]) {
        this.playerLastMove = this.player.moves[moveIndex].name;
      }

      if (this.enemy.hp <= 0) {
        const endResult = this.endCombat(true, allMessages);
        return endResult;
      }

      const endTurnMessages = this.handleEndOfTurn();
      allMessages.push(...endTurnMessages);

      const enemyResult = this.executeMove(this.enemy, this.player, Math.floor(Math.random() * this.enemy.moves.length));
      allMessages.push(...enemyResult.messages);

      if (this.player.hp <= 0) {
        const endResult = this.endCombat(false, allMessages);
        return endResult;
      }
    } else {
      const enemyResult = this.executeMove(this.enemy, this.player, Math.floor(Math.random() * this.enemy.moves.length));
      allMessages.push(...enemyResult.messages);

      if (this.player.hp <= 0) {
        const endResult = this.endCombat(false, allMessages);
        return endResult;
      }

      const result = this.executeMove(this.player, this.enemy, moveIndex);
      allMessages.push(...result.messages);

      if (this.player.moves[moveIndex]) {
        this.playerLastMove = this.player.moves[moveIndex].name;
      }

      if (this.enemy.hp <= 0) {
        const endResult = this.endCombat(true, allMessages);
        return endResult;
      }

      const endTurnMessages = this.handleEndOfTurn();
      allMessages.push(...endTurnMessages);
    }

    this.playerTurn = true;

    allMessages.forEach(msg => this.addLog(msg));

    return {
      type: 'turn',
      messages: allMessages,
      playerHp: this.player.hp,
      enemyHp: this.enemy.hp,
      log: this.battleLog
    };
  }

  enemyAttack() {
    if (!this.inCombat) return null;

    const moveIndex = Math.floor(Math.random() * this.enemy.moves.length);
    const result = this.executeMove(this.enemy, this.player, moveIndex);

    this.playerTurn = true;

    if (this.player.hp <= 0) {
      return this.endCombat(false, result.messages);
    }

    return {
      ...result,
      playerHp: this.player.hp,
      enemyHp: this.enemy.hp
    };
  }

  executeFraymotif(abilityIndex) {
    if (!this.inCombat || !this.player) {
      return { success: false, message: 'Not in combat!' };
    }

    const abilities = getFraymotifAbilities(this.player.id);
    const ability = abilities[abilityIndex];

    if (!ability) {
      return { success: false, message: 'Fraymotif not found!' };
    }

    if (this.player.fraymotifCharge < ability.cost) {
      return { success: false, message: 'Not enough charge!' };
    }

    const result = this.fraymotifExecutor.executeFraymotif(ability.id, this.player, this.enemy);

    if (!result.success) {
      return result;
    }

    this.playerTurn = false;

    const enemyResult = this.executeMove(this.enemy, this.player, Math.floor(Math.random() * this.enemy.moves.length));

    if (this.player.hp <= 0) {
      return this.endCombat(false, [...(result.result?.messages || []), ...enemyResult.messages]);
    }

    this.playerTurn = true;

    return {
      success: true,
      ...result.result,
      playerHp: this.player.hp,
      enemyHp: this.enemy.hp
    };
  }

  endCombat(playerWon, finalMessages = []) {
    this.inCombat = false;

    finalMessages.forEach(msg => this.addLog(msg));

    if (playerWon) {
      this.addLog(`Victory! ${this.enemy.name} was defeated!`);
    } else {
      this.addLog(`${this.player.id} fainted!`);
      this.player.hp = 0;
    }

    if (this.gameState.characters[this.player.id]) {
      this.gameState.characters[this.player.id].currentHp = Math.max(0, this.player.hp);
      this.gameState.save();
    }

    return {
      type: 'combatEnd',
      won: playerWon,
      messages: finalMessages,
      log: this.battleLog
    };
  }

  addLog(message) {
    this.battleLog.push(message);
  }

  getMoves(characterId) {
    const moves = STRIFE_OPTIONS[characterId] || STRIFE_OPTIONS.opal;
    return moves.map(m => ({
      name: m.name,
      power: m.power,
      type: m.type
    }));
  }

  getStrifeOptions(characterId) {
    return STRIFE_OPTIONS[characterId] || STRIFE_OPTIONS.opal;
  }

  get playerHP() {
    return this.player ? this.player.hp : 0;
  }

  get playerMaxHP() {
    return this.player ? this.player.maxHp : 100;
  }

  get enemyHP() {
    return this.enemy ? this.enemy.hp : 0;
  }

  get enemyMaxHP() {
    return this.enemy ? this.enemy.maxHp : 100;
  }

  healCharacter(characterId) {
    if (this.gameState.characters[characterId]) {
      const maxHp = CHARACTER_STATS[characterId]?.maxHp || 100;
      this.gameState.characters[characterId].currentHp = maxHp;
      this.gameState.save();
      return true;
    }
    return false;
  }

  getNextAction() {
    if (this.pendingActions.length === 0) {
      return null;
    }
    return this.pendingActions.shift();
  }

  hasMoreActions() {
    return this.pendingActions.length > 0;
  }
}

export { PokemonCombatSystem };