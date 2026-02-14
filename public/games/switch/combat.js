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

const MOVE_DATABASE = {
  opal: [
    {
      name: 'Pollarm Kind Attack',
      type: 'physical',
      power: 65,
      accuracy: 100,
      effect: null
    },
    {
      name: 'Spacial Splash',
      type: 'special',
      power: 20,
      accuracy: 100,
      effect: { type: 'multihit', min: 2, max: 5 }
    },
    {
      name: 'Spacial Splice',
      type: 'status',
      power: 0,
      accuracy: 100,
      effect: { type: 'statChange', target: 'enemy', stats: { attack: -1, defense: -1} }
    },
    {
      name: 'Spacial Shield',
      type: 'status',
      power: 0,
      accuracy: 100,
      effect: { type: 'defenseBoost', turns: 3, multiplier: 2 }
    }
  ],
  tyson: [
    {
      name: 'Sholve Kind Attack',
      type: 'physical',
      power: 50,
      accuracy: 100,
      effect: null
    },
    {
      name: 'Doom Attack',
      type: 'special',
      power: 0,
      accuracy: 100,
      effect: { type: 'delayed', turns: 2, failMessage: 'Doom Attack failed!' }
    },
    {
      name: 'Self Sacrifice',
      type: 'special',
      power: 0,
      accuracy: 100,
      effect: { type: 'selfKO' }
    },
    {
      name: 'Martyrdom',
      type: 'physical',
      power: 50,
      accuracy: 100,
      effect: null
    }
  ],
  nicholas: [
    {
      name: 'Rifle Kind Attack',
      type: 'special',
      power: 50,
      accuracy: 100,
      effect: null
    },
    {
      name: 'Rifle Kind Sniper Shot',
      type: 'special',
      power: 80,
      accuracy: 50,
      effect: { type: 'alwaysCrit' }
    },
    {
      name: 'Rifle Kind Light Blast',
      type: 'special',
      power: 80,
      accuracy: 100,
      effect: null
    },
    {
      name: 'Take Aim',
      type: 'status',
      power: 0,
      accuracy: 100,
      effect: { type: 'statChange', target: 'self', stats: { accuracy: 1 } }
    }
  ],
  alexis: [
    {
      name: 'Dual Knife Kind',
      type: 'physical',
      power: 40,
      accuracy: 100,
      effect: { type: 'multihit', min: 2, max: 2 }
    }
  ],
  isabell: [
    {
      name: 'Hatchet Kind Attack',
      type: 'physical',
      power: 60,
      accuracy: 100,
      effect: null,
      upgradedPower: 75
    },
    {
      name: 'Sing',
      type: 'status',
      power: 0,
      accuracy: 100,
      effect: { type: 'statChange', target: 'enemy', stats: { defense: -1 } }
    },
    {
      name: 'Scowl',
      type: 'status',
      power: 0,
      accuracy: 100,
      effect: { type: 'statChange', target: 'enemy', stats: { attack: -1 } }
    },
    {
      name: 'Scary Face',
      type: 'status',
      power: 0,
      accuracy: 100,
      effect: { type: 'statChange', target: 'enemy', stats: { speed: -1 } }
    }
  ],
  chloe: [
    {
      name: 'Whip Kind Attack',
      type: 'physical',
      power: 50,
      accuracy: 100,
      effect: { type: 'statChange', target: 'enemy', stats: { speed: -1 } }
    },
    {
      name: 'Minor Life Heal',
      type: 'status',
      power: 0,
      accuracy: 100,
      effect: { type: 'heal', percent: 33 }
    },
    {
      name: 'Sneak',
      type: 'status',
      power: 0,
      accuracy: 100,
      effect: { type: 'statChange', target: 'self', stats: { attack: 1, evasion: 1 } }
    },
    {
      name: 'Animal Attack',
      type: 'special',
      power: 75,
      accuracy: 100,
      effect: null,
      requiresQuest: true
    }
  ],
  austine: [
    {
      name: 'Crossbow Kind Blue Arrow',
      type: 'physical',
      power: 50,
      accuracy: 100,
      effect: { type: 'statChange', target: 'enemy', stats: { speed: -1 } }
    },
    {
      name: 'Crossbow Kind Green Arrow',
      type: 'physical',
      power: 20,
      accuracy: 100,
      effect: { type: 'statChange', target: 'enemy', stats: { defense: -1 } }
    },
    {
      name: 'Crossbow Kind Red Arrow',
      type: 'special',
      power: 45,
      accuracy: 100,
      effect: { type: 'statChange', target: 'enemy', stats: { attack: -1 } }
    },
    {
      name: 'Crossbow Kind Yellow Arrow',
      type: 'special',
      power: 20,
      accuracy: 100,
      effect: { type: 'statChange', target: 'enemy', stats: { specialDefense: -1 } }
    }
  ],
  derseAgent: [
    {
      name: 'Derse Agent Attack',
      type: 'physical',
      power: 45,
      accuracy: 100,
      effect: null
    }
  ],
  derseArchagent: [
    {
      name: 'Derse Archagent Attack',
      type: 'physical',
      power: 50,
      accuracy: 100,
      effect: null
    },
    {
      name: 'Derse Archagent Pistol Kind',
      type: 'special',
      power: 60,
      accuracy: 100,
      effect: null
    }
  ]
};

