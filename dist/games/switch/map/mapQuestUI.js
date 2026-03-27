import { CHARACTER_QUESTS } from './mapQuestData.js';

export class MapQuestUI {
  constructor(gameState) {
    this.gameState = gameState;
  }

  renderQuestLog() {
    const currentCharacter = this.gameState.currentCharacter;

    let html = '<div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">';

    Object.entries(CHARACTER_QUESTS).forEach(([characterId, questData]) => {
      const progress = this.getQuestProgress(characterId);
      const isCurrentCharacter = characterId === currentCharacter;

      if (!progress.activeStep && !progress.completed) return;

      const statusIcon = progress.completed ? '✓' : progress.activeStep ? '○' : '●';
      const statusColor = progress.completed ? 'var(--success)' : progress.activeStep ? 'var(--primary)' : 'var(--muted)';

      html += `<div style="display: flex; align-items: flex-start; gap: 8px; opacity: ${progress.completed ? 0.6 : 1};">`;
      html += `<span style="color: ${statusColor}; min-width: 16px;">${statusIcon}</span>`;
      html += '<div style="flex: 1;">';

      const tags = [];
      if (progress.activeStep?.characterRequired) tags.push(progress.activeStep.characterRequired);
      if (progress.activeStep?.unlockPlayable) tags.push('p');
      if (!progress.activeStep?.characterRequired) tags.push('g');

      const tagString = tags.length > 0 ? ` (${tags.join(', ')})` : '';

      html += `<div style="font-weight: ${progress.activeStep && !progress.completed ? 'bold' : 'normal'};">${questData.name}${tagString}</div>`;

      if (progress.activeStep && !progress.completed) {
        let stepDescription = progress.activeStep.description;

        if (progress.activeStep.checkType === 'fraymotifs' && characterId === 'opal') {
          const fraymotifsUsed = this.gameState.fraymotifsUsed?.opal?.size || 0;
          const fraymotifsNeeded = progress.activeStep.checkData?.count || 5;
          stepDescription += ` (${fraymotifsUsed}/${fraymotifsNeeded})`;
        }

        html += `<div style="color: var(--muted); font-size: 11px; margin-top: 2px;">Step ${progress.currentStep + 1}/${progress.totalSteps}: ${stepDescription}</div>`;
      } else if (progress.completed) {
        html += `<div style="color: var(--success); font-size: 11px; margin-top: 2px;">Quest Complete (${progress.totalSteps}/${progress.totalSteps})</div>`;
      }

      html += '</div></div>';
    });

    html += '</div>';
    return html;
  }

  getQuestProgress(characterId) {
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
    const questData = CHARACTER_QUESTS[characterId];

    if (!questData) {
      return { activeStep: null, completed: false, currentStep: 0, totalSteps: 0 };
    }

    const activeStep = progress.completed ? null : questData.steps[progress.currentStep];

    return {
      activeStep,
      completed: progress.completed,
      currentStep: progress.currentStep,
      totalSteps: questData.steps.length
    };
  }

  updateQuestDisplay() {
    const container = document.getElementById('questLogContainer');
    if (container) {
      container.innerHTML = this.renderQuestLog();
    }
  }
}