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
                { speaker: 'npc', text: "" },
                { speaker: 'player', text: "Someone has to protect what matters. Not all of us solve problems with theft, Alexis." },
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
                { speaker: 'npc', text: "Well well well, looks like its the coward of my team who wants to run from the big fight instead of being useful and lending a hand." },
                { speaker: 'npc', text: "First you degrade yourself to licking Austine's boots but this is just another level of pathetic. Next time try to at least pretend to have some dignity." },
                { speaker: 'player', text: "Alexis, it has to be done this way and Austine's right, if a large enough metoer hits skia or any of the other planets it could end the entire session." },
                { speaker: 'player', text: "As it stands the planets are in a delicate balance. If we allow that to be disrupted, it could lead to catastrophic consequences." },
                { speaker: 'player', text: "The entire session could be at risk and we have no margin for error." },
                { speaker: 'npc', text: "Right, last I checked though you can throw a couple large objects accross a room but can't chuck a metoer, good luck with that." },
                { speaker: 'npc', text: "You could at least be useful and baby sit Victor and Tyson, that is basically what you were doing on your world with a bunch of gay frogs." },
                { speaker: 'player', text: "I really don't want to get dragged into another one of your endless arguements Alexis." },
                { speaker: 'npc', text: "Why? Because I always win them? Because your arguments are as weak as your resolve. Well I'm not going to solo the final boss while having to babysit 2 idiots while you go play some stupid side quest in the sky that no one cares about and you probably can't even do right." },
                { speaker: 'player', text: "Listen I know Tyson isn't the most successful in combat and Austine wants Victor not to use any of his powers but its still a 3 v 1 and all 3 of you are godtier." },
                { speaker: 'npc', text: "Oh yah just leave out the part that Victor is being told by everyone to not get invovled and Tyson's basically useless. Not that your much more useful either. But I'm sure you can take the king on just great by yourselves."},
                { speaker: 'player', text: "Fine what do you want?"},
                { speaker: 'npc', text: "Oh yah just leave out the part that Victor is being told by everyone to not get invovled and Tyson's basically useless. Not that your much more useful either. But I'm sure you can take the king on just great by yourselves." }
                

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

