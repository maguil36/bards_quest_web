console.log('mapCharacters.js: File loading started');

// Character definitions now use site CSS variables for colors
// The 8 characters map 1:1 to CSS variables defined in public/styles.css
// --alexis, --austine, --chloe, --isabela, --nicholas, --opal, --tyson, --victor

function getCSSVar(name) {
   const v = getComputedStyle(document.documentElement).getPropertyValue(name);
   return (v && v.trim()) || '#888';
 }

import { CHARACTER_QUESTS } from './mapQuestData.js';

console.log('mapCharacters.js: getCSSVar function defined');

 const CHAR_COLORS = {
   alexis: getCSSVar('--alexis'),
   austine: getCSSVar('--austine'),
   chloe: getCSSVar('--chloe'),
   isabela: getCSSVar('--isabela'),
   nicholas: getCSSVar('--nicholas'),
   opal: getCSSVar('--opal'),
   tyson: getCSSVar('--tyson'),
   victor: getCSSVar('--victor')
 };

 const CHARACTER_BASE_HP = {
   opal: 345,
   alexis: 358,
   tyson: 311,
   chloe: 342,
   isabela: 282,
   nicholas: 278,
   austine: 312,
   victor: 265
 };

// Character definitions based on the 8 persona names from styles.css
const CHARACTERS = {
   alexis: {
     id: 'alexis',
     name: 'Alexis',
     color: CHAR_COLORS.alexis,
     position: { x: 704, y: 864 },
     quest: {
       unlockCriteria: 'defeat1Boss',
       completionCriteria: 'collect10Weapons',
       description: 'Collect 10 strife specium to complete.'
     },
     abilities: ['weaponSteal', 'invincibleInCombat']
   },
   austine: {
     id: 'austine',
     name: 'Austine',
     color: CHAR_COLORS.austine,
     position: { x: 736, y: 864 },
     quest: {
       unlockCriteria: 'findPuzzlePiece',
       completionCriteria: 'locateBlackQueen',
       description: 'Locate Black Queen coordinates to complete.'
     },
     abilities: ['autoSolvePuzzle']
   },
   chloe: {
     id: 'chloe',
     name: 'Chloe',
     color: CHAR_COLORS.chloe,
     position: { x: 864, y: 864 },
     quest: {
       unlockCriteria: 'bringLostAnimal',
       completionCriteria: 'getHealingTool',
       description: 'Get healing tool from isabela to complete.'
     },
     abilities: ['healOthers', 'healSelf']
   },
   isabela: {
     id: 'isabela',
     name: 'isabela',
     color: CHAR_COLORS.isabela,
     position: { x: 896, y: 768 },
     quest: {
       unlockCriteria: 'talkToAll',
       completionCriteria: 'upgradeWeapon',
       description: 'Upgrade weapon to final state to complete.'
     },
     abilities: ['gristCreator', 'buildStructures']
  },
   nicholas: {
     id: 'nicholas',
     name: 'Nicholas',
     color: CHAR_COLORS.nicholas,
     position: { x: 704, y: 768 },
     quest: {
       unlockCriteria: 'beatMiniGame',
       completionCriteria: 'reachFinalLevel',
       description: 'Reach final level to complete.'
     },
     abilities: ['damageBoost'],
  },
  opal: {
     id: 'opal',
     name: 'Opal',
     color: CHAR_COLORS.opal,
     position: { x: 800, y: 800 },
     quest: {
       unlockCriteria: 'startingCharacter',
       completionCriteria: 'getBlackKingCoordinates',
       description: 'Find the Opal Map to complete.'
     },
     abilities: ['teleport', 'spatialManipulation']
   },
   tyson: {
     id: 'tyson',
     name: 'Tyson',
     color: CHAR_COLORS.tyson,
     position: { x: 896, y: 864 },
     quest: {
       unlockCriteria: 'beOpalCompleted',
       completionCriteria: 'findNotebook',
       description: 'Find Nicholas\'s notebook to complete.',
       onlySwappableBy: ['opal']
     },
     abilities: ['largeInventory']
   },
   victor: {
     id: 'victor',
     name: 'Victor',
     color: CHAR_COLORS.victor,
     position: { x: 800, y: 896 },
     isFinalCharacter: true,
     quest: {
       unlockCriteria: 'playedAllCharacters',
       completionCriteria: 'triggerEnding',
       description: 'Triggers ending when swapped to.'
     },
     abilities: ['gameBreaker']
   },
 };

