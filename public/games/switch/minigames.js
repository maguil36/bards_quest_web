class NicholasMiniGame {
  constructor(canvas, ctx, gameState, onComplete) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.gameState = gameState;
    this.onComplete = onComplete;

    this.active = false;
    this.targets = [];
    this.score = 0;
    this.targetSpeed = 3;
    this.targetLifetime = 3000;
    this.lastSpawnTime = 0;
    this.spawnInterval = 1500;
    this.maxTargets = 3;
    this.requiredHits = 5;
    this.bullseyeHits = 0;
    this.totalTargetsSpawned = 0;
    this.maxTotalTargets = 5;
    this.closeButton = {
      x: this.canvas.width - 50,
      y: 10,
      size: 30
    };
  }

  start() {
    this.active = true;
    this.score = 0;
    this.bullseyeHits = 0;
    this.targets = [];
    this.totalTargetsSpawned = 0;
    this.lastSpawnTime = Date.now();
  }

  stop() {
    this.active = false;
    this.targets = [];
  }

  update() {
    if (!this.active) return;

    const now = Date.now();

    if (now - this.lastSpawnTime > this.spawnInterval &&
        this.targets.length < this.maxTargets &&
        this.totalTargetsSpawned < this.maxTotalTargets) {
      this.spawnTarget();
      this.lastSpawnTime = now;
    }

    this.targets = this.targets.filter(target => {
      target.y += this.targetSpeed;
      target.age = now - target.spawnTime;

      if (target.age > this.targetLifetime || target.y > this.canvas.height) {
        return false;
      }
      return true;
    });

    if (this.totalTargetsSpawned >= this.maxTotalTargets && this.targets.length === 0) {
      this.gameState.miniGameScores.nicholas = this.bullseyeHits;
      const success = this.bullseyeHits >= this.requiredHits;
      this.stop();
      if (this.onComplete) {
        this.onComplete(success);
      }
    }
  }

  spawnTarget() {
    const target = {
      x: Math.random() * (this.canvas.width - 80) + 40,
      y: -60,
      radius: 30,
      spawnTime: Date.now(),
      age: 0,
      hit: false
    };
    this.targets.push(target);
    this.totalTargetsSpawned++;
  }

  handleClick(mouseX, mouseY) {
    if (!this.active) return false;

    if (mouseX >= this.closeButton.x && mouseX <= this.closeButton.x + this.closeButton.size &&
        mouseY >= this.closeButton.y && mouseY <= this.closeButton.y + this.closeButton.size) {
      this.stop();
      if (this.onComplete) {
        this.onComplete(false);
      }
      return true;
    }

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i];
      if (target.hit) continue;

      const dx = mouseX - target.x;
      const dy = mouseY - target.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 10) {
        target.hit = true;
        this.bullseyeHits++;
        this.score += 100;
        return true;
      } else if (distance < target.radius) {
        target.hit = true;
        this.score += 50;
        return true;
      }
    }
    return false;
  }

  render() {
    if (!this.active) return;

    this.ctx.save();

    this.ctx.fillStyle = '#000';
    this.ctx.font = '24px monospace';
    this.ctx.fillText(`Bullseye Hits: ${this.bullseyeHits}/${this.requiredHits}`, 20, 40);
    this.ctx.fillText(`Score: ${this.score}`, 20, 70);

    for (const target of this.targets) {
      if (target.hit) continue;

      this.ctx.beginPath();
      this.ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ff0000';
      this.ctx.fill();
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(target.x, target.y, target.radius * 0.6, 0, Math.PI * 2);
      this.ctx.fillStyle = '#fff';
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(target.x, target.y, 10, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ff0000';
      this.ctx.fill();
    }

    const close = this.closeButton;
    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    this.ctx.fillRect(close.x, close.y, close.size, close.size);
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(close.x, close.y, close.size, close.size);

    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(close.x + 8, close.y + 8);
    this.ctx.lineTo(close.x + close.size - 8, close.y + close.size - 8);
    this.ctx.moveTo(close.x + close.size - 8, close.y + 8);
    this.ctx.lineTo(close.x + 8, close.y + close.size - 8);
    this.ctx.stroke();

    this.ctx.restore();
  }
}

class CombatSystem {
  constructor(gameState) {
    this.gameState = gameState;
    this.inCombat = false;
    this.currentEnemy = null;
    this.playerTurn = true;
    this.moves = {
      opal: ['Spatial Tear', 'Teleport Strike', 'Void Beam', 'Cosmic Shield'],
      nicholas: ['Light Ray', 'Illumination', 'Laser Beam', 'Flash Bang'],
      isabell: ['Blood Bond', 'Vital Strike', 'Life Drain', 'Crimson Blade'],
      austine: ['Mind Spike', 'Psychic Blast', 'Thought Shield', 'Mental Crush'],
      chloe: ['Healing Wave', 'Life Force', 'Nature\'s Fury', 'Revitalize'],
      alexis: ['Rage Strike', 'Fury Slash', 'Berserker', 'Stolen Weapon'],
      tyson: ['Doom Bolt', 'Fate Seal', 'Shadow Strike', 'Death Mark'],
      victor: ['Time Stop', 'Temporal Shift', 'Chrono Blast', 'Rewind']
    };
  }