// Switch dialogue data - for character switching mechanic
const SWITCH_DIALOGUES = {
    opal: {
        alexis: {
            firstTime: [
                { speaker: 'player', text: "Hey Alexis, mind if I take over for a bit?" },
                { speaker: 'npc', text: "Take over? You mean switch bodies?" },
                { speaker: 'player', text: "Yeah, if you're cool with it, see." },
                { speaker: 'npc', text: "Whatever. Just don't screw anything up." }
            ],
            success: [
                { speaker: 'npc', text: "Alright, switching to you now." }
            ],
            failure: [
                { speaker: 'npc', text: "I don't work with weaklings. Prove yourself in combat first." },
                { speaker: 'player', text: "How many fights, see?" },
                { speaker: 'npc', text: "Take down at least 3 agents. Then we'll talk." }
            ]
        },
        austine: {
            firstTime: [
                { speaker: 'player', text: "Austine, I need to become you for this, see." },
                { speaker: 'npc', text: "Fascinating. The spatial transference required..." },
                { speaker: 'player', text: "Can we do it?" },
                { speaker: 'npc', text: "Yes, but only after we've established proper rapport." }
            ],
            success: [
                { speaker: 'npc', text: "Switching consciousness now. Prepare for sensory transfer." }
            ],
            failure: [
                { speaker: 'npc', text: "I need proof of your cognitive capacity first." },
                { speaker: 'player', text: "What kind of proof?" },
                { speaker: 'npc', text: "There's a puzzle piece hidden somewhere. Find it, and I'll know you can handle my abilities." }
            ]
        },
        chloe: {
            firstTime: [
                { speaker: 'player', text: "Chloe, can I switch with you?" },
                { speaker: 'npc', text: "Switch? Like... become me?" },
                { speaker: 'player', text: "Yeah, temporarily, see." },
                { speaker: 'npc', text: "That's intense. Let's talk more first." }
            ],
            success: [
                { speaker: 'npc', text: "Okay, let's do this." }
            ],
            failure: [
                { speaker: 'npc', text: "I'm worried about someone right now. A lost animal..." },
                { speaker: 'player', text: "You need me to find it?" },
                { speaker: 'npc', text: "If you can bring them to me, I'll know I can trust you with this connection." }
            ]
        },
        isabell: {
            firstTime: [
                { speaker: 'player', text: "Isabell, I need to switch perspectives with you." },
                { speaker: 'npc', text: "That's a deep connection to ask for." },
                { speaker: 'player', text: "I know. But it's necessary, see." },
                { speaker: 'npc', text: "Then let's build that connection first. Talk to me." }
            ],
            success: [
                { speaker: 'npc', text: "Our bond is strong enough. Let's switch." }
            ],
            failure: [
                { speaker: 'npc', text: "I need to know you've connected with everyone here." },
                { speaker: 'player', text: "So I should talk to everyone?" },
                { speaker: 'npc', text: "Yes. Build those bonds first, then come back to me." }
            ]
        },
        nicholas: {
            firstTime: [
                { speaker: 'player', text: "Nicholas, I need to switch to you." },
                { speaker: 'npc', text: "Direct request. I appreciate that." },
                { speaker: 'player', text: "Will it work, see?" },
                { speaker: 'npc', text: "Only if we understand each other first. Let's talk." }
            ],
            preMinigame: [
                { speaker: 'npc', text: "Let's test your aim. Hit the bullseye and we'll switch." }
            ],
            success: [
                { speaker: 'npc', text: "Impressive. We're aligned. Switching now." }
            ],
            failure: [
                { speaker: 'npc', text: "Not quite. Try again when you're ready." }
            ]
        },
        tyson: {
            firstTime: [
                { speaker: 'player', text: "Tyson, can we switch, see?" },
                { speaker: 'npc', text: "You want to experience doom firsthand?" },
                { speaker: 'player', text: "If that's what it takes." },
                { speaker: 'npc', text: "Heavy burden. Talk to me more first." }
            ],
            success: [
                { speaker: 'npc', text: "You're ready. Let's switch." }
            ],
            failure: [
                { speaker: 'npc', text: "I can only switch with someone who's proven themselves." },
                { speaker: 'player', text: "What do I need to do?" },
                { speaker: 'npc', text: "Complete your own quest first. Show me you can handle responsibility." }
            ]
        },
        victor: {
            firstTime: [
                { speaker: 'player', text: "Victor, I need to become you." },
                { speaker: 'npc', text: "Embrace entropy? Bold choice." },
                { speaker: 'player', text: "Can we do it, see?" },
                { speaker: 'npc', text: "Eventually. All things decay toward it. But talk to me first." }
            ],
            success: [
                { speaker: 'npc', text: "Time to switch. Let decay take its course." }
            ],
            failure: [
                { speaker: 'npc', text: "Not yet. The time hasn't come." },
                { speaker: 'player', text: "When will it be time?" },
                { speaker: 'npc', text: "After you've walked in everyone else's shoes. Experience all perspectives first." }
            ]
        }
    }
};

