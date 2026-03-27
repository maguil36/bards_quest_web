import { CHARACTER_QUESTS } from './mapQuestData.js';

export class MapQuestLogic {
  constructor(gameState) {
    this.gameState = gameState;
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

  completeQuestStep(characterId) {
    const progress = this.getCurrentQuestStep(characterId);
    const questData = CHARACTER_QUESTS[characterId];

    if (!questData || progress.completed) {
      return { success: false, reason: 'Quest already completed or not found' };
    }

    const currentStep = questData.steps[progress.currentStep];
    if (!currentStep) {
      return { success: false, reason: 'No current step' };
    }

    if (currentStep.unlockPlayable) {
      this.unlockCharacter(currentStep.unlockPlayable);
    }

    progress.currentStep++;

    if (progress.currentStep >= questData.steps.length || currentStep.completes) {
      progress.completed = true;
    }

    this.autoCompleteHistoricalActions(characterId);

    return { success: true, step: currentStep, completed: progress.completed };
  }

  unlockCharacter(characterId) {
    if (!this.gameState.unlockedCharacters) {
      this.gameState.unlockedCharacters = new Set(['opal']);
    }

    if (!this.gameState.unlockedCharacters.has(characterId)) {
      this.gameState.unlockedCharacters.add(characterId);
      return { success: true, characterId };
    }

    return { success: false, reason: 'Character already unlocked' };
  }

  getActiveQuests() {
    const activeQuests = [];

    for (const [characterId, questData] of Object.entries(CHARACTER_QUESTS)) {
      const progress = this.getCurrentQuestStep(characterId);

      if (!progress.completed) {
        const currentStep = questData.steps[progress.currentStep];
        if (currentStep) {
          activeQuests.push({
            characterId,
            questName: questData.name,
            currentStep: progress.currentStep,
            totalSteps: questData.steps.length,
            stepName: currentStep.name,
            stepDescription: currentStep.description
          });
        }
      }
    }

    return activeQuests;
  }

  isQuestCompleted(characterId) {
    const progress = this.getCurrentQuestStep(characterId);
    return progress.completed;
  }

  getQuestProgress(characterId) {
    const questData = CHARACTER_QUESTS[characterId];
    if (!questData) return null;

    const progress = this.getCurrentQuestStep(characterId);
    const currentStep = questData.steps[progress.currentStep];

    return {
      characterId,
      name: questData.name,
      currentStep: progress.currentStep,
      totalSteps: questData.steps.length,
      completed: progress.completed,
      activeStep: currentStep ? {
        name: currentStep.name,
        description: currentStep.description,
        characterRequired: currentStep.characterRequired
      } : null
    };
  }

  getAllQuestProgress() {
    return Object.keys(CHARACTER_QUESTS).map(characterId =>
      this.getQuestProgress(characterId)
    );
  }

  getCompletedQuestCount() {
    let count = 0;
    for (const characterId of Object.keys(CHARACTER_QUESTS)) {
      if (this.isQuestCompleted(characterId)) {
        count++;
      }
    }
    return count;
  }

  autoCompleteHistoricalActions(characterId) {
    const progress = this.getCurrentQuestStep(characterId);
    const questData = CHARACTER_QUESTS[characterId];

    if (!questData || progress.completed) return;

    let autoCompleted = false;

    while (progress.currentStep < questData.steps.length) {
      const step = questData.steps[progress.currentStep];

      const conditionMet = this.checkStepConditionMet(step, characterId);

      if (conditionMet) {
        this.completeQuestStep(characterId);
        autoCompleted = true;
      } else {
        break;
      }
    }

    return autoCompleted;
  }

  checkStepConditionMet(step, characterId) {
    const gs = this.gameState;

    switch (step.checkType) {
      case 'interaction':
        return gs.interactions && gs.interactions[step.checkData.character] > 0;

      case 'dialogue':
        const dialogueKey = `${step.checkData.character}_${step.checkData.dialogueKey}`;
        return gs.dialogues && gs.dialogues[dialogueKey] === true;

      case 'item':
        return gs.inventory && gs.inventory[characterId] &&
               gs.inventory[characterId].includes(step.checkData.item);

      case 'give_item':
        const key = `${characterId}_${step.checkData.item}_${step.checkData.recipient}`;
        return gs.itemsGiven && gs.itemsGiven[key] === true;

      case 'talk_to_all':
        if (!gs.interactions) return false;
        const talked = Object.keys(gs.interactions).filter(id =>
          gs.interactions[id] > 0 && id !== characterId
        ).length;
        return talked >= step.checkData.count;

      case 'defeat_boss':
        if (!gs.bossesDefeated) return false;
        const defeated = step.checkData.bosses.filter(boss =>
          gs.bossesDefeated[boss] === true
        ).length;
        return defeated >= step.checkData.count;

      case 'collect_weapons':
        if (!gs.weaponsCollected || !gs.weaponsCollected[characterId]) return false;
        return gs.weaponsCollected[characterId].length >= step.checkData.count;

      case 'minigame':
        const score = gs.miniGameScores && gs.miniGameScores.nicholas || 0;
        return score >= step.checkData.score;

      case 'quest_complete':
        const questProgress = this.getCurrentQuestStep(step.checkData.quest);
        return questProgress.completed === true;

      case 'enter_boss_combat':
        if (!gs.bossesEntered) return false;
        return step.checkData.bosses.some(boss => gs.bossesEntered[boss] === true);

      case 'level':
        const level = gs.characterLevels && gs.characterLevels[characterId] || 1;
        return level >= step.checkData.level;

      case 'defeat_enemy':
        const enemiesDefeated = gs.enemiesDefeatedBy && gs.enemiesDefeatedBy[characterId] || 0;
        return enemiesDefeated >= step.checkData.count;

      case 'fraymotifs':
        if (!gs.fraymotifsUsed || !gs.fraymotifsUsed[characterId]) return false;
        return gs.fraymotifsUsed[characterId].size >= step.checkData.count;

      case 'interaction_count':
        const count = gs.interactions && gs.interactions[step.checkData.character] || 0;
        return count >= step.checkData.count;

      case 'character_switch':
        if (!gs.characterSwitches) return false;
        if (step.checkData.character) {
          return gs.characterSwitches[step.checkData.character] === true;
        } else {
          return gs.characterSwitches[characterId] > 0;
        }

      case 'all_quests_complete':
        return this.getCompletedQuestCount() >= step.checkData.count;

      case 'location':
        return gs.visitedLocations && gs.visitedLocations[step.checkData.location] === true;

      case 'weapon_upgrade':
        return gs.weaponUpgrades && gs.weaponUpgrades[characterId] === true;

      default:
        return false;
    }
  }
}