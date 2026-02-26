import { BattleUIInput } from './battleUIInput.js';
import { ASPECT_COLORS, CHARACTER_ASPECTS, getCharacterAspect, getAspectColor } from '../constants.js';

class BattleUI {
  constructor(gameState) {
    this.gameState = gameState;
    this.container = null;
    this.isVisible = false;
    this.currentPhase = 'selecting';
    this.animating = false;
    this.commandPrompt = '';
    this.focusedButtonIndex = 0;
    this.keyboardNavigationEnabled = true;
    this.lastPlayerHP = null;
    this.lastEnemyHP = null;
    this.messageDisplayTimeout = null;
    this.waitingForSpace = false;

    this.textRenderer = new BattleTextRenderer();
    this.animations = new BattleAnimations();
    this.inputHandler = new BattleUIInput(this);

    this.init();
  }

  get battleMessages() {
    return this.textRenderer.getMessages();
  }

  set battleMessages(messages) {
    this.textRenderer.setMessages(messages);
  }

  init() {
    this.container = document.getElementById('combatUI');
    if (!this.container) {
      console.error('Combat UI container not found');
      return;
    }

    this.animations.setContainer(this.container);
    this.setupEventListeners();
  }
  
  setupEventListeners() {

    document.addEventListener('keydown', (e) => {
      if (!this.isVisible) return;

      if (e.key === 'Escape' && this.currentPhase === 'menu') {
        this.currentPhase = 'selecting';
        this.render();
      }
    });
  }
  
  show(combatData) {
    this.isVisible = true;
    this.combatData = combatData;
    this.currentPhase = 'intro';
    this.container.style.display = 'block';

    // Initialize HP tracking for animations
    this.lastPlayerHP = combatData.player.hp;
    this.lastEnemyHP = combatData.enemy.hp;

    this.playIntroAnimation(() => {
      this.currentPhase = 'selecting';
      this.render();
    });
  }
  
  hide() {
    this.isVisible = false;
    this.container.style.display = 'none';
    this.inputHandler.cleanup();
  }
  
  playIntroAnimation(callback) {
    this.animations.playIntroAnimation(
      callback,
      (prompt) => {
        this.commandPrompt = prompt;
        this.render();
      },
      this.combatData.player.name
    );
  }
  
  getAspectColor(characterId) {
    const aspect = getCharacterAspect(characterId);
    return getAspectColor(aspect);
  }
  
  render() {
    if (!this.combatData) return;

    const { player, enemy } = this.combatData;
    const aspectColor = this.getAspectColor(player.id);

    this.container.innerHTML = `
      <div class="battle-screen" style="position: relative; width: 100%; height: 100%; display: flex; flex-direction: column;">
        ${this.renderActionPanel(player, aspectColor)}
        ${this.currentPhase !== 'fraymotif' ? this.renderBattleField(player, enemy, aspectColor) : this.renderFragmotifBackground(player, aspectColor)}
      </div>
    `;

    this.attachMoveHandlers();
    this.renderHealthVitals(player, enemy);
    this.inputHandler.setupKeyboardNavigation();
  }

  renderHealthVitals(player, enemy) {
    const playerHPPercent = (player.hp / player.maxHp) * 100;

    if (playerHPPercent < 100) {
      const playerPanel = document.querySelector('.player-panel');

      if (playerPanel) {
        playerPanel.style.display = 'flex';
        playerPanel.style.opacity = '0';
        playerPanel.style.transition = 'opacity 0.5s ease-in';

        setTimeout(() => {
          playerPanel.style.opacity = '1';
        }, 10);

        setTimeout(() => {
          playerPanel.style.transition = 'opacity 2s ease-out';
          playerPanel.style.opacity = '0';
        }, 500);

        setTimeout(() => {
          playerPanel.style.display = 'none';
        }, 2500);
      }
    }

    const enemyVitalDiv = document.getElementById('enemy-health-vital');
    if (enemyVitalDiv) {
      const vitalCanvas = this.createPixelatedText('HEALTH VITAL', {
        color: '#ff0000',
        bgColor: 'transparent',
        shadowColor: null,
        shadowOffset: 0,
        scale: .5,
        dilate: false,
        baseFontSize: 14
      });
      enemyVitalDiv.innerHTML = '';
      enemyVitalDiv.appendChild(vitalCanvas);
    }
  }
  
