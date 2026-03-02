import { QUESTS } from './mapQuestData.js';

export class MapQuestUI {
  constructor(gameState) {
    this.gameState = gameState;
  }

  renderQuestLog() {
    const completedQuests = this.gameState.completedQuests || new Set();
    const currentCharacter = this.gameState.currentCharacter;

    let html = '<div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">';

    Object.entries(QUESTS).forEach(([questId, quest]) => {
      const isCompleted = completedQuests.has(questId);
      const isAvailable = this.isQuestAvailable(questId);
      const isCurrentCharacter = !quest.characterSpecific || quest.characterSpecific === currentCharacter;

      if (!isCurrentCharacter && !isCompleted) return;

      const statusIcon = isCompleted ? '✓' : isAvailable ? '○' : '●';
      const statusColor = isCompleted ? 'var(--success)' : isAvailable ? 'var(--primary)' : 'var(--muted)';

      html += `<div style="display: flex; align-items: flex-start; gap: 8px; opacity: ${isCompleted ? 0.6 : 1};">`;
      html += `<span style="color: ${statusColor}; min-width: 16px;">${statusIcon}</span>`;
      html += '<div style="flex: 1;">';
      
      let questName = quest.name;
      if (quest.prerequisite) {
        const prereqQuest = QUESTS[quest.prerequisite];
        questName = `${prereqQuest?.name || quest.prerequisite} → ${questName}`;
      }
      
      const tags = [];
      if (quest.characterSpecific) tags.push(quest.characterSpecific);
      if (quest.unlockPlayable) tags.push('p');
      if (!quest.characterSpecific) tags.push('g');
      
      const tagString = tags.length > 0 ? ` (${tags.join(', ')})` : '';
      
      html += `<div style="font-weight: ${isAvailable && !isCompleted ? 'bold' : 'normal'};">${questName}${tagString}</div>`;
      
      if (quest.description && isAvailable && !isCompleted) {
        html += `<div style="color: var(--muted); font-size: 11px; margin-top: 2px;">${quest.description}</div>`;
      }
      
      html += '</div></div>';
    });

    html += '</div>';
    return html;
  }

  isQuestAvailable(questId) {
    const quest = QUESTS[questId];
    if (!quest) return false;

    const completedQuests = this.gameState.completedQuests || new Set();
    if (completedQuests.has(questId)) return false;

    if (quest.prerequisite && !completedQuests.has(quest.prerequisite)) {
      return false;
    }

    if (quest.characterSpecific && quest.characterSpecific !== this.gameState.currentCharacter) {
      return false;
    }

    return true;
  }

  updateQuestDisplay() {
    const container = document.getElementById('questLogContainer');
    if (container) {
      container.innerHTML = this.renderQuestLog();
    }
  }
}