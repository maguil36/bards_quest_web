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
            ],
            chloe: [
                { speaker: 'npc', text: "Time... such a curious thing. You understand it better than most." },
                { speaker: 'player', text: "It's a tide I try not to fight." },
                { speaker: 'npc', text: "I've watched ages pass, but you... you can shape them." },
                { speaker: 'player', text: "That power carries weight." },
                { speaker: 'npc', text: "The past and future dance around you like old friends." },
                { speaker: 'player', text: "Then I'll keep them company, carefully." },
                { speaker: 'npc', text: "Use your gift wisely, Chloe. Some moments are too precious to change." }
            ],
            isabell: [
                "The vastness of existence flows through you, doesn't it?",
                "I've wandered far, but you've seen farther still.",
                "Distance means nothing when you understand the true nature of space.",
                "Keep exploring, Isabell. The universe has more to show you."
            ],
            nicholas: [
                "Such passion burns within you! I can feel it from here.",
                "Emotion is the strongest force in any realm, you know.",
                "Your heart beats with the rhythm of life itself.",
                "Never lose that fire, Nicholas. The world grows cold without it."
            ],
            opal: [
                "A logical approach to an illogical world. Fascinating.",
                "I've met many thinkers, but few with your clarity of thought.",
                "Knowledge is power, but wisdom is knowing how to use it.",
                "Think well, Opal. The answers you seek are within reach."
            ],
            tyson: [
                "Hope... the light that never dies, even in the darkest times.",
                "Your optimism is infectious. I feel lighter just speaking with you.",
                "Even I, ancient as I am, find renewed purpose in your presence.",
                "Keep believing, Tyson. Tomorrow needs your faith."
            ],
            victor: [
                "Such fury! But controlled, focused. This is righteous anger.",
                "I've seen empires fall to uncontrolled rage, but yours... yours builds.",
                "Channel that fire, Victor. The world needs change.",
                "Your anger is justified. Use it to forge a better path."
            ]
        }
    },

    austine: {
        name: 'Austine',
        dialogues: {
            alexis: [
                "Guardian of the threshold, I sense your freedom-loving spirit.",
                "The barriers I protect are not meant to cage, but to preserve.",
                "Your winds could carry away what I guard, yet you show restraint.",
                "Pass freely, Alexis. You understand the balance."
            ],
            austine: [
                "Self-reflection keeps your light honest.",
                "Look inward; illuminate your own corners first."
            ],
            chloe: [
                "Time flows around my post like water around stone.",
                "You could age me to dust or restore my youth, couldn't you?",
                "But you respect the natural order. That's wisdom.",
                "Guard your power well, Chloe. Not all deserve such gifts."
            ],
            isabell: [
                "Space bends around you like reality itself acknowledges your presence.",
                "I guard a single point, but you... you guard infinity.",
                "The boundaries I maintain are nothing compared to your domain.",
                "Protect the cosmos, Isabell. It's a burden we share."
            ],
            nicholas: [
                "Your emotions run deep, like roots that anchor the soul.",
                "I guard with duty, but you... you guard with love.",
                "That's a stronger shield than any I could raise.",
                "Feel deeply, Nicholas. Passion is the strongest armor."
            ],
            opal: [
                "Logic and duty - we understand each other perfectly.",
                "Your thoughts are ordered, precise. I respect that discipline.",
                "A guardian of knowledge is as vital as a guardian of places.",
                "Think clearly, Opal. Wisdom is our greatest weapon."
            ],
            tyson: [
                "Hope is what I guard against despair's advance.",
                "Your presence reminds me why I stand watch.",
                "Even in the darkest hour, you'd find the dawn.",
                "Keep hoping, Tyson. It's what makes the watch worthwhile."
            ],
            victor: [
                "Controlled fury - the mark of a true warrior.",
                "I've seen rage destroy what it meant to protect.",
                "But yours... yours builds rather than burns.",
                "Fight well, Victor. Some things are worth the anger."
            ]
        }
    },

    chloe: {
        name: 'Chloe',
        dialogues: {
            alexis: [
                "Wisdom flows like wind - it cannot be grasped, only felt.",
                "You understand freedom in ways that books cannot teach.",
                "The greatest truths are carried on the breeze.",
                "Learn from the air itself, Alexis. It holds ancient knowledge."
            ],
            austine: [
                "Enlightenment - both literal and metaphorical - radiates from you.",
                "I've studied in darkness for so long, your presence is... refreshing.",
                "True wisdom illuminates not just the mind, but the soul.",
                "Seek truth, Austine. Your inner fire will guide you."
            ],
            chloe: [
                "A conversation with the self is a study in paradox.",
                "Listen closely; time repeats what we do not learn."
            ],
            isabell: [
                "The universe is the greatest library ever written.",
                "You have access to knowledge from across the cosmos.",
                "Distance is no barrier to learning when space bends to your will.",
                "Explore wisely, Isabell. Infinite knowledge awaits."
            ],
            nicholas: [
                "Emotional intelligence is the rarest form of wisdom.",
                "You understand what moves people, what drives them.",
                "The heart's knowledge is often truer than the mind's.",
                "Feel deeply, Nicholas. Empathy is the highest learning."
            ],
            opal: [
                "A kindred spirit! Logic and reason are our shared languages.",
                "Your thoughts are clear, your reasoning sound.",
                "Together, we could solve the greatest mysteries.",
                "Think deeply, Opal. Pure logic is its own form of magic."
            ],
            tyson: [
                "Optimism in the face of uncertainty - that's true wisdom.",
                "I've studied for centuries, but you... you still believe.",
                "Hope is the foundation upon which all learning rests.",
                "Keep believing, Tyson. Faith opens doors that knowledge cannot."
            ],
            victor: [
                "Righteous anger can be the beginning of wisdom.",
                "You're angry at injustice, at ignorance. I understand.",
                "Channel that fury into learning, into change.",
                "Study your anger, Victor. It will teach you what needs fixing."
            ]
        }
    },
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
        const npc = this.npcs.find(n => n.id === npcId);
        const dialogue = DIALOGUES[npcId];

        if (!npc || !dialogue) {
            console.error(`No dialogue found for NPC: ${npcId}`);
            return false;
        }

        const currentCharacter = this.gameState.getCurrentCharacter();
        let characterDialogue = dialogue.dialogues[currentCharacter.id];

        if (!characterDialogue) {
            console.error(`No dialogue found for character ${currentCharacter.id} with NPC ${npcId}`);
            return false;
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