  renderCommandPrompt() {
    const text = this.commandPrompt || '==> What will you do?';
    const canvasId = 'commandPromptCanvas';

    setTimeout(() => {
      const container = document.getElementById(canvasId);
      if (container) {
        container.innerHTML = '';
        const canvas = this.createPixelatedText(text, 'command');
        container.appendChild(canvas);
      }
    }, 0);

    return `
      <div class="command-prompt" style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        background: transparent;
        border-bottom: 2px solid #fff;
        padding: 8px 0;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding-left: 10px;
      ">
        <div id="${canvasId}"></div>
      </div>
    `;
  }
  
  renderBattleField(player, enemy, aspectColor) {
    const playerHPPercent = (player.hp / player.maxHp) * 100;
    const enemyHPPercent = (enemy.hp / enemy.maxHp) * 100;

    return `
      <div class="battlefield" style="
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background-image: url('/games/switch/images/battleUI/derse.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      ">
        <!-- Enemy Panel -->
        <!-- Enemy Sprite (Always Visible) -->
        <div class="enemy-sprite-container" style="
          position: absolute;
          right: 20px;
          bottom: 20px;
          z-index: 8;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        ">
          <div class="enemy-sprite" style="
            font-size: 128px;
            animation: float 2s ease-in-out infinite;
          ">
            👾
          </div>
        </div>

        <!-- Enemy Health Bar (Above Sprite) -->
        <div class="enemy-panel" style="
          position: absolute;
          right: 20px;
          bottom: 170px;
          z-index: 9;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        ">
          <div class="enemy-info-box" style="
            background: transparent;
            border: none;
            padding: 0;
          ">
            <div style="position: relative; width: 180px;">
              <div class="hp-bar-container" style="
                background: #333;
                border: 2px solid #666;
                height: 30px;
                position: relative;
                overflow: visible;
                width: 190px;
                border-radius: 15px;
              ">
                <div class="hp-bar" style="
                  position: absolute;
                  left: calc(${enemyHPPercent - 100}% + 3px);
                  top: 7px;
                  height: 14px;
                  width: 180px;
                  transition: left 0.5s ease-out;
                  border-radius: 6px;
                  border: 2px solid #000;
                  background: #fff;
                  padding: 1px;
                ">
                  <div style="
                    position: relative;
                    width: 100%;
                    height: 100%;
                    border-radius: 3px;
                    overflow: hidden;
                  ">
                    <div style="
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: ${100 - enemyHPPercent}%;
                      height: 100%;
                      background: #999;
                    "></div>
                    <div style="
                      position: absolute;
                      right: 0;
                      top: 0;
                      width: ${enemyHPPercent}%;
                      height: 100%;
                      background: #ff0000;
                    "></div>
                  </div>
                </div>
              </div>
            </div>

            <div id="enemy-health-vital" style="
              margin-top: 3px;
              text-align: center;
            "></div>

            ${this.renderStatusEffects(enemy)}
          </div>
        </div>

        <!-- Player Sprite (Always Visible) -->
        <div class="player-sprite-container" style="
          position: absolute;
          left: 20px;
          bottom: 20px;
          z-index: 8;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        ">
          <div class="player-sprite" style="
            font-size: 128px;
            animation: bounce 1s ease-in-out infinite;
          ">
            👾
          </div>
        </div>

        <!-- Player Health Bar (Above Sprite) -->
        <div class="player-panel" style="
          position: absolute;
          left: 20px;
          bottom: 170px;
          z-index: 9;
          display: ${playerHPPercent < 100 ? 'flex' : 'none'};
          flex-direction: column;
          align-items: flex-start;
        ">
          <div style="position: relative; width: 220px;">
              <div class="hp-bar-container" style="
                background: #333;
                border: 2px solid #666;
                height: 30px;
                position: relative;
                overflow: visible;
                width: 190px;
                border-radius: 15px;
              ">
                <div class="hp-bar" style="
                  position: absolute;
                  left: calc(${playerHPPercent - 100}% + 3px);
                  top: 7px;
                  height: 14px;
                  width: 180px;
                  transition: left 0.5s ease-out;
                  border-radius: 6px;
                  border: 2px solid #000;
                  background: #fff;
                  padding: 1px;
                ">
                  <div style="
                    position: relative;
                    width: 100%;
                    height: 100%;
                    border-radius: 3px;
                    overflow: hidden;
                  ">
                    <div style="
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: ${100 - playerHPPercent}%;
                      height: 100%;
                      background: #999;
                      transition: width 0.5s ease-out;
                    "></div>
                    <div style="
                      position: absolute;
                      right: 0;
                      top: 0;
                      width: ${playerHPPercent}%;
                      height: 100%;
                      background: ${aspectColor};
                      transition: width 0.5s ease-out;
                    "></div>
                  </div>
                </div>
              </div>
            </div>

            <div id="player-health-vital" style="
              margin-top: 2px;
              text-align: center;
              display: none;
            "></div>

            ${this.renderStatusEffects(player)}
      </div>
    `;
  }