  startCombat(enemyType = 'derseAgent') {
    this.inCombat = true;
    this.playerTurn = true;
    
    this.currentEnemy = {
      type: enemyType,
      name: enemyType === 'derseAgent' ? 'Derse Agent' : 'Enemy',
      health: 100,
      maxHealth: 100,
      attack: 15,
      defense: 10
    };
    
    return this.currentEnemy;
  }

  getMoves(characterId) {
    return this.moves[characterId] || this.moves.opal;
  }

  playerAttack(moveIndex) {
    if (!this.inCombat || !this.playerTurn) return null;
    
    const currentChar = this.gameState.getCurrentCharacter();
    const isNicholas = currentChar.id === 'nicholas';
    const isAlexis = currentChar.id === 'alexis';
    
    let baseDamage = 20 + (moveIndex * 5);
    
    if (isNicholas) {
      baseDamage *= 10;
    } else if (!isNicholas) {
      baseDamage += Math.floor(Math.random() * 10);
    }
    
    this.currentEnemy.health = Math.max(0, this.currentEnemy.health - baseDamage);
    
    this.playerTurn = false;
    
    if (this.currentEnemy.health <= 0) {
      return this.endCombat(true);
    }
    
    setTimeout(() => this.enemyAttack(), 1000);
    
    return {
      type: 'playerAttack',
      damage: baseDamage,
      enemyHealth: this.currentEnemy.health
    };
  }

  enemyAttack() {
    if (!this.inCombat) return null;
    
    const currentChar = this.gameState.getCurrentCharacter();
    const isAlexis = currentChar.id === 'alexis';
    
    let damage = this.currentEnemy.attack;
    
    if (isAlexis) {
      damage = 0;
    }
    
    this.gameState.combatStats.health = Math.max(0, this.gameState.combatStats.health - damage);
    
    this.playerTurn = true;
    
    if (this.gameState.combatStats.health <= 0) {
      return this.endCombat(false);
    }
    
    return {
      type: 'enemyAttack',
      damage: damage,
      playerHealth: this.gameState.combatStats.health
    };
  }

  endCombat(playerWon) {
    this.inCombat = false;
    
    if (playerWon && this.currentEnemy.type === 'derseAgent') {
      this.gameState.defeatAgent();
    }
    
    const result = {
      type: 'combatEnd',
      won: playerWon,
      agentsDefeated: this.gameState.combatStats.agentsDefeated
    };
    
    this.currentEnemy = null;
    this.playerTurn = true;
    
    return result;
  }

  healPlayer(amount = 30) {
    this.gameState.combatStats.health = Math.min(
      this.gameState.combatStats.maxHealth,
      this.gameState.combatStats.health + amount
    );
  }
}

class LogicPuzzleMiniGame {
  constructor(canvas, ctx, gameState, onComplete, puzzleType = 'neighbor') {
    this.canvas = canvas;
    this.ctx = ctx;
    this.gameState = gameState;
    this.onComplete = onComplete;
    this.puzzleType = puzzleType;

    this.active = false;
    this.gridSize = 4;
    this.cellSize = 80;
    this.padding = 20;
    this.grid = [];
    this.targetGrid = [];
    this.moves = 0;
    this.maxMoves = 15;
    this.offsetX = 0;
    this.offsetY = 0;
    this.currentCharacterId = null;
    this.autoSolveButton = null;
    this.closeButton = {
      x: this.canvas.width - 50,
      y: 10,
      size: 30
    };
  }

  start(characterId = null) {
    this.active = true;
    this.moves = 0;
    this.currentCharacterId = characterId;
    this.initializePuzzle();
    this.setupAutoSolveButton();
  }

  stop() {
    this.active = false;
  }

  setupAutoSolveButton() {
    if (this.currentCharacterId === 'austine') {
      const buttonWidth = 180;
      const buttonHeight = 50;
      const buttonX = this.canvas.width - buttonWidth - 20;
      const buttonY = this.canvas.height - buttonHeight - 30;

      this.autoSolveButton = {
        x: buttonX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight
      };
    } else {
      this.autoSolveButton = null;
    }
  }

