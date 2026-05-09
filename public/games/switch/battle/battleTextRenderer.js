class BattleTextRenderer {
  constructor() {
    this.config = {
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
          scale: 10,
          dilate: false
        },
        command: {
          color: '#fff',
          bgColor: '#000',
          shadowColor: null,
          shadowOffset: 0,
          scale: 4
        },
        button: {
          color: '#fff',
          bgColor: '#000',
          shadowColor: null,
          shadowOffset: 0,
          scale: 5
        }
      }
    };

    this.bitmapFont = new BitmapFontRenderer({
      fontFamily: this.config.fontFamily,
      fontWeight: this.config.fontWeight,
      baseFontSize: this.config.baseFontSize,
      scale: this.config.scale,
      opacityThreshold: this.config.opacityThreshold
    });

    this.battleMessages = [];
    
    this.waitTimeout = 5000;
  }

  createPixelatedText(text, presetOrConfig = 'command') {
    let config;

    if (typeof presetOrConfig === 'string') {
      config = this.config.presets[presetOrConfig];
      if (!config) {
        console.warn(`Preset "${presetOrConfig}" not found, using default`);
        config = this.config.presets.command;
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
      config.scale || this.config.scale,
      config.dilate || false,
      config.baseFontSize || this.config.baseFontSize
    );
  }

  renderPixelatedText(text, color = '#fff', bgColor = '#000', shadowColor = null, shadowOffset = 1, scale = 8, dilate = false, customFontSize = null) {
    return this.bitmapFont.renderText(text, color, bgColor, shadowColor, shadowOffset, scale, dilate, customFontSize);
  }

  addLogMessage(message, color = '#0f0', onRender = null) {
    this.battleMessages.push({ text: `> ${message}`, color: color });

    if (onRender) {
      onRender();
    }

    setTimeout(() => {
      const logContent = document.getElementById('combatLogContent');
      if (logContent) {
        logContent.scrollTop = logContent.scrollHeight;
      }
    }, 10);
  }

  waitForInput(callback, container, timeout = null) {
    const waitTime = timeout || this.waitTimeout;
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
    
    if (container) {
      container.appendChild(continuePrompt);
    }

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
    }, waitTime);
  }

  showMultiHitMessages(attackerName, moveName, hitData, finalCallback, context) {
    console.log('showMultiHitMessages called with:', attackerName, moveName, hitData);
    if (!hitData || hitData.length === 0) {
      console.log('No hitData, calling finalCallback immediately');
      if (finalCallback) finalCallback();
      return;
    }

    let currentHitIndex = 0;
    let totalDamage = 0;

    const showNextHit = () => {
      if (currentHitIndex >= hitData.length) {
        const times = hitData.length;
        const summaryMessage = `${moveName} hit ${times} time${times > 1 ? 's' : ''} for ${totalDamage} damage!`;
        this.addLogMessage(summaryMessage, '#0f0', context.onRender, context.container);

        this.waitForInput(() => {
          if (finalCallback) finalCallback();
        }, context.container, this.waitTimeout);
        return;
      }

      const hit = hitData[currentHitIndex];
      totalDamage += hit.damage;

      const hitMessage = `Hit for ${hit.damage} damage!`;
      this.addLogMessage(hitMessage, '#fff', context.onRender, context.container);

      if (context.onUpdateHpSnapshot) {
        context.onUpdateHpSnapshot(hit.defenderHp);
      }

      currentHitIndex++;

      this.waitForInput(() => {
        showNextHit();
      }, context.container, this.waitTimeout);
    };

    showNextHit();
  }

  getMessages() {
    return this.battleMessages;
  }

  clearMessages() {
    this.battleMessages = [];
  }

  setMessages(messages) {
    this.battleMessages = messages;
  }

  getConfig() {
    return this.config;
  }

  getPreset(presetName) {
    return this.config.presets[presetName];
  }

  setWaitTimeout(timeout) {
    this.waitTimeout = timeout;
  }
}
