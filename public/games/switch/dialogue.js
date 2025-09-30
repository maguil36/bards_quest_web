 // Dialogue system for the Switch game
 // Each NPC has different dialogue based on which character is talking to them

 // Helper function to convert arrays to dialogue objects in back-and-forth format
 function normalizeDialogue(dialogue) {
     if (!Array.isArray(dialogue)) return [];
     return dialogue.map((line, idx) => {
         if (typeof line === 'string') {
             return { speaker: idx % 2 === 0 ? 'npc' : 'player', text: line };
         }
         // If object but missing speaker, alternate by index
         return {
             speaker: line.speaker || (idx % 2 === 0 ? 'npc' : 'player'),
             text: line.text
         };
     });
 }

 const DIALOGUES = {
     npc1: { // The Wanderer
         name: 'The Wanderer',
         dialogues: {
             alexis: [
                 { speaker: 'npc', text: "Ah, a fellow traveler of the winds..." },
                 { speaker: 'player', text: "I follow where the air leads. Have you been out here long?" },
                 { speaker: 'npc', text: "I've been walking these paths for centuries, carried by the breeze." },
                 { speaker: 'player', text: "The currents feel restless today. Do you hear it too?" },
                 { speaker: 'npc', text: "The air whispers secrets to those who listen. Do you hear them?" },
                 { speaker: 'player', text: "I do. I'll keep listening." },
                 { speaker: 'npc', text: "May the winds guide your journey, Breath Walker." }
             ],
             austine: [
                 { speaker: 'npc', text: "Your radiance brightens even this dim corner of the world." },
                 { speaker: 'player', text: "I try to keep shadows short. What do you guard out here?" },
                 { speaker: 'npc', text: "I've seen many lights in my travels, but yours burns differently." },
                 { speaker: 'player', text: "Light means little without clarity." },
                 { speaker: 'npc', text: "Illumination isn't just about seeing - it's about understanding." },
                 { speaker: 'player', text: "Then I'll keep looking closely." },
                 { speaker: 'npc', text: "Shine on, Bearer of Light. The world needs your glow." }
             ],
             chloe: [
                 { speaker: 'npc', text: "Time... such a curious thing. You understand it better than most." },
                 { speaker: 'player', text: "It's a tide I try not to fight." },
                 { speaker: 'npc', text: "I've watched ages pass, but you... you can shape them." },
                 { speaker: 'player', text: "That power carries weight." },
                 { speaker: 'npc', text: "The past and future dance around you like old friends." },
                 { speaker: 'player', text: "Then I'll keep them company, carefully." },
                 { speaker: 'npc', text: "Use your gift wisely, Time Weaver. Some moments are too precious to change." }
             ],
             isabell: [
                 "The vastness of existence flows through you, doesn't it?",
                 "I've wandered far, but you've seen farther still.",
                 "Distance means nothing when you understand the true nature of space.",
                 "Keep exploring, Star Walker. The universe has more to show you."
             ],
             nicholas: [
                 "Such passion burns within you! I can feel it from here.",
                 "Emotion is the strongest force in any realm, you know.",
                 "Your heart beats with the rhythm of life itself.",
                 "Never lose that fire, Heart Bearer. The world grows cold without it."
             ],
             opal: [
                 "A logical approach to an illogical world. Fascinating.",
                 "I've met many thinkers, but few with your clarity of thought.",
                 "Knowledge is power, but wisdom is knowing how to use it.",
                 "Think well, Mind Keeper. The answers you seek are within reach."
             ],
             tyson: [
                 "Hope... the light that never dies, even in the darkest times.",
                 "Your optimism is infectious. I feel lighter just speaking with you.",
                 "Even I, ancient as I am, find renewed purpose in your presence.",
                 "Keep believing, Hope Bringer. Tomorrow needs your faith."
             ],
             victor: [
                 "Such fury! But controlled, focused. This is righteous anger.",
                 "I've seen empires fall to uncontrolled rage, but yours... yours builds.",
                 "Channel that fire, Rage Walker. The world needs change.",
                 "Your anger is justified. Use it to forge a better path."
             ]
         }
     },

    npc2: { // The Guardian
        name: 'The Guardian',
        dialogues: {
            alexis: [
                "Guardian of the threshold, I sense your freedom-loving spirit.",
                "The barriers I protect are not meant to cage, but to preserve.",
                "Your winds could carry away what I guard, yet you show restraint.",
                "Pass freely, Wind Rider. You understand the balance."
            ],
            austine: [
                "Your light reveals what others cannot see.",
                "I guard against the darkness, and you... you are its antithesis.",
                "Together, we could banish shadows from every corner.",
                "Illuminate the path, Light Bearer. I'll guard your back."
            ],
            chloe: [
                "Time flows around my post like water around stone.",
                "You could age me to dust or restore my youth, couldn't you?",
                "But you respect the natural order. That's wisdom.",
                "Guard your power well, Time Keeper. Not all deserve such gifts."
            ],
            isabell: [
                "Space bends around you like reality itself acknowledges your presence.",
                "I guard a single point, but you... you guard infinity.",
                "The boundaries I maintain are nothing compared to your domain.",
                "Protect the cosmos, Space Guardian. It's a burden we share."
            ],
            nicholas: [
                "Your emotions run deep, like roots that anchor the soul.",
                "I guard with duty, but you... you guard with love.",
                "That's a stronger shield than any I could raise.",
                "Feel deeply, Heart Guardian. Passion is the strongest armor."
            ],
            opal: [
                "Logic and duty - we understand each other perfectly.",
                "Your thoughts are ordered, precise. I respect that discipline.",
                "A guardian of knowledge is as vital as a guardian of places.",
                "Think clearly, Mind Guardian. Wisdom is our greatest weapon."
            ],
            tyson: [
                "Hope is what I guard against despair's advance.",
                "Your presence reminds me why I stand watch.",
                "Even in the darkest hour, you'd find the dawn.",
                "Keep hoping, Hope Guardian. It's what makes the watch worthwhile."
            ],
            victor: [
                "Controlled fury - the mark of a true warrior.",
                "I've seen rage destroy what it meant to protect.",
                "But yours... yours builds rather than burns.",
                "Fight well, Rage Guardian. Some things are worth the anger."
            ]
        }
    },

    npc3: { // The Sage
        name: 'The Sage',
        dialogues: {
            alexis: [
                "Wisdom flows like wind - it cannot be grasped, only felt.",
                "You understand freedom in ways that books cannot teach.",
                "The greatest truths are carried on the breeze.",
                "Learn from the air itself, Wind Sage. It holds ancient knowledge."
            ],
            austine: [
                "Enlightenment - both literal and metaphorical - radiates from you.",
                "I've studied in darkness for so long, your presence is... refreshing.",
                "True wisdom illuminates not just the mind, but the soul.",
                "Seek truth, Light Sage. Your inner fire will guide you."
            ],
            chloe: [
                "All knowledge exists simultaneously in the stream of time.",
                "You could learn from every era, couldn't you?",
                "But wisdom isn't about knowing everything - it's about understanding.",
                "Study well, Time Sage. The past holds keys to the future."
            ],
            isabell: [
                "The universe is the greatest library ever written.",
                "You have access to knowledge from across the cosmos.",
                "Distance is no barrier to learning when space bends to your will.",
                "Explore wisely, Space Sage. Infinite knowledge awaits."
            ],
            nicholas: [
                "Emotional intelligence is the rarest form of wisdom.",
                "You understand what moves people, what drives them.",
                "The heart's knowledge is often truer than the mind's.",
                "Feel deeply, Heart Sage. Empathy is the highest learning."
            ],
            opal: [
                "A kindred spirit! Logic and reason are our shared languages.",
                "Your thoughts are clear, your reasoning sound.",
                "Together, we could solve the greatest mysteries.",
                "Think deeply, Mind Sage. Pure logic is its own form of magic."
            ],
            tyson: [
                "Optimism in the face of uncertainty - that's true wisdom.",
                "I've studied for centuries, but you... you still believe.",
                "Hope is the foundation upon which all learning rests.",
                "Keep believing, Hope Sage. Faith opens doors that knowledge cannot."
            ],
            victor: [
                "Righteous anger can be the beginning of wisdom.",
                "You're angry at injustice, at ignorance. I understand.",
                "Channel that fury into learning, into change.",
                "Study your anger, Rage Sage. It will teach you what needs fixing."
            ]
        }
    },

    npc4: { // The Merchant
        name: 'The Merchant',
        dialogues: {
            alexis: [
                "Ah, a free spirit! The best customers, always seeking new horizons.",
                "I've got wares from across the windswept plains.",
                "Freedom has a price, but it's always worth paying.",
                "Travel light, Wind Trader. The journey is the treasure."
            ],
            austine: [
                "Your radiance draws customers like moths to flame!",
                "I deal in illumination - lanterns, crystals, knowledge.",
                "Bright customers always make the best deals.",
                "Shine on, Light Trader. Your glow is good for business!"
            ],
            chloe: [
                "Time is money, as they say, but you... you ARE time.",
                "I could use someone who understands temporal economics.",
                "The past had different currencies, the future will too.",
                "Invest wisely, Time Trader. You have all the time in the world."
            ],
            isabell: [
                "A cosmic customer! I've got goods from across the galaxy.",
                "Distance means nothing when you can fold space itself.",
                "The universe is my marketplace, and you're my best courier.",
                "Trade far, Space Merchant. The cosmos is full of opportunities."
            ],
            nicholas: [
                "Passion drives the best bargains, you know.",
                "I can see the desire in your eyes - you know what you want.",
                "Emotional investment always pays the highest dividends.",
                "Buy with your heart, Heart Trader. It never steers you wrong."
            ],
            opal: [
                "A logical customer! You'll appreciate my fair prices.",
                "I respect someone who thinks before they buy.",
                "Knowledge is the most valuable commodity of all.",
                "Calculate carefully, Mind Trader. Every deal has its logic."
            ],
            tyson: [
                "Optimistic customers are my favorite - they always see value!",
                "I'm selling dreams and possibilities today.",
                "Hope is the currency that never loses value.",
                "Invest in tomorrow, Hope Trader. The future is bright."
            ],
            victor: [
                "Angry at unfair prices? I respect that passion!",
                "Your fury could drive some hard bargains.",
                "Sometimes you need to fight for a fair deal.",
                "Negotiate fiercely, Rage Trader. Don't let anyone cheat you."
            ]
        }
    },
    
    npc5: { // The Oracle
        name: 'The Oracle',
        dialogues: {
            alexis: [
                "The winds carry whispers of what's to come...",
                "I see your path stretching across endless skies.",
                "Freedom will be both your gift and your burden.",
                "The future flows like air - impossible to grasp, but always present."
            ],
            austine: [
                "Your light will pierce the darkest prophecies.",
                "I foresee illumination where others see only shadow.",
                "The future brightens in your presence.",
                "Destiny shines clearer when you're near, Bearer of Light."
            ],
            chloe: [
                "Curious... you exist in all timelines simultaneously.",
                "The future is fluid when you're involved.",
                "I see past, present, and future, but you... you shape them all.",
                "Prophecy becomes choice in your hands, Time Shaper."
            ],
            isabell: [
                "The cosmos whispers secrets across infinite distances.",
                "I see your destiny written in the stars themselves.",
                "Space and time converge around your future.",
                "The universe has plans for you, Star Child."
            ],
            nicholas: [
                "Emotion colors every vision, every possible future.",
                "Your heart will guide you where logic cannot.",
                "I see love and loss, joy and sorrow - all part of your path.",
                "Feel your way forward, Heart Seeker. Intuition is your compass."
            ],
            opal: [
                "Logic illuminates the clearest path through prophecy.",
                "Your rational mind will solve puzzles others cannot.",
                "I see knowledge becoming wisdom in your future.",
                "Think your way through destiny, Mind Walker. Reason is your guide."
            ],
            tyson: [
                "Even the darkest prophecies brighten in your presence.",
                "Hope rewrites fate itself, you know.",
                "I see impossible victories in your future.",
                "Believe in tomorrow, Hope Bearer. Your faith shapes reality."
            ],
            victor: [
                "Your anger will topple unjust systems.",
                "I see revolution in your future - necessary change.",
                "Fury focused becomes the force that reshapes worlds.",
                "Fight for what's right, Rage Bringer. The future needs your fire."
            ]
        }
    },
    
    npc6: { // The Keeper
        name: 'The Keeper',
        dialogues: {
            alexis: [
                "I keep the records of all who pass through on the wind.",
                "Your freedom is noted, catalogued, preserved.",
                "Some things must be kept, even if they long to fly away.",
                "I'll remember your passage, Wind Walker."
            ],
            austine: [
                "Your radiance illuminates even the darkest archives.",
                "I keep the light of knowledge burning through the ages.",
                "Some truths must be preserved, no matter the cost.",
                "Your light will be remembered, Illuminator."
            ],
            chloe: [
                "I keep records across all timelines, all possibilities.",
                "Your temporal nature makes cataloguing... challenging.",
                "But some things transcend time itself.",
                "I'll keep your story safe, Time Walker."
            ],
            isabell: [
                "I maintain the cosmic archives, records from across the universe.",
                "Your spatial awareness helps me organize infinite knowledge.",
                "Distance means nothing to a proper filing system.",
                "The universe remembers through me, Space Keeper."
            ],
            nicholas: [
                "I keep the emotional history of all who pass.",
                "Your feelings add color to the stark records.",
                "Some memories are too precious to lose.",
                "Your heart's story is safe with me, Emotion Keeper."
            ],
            opal: [
                "A fellow keeper of knowledge! We understand each other.",
                "Logic helps organize even the most chaotic information.",
                "Your rational approach improves my filing system.",
                "Knowledge preserved is knowledge shared, Mind Keeper."
            ],
            tyson: [
                "I keep the dreams and aspirations of all who pass.",
                "Your hope adds light to even the darkest records.",
                "Some possibilities must be preserved for future generations.",
                "I'll keep your dreams safe, Hope Keeper."
            ],
            victor: [
                "I keep the records of injustice, of righteous anger.",
                "Your fury is justified - I have the documentation.",
                "Some anger must be preserved as a warning.",
                "Your rage is recorded and remembered, Fury Keeper."
            ]
        }
    },

    npc7: { // The Seeker
        name: 'The Seeker',
        dialogues: {
            alexis: [
                "I seek the freedom you embody so naturally.",
                "Teach me to move like the wind, unbound and pure.",
                "I've been searching for the path to true liberation.",
                "Your presence shows me what I've been seeking, Wind Seeker."
            ],
            austine: [
                "I seek the illumination you carry within.",
                "Your light shows me paths I never knew existed.",
                "I've been searching in darkness for so long.",
                "You are what I've been seeking, Light Seeker."
            ],
            chloe: [
                "I seek understanding of time's true nature.",
                "You hold the answers to questions I've pondered for ages.",
                "Teach me to see beyond the present moment.",
                "Time's secrets are what I seek, Time Seeker."
            ],
            isabell: [
                "I seek to understand the vastness you navigate.",
                "Your cosmic perspective is what I've been searching for.",
                "Show me how to see beyond these limited horizons.",
                "The universe's truth is what I seek, Space Seeker."
            ],
            nicholas: [
                "I seek the emotional truth you carry.",
                "Your heart holds the answers to questions I can't even ask.",
                "Teach me to feel as deeply as you do.",
                "Emotional wisdom is what I seek, Heart Seeker."
            ],
            opal: [
                "I seek the logical clarity you possess.",
                "Your rational approach could solve my greatest puzzles.",
                "Show me how to think with such precision.",
                "Mental clarity is what I seek, Mind Seeker."
            ],
            tyson: [
                "I seek the optimism that radiates from you.",
                "Your hope could light the way through my darkest doubts.",
                "Teach me to believe as you do.",
                "Unwavering faith is what I seek, Hope Seeker."
            ],
            victor: [
                "I seek the righteous fury you've mastered.",
                "Your controlled anger could fuel my own quest for justice.",
                "Show me how to channel rage into positive change.",
                "Focused fury is what I seek, Rage Seeker."
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
        // Support both simple string arrays and structured {speaker, text} arrays
        const line = this.currentDialogue[this.currentLineIndex];
        if (typeof line === 'string') {
            // Treat as NPC speaking when plain strings used
            return { speaker: 'npc', text: line };
        }
        return line; // { speaker: 'npc'|'player', text: string }
    }

    // Advance to the next line
    nextLine() {
        if (!this.isActive || !this.currentDialogue) return false;

        this.currentLineIndex++;

        if (this.currentLineIndex >= this.currentDialogue.length) {
            // Dialogue completed
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