// Character definitions based on the 8 theme styles from styles.css
const CHARACTERS = {
    breath: {
        id: 'breath',
        name: 'Breath',
        theme: 'breath',
        color: '#007eb4',
        bgColor: '#F3F4F9',
        textColor: '#000000',
        music: 'audio/breath.mp3',
        sprite: 'sprites/characters/breath.png',
        portraitSprite: 'sprites/characters/breath_portrait.png',
        description: 'A calm and flowing character, master of wind and freedom.',
        unlocked: true, // Starting character
        position: { x: 400, y: 300 }
    },
    light: {
        id: 'light',
        name: 'Light',
        theme: 'light',
        color: '#ff8000',
        bgColor: '#ffffff',
        textColor: '#000000',
        music: 'audio/light.mp3',
        sprite: 'sprites/characters/light.png',
        portraitSprite: 'sprites/characters/light_portrait.png',
        description: 'A bright and optimistic character, bringer of illumination.',
        unlocked: false,
        position: { x: 200, y: 200 }
    },
    time: {
        id: 'time',
        name: 'Time',
        theme: 'time',
        color: '#ff4d4d',
        bgColor: '#2a1a1a',
        textColor: '#e8e9ec',
        music: 'audio/time.mp3',
        sprite: 'sprites/characters/time.png',
        portraitSprite: 'sprites/characters/time_portrait.png',
        description: 'A mysterious character who controls the flow of time.',
        unlocked: false,
        position: { x: 600, y: 200 }
    },
    space: {
        id: 'space',
        name: 'Space',
        theme: 'space',
        color: '#4da3ff',
        bgColor: '#0f1014',
        textColor: '#e8e9ec',
        music: 'audio/space.mp3',
        sprite: 'sprites/characters/space.png',
        portraitSprite: 'sprites/characters/space_portrait.png',
        description: 'A cosmic character who understands the vastness of existence.',
        unlocked: false,
        position: { x: 100, y: 400 }
    },
    heart: {
        id: 'heart',
        name: 'Heart',
        theme: 'heart',
        color: '#ff4da6',
        bgColor: '#2a1a2a',
        textColor: '#e8e9ec',
        music: 'audio/heart.mp3',
        sprite: 'sprites/characters/heart.png',
        portraitSprite: 'sprites/characters/heart_portrait.png',
        description: 'A passionate character driven by emotion and connection.',
        unlocked: false,
        position: { x: 700, y: 400 }
    },
    mind: {
        id: 'mind',
        name: 'Mind',
        theme: 'mind',
        color: '#00c2a0',
        bgColor: '#1a2a2a',
        textColor: '#e8e9ec',
        music: 'audio/mind.mp3',
        sprite: 'sprites/characters/mind.png',
        portraitSprite: 'sprites/characters/mind_portrait.png',
        description: 'A logical character who values knowledge and reason.',
        unlocked: false,
        position: { x: 300, y: 500 }
    },
    hope: {
        id: 'hope',
        name: 'Hope',
        theme: 'hope',
        color: '#df9f03',
        bgColor: '#f5f5dc',
        textColor: '#000000',
        music: 'audio/hope.mp3',
        sprite: 'sprites/characters/hope.png',
        portraitSprite: 'sprites/characters/hope_portrait.png',
        description: 'An optimistic character who believes in better futures.',
        unlocked: false,
        position: { x: 500, y: 500 }
    },
    rage: {
        id: 'rage',
        name: 'Rage',
        theme: 'rage',
        color: '#00ffff',
        bgColor: '#2a1a3a',
        textColor: '#ff00ff',
        music: 'audio/rage.mp3',
        sprite: 'sprites/characters/rage.png',
        portraitSprite: 'sprites/characters/rage_portrait.png',
        description: 'A fierce character powered by righteous anger.',
        unlocked: false,
        position: { x: 400, y: 100 },
        isFinalCharacter: true // This is the character that triggers the glitch ending
    }
};