  renderFragmotifBackground(player, aspectColor) {
    const heroAspect = getCharacterAspect(player?.id);

    return `
      <div style="
        flex: 1;
        background-image: url('/games/switch/images/battleUI/fraymotif_${heroAspect}.png');
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        background-color: #000;
      "></div>
    `;
  }
  
  renderStatusEffects(battler) {
    const effects = Object.keys(battler.statusEffects || {});
    if (effects.length === 0) return '';
    
    return `
      <div class="status-effects" style="
        margin-top: 8px;
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      ">
        ${effects.map(effect => `
          <span style="
            background: #ff00ff;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            text-transform: uppercase;
          ">
            ${effect}
          </span>
        `).join('')}
      </div>
    `;
  }
  
  renderFragmotifMeter(player) {
    const fraymotifCharge = 65;
    
    return `
      <div class="fraymotif-meter" style="
        margin-top: 8px;
      ">
        <div style="font-size: 10px; color: #ffd700; margin-bottom: 2px;">
          FRAYMOTIF CHARGE
        </div>
        <div style="
          background: #222;
          border: 1px solid #ffd700;
          border-radius: 3px;
          height: 8px;
          overflow: hidden;
        ">
          <div style="
            width: ${fraymotifCharge}%;
            height: 100%;
            background: linear-gradient(90deg, #ffd700 0%, #ffed4e 100%);
            transition: width 0.3s ease-out;
          "></div>
        </div>
      </div>
    `;
  }
  
  renderActionPanel(player, aspectColor) {
    if (this.currentPhase === 'selecting') {
      return this.renderMainMenu(aspectColor);
    } else if (this.currentPhase === 'moves') {
      return this.renderMoveSelection(player, aspectColor);
    } else if (this.currentPhase === 'fraymotif') {
      return this.renderFragmotifSelection(player, aspectColor);
    } else if (this.currentPhase === 'items') {
      return this.renderItemsSelection(player, aspectColor);
    } else if (this.currentPhase === 'abscond_message') {
      return this.renderAbscondMessage(aspectColor);
    } else if (this.currentPhase === 'animating' || this.currentPhase === 'waiting_for_space') {
      return this.renderBattleLog();
    }

    return '';
  }

