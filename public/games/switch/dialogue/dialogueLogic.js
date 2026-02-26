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
class DialogueManager {
    constructor(gameState, npcs = null, game = null) {
        this.gameState = gameState;
        this.npcs = npcs || (typeof NPCS !== 'undefined' ? NPCS : []);

        if (game) {
            this.game = game;
            this.healCharacter = (charId) => game.combatSystem?.healCharacter(charId);
            this.switchToCharacter = (charId) => game.switchToCharacter?.(charId);
            this.hideDialogue = () => {
                if (game.dialogueBox) game.dialogueBox.style.display = 'none';
                game.showingDialogue = false;
            };
        } else {
            this.healCharacter = () => {};
            this.switchToCharacter = () => {};
            this.hideDialogue = () => {};
        }

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

            this.healCharacter(currentChar.id);
        }

        this.currentLineIndex = 0;
        this.isActive = true;
        this.isSwitchDialogue = false;
    }

    // Show minigame result dialogue for Nicholas
    showMinigameResultDialogue(npcId, success) {
        let npc = this.npcs.find(n => n.id === npcId);
        if (!npc && typeof CHARACTERS !== 'undefined' && CHARACTERS[npcId]) {
            const c = CHARACTERS[npcId];
            npc = {
                id: c.id,
                name: c.name,
                color: c.color,
                position: c.position || { x: 0, y: 0 }
            };
        }

        if (!npc) {
            console.error(`No NPC found with id: ${npcId}`);
            return false;
        }

        const resultType = success ? 'success' : 'failure';
        const dialogue = SPECIAL_DIALOGUES?.nicholasMinigame?.[resultType];

        if (!dialogue) {
            console.error(`No minigame dialogue found for ${npcId} - ${resultType}`);
            return false;
        }

        this.currentNPC = npc;
        this.currentDialogue = normalizeDialogue(dialogue);
        this.currentLineIndex = 0;
        this.isActive = true;
        this.isSwitchDialogue = false;

        if (success) {
            this.pendingSwitch = npcId;
        }

        setTimeout(() => {
            if (this.isActive && this.currentDialogue) {
                this.completeDialogue();
                this.hideDialogue();
            }
        }, 3000);

        return true;
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
        this.switchToCharacter(targetNpcId);
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
