const SPECIAL_DIALOGUES = {
    healing: {
        chloe: [
            { speaker: 'player', text: "Chloe, I could use some healing." },
            { speaker: 'npc', text: "*Chloe's gentle energy washes over you*" },
            { speaker: 'npc', text: "There. You should feel better now." },
            { speaker: 'player', text: "Thanks, Chloe. That really helped." }
        ]
    },
    weaponSteal: {
        alexis: [
            { speaker: 'player', text: "I'm taking your weapon, thanks." },
            { speaker: 'npc', text: "Hey! That's mine!" }
        ]
    },
    nicholasMinigame: {
        success: [
            { speaker: 'npc', text: "Impressive shooting! I didn't expect you to hit all of those. You've proven yourself worthy." }
        ],
        failure: [
            { speaker: 'npc', text: "Not bad, but you'll need to get good if you want to unlock my potential. Try again!" }
        ]
    }
};