// Dialogue management class
class DialogueManager {
    constructor(gameState, npcs = null, game = null) {
        this.gameState = gameState;
        this.game = game;
        this.npcs = npcs || (typeof NPCS !== 'undefined' ? NPCS : []);
        this.currentDialogue = null;
        this.currentLineIndex = 0;
        this.isActive = false;
        this.currentNPC = null;

        this.showingMenu = false;
        this.menuOptions = [];
        this.selectedMenuOption = 0;
        this.switchDialogueShown = {};
        this.isSwitchDialogue = false;
        this.pendingSwitch = null;
        this.pendingMiniGame = null;
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
            return this.completeDialogue();
        }
        return true;
    }

    // Complete the current dialogue
    completeDialogue() {
        if (this.currentNPC && !this.isSwitchDialogue) {
            const currentCharacter = this.gameState.getCurrentCharacter();
            this.gameState.completeDialogue(currentCharacter.id, this.currentNPC.id);
            this.gameState.save();
        }

        if (this.pendingMiniGame) {
            const targetNpcId = this.pendingMiniGame;
            this.pendingMiniGame = null;
            this.currentDialogue = null;
            this.currentLineIndex = 0;
            this.isActive = false;
            this.currentNPC = null;
            this.isSwitchDialogue = false;
            return { action: 'minigame', target: targetNpcId };
        }

        if (this.pendingSwitch) {
            this.performSwitch(this.pendingSwitch);
            this.pendingSwitch = null;
        }

        this.currentDialogue = null;
        this.currentLineIndex = 0;
        this.isActive = false;
        this.currentNPC = null;
        this.isSwitchDialogue = false;

        return null;
    }

    // Cancel dialogue without recording completion (used when user closes the window)
    cancelDialogue() {
        this.currentDialogue = null;
        this.currentLineIndex = 0;
        this.isActive = false;
        this.currentNPC = null;
        this.showingMenu = false;
        this.isSwitchDialogue = false;
        this.pendingSwitch = null;
        this.pendingMiniGame = null;
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

    showHealingDialogue() {
        const currentChar = this.gameState.getCurrentCharacter();
        const currentHp = this.gameState.characters[currentChar.id]?.currentHp;
        const maxHp = 100;

        if (currentHp >= maxHp) {
            this.currentDialogue = [
                { speaker: 'player', text: "Chloe, could you heal me?" },
                { speaker: 'npc', text: "You're already at full health! You don't need healing right now." },
                { speaker: 'player', text: "Thanks for checking though." }
            ];
        } else {
            this.currentDialogue = [
                { speaker: 'player', text: "Chloe, I need healing..." },
                { speaker: 'npc', text: "Of course. Let me help you." },
                { speaker: 'npc', text: "*Chloe's gentle energy washes over you*" },
                { speaker: 'npc', text: "There. You should feel better now." },
                { speaker: 'player', text: "Thanks, Chloe. That really helped." }
            ];

            if (this.game && this.game.combatSystem) {
                this.game.combatSystem.healCharacter(currentChar.id);
            }
        }

        this.currentLineIndex = 0;
        this.isActive = true;
        this.isSwitchDialogue = false;
    }

    // Show interaction menu for an NPC
    showInteractionMenu(npcId) {
        let npc = this.npcs.find(n => n.id === npcId);
        if (!npc) {
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

        const currentCharacter = this.gameState.getCurrentCharacter();
        const hasTalkedTo = this.gameState.hasCompletedDialogue(currentCharacter.id, npcId);

        this.currentNPC = npc;
        this.showingMenu = true;
        this.isActive = true;
        this.selectedMenuOption = 0;

        this.menuOptions = [
            { id: 'talk', label: 'Talk to them', enabled: true },
            { id: 'switch', label: 'Switch character', enabled: hasTalkedTo },
            { id: 'cancel', label: 'Stop talking to them', enabled: true }
        ];

        if (npcId === 'chloe') {
            this.menuOptions.splice(2, 0, { id: 'heal', label: 'Ask for healing', enabled: true });
        }

        return true;
    }

    // Select a menu option
    selectMenuOption(optionId) {
        if (!this.showingMenu || !this.currentNPC) return false;

        const option = this.menuOptions.find(opt => opt.id === optionId);
        if (!option || !option.enabled) return false;

        this.showingMenu = false;

        if (optionId === 'talk') {
            return this.startDialogue(this.currentNPC.id);
        } else if (optionId === 'switch') {
            return this.startSwitchDialogue(this.currentNPC.id);
        } else if (optionId === 'heal') {
            this.showHealingDialogue();
            return true;
        } else if (optionId === 'cancel') {
            this.cancelDialogue();
            return false;
        }

        return false;
    }

    // Navigate menu up or down
    navigateMenu(direction) {
        if (!this.showingMenu) return;

        const enabledIndices = this.menuOptions
            .map((opt, idx) => opt.enabled ? idx : -1)
            .filter(idx => idx !== -1);

        if (enabledIndices.length === 0) return;

        const currentIdx = enabledIndices.indexOf(this.selectedMenuOption);
        let nextIdx;

        if (direction === 'up') {
            nextIdx = currentIdx > 0 ? currentIdx - 1 : enabledIndices.length - 1;
        } else {
            nextIdx = currentIdx < enabledIndices.length - 1 ? currentIdx + 1 : 0;
        }

        this.selectedMenuOption = enabledIndices[nextIdx];
    }

    // Confirm the currently selected menu option
    confirmMenuSelection() {
        if (!this.showingMenu) return false;
        const selectedOption = this.menuOptions[this.selectedMenuOption];
        if (!selectedOption) return false;
        return this.selectMenuOption(selectedOption.id);
    }

    startSwitchDialogue(targetNpcId) {
        const currentCharacter = this.gameState.getCurrentCharacter();
        const switchKey = `${currentCharacter.id}->${targetNpcId}`;
        const hasShownFirst = this.switchDialogueShown[switchKey];

        const switchData = SWITCH_DIALOGUES[currentCharacter.id]?.[targetNpcId];

        if (!switchData) {
            const canSwitch = this.gameState.canSwitchToCharacter(targetNpcId);
            if (canSwitch) {
                this.performSwitch(targetNpcId);
                return false;
            } else {
                console.log('Cannot switch to this character yet');
                return false;
            }
        }

        let dialogueToShow;

        if (!hasShownFirst) {
            dialogueToShow = switchData.firstTime;
            this.switchDialogueShown[switchKey] = true;
        } else {
            const targetChar = typeof CHARACTERS !== 'undefined' ? CHARACTERS[targetNpcId] : null;
            const unlockCriteria = targetChar?.quest?.unlockCriteria;
            let criteriaMetNow = false;

            switch(unlockCriteria) {
                case 'startingCharacter':
                    criteriaMetNow = true;
                    break;

                case 'defeat3Agents':
                    const cannotSwapWith = targetChar.quest.cannotSwapWith || [];
                    if (cannotSwapWith.includes(currentCharacter.id)) {
                        criteriaMetNow = false;
                    } else {
                        criteriaMetNow = this.gameState.combatStats?.agentsDefeated >= 3;
                    }
                    break;

                case 'findPuzzlePiece':
                    criteriaMetNow = this.gameState.gameItems?.puzzlePiece?.found === true;
                    break;

                case 'bringLostAnimal':
                    criteriaMetNow = this.gameState.inventory?.[currentCharacter.id]?.includes('lostAnimal') === true;
                    break;

                case 'talkToAll':
                    criteriaMetNow = this.gameState.hasCompletedAllDialogues(currentCharacter.id);
                    break;

                case 'beatMiniGame':
                    criteriaMetNow = this.gameState.miniGameScores?.nicholas >= 5;
                    if (!criteriaMetNow && switchData.preMinigame) {
                        dialogueToShow = switchData.preMinigame;
                        this.pendingMiniGame = targetNpcId;
                    }
                    break;

                case 'beOpalCompleted':
                    const onlySwappableBy = targetChar.quest.onlySwappableBy || [];
                    if (onlySwappableBy.length > 0 && !onlySwappableBy.includes(currentCharacter.id)) {
                        criteriaMetNow = false;
                    } else {
                        criteriaMetNow = this.gameState.questProgress?.opal?.completed === true;
                    }
                    break;

                case 'playedAllCharacters':
                    if (targetChar.isFinalCharacter) {
                        const hasPlayedAll = typeof CHARACTERS !== 'undefined' ?
                            Object.keys(CHARACTERS)
                                .filter(id => id !== 'victor')
                                .every(id => this.gameState.playedCharacters?.has(id)) : false;
                        criteriaMetNow = hasPlayedAll && this.gameState.hasCompletedAllDialogues(currentCharacter.id);
                    }
                    break;

                default:
                    criteriaMetNow = this.gameState.unlockedCharacters?.has(targetNpcId) === true;
                    break;
            }

            if (!dialogueToShow) {
                if (criteriaMetNow) {
                    dialogueToShow = switchData.success;
                    this.pendingSwitch = targetNpcId;
                } else {
                    dialogueToShow = switchData.failure;
                }
            }
        }

        if (!dialogueToShow || dialogueToShow.length === 0) {
            const canSwitch = this.gameState.canSwitchToCharacter(targetNpcId);
            if (canSwitch) {
                this.performSwitch(targetNpcId);
            }
            return false;
        }

        this.currentDialogue = normalizeDialogue(dialogueToShow);
        this.currentLineIndex = 0;
        this.isActive = true;
        this.isSwitchDialogue = true;

        return true;
    }

    performSwitch(targetNpcId) {
        if (this.game && this.game.switchToCharacter) {
            this.game.switchToCharacter(targetNpcId);
        } else if (this.gameState.switchCharacter) {
            this.gameState.switchCharacter(targetNpcId);
        }
    }

    handleMiniGameComplete(success, targetNpcId) {
        this.requiresMiniGame = false;
        const currentCharacter = this.gameState.getCurrentCharacter();
        const switchData = SWITCH_DIALOGUES[currentCharacter.id]?.[targetNpcId];

        if (!switchData) {
            if (success) {
                this.performSwitch(targetNpcId);
            }
            return false;
        }

        const dialogueToShow = success ? switchData.success : switchData.failure;

        if (!dialogueToShow || dialogueToShow.length === 0) {
            if (success) {
                this.performSwitch(targetNpcId);
            }
            return false;
        }

        this.currentDialogue = normalizeDialogue(dialogueToShow);
        this.currentLineIndex = 0;
        this.isActive = true;
        this.isSwitchDialogue = true;
        this.pendingSwitch = success ? targetNpcId : null;

        return true;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DIALOGUES, DialogueManager };
}
