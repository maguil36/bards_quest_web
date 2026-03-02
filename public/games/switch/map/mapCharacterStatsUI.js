import { CHARACTER_STATS, DEFAULT_WEAPONS, WEAPON_DATABASE } from '../battle/battleCombatData.js';
import { CHARACTERS } from './mapCharacters.js';

export class MapCharacterStatsUI {
  constructor(gameState) {
    this.gameState = gameState;
  }

  renderCharacterStats(characterId) {
    const stats = CHARACTER_STATS[characterId];
    const character = CHARACTERS[characterId];
    const weaponId = DEFAULT_WEAPONS[characterId] || 'fist';
    const weapon = WEAPON_DATABASE[weaponId];

    if (!stats || !character) {
      return '<div style="color: var(--muted);">No character data available</div>';
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">';

    html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">';
    html += `<div><strong>HP:</strong> ${stats.hp}/${stats.maxHp}</div>`;
    html += `<div><strong>Level:</strong> ${stats.level}</div>`;
    html += `<div><strong>Attack:</strong> ${stats.attack}</div>`;
    html += `<div><strong>Defense:</strong> ${stats.defense}</div>`;
    html += `<div><strong>Sp. Atk:</strong> ${stats.specialAttack}</div>`;
    html += `<div><strong>Sp. Def:</strong> ${stats.specialDefense}</div>`;
    html += `<div><strong>Speed:</strong> ${stats.speed}</div>`;
    html += '</div>';

    if (weapon) {
      html += '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border);">';
      html += `<div><strong>Weapon:</strong> ${weapon.name}</div>`;
      html += `<div style="color: var(--muted); font-size: 11px;">${weapon.description || ''}</div>`;
      html += '</div>';
    }

    if (character.abilities && character.abilities.length > 0) {
      html += '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border);">';
      html += '<div style="margin-bottom: 4px;"><strong>Map Abilities:</strong></div>';
      character.abilities.forEach(abilityId => {
        const description = character.abilityDescriptions[abilityId];
        if (description) {
          html += `<div style="color: var(--muted); font-size: 11px; margin-left: 8px;">• ${description}</div>`;
        }
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  updateStatsDisplay(characterId) {
    const container = document.getElementById('characterStatsContainer');
    if (container) {
      container.innerHTML = this.renderCharacterStats(characterId);
    }
  }
}
