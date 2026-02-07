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
    opal: {
        name: 'Opal',
        dialogues: {
            alexis: [
                { speaker: 'npc', text: "Opal. Still playing space cop for the frogs, see?" },
                { speaker: 'player', text: "Someone has to protect what matters. Not all of us solve problems with theft, Alexis." }
            ],
            austine: [
                { speaker: 'npc', text: "Your spatial patterns are mathematically elegant. Have you considered the underlying topology?" },
                { speaker: 'player', text: "I don't overthink it, Austine. Space just... works for me, see." }
            ],
            chloe: [
                { speaker: 'npc', text: "You always seem so grounded, Opal. How do you stay so calm?" },
                { speaker: 'player', text: "When you're responsible for keeping reality stable, panic isn't an option, see." }
            ],
            isabell: [
                { speaker: 'npc', text: "I've been trying to organize everyone. Think you could help coordinate?" },
                { speaker: 'player', text: "Space brings people together. Blood keeps them together. I'll help, see." }
            ],
            nicholas: [
                { speaker: 'npc', text: "Knight of Space, huh? Pretty straightforward compared to destroying Light." },
                { speaker: 'player', text: "Straightforward doesn't mean easy. We both defend what needs defending, see." }
            ],
            tyson: [
                { speaker: 'npc', text: "Everything feels inevitable now. Does space ever feel like a cage to you?" },
                { speaker: 'player', text: "Space is freedom, Tyson. Doom might trap you, but you don't have to let it, see." }
            ],
            victor: [
                { speaker: 'npc', text: "Space without time is just static emptiness. We're complementary opposites." },
                { speaker: 'player', text: "And time without space has nowhere to go. Guess we need each other, see." }
            ],
        }
    },
    alexis: {
        name: 'Alexis',
        dialogues: {
            opal: [
                { speaker: 'npc', text: "You're way too uptight about those frogs. Learn to take what you need." },
                { speaker: 'player', text: "That's rich coming from the Thief of Rage. Not everything's about stealing, Opal." }
            ],
            austine: [
                { speaker: 'npc', text: "Do you ever just... act without analyzing everything to death?" },
                { speaker: 'player', text: "Do you ever think before channeling pure rage? We have different approaches, Alexis." }
            ],
            chloe: [
                { speaker: 'npc', text: "You preserve life, I take power. We're basically opposites." },
                { speaker: 'player', text: "Maybe. But we both fight for what we believe in, even if our methods differ." }
            ],
            isabell: [
                { speaker: 'npc', text: "All this 'team unity' stuff feels suffocating. Can't we just work independently?" },
                { speaker: 'player', text: "Independence is fine until you realize you need backup. Bonds aren't chains, Alexis." }
            ],
            nicholas: [
                { speaker: 'npc', text: "You destroy lies. I steal strength. We'd make a terrifying duo." },
                { speaker: 'player', text: "Terrifying, sure. But effective? Absolutely. Let's prove it." }
            ],
            tyson: [
                { speaker: 'npc', text: "Stop moping about doom. Channel it into something useful already." },
                { speaker: 'player', text: "Not everyone processes pain by getting angry, Alexis. Give me time." }
            ],
            victor: [
                { speaker: 'npc', text: "You're chaos incarnate. Finally, someone who gets it." },
                { speaker: 'player', text: "Chaos serves a purpose. Entropy is just... decay. But yeah, we understand destruction." }
            ],
        }
    },
    austine: {
        name: 'Austine',
        dialogues: {
            opal: [
                { speaker: 'npc', text: "You handle spatial problems intuitively. I need to calculate everything first." },
                { speaker: 'player', text: "Different problem-solving styles, Opal. Both get results, see?" }
            ],
            alexis: [
                { speaker: 'npc', text: "Your rage seems inefficient. Have you tried strategic anger management?" },
                { speaker: 'player', text: "Have you tried not analyzing people's emotions like data, Austine?" }
            ],
            chloe: [
                { speaker: 'npc', text: "Mind and Life should work well together. Logic guides healing decisions." },
                { speaker: 'player', text: "Healing isn't just logic, Austine. Sometimes you need to feel who needs saving." }
            ],
            isabell: [
                { speaker: 'npc', text: "Your coordination puzzles are fascinating. Multi-variable optimization problems." },
                { speaker: 'player', text: "They're about people connecting, not equations. But I appreciate the perspective." }
            ],
            nicholas: [
                { speaker: 'npc', text: "Destroying false knowledge... that's essentially debugging reality, isn't it?" },
                { speaker: 'player', text: "Huh. Never thought of it that way. Debugging with explosions. I like it." }
            ],
            tyson: [
                { speaker: 'npc', text: "Your doom follows observable patterns. Want me to help predict—" },
                { speaker: 'player', text: "No. Some things shouldn't be calculated, Austine. Just... no." }
            ],
            victor: [
                { speaker: 'npc', text: "Entropy is mathematically inevitable. Does that ever terrify you?" },
                { speaker: 'player', text: "Terror implies emotion. I just accept thermodynamics. You embody them." }
            ],
        }
    },
    chloe: {
        name: 'Chloe',
        dialogues: {
            opal: [
                { speaker: 'npc', text: "You protect your frogs with so much dedication. It's admirable." },
                { speaker: 'player', text: "Thanks, Chloe. You heal what's broken. I defend what's growing. We're similar, see." }
            ],
            alexis: [
                { speaker: 'npc', text: "Why do you steal from others instead of building your own strength?" },
                { speaker: 'player', text: "Because taking is faster than growing. Not everyone has your patience, Chloe." }
            ],
            austine: [
                { speaker: 'npc', text: "You treat healing like optimization. Don't you ever just... care?" },
                { speaker: 'player', text: "Efficiency saves more lives. But yes, I do care. Logic doesn't exclude compassion." }
            ],
            isabell: [
                { speaker: 'npc', text: "We both nurture in different ways. You build bonds, I tend wounds." },
                { speaker: 'player', text: "Foundation and flourishing. Together we create spaces where people can thrive." }
            ],
            nicholas: [
                { speaker: 'npc', text: "Your Light destroys lies. But sometimes lies protect people from hard truths." },
                { speaker: 'player', text: "False comfort isn't kindness, Chloe. Real healing requires honest truth." }
            ],
            tyson: [
                { speaker: 'npc', text: "You're carrying so much pain. Please, let me help you." },
                { speaker: 'player', text: "I appreciate it, but this is something I need to work through myself." }
            ],
            victor: [
                { speaker: 'npc', text: "You let everything decay. How can you be okay with that?" },
                { speaker: 'player', text: "Life and death are one cycle, Chloe. You can't have growth without entropy." }
            ],
        }
    },
    isabell: {
        name: 'Isabell',
        dialogues: {
            opal: [
                { speaker: 'npc', text: "You're good at bringing people together. Want to help me organize this chaos?" },
                { speaker: 'player', text: "Space creates proximity, Blood maintains unity. Together, we'll coordinate everyone, see." }
            ],
            alexis: [
                { speaker: 'npc', text: "Every time I build team cohesion, you go rogue. It's frustrating." },
                { speaker: 'player', text: "Bonds work better when they're chosen, not mandated. Stop forcing unity." }
            ],
            austine: [
                { speaker: 'npc', text: "Connection requires vulnerability, not just logic. You get that, right?" },
                { speaker: 'player', text: "Intellectually, yes. Emotionally? I'm working on it, Isabell." }
            ],
            chloe: [
                { speaker: 'npc', text: "We're both nurturers. You heal individuals, I maintain group bonds." },
                { speaker: 'player', text: "Different scales of care. But both necessary for a healthy team." }
            ],
            nicholas: [
                { speaker: 'npc', text: "Your Light could guide everyone to work together more effectively." },
                { speaker: 'player', text: "Revelation shows the path. Blood makes sure everyone walks it together." }
            ],
            tyson: [
                { speaker: 'npc', text: "You don't have to face doom alone. Let us help shoulder the burden." },
                { speaker: 'player', text: "That's kind, but... this is my role. I can't ask you to share this." }
            ],
            victor: [
                { speaker: 'npc', text: "Your chaos undermines everything I'm trying to build here." },
                { speaker: 'player', text: "All structures fail eventually. I'm just honest about the timeline." }
            ],
        }
    },
    nicholas: {
        name: 'Nicholas',
        dialogues: {
            opal: [
                { speaker: 'npc', text: "Knight of Space. Direct, protective, straightforward. Refreshing, honestly." },
                { speaker: 'player', text: "And you're a Prince who destroys deception. We both fight for truth, see." }
            ],
            alexis: [
                { speaker: 'npc', text: "Your theft is brutally honest. No pretense, just raw power redistribution." },
                { speaker: 'player', text: "Finally, someone who gets it. No lies, just action." }
            ],
            austine: [
                { speaker: 'npc', text: "You decode reality's puzzles. I destroy its false answers. Similar goals." },
                { speaker: 'player', text: "Understanding versus elimination. Both reveal truth eventually." }
            ],
            chloe: [
                { speaker: 'npc', text: "Life and Light should complement each other. Growth needs honest illumination." },
                { speaker: 'player', text: "And truth needs gentleness sometimes. Balance makes both more effective." }
            ],
            isabell: [
                { speaker: 'npc', text: "Your bonds are genuine, not forced. That's rare. I respect that." },
                { speaker: 'player', text: "And your light doesn't manipulate. It just reveals. That's admirable." }
            ],
            tyson: [
                { speaker: 'npc', text: "Doom and Light... we both deal with harsh realities, don't we?" },
                { speaker: 'player', text: "You destroy false hope. I just... live with the real suffering beneath it." }
            ],
            victor: [
                { speaker: 'npc', text: "You're a Bard of Time. Chaos enabling entropy's march forward." },
                { speaker: 'player', text: "And you're a Prince of Light. Destruction revealing truth. We understand destruction." }
            ],
        }
    },
    tyson: {
        name: 'Tyson',
        dialogues: {
            opal: [
                { speaker: 'npc', text: "You make everything look so stable. How do you do that?" },
                { speaker: 'player', text: "Practice and responsibility, Tyson. Your doom doesn't define your capability, see." }
            ],
            alexis: [
                { speaker: 'npc', text: "You channel pain outward. I just... absorb it inward. Maybe I should try your way." },
                { speaker: 'player', text: "Or maybe you need to process it your way first. Stop comparing, start accepting." }
            ],
            austine: [
                { speaker: 'npc', text: "Stop trying to analyze my suffering. It's not a puzzle to solve." },
                { speaker: 'player', text: "I was trying to help. But you're right. I apologize, Tyson." }
            ],
            chloe: [
                { speaker: 'npc', text: "You offer healing, but some wounds aren't meant to close yet." },
                { speaker: 'player', text: "I understand. When you're ready for help, I'll be here." }
            ],
            isabell: [
                { speaker: 'npc', text: "Everyone wants me to join the group, but this burden feels too personal to share." },
                { speaker: 'player', text: "Isolation is a choice, not a requirement. You don't have to carry everything alone." }
            ],
            nicholas: [
                { speaker: 'npc', text: "Your light destroys false comfort. I... I might need that clarity eventually." },
                { speaker: 'player', text: "Whenever you're ready for truth, I'll help illuminate it." }
            ],
            victor: [
                { speaker: 'npc', text: "You embrace endings. I'm stuck in one beginning's aftermath. How do you move forward?" },
                { speaker: 'player', text: "By accepting that every moment, even painful ones, passes. The music plays on." }
            ],
        }
    },
    victor: {
        name: 'Victor',
        dialogues: {
            opal: [
                { speaker: 'npc', text: "Space holds everything stable. I make it all crumble. Opposites, really." },
                { speaker: 'player', text: "Stability and change both have purpose. We balance each other, see." }
            ],
            alexis: [
                { speaker: 'npc', text: "You steal in moments of rage. I enable chaos across timelines. Kindred spirits." },
                { speaker: 'player', text: "Chaos and rage... yeah, we both understand necessary destruction." }
            ],
            austine: [
                { speaker: 'npc', text: "You calculate futures. I destroy their stability. Does that frustrate you?" },
                { speaker: 'player', text: "Scientifically? Yes. Philosophically? I'm learning to accept uncertainty." }
            ],
            chloe: [
                { speaker: 'npc', text: "Life fights entropy. But entropy always wins eventually. Do you hate me for that?" },
                { speaker: 'player', text: "No. You're honest about what I already know. Death gives life meaning." }
            ],
            isabell: [
                { speaker: 'npc', text: "Every bond you create will eventually break. Time guarantees it." },
                { speaker: 'player', text: "Then we rebuild. Again and again. That's what Blood does, Victor." }
            ],
            nicholas: [
                { speaker: 'npc', text: "You destroy false Light. I enable destruction of Time itself. Different scales, same role." },
                { speaker: 'player', text: "Prince and Bard. Active destroyer versus passive enabler. We're complementary." }
            ],
            tyson: [
                { speaker: 'npc', text: "Doom trapped you in one moment. Time forces me to witness all moments decay." },
                { speaker: 'player', text: "Two different prisons. Both terrible in their own way." }
            ],
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
            const npcName = npc.name || (typeof CHARACTERS !== 'undefined' && CHARACTERS[npcId] && CHARACTERS[npcId].name) || 'Stranger';
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

    // Cancel dialogue without recording completion (used when user closes the window)
    cancelDialogue() {
        // Do not mark the dialogue as complete in the game state.
        // Just reset local dialogue state so it can be resumed or retried later.
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
