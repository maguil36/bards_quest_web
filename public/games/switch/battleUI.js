class BattleUI {
  constructor(gameState) {
    this.gameState = gameState;
    this.container = null;
    this.isVisible = false;
    this.currentPhase = 'selecting';
    this.animating = false;
    this.commandPrompt = '';
    this.battleMessages = [];
    this.focusedButtonIndex = 0;
    this.keyboardNavigationEnabled = true;

    this.aspectColors = {
      space: '#000000',
      time: '#ff0000',
      breath: '#00d5f2',
      light: '#f2a400',
      heart: '#ff00ff',
      mind: '#008141',
      life: '#4ac925',
      doom: '#497e15',
      blood: '#a10000',
      rage: '#6a006a',
      void: '#0715cd',
      hope: '#ffffff',
    };

    this.pixelatedTextConfig = {
      fontFamily: '"Courier New", monospace',
      fontWeight: '900',
      baseFontSize: 14,
      scale: 8,
      opacityThreshold: 200,
      removeIsolatedPixels: true,
      minNeighbors: 8,

      presets: {
        strife: {
          color: '#ffcd00',
          shadowColor: '#FF3601',
          shadowOffset: 1,
          bgColor: null,
          scale: 8,
          dilate: false
        },
        command: {
          color: '#fff',
          bgColor: '#000',
          shadowColor: null,
          shadowOffset: 0,
          scale: 1
        },
        button: {
          color: '#fff',
          bgColor: '#000',
          shadowColor: null,
          shadowOffset: 0,
          scale: 1
        }
      }
    };

    this.bitmapFont = new BitmapFontRenderer({
      fontFamily: this.pixelatedTextConfig.fontFamily,
      fontWeight: this.pixelatedTextConfig.fontWeight,
      baseFontSize: this.pixelatedTextConfig.baseFontSize,
      scale: this.pixelatedTextConfig.scale,
      opacityThreshold: this.pixelatedTextConfig.opacityThreshold
    });

    this.init();
  }
  
  init() {
    this.container = document.getElementById('combatUI');
    if (!this.container) {
      console.error('Combat UI container not found');
      return;
    }
    
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
    if (this.keyboardEventListener) {
      document.removeEventListener('keydown', this.keyboardEventListener);
      this.keyboardEventListener = null;
    }
  }
  
  playIntroAnimation(callback) {
    this.container.classList.add('battle-flash');
    this.commandPrompt = `==> ${this.combatData.player.name}: Engage in STRIFE!`;
    this.render();
    
    setTimeout(() => {
      this.container.classList.remove('battle-flash');
      if (callback) callback();
    }, 600);
  }
  
  getAspectColor(characterId) {
    const aspectMap = {
      opal: 'space',
      alexis: 'rage',
      tyson: 'doom',
      chloe: 'life',
      isabell: 'blood',
      nicholas: 'light',
      austine: 'mind',
      victor: 'time',
    };
    
    const aspect = aspectMap[characterId] || 'void';
    return this.aspectColors[aspect];
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
    this.setupKeyboardNavigation();
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
    const aspectMap = {
      opal: 'space',
      alexis: 'rage',
      tyson: 'doom',
      chloe: 'life',
      isabell: 'blood',
      nicholas: 'light',
      austine: 'mind',
      victor: 'time'
    };

    const heroAspect = aspectMap[player?.id] || 'space';

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
    } else if (this.currentPhase === 'animating') {
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
    let config;

    if (typeof presetOrConfig === 'string') {
      config = this.pixelatedTextConfig.presets[presetOrConfig];
      if (!config) {
        console.warn(`Preset "${presetOrConfig}" not found, using default`);
        config = this.pixelatedTextConfig.presets.command;
      }
    } else {
      config = presetOrConfig;
    }

    return this.renderPixelatedText(
      text,
      config.color,
      config.bgColor,
      config.shadowColor,
      config.shadowOffset || 0,
      config.scale || this.pixelatedTextConfig.scale,
      config.dilate || false,
      config.baseFontSize || this.pixelatedTextConfig.baseFontSize
    );
  }

  renderPixelatedText(text, color = '#fff', bgColor = '#000', shadowColor = null, shadowOffset = 1, scale = 8, dilate = false, customFontSize = null) {
    return this.bitmapFont.renderText(text, color, bgColor, shadowColor, shadowOffset, scale, dilate, customFontSize);
  }

  renderMainMenu(aspectColor) {
    const buttons = [
      { id: 'aggrieve', label: 'AGGRIEVE', description: 'Attack the enemy', image: 'aggrieve.png' },
      { id: 'abuse', label: 'ABUSE', description: 'Use items', image: 'abuse.png' },
      { id: 'assault', label: 'ASSAULT', description: 'Access fraymotifs', image: 'assault.png' },
      { id: 'abscond', label: 'ABSCOND', description: 'Flee from battle', image: 'abscond.png' }
    ];

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
        bottom: 0;
        left: 0;
        right: 0;
        background: transparent;
        border-top: 3px solid #0f0;
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
        this.handleAction(action);
      });

      button.addEventListener('mouseenter', (e) => {
        const allButtons = this.getNavigableButtons();
        const buttonIndex = allButtons.indexOf(e.currentTarget);
        if (buttonIndex !== -1) {
          this.focusedButtonIndex = buttonIndex;
          this.updateButtonFocus(allButtons);
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
        const allButtons = this.getNavigableButtons();
        const buttonIndex = allButtons.indexOf(e.currentTarget);
        if (buttonIndex !== -1) {
          this.focusedButtonIndex = buttonIndex;
          this.updateButtonFocus(allButtons);
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
        const allButtons = this.getNavigableButtons();
        const buttonIndex = allButtons.indexOf(backButton);
        if (buttonIndex !== -1) {
          this.focusedButtonIndex = buttonIndex;
          this.updateButtonFocus(allButtons);
        }
      });

      backButton.addEventListener('mouseleave', () => {
        // Keep the focus on this button for keyboard nav continuity
      });
    }
  }
  
  handleAction(action) {
    switch (action) {
      case 'aggrieve':
        this.currentPhase = 'moves';
        this.commandPrompt = '==> Choose your attack!';
        this.focusedButtonIndex = 0;
        this.render();
        break;
      case 'abscond':
        this.currentPhase = 'abscond_message';
        this.commandPrompt = '==> You can\'t abscond!';
        this.focusedButtonIndex = 0;
        this.render();
        break;
      case 'abuse':
        this.currentPhase = 'items';
        this.commandPrompt = '==> Choose an item!';
        this.focusedButtonIndex = 0;
        this.render();
        break;
      case 'assault':
        this.currentPhase = 'fraymotif';
        this.commandPrompt = '==> Choose your fraymotif!';
        this.focusedButtonIndex = 0;
        this.render();
        break;
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
    // Store HP from our last saved state, not from combatData
    const oldPlayerHP = this.lastPlayerHP;
    const oldEnemyHP = this.lastEnemyHP;
    const newPlayerHP = combatData.player.hp;
    const newEnemyHP = combatData.enemy.hp;

    // Save current HP for next comparison
    this.lastPlayerHP = newPlayerHP;
    this.lastEnemyHP = newEnemyHP;

    this.combatData = combatData;
    this.render();

    // Animate health bars after render completes
    if (oldPlayerHP !== undefined && oldPlayerHP !== newPlayerHP) {
      setTimeout(() => {
        this.animateHealthBar('player', oldPlayerHP, newPlayerHP, combatData.player.maxHp);
      }, 10);
    }

    if (oldEnemyHP !== undefined && oldEnemyHP !== newEnemyHP) {
      setTimeout(() => {
        this.animateHealthBar('enemy', oldEnemyHP, newEnemyHP, combatData.enemy.maxHp);
      }, 10);
    }
  }

  animateHealthBar(type, oldHP, newHP, maxHP) {
    const oldPercent = (oldHP / maxHP) * 100;

    if (type === 'player') {
      const playerDamageBar = this.container.querySelector('.player-panel .hp-bar > div > div:first-child');
      const playerHealthBar = this.container.querySelector('.player-panel .hp-bar > div > div:last-child');

      if (playerDamageBar && playerHealthBar) {
        playerDamageBar.style.width = `${100 - oldPercent}%`;
        playerHealthBar.style.width = `${oldPercent}%`;
      }
    } else if (type === 'enemy') {
      const enemyDamageBar = this.container.querySelector('.enemy-panel .hp-bar > div > div:first-child');
      const enemyHealthBar = this.container.querySelector('.enemy-panel .hp-bar > div > div:last-child');
      const enemyHPBar = this.container.querySelector('.enemy-panel .hp-bar');

      if (enemyDamageBar && enemyHealthBar) {
        enemyDamageBar.style.width = `${100 - oldPercent}%`;
        enemyHealthBar.style.width = `${oldPercent}%`;
      }

      if (enemyHPBar) {
        enemyHPBar.style.left = `calc(${oldPercent - 100}% + 3px)`;
      }
    }

    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentHP = oldHP + (newHP - oldHP) * easeProgress;
      const hpPercent = (currentHP / maxHP) * 100;

      if (type === 'player') {
        const playerDamageBar = this.container.querySelector('.player-panel .hp-bar > div > div:first-child');
        const playerHealthBar = this.container.querySelector('.player-panel .hp-bar > div > div:last-child');

        if (playerDamageBar && playerHealthBar) {
          playerDamageBar.style.width = `${100 - hpPercent}%`;
          playerHealthBar.style.width = `${hpPercent}%`;
        }
      } else if (type === 'enemy') {
        const enemyDamageBar = this.container.querySelector('.enemy-panel .hp-bar > div > div:first-child');
        const enemyHealthBar = this.container.querySelector('.enemy-panel .hp-bar > div > div:last-child');
        const enemyHPBar = this.container.querySelector('.enemy-panel .hp-bar');

        if (enemyDamageBar && enemyHealthBar) {
          enemyDamageBar.style.width = `${100 - hpPercent}%`;
          enemyHealthBar.style.width = `${hpPercent}%`;
        }

        if (enemyHPBar) {
          enemyHPBar.style.left = `calc(${hpPercent - 100}% + 3px)`;
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  animateHealthBar(type, oldHP, newHP, maxHP) {
    const duration = 2000; // 2000ms (2 second) animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out function
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentHP = oldHP + (newHP - oldHP) * easeProgress;
      const hpPercent = (currentHP / maxHP) * 100;

      if (type === 'player') {
        const playerDamageBar = this.container.querySelector('.player-panel .hp-bar > div > div:first-child');
        const playerHealthBar = this.container.querySelector('.player-panel .hp-bar > div > div:last-child');

        if (playerDamageBar && playerHealthBar) {
          playerDamageBar.style.width = `${100 - hpPercent}%`;
          playerHealthBar.style.width = `${hpPercent}%`;
        }
      } else if (type === 'enemy') {
        const enemyDamageBar = this.container.querySelector('.enemy-panel .hp-bar > div > div:first-child');
        const enemyHealthBar = this.container.querySelector('.enemy-panel .hp-bar > div > div:last-child');
        const enemyHPBar = this.container.querySelector('.enemy-panel .hp-bar');

        if (enemyDamageBar && enemyHealthBar) {
          enemyDamageBar.style.width = `${100 - hpPercent}%`;
          enemyHealthBar.style.width = `${hpPercent}%`;
        }

        if (enemyHPBar) {
          enemyHPBar.style.left = `calc(${hpPercent - 100}% + 3px)`;
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
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
    this.battleMessages.push({ text: `> ${message}`, color: color });
    this.render();

    const logContent = document.getElementById('combatLogContent');
    if (logContent) {
      logContent.scrollTop = logContent.scrollHeight;
    }
  }

  typewriterEffect(element, text, speed = 50, callback) {
    element.textContent = text;
    element.style.opacity = '1';
    if (callback) {
      callback();
    }
  }

  showStrifeTitle(callback) {
    const strifeOverlay = document.createElement('div');
    strifeOverlay.id = 'strifeOverlay';
    strifeOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 120;
      animation: fadeIn 0.3s ease-out;
    `;

    const strifeImage = document.createElement('img');
    strifeImage.src = '/games/switch/images/battleUI/strife.png';
    strifeImage.style.cssText = `
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: crisp-edges;
    `;
    strifeOverlay.appendChild(strifeImage);
    document.body.appendChild(strifeOverlay);

    setTimeout(() => {
      strifeOverlay.style.animation = 'fadeOut 0.5s ease-out';
      setTimeout(() => {
        document.body.removeChild(strifeOverlay);
        if (callback) callback();
      }, 500);
    }, 1500);
  }

  playDamageAnimation(isPlayer = false) {
    const panel = isPlayer ? '.player-panel' : '.enemy-panel';
    const element = this.container.querySelector(panel);
    if (element) {
      element.classList.add('damage-shake');
      setTimeout(() => {
        element.classList.remove('damage-shake');
      }, 500);
    }
  }

  playVictoryAnimation(callback) {
    this.container.classList.add('victory-flash');
    this.commandPrompt = '==> VICTORY! You gained GRIST!';

    setTimeout(() => {
      this.container.classList.remove('victory-flash');
      if (callback) callback();
    }, 1500);
  }

  playAttackAnimation(isPlayer = false, callback) {
    const attackerPanel = isPlayer ? '.player-sprite' : '.enemy-sprite';
    const defenderPanel = isPlayer ? '.enemy-panel' : '.player-panel';

    const attacker = this.container.querySelector(attackerPanel);
    const defender = this.container.querySelector(defenderPanel);

    if (attacker && defender) {
      const originalTransform = attacker.style.transform;

      if (isPlayer) {
        attacker.style.transition = 'transform 0.2s ease-out';
        attacker.style.transform = 'translateX(50px) scale(1.3)';

        setTimeout(() => {
          defender.classList.add('damage-shake');
          attacker.style.transform = originalTransform || '';

          setTimeout(() => {
            defender.classList.remove('damage-shake');
            attacker.style.transition = '';
            if (callback) callback();
          }, 500);
        }, 200);
      } else {
        attacker.style.transition = 'transform 0.2s ease-out';
        attacker.style.transform = 'translateX(-50px) scale(1.3)';

        setTimeout(() => {
          defender.classList.add('damage-shake');
          attacker.style.transform = originalTransform || '';

          setTimeout(() => {
            defender.classList.remove('damage-shake');
            attacker.style.transition = '';
            if (callback) callback();
          }, 500);
        }, 200);
      }
    } else if (callback) {
      callback();
    }
  }

  waitForInput(callback, timeout = 3000) {
    let resolved = false;

    const continuePrompt = document.createElement('div');
    continuePrompt.id = 'continuePrompt';
    continuePrompt.style.cssText = `
      position: absolute;
      bottom: 10px;
      right: 10px;
      color: #00ff00;
      font-size: 12px;
      animation: pulse 1s ease-in-out infinite;
    `;
    continuePrompt.textContent = 'Press SPACE to continue...';
    this.container.appendChild(continuePrompt);

    const handleInput = (e) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        if (!resolved) {
          resolved = true;
          cleanup();
          if (callback) callback();
        }
      }
    };

    const cleanup = () => {
      document.removeEventListener('keydown', handleInput);
      if (continuePrompt && continuePrompt.parentNode) {
        continuePrompt.parentNode.removeChild(continuePrompt);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };

    document.addEventListener('keydown', handleInput);

    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        if (callback) callback();
      }
    }, timeout);
  }

  setupKeyboardNavigation() {
    if (this.keyboardEventListener) {
      document.removeEventListener('keydown', this.keyboardEventListener);
    }

    this.keyboardEventListener = (e) => {
      if (!this.keyboardNavigationEnabled) return;

      const buttons = this.getNavigableButtons();
      if (buttons.length === 0) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        this.focusedButtonIndex = (this.focusedButtonIndex - 1 + buttons.length) % buttons.length;
        this.updateButtonFocus(buttons);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        this.focusedButtonIndex = (this.focusedButtonIndex + 1) % buttons.length;
        this.updateButtonFocus(buttons);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (buttons[this.focusedButtonIndex]) {
          buttons[this.focusedButtonIndex].click();
        }
      }
    };

    document.addEventListener('keydown', this.keyboardEventListener);

    const buttons = this.getNavigableButtons();
    if (buttons.length > 0) {
      this.updateButtonFocus(buttons);
    }
  }

  getNavigableButtons() {
    const actionButtons = Array.from(this.container.querySelectorAll('.action-button'));
    const moveButtons = Array.from(this.container.querySelectorAll('.move-button'));
    const backButtons = Array.from(this.container.querySelectorAll('.back-button'));

    return [...actionButtons, ...moveButtons, ...backButtons].filter(btn =>
      btn.offsetParent !== null
    );
  }

  updateButtonFocus(buttons) {
    buttons.forEach((btn, index) => {
      if (index === this.focusedButtonIndex) {
        btn.style.transform = 'scale(1.05)';
        btn.style.boxShadow = '0 0 20px currentColor';
      } else {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = 'none';
      }
    });
  }
}