const ABILITIES = {
  opal: {
    name: 'Teleport',
    effect: 'enemyAccuracy',
    value: -10
  },
  tyson: {
    name: 'Doomed',
    effect: 'none'
  },
  nicholas: {
    name: 'Light Destroyer',
    effect: 'lowAccuracyHighDamage'
  },
  alexis: {
    name: 'Adaptation',
    effect: 'repeatMoveHalved'
  },
  isabell: {
    name: 'None',
    effect: 'none'
  },
  chloe: {
    name: 'Life Player',
    effect: 'endTurnHeal'
  },
  austine: {
    name: 'Tactician',
    effect: 'doubleStatReduction'
  }
};

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

      return {
        id: characterId,
        ...baseStats,
        hp: currentHp,
        stages: { ...stages },
        ability: ABILITIES[characterId] || ABILITIES.opal,
        moves: MOVE_DATABASE[characterId] || MOVE_DATABASE.opal,
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
          moves: MOVE_DATABASE[customEnemy.id] || MOVE_DATABASE.derseAgent,
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
        ability: { name: 'None', effect: 'none' },
        moves: MOVE_DATABASE.derseAgent,
        statusEffects: {},
        isPlayer: false
      };
    }
  }

  startCombat(enemy = null) {
    this.inCombat = true;
    this.playerTurn = true;
    this.turnCount = 0;
    this.battleLog = [];
    this.playerLastMove = null;
    this.playerMoveUsageCount = {};
    this.delayedMoves = [];

    const currentChar = this.gameState.getCurrentCharacter();
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
    const clampedStage = Math.max(-6, Math.min(6, netStage));
    
    const multipliers = {
      '-6': 3/9, '-5': 3/8, '-4': 3/7, '-3': 3/6, '-2': 3/5, '-1': 3/4,
      '0': 1,
      '1': 4/3, '2': 5/3, '3': 6/3, '4': 7/3, '5': 8/3, '6': 9/3
    };
    
    return multipliers[clampedStage.toString()];
  }

  checkAccuracy(attacker, defender, moveAccuracy) {
    if (moveAccuracy === 100 && attacker.stages.accuracy === 0 && defender.stages.evasion === 0) {
      return true;
    }

    const accuracyMult = this.getAccuracyEvasionMultiplier(attacker.stages.accuracy, defender.stages.evasion);
    const finalAccuracy = moveAccuracy * accuracyMult;
    
    return Math.random() * 100 < finalAccuracy;
  }

  checkCritical(attacker) {
    const critChance = 1 / 16;
    return Math.random() < critChance;
  }

  calculateDamage(attacker, defender, move, isCritical = false) {
    if (move.power === 0) return 0;

    const level = 50;
    const isPhysical = move.type === 'physical';
    
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
    
    let damage = Math.floor(((2 * level / 5) + 2) * move.power * (attack / defense) / 50) + 2;
    
    if (isCritical) {
      damage = Math.floor(damage * 1.5);
    }
    
    if (attacker.ability.effect === 'lowAccuracyHighDamage' && !isPhysical) {
      damage = Math.floor(damage * 2);
    }
    
    if (attacker.isPlayer && this.playerLastMove === move.name && attacker.ability.effect === 'repeatMoveHalved') {
      damage = Math.floor(damage / 2);
    }
    
    const randomFactor = 0.85 + Math.random() * 0.15;
    damage = Math.floor(damage * randomFactor);
    
    return Math.max(1, damage);
  }

  changeStats(target, statChanges, sourceAbility = null) {
    const messages = [];
    
    for (const [stat, change] of Object.entries(statChanges)) {
      let actualChange = change;
      
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
    const results = { success: true, messages: [], damage: 0, critical: false };
    
    if (move.requiresQuest && attacker.isPlayer) {
      const hasCompletedQuest = this.gameState.hasItem('lostAnimal');
      if (!hasCompletedQuest) {
        results.success = false;
        results.messages.push(`Cannot use ${move.name} - quest not completed!`);
        return results;
      }
    }
    
    if (move.upgradedPower && attacker.isPlayer) {
      const hasUpgrade = this.gameState.questProgress.isabellUpgrade === true;
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
        results.messages.push(...statMessages);
        break;

      case 'heal':
        const healAmount = Math.floor(attacker.maxHp * (move.effect.percent / 100));
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount);
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
    const checkCrit = move.effect?.type === 'alwaysCrit' || this.checkCritical(attacker);
    
    if (move.effect?.type === 'multihit') {
      const { min, max } = move.effect;
      const hits = Math.floor(Math.random() * (max - min + 1)) + min;
      let totalDamage = 0;

      for (let i = 0; i < hits; i++) {
        const damage = this.calculateDamage(attacker, defender, move, false);
        defender.hp = Math.max(0, defender.hp - damage);
        totalDamage += damage;
      }

      results.damage = totalDamage;
      results.messages.push(`Hit ${hits} time(s) for ${totalDamage} damage!`);
    } else {
      const damage = this.calculateDamage(attacker, defender, move, checkCrit);
      defender.hp = Math.max(0, defender.hp - damage);
      results.damage = damage;
      
      if (checkCrit) {
        results.critical = true;
        results.messages.push(`A critical hit!`);
      }
      
      results.messages.push(`Dealt ${damage} damage!`);
    }

    if (move.effect?.type === 'statChange') {
      const target = move.effect.target === 'self' ? attacker : defender;
      const sourceAbility = attacker.ability.name === 'Tactician' ? 'Tactician' : null;
      const statMessages = this.changeStats(target, move.effect.stats, sourceAbility);
      results.messages.push(...statMessages);
    }
  }

  handleEndOfTurn() {
    const messages = [];

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
    const moves = MOVE_DATABASE[characterId] || MOVE_DATABASE.opal;
    return moves.map(m => ({
      name: m.name,
      power: m.power,
      type: m.type
    }));
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
}

export { PokemonCombatSystem };