// Allow refreshing character colors after CSS loads (in case CSS not ready at parse time)
function refreshCharacterColors() {
  const updated = {
    alexis: getCSSVar('--alexis'),
    austine: getCSSVar('--austine'),
    chloe: getCSSVar('--chloe'),
    isabela: getCSSVar('--isabela'),
    nicholas: getCSSVar('--nicholas'),
    opal: getCSSVar('--opal'),
    tyson: getCSSVar('--tyson'),
    victor: getCSSVar('--victor'),
  };
  Object.assign(CHAR_COLORS, updated);
  for (const id of Object.keys(CHARACTERS)) {
    CHARACTERS[id].color = CHAR_COLORS[id] || CHARACTERS[id].color;
  }
}

console.log('mapCharacters.js: CHARACTERS and refreshCharacterColors defined');

// NPCs that need to be talked to (now the same as the playable characters)
const NPCS = [
  {
    id: 'alexis',
    name: 'Alexis',
    position: { x: 2496, y: 4384 },
    color: CHAR_COLORS.alexis,
  },
  {
    id: 'austine',
    name: 'Austine',
    position: { x: 2752, y: 4384 },
    color: CHAR_COLORS.austine,
  },
  {
    id: 'chloe',
    name: 'Chloe',
    position: { x: 2624, y: 4576 },
    color: CHAR_COLORS.chloe,
  },
  {
    id: 'isabela',
    name: 'isabela',
    position: { x: 2816, y: 4512 },
    color: CHAR_COLORS.isabela,
  },
  {
    id: 'nicholas',
    name: 'Nicholas',
    position: { x: 2432, y: 4512 },
    color: CHAR_COLORS.nicholas,
  },
  {
    id: 'opal',
    name: 'Opal',
    position: { x: 2624, y: 4480 },
    color: CHAR_COLORS.opal,
  },
  {
    id: 'tyson',
    name: 'Tyson',
    position: { x: 2496, y: 4640 },
    color: CHAR_COLORS.tyson,
  },
  {
    id: 'victor',
    name: 'Victor',
    position: { x: 2752, y: 4640 },
    color: CHAR_COLORS.victor,
  },
  {
    id: 'pet',
    name: 'Lost Pet',
    position: { x: 2400, y: 4300 },
    color: '#8B4513',
  },
];

console.log('mapCharacters.js: NPCS array defined');

