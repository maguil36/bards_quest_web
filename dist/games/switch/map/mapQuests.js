import { CHARACTER_QUESTS } from './mapQuestData.js';

let hasLoggedOnce = false;

export class MapQuests {
    constructor(config) {
        if (config.game) {
            this.gameState = config.game.gameState;
        } else {
            this.gameState = config.gameState;
        }
    }

    getCurrentQuestStep(characterId) {
        if (!this.gameState.questProgress) {
            this.gameState.questProgress = {};
        }

        if (!this.gameState.questProgress[characterId]) {
            this.gameState.questProgress[characterId] = {
                currentStep: 0,
                completed: false
            };
        }

        const progress = this.gameState.questProgress[characterId];

        if (typeof progress.currentStep !== 'number') {
            progress.currentStep = 0;
        }

        if (typeof progress.completed !== 'boolean') {
            progress.completed = false;
        }

        return progress;
    }

    getActiveQuestStep(characterId) {
        const questData = CHARACTER_QUESTS[characterId];
        if (!questData) return null;

        const progress = this.getCurrentQuestStep(characterId);
        if (progress.completed) return null;

        return questData.steps[progress.currentStep] || null;
    }

    checkQuestStepCondition(step, characterId = null) {
        const currentChar = characterId || this.gameState.currentCharacter;

        if (step.characterRequired && step.characterRequired !== currentChar) {
            return { met: false, reason: `Must be playing as ${step.characterRequired}` };
        }

        switch (step.checkType) {
            case 'interaction':
                return this.checkInteraction(step.checkData, currentChar);

            case 'dialogue':
                return this.checkDialogue(step.checkData, currentChar);

            case 'item':
                return this.checkItem(step.checkData, currentChar);

            case 'give_item':
                return this.checkGiveItem(step.checkData, currentChar);

            case 'talk_to_all':
                return this.checkTalkToAll(step.checkData, currentChar);

            case 'defeat_boss':
                return this.checkDefeatBoss(step.checkData, currentChar);

            case 'collect_weapons':
                return this.checkCollectWeapons(step.checkData, currentChar);

            case 'minigame':
                return this.checkMinigame(step.checkData, currentChar);

            case 'quest_complete':
                return this.checkQuestComplete(step.checkData, currentChar);

            case 'enter_boss_combat':
                return this.checkEnterBossCombat(step.checkData, currentChar);

            case 'level':
                return this.checkLevel(step.checkData, currentChar);

            case 'defeat_enemy':
                return this.checkDefeatEnemy(step.checkData, currentChar);

            case 'fraymotifs':
                return this.checkFragmotifs(step.checkData, currentChar);

            case 'interaction_count':
                return this.checkInteractionCount(step.checkData, currentChar);

            case 'character_switch':
                return this.checkCharacterSwitch(step.checkData, currentChar);

            case 'all_quests_complete':
                return this.checkAllQuestsComplete(step.checkData);

            case 'location':
                return this.checkLocation(step.checkData, currentChar);

            case 'weapon_upgrade':
                return this.checkWeaponUpgrade(step.checkData, currentChar);

            default:
                return { met: false, reason: 'Unknown check type' };
        }
    }

    checkInteraction(data, character) {
        if (!this.gameState.interactions) this.gameState.interactions = {};
        const talked = this.gameState.interactions[data.character] > 0;
        return { met: talked, reason: talked ? '' : `Talk to ${data.character}` };
    }

    checkDialogue(data, character) {
        if (!this.gameState.dialogues) this.gameState.dialogues = {};
        const dialogueKey = `${data.character}_${data.dialogueKey}`;
        const completed = this.gameState.dialogues[dialogueKey] === true;
        return { met: completed, reason: completed ? '' : `Complete dialogue with ${data.character}` };
    }

    checkItem(data, character) {
        if (!this.gameState.inventory) this.gameState.inventory = {};
        if (!this.gameState.inventory[character]) this.gameState.inventory[character] = [];
        const hasItem = this.gameState.inventory[character].includes(data.item);
        return { met: hasItem, reason: hasItem ? '' : `Collect ${data.item}` };
    }

    checkGiveItem(data, character) {
        if (!this.gameState.itemsGiven) this.gameState.itemsGiven = {};
        const key = `${character}_${data.item}_${data.recipient}`;
        const given = this.gameState.itemsGiven[key] === true;
        return { met: given, reason: given ? '' : `Give ${data.item} to ${data.recipient}` };
    }