  autoSolve() {
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        this.grid[i][j] = this.targetGrid[i][j];
      }
    }
    this.moves = this.maxMoves;
  }

  initializePuzzle() {
    this.grid = [];
    this.targetGrid = [];

    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = [];
      this.targetGrid[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        this.grid[i][j] = false;
        this.targetGrid[i][j] = Math.random() > 0.5;
      }
    }

    this.offsetX = (this.canvas.width - (this.gridSize * this.cellSize + (this.gridSize + 1) * this.padding)) / 2;
    this.offsetY = 120;
  }

  toggleCell(row, col) {
    if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) return;

    if (this.puzzleType === 'neighbor') {
      this.grid[row][col] = !this.grid[row][col];

      if (row > 0) this.grid[row - 1][col] = !this.grid[row - 1][col];
      if (row < this.gridSize - 1) this.grid[row + 1][col] = !this.grid[row + 1][col];
      if (col > 0) this.grid[row][col - 1] = !this.grid[row][col - 1];
      if (col < this.gridSize - 1) this.grid[row][col + 1] = !this.grid[row][col + 1];
    } else if (this.puzzleType === 'rowcol') {
      for (let i = 0; i < this.gridSize; i++) {
        this.grid[row][i] = !this.grid[row][i];
      }
      for (let i = 0; i < this.gridSize; i++) {
        if (i !== row) {
          this.grid[i][col] = !this.grid[i][col];
        }
      }
    }
  }

  handleClick(mouseX, mouseY) {
    if (!this.active) return false;

    if (mouseX >= this.closeButton.x && mouseX <= this.closeButton.x + this.closeButton.size &&
        mouseY >= this.closeButton.y && mouseY <= this.closeButton.y + this.closeButton.size) {
      this.stop();
      if (this.onComplete) {
        this.onComplete(false);
      }
      return true;
    }

    if (this.autoSolveButton) {
      const btn = this.autoSolveButton;
      if (mouseX >= btn.x && mouseX <= btn.x + btn.width &&
          mouseY >= btn.y && mouseY <= btn.y + btn.height) {
        this.autoSolve();

        if (this.checkWin()) {
          this.stop();
          if (this.onComplete) {
            this.onComplete(true);
          }
        }
        return true;
      }
    }

    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const x = this.offsetX + j * (this.cellSize + this.padding) + this.padding;
        const y = this.offsetY + i * (this.cellSize + this.padding) + this.padding;

        if (mouseX >= x && mouseX <= x + this.cellSize &&
            mouseY >= y && mouseY <= y + this.cellSize) {
          this.toggleCell(i, j);
          this.moves++;

          if (this.checkWin()) {
            this.stop();
            if (this.onComplete) {
              this.onComplete(true);
            }
          } else if (this.moves >= this.maxMoves) {
            this.stop();
            if (this.onComplete) {
              this.onComplete(false);
            }
          }

          return true;
        }
      }
    }
    return false;
  }

  checkWin() {
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j] !== this.targetGrid[i][j]) {
          return false;
        }
      }
    }
    return true;
  }

  update() {
  }

  render() {
    if (!this.active) return;

    this.ctx.save();

    this.ctx.fillStyle = '#2a0845';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 24px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Match the Target Pattern', this.canvas.width / 2, 40);

    this.ctx.font = '18px monospace';
    this.ctx.fillText(`Moves: ${this.moves}/${this.maxMoves}`, this.canvas.width / 2, 70);

    const instruction = this.puzzleType === 'neighbor'
      ? 'Click to toggle (affects neighbors)'
      : 'Click to toggle (affects row & column)';
    this.ctx.fillText(instruction, this.canvas.width / 2, 95);

    const targetSize = this.gridSize * 25;
    const targetX = this.canvas.width - targetSize - 40;
    const targetY = this.canvas.height / 2 - targetSize / 2;

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Target:', targetX + targetSize / 2, targetY - 10);

    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const x = targetX + j * 25;
        const y = targetY + i * 25;

        this.ctx.fillStyle = this.targetGrid[i][j] ? '#9b4dca' : '#1a0530';
        this.ctx.fillRect(x, y, 20, 20);
        this.ctx.strokeStyle = '#6a2ba8';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, 20, 20);
      }
    }

    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const x = this.offsetX + j * (this.cellSize + this.padding) + this.padding;
        const y = this.offsetY + i * (this.cellSize + this.padding) + this.padding;

        this.ctx.fillStyle = this.grid[i][j] ? '#9b4dca' : '#1a0530';
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);

        this.ctx.strokeStyle = '#6a2ba8';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
      }
    }

    if (this.autoSolveButton) {
      const btn = this.autoSolveButton;

      this.ctx.fillStyle = '#1e7b34';
      this.ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

      this.ctx.strokeStyle = '#28a745';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);

      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 18px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('🔮 Auto-Solve', btn.x + btn.width / 2, btn.y + btn.height / 2);

      this.ctx.textBaseline = 'alphabetic';
    }

    const close = this.closeButton;
    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    this.ctx.fillRect(close.x, close.y, close.size, close.size);
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(close.x, close.y, close.size, close.size);

    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(close.x + 8, close.y + 8);
    this.ctx.lineTo(close.x + close.size - 8, close.y + close.size - 8);
    this.ctx.moveTo(close.x + close.size - 8, close.y + 8);
    this.ctx.lineTo(close.x + 8, close.y + close.size - 8);
    this.ctx.stroke();

    this.ctx.restore();
  }
}
