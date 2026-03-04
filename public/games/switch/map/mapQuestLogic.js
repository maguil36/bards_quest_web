import { QUESTS } from './mapQuestData.js';
import { CHARACTERS } from './mapCharacters.js';

export class MapQuestLogic {
  constructor(gameState) {
    this.gameState = gameState;
  }

  completeQuest(questId) {
    if (!this.gameState.completedQuests) {
      this.gameState.completedQuests = new Set();
    }

    if (this.gameState.completedQuests.has(questId)) {
      return { success: false, reason: 'Quest already completed' };
    }

    const quest = QUESTS[questId];
    if (!quest) {
      return { success: false, reason: 'Quest not found' };
    }

    if (quest.prerequisite && !this.gameState.completedQuests.has(quest.prerequisite)) {
      return { success: false, reason: 'Prerequisite not completed' };
    }

    this.gameState.completedQuests.add(questId);

    if (quest.unlockPlayable) {
      this.unlockCharacter(quest.unlockPlayable);
    }

    return { success: true, quest };
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

  getAvailableQuests(characterId = null) {
    const targetCharacter = characterId || this.gameState.currentCharacter;
    const completedQuests = this.gameState.completedQuests || new Set();

    return Object.entries(QUESTS)
      .filter(([questId, quest]) => {
        if (completedQuests.has(questId)) return false;

        if (quest.prerequisite && !completedQuests.has(quest.prerequisite)) {
          return false;
        }

        if (quest.characterSpecific && quest.characterSpecific !== targetCharacter) {
          return false;
        }

        return true;
      })
      .map(([questId, quest]) => ({ id: questId, ...quest }));
  }

  isQuestCompleted(questId) {
    return (this.gameState.completedQuests || new Set()).has(questId);
  }

  getQuestProgress(questId) {
    const quest = QUESTS[questId];
    if (!quest) return null;

    return {
      questId,
      name: quest.name,
      description: quest.description,
      completed: this.isQuestCompleted(questId),
      available: this.getAvailableQuests().some(q => q.id === questId),
      prerequisite: quest.prerequisite,
      unlockPlayable: quest.unlockPlayable
    };
  }

  getAllQuestProgress() {
    return Object.keys(QUESTS).map(questId => this.getQuestProgress(questId));
  }

  completeQuestsUnlockingCharacter(characterId) {
    const completedQuests = [];

    for (const [questId, quest] of Object.entries(QUESTS)) {
      if (quest.unlockPlayable === characterId) {
        const result = this.completeQuest(questId);
        if (result.success) {
          completedQuests.push(questId);
        }
      }
    }

    return completedQuests;
  }
}