    checkTalkToAll(data, character) {
        if (!this.gameState.interactions) this.gameState.interactions = {};
        const talked = Object.keys(this.gameState.interactions).filter(id =>
            this.gameState.interactions[id] > 0 && id !== character
        ).length;
        const met = talked >= data.count;
        return { met, reason: met ? '' : `Talk to ${talked}/${data.count} characters` };
    }

    checkDefeatBoss(data, character) {
        if (!this.gameState.bossesDefeated) this.gameState.bossesDefeated = {};
        const defeated = data.bosses.filter(boss =>
            this.gameState.bossesDefeated[boss] === true
        ).length;
        const met = defeated >= data.count;
        return { met, reason: met ? '' : `Defeat ${defeated}/${data.count} bosses` };
    }

    checkCollectWeapons(data, character) {
        if (!this.gameState.weaponsCollected) this.gameState.weaponsCollected = {};
        if (!this.gameState.weaponsCollected[character]) this.gameState.weaponsCollected[character] = [];
        const collected = this.gameState.weaponsCollected[character].length;
        const met = collected >= data.count;
        return { met, reason: met ? '' : `Collect ${collected}/${data.count} weapons` };
    }

    checkMinigame(data, character) {
        if (!this.gameState.miniGameScores) this.gameState.miniGameScores = {};
        const score = this.gameState.miniGameScores.nicholas || 0;
        const met = score >= data.score;
        return { met, reason: met ? '' : `Win minigame (score ${score}/${data.score})` };
    }

    checkQuestComplete(data, character) {
        const progress = this.getCurrentQuestStep(data.quest);
        const met = progress.completed === true;
        return { met, reason: met ? '' : `Complete ${data.quest}'s quest` };
    }

    checkEnterBossCombat(data, character) {
        if (!this.gameState.bossesEntered) this.gameState.bossesEntered = {};
        const entered = data.bosses.some(boss =>
            this.gameState.bossesEntered[boss] === true
        );
        return { met: entered, reason: entered ? '' : `Enter combat with a boss` };
    }

    checkLevel(data, character) {
        if (!this.gameState.characterLevels) this.gameState.characterLevels = {};
        const level = this.gameState.characterLevels[character] || 1;
        const met = level >= data.level;
        return { met, reason: met ? '' : `Reach level ${data.level} (current: ${level})` };
    }

    checkDefeatEnemy(data, character) {
        if (!this.gameState.enemiesDefeatedBy) this.gameState.enemiesDefeatedBy = {};
        const defeated = this.gameState.enemiesDefeatedBy[character] || 0;
        const met = defeated >= data.count;
        return { met, reason: met ? '' : `Defeat ${defeated}/${data.count} enemies` };
    }

    checkFragmotifs(data, character) {
        if (!this.gameState.fraymotifsUsed) this.gameState.fraymotifsUsed = {};
        if (!this.gameState.fraymotifsUsed[character]) this.gameState.fraymotifsUsed[character] = new Set();
        const used = this.gameState.fraymotifsUsed[character].size;
        const met = used >= data.count;
        return { met, reason: met ? '' : `Use ${used}/${data.count} fraymotifs` };
    }

    checkInteractionCount(data, character) {
        if (!this.gameState.interactions) this.gameState.interactions = {};
        const count = this.gameState.interactions[data.character] || 0;
        const met = count >= data.count;
        return { met, reason: met ? '' : `Talk to ${data.character} ${count}/${data.count} times` };
    }

    checkCharacterSwitch(data, character) {
        if (!this.gameState.characterSwitches) this.gameState.characterSwitches = {};
        if (data.character) {
            const switched = this.gameState.characterSwitches[data.character] === true;
            return { met: switched, reason: switched ? '' : `Switch to ${data.character}` };
        } else {
            if (!this.gameState.characterSwitches[character]) this.gameState.characterSwitches[character] = 0;
            const switched = this.gameState.characterSwitches[character] > 0;
            return { met: switched, reason: switched ? '' : `Switch to another character` };
        }
    }

