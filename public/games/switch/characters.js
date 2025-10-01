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

 // Character to music theme mapping (re-uses existing audio assets)
const MUSIC_MAP = {
  alexis: 'audio/alexis.mp3',
  austine: 'audio/austine.mp3',
  chloe: 'audio/chloe.mp3',
  isabell: 'audio/isabell.mp3',
  nicholas: 'audio/nicholas.mp3',
  opal: 'audio/opal.mp3',
  tyson: 'audio/tyson.mp3',
  victor: 'audio/victor.mp3',
};

// Character definitions based on the 8 persona names from styles.css
const CHARACTERS = {
  alexis: {
    id: 'alexis',
    name: 'Alexis',
    color: CHAR_COLORS.alexis,
    music: MUSIC_MAP.alexis,
    description: 'A calm and flowing presence, free-spirited and adaptable.',
    unlocked: true, // Starting character
    position: { x: 400, y: 300 },
  },
  austine: {
    id: 'austine',
    name: 'Austine',
    color: CHAR_COLORS.austine,
    music: MUSIC_MAP.austine,
    description: 'Bright and optimistic, a bringer of illumination.',
    unlocked: false,
    position: { x: 200, y: 200 },
  },
  chloe: {
    id: 'chloe',
    name: 'Chloe',
    color: CHAR_COLORS.chloe,
    music: MUSIC_MAP.chloe,
    description: 'Mysterious; a patient keeper of moments and change.',
    unlocked: false,
    position: { x: 600, y: 200 },
  },
  isabell: {
    id: 'isabell',
    name: 'Isabell',
    color: CHAR_COLORS.isabell,
    music: MUSIC_MAP.isabell,
    description: 'Cosmic perspective; understands breadth and distance.',
    unlocked: false,
    position: { x: 100, y: 400 },
  },
  nicholas: {
    id: 'nicholas',
    name: 'Nicholas',
    color: CHAR_COLORS.nicholas,
    music: MUSIC_MAP.nicholas,
    description: 'Passionate and driven by connection.',
    unlocked: false,
    position: { x: 700, y: 400 },
  },
  opal: {
    id: 'opal',
    name: 'Opal',
    color: CHAR_COLORS.opal,
    music: MUSIC_MAP.opal,
    description: 'Logical and steady, values knowledge and reason.',
    unlocked: false,
    position: { x: 300, y: 500 },
  },
  tyson: {
    id: 'tyson',
    name: 'Tyson',
    color: CHAR_COLORS.tyson,
    music: MUSIC_MAP.tyson,
    description: 'Optimistic, a believer in better futures.',
    unlocked: false,
    position: { x: 500, y: 500 },
  },
  victor: {
    id: 'victor',
    name: 'Victor',
    color: CHAR_COLORS.victor,
    music: MUSIC_MAP.victor,
    description: 'Fierce and focused, channels righteous energy.',
    unlocked: false,
    position: { x: 400, y: 100 },
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
    position: { x: 400, y: 300 },
    color: CHAR_COLORS.alexis,
  },
  {
    id: 'austine',
    name: 'Austine',
    position: { x: 200, y: 200 },
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
    position: { x: 100, y: 400 },
    color: CHAR_COLORS.isabell,
  },
  {
    id: 'nicholas',
    name: 'Nicholas',
    position: { x: 700, y: 400 },
    color: CHAR_COLORS.nicholas,
  },
  {
    id: 'opal',
    name: 'Opal',
    position: { x: 300, y: 500 },
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
    position: { x: 400, y: 100 },
    color: CHAR_COLORS.victor,
  },
];

 // Game state management
class GameState {
  constructor() {
    this.currentCharacter = 'alexis';
    this.completedDialogues = new Set(); // Format: "characterId:npcId"
    this.unlockedCharacters = new Set(['alexis']);
    this.characterPositions = {};
    this.lastNPCTalkedId = null;
    this.lastNonFinalNPCTalkedId = null;

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
    if (!CHARACTERS[npcId]?.isFinalCharacter) {
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
    // Must talk to every other NON-FINAL NPC except yourself (exclude Victor)
    return NPCS.filter((npc) => npc.id !== characterId && !CHARACTERS[npc.id]?.isFinalCharacter)
      .every((npc) => this.hasCompletedDialogue(characterId, npc.id));
  }

  // Check if a character can be switched to
  canSwitchToCharacter(characterId) {
    if (characterId === this.currentCharacter) return false;

    const character = CHARACTERS[characterId];
    if (!character) return false;

    // Final character (Victor) unlock rule per design:
    // Complete all required interactions across non-final characters (42 total)
    if (character.isFinalCharacter) {
      const done = this.getCompletedInteractionsTowardVictor();
      const total = this.getTotalInteractionsTowardVictor();
      return done >= total;
    }

    return this.unlockedCharacters.has(characterId);
  }

  // Count total completed interactions across all non-final characters (toward Victor)
  getCompletedInteractionsTowardVictor() {
    // Count only non-final -> non-final (exclude self and exclude Victor in either role)
    const nonFinal = Object.keys(CHARACTERS).filter((id) => !CHARACTERS[id].isFinalCharacter);
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
  // Count how many non-final NPCs this character has already talked to (excluding self)
  getCompletedCountForCharacter(characterId) {
    return NPCS.filter((npc) => npc.id !== characterId && !CHARACTERS[npc.id]?.isFinalCharacter)
      .reduce((acc, npc) => acc + (this.hasCompletedDialogue(characterId, npc.id) ? 1 : 0), 0);
  }

  // Total targets this character needs to talk to (non-final minus self)
  getTotalTargetsPerCharacter() {
    const nonFinal = Object.keys(CHARACTERS).filter((id) => !CHARACTERS[id].isFinalCharacter);
    return Math.max(0, nonFinal.length - 1);
  }

  // Remaining interactions for this character to be considered "ready to switch"
  getRemainingForCharacterProgress(characterId) {
    const total = this.getTotalTargetsPerCharacter();
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
    Object.keys(CHARACTERS).forEach((charId) => {
      this.characterPositions[charId] = { ...CHARACTERS[charId].position };
    });
    try {
      localStorage.removeItem('switchGameState');
    } catch (_) {}
    this.save();
  }
}