// Game state management
class GameState {
  constructor() {
    this.currentCharacter = 'opal';
    this.completedDialogues = new Set();
    this.unlockedCharacters = new Set(['opal']);
    this.characterPositions = {};
    this.lastNPCTalkedId = null;
    this.lastNonFinalNPCTalkedId = null;
    this.formerSwapPartnerByCharacter = {};

    this.questProgress = {};
    this.completedQuests = new Set();
    this.inventory = {
      global: [],
      opal: [],
      nicholas: [],
      isabela: [],
      austine: [],
      chloe: [],
      alexis: [],
      tyson: [],
      victor: []
    };
    this.inventoryCapacity = {
      default: 5,
      tyson: 10
    };
    this.combatStats = {
      agentsDefeated: 0,
      weaponsCollected: [],
      level: 1,
      health: 100,
      maxHealth: 100
    };
    this.gameItems = {
      puzzlePiece: { position: { x: 350, y: 180 }, found: false },
      lostAnimal: { position: { x: 550, y: 620 }, found: false },
      nicholasNotebook: { position: { x: 800, y: 300 }, found: false },
      blackKingCoordinates: { found: false },
      blackQueenLocation: { found: false },
      healingTool: { found: false },
      opalMap: { found: false },
      austineMap: { found: false }
    };
    this.playedCharacters = new Set(['opal']);
    this.miniGameScores = {
      nicholas: 0
    };
    this.buildProgress = {
      bridgesBuilt: []
    };
    this.grist = 50;
    this.chestStates = [];
    this.defeatedAgents = [];
    this.usedFraymotifs = {};
    this.stolenWeapons = {
        stolen: [],
        available: ['austine', 'chloe', 'nicholas', 'opal', 'tyson', 'isabela']
    };

    Object.keys(CHARACTERS).forEach((charId) => {
      this.characterPositions[charId] = { ...CHARACTERS[charId].position };
      this.questProgress[charId] = {
        unlocked: charId === 'opal',
        completed: false,
        progress: {}
      };
      this.usedFraymotifs[charId] = new Set();
    });

    this.characters = {};
    Object.keys(CHARACTERS).forEach((charId) => {
      this.characters[charId] = {
        currentHp: CHARACTER_BASE_HP[charId] || 100,
        fraymotifCharge: 0
      };
    });

    this.xp = {};
    this.levels = {};
    Object.keys(CHARACTERS).forEach((charId) => {
      if (charId === 'chloe') {
        this.xp[charId] = Math.floor(Math.pow(98, 3));
        this.levels[charId] = 98;
      } else {
        this.xp[charId] = 0;
        this.levels[charId] = 100;
      }
    });

    this.migrateDefeatedAgents();
  }

  migrateDefeatedAgents() {
    if (this.defeatedAgents && this.defeatedAgents.length > 0) {
      const migratedAgents = [];
      for (const agentKey of this.defeatedAgents) {
        const parts = agentKey.split('_');
        if (parts.length === 2) {
          const x = Math.round(parseFloat(parts[0]));
          const y = Math.round(parseFloat(parts[1]));
          const newKey = `${x}_${y}`;
          if (!migratedAgents.includes(newKey)) {
            migratedAgents.push(newKey);
          }
        }
      }
      this.defeatedAgents = migratedAgents;
      this.save();
    }
  }

  // Check if a dialogue has been completed
  hasCompletedDialogue(characterId, npcId) {
    return this.completedDialogues.has(`${characterId}:${npcId}`);
  }

  // Mark a dialogue as completed
  completeDialogue(characterId, npcId) {
    this.completedDialogues.add(`${characterId}:${npcId}`);
  }

  // Track last talked NPC (and last non-final NPC for switching)
  setLastTalkedNPC(npcId) {
    this.lastNPCTalkedId = npcId;
    if (!(CHARACTERS[npcId] && CHARACTERS[npcId].isFinalCharacter)) {
      this.lastNonFinalNPCTalkedId = npcId;
    }
  }

  getLastSwitchTarget(currentCharacterId) {
    // Prefer the last non-final NPC, and never the current character
    const candidate = this.lastNonFinalNPCTalkedId;
    if (candidate && candidate !== currentCharacterId) return candidate;
    return null;
  }
  // Check if all required NPCs have been talked to as a specific character
  hasCompletedAllDialogues(characterId) {
    // Must talk to every NPC except yourself and your former swap partner (Victor included)
    const former = this.formerSwapPartnerByCharacter && this.formerSwapPartnerByCharacter[characterId];
    return NPCS
      .filter((npc) => npc.id !== characterId && npc.id !== former)
      .every((npc) => this.hasCompletedDialogue(characterId, npc.id));
  }

  // Check if a character can be switched to
  canSwitchToCharacter(characterId) {
    if (characterId === this.currentCharacter) return false;

    const character = CHARACTERS[characterId];
    if (!character) return false;

    if (characterId === 'opal') return true;

    const questData = CHARACTER_QUESTS[characterId];
    if (!questData) return this.unlockedCharacters.has(characterId);

    const unlockStep = questData.steps.find(step => step.unlockPlayable === characterId);
    if (!unlockStep) return this.unlockedCharacters.has(characterId);

    const progress = this.questProgress[characterId];
    if (!progress) return false;

    const unlockStepIndex = questData.steps.indexOf(unlockStep);
    const hasCompletedUnlockStep = progress.currentStep > unlockStepIndex;

    return hasCompletedUnlockStep;
  }