    checkAllQuestsComplete(data) {
        const characters = ['austine', 'isabela', 'alexis', 'nicholas', 'tyson', 'chloe', 'opal'];
        const completed = characters.filter(char => {
            const progress = this.getCurrentQuestStep(char);
            return progress.completed === true;
        }).length;
        const met = completed >= data.count;
        return { met, reason: met ? '' : `Complete ${completed}/${data.count} quests` };
    }

    checkLocation(data, character) {
        if (!this.gameState.visitedLocations) this.gameState.visitedLocations = {};
        const visited = this.gameState.visitedLocations[data.location] === true;
        return { met: visited, reason: visited ? '' : `Visit ${data.location}` };
    }

    checkWeaponUpgrade(data, character) {
        if (!this.gameState.weaponUpgrades) this.gameState.weaponUpgrades = {};
        const upgraded = this.gameState.weaponUpgrades[character] === true;
        return { met: upgraded, reason: upgraded ? '' : `Upgrade weapon` };
    }

    completeQuestStep(characterId) {
        const progress = this.getCurrentQuestStep(characterId);
        const questData = CHARACTER_QUESTS[characterId];

        if (!questData || progress.completed) return { success: false };

        const currentStep = questData.steps[progress.currentStep];
        if (!currentStep) return { success: false };

        const check = this.checkQuestStepCondition(currentStep, characterId);
        if (!check.met) return { success: false, reason: check.reason };

        if (currentStep.unlockPlayable) {
            if (!this.gameState.unlockedCharacters) {
                this.gameState.unlockedCharacters = new Set(['opal']);
            }
            this.gameState.unlockedCharacters.add(currentStep.unlockPlayable);
        }

        progress.currentStep++;

        if (progress.currentStep >= questData.steps.length || currentStep.completes) {
            progress.completed = true;
        }

        return { success: true, step: currentStep, completed: progress.completed };
    }

    getQuestProgressText(characterId) {
        const questData = CHARACTER_QUESTS[characterId];

        if (!questData) {
            console.warn('[MapQuests] No quest data found for character:', characterId);
            return { description: 'No active quest', progress: 'Progress: -' };
        }

        const progress = this.getCurrentQuestStep(characterId);

        if (progress.completed) {
            return {
                description: questData.name,
                progress: '<div style="color: var(--accent);">✓ Quest Complete!</div>'
            };
        }

        const currentStep = questData.steps[progress.currentStep];

        if (!currentStep) {
            console.error('[MapQuests] No current step found at index:', progress.currentStep);
            return { description: 'Quest error', progress: 'No current step' };
        }

        const check = this.checkQuestStepCondition(currentStep, characterId);
        const statusIcon = check.met ? '✓' : '✗';

        const characterTag = currentStep.characterRequired ? ` [${currentStep.characterRequired}]` : ' [any]';
        const unlockTag = currentStep.unlockPlayable ? ' 🔓' : '';

        const progressHTML = `<div style="margin-bottom: 4px;"><strong>Step ${progress.currentStep + 1}/${questData.steps.length}:</strong> ${currentStep.name}${characterTag}${unlockTag} <span style="color: ${check.met ? 'var(--success)' : 'var(--error)'};">${statusIcon}</span></div>
                              <div style="font-size: 0.9em; color: #aaa; margin-bottom: 6px;">${currentStep.description}</div>
                              ${!check.met && check.reason ? `<div style="font-size: 0.85em; color: var(--warning); font-style: italic;">${check.reason}</div>` : ''}`;

        return { description: questData.name, progress: progressHTML };
    }

    updateQuestUI() {
        if (!hasLoggedOnce) {
            hasLoggedOnce = true;
            console.log('=== QUEST UI DEBUG (ONE TIME ONLY) ===');
            console.log('currentCharacter:', this.gameState.currentCharacter);
            console.log('questProgress:', this.gameState.questProgress);
            console.log('CHARACTER_QUESTS keys:', Object.keys(CHARACTER_QUESTS));
            const questInfo = this.getQuestProgressText(this.gameState.currentCharacter);
            console.log('questInfo result:', questInfo);
            console.log('=== END DEBUG ===');
        }

        const questDesc = document.getElementById('questDescription');
        const questProg = document.getElementById('questProgress');

        if (!questDesc || !questProg) return;

        const currentChar = this.gameState.currentCharacter;
        const questInfo = this.getQuestProgressText(currentChar);

        questDesc.innerHTML = `<div>${questInfo.description}</div>`;
        questProg.innerHTML = questInfo.progress;
    }
}