// NPCs that need to be talked to
const NPCS = [
    {
        id: 'npc1',
        name: 'The Wanderer',
        position: { x: 150, y: 150 },
        sprite: 'sprites/npcs/wanderer.png',
        portraitSprite: 'sprites/npcs/wanderer_portrait.png',
        color: '#888888'
    },
    {
        id: 'npc2',
        name: 'The Guardian',
        position: { x: 650, y: 150 },
        sprite: 'sprites/npcs/guardian.png',
        portraitSprite: 'sprites/npcs/guardian_portrait.png',
        color: '#4a90e2'
    },
    {
        id: 'npc3',
        name: 'The Sage',
        position: { x: 150, y: 450 },
        sprite: 'sprites/npcs/sage.png',
        portraitSprite: 'sprites/npcs/sage_portrait.png',
        color: '#7b68ee'
    },
    {
        id: 'npc4',
        name: 'The Merchant',
        position: { x: 650, y: 450 },
        sprite: 'sprites/npcs/merchant.png',
        portraitSprite: 'sprites/npcs/merchant_portrait.png',
        color: '#ffa500'
    },
    {
        id: 'npc5',
        name: 'The Oracle',
        position: { x: 400, y: 200 },
        sprite: 'sprites/npcs/oracle.png',
        portraitSprite: 'sprites/npcs/oracle_portrait.png',
        color: '#9370db'
    },
    {
        id: 'npc6',
        name: 'The Keeper',
        position: { x: 300, y: 400 },
        sprite: 'sprites/npcs/keeper.png',
        portraitSprite: 'sprites/npcs/keeper_portrait.png',
        color: '#20b2aa'
    },
    {
        id: 'npc7',
        name: 'The Seeker',
        position: { x: 500, y: 400 },
        sprite: 'sprites/npcs/seeker.png',
        portraitSprite: 'sprites/npcs/seeker_portrait.png',
        color: '#ff6347'
    }
];

// Game state management
class GameState {
    constructor() {
        this.currentCharacter = 'breath';
        this.completedDialogues = new Set(); // Format: "characterId:npcId"
        this.unlockedCharacters = new Set(['breath']);
        this.characterPositions = {};
        
        // Initialize character positions
        Object.keys(CHARACTERS).forEach(charId => {
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
    
    // Check if all required NPCs have been talked to as a specific character
    hasCompletedAllDialogues(characterId) {
        return NPCS.every(npc => this.hasCompletedDialogue(characterId, npc.id));
    }
    
    // Check if a character can be switched to
    canSwitchToCharacter(characterId) {
        if (characterId === this.currentCharacter) return false;
        
        const character = CHARACTERS[characterId];
        if (!character) return false;
        
        // Final character (rage) can only be unlocked after talking to all NPCs as all other characters
        if (character.isFinalCharacter) {
            const otherCharacters = Object.keys(CHARACTERS).filter(id => 
                id !== characterId && !CHARACTERS[id].isFinalCharacter
            );
            return otherCharacters.every(charId => this.hasCompletedAllDialogues(charId));
        }
        
        return this.unlockedCharacters.has(characterId);
    }
    
    // Unlock a character for switching
    unlockCharacter(characterId) {
        this.unlockedCharacters.add(characterId);
    }
    
    // Switch to a different character
    switchCharacter(characterId) {
        if (this.canSwitchToCharacter(characterId)) {
            this.currentCharacter = characterId;
            return true;
        }
        return false;
    }
    
    // Get current character data
    getCurrentCharacter() {
        return CHARACTERS[this.currentCharacter];
    }
    
    // Get available characters for switching
    getAvailableCharacters() {
        return Object.keys(CHARACTERS).filter(charId => 
            this.canSwitchToCharacter(charId)
        ).map(charId => CHARACTERS[charId]);
    }
    
    // Check if ready to switch (completed all dialogues as current character)
    isReadyToSwitch() {
        return this.hasCompletedAllDialogues(this.currentCharacter);
    }
    
    // Save game state to localStorage
    save() {
        const saveData = {
            currentCharacter: this.currentCharacter,
            completedDialogues: Array.from(this.completedDialogues),
            unlockedCharacters: Array.from(this.unlockedCharacters),
            characterPositions: this.characterPositions
        };
        localStorage.setItem('switchGameState', JSON.stringify(saveData));
    }
    
    // Load game state from localStorage
    load() {
        const saveData = localStorage.getItem('switchGameState');
        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                this.currentCharacter = data.currentCharacter || 'breath';
                this.completedDialogues = new Set(data.completedDialogues || []);
                this.unlockedCharacters = new Set(data.unlockedCharacters || ['breath']);
                this.characterPositions = data.characterPositions || {};
                
                // Ensure all characters have positions
                Object.keys(CHARACTERS).forEach(charId => {
                    if (!this.characterPositions[charId]) {
                        this.characterPositions[charId] = { ...CHARACTERS[charId].position };
                    }
                });
            } catch (e) {
                console.warn('Failed to load save data:', e);
            }
        }
    }
    
    // Reset game state
    reset() {
        this.currentCharacter = 'breath';
        this.completedDialogues.clear();
        this.unlockedCharacters.clear();
        this.unlockedCharacters.add('breath');
        this.characterPositions = {};
        
        Object.keys(CHARACTERS).forEach(charId => {
            this.characterPositions[charId] = { ...CHARACTERS[charId].position };
        });
        
        localStorage.removeItem('switchGameState');
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CHARACTERS, NPCS, GameState };
}