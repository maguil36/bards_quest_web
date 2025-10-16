 // Character definitions now use site CSS variables for colors
 // The 8 characters map 1:1 to CSS variables defined in public/styles.css
 // --alexis, --austine, --chloe, --isabell, --nicholas, --opal, --tyson, --victor

 function getCSSVar(name) {
   const v = getComputedStyle(document.documentElement).getPropertyValue(name);
   return (v && v.trim()) || '#888';
 }

 const CHAR_COLORS = {
   alexis: getCSSVar('--alexis'),
   austine: getCSSVar('--austine'),
   chloe: getCSSVar('--chloe'),
   isabell: getCSSVar('--isabell'),
   nicholas: getCSSVar('--nicholas'),
   opal: getCSSVar('--opal'),
   tyson: getCSSVar('--tyson'),
   victor: getCSSVar('--victor'),
 };

 // Character definitions based on the 8 persona names from styles.css
 const CHARACTERS = {
   alexis: {
     id: 'alexis',
     name: 'Alexis',
     color: CHAR_COLORS.alexis,
     position: { x: 200, y: 520 },
   },
   austine: {
     id: 'austine',
     name: 'Austine',
     color: CHAR_COLORS.austine,
     position: { x: 400, y: 300 },
   },
   chloe: {
     id: 'chloe',
     name: 'Chloe',
     color: CHAR_COLORS.chloe,
     position: { x: 300, y: 230 },
   },
   isabell: {
     id: 'isabell',
     name: 'Isabell',
     color: CHAR_COLORS.isabell,
     position: { x: 250, y: 250 },
   },
   nicholas: {
     id: 'nicholas',
     name: 'Nicholas',
     color: CHAR_COLORS.nicholas,
     position: { x: 700, y: 250 },
   },
   opal: {
     id: 'opal',
     name: 'Opal',
     color: CHAR_COLORS.opal,
     position: { x: 400, y: 480 },
   },
   tyson: {
     id: 'tyson',
     name: 'Tyson',
     color: CHAR_COLORS.tyson,
     position: { x: 500, y: 500 },
   },
   victor: {
     id: 'victor',
     name: 'Victor',
     color: CHAR_COLORS.victor,
     position: { x: 450, y: 650 },
     isFinalCharacter: true, // Triggers the glitch ending
   },
 };

// Allow refreshing character colors after CSS loads (in case CSS not ready at parse time)
function refreshCharacterColors() {
  const updated = {
    alexis: getCSSVar('--alexis'),
    austine: getCSSVar('--austine'),
    chloe: getCSSVar('--chloe'),
    isabell: getCSSVar('--isabell'),
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

 // NPCs that need to be talked to (now the same as the playable characters)
const NPCS = [
  {
    id: 'alexis',
    name: 'Alexis',
    position: { x: 200, y: 520 },
    color: CHAR_COLORS.alexis,
  },
  {
    id: 'austine',
    name: 'Austine',
    position: { x: 400, y: 300 },
    color: CHAR_COLORS.austine,
  },
  {
    id: 'chloe',
    name: 'Chloe',
    position: { x: 600, y: 200 },
    color: CHAR_COLORS.chloe,
  },
  {
    id: 'isabell',
    name: 'Isabell',
    position: { x: 250, y: 250 },
    color: CHAR_COLORS.isabell,
  },
  {
    id: 'nicholas',
    name: 'Nicholas',
    position: { x: 700, y: 250 },
    color: CHAR_COLORS.nicholas,
  },
  {
    id: 'opal',
    name: 'Opal',
    position: { x: 400, y: 480 },
    color: CHAR_COLORS.opal,
  },
  {
    id: 'tyson',
    name: 'Tyson',
    position: { x: 500, y: 500 },
    color: CHAR_COLORS.tyson,
  },
  {
    id: 'victor',
    name: 'Victor',
    position: { x: 450, y: 650 },
    color: CHAR_COLORS.victor,
  },
];

 // Game state management
class GameState {
  constructor() {
    this.currentCharacter = 'opal';
    this.completedDialogues = new Set(); // Format: "characterId:npcId"
    this.unlockedCharacters = new Set(['opal']);
    this.characterPositions = {};
    this.lastNPCTalkedId = null;
    this.lastNonFinalNPCTalkedId = null;
    this.formerSwapPartnerByCharacter = {}; // Maps characterId -> the characterId they swapped from most recently

    // Initialize character positions
    Object.keys(CHARACTERS).forEach((charId) => {
      this.characterPositions[charId] = { ...CHARACTERS[charId].position };
    });
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

    // Final character (Victor) unlock rule per design:
    // Complete all required interactions across non-final characters (42 total)
    // AND you must have talked to Victor as your current character before switching to him
    if (character.isFinalCharacter) {
      const done = this.getCompletedInteractionsTowardVictor();
      const total = this.getTotalInteractionsTowardVictor();
      const hasSpokenToVictor = this.hasCompletedDialogue(this.currentCharacter, 'victor');
      return done >= total && hasSpokenToVictor;
    }

    return this.unlockedCharacters.has(characterId);
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
          : ['alexis'],
      );
      if (data.characterPositions) {
        this.characterPositions = data.characterPositions;
      }
      this.lastNPCTalkedId = data.lastNPCTalkedId || null;
      this.lastNonFinalNPCTalkedId = data.lastNonFinalNPCTalkedId || null;
      this.formerSwapPartnerByCharacter = data.formerSwapPartnerByCharacter || {};
    } catch (e) {
      console.warn('Failed to load game state:', e);
    }
  }

  // Reset game state
  reset() {
    this.currentCharacter = 'alexis';
    this.completedDialogues.clear();
    this.unlockedCharacters = new Set(['alexis']);
    this.lastNPCTalkedId = null;
    this.lastNonFinalNPCTalkedId = null;
    this.formerSwapPartnerByCharacter = {};
    Object.keys(CHARACTERS).forEach((charId) => {
      this.characterPositions[charId] = { ...CHARACTERS[charId].position };
    });
    try {
      localStorage.removeItem('switchGameState');
    } catch (_) {}
    this.save();
  }
}