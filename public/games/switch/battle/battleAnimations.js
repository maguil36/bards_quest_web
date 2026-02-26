class BattleAnimations {
  constructor() {
    this.container = null;
  }

  setContainer(container) {
    this.container = container;
  }

  playIntroAnimation(callback, commandPromptCallback, playerName) {
    if (!this.container) return;
    
    this.container.classList.add('battle-flash');
    if (commandPromptCallback) {
      commandPromptCallback(`==> ${playerName}: Engage in STRIFE!`);
    }
    
    setTimeout(() => {
      this.container.classList.remove('battle-flash');
      if (callback) callback();
    }, 600);
  }

  playAttackAnimation(isPlayer = false, callback) {
    if (!this.container) {
      if (callback) callback();
      return;
    }

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
