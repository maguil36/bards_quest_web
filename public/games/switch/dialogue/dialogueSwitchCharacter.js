const SWITCH_DIALOGUES = {
    opal: {
        alexis: {
            firstTime: [
                { speaker: 'player', text: "Alexis, could you help me with something? I need you to join the fight." },
                { speaker: 'npc', text: "Help YOU? Why would I do that? You want my help? Fine. Go prove you're not completely useless. Defeat one of the bosses. ANY of them. DD, SS, HB, CB - pick one and actually WIN for once. Then maybe, MAYBE, I'll consider it." }
            ],
            success: [
                { speaker: 'npc', text: "Wait, you actually beat a boss? I... okay, fine. You're not as pathetic as I thought. I'll join you. But don't think this means I'm suddenly going to start listening to your every command." }
            ],
            failure: [
                { speaker: 'npc', text: "Still haven't beaten a boss, have you? Exactly what I expected. Come back when you've actually accomplished something." }
            ]
        },
        austine: {
            firstTime: [
                { speaker: 'player', text: "Austine, I believe we could use your expertise. Would you be willing to assist?" },
                { speaker: 'npc', text: "Logically speaking, I would. However, I require a specific item first. You'll need Tyson to obtain it and deliver it to me. I'm certain you can deduce why I need HIM specifically to do this. Figure it out." }
            ],
            success: [
                { speaker: 'npc', text: "Ah, Tyson delivered the item. Consequently, I can now provide my assistance. As anticipated, everything proceeds according to logical parameters." }
            ],
            failure: [
                { speaker: 'npc', text: "The necessary item has not been delivered by Tyson. Therefore, my involvement remains... postponed." }
            ]
        },
        chloe: {
            firstTime: [
                { speaker: 'player', text: "Chloe, I could really use your help. Will you join me?" },
                { speaker: 'npc', text: "I'd like to help, I really would... but I can't just abandon everything here. My pet is lost, and I need to find them first. If you could help me retrieve them, then yes, I'll absolutely help you. It's just... they need me right now, you understand?" }
            ],
            success: [
                { speaker: 'npc', text: "You found them! Oh thank goodness. I can't tell you how much this means to me. Of course I'll help you now - it's the least I can do after what you've done for me." }
            ],
            failure: [
                { speaker: 'npc', text: "Have you found my pet yet? I know you have your own things to worry about, but... I really can't leave until they're safe. I hope you understand." }
            ]
        },
        isabela: {
            firstTime: [
                { speaker: 'player', text: "Isabela, I need someone I can count on. Will you help?" },
                { speaker: 'npc', text: "Of course I want to help - we're all in this together. But here's the thing: you need to talk to everyone first. All seven of them. Get the team on the same page, understand where everyone's at. THEN we can work together effectively. Trust me on this one." }
            ],
            success: [
                { speaker: 'npc', text: "You talked to everyone! See? That wasn't so hard. Now we're all connected, all working toward the same goal. Let's do this together." }
            ],
            failure: [
                { speaker: 'npc', text: "You haven't talked to everyone yet. We need the whole team united before we move forward. Keep going, you'll get there." }
            ]
        },
        nicholas: {
            firstTime: [
                { speaker: 'player', text: "Nicholas, I need your skills. Can you help me?" },
                { speaker: 'npc', text: "Help... perhaps. But can you prove your worth? The target game awaits. Win it, and we'll see what happens. Or don't. The choice reveals much, doesn't it?" }
            ],
            success: [
                { speaker: 'npc', text: "You won. Interesting. Very... interesting. I suppose that means our paths align. For now." }
            ],
            failure: [
                { speaker: 'npc', text: "The game remains unwon. A curious predicament, wouldn't you say? Try again... or perhaps not." }
            ]
        },
        tyson: {
            firstTime: [
                { speaker: 'npc', text: "Hi Opal... Do you need anything? Your helpful page of doom here to be, well helpful." },
                { speaker: 'player', text: "Sorry Tyson, I'm a bit busy right now, maybe later." }
            ],
            success: [
                { speaker: 'npc', text: "Oh yah, sounds like your done so mind if I help out?" },
                { speaker: 'player', text: "Sure I guess." }
            ],
            failure: [
                { speaker: 'npc', text: "Oh your still busy, let me know when your free." }
            ]
        },
        victor: {
            firstTime: [
                { speaker: 'player', text: "Victor, I could use your help with something important." },
                { speaker: 'npc', text: "Oh, yeah, sure! I mean, I'd love to help. But, like... have you finished everything else? All the other quests? It's just - and this reminds me of this painting I saw once, the composition was all about completing the outer elements before the center - anyway, yeah, finish all seven of the other quests first. Then we can, you know, whatever." }
            ],
            success: [
                { speaker: 'npc', text: "Whoa, you actually finished all seven quests? That's... that's actually impressive. Yeah, okay, I'm in. Let's do this thing." }
            ],
            failure: [
                { speaker: 'npc', text: "Still working on those other quests, huh? No rush, take your time. Journey over destination and all that, right?" }
            ]
        }
    },
    tyson: {
        alexis: {
            firstTime: [
                { speaker: 'player', text: "Can you... help me?" },
                { speaker: 'npc', text: "YOU? You want ME to help YOU? That's rich. Beat a boss first. Prove you're not a complete waste of space. Then we'll talk." }
            ],
            success: [
                { speaker: 'npc', text: "You beat a boss? Fine. I'll help. Don't expect me to be nice about it." }
            ],
            failure: [
                { speaker: 'npc', text: "Still no boss defeated. Typical. Get lost." }
            ]
        },
        austine: {
            firstTime: [
                { speaker: 'player', text: "I need your help, Austine." },
                { speaker: 'npc', text: "Of course you do. Everyone does. I require a specific item - you'll need to obtain it and deliver it to me personally. I trust you understand the parameters of this arrangement." }
            ],
            success: [
                { speaker: 'npc', text: "The item has been delivered. Satisfactory. I'll provide my assistance accordingly." }
            ],
            failure: [
                { speaker: 'npc', text: "No item, no assistance. The equation is quite simple." }
            ]
        },
        chloe: {
            firstTime: [
                { speaker: 'player', text: "Chloe, I could use your help." },
                { speaker: 'npc', text: "Oh, Tyson... I wish I could, but my pet is missing. If you could help find them, I'd be so grateful. Then I can focus on helping you properly." }
            ],
            success: [
                { speaker: 'npc', text: "You found my pet! Thank you so much, Tyson. I'll definitely help you now." }
            ],
            failure: [
                { speaker: 'npc', text: "I really want to help, but... I need to find my pet first. Please understand." }
            ]
        },
        isabela: {
            firstTime: [
                { speaker: 'player', text: "Isabela, can you help me?" },
                { speaker: 'npc', text: "I'd be happy to help, Tyson. But first, you need to connect with everyone. Talk to all seven characters. Build those bridges. Then we'll work together." }
            ],
            success: [
                { speaker: 'npc', text: "You talked to everyone! Great work. Now let's get this done together." }
            ],
            failure: [
                { speaker: 'npc', text: "Keep talking to people, Tyson. We need everyone on board." }
            ]
        },
        nicholas: {
            firstTime: [
                { speaker: 'player', text: "I need you to help me, Nicholas." },
                { speaker: 'npc', text: "Need. Such a demanding word. Win the target game. Then perhaps... or perhaps not." }
            ],
            success: [
                { speaker: 'npc', text: "The game is won. How... convenient. Very well." }
            ],
            failure: [
                { speaker: 'npc', text: "The game awaits. Does it not?" }
            ]
        },
        opal: {
            firstTime: [
                { speaker: 'player', text: "Opal, I need you." },
                { speaker: 'npc', text: "Tyson, I... I want to help, truly. But perhaps you should talk to Austine first? I believe he might have insights that would be valuable for you." }
            ],
            success: [
                { speaker: 'npc', text: "You spoke with Austine. That's... that's good. I'll help you now, Tyson. I hope I can be what you need me to be." }
            ],
            failure: [
                { speaker: 'npc', text: "Have you talked to Austine yet? I think it would be wise to do that first." }
            ]
        },
        victor: {
            firstTime: [
                { speaker: 'player', text: "Victor, will you help me?" },
                { speaker: 'npc', text: "Help you? Yeah, totally! But, uh, maybe finish up all the other quests first? Like, all seven of them. It's like when you're painting - you gotta finish the background before the focal point, you know? Anyway, yeah, do those first." }
            ],
            success: [
                { speaker: 'npc', text: "All seven quests done? Nice! Yeah, I'm in. Let's go." }
            ],
            failure: [
                { speaker: 'npc', text: "Still got those other quests to wrap up. No worries, take your time." }
            ]
        }
    },
    victor: {
        alexis: {
            firstTime: [
                { speaker: 'player', text: "Hey Alexis, think you could help me out?" },
                { speaker: 'npc', text: "Oh, so NOW you need my help? Beat a boss. DD, SS, HB, or CB. I don't care which. Just prove you can actually DO something." }
            ],
            success: [
                { speaker: 'npc', text: "You beat a boss? About time someone around here got something done. Fine, I'll help." }
            ],
            failure: [
                { speaker: 'npc', text: "No boss defeated yet? Shocker. Come back when you've actually accomplished something." }
            ]
        },
        austine: {
            firstTime: [
                { speaker: 'player', text: "Austine, I could use your help, if you're up for it." },
                { speaker: 'npc', text: "Theoretically, yes. Practically, I require an item first. You'll need Tyson to acquire it and deliver it to me. The specifics should be self-evident." }
            ],
            success: [
                { speaker: 'npc', text: "Tyson has delivered the required item. Therefore, I shall assist you." }
            ],
            failure: [
                { speaker: 'npc', text: "The item from Tyson has not arrived. Consequently, I remain unavailable." }
            ]
        },
        chloe: {
            firstTime: [
                { speaker: 'player', text: "Chloe, would you be willing to help me with something?" },
                { speaker: 'npc', text: "Victor, I really want to help you, I do. But my pet is lost and I'm really worried. Could you help me retrieve them? Then I'll absolutely help you with whatever you need." }
            ],
            success: [
                { speaker: 'npc', text: "You found my pet! Victor, thank you so much. Of course I'll help you now." }
            ],
            failure: [
                { speaker: 'npc', text: "I know you have your own concerns, but... I really need to find my pet first. I'm sorry." }
            ]
        },
        isabela: {
            firstTime: [
                { speaker: 'player', text: "Isabela, I need someone reliable. Can you help?" },
                { speaker: 'npc', text: "You know I've got your back, Victor. But let's get everyone connected first. Talk to all seven characters, get us all on the same page. Then we can really make things happen." }
            ],
            success: [
                { speaker: 'npc', text: "You did it! Everyone's in the loop now. Let's work together and get this done." }
            ],
            failure: [
                { speaker: 'npc', text: "You still need to talk to everyone. Go build those connections, then come back." }
            ]
        },
        nicholas: {
            firstTime: [
                { speaker: 'player', text: "Nicholas, I could use your particular set of skills." },
                { speaker: 'npc', text: "Could you now? The target game holds your answer. Win it. Or lose it. Both tell stories." }
            ],
            success: [
                { speaker: 'npc', text: "Victory in the game. How... predictable. Or was it? I'll assist you." }
            ],
            failure: [
                { speaker: 'npc', text: "The game remains unfinished. A shame. Or is it?" }
            ]
        },
        opal: {
            firstTime: [
                { speaker: 'player', text: "Opal, think you could lend me a hand?" },
                { speaker: 'npc', text: "I... I would like to, Victor. Perhaps it would be best if you spoke with Austine first? He may have important information for you." }
            ],
            success: [
                { speaker: 'npc', text: "You consulted with Austine. That's... that seems prudent. Yes, I'll help you, Victor." }
            ],
            failure: [
                { speaker: 'npc', text: "I believe speaking with Austine first would be the wise course of action." }
            ]
        },
        tyson: {
            firstTime: [
                { speaker: 'player', text: "Tyson, I need your help with something." },
                { speaker: 'npc', text: "I don't know, Victor. I'm not sure I'm ready for this. Maybe if Opal finishes her quests first? Then I'd feel better about helping." }
            ],
            success: [
                { speaker: 'npc', text: "Opal finished her quests. Okay. I guess I can help you now, Victor." }
            ],
            failure: [
                { speaker: 'npc', text: "Opal still has quests to complete. I need to wait for that first." }
            ]
        }
    },
    alexis: {
        austine: {
            firstTime: [
                { speaker: 'player', text: "Austine. I need your help. Now." },
                { speaker: 'npc', text: "How direct. However, I require an item first. Have Tyson obtain it and deliver it to me. The logical chain should be apparent." }
            ],
            success: [
                { speaker: 'npc', text: "The item has been received from Tyson. Acceptable. I shall provide assistance." }
            ],
            failure: [
                { speaker: 'npc', text: "Still awaiting the item from Tyson. Logic dictates I cannot proceed until then." }
            ]
        },
        chloe: {
            firstTime: [
                { speaker: 'player', text: "Chloe, get over here and help me." },
                { speaker: 'npc', text: "Alexis, I understand you're frustrated, but... my pet is missing. I need to find them first. If you could help with that, then yes, I'll help you." }
            ],
            success: [
                { speaker: 'npc', text: "You... you found my pet? Thank you, Alexis. I'll help you now." }
            ],
            failure: [
                { speaker: 'npc', text: "I still need to find my pet, Alexis. Please try to understand where I'm coming from." }
            ]
        },
        isabela: {
            firstTime: [
                { speaker: 'player', text: "Isabela, I need you to help me. Everyone else is useless." },
                { speaker: 'npc', text: "Alexis, you know I'll help. But you need to connect with the team first. Talk to all seven characters. Get everyone working together instead of against each other." }
            ],
            success: [
                { speaker: 'npc', text: "You talked to everyone. See? Now we can actually get things done together." }
            ],
            failure: [
                { speaker: 'npc', text: "Talk to the whole team first, Alexis. We need unity, not division." }
            ]
        },
        nicholas: {
            firstTime: [
                { speaker: 'player', text: "Nicholas. Target game. You're helping me win it." },
                { speaker: 'npc', text: "Am I? Win it yourself. Then we discuss terms. Maybe." }
            ],
            success: [
                { speaker: 'npc', text: "You won. Fascinating. I'll comply with your... request." }
            ],
            failure: [
                { speaker: 'npc', text: "No victory yet. How unfortunate for you." }
            ]
        },
        opal: {
            firstTime: [
                { speaker: 'player', text: "Opal, stop wasting time and help me already." },
                { speaker: 'npc', text: "Alexis, I... perhaps you should speak with Austine? I believe his guidance would be more suited to your needs at this moment." }
            ],
            success: [
                { speaker: 'npc', text: "You spoke with Austine. That's... I hope it was helpful. I'll do what I can to assist you, Alexis." }
            ],
            failure: [
                { speaker: 'npc', text: "I really think Austine would be better suited to help you right now. Please, just talk to him first." }
            ]
        },
        tyson: {
            firstTime: [
                { speaker: 'player', text: "Tyson. I need your help. Don't argue." },
                { speaker: 'npc', text: "I... Alexis, please. I can't. Not until Opal finishes her quests. I'm sorry." }
            ],
            success: [
                { speaker: 'npc', text: "Opal finished. Okay. I'll... I'll help you, Alexis." }
            ],
            failure: [
                { speaker: 'npc', text: "Opal hasn't finished yet. I need to wait." }
            ]
        },
        victor: {
            firstTime: [
                { speaker: 'player', text: "Victor, stop talking about art and help me." },
                { speaker: 'npc', text: "Whoa, okay, yeah. But maybe finish all the other quests first? All seven of them. It's like - actually, never mind the metaphor - just do the other quests first, okay?" }
            ],
            success: [
                { speaker: 'npc', text: "All seven quests done? Alright, yeah, I'm in. Let's go." }
            ],
            failure: [
                { speaker: 'npc', text: "Still got those other quests to finish. Take your time, no pressure." }
            ]
        }
    },
    austine: {
        alexis: {
            firstTime: [
                { speaker: 'player', text: "Alexis, I require your assistance." },
                { speaker: 'npc', text: "Oh, so the high-and-mighty Austine needs help? Beat a boss. Then we'll see if I feel like helping you." }
            ],
            success: [
                { speaker: 'npc', text: "Fine. You got your boss defeated. I'll help. Happy now?" }
            ],
            failure: [
                { speaker: 'npc', text: "No boss, no help. Simple as that." }
            ]
        },
        chloe: {
            firstTime: [
                { speaker: 'player', text: "Chloe, your assistance would be beneficial." },
                { speaker: 'npc', text: "Austine, I'd like to help, really. But my pet is missing. Once I find them, I promise I'll help you with whatever you need." }
            ],
            success: [
                { speaker: 'npc', text: "You helped me find my pet! Of course I'll help you now, Austine." }
            ],
            failure: [
                { speaker: 'npc', text: "I'm still looking for my pet. I hope you can understand my priorities here." }
            ]
        },
        isabela: {
            firstTime: [
                { speaker: 'player', text: "Isabela, I believe we could work together effectively." },
                { speaker: 'npc', text: "Absolutely, Austine. But let's get the whole team aligned first. Talk to all seven characters. Then we'll have everyone working together properly." }
            ],
            success: [
                { speaker: 'npc', text: "Everyone's connected now. Good work. Let's make this happen together." }
            ],
            failure: [
                { speaker: 'npc', text: "Keep talking to people. We need everyone in sync before we move forward." }
            ]
        },
        nicholas: {
            firstTime: [
                { speaker: 'player', text: "Nicholas, I have calculated that your skills would be useful." },
                { speaker: 'npc', text: "Calculated. How like you. The target game awaits. Win it. Prove your calculations correct." }
            ],
            success: [
                { speaker: 'npc', text: "The game is won. Your calculations were... adequate. I'll assist." }
            ],
            failure: [
                { speaker: 'npc', text: "Calculations flawed. Game unwon. Try recalculating." }
            ]
        },
        opal: {
            firstTime: [
                { speaker: 'player', text: "Opal, I need you to take action." },
                { speaker: 'npc', text: "Austine, I understand, but... wouldn't it be more logical for you to speak with yourself first? I mean—that doesn't make sense. Perhaps you should consult your own expertise?" }
            ],
            success: [
                { speaker: 'npc', text: "I... yes, I'll help you, Austine. I hope I can meet your expectations." }
            ],
            failure: [
                { speaker: 'npc', text: "I believe you already have all the tools you need, Austine." }
            ]
        },
        tyson: {
            firstTime: [
                { speaker: 'player', text: "Tyson, I require your participation." },
                { speaker: 'npc', text: "I don't think I can right now, Austine. Not until Opal completes her quests. I need to know she's ready first." }
            ],
            success: [
                { speaker: 'npc', text: "Opal finished everything. Alright. I'll help you, Austine." }
            ],
            failure: [
                { speaker: 'npc', text: "Opal still has things to complete. I have to wait for her." }
            ]
        },
        victor: {
            firstTime: [
                { speaker: 'player', text: "Victor, I need you to focus and assist me." },
                { speaker: 'npc', text: "Yeah, sure, I can do that! But maybe complete all seven of the other quests first? It's like, you know, getting all your supplies before starting a painting. Finish those, then we're good." }
            ],
            success: [
                { speaker: 'npc', text: "All seven quests complete? Nice! Yeah, I'm ready whenever you are." }
            ],
            failure: [
                { speaker: 'npc', text: "Still working on those other quests? No rush, do your thing." }
            ]
        }
    },
    chloe: {
        alexis: {
            firstTime: [
                { speaker: 'player', text: "Alexis, would you mind helping me?" },
                { speaker: 'npc', text: "Would I MIND? Yeah, actually. Beat a boss first. Show me you can handle yourself. THEN I'll consider it." }
            ],
            success: [
                { speaker: 'npc', text: "You beat a boss. Fine. I'll help. Don't make me regret this." }
            ],
            failure: [
                { speaker: 'npc', text: "Still no boss defeated. What a surprise. Come back when you've done something." }
            ]
        },
        austine: {
            firstTime: [
                { speaker: 'player', text: "Austine, could I ask for your help?" },
                { speaker: 'npc', text: "You could. However, I need an item delivered by Tyson first. Standard procedure, I'm afraid." }
            ],
            success: [
                { speaker: 'npc', text: "Tyson has provided the necessary item. Therefore, I can assist you." }
            ],
            failure: [
                { speaker: 'npc', text: "The item from Tyson is still pending. Until then, I cannot help." }
            ]
        },
        isabela: {
            firstTime: [
                { speaker: 'player', text: "Isabela, I could really use your help." },
                { speaker: 'npc', text: "Chloe, you know I'm here for you. But let's get everyone together first. Talk to all seven characters. Unite the team, then we'll accomplish great things." }
            ],
            success: [
                { speaker: 'npc', text: "You connected with everyone! Perfect. Now let's work together and make it happen." }
            ],
            failure: [
                { speaker: 'npc', text: "Keep reaching out to people. We need everyone united before we can move forward." }
            ]
        },
        nicholas: {
            firstTime: [
                { speaker: 'player', text: "Nicholas, I need your help with something." },
                { speaker: 'npc', text: "Need. Such a heavy word. The target game will determine much. Win it. If you can." }
            ],
            success: [
                { speaker: 'npc', text: "The game is won. Interesting choice. Very well, I'll provide assistance." }
            ],
            failure: [
                { speaker: 'npc', text: "The game awaits your victory. Or your defeat. Both are... educational." }
            ]
        },
        opal: {
            firstTime: [
                { speaker: 'player', text: "Opal, I hate to ask, but could you help me?" },
                { speaker: 'npc', text: "Chloe, you don't have to apologize. Perhaps... perhaps speaking with Austine first would be beneficial? I think he could provide guidance." }
            ],
            success: [
                { speaker: 'npc', text: "You spoke with Austine. I'm glad. Yes, I'll help you, Chloe. You deserve support too." }
            ],
            failure: [
                { speaker: 'npc', text: "I really think Austine could help you more than I can right now. Please consider talking to him." }
            ]
        },
        tyson: {
            firstTime: [
                { speaker: 'player', text: "Tyson, would you be willing to help me?" },
                { speaker: 'npc', text: "Chloe, I... I want to. But Opal needs to finish her quests first. I can't until she does. I'm sorry." }
            ],
            success: [
                { speaker: 'npc', text: "Opal completed her quests. Okay. I can help you now, Chloe." }
            ],
            failure: [
                { speaker: 'npc', text: "I'm still waiting for Opal to finish. Please understand." }
            ]
        },
        victor: {
            firstTime: [
                { speaker: 'player', text: "Victor, I could use your help if you have time." },
                { speaker: 'npc', text: "Yeah, definitely! But first, maybe knock out all seven of the other quests? It's like... actually, you probably don't want another art analogy. Just finish those seven quests first." }
            ],
            success: [
                { speaker: 'npc', text: "All seven done? Awesome! Yeah, let's do this." }
            ],
            failure: [
                { speaker: 'npc', text: "Still got some quests left to finish. No worries, take all the time you need." }
            ]
        }
    },
    isabela: {
        alexis: {
            firstTime: [
                { speaker: 'player', text: "Alexis, I need your strength. Will you help?" },
                { speaker: 'npc', text: "Oh, so you need my STRENGTH now? Fine. Beat a boss. Any of them. Prove you're serious." }
            ],
            success: [
                { speaker: 'npc', text: "You actually beat a boss. Alright, I'll help. Let's get this done." }
            ],
            failure: [
                { speaker: 'npc', text: "No boss defeated yet. Why am I not surprised? Come back when you mean business." }
            ]
        },
        austine: {
            firstTime: [
                { speaker: 'player', text: "Austine, I need your analytical mind on this." },
                { speaker: 'npc', text: "Logical. However, I require Tyson to deliver a specific item first. The parameters are non-negotiable." }
            ],
            success: [
                { speaker: 'npc', text: "The item has been delivered by Tyson. Satisfactory. I'll assist you now." }
            ],
            failure: [
                { speaker: 'npc', text: "Tyson has not yet delivered the item. Therefore, I remain unavailable." }
            ]
        },
        chloe: {
            firstTime: [
                { speaker: 'player', text: "Chloe, I could use your help bringing everyone together." },
                { speaker: 'npc', text: "Isabela, I want to help so much. But my pet is still missing. If you could help me find them, then I'd be free to help you with anything." }
            ],
            success: [
                { speaker: 'npc', text: "You found my pet! Isabela, thank you. Of course I'll help you now." }
            ],
            failure: [
                { speaker: 'npc', text: "I wish I could help right now, but I need to find my pet first. I'm sorry, Isabela." }
            ]
        },
        nicholas: {
            firstTime: [
                { speaker: 'player', text: "Nicholas, I know you're capable. Will you help me?" },
                { speaker: 'npc', text: "Capable? Perhaps. The target game will reveal truths. Win it. Or don't. Your choice speaks volumes." }
            ],
            success: [
                { speaker: 'npc', text: "Victory achieved. How... telling. I'll assist you, Isabela." }
            ],
            failure: [
                { speaker: 'npc', text: "The game remains. Waiting. As am I." }
            ]
        },
        opal: {
            firstTime: [
                { speaker: 'player', text: "Opal, I need your help. Can you do this?" },
                { speaker: 'npc', text: "Isabela, I... I want to help, I truly do. But perhaps Austine would be better equipped? Maybe consult with him first?" }
            ],
            success: [
                { speaker: 'npc', text: "You consulted Austine. That seems wise. Yes, I'll help you, Isabela. I'll do my best." }
            ],
            failure: [
                { speaker: 'npc', text: "I think Austine's guidance would serve you better at this stage. Please, consider speaking with him." }
            ]
        },
        tyson: {
            firstTime: [
                { speaker: 'player', text: "Tyson, I need you. Will you help me?" },
                { speaker: 'npc', text: "Isabela, I... I can't right now. Opal has to finish her quests first. I need to wait for that." }
            ],
            success: [
                { speaker: 'npc', text: "Opal finished. Okay, Isabela. I'll help you now." }
            ],
            failure: [
                { speaker: 'npc', text: "I'm still waiting on Opal to complete her quests. I hope you understand." }
            ]
        },
        victor: {
            firstTime: [
                { speaker: 'player', text: "Victor, let's work together on this." },
                { speaker: 'npc', text: "Yeah, I'm down! But, uh, finish the other seven quests first? It's like preparing a canvas before - okay, you get it. Just do those first." }
            ],
            success: [
                { speaker: 'npc', text: "Seven quests complete! Perfect. Let's make this happen." }
            ],
            failure: [
                { speaker: 'npc', text: "Still working through those other quests. No rush, right?" }
            ]
        }
    },
    nicholas: {
        alexis: {
            firstTime: [
                { speaker: 'player', text: "Alexis, I require your assistance." },
                { speaker: 'npc', text: "Oh, YOU require MY assistance? That's a first. Beat a boss. Then maybe I'll consider your request." }
            ],
            success: [
                { speaker: 'npc', text: "Boss defeated. Fine. I'll help you. But don't think this changes anything." }
            ],
            failure: [
                { speaker: 'npc', text: "No boss down yet. Typical. Get it done, then talk to me." }
            ]
        },
        austine: {
            firstTime: [
                { speaker: 'player', text: "Austine, your expertise would be... useful." },
                { speaker: 'npc', text: "Would it? I require an item from Tyson first. Deliver it, and we shall see." }
            ],
            success: [
                { speaker: 'npc', text: "Item received from Tyson. Acceptable. I'll provide assistance." }
            ],
            failure: [
                { speaker: 'npc', text: "No item from Tyson. No assistance. Logical, is it not?" }
            ]
        },
        chloe: {
            firstTime: [
                { speaker: 'player', text: "Chloe, I need you." },
                { speaker: 'npc', text: "Nicholas, I wish I could help, but my pet is lost. I need to find them first. If you help me with that, I'll definitely help you." }
            ],
            success: [
                { speaker: 'npc', text: "You found my pet! Thank you, Nicholas. I'll help you now." }
            ],
            failure: [
                { speaker: 'npc', text: "My pet is still missing. I can't focus on anything else until they're safe." }
            ]
        },
        isabela: {
            firstTime: [
                { speaker: 'player', text: "Isabela, I believe we should work together." },
                { speaker: 'npc', text: "Nicholas, I'm happy to work with you. But connect with everyone first. Talk to all seven characters. Build those relationships, then we'll get things done." }
            ],
            success: [
                { speaker: 'npc', text: "You talked to everyone! Great. Now let's accomplish this together." }
            ],
            failure: [
                { speaker: 'npc', text: "Keep connecting with people. We need the full team engaged." }
            ]
        },
        opal: {
            firstTime: [
                { speaker: 'player', text: "Opal, I need your capabilities." },
                { speaker: 'npc', text: "Nicholas, I... perhaps Austine would be more suitable for this? I think his approach might be more aligned with what you need." }
            ],
            success: [
                { speaker: 'npc', text: "You spoke with Austine. That seems... prudent. Yes, I'll help you, Nicholas." }
            ],
            failure: [
                { speaker: 'npc', text: "I believe Austine's counsel would be more valuable to you right now." }
            ]
        },
        tyson: {
            firstTime: [
                { speaker: 'player', text: "Tyson, I need you to help me." },
                { speaker: 'npc', text: "I can't help you yet, Nicholas. Not until Opal finishes her quests. I'm sorry." }
            ],
            success: [
                { speaker: 'npc', text: "Opal's done with her quests. Alright. I'll help you, Nicholas." }
            ],
            failure: [
                { speaker: 'npc', text: "Opal still needs to complete her quests. I have to wait." }
            ]
        },
        victor: {
            firstTime: [
                { speaker: 'player', text: "Victor, your help would be... advantageous." },
                { speaker: 'npc', text: "Advantageous, huh? Yeah, sure. But finish all seven of the other quests first. It's like - you know what, never mind. Just do the quests." }
            ],
            success: [
                { speaker: 'npc', text: "All seven quests finished? Cool. Let's do this thing." }
            ],
            failure: [
                { speaker: 'npc', text: "Other quests still need finishing. Take your time, no pressure." }
            ]
        }
    }
};

// Dialogue management class
