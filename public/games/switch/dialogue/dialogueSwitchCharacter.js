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
        isabela: {
            firstTime: [
                { speaker: 'player', text: "isabela, I need to switch perspectives with you." },
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
