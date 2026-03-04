import { QUESTS } from './mapQuestData.js';
import { CHARACTERS } from './mapCharacters.js';

export class MapQuestLogUI {
  constructor(gameState) {
    this.gameState = gameState;
    this.expandedQuestChains = new Set();
  }

  updateQuestLog() {
    const questModalBody = document.getElementById('questLogModalBody');
    if (!questModalBody) return;

    const completedQuests = this.gameState.completedQuests || new Set();
    const currentCharacter = this.gameState.getCurrentCharacter();

    const questChains = this.buildQuestChains();

    let html = '<div class="quest-chains-container">';

    questChains.forEach(chain => {
      html += this.renderQuestChain(chain, completedQuests, currentCharacter);
    });

    html += '</div>';

    if (questChains.length === 0) {
      html = '<div style="text-align: center; padding: 40px 20px; color: var(--muted);">No quests available at the moment.</div>';
    }

    questModalBody.innerHTML = html;
    this.attachEventListeners();
  }

  buildQuestChains() {
    const chains = [];
    const processedQuests = new Set();

    Object.entries(QUESTS).forEach(([questId, quest]) => {
      if (processedQuests.has(questId)) return;
      if (quest.prerequisite) return;

      const chain = this.buildChainFromRoot(questId, processedQuests);
      if (chain.quests.length > 0) {
        chains.push(chain);
      }
    });

    return chains;
  }

  buildChainFromRoot(rootQuestId, processedQuests) {
    const chain = { rootId: rootQuestId, quests: [] };
    let currentQuestId = rootQuestId;

    while (currentQuestId) {
      if (processedQuests.has(currentQuestId)) break;

      const quest = QUESTS[currentQuestId];
      if (!quest) break;

      chain.quests.push({
        id: currentQuestId,
        ...quest
      });

      processedQuests.add(currentQuestId);

      currentQuestId = Object.entries(QUESTS).find(([id, q]) =>
        q.prerequisite === currentQuestId
      )?.[0];
    }

    return chain;
  }

  renderQuestChain(chain, completedQuests, currentCharacter) {
    const visibleQuests = chain.quests;

    if (visibleQuests.length === 0) return '';

    const completedInChain = visibleQuests.filter(q => completedQuests.has(q.id));
    const activeQuest = visibleQuests.find(q => !completedQuests.has(q.id));

    const isExpanded = this.expandedQuestChains.has(chain.rootId);
    const totalQuests = visibleQuests.length;
    const completedCount = completedInChain.length;

    if (activeQuest) {
      const isLocked = activeQuest.characterSpecific && activeQuest.characterSpecific !== currentCharacter.id;
      return this.renderActiveQuest(activeQuest, completedInChain, totalQuests, completedCount, chain.rootId, isExpanded, isLocked, currentCharacter);
    } else if (completedInChain.length > 0) {
      return this.renderCompletedChain(completedInChain, totalQuests, chain.rootId, isExpanded);
    }

    return '';
  }