  renderFragmotifSelection(player, aspectColor) {
    const moves = player.moves || [];
    const heroAspect = this.gameState?.currentCharacter?.aspect || 'space';

    const getStatAbbreviation = (stat) => {
      const abbreviations = {
        'attack': 'ATK',
        'defense': 'DEF',
        'spAttack': 'SP ATK',
        'spDefense': 'SP DEF',
        'speed': 'SPD'
      };
      return abbreviations[stat] || stat.toUpperCase();
    };

    setTimeout(() => {
      moves.slice(0, 4).forEach((move, index) => {
        const moveButton = document.querySelector(`[data-fraymotif-index="${index}"]`);
        if (moveButton) {
          moveButton.innerHTML = '';

          const container = document.createElement('div');
          container.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';

          const nameCanvas = this.createPixelatedText(move.name, 'button');
          container.appendChild(nameCanvas);

          let moveInfo = '';
          if (move.power > 0) {
            moveInfo = `PWR: ${move.power}`;
          } else if (move.effect && move.effect.type === 'defenseBoost') {
            moveInfo = 'DEF Boost';
          } else if (move.effect && move.effect.type === 'heal') {
            moveInfo = `Heal ${move.effect.percent}%`;
          } else if (move.effect && move.effect.type === 'delayed') {
            moveInfo = 'Delayed ATK';
          } else if (move.effect && move.effect.type === 'selfKO') {
            moveInfo = 'Self KO';
          } else if (move.effect && move.effect.stats) {
            const statDesc = Object.entries(move.effect.stats).map(([stat, change]) => {
              return `${getStatAbbreviation(stat)} ${change > 0 ? '+' : ''}${change}`;
            }).join(', ');
            moveInfo = statDesc;
          } else {
            moveInfo = '---';
          }

          const infoContainer = document.createElement('div');
          infoContainer.style.cssText = 'display: flex; gap: 12px;';

          const typeCanvas = this.createPixelatedText(move.type.toUpperCase(), 'button');
          const infoCanvas = this.createPixelatedText(moveInfo, 'button');

          infoContainer.appendChild(typeCanvas);
          infoContainer.appendChild(infoCanvas);
          container.appendChild(infoContainer);

          moveButton.appendChild(container);
        }
      });

      const backButton = document.querySelector('.back-button');
      if (backButton) {
        backButton.innerHTML = '';
        const canvas = this.createPixelatedText('← BACK', 'button');
        backButton.appendChild(canvas);
      }
    }, 0);

    return `
      <div style="
        position: absolute;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 0;
        z-index: 10;
      ">
        ${moves.slice(0, 4).map((move, index) => `
          <button class="move-button" data-fraymotif-index="${index}" style="
            background: transparent;
            border: none;
            padding: 0;
            cursor: pointer;
            transition: all 0.2s;
            display: block;
          ">
          </button>
        `).join('')}
        <button class="back-button" style="
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          display: block;
        ">
        </button>
      </div>
    `;
  }

  createPixelatedText(text, presetOrConfig = 'command') {
    return this.textRenderer.createPixelatedText(text, presetOrConfig);
  }

  renderPixelatedText(text, color = '#fff', bgColor = '#000', shadowColor = null, shadowOffset = 1, scale = 8, dilate = false, customFontSize = null) {
    return this.textRenderer.renderPixelatedText(text, color, bgColor, shadowColor, shadowOffset, scale, dilate, customFontSize);
  }

  renderMainMenu(aspectColor) {
    const characterId = this.gameState.getCurrentCharacter().id;
    const strifeOptions = window.STRIFE_OPTIONS[characterId] || window.STRIFE_OPTIONS.opal;

    const buttons = strifeOptions.map(option => ({
      id: option.id,
      label: option.name,
      description: option.tooltip,
      image: 'aggrieve.png'
    }));

    setTimeout(() => {
      buttons.forEach(btn => {
        const buttonElement = document.querySelector(`[data-action="${btn.id}"]`);
        if (buttonElement) {
          buttonElement.innerHTML = '';
          const img = document.createElement('img');
          img.src = `/games/switch/images/battleUI/${btn.image}`;
          img.style.cssText = `
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
            display: block;
            width: 227px;
            height: 43px;
          `;
          buttonElement.appendChild(img);
        }
      });

      this.inputHandler.setupKeyboardNavigation();
    }, 0);

    return `
      <div style="
        position: absolute;
        left: 20px;
        bottom: 220px;
        display: flex;
        flex-direction: column;
        gap: 0;
        z-index: 10;
      ">
        ${buttons.map(btn => `
          <button class="action-button" data-action="${btn.id}" style="
            background: transparent;
            border: none;
            padding: 0;
            cursor: pointer;
            transition: all 0.2s;
            display: block;
          ">
          </button>
        `).join('')}
      </div>
    `;
  }

