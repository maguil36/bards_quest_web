// Dialogue system for the Switch game
// NPCs are the same as the playable characters. Each NPC has different dialogue
// based on which character is talking to them.

// Helper function to convert arrays to dialogue objects in back-and-forth format
function normalizeDialogue(dialogue) {
    if (!Array.isArray(dialogue)) return [];
    return dialogue.map((line, idx) => {
        if (typeof line === 'string') {
            return { speaker: idx % 2 === 0 ? 'npc' : 'player', text: line };
        }
        return {
            speaker: line.speaker || (idx % 2 === 0 ? 'npc' : 'player'),
            text: line.text
        };
    });
}

// Minimal sample dialogue keyed by character IDs (NPC IDs are the same)
// Add/expand these as desired; DialogueManager will use currentCharacter.id
const DIALOGUES = {
    alexis: {
        name: 'Alexis',
        dialogues: {
            alexis: [
                "Talking to yourself? The wind carries your words back.",
                "Perhaps it's time to seek perspective from another."
            ],
            austine: [
                { speaker: 'npc', text: "Your radiance brightens even this dim corner of the world." },
                { speaker: 'player', text: "I try to keep shadows short. What do you guard out here?" },
                { speaker: 'npc', text: "I've seen many lights in my travels, but yours burns differently." },
                { speaker: 'player', text: "Light means little without clarity." },
                { speaker: 'npc', text: "Illumination isn't just about seeing - it's about understanding." },
                { speaker: 'player', text: "Then I'll keep looking closely." },
                { speaker: 'npc', text: "Shine on, Austine. The world needs your glow." }
            ]
        }
    }
};

// Dialogue management class
class DialogueManager {
    constructor(gameState, npcs = null) {
        this.gameState = gameState;
        this.npcs = npcs || (typeof NPCS !== 'undefined' ? NPCS : []);
        this.currentDialogue = null;
        this.currentLineIndex = 0;
        this.isActive = false;
        this.currentNPC = null;
    }

    // Start a dialogue with an NPC
    startDialogue(npcId) {
        let npc = this.npcs.find(n => n.id === npcId);
        if (!npc) {
            // Allow self or off-list NPCs by falling back to CHARACTERS table
            if (typeof CHARACTERS !== 'undefined' && CHARACTERS[npcId]) {
                const c = CHARACTERS[npcId];
                npc = {
                    id: c.id,
                    name: c.name,
                    color: c.color,
                    position: c.position || { x: 0, y: 0 }
                };
            } else {
                console.error(`No NPC or character found with id: ${npcId}`);
                return false;
            }
        }

        const dialogueEntry = DIALOGUES[npcId];
        const currentCharacter = this.gameState.getCurrentCharacter();

        // Try to fetch authored dialogue first
        let characterDialogue = dialogueEntry && dialogueEntry.dialogues
            ? dialogueEntry.dialogues[currentCharacter.id]
            : null;

        // Fallback: generate a simple generic dialogue so interaction always works
        if (!characterDialogue) {
            const npcName = npc.name || (typeof CHARACTERS !== 'undefined' && CHARACTERS[npcId]?.name) || 'Stranger';
            const charName = currentCharacter.name || 'Traveler';
            if (npcId === currentCharacter.id) {
                // Self-reflection fallback
                characterDialogue = [
                    { speaker: 'player', text: `${charName} gathers their thoughts...` },
                    { speaker: 'npc', text: 'The world hums quietly around you.' },
                    { speaker: 'player', text: 'I should speak to everyone before moving on.' },
                ];
            } else {
                characterDialogue = [
                    { speaker: 'npc', text: `Hello, ${charName}.` },
                    { speaker: 'player', text: `Hi, ${npcName}.` },
                    { speaker: 'npc', text: `Safe travels.` },
                ];
            }
        }

        // Normalize all dialogue into back-and-forth objects
        characterDialogue = normalizeDialogue(characterDialogue);

        this.currentNPC = npc;
        this.currentDialogue = characterDialogue;
        this.currentLineIndex = 0;
        this.isActive = true;

        return true;
    }

    // Get the current dialogue line
    getCurrentLine() {
        if (!this.isActive || !this.currentDialogue) return null;
        const line = this.currentDialogue[this.currentLineIndex];
        if (typeof line === 'string') {
            return { speaker: 'npc', text: line };
        }
        return line; // { speaker: 'npc'|'player', text: string }
    }

    // Advance to the next line
    nextLine() {
        if (!this.isActive || !this.currentDialogue) return false;
        this.currentLineIndex++;
        if (this.currentLineIndex >= this.currentDialogue.length) {
            this.completeDialogue();
            return false;
        }
        return true;
    }

    // Complete the current dialogue
    completeDialogue() {
        if (this.currentNPC) {
            const currentCharacter = this.gameState.getCurrentCharacter();
            this.gameState.completeDialogue(currentCharacter.id, this.currentNPC.id);
            this.gameState.save();
        }
        this.currentDialogue = null;
        this.currentLineIndex = 0;
        this.isActive = false;
        this.currentNPC = null;
    }

    // Check if dialogue is active
    isDialogueActive() {
        return this.isActive;
    }

    // Get current NPC info
    getCurrentNPC() {
        return this.currentNPC;
    }

    // Get dialogue progress
    getProgress() {
        if (!this.isActive || !this.currentDialogue) return { current: 0, total: 0 };
        return {
            current: this.currentLineIndex + 1,
            total: this.currentDialogue.length
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DIALOGUES, DialogueManager };
}
