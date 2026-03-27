import { CHARACTER_STATS, DEFAULT_WEAPONS, WEAPON_DATABASE, ABILITIES } from '../battle/battleCombatData.js';
import { CHARACTERS, CHARACTER_BASE_HP } from './mapCharacters.js';

const ABILITY_DESCRIPTIONS = {
  weaponSteal: 'Can steal and use weapons from other characters',
  invincibleInCombat: 'Cannot take damage in combat',
  autoSolvePuzzle: 'Auto-solve any puzzle on click',
  healOthers: 'Heal other characters by talking to her',
  healSelf: 'Can heal herself by clicking on herself',
  gristCreator: 'Has mini grist creator for alchemization',
  buildStructures: 'Can build and repair structures like bridges',
  damageBoost: 'Weapon deals 10x damage with no random variance',
  teleport: 'Can freely teleport around the map',
  spatialManipulation: 'Can manipulate spatial objects',
  largeInventory: 'Can hold more items than other characters',
  gameBreaker: 'Breaks the game at the end'
};

export class MapCharacterStatsUI {
  constructor(gameState) {
    this.gameState = gameState;
  }

  calculateXpForLevel(level) {
    return Math.floor(Math.pow(level, 3));
  }

  updateStatsModal() {
    const current = this.gameState.getCurrentCharacter();
    const characterId = current.id;
    const stats = CHARACTER_STATS[characterId];
    const character = CHARACTERS[characterId];
    const weaponId = DEFAULT_WEAPONS[characterId] || 'fist';
    const weapon = WEAPON_DATABASE[weaponId];

    if (!stats || !character) {
      const container = document.getElementById('statsModalContent');
      if (container) {
        container.innerHTML = '<div style="color: var(--muted);">No character data available</div>';
      }
      return;
    }

    const portraitImg = document.getElementById('statsPortraitImage');
    const characterNameEl = document.getElementById('statsCharacterName');
    const characterTitleEl = document.getElementById('statsCharacterTitle');

    if (portraitImg) {
      portraitImg.src = `sprites/${characterId}_portrait.png`;
      portraitImg.onerror = () => {
        portraitImg.style.display = 'none';
      };
    }

    const statsModalTitle = document.getElementById('statsModalTitle');
    if (statsModalTitle) {
      statsModalTitle.innerHTML = `<span style="color: ${character.color};">${character.name}:</span> <span style="color: ${character.color};">Character Stats</span>`;
    }

    if (characterNameEl) {
      characterNameEl.textContent = character.name;
      characterNameEl.style.color = character.color;
    }

    if (characterTitleEl) {
      characterTitleEl.textContent = character.quest?.description || 'Adventurer';
    }

    const mapCharacter = this.gameState.characters[characterId];
    const currentHp = mapCharacter ? mapCharacter.currentHp : CHARACTER_BASE_HP[characterId];
    const maxHp = stats.maxHp;
    const hpPercent = (currentHp / maxHp) * 100;

    const currentLevel = this.gameState.levels?.[characterId] || 1;
    const currentXp = this.gameState.xp?.[characterId] || 0;
    const xpForNextLevel = this.calculateXpForLevel(currentLevel + 1);
    const xpForCurrentLevel = this.calculateXpForLevel(currentLevel);
    const xpProgress = currentXp - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const xpPercent = currentLevel >= 100 ? 100 : (xpProgress / xpNeeded) * 100;

    const statGrowth = mapCharacter?.statGrowth || {
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0
    };

    let html = '';

    html += '<div class="stats-section">';
    html += '<div class="stats-section-title">Vitality & Experience</div>';

    html += '<div class="stats-vitality-bar-container">';
    html += '<div class="stats-vitality-label">';
    html += '<span>Health Vital</span>';
    html += `<span>${currentHp} / ${maxHp}</span>`;
    html += '</div>';
    html += '<div class="stats-vitality-bar">';
    html += `<div class="stats-vitality-fill" style="width: ${hpPercent}%;"></div>`;
    html += '</div>';
    html += '</div>';

    html += '<div class="stats-level-container">';
    html += '<div class="stats-level-label">';
    html += '<span>Level</span>';
    html += `<span>${currentLevel} / 100</span>`;
    html += '</div>';
    if (currentLevel < 100) {
      html += '<div class="stats-xp-bar">';
      html += `<div class="stats-xp-fill" style="width: ${xpPercent}%;"></div>`;
      html += '</div>';
      html += `<div class="stats-xp-text">${xpProgress} / ${xpNeeded} XP to next level</div>`;
    } else {
      html += '<div class="stats-xp-bar">';
      html += `<div class="stats-xp-fill" style="width: 100%;"></div>`;
      html += '</div>';
      html += `<div class="stats-xp-text">1 / 1 XP to next level</div>`;
    }
    html += '</div>';

    html += '</div>';

    html += '<div class="stats-section">';
    html += '<div class="stats-section-title">Battle Stats</div>';
    html += '<div class="stats-grid">';
    html += `<div class="stat-item"><span class="stat-label">Attack</span><span class="stat-value">${stats.attack}${statGrowth.attack > 0 ? `<span style="color: #4ade80; margin-left: 4px;">+${statGrowth.attack}</span>` : ''}</span></div>`;
    html += `<div class="stat-item"><span class="stat-label">Defense</span><span class="stat-value">${stats.defense}${statGrowth.defense > 0 ? `<span style="color: #4ade80; margin-left: 4px;">+${statGrowth.defense}</span>` : ''}</span></div>`;
    html += `<div class="stat-item"><span class="stat-label">Sp. Atk</span><span class="stat-value">${stats.specialAttack}${statGrowth.specialAttack > 0 ? `<span style="color: #4ade80; margin-left: 4px;">+${statGrowth.specialAttack}</span>` : ''}</span></div>`;
    html += `<div class="stat-item"><span class="stat-label">Sp. Def</span><span class="stat-value">${stats.specialDefense}${statGrowth.specialDefense > 0 ? `<span style="color: #4ade80; margin-left: 4px;">+${statGrowth.specialDefense}</span>` : ''}</span></div>`;
    html += `<div class="stat-item"><span class="stat-label">Speed</span><span class="stat-value">${stats.speed}${statGrowth.speed > 0 ? `<span style="color: #4ade80; margin-left: 4px;">+${statGrowth.speed}</span>` : ''}</span></div>`;
    html += '</div>';
    html += '</div>';

    if (weapon) {
      html += '<div class="stats-section">';
      html += '<div class="stats-section-title">Equipment</div>';
      html += '<div class="stats-weapon-info">';
      html += `<div class="stats-weapon-name">${weapon.name}</div>`;
      html += `<div class="stats-weapon-desc">${weapon.description || 'A trusty weapon'}</div>`;
      html += '</div>';
      html += '</div>';
    }

    const combatAbility = ABILITIES[characterId];
    if (combatAbility) {
      html += '<div class="stats-section">';
      html += '<div class="stats-section-title">Combat Ability</div>';
      html += '<div class="stats-ability-combat">';
      html += `<div class="stats-ability-name">${combatAbility.name}</div>`;
      html += '</div>';
      html += '</div>';
    }

    if (character.abilities && character.abilities.length > 0) {
      html += '<div class="stats-section">';
      html += '<div class="stats-section-title">Map Abilities</div>';
      html += '<ul class="stats-abilities-list">';
      character.abilities.forEach(abilityId => {
        const description = ABILITY_DESCRIPTIONS[abilityId];
        if (description) {
          html += `<li class="stats-ability-item">${description}</li>`;
        }
      });
      html += '</ul>';
      html += '</div>';
    }

    const container = document.getElementById('statsModalContent');
    if (container) {
      container.innerHTML = html;
    }
  }
}
