import { CHARACTER_QUESTS } from './mapQuestData.js';
import { CHARACTERS } from './mapCharacters.js';

export class MapQuestLogUI {
  constructor(gameState) {
    this.gameState = gameState;
    this.expandedQuestChains = new Set();
  }

  updateQuestLog() {
    const questModalBody = document.getElementById('questLogModalBody');
    if (!questModalBody) return;

    const currentCharacter = this.gameState.getCurrentCharacter();

    let html = '<div class="quest-chains-container">';

    Object.entries(CHARACTER_QUESTS).forEach(([characterId, questData]) => {
      html += this.renderCharacterQuest(characterId, questData, currentCharacter);
    });

    html += '</div>';

    questModalBody.innerHTML = html;
    this.attachEventListeners();
  }

  renderCharacterQuest(characterId, questData, currentCharacter) {
    const progress = this.getQuestProgress(characterId);
    const isExpanded = this.expandedQuestChains.has(characterId);

    const completedSteps = progress.currentStep || 0;
    const totalSteps = questData.steps.length;
    const isCompleted = progress.completed;

    let html = '<div class="quest-chain" data-chain-id="' + characterId + '">';
    html += `<div class="quest-item ${isCompleted ? 'completed-chain' : 'active'}">`;

    html += '<div class="quest-progress">';
    html += `<div class="quest-progress-count">${completedSteps}/${totalSteps}</div>`;
    html += '<div class="quest-progress-dots">';
    for (let i = 0; i < Math.min(totalSteps, 5); i++) {
      let dotClass = 'quest-progress-dot';
      if (i < completedSteps) {
        dotClass += ' completed';
      } else if (i === completedSteps) {
        dotClass += ' active';
      }
      html += `<div class="${dotClass}"></div>`;
    }
    html += '</div>';
    html += '</div>';

    html += '<div class="quest-content">';
    html += '<div class="quest-title-row">';
    html += `<div class="quest-title">${questData.name}</div>`;

    if (isCompleted) {
      html += '<div class="quest-badge completed">✓ Done</div>';
    } else {
      const currentStep = questData.steps[progress.currentStep];
      if (currentStep && currentStep.characterRequired && currentStep.characterRequired !== currentCharacter.id) {
        const requiredCharacter = CHARACTERS[currentStep.characterRequired];
        const characterName = requiredCharacter ? requiredCharacter.name : currentStep.characterRequired;
        html += `<div class="quest-badge locked">🔒 ${characterName} only</div>`;
      } else {
        html += '<div class="quest-badge active">Active</div>';
      }
    }

    html += '</div>';

    if (!isCompleted) {
      const currentStep = questData.steps[progress.currentStep];
      if (currentStep) {
        let stepDescription = `Step ${progress.currentStep + 1}: ${currentStep.description}`;

        if (currentStep.checkType === 'fraymotifs' && characterId === 'opal') {
          const fraymotifsUsed = this.gameState.fraymotifsUsed?.opal?.size || 0;
          const fraymotifsNeeded = currentStep.checkData?.count || 5;
          stepDescription += ` (${fraymotifsUsed}/${fraymotifsNeeded})`;
        }

        html += `<div class="quest-desc">${stepDescription}</div>`;

        if (currentStep.unlockPlayable) {
          const character = CHARACTERS[currentStep.unlockPlayable];
          const characterName = character ? character.name : currentStep.unlockPlayable;
          html += `<div class="quest-reward-compact"><span>🔓</span> Unlocks ${characterName}</div>`;
        }
      }
    } else {
      html += `<div class="quest-desc">All steps completed!</div>`;
    }

    html += '</div>';

    if (completedSteps > 0 || isCompleted) {
      html += '<div class="quest-actions">';
      const stepCount = isCompleted ? totalSteps : completedSteps;
      html += `<button class="quest-history-btn ${isExpanded ? 'expanded' : ''}">${isExpanded ? '▲' : '▼'} ${stepCount} step${stepCount !== 1 ? 's' : ''}</button>`;
      html += '</div>';
    }

    html += '</div>';

    if (completedSteps > 0 || isCompleted) {
      html += `<div class="quest-history ${isExpanded ? 'show' : ''}">`;
      const stepsToShow = isCompleted ? totalSteps : completedSteps;
      for (let i = 0; i < stepsToShow; i++) {
        const step = questData.steps[i];
        html += '<div class="quest-history-item">';
        html += `<span class="quest-history-title">Step ${i + 1}: ${step.name}</span>`;
        html += '<span class="quest-history-status">✓ Completed</span>';
        html += '</div>';
      }
      html += '</div>';
    }

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

    return this.gameState.questProgress[characterId];
  }

  attachEventListeners() {
    const historyButtons = document.querySelectorAll('.quest-history-btn');

    historyButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chainElement = btn.closest('.quest-chain');
        if (!chainElement) return;

        const chainId = chainElement.dataset.chainId;

        if (this.expandedQuestChains.has(chainId)) {
          this.expandedQuestChains.delete(chainId);
        } else {
          this.expandedQuestChains.add(chainId);
        }

        this.updateQuestLog();
      });
    });
  }
}