  addToInventory(characterId, item) {
    if (!this.inventory[characterId]) {
      this.inventory[characterId] = [];
    }
    const capacity = this.inventoryCapacity[characterId] || this.inventoryCapacity.default;
    if (this.inventory[characterId].length >= capacity) {
      return false;
    }
    this.inventory[characterId].push(item);

    if (item === 'finalWeapon' && characterId === 'isabela') {
      if (!this.weaponUpgrades) {
        this.weaponUpgrades = {};
      }
      this.weaponUpgrades['isabela'] = true;
    }

    return true;
  }

  removeFromInventory(characterId, item) {
    if (!this.inventory[characterId]) return false;
    const index = this.inventory[characterId].indexOf(item);
    if (index > -1) {
      this.inventory[characterId].splice(index, 1);
      return true;
    }
    return false;
  }

  hasInInventory(characterId, item) {
    return this.inventory[characterId]?.includes(item) || false;
  }

  pickupItem(itemId) {
    const item = this.gameItems[itemId];
    if (!item || item.found) return false;

    const canPickup = this.addToInventory(this.currentCharacter, itemId);
    if (canPickup) {
      item.found = true;
      return true;
    }
    return false;
  }

  completeQuest(characterId) {
    if (!this.questProgress[characterId]) return false;
    this.questProgress[characterId].completed = true;
    this.completedQuests.add(characterId);
    return true;
  }

  checkQuestCompletion(characterId) {
    const character = CHARACTERS[characterId];
    if (!character || !character.quest) return false;

    switch (character.quest.completionCriteria) {
      case 'getBlackKingCoordinates':
        return this.gameItems.opalMap.found;

      case 'reachFinalLevel':
        return this.combatStats.level >= 10;

      case 'upgradeWeapon':
        return this.hasInInventory(characterId, 'finalWeapon');

      case 'locateBlackQueen':
        return this.gameItems.blackQueenLocation.found;

      case 'getHealingTool':
        return this.gameItems.healingTool.found;

      case 'collect10Weapons':
        return this.combatStats.weaponsCollected.length >= 10;

      case 'findNotebook':
        return this.hasInInventory(characterId, 'nicholasNotebook');

      case 'triggerEnding':
        return true;

      default:
        return false;
    }
  }

  defeatAgent(agentX = null, agentY = null) {
    this.combatStats.agentsDefeated++;
    if (agentX !== null && agentY !== null) {
      const agentKey = `${agentX}_${agentY}`;
      if (!this.defeatedAgents.includes(agentKey)) {
        this.defeatedAgents.push(agentKey);
      }
      this.save();
    }
  }

  addWeapon(weaponId) {
    if (!this.combatStats.weaponsCollected.includes(weaponId)) {
      this.combatStats.weaponsCollected.push(weaponId);
    }
  }

  levelUp() {
    this.combatStats.level++;
  }

  buildBridge(bridgeId) {
    if (!this.buildProgress.bridgesBuilt.includes(bridgeId)) {
      this.buildProgress.bridgesBuilt.push(bridgeId);
      return true;
    }
    return false;
  }

  // Count total completed interactions across all non-final characters (toward Victor)
  getCompletedInteractionsTowardVictor() {
    // Count only non-final -> non-final (exclude self and exclude Victor in either role)
    const nonFinal = Object.keys(CHARACTERS).filter((id) => !(CHARACTERS[id] && CHARACTERS[id].isFinalCharacter));
    let count = 0;
    for (const charId of nonFinal) {
      for (const npcId of nonFinal) {
        if (npcId === charId) continue; // exclude self
        if (this.hasCompletedDialogue(charId, npcId)) count++;
      }
    }
    return count;
  }