  renderAbscondMessage(aspectColor) {
    setTimeout(() => {
      const continueAction = () => {
        document.removeEventListener('keydown', handleSpaceKey);
        const messageDiv = this.container.querySelector('.abscond-message');
        if (messageDiv) {
          messageDiv.removeEventListener('click', continueAction);
        }
        this.currentPhase = 'selecting';
        this.commandPrompt = '==> What will you do?';
        this.focusedButtonIndex = 0;
        this.render();
      };

      const handleSpaceKey = (e) => {
        if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          continueAction();
        }
      };

      document.addEventListener('keydown', handleSpaceKey);

      setTimeout(() => {
        const messageDiv = this.container.querySelector('.abscond-message');
        if (messageDiv) {
          messageDiv.addEventListener('click', continueAction);
          messageDiv.style.cursor = 'pointer';
        }
      }, 10);
    }, 0);

    return `
      <div class="abscond-message" style="
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: transparent;
        border-top: 3px solid ${aspectColor};
        padding: 40px;
        text-align: center;
        color: #fff;
        font-family: 'Courier New', monospace;
        font-size: 18px;
      ">
        <div style="margin-bottom: 20px;">You can't abscond!</div>
        <div style="font-size: 14px; opacity: 0.7;">Press SPACE or CLICK to continue</div>
      </div>
    `;
  }

  renderItemsSelection(player, aspectColor) {
    setTimeout(() => {
      const backButton = document.querySelector('.back-button');
      if (backButton) {
        backButton.innerHTML = '';
        const canvas = this.createPixelatedText('← BACK', 'button');
        backButton.appendChild(canvas);
      }
    }, 0);

    return `
      <div style="
        position: absolute;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 0;
        z-index: 10;
      ">
        <button class="back-button" style="
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          display: block;
        ">
        </button>
      </div>
    `;
  }
  
  renderMoveSelection(player, aspectColor) {
    const moves = player.moves || [];
    const primaryAttack = moves[0];

    const getStatAbbreviation = (stat) => {
      const abbreviations = {
        'attack': 'ATK',
        'defense': 'DEF',
        'spAttack': 'SP ATK',
        'spDefense': 'SP DEF',
        'speed': 'SPD'
      };
      return abbreviations[stat] || stat.toUpperCase();
    };

    setTimeout(() => {
      for (let index = 0; index < 4; index++) {
        const moveButton = document.querySelector(`[data-move-index="${index}"]`);
        if (moveButton) {
          moveButton.innerHTML = '';

          if (index === 0 && primaryAttack) {
            const container = document.createElement('div');
            container.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';

            const nameCanvas = this.createPixelatedText(primaryAttack.name, 'button');
            container.appendChild(nameCanvas);

            let moveInfo = '';
            if (primaryAttack.power > 0) {
              moveInfo = `PWR: ${primaryAttack.power}`;
            } else if (primaryAttack.effect && primaryAttack.effect.type === 'defenseBoost') {
              moveInfo = 'DEF Boost';
            } else if (primaryAttack.effect && primaryAttack.effect.type === 'heal') {
              moveInfo = `Heal ${primaryAttack.effect.percent}%`;
            } else if (primaryAttack.effect && primaryAttack.effect.type === 'delayed') {
              moveInfo = 'Delayed ATK';
            } else if (primaryAttack.effect && primaryAttack.effect.type === 'selfKO') {
              moveInfo = 'Self KO';
            } else if (primaryAttack.effect && primaryAttack.effect.stats) {
              const statDesc = Object.entries(primaryAttack.effect.stats).map(([stat, change]) => {
                return `${getStatAbbreviation(stat)} ${change > 0 ? '+' : ''}${change}`;
              }).join(', ');
              moveInfo = statDesc;
            } else {
              moveInfo = '---';
            }

            const infoContainer = document.createElement('div');
            infoContainer.style.cssText = 'display: flex; gap: 12px;';

            const typeCanvas = this.createPixelatedText(primaryAttack.type.toUpperCase(), 'button');
            const infoCanvas = this.createPixelatedText(moveInfo, 'button');

            infoContainer.appendChild(typeCanvas);
            infoContainer.appendChild(infoCanvas);
            container.appendChild(infoContainer);

            moveButton.appendChild(container);
          } else {
            const emptyCanvas = this.createPixelatedText('---', 'button');
            moveButton.appendChild(emptyCanvas);
          }
        }
      }

      const backButton = document.querySelector('.back-button');
      if (backButton) {
        backButton.innerHTML = '';
        const canvas = this.createPixelatedText('← BACK', 'button');
        backButton.appendChild(canvas);
      }
    }, 0);

    return `
      <div style="
        position: absolute;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 0;
        z-index: 10;
      ">
        ${[0, 1, 2, 3].map((index) => `
          <button class="move-button" data-move-index="${index}" style="
            background: transparent;
            border: none;
            padding: 0;
            cursor: pointer;
            transition: all 0.2s;
            display: block;
          ">
          </button>
        `).join('')}
        <button class="back-button" style="
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          display: block;
        ">
        </button>
      </div>
    `;
  }
  
  renderBattleLog() {
    const messagesHTML = this.battleMessages.map(msg => {
      const color = typeof msg === 'string' ? '#0f0' : (msg.color || '#0f0');
      const text = typeof msg === 'string' ? msg : msg.text;
      return `<div style="margin-bottom: 4px; color: ${color};">${text}</div>`;
    }).join('');

    return `
      <div class="battle-log" style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        background: transparent;
        border-bottom: 3px solid #0f0;
        padding: 20px;
        max-height: 150px;
        overflow-y: auto;
        font-family: 'Courier New', monospace;
        color: #0f0;
      ">
        <div id="combatLogContent">${messagesHTML}</div>
      </div>
    `;
  }
  
  attachMoveHandlers() {
    const actionButtons = this.container.querySelectorAll('.action-button');
    actionButtons.forEach((button, index) => {
      button.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        if (this.onStrifeAction) {
          this.onStrifeAction(action);
        }
      });

      button.addEventListener('mouseenter', (e) => {
        const allButtons = this.inputHandler.getNavigableButtons();
        const buttonIndex = allButtons.indexOf(e.currentTarget);
        if (buttonIndex !== -1) {
          this.focusedButtonIndex = buttonIndex;
          this.inputHandler.updateButtonFocus(allButtons);
        }
      });

      button.addEventListener('mouseleave', (e) => {
        // Keep the focus on this button for keyboard nav continuity
      });
    });

    const moveButtons = this.container.querySelectorAll('.move-button');
    moveButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const moveIndex = parseInt(e.currentTarget.dataset.moveIndex);
        const fraymotifIndex = parseInt(e.currentTarget.dataset.fraymotifIndex);

        if (!isNaN(moveIndex)) {
          this.handleMoveSelection(moveIndex);
        } else if (!isNaN(fraymotifIndex)) {
          this.handleMoveSelection(fraymotifIndex);
        }
      });

      button.addEventListener('mouseenter', (e) => {
        const allButtons = this.inputHandler.getNavigableButtons();
        const buttonIndex = allButtons.indexOf(e.currentTarget);
        if (buttonIndex !== -1) {
          this.focusedButtonIndex = buttonIndex;
          this.inputHandler.updateButtonFocus(allButtons);
        }
      });

      button.addEventListener('mouseleave', (e) => {
        // Keep the focus on this button for keyboard nav continuity
      });
    });

    const backButton = this.container.querySelector('.back-button');
    if (backButton) {
      backButton.addEventListener('click', () => {
        this.currentPhase = 'selecting';
        this.commandPrompt = '==> What will you do?';
        this.render();
      });

      backButton.addEventListener('mouseenter', () => {
        const allButtons = this.inputHandler.getNavigableButtons();
        const buttonIndex = allButtons.indexOf(backButton);
        if (buttonIndex !== -1) {
          this.focusedButtonIndex = buttonIndex;
          this.inputHandler.updateButtonFocus(allButtons);
        }
      });

      backButton.addEventListener('mouseleave', () => {
        // Keep the focus on this button for keyboard nav continuity
      });
    }
  }
  



  
  handleMoveSelection(moveIndex) {
    this.currentPhase = 'animating';
    this.commandPrompt = '==> Engaging in STRIFE...';
    this.render();
    
    if (this.onMoveSelected) {
      this.onMoveSelected(moveIndex);
    }
  }
  
  updateCombatData(combatData) {
    if (!combatData) return;

    const oldPlayerHP = this.lastPlayerHP !== null ? this.lastPlayerHP : combatData.player.hp;
    const oldEnemyHP = this.lastEnemyHP !== null ? this.lastEnemyHP : combatData.enemy.hp;

    this.combatData = combatData;

    if (oldPlayerHP !== combatData.player.hp) {
      this.animations.animateHealthBar('player', oldPlayerHP, combatData.player.hp, combatData.player.maxHp, this.container);
    }

    if (oldEnemyHP !== combatData.enemy.hp) {
      this.animations.animateHealthBar('enemy', oldEnemyHP, combatData.enemy.hp, combatData.enemy.maxHp, this.container);
    }

    this.lastPlayerHP = combatData.player.hp;
    this.lastEnemyHP = combatData.enemy.hp;
  }



  updateHealthBars() {
    if (!this.combatData) return;

    const { player, enemy } = this.combatData;
    const playerHPPercent = (player.hp / player.maxHp) * 100;
    const enemyHPPercent = (enemy.hp / enemy.maxHp) * 100;

    const playerDamageBar = this.container.querySelector('.player-panel .hp-bar > div > div:first-child');
    const playerHealthBar = this.container.querySelector('.player-panel .hp-bar > div > div:last-child');
    const enemyDamageBar = this.container.querySelector('.enemy-panel .hp-bar > div > div:first-child');
    const enemyHealthBar = this.container.querySelector('.enemy-panel .hp-bar > div > div:last-child');
    const enemyHPBar = this.container.querySelector('.enemy-panel .hp-bar');

    if (playerDamageBar && playerHealthBar) {
      playerDamageBar.style.width = `${100 - playerHPPercent}%`;
      playerHealthBar.style.width = `${playerHPPercent}%`;
    }

    if (enemyDamageBar && enemyHealthBar) {
      enemyDamageBar.style.width = `${100 - enemyHPPercent}%`;
      enemyHealthBar.style.width = `${enemyHPPercent}%`;
    }

    if (enemyHPBar) {
      enemyHPBar.style.left = `calc(${enemyHPPercent - 100}% + 3px)`;
    }
  }

  addLogMessage(message, color = '#0f0') {
    this.textRenderer.addLogMessage(message, color, () => this.render(), this.container);
  }



  showStrifeTitle(callback) {
    this.animations.showStrifeTitle(callback);
  }

  playDamageAnimation(isPlayer = false) {
    this.animations.playDamageAnimation(isPlayer);
  }

  playVictoryAnimation(callback) {
    this.animations.playVictoryAnimation(
      callback,
      (prompt) => {
        this.commandPrompt = prompt;
      }
    );
  }

  playAttackAnimation(isPlayer = false, callback) {
    this.animations.playAttackAnimation(isPlayer, callback);
  }

  waitForInput(callback, timeout = 5000) {
    this.textRenderer.waitForInput(callback, this.container, timeout);
  }

  showMultiHitMessages(attackerName, moveName, hitData, finalCallback) {
    const context = {
      onRender: () => this.render(),
      container: this.container,
      onUpdateCombatData: () => {
        this.updateCombatData({
          player: this.gameState.combatSystem.player,
          enemy: this.gameState.combatSystem.enemy
        });
      }
    };

    this.textRenderer.showMultiHitMessages(attackerName, moveName, hitData, finalCallback, context);
  }

}

export { BattleUI };