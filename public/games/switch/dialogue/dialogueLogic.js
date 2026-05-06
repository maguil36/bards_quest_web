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
        this.switchTargetNpc = null;

        this.textCrawlEnabled = true;
        this.charactersPerSecond = 40;
        this.currentTextProgress = 0;
        this.fullText = '';
        this.isTextComplete = false;
        this.delayTextCrawlStart = false;
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

        if (!this.delayTextCrawlStart) {
            this.startTextCrawl();
        }

        return true;
    }

    // Start an encounter dialogue with an enemy
    startEncounterDialogue(enemyType) {
        const encounterDialogue = typeof AGENT_ENCOUNTER_DIALOGUES !== 'undefined'
            ? AGENT_ENCOUNTER_DIALOGUES.spotted
            : [
                { speaker: 'npc', text: "A Derse Agent blocks your path!" },
                { speaker: 'npc', text: "Prepare for battle!" }
            ];

        const npc = {
            id: enemyType,
            name: 'Derse Agent',
            color: '#000000',
            position: { x: 0, y: 0 }
        };

        this.currentNPC = npc;
        this.currentDialogue = normalizeDialogue(encounterDialogue);
        this.currentLineIndex = 0;
        this.isActive = true;
        this.isEncounterDialogue = true;
        this.startTextCrawl();

        return true;
    }

    // Get the current dialogue line
    getCurrentLine() {
        if (!this.isActive || !this.currentDialogue) return null;
        const line = this.currentDialogue[this.currentLineIndex];
        if (typeof line === 'string') {
            return { speaker: 'npc', text: line };
        }
        return line;
    }

    // Start text crawl for current dialogue line
    startTextCrawl() {
        this.currentTextProgress = 0;
        this.isTextComplete = false;
        const currentLine = this.getCurrentLine();
        this.fullText = currentLine ? currentLine.text : '';
        // console.log('[DialogueManager] Starting text crawl:', {
        //     fullText: this.fullText,
        //     length: this.fullText.length,
        //     charactersPerSecond: this.charactersPerSecond,
        //     textCrawlEnabled: this.textCrawlEnabled
        // });
    }

    // Update text crawl progress based on delta time
    updateTextCrawl(deltaTime) {
        if (this.isTextComplete || !this.textCrawlEnabled) {
            return;
        }

        const cappedDeltaTime = Math.min(deltaTime, 100);
        // console.log('[DialogueManager] updateTextCrawl called:', {
        //     deltaTime,
        //     cappedDeltaTime,
        //     currentProgress: this.currentTextProgress,
        //     charactersPerSecond: this.charactersPerSecond
        // });

        this.currentTextProgress += this.charactersPerSecond * (cappedDeltaTime / 1000);

        if (this.currentTextProgress >= this.fullText.length) {
            this.currentTextProgress = this.fullText.length;
            this.isTextComplete = true;
            // console.log('[DialogueManager] Text crawl complete');
        }
    }

    // Get the currently visible text for text crawl
    getVisibleText() {
        if (!this.textCrawlEnabled || this.isTextComplete) {
            return this.fullText;
        }
        const visibleLength = Math.floor(this.currentTextProgress);
        // console.log('[DialogueManager] Visible text:', {
        //     progress: this.currentTextProgress,
        //     visibleLength: visibleLength,
        //     fullLength: this.fullText.length
        // });
        return this.fullText.substring(0, visibleLength);
    }

    // Complete text crawl instantly
    completeTextInstantly() {
        this.currentTextProgress = this.fullText.length;
        this.isTextComplete = true;
    }

    // Advance to the next line
    nextLine() {
        if (!this.isActive || !this.currentDialogue) return false;

        if (!this.isTextComplete && this.textCrawlEnabled) {
            this.completeTextInstantly();
            return true;
        }

        this.currentLineIndex++;
        if (this.currentLineIndex >= this.currentDialogue.length) {
            return this.completeDialogue();
        }
        this.startTextCrawl();
        return true;
    }

    // Complete the current dialogue
    completeDialogue() {
        if (this.isSwitchDialogue && this.switchTargetNpc && this.game && this.game.questLogic) {
            const progress = this.game.questLogic.getCurrentQuestStep(this.switchTargetNpc);

            if (progress.currentStep === 1) {
                this.game.questLogic.completeQuestStep(this.switchTargetNpc);

                if (this.game.updateQuestUI) {
                    this.game.updateQuestUI();
                }
            }

            if (!this.gameState.dialogues) {
                this.gameState.dialogues = {};
            }
            const dialogueKey = `${this.switchTargetNpc}_ask_switch`;
            this.gameState.dialogues[dialogueKey] = true;
            this.gameState.save();

            const targetNpc = this.switchTargetNpc;
            this.switchTargetNpc = null;

            if (this.pendingSwitch) {
                const isNicholas = this.pendingSwitch === 'nicholas';
                const nicholasUnlocked = this.gameState.unlockedCharacters.has('nicholas');

                if (!isNicholas || nicholasUnlocked) {
                    this.performSwitch(this.pendingSwitch);
                }
                this.pendingSwitch = null;
            }

            this.currentDialogue = null;
            this.currentLineIndex = 0;
            this.isActive = false;
            this.currentNPC = null;
            this.isSwitchDialogue = false;
            this.isEncounterDialogue = false;
            this.pendingSwitch = null;

            return null;
        }

        if (this.currentNPC && !this.isSwitchDialogue && !this.isEncounterDialogue) {
            const currentCharacter = this.gameState.getCurrentCharacter();
            this.gameState.completeDialogue(currentCharacter.id, this.currentNPC.id);

            this.checkAndCompleteQuests(currentCharacter.id, this.currentNPC.id);

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
            this.isEncounterDialogue = false;
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
        this.isEncounterDialogue = false;

        return null;
    }

    // Check and complete relevant quests after dialogue
    checkAndCompleteQuests(characterId, npcId) {
        if (!this.game || !this.game.questLogic) return;

        const npcIdNormalized = npcId === 'isabela' ? 'isabela' : npcId;

        if (!this.gameState.interactions) {
            this.gameState.interactions = {};
        }
        if (!this.gameState.interactions[npcIdNormalized]) {
            this.gameState.interactions[npcIdNormalized] = 0;
        }
        this.gameState.interactions[npcIdNormalized]++;

        if (!this.gameState.dialogues) {
            this.gameState.dialogues = {};
        }

        const dialogueKey = `${npcIdNormalized}_ask_switch`;
        if (this.isSwitchDialogue) {
            this.gameState.dialogues[dialogueKey] = true;
        }

        if (characterId === 'tyson' && npcIdNormalized === 'austine') {
            if (!this.gameState.itemsGiven) this.gameState.itemsGiven = {};
            this.gameState.itemsGiven['tyson_necessary_item_austine'] = true;
        }

        if (characterId === 'nicholas' && npcIdNormalized === 'austine') {
            if (!this.gameState.itemsGiven) this.gameState.itemsGiven = {};
            this.gameState.itemsGiven['nicholas_guidebook_austine'] = true;
        }

        this.game.questLogic.autoCompleteHistoricalActions('austine');
        this.game.questLogic.autoCompleteHistoricalActions('isabela');
        this.game.questLogic.autoCompleteHistoricalActions('alexis');
        this.game.questLogic.autoCompleteHistoricalActions('nicholas');
        this.game.questLogic.autoCompleteHistoricalActions('tyson');
        this.game.questLogic.autoCompleteHistoricalActions('chloe');
        this.game.questLogic.autoCompleteHistoricalActions('opal');
        this.game.questLogic.autoCompleteHistoricalActions('victor');

        if (this.game.mapQuests) {
            this.game.mapQuests.updateQuestUI();
        }
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
        this.startTextCrawl();
    }

    showMiniGameChallengeDialogue() {
        this.currentDialogue = [
            { speaker: 'player', text: "Hey Nicholas, I've been watching you with that bow. Think you can beat me?" },
            { speaker: 'npc', text: "A shooting contest? Oh, you're on. I've been practicing my whole life for this." },
            { speaker: 'player', text: "Let's see what you've got then." },
            { speaker: 'npc', text: "*Nicholas grins and nocks an arrow*" },
            { speaker: 'npc', text: "May the best shot win." }
        ];
        this.currentLineIndex = 0;
        this.isActive = true;
        this.pendingMiniGame = 'nicholas';
        this.startTextCrawl();
    }

    showStealWeaponDialogue() {
        const npcId = this.currentNPC.id;
        const npcName = this.currentNPC.name || npcId;

        if (!this.gameState.stolenWeapons) {
            this.gameState.stolenWeapons = { stolen: [], available: ['austine', 'chloe', 'nicholas', 'opal', 'tyson', 'isabela'] };
        }

        const weaponNames = {
            austine: 'Austine\'s Tactical Rifle',
            chloe: 'Chloe\'s Healing Staff',
            nicholas: 'Nicholas\'s Sniper Bow',
            opal: 'Opal\'s Mystical Wand',
            tyson: 'Tyson\'s Battle Hammer',
            isabela: 'Isabela\'s Forged Blade',
            victor: 'Victor\'s Ceremonial Blade'
        };

        const weaponName = weaponNames[npcId] || 'their weapon';

        if (npcId === 'victor') {
            this.currentDialogue = [
                { speaker: 'player', text: `Hey ${npcName}, mind if I borrow that weapon?` },
                { speaker: 'npc', text: 'Oh, you want this old thing?' },
                { speaker: 'npc', text: '*Victor pulls out a ceremonial blade covered in strange stains*' },
                { speaker: 'npc', text: 'I\'ve had it for centuries. It\'s seen... things.' },
                { speaker: 'player', text: '...' },
                { speaker: 'player', text: 'You know what, I\'m good. I think I have enough weapons.' },
                { speaker: 'player', text: '(That thing looks cursed. I\'m not touching it.)' }
            ];
            this.currentLineIndex = 0;
            this.isActive = true;
            this.isSwitchDialogue = false;
            this.startTextCrawl();
            return;
        }

        if (npcId === 'isabela') {
            const isabelaProgress = this.gameState.questProgress?.isabela;
            const isabelaQuestComplete = isabelaProgress?.completed === true;

            if (isabelaQuestComplete) {
                this.gameState.stolenWeapons.stolen.push(npcId);
                if (!this.gameState.weaponsCollected) {
                    this.gameState.weaponsCollected = {};
                }
                if (!this.gameState.weaponsCollected['alexis']) {
                    this.gameState.weaponsCollected['alexis'] = [];
                }
                this.gameState.weaponsCollected['alexis'].push(npcId);
                this.gameState.save();

                const stolenCount = this.gameState.stolenWeapons.stolen.length;

                this.currentDialogue = [
                    { speaker: 'player', text: `Hey ${npcName}, mind if I borrow that weapon?` },
                    { speaker: 'npc', text: 'Wait, what are you doing?' },
                    { speaker: 'player', text: '*Swiftly takes the weapon*' },
                    { speaker: 'player', text: `Got it! ${weaponName} acquired.` },
                    { speaker: 'npc', text: 'Alexis! Give that back!' },
                    { speaker: 'player', text: `Don't worry, you already upgraded. This is just your leftover weapon. (${stolenCount}/6 weapons collected)` }
                ];
            } else {
                this.currentDialogue = [
                    { speaker: 'player', text: `Hey ${npcName}, mind if I borrow that weapon?` },
                    { speaker: 'player', text: '...' },
                    { speaker: 'player', text: '(Actually, no. She\'s my friend and she gets things done.)' },
                    { speaker: 'player', text: '(I\'ll come back for her leftover weapons after she upgrades.)' }
                ];
            }
            this.currentLineIndex = 0;
            this.isActive = true;
            this.isSwitchDialogue = false;
            this.startTextCrawl();
            return;
        }

        this.gameState.stolenWeapons.stolen.push(npcId);

        if (!this.gameState.weaponsCollected) {
            this.gameState.weaponsCollected = {};
        }
        if (!this.gameState.weaponsCollected['alexis']) {
            this.gameState.weaponsCollected['alexis'] = [];
        }
        this.gameState.weaponsCollected['alexis'].push(npcId);

        this.gameState.save();

        const stolenCount = this.gameState.stolenWeapons.stolen.length;

        this.currentDialogue = [
            { speaker: 'player', text: `Hey ${npcName}, mind if I borrow that weapon?` },
            { speaker: 'npc', text: 'Wait, what are you doing?' },
            { speaker: 'player', text: '*Swiftly takes the weapon*' },
            { speaker: 'player', text: `Got it! ${weaponName} acquired.` },
            { speaker: 'npc', text: 'Alexis! Give that back!' },
            { speaker: 'player', text: `Finders keepers. I'll put it to good use. (${stolenCount}/6 weapons collected)` }
        ];

        this.currentLineIndex = 0;
        this.isActive = true;
        this.isSwitchDialogue = false;
        this.startTextCrawl();

        if (this.game && this.game.questLogic) {
            this.game.questLogic.autoCompleteHistoricalActions('alexis');

            if (this.game.updateQuestUI) {
                this.game.updateQuestUI();
            }
        }
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
        this.startTextCrawl();

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

        if (npcId === 'nicholas') {
            const hasAskedSwitch = this.gameState.dialogues && this.gameState.dialogues['nicholas_ask_switch'];
            this.menuOptions.splice(2, 0, {
                id: 'minigame',
                label: hasAskedSwitch ? 'Challenge to mini-game' : '(Challenge to mini-game)',
                enabled: hasAskedSwitch
            });
        }

        if (currentCharacter.id === 'alexis' && npcId !== 'alexis') {
            const stolenWeapons = this.gameState.stolenWeapons || { stolen: [], available: ['austine', 'chloe', 'nicholas', 'opal', 'tyson', 'isabela'] };
            const alreadyStolen = stolenWeapons.stolen.includes(npcId);
            const isIsabela = npcId === 'isabela';
            const isabelaQuestComplete = this.gameState.completedQuests && this.gameState.completedQuests.has('upgrade_weapon');

            let stealEnabled = !alreadyStolen;
            if (isIsabela && !isabelaQuestComplete) {
                stealEnabled = false;
            }

            this.menuOptions.splice(2, 0, {
                id: 'steal',
                label: alreadyStolen ? 'Already stolen weapon' : (isIsabela && !isabelaQuestComplete ? 'Wait for Isabela\'s quest' : 'Steal their weapon'),
                enabled: stealEnabled
            });
        }

        if (npcId === 'pet') {
            const petGivenToChloe = this.gameState.petGivenToChloe || false;

            if (petGivenToChloe) {
                this.showingMenu = false;
                this.isActive = false;
                return false;
            }

            const petFollowing = this.gameState.petFollowing || false;

            this.menuOptions = [
                { id: 'follow', label: petFollowing ? '(Follow me)' : 'Follow me', enabled: !petFollowing },
                { id: 'stay', label: petFollowing ? 'Stay here' : '(Stay here)', enabled: petFollowing },
                { id: 'cancel', label: 'Stop talking to them', enabled: true }
            ];
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
        } else if (optionId === 'minigame') {
            this.showMiniGameChallengeDialogue();
            return true;
        } else if (optionId === 'steal') {
            this.showStealWeaponDialogue();
            return true;
        } else if (optionId === 'follow') {
            this.setPetFollowing(true);
            return false;
        } else if (optionId === 'stay') {
            this.setPetFollowing(false);
            return false;
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

        if (!currentCharacter) {
            console.warn('startSwitchDialogue: currentCharacter is null or undefined');
            return false;
        }

        const switchKey = `${currentCharacter.id}->${targetNpcId}`;
        const hasShownFirst = this.switchDialogueShown[switchKey];

        const switchData = SWITCH_DIALOGUES[currentCharacter.id]?.[targetNpcId];

        if (!switchData) {
            const canSwitch = this.gameState.canSwitchToCharacter(targetNpcId);
            if (canSwitch) {
                this.performSwitch(targetNpcId);
                return false;
            } else {
                const targetChar = CHARACTERS[targetNpcId];
                const unlockCriteria = targetChar?.quest?.unlockCriteria;
                let failureMessage = "You can't switch to this character yet.";

                switch(unlockCriteria) {
                    case 'defeat1Boss':
                        failureMessage = "I need you to prove yourself in combat first. Defeat one of the named bosses: DD, SS, HB, or CD.";
                        break;
                    case 'defeat3Agents':
                        failureMessage = "I need you to prove yourself in combat first. Defeat at least 3 agents.";
                        break;
                    case 'findPuzzlePiece':
                        failureMessage = "Find the puzzle piece first, then we can switch.";
                        break;
                    case 'bringLostAnimal':
                        failureMessage = "Bring me the lost animal, and then we can switch.";
                        break;
                    case 'talkToAll':
                        failureMessage = "Talk to everyone first, then come back to me.";
                        break;
                    case 'beatMiniGame':
                        failureMessage = "Let me test your aim first.";
                        if (targetNpcId === 'nicholas') {
                            this.showingMenu = false;
                            this.currentDialogue = normalizeDialogue([
                                { speaker: 'npc', text: "Hold on. Before we switch, I need to know you can handle my abilities. Let me test your aim." }
                            ]);
                            this.currentLineIndex = 0;
                            this.isActive = true;
                            this.pendingMiniGame = targetNpcId;
                            this.startTextCrawl();
                            return true;
                        }
                        break;
                    case 'beOpalCompleted':
                        failureMessage = "Complete Opal's quest first.";
                        break;
                    case 'playedAllCharacters':
                        failureMessage = "Experience all perspectives first, then come back.";
                        break;
                }

                this.showingMenu = false;
                this.currentDialogue = normalizeDialogue([
                    { speaker: 'npc', text: failureMessage }
                ]);
                this.currentLineIndex = 0;
                this.isActive = true;
                this.startTextCrawl();
                return true;
            }
        }

        let dialogueToShow;

        if (!hasShownFirst) {
            dialogueToShow = switchData.firstTime;
            this.switchDialogueShown[switchKey] = true;
        } else {
            const criteriaMetNow = this.gameState.canSwitchToCharacter(targetNpcId);

            const targetChar = typeof CHARACTERS !== 'undefined' ? CHARACTERS[targetNpcId] : null;
            const unlockCriteria = targetChar?.quest?.unlockCriteria;
            if (!criteriaMetNow && unlockCriteria === 'beatMiniGame' && switchData.preMinigame) {
                dialogueToShow = switchData.preMinigame;
                this.pendingMiniGame = targetNpcId;
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
        this.switchTargetNpc = targetNpcId;
        this.startTextCrawl();

        return true;
    }

    performSwitch(targetNpcId) {
        this.switchToCharacter(targetNpcId);
    }

    setPetFollowing(following) {
        this.gameState.petFollowing = following;
        this.gameState.save();
        this.showingMenu = false;
        this.isActive = false;
    }

    handleMiniGameComplete(success, targetNpcId) {
        this.requiresMiniGame = false;
        const currentCharacter = this.gameState.getCurrentCharacter();

        if (!currentCharacter) {
            console.warn('handleMiniGameComplete: currentCharacter is null or undefined');
            return false;
        }

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
        this.switchTargetNpc = targetNpcId;
        this.pendingSwitch = success ? targetNpcId : null;
        this.startTextCrawl();

        return true;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DIALOGUES, DialogueManager };
}