  renderActiveQuest(quest, completedQuests, totalQuests, completedCount, chainId, isExpanded, isLocked, currentCharacter) {
    const description = this.getQuestDescription(quest.id, quest);

    let html = '<div class="quest-chain" data-chain-id="' + chainId + '">';
    html += `<div class="quest-item ${isLocked ? 'locked' : 'active'}">`;

    html += '<div class="quest-progress">';
    html += `<div class="quest-progress-count">${completedCount}/${totalQuests}</div>`;
    html += '<div class="quest-progress-dots">';
    for (let i = 0; i < Math.min(totalQuests, 5); i++) {
      let dotClass = 'quest-progress-dot';
      if (i < completedCount) {
        dotClass += ' completed';
      } else if (i === completedCount) {
        dotClass += isLocked ? ' locked' : ' active';
      }
      html += `<div class="${dotClass}"></div>`;
    }
    html += '</div>';
    html += '</div>';

    html += '<div class="quest-content">';
    html += '<div class="quest-title-row">';
    html += `<div class="quest-title">${quest.name}</div>`;
    if (isLocked) {
      const requiredCharacter = CHARACTERS[quest.characterSpecific];
      const characterName = requiredCharacter ? requiredCharacter.name : quest.characterSpecific;
      html += `<div class="quest-badge locked">🔒 ${characterName} only</div>`;
    } else {
      html += '<div class="quest-badge active">Active</div>';
    }
    html += '</div>';
    html += `<div class="quest-desc">${description}</div>`;

    if (quest.unlockPlayable) {
      const character = CHARACTERS[quest.unlockPlayable];
      const characterName = character ? character.name : quest.unlockPlayable;
      html += `<div class="quest-reward-compact"><span>🔓</span> Unlocks ${characterName}</div>`;
    }

    html += '</div>';

    if (completedQuests.length > 0) {
      html += '<div class="quest-actions">';
      html += `<button class="quest-history-btn ${isExpanded ? 'expanded' : ''}">${isExpanded ? '▲' : '▼'} ${completedQuests.length}</button>`;
      html += '</div>';
    }

    html += '</div>';

    if (completedQuests.length > 0) {
      html += `<div class="quest-history ${isExpanded ? 'show' : ''}">`;
      completedQuests.forEach(completedQuest => {
        html += '<div class="quest-history-item">';
        html += `<span class="quest-history-title">${completedQuest.name}</span>`;
        html += '<span class="quest-history-status">✓ Completed</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    html += '</div>';

    return html;
  }

  renderCompletedChain(completedQuests, totalQuests, chainId, isExpanded) {
    const lastQuest = completedQuests[completedQuests.length - 1];
    const completedCount = completedQuests.length;

    let html = '<div class="quest-chain" data-chain-id="' + chainId + '">';
    html += '<div class="quest-item completed-chain">';

    html += '<div class="quest-progress">';
    html += `<div class="quest-progress-count">${completedCount}/${totalQuests}</div>`;
    html += '<div class="quest-progress-dots">';
    for (let i = 0; i < Math.min(totalQuests, 5); i++) {
      html += '<div class="quest-progress-dot completed"></div>';
    }
    html += '</div>';
    html += '</div>';

    html += '<div class="quest-content">';
    html += '<div class="quest-title-row">';
    html += `<div class="quest-title">${lastQuest.name}</div>`;
    html += '<div class="quest-badge completed">✓ Done</div>';
    html += '</div>';
    html += `<div class="quest-desc">${lastQuest.description}</div>`;

    if (lastQuest.unlockPlayable) {
      const character = CHARACTERS[lastQuest.unlockPlayable];
      const characterName = character ? character.name : lastQuest.unlockPlayable;
      html += `<div class="quest-reward-compact"><span>✓</span> Unlocked ${characterName}</div>`;
    }

    html += '</div>';

    if (completedQuests.length > 1) {
      html += '<div class="quest-actions">';
      html += `<button class="quest-history-btn ${isExpanded ? 'expanded' : ''}">${isExpanded ? '▲' : '▼'} ${completedQuests.length}</button>`;
      html += '</div>';
    }

    html += '</div>';

    if (completedQuests.length > 1) {
      html += `<div class="quest-history ${isExpanded ? 'show' : ''}">`;
      completedQuests.slice(0, -1).forEach(quest => {
        html += '<div class="quest-history-item">';
        html += `<span class="quest-history-title">${quest.name}</span>`;
        html += '<span class="quest-history-status">✓ Completed</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    html += '</div>';

    return html;
  }

  renderCompletedQuestCard(quest, index) {
    return '';
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

  getQuestDescription(questId, quest) {
    if (questId === 'talk_to_all') {
      const currentCharacter = this.gameState.getCurrentCharacter();
      const count = this.getTalkToAllProgress(currentCharacter.id);
      return `Talk to all 7 characters (${count} out of 7)`;
    }

    if (questId === 'finish_all_quests') {
      const count = this.getFinishAllQuestsProgress();
      return `Complete all 7 character quest chains (${count} out of 7)`;
    }

    if (questId === 'play_victor_ending') {
      const count = this.getFinishAllQuestsProgress();
      return `Complete the game as Victor (${count} out of 7 character quests completed)`;
    }

    return quest.description;
  }

  getTalkToAllProgress(characterId) {
    const completedDialogues = this.gameState.completedDialogues || new Set();
    const npcs = ['alexis', 'austine', 'chloe', 'isabell', 'nicholas', 'opal', 'tyson'];
    const former = this.gameState.formerSwapPartnerByCharacter?.[characterId];

    const validNpcs = npcs.filter(npcId => npcId !== characterId && npcId !== former);

    let count = 0;
    validNpcs.forEach(npcId => {
      if (completedDialogues.has(`${characterId}:${npcId}`)) {
        count++;
      }
    });

    return count;
  }

  getFinishAllQuestsProgress() {
    const characterQuestChains = [
      'use_all_fraymotifs',
      'give_to_austine_tyson',
      'defeat_boss_alexis',
      'upgrade_weapon',
      'give_to_austine_nicholas',
      'enter_combat_boss',
      'level_up_100'
    ];

    const completedQuests = this.gameState.completedQuests || new Set();
    let count = 0;

    characterQuestChains.forEach(questId => {
      if (completedQuests.has(questId)) {
        count++;
      }
    });

    return count;
  }

  renderQuestItem(quest, isCompleted) {
    let html = '<div class="quest-item">';

    html += '<div class="quest-header">';
    html += `<div class="quest-title">${quest.name}</div>`;
    html += `<div class="quest-status ${isCompleted ? 'completed' : 'active'}">${isCompleted ? 'Completed' : 'Active'}</div>`;
    html += '</div>';

    html += `<div class="quest-description">${quest.description}</div>`;

    if (quest.unlockPlayable) {
      const character = CHARACTERS[quest.unlockPlayable];
      const characterName = character ? character.name : quest.unlockPlayable;
      html += '<div class="quest-rewards">';
      html += '<div class="quest-rewards-title">Rewards</div>';
      html += `<div class="quest-rewards-list">Unlocks ${characterName} as a playable character</div>`;
      html += '</div>';
    }

    html += '</div>';
    return html;
  }
}
