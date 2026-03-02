class BattleAnimations {
  constructor() {
    this.container = null;
  }

  setContainer(container) {
    this.container = container;
  }

  playIntroAnimation(callback, commandPromptCallback, playerName) {
    if (!this.container) return;

    console.log('[INTRO] Starting intro animation');

    const backgroundImage = new Image();
    backgroundImage.src = '/games/switch/images/battleUI/derse.png';

    backgroundImage.onload = () => {
      console.log('[INTRO] Background image preloaded');
      this.startIntroSequence(callback, commandPromptCallback, playerName);
    };

    backgroundImage.onerror = () => {
      console.warn('[INTRO] Background image failed to load, continuing anyway');
      this.startIntroSequence(callback, commandPromptCallback, playerName);
    };
  }

  startIntroSequence(callback, commandPromptCallback, playerName) {
    console.log('[INTRO] Starting intro sequence');

    const fadeToBlack = document.createElement('div');
    fadeToBlack.id = 'fadeToBlack';
    fadeToBlack.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 1);
      z-index: 198;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.5s ease-in;
    `;
    document.body.appendChild(fadeToBlack);
    console.log('[INTRO] Fade to black element created at z-index 198');

    requestAnimationFrame(() => {
      fadeToBlack.style.opacity = '1';
      console.log('[INTRO] Fade to black started - opacity set to 1');
    });

    let blackBackground;
    setTimeout(() => {
      blackBackground = document.createElement('div');
      blackBackground.id = 'blackBackground';
      blackBackground.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 1);
        z-index: 199;
        pointer-events: none;
        opacity: 1;
        transition: opacity 0.5s ease-out;
      `;
      document.body.appendChild(blackBackground);
      console.log('[INTRO] Black background created after fade complete');

      if (document.body.contains(fadeToBlack)) {
        document.body.removeChild(fadeToBlack);
        console.log('[INTRO] Fade to black element removed (covered by black background)');
      }
    }, 500);

    const strifeContainer = document.createElement('div');
    strifeContainer.id = 'strifeContainer';
    strifeContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 200;
      pointer-events: none;
    `;

    const strifeImage = document.createElement('img');
    strifeImage.src = '/games/switch/images/battleUI/strife.png';
    strifeImage.style.cssText = `
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: crisp-edges;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0;
    `;
    strifeContainer.appendChild(strifeImage);
    document.body.appendChild(strifeContainer);

    console.log('[INTRO] STRIFE container created (hidden)');

    this.container.style.background = 'transparent';
    this.container.style.opacity = '0';

    setTimeout(() => {
      strifeImage.style.opacity = '1';
      this.container.style.opacity = '1';
      console.log('[INTRO] STRIFE and background revealed after fade complete');
    }, 500);

    const playerSprite = this.container.querySelector('.player-sprite-container');
    const enemySprite = this.container.querySelector('.enemy-sprite-container');
    const enemyPanel = this.container.querySelector('.enemy-panel');
    const actionsContainer = this.container.querySelector('.actions');

    console.log('[INTRO] actionsContainer found:', actionsContainer);

    if (playerSprite) {
      playerSprite.style.transition = 'none';
      playerSprite.style.transform = 'translateX(-300px)';
      playerSprite.style.opacity = '1';
    }
    if (enemySprite) {
      enemySprite.style.transition = 'none';
      enemySprite.style.transform = 'translateX(300px)';
      enemySprite.style.opacity = '1';
    }
    if (enemyPanel) {
      enemyPanel.style.transition = 'none';
      enemyPanel.style.transform = 'translateX(300px)';
      enemyPanel.style.opacity = '1';
    }

    if (actionsContainer) {
      actionsContainer.style.transition = 'none';
      actionsContainer.style.transform = 'translateX(-400px)';
      actionsContainer.style.opacity = '0';
      console.log('[INTRO] actionsContainer positioned off-screen:', actionsContainer.style.transform);
    } else {
      console.warn('[INTRO] actionsContainer NOT FOUND!');
    }

    console.log('[INTRO] Elements positioned off-screen');

    setTimeout(() => {
      console.log('[INTRO] 1800ms: Starting STRIFE slide to top');
      strifeImage.style.transition = 'top 2s ease-in-out, transform 2s ease-in-out';
      strifeImage.style.top = '10%';
      strifeImage.style.transform = 'translate(-50%, 0)';

      setTimeout(() => {
        console.log('[INTRO] 2300ms: Fading out black background');
        blackBackground.style.opacity = '0';
        console.log('[INTRO] Set black background opacity to 0');
      }, 500);

      console.log('[INTRO] 1800ms: Starting character slide in');
      if (playerSprite) {
        playerSprite.style.transition = 'transform 1s ease-out';
        playerSprite.style.transform = 'translateX(0)';
      }
      if (enemySprite) {
        enemySprite.style.transition = 'transform 1s ease-out';
        enemySprite.style.transform = 'translateX(0)';
      }
      if (enemyPanel) {
        enemyPanel.style.transition = 'transform 1s ease-out';
        enemyPanel.style.transform = 'translateX(0)';
      }
    }, 1800);

    setTimeout(() => {
      console.log('[INTRO] 4300ms: Fading out STRIFE image after 0.5s pause');
      strifeImage.style.transition = 'opacity 0.5s ease-out';
      strifeImage.style.opacity = '0';
    }, 4300);

    setTimeout(() => {
      console.log('[INTRO] 4800ms: Starting action buttons slide-in animation');
      const actionsContainer = this.container.querySelector('.actions');
      console.log('[INTRO] actionsContainer at slide-in:', actionsContainer);
      if (actionsContainer) {
        console.log('[INTRO] Before slide-in - transform:', actionsContainer.style.transform, 'opacity:', actionsContainer.style.opacity);
        actionsContainer.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
        actionsContainer.style.transform = 'translateX(0)';
        actionsContainer.style.opacity = '1';
        console.log('[INTRO] After slide-in - transform:', actionsContainer.style.transform, 'opacity:', actionsContainer.style.opacity);
      } else {
        console.warn('[INTRO] actionsContainer NOT FOUND at slide-in time!');
      }
    }, 4800);

    setTimeout(() => {
      console.log('[INTRO] 5400ms: Playing glossy shine effect');
      const actionsContainer = this.container.querySelector('.actions');
      console.log('[INTRO] actionsContainer at shine:', actionsContainer);
      if (actionsContainer) {
        console.log('[INTRO] Setting up shine effect...');

        const rect = actionsContainer.getBoundingClientRect();
        console.log('[INTRO] Actions container position:', rect);

        const clipWrapper = document.createElement('div');
        clipWrapper.style.cssText = `
          position: fixed;
          top: ${rect.top}px;
          left: ${rect.left}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          overflow: hidden;
          pointer-events: none;
          z-index: 99999;
        `;

        const shine = document.createElement('div');
        shine.id = 'shineEffect';
        shine.style.cssText = `
          position: absolute;
          top: 0;
          left: ${-rect.width}px;
          width: ${rect.width * 0.5}px;
          height: 100%;
          background: linear-gradient(90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.9) 50%,
            rgba(255, 255, 255, 0) 100%);
          pointer-events: none;
          transform: skewX(-20deg);
          box-shadow: 0 0 50px rgba(255, 255, 255, 0.8);
        `;

        clipWrapper.appendChild(shine);
        document.body.appendChild(clipWrapper);
        console.log('[INTRO] Shine element created with clipping wrapper');

        requestAnimationFrame(() => {
          shine.style.transition = 'left 1.2s ease-in-out';
          shine.style.left = `${rect.width}px`;
          console.log('[INTRO] Shine animation started');
        });

        setTimeout(() => {
          if (document.body.contains(clipWrapper)) {
            document.body.removeChild(clipWrapper);
            console.log('[INTRO] Shine element removed');
          }
        }, 1300);
      } else {
        console.warn('[INTRO] actionsContainer not found for shine effect');
      }

      if (commandPromptCallback) {
        console.log('[INTRO] Command prompt callback triggered');
        commandPromptCallback(`==> ${playerName}: Engage in STRIFE!`);
      }

      setTimeout(() => {
        console.log('[INTRO] 6400ms: Removing layers and calling completion callback');
        document.body.removeChild(blackBackground);
        document.body.removeChild(strifeContainer);
        this.container.style.background = '';
        if (callback) callback();
      }, 1000);
    }, 5400);
  }

  playAttackAnimation(isPlayer = false, moveData = null, callback) {
    if (typeof moveData === 'function') {
      callback = moveData;
      moveData = null;
    }

    console.log('[ANIMATION] playAttackAnimation called with:', { isPlayer, moveData, hasCallback: !!callback });

    if (!this.container) {
      if (callback) callback();
      return;
    }

    const attackerSprite = isPlayer ? '.player-sprite' : '.enemy-sprite';
    const defenderSprite = isPlayer ? '.enemy-sprite' : '.player-sprite';
    const defenderPanel = isPlayer ? '.enemy-panel' : '.player-panel';

    const attacker = this.container.querySelector(attackerSprite);
    const defender = this.container.querySelector(defenderSprite);
    const defenderPanelEl = this.container.querySelector(defenderPanel);

    if (!attacker) {
      console.log('[ANIMATION] Attacker sprite not found');
      if (callback) callback();
      return;
    }

    if (moveData && moveData.effect && moveData.effect.type === 'statChange') {
      console.log('[ANIMATION] Playing stat change animation, target:', moveData.effect.target);
      if (moveData.effect.target === 'self') {
        this.playBuffAnimation(attacker, isPlayer, callback);
      } else if (moveData.effect.target === 'enemy') {
        this.playDebuffAnimation(defender, isPlayer, callback);
      } else {
        if (callback) callback();
      }
    } else if (moveData && moveData.type === 'special' && moveData.power > 0) {
      console.log('[ANIMATION] Playing special ranged attack animation');
      this.playRangedAttackAnimation(attacker, defender, defenderPanelEl, isPlayer, callback);
    } else if (moveData && moveData.type === 'physical' && moveData.power > 0) {
      console.log('[ANIMATION] Playing physical attack animation');
      this.playPhysicalAttackAnimation(attacker, defender, defenderPanelEl, isPlayer, true, callback);
    } else {
      console.log('[ANIMATION] Playing default physical attack animation');
      this.playPhysicalAttackAnimation(attacker, defender, defenderPanelEl, isPlayer, true, callback);
    }
  }

  playAttackAnimationWithResult(isPlayer = false, moveData = null, didHit = true, callback) {
    console.log('[ANIMATION] playAttackAnimationWithResult called with:', { isPlayer, moveData, didHit, hasCallback: !!callback });

    if (!this.container) {
      if (callback) callback();
      return;
    }

    const attackerSprite = isPlayer ? '.player-sprite' : '.enemy-sprite';
    const defenderSprite = isPlayer ? '.enemy-sprite' : '.player-sprite';
    const defenderPanel = isPlayer ? '.enemy-panel' : '.player-panel';

    const attacker = this.container.querySelector(attackerSprite);
    const defender = this.container.querySelector(defenderSprite);
    const defenderPanelEl = this.container.querySelector(defenderPanel);

    if (!attacker) {
      console.log('[ANIMATION] Attacker sprite not found');
      if (callback) callback();
      return;
    }

    if (moveData && moveData.effect && moveData.effect.type === 'statChange') {
      console.log('[ANIMATION] Playing stat change animation, target:', moveData.effect.target);
      if (moveData.effect.target === 'self') {
        this.playBuffAnimation(attacker, isPlayer, callback);
      } else if (moveData.effect.target === 'enemy') {
        this.playDebuffAnimation(defender, isPlayer, callback);
      } else {
        if (callback) callback();
      }
    } else if (moveData && moveData.type === 'special' && moveData.power > 0) {
      console.log('[ANIMATION] Playing special ranged attack animation with hit:', didHit);
      this.playRangedAttackAnimation(attacker, defender, defenderPanelEl, isPlayer, callback);
    } else if (moveData && moveData.type === 'physical' && moveData.power > 0) {
      console.log('[ANIMATION] Playing physical attack animation with hit:', didHit);
      this.playPhysicalAttackAnimation(attacker, defender, defenderPanelEl, isPlayer, didHit, callback);
    } else {
      console.log('[ANIMATION] Playing default physical attack animation with hit:', didHit);
      this.playPhysicalAttackAnimation(attacker, defender, defenderPanelEl, isPlayer, didHit, callback);
    }
  }

  playPhysicalAttackAnimation(attacker, defender, defenderPanel, isPlayer, didHit = true, callback) {
    console.log('[ANIMATION] Physical attack animation starting, didHit:', didHit);
    console.log('[ANIMATION] Attacker element:', attacker);
    console.log('[ANIMATION] Defender element:', defender);
    console.log('[ANIMATION] DefenderPanel element:', defenderPanel);

    if (!attacker) {
      console.error('[ANIMATION] Attacker element not found!');
      if (callback) callback();
      return;
    }

    const originalTransform = attacker.style.transform;
    const originalAnimation = attacker.style.animation;
    const distance = isPlayer ? 150 : -150;

    attacker.style.animation = 'none';
    attacker.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), filter 0.25s';

    console.log('[ANIMATION] Dashing forward');
    requestAnimationFrame(() => {
      attacker.style.transform = `translateX(${distance}px) scale(1.1)`;
      attacker.style.filter = 'brightness(1.3)';
    });

    setTimeout(() => {
      if (didHit) {
        console.log('[ANIMATION] Impact!');

        if (defender) {
          defender.classList.add('damage-shake');
          defender.style.filter = 'brightness(1.5) saturate(1.5)';

          const originalDefAnimation = defender.style.animation;
          defender.style.animation = 'none';
          defender.style.transition = 'transform 0.04s';
          defender.style.transform = 'translateX(15px)';

          setTimeout(() => {
            defender.style.transform = 'translateX(-15px)';
          }, 40);

          setTimeout(() => {
            defender.style.transform = 'translateX(10px)';
          }, 80);

          setTimeout(() => {
            defender.style.transform = 'translateX(-10px)';
          }, 120);

          setTimeout(() => {
            defender.style.transform = '';
            defender.style.animation = originalDefAnimation;
          }, 160);
        }
        if (defenderPanel) {
          defenderPanel.classList.add('damage-shake');
        }

        const flash = document.createElement('div');
        flash.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: white;
          opacity: 0.6;
          z-index: 9998;
          pointer-events: none;
        `;
        document.body.appendChild(flash);

        setTimeout(() => {
          flash.style.transition = 'opacity 0.1s';
          flash.style.opacity = '0';
        }, 50);

        setTimeout(() => {
          if (document.body.contains(flash)) {
            document.body.removeChild(flash);
          }
        }, 150);
      } else {
        console.log('[ANIMATION] Miss! No impact effects');
      }

      setTimeout(() => {
        console.log('[ANIMATION] Returning to position');
        attacker.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), filter 0.25s';
        attacker.style.transform = originalTransform || '';
        attacker.style.filter = '';
      }, didHit ? 150 : 0);

      setTimeout(() => {
        if (didHit && defender) {
          defender.classList.remove('damage-shake');
          defender.style.filter = '';
        }
        if (didHit && defenderPanel) {
          defenderPanel.classList.remove('damage-shake');
        }
        attacker.style.transition = '';
        attacker.style.animation = originalAnimation;
        console.log('[ANIMATION] Physical attack complete');
        if (callback) callback();
      }, 650);
    }, 250);
  }

  playRangedAttackAnimation(attacker, defender, defenderPanel, isPlayer, callback) {
    const attackerRect = attacker.getBoundingClientRect();
    const defenderRect = defender ? defender.getBoundingClientRect() : null;

    if (!defenderRect) {
      if (callback) callback();
      return;
    }

    const projectile = document.createElement('div');
    projectile.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background: radial-gradient(circle, #ffff00 0%, #ff8800 50%, #ff0000 100%);
      border-radius: 50%;
      box-shadow: 0 0 15px #ffff00, 0 0 30px #ff8800;
      z-index: 9999;
      left: ${attackerRect.left + attackerRect.width / 2}px;
      top: ${attackerRect.top + attackerRect.height / 2}px;
      pointer-events: none;
    `;
    document.body.appendChild(projectile);

    attacker.style.transition = 'transform 0.1s ease-out';
    attacker.style.transform = isPlayer ? 'scale(1.15)' : 'scale(1.15)';

    const targetX = defenderRect.left + defenderRect.width / 2;
    const targetY = defenderRect.top + defenderRect.height / 2;

    requestAnimationFrame(() => {
      projectile.style.transition = 'left 0.4s ease-out, top 0.4s ease-out';
      projectile.style.left = `${targetX}px`;
      projectile.style.top = `${targetY}px`;
    });

    setTimeout(() => {
      attacker.style.transform = '';
    }, 100);

    setTimeout(() => {
      projectile.style.opacity = '0';
      projectile.style.transform = 'scale(2)';
      projectile.style.transition = 'opacity 0.2s, transform 0.2s';

      if (defender) defender.classList.add('damage-shake');
      if (defenderPanel) defenderPanel.classList.add('damage-shake');

      setTimeout(() => {
        document.body.removeChild(projectile);
        if (defender) defender.classList.remove('damage-shake');
        if (defenderPanel) defenderPanel.classList.remove('damage-shake');
        attacker.style.transition = '';
        if (callback) callback();
      }, 300);
    }, 400);
  }

  playBuffAnimation(attacker, isPlayer, callback) {
    const attackerRect = attacker.getBoundingClientRect();

    const buffEffect = document.createElement('div');
    buffEffect.style.cssText = `
      position: fixed;
      left: ${attackerRect.left}px;
      top: ${attackerRect.top}px;
      width: ${attackerRect.width}px;
      height: ${attackerRect.height}px;
      border: 3px solid #00ff00;
      border-radius: 10px;
      box-shadow: 0 0 20px #00ff00, inset 0 0 20px #00ff00;
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      animation: buff-pulse 0.8s ease-out;
    `;
    document.body.appendChild(buffEffect);

    attacker.style.transition = 'transform 0.4s ease-out';
    attacker.style.transform = 'scale(1.2)';

    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        const angle = (i / 8) * Math.PI * 2;
        const distance = 50;
        sparkle.style.cssText = `
          position: fixed;
          left: ${attackerRect.left + attackerRect.width / 2}px;
          top: ${attackerRect.top + attackerRect.height / 2}px;
          width: 10px;
          height: 10px;
          background: #00ff00;
          border-radius: 50%;
          box-shadow: 0 0 10px #00ff00;
          z-index: 9999;
          pointer-events: none;
        `;
        document.body.appendChild(sparkle);

        requestAnimationFrame(() => {
          sparkle.style.transition = 'left 0.6s ease-out, top 0.6s ease-out, opacity 0.6s ease-out';
          sparkle.style.left = `${attackerRect.left + attackerRect.width / 2 + Math.cos(angle) * distance}px`;
          sparkle.style.top = `${attackerRect.top + attackerRect.height / 2 + Math.sin(angle) * distance}px`;
          sparkle.style.opacity = '0';
        });

        setTimeout(() => {
          document.body.removeChild(sparkle);
        }, 600);
      }, i * 50);
    }

    setTimeout(() => {
      attacker.style.transform = '';
    }, 400);

    setTimeout(() => {
      document.body.removeChild(buffEffect);
      attacker.style.transition = '';
      if (callback) callback();
    }, 800);
  }

  playDebuffAnimation(defender, isPlayer, callback) {
    if (!defender) {
      if (callback) callback();
      return;
    }

    const defenderRect = defender.getBoundingClientRect();

    const debuffEffect = document.createElement('div');
    debuffEffect.style.cssText = `
      position: fixed;
      left: ${defenderRect.left}px;
      top: ${defenderRect.top}px;
      width: ${defenderRect.width}px;
      height: ${defenderRect.height}px;
      border: 3px solid #8800ff;
      border-radius: 10px;
      box-shadow: 0 0 20px #8800ff, inset 0 0 20px #8800ff;
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      animation: debuff-pulse 0.8s ease-out;
    `;
    document.body.appendChild(debuffEffect);

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const cloud = document.createElement('div');
        cloud.style.cssText = `
          position: fixed;
          left: ${defenderRect.left + Math.random() * defenderRect.width}px;
          top: ${defenderRect.top + defenderRect.height}px;
          width: 15px;
          height: 15px;
          background: #8800ff;
          border-radius: 50%;
          box-shadow: 0 0 10px #8800ff;
          z-index: 9999;
          pointer-events: none;
          opacity: 0.8;
        `;
        document.body.appendChild(cloud);

        requestAnimationFrame(() => {
          cloud.style.transition = 'top 1s ease-out, opacity 1s ease-out';
          cloud.style.top = `${defenderRect.top - 50}px`;
          cloud.style.opacity = '0';
        });

        setTimeout(() => {
          document.body.removeChild(cloud);
        }, 1000);
      }, i * 100);
    }

    defender.style.transition = 'filter 0.3s ease-out';
    defender.style.filter = 'hue-rotate(270deg) brightness(0.7)';

    setTimeout(() => {
      defender.style.filter = '';
    }, 300);

    setTimeout(() => {
      document.body.removeChild(debuffEffect);
      defender.style.transition = '';
      if (callback) callback();
    }, 800);
  }

  playDamageAnimation(isPlayer = false) {
    if (!this.container) return;

    const panel = isPlayer ? '.player-panel' : '.enemy-panel';
    const element = this.container.querySelector(panel);
    if (element) {
      element.classList.add('damage-shake');
      setTimeout(() => {
        element.classList.remove('damage-shake');
      }, 500);
    }
  }

  playVictoryAnimation(callback, commandPromptCallback) {
    if (!this.container) {
      if (callback) callback();
      return;
    }

    this.container.classList.add('victory-flash');
    if (commandPromptCallback) {
      commandPromptCallback('==> VICTORY! You gained GRIST!');
    }

    setTimeout(() => {
      this.container.classList.remove('victory-flash');
      if (callback) callback();
    }, 1500);
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

  animateHealthBar(type, oldHP, newHP, maxHP, container) {
    if (!container) return;

    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentHP = oldHP + (newHP - oldHP) * easeProgress;
      const hpPercent = (currentHP / maxHP) * 100;

      if (type === 'player') {
        const playerDamageBar = container.querySelector('.player-panel .hp-bar > div > div:first-child');
        const playerHealthBar = container.querySelector('.player-panel .hp-bar > div > div:last-child');

        if (playerDamageBar && playerHealthBar) {
          playerDamageBar.style.width = `${100 - hpPercent}%`;
          playerHealthBar.style.width = `${hpPercent}%`;
        }
      } else if (type === 'enemy') {
        const enemyDamageBar = container.querySelector('.enemy-panel .hp-bar > div > div:first-child');
        const enemyHealthBar = container.querySelector('.enemy-panel .hp-bar > div > div:last-child');
        const enemyHPBar = container.querySelector('.enemy-panel .hp-bar');

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
}