  // Total required to unlock Victor (exclude any interactions involving Victor): 7 speakers * 6 targets = 42
  getTotalInteractionsTowardVictor() {
    return 42;
  }
  // Progress helpers for UI
  // Count how many NPCs this character has already talked to (excluding self, and excluding the former swap partner)
  getCompletedCountForCharacter(characterId) {
    // Include Victor, exclude self, and exclude the former swap partner for this character
    const former = this.formerSwapPartnerByCharacter && this.formerSwapPartnerByCharacter[characterId];
    return NPCS
      .filter((npc) => npc.id !== characterId)
      .filter((npc) => npc.id !== former)
      .reduce((acc, npc) => acc + (this.hasCompletedDialogue(characterId, npc.id) ? 1 : 0), 0);
  }

  // Total targets this character needs to talk to (include Victor, exclude self and former partner)
  getTotalTargetsPerCharacter(forCharacterId) {
    const characterId = forCharacterId || this.currentCharacter;
    const former = this.formerSwapPartnerByCharacter && this.formerSwapPartnerByCharacter[characterId];
    // All NPCs except self and former partner
    const eligible = NPCS.filter((npc) => npc.id !== characterId && npc.id !== former);
    return Math.max(0, eligible.length);
  }

  // Remaining interactions for this character to be considered "ready to switch"
  getRemainingForCharacterProgress(characterId) {
    const total = this.getTotalTargetsPerCharacter(characterId);
    const done = this.getCompletedCountForCharacter(characterId);
    return Math.max(0, total - done);
  }

  // Remaining interactions across all characters to reach the game's completion condition (Victor unlock)
  getRemainingInteractionsToFinishGame() {
    const total = this.getTotalInteractionsTowardVictor();
    const done = this.getCompletedInteractionsTowardVictor();
    return Math.max(0, total - done);
  }

  // Get current character data
  getCurrentCharacter() {
    return CHARACTERS[this.currentCharacter];
  }

  // Check if ready to switch (completed all dialogues as current character)
  isReadyToSwitch() {
    return this.hasCompletedAllDialogues(this.currentCharacter);
  }

  // Unlock a character for switching
  unlockCharacter(characterId) {
    if (!CHARACTERS[characterId]) return;
    if (CHARACTERS[characterId].isFinalCharacter) return; // never pre-unlock Victor
    this.unlockedCharacters.add(characterId);
  }

  // Switch current playable character
  switchCharacter(characterId) {
    if (!this.canSwitchToCharacter(characterId)) return false;
    if (!CHARACTERS[characterId]) return false;
    this.currentCharacter = characterId;
    return true;
  }

  // Save game state
  save() {
    const data = {
      currentCharacter: this.currentCharacter,
      completedDialogues: Array.from(this.completedDialogues),
      unlockedCharacters: Array.from(this.unlockedCharacters),
      characterPositions: this.characterPositions,
      lastNPCTalkedId: this.lastNPCTalkedId,
      lastNonFinalNPCTalkedId: this.lastNonFinalNPCTalkedId,
      formerSwapPartnerByCharacter: this.formerSwapPartnerByCharacter,
      questProgress: this.questProgress,
      completedQuests: Array.from(this.completedQuests),
      inventory: this.inventory,
      combatStats: this.combatStats,
      gameItems: this.gameItems,
      playedCharacters: Array.from(this.playedCharacters),
      miniGameScores: this.miniGameScores,
      buildProgress: this.buildProgress,
      grist: this.grist,
      chestStates: this.chestStates,
      defeatedAgents: this.defeatedAgents,
      characters: this.characters
    };
    try {
      localStorage.setItem('switchGameState', JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save game state:', e);
    }
  }

  // Load game state
  load() {
    try {
      const data = JSON.parse(localStorage.getItem('switchGameState') || '{}');
      if (data.currentCharacter && CHARACTERS[data.currentCharacter]) {
        this.currentCharacter = data.currentCharacter;
      }
      this.completedDialogues = new Set(data.completedDialogues || []);
      this.unlockedCharacters = new Set(
        Array.isArray(data.unlockedCharacters) && data.unlockedCharacters.length
          ? data.unlockedCharacters
          : ['opal'],
      );
      if (data.characterPositions) {
        this.characterPositions = data.characterPositions;
      }
      this.lastNPCTalkedId = data.lastNPCTalkedId || null;
      this.lastNonFinalNPCTalkedId = data.lastNonFinalNPCTalkedId || null;
      this.formerSwapPartnerByCharacter = data.formerSwapPartnerByCharacter || {};

      if (data.questProgress) this.questProgress = data.questProgress;
      this.completedQuests = new Set(data.completedQuests || []);
      if (data.inventory) this.inventory = data.inventory;
      if (data.combatStats) this.combatStats = data.combatStats;
      if (data.gameItems) this.gameItems = data.gameItems;
      this.playedCharacters = new Set(data.playedCharacters || ['opal']);
      if (data.miniGameScores) this.miniGameScores = data.miniGameScores;
      if (data.buildProgress) this.buildProgress = data.buildProgress;
      this.grist = data.grist || 0;
      if (data.chestStates) this.chestStates = data.chestStates;
      if (data.defeatedAgents) this.defeatedAgents = data.defeatedAgents;
      if (data.characters) this.characters = data.characters;

      this.migrateDefeatedAgents();
    } catch (e) {
      console.warn('Failed to load game state:', e);
    }
  }

  // Reset game state
  reset() {
    this.currentCharacter = 'opal';
    this.completedDialogues.clear();
    this.unlockedCharacters = new Set(['opal']);
    this.lastNPCTalkedId = null;
    this.lastNonFinalNPCTalkedId = null;
    this.formerSwapPartnerByCharacter = {};
    this.questProgress = {};
    this.completedQuests = new Set();
    this.inventory = {
      global: [],
      opal: [],
      nicholas: [],
      isabela: [],
      austine: [],
      chloe: [],
      alexis: [],
      tyson: [],
      victor: []
    };
    this.combatStats = {
      agentsDefeated: 0,
      weaponsCollected: [],
      level: 1,
      health: 100,
      maxHealth: 100
    };
    this.gameItems = {
      puzzlePiece: { position: { x: 350, y: 180 }, found: false },
      lostAnimal: { position: { x: 550, y: 620 }, found: false },
      nicholasNotebook: { position: { x: 800, y: 300 }, found: false },
      blackKingCoordinates: { found: false },
      blackQueenLocation: { found: false },
      healingTool: { found: false },
      opalMap: { found: false },
      austineMap: { found: false }
    };
    this.playedCharacters = new Set(['opal']);
    this.miniGameScores = {
      nicholas: 0
    };
    this.buildProgress = {
      bridgesBuilt: []
    };
    this.grist = 50;
    this.defeatedAgents = [];

    Object.keys(CHARACTERS).forEach((charId) => {
      this.characterPositions[charId] = { ...CHARACTERS[charId].position };
      this.questProgress[charId] = {
        unlocked: charId === 'opal',
        completed: false,
        progress: {}
      };
    });

    this.characters = {};
    Object.keys(CHARACTERS).forEach((charId) => {
      this.characters[charId] = {
        currentHp: CHARACTER_BASE_HP[charId] || 100,
        fraymotifCharge: 0
      };
    });

    try {
      localStorage.removeItem('switchGameState');
    } catch (_) {}
    this.save();
  }
}

console.log('mapCharacters.js: GameState class defined');
console.log('mapCharacters.js: About to export');

export { CHARACTERS, NPCS, GameState, CHAR_COLORS, CHARACTER_BASE_HP, refreshCharacterColors };

window.CHARACTERS = CHARACTERS;
window.NPCS = NPCS;
window.GameState = GameState;
window.CHAR_COLORS = CHAR_COLORS;
window.CHARACTER_BASE_HP = CHARACTER_BASE_HP;
window.refreshCharacterColors = refreshCharacterColors;

console.log('mapCharacters.js: Exports made available globally');