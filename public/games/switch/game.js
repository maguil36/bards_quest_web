 // Main game logic for the Switch game
class SwitchGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.gameState = new GameState();
        this.npcs = []; // will be built dynamically in init()
        this.characters = CHARACTERS;
        this.dialogueManager = new DialogueManager(this.gameState, this.npcs, this);
        this.audioManager = new AudioManager();

        // Mini-game and combat system
        this.miniGame = new NicholasMiniGame(
            this.canvas,
            this.ctx,
            this.gameState,
            (success) => this.onMiniGameComplete(success)
        );
        this.logicPuzzle = new LogicPuzzleMiniGame(
            this.canvas,
            this.ctx,
            this.gameState,
            (success) => this.onLogicPuzzleComplete(success)
        );
        this.combatSystem = new CombatSystem(this.gameState);

        // Game world settings
        this.mapWidth = 5120;
        this.mapHeight = 5120;
        this.tileSize = 32;

        // Camera settings
        this.camera = {
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height
        };

        // Player settings
        this.player = {
            x: 2560,
            y: 4480,
            width: 32,
            height: 32,
            speed: 2,
            direction: 'down',
            isMoving: false,
            animationFrame: 0,
            animationTimer: 0
        };

        // Input handling
        this.keys = {};
        this.lastInteractionTime = 0;

        // Sprite loading
        this.sprites = {};
        this.spritesLoaded = false;

        // UI elements
        this.dialogueBox = document.getElementById('dialogueBox');
        this.dialogueText = document.getElementById('dialogueText');
        this.switchPrompt = document.getElementById('switchPrompt');
        this.miniGamePrompt = document.getElementById('miniGamePrompt');
        this.glitchOverlay = document.getElementById('glitchOverlay');
        this.errorMessage = document.getElementById('errorMessage');
        this.characterName = document.getElementById('characterName');
        this.inventoryUI = document.getElementById('inventoryUI');
        this.questUI = document.getElementById('questUI');
        this.abilitiesUI = document.getElementById('abilitiesUI');
        this.combatUI = document.getElementById('combatUI');

        // Ensure overlays/prompts are hidden initially
        if (this.glitchOverlay) this.glitchOverlay.style.display = 'none';
        if (this.switchPrompt) this.switchPrompt.style.display = 'none';
        if (this.miniGamePrompt) this.miniGamePrompt.style.display = 'none';
        if (this.dialogueBox) this.dialogueBox.style.display = 'none';
        if (this.combatUI) this.combatUI.style.display = 'none';

        // Game state
        this.isGameRunning = true;
        this.showingDialogue = false;
        this.showingSwitchPrompt = false;
        this.inMiniGame = false;
        this.miniGameForSwitch = false;
        this.inCombat = false;
        this.currentPuzzleChest = null;

        // Glitch/ending state
        this.isGlitching = false;
        this.glitchFrozenCanvas = null; // snapshot used for stuck-pixel effect
        this.glitchStuckCells = [];     // array of {x,y,w,h}
        this.glitchPixelSize = 4;       // base pixelation size
        this.glitchScratchCanvas = null; // downscale buffer
        this.glitchOverlayIntervalId = null; // cycles flashing images
        this.scrambleActive = false;    // NPC/player jump-around burst
        this._nextScrambleAt = 0;       // timestamp for next scramble start

        // Floating text for ability feedback
        this.floatingTexts = [];

        // Map tiles
        this.mapTiles = [];
        this.mapCols = Math.floor(this.mapWidth / this.tileSize);
        this.mapRows = Math.floor(this.mapHeight / this.tileSize);

        // Map objects
        this.chests = [];
        this.boulders = [];
        this.obstacles = [];
        this.fillableChasms = [];
        this.walls = [];

        this.initializeMap();

        this.init();
    }

    async init() {
        // Ensure CSS variable-driven colors are up-to-date
        if (typeof refreshCharacterColors === 'function') {
            refreshCharacterColors();
        }

        // Load game state
        this.gameState.load();

        // Restore chest states after loading game state
        this.restoreChestStates();

        // Set initial player position
        const currentChar = this.gameState.getCurrentCharacter();
        const savedPos = this.gameState.characterPositions[currentChar.id];
        if (savedPos) {
            this.player.x = savedPos.x;
            this.player.y = savedPos.y;
        }

        // Build dynamic NPC list: 7 NPCs (everyone except the current playable character)
        // Use a new array instance and point DialogueManager at it
        this.npcs = NPCS.filter(npc => npc.id !== currentChar.id).map(npc => ({ ...npc }));
        if (this.dialogueManager) this.dialogueManager.npcs = this.npcs;

        // If loading from a save where NPCs were modified, keep their positions when possible
        for (const npc of this.npcs) {
            const saved = this.gameState.characterPositions[npc.id];
            if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
                npc.position = { x: saved.x, y: saved.y };
            }
        }

        // Update UI
        this.updateCharacterUI();

        // Set up event listeners
        this.setupEventListeners();

        // Ensure overlays/prompts are hidden initially
        if (this.glitchOverlay) this.glitchOverlay.style.display = 'none';
        if (this.switchPrompt) this.switchPrompt.style.display = 'none';
        if (this.miniGamePrompt) this.miniGamePrompt.style.display = 'none';
        if (this.dialogueBox) this.dialogueBox.style.display = 'none';
        if (this.combatUI) this.combatUI.style.display = 'none';

        // Game state
        this.isGameRunning = true;
        this.showingDialogue = false;
        this.showingSwitchPrompt = false;
        this.inMiniGame = false;
        this.miniGameForSwitch = false;
        this.inCombat = false;
        this.abilityMode = null;

        // Load sprites
        await this.loadSprites();

        // Start background music
        if (this.audioManager && typeof this.audioManager.playCharacterMusic === 'function') {
            this.audioManager.playCharacterMusic(currentChar.id);
        }

        // Apply character theme
        this.applyCharacterTheme(currentChar);

        // Start game loop
        this.gameLoop();
    }

    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            // Attempt to unlock audio on first interaction (for autoplay policies)
            if (!this._audioUnlocked) {
                const currentChar = this.gameState.getCurrentCharacter();

                // Refresh CSS variable-driven character colors in case styles are applied after load
                if (typeof refreshCharacterColors === 'function') {
                    refreshCharacterColors();
                }

                if (this.audioManager && typeof this.audioManager.playCharacterMusic === 'function') {
                    this.audioManager.playCharacterMusic(currentChar.id);
                }
                this._audioUnlocked = true;
                // Apply theme in case styles loaded later
                this.applyCharacterTheme(currentChar);
            }
            this.keys[e.code] = true;
            this.handleKeyPress(e);
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Switch prompt buttons
        const switchYes = document.getElementById('switchYes');
        const switchNo = document.getElementById('switchNo');
        if (switchYes) {
            switchYes.addEventListener('click', () => {
                this.handleCharacterSwitch(true);
            });
        }
        if (switchNo) {
            switchNo.addEventListener('click', () => {
                this.handleCharacterSwitch(false);
            });
        }

        // Mini-game prompt buttons
        const miniGameYes = document.getElementById('miniGameYes');
        const miniGameNo = document.getElementById('miniGameNo');
        if (miniGameYes) {
            miniGameYes.addEventListener('click', () => {
                this.handleMiniGamePrompt(true);
            });
        }
        if (miniGameNo) {
            miniGameNo.addEventListener('click', () => {
                this.handleMiniGamePrompt(false);
            });
        }

        // Settings UI
        const settingsBtn = document.getElementById('settingsButton');
        const settingsModal = document.getElementById('settingsModal');
        const settingsClose = document.getElementById('settingsClose');
        const volSlider = document.getElementById('volumeSlider');
        const volValue = document.getElementById('volumeValue');
        const restartBtn = document.getElementById('restartGameBtn');

        const openSettings = () => {
            if (typeof this.updateSettingsPanel === 'function') {
                this.updateSettingsPanel();
            }
            if (settingsModal) settingsModal.style.display = 'block';
        };
        const closeSettings = () => {
            if (settingsModal) settingsModal.style.display = 'none';
        };

        if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
        if (settingsClose) settingsClose.addEventListener('click', closeSettings);

        // Restart game (hard reset)
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                const confirmed = confirm('This will permanently erase your progress and restart the game. Continue?');
                if (!confirmed) return;

                // Reset game state if available
                if (this.gameState && typeof this.gameState.reset === 'function') {
                    this.gameState.reset();
                }

                // Clear saved audio settings
                localStorage.removeItem('switchAudioSettings');
                localStorage.removeItem('switchGameState');

                // Reload page to reinitialize everything cleanly
                window.location.reload();
            });
        }

        // Close settings with Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && settingsModal && settingsModal.style.display === 'block') {
                // Prevent other Escape handlers from re-opening settings in the same keypress
                e.preventDefault();
                e.stopImmediatePropagation();
                closeSettings();
            }
        });

        // Global Escape behavior:
        // - If any in-game window is open (dialogue or switch prompt), close it
        // - Otherwise, open the options/settings window
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;

            // If settings already open, the previous listener will close it; don't double-handle
            if (settingsModal && settingsModal.style.display === 'block') return;

            // If a minigame is active, close it
            if (this.inMiniGame && this.miniGame && this.miniGame.active) {
                e.preventDefault();
                this.miniGame.stop();
                if (this.miniGame.onComplete) {
                    this.miniGame.onComplete(false);
                }
                return;
            }

            // If logic puzzle is active, close it
            if (this.logicPuzzle && this.logicPuzzle.active) {
                e.preventDefault();
                this.logicPuzzle.stop();
                if (this.logicPuzzle.onComplete) {
                    this.logicPuzzle.onComplete(false);
                }
                return;
            }

            // If dialogue is currently open, close it without marking completion
            if (this.showingDialogue && this.dialogueManager && typeof this.dialogueManager.cancelDialogue === 'function') {
                e.preventDefault();
                this.dialogueManager.cancelDialogue();
                this.closeDialogue();
                return;
            }

            // If switch prompt is open, close it
            if (this.showingSwitchPrompt) {
                e.preventDefault();
                this.showingSwitchPrompt = false;
                if (this.switchPrompt) this.switchPrompt.style.display = 'none';
                return;
            }

            // Otherwise, open settings/options
            e.preventDefault();
            if (typeof this.updateSettingsPanel === 'function') {
                this.updateSettingsPanel();
            }
            if (settingsModal) settingsModal.style.display = 'block';
        });

        // Initialize slider from audio manager
        if (volSlider && volValue && this.audioManager && typeof this.audioManager.getVolume === 'function') {
            const v = Math.round(this.audioManager.getVolume() * 100);
            volSlider.value = String(v);
            volValue.textContent = `${v}%`;

            volSlider.addEventListener('input', () => {
                const pct = parseInt(volSlider.value, 10) || 0;
                if (this.audioManager && typeof this.audioManager.setVolume === 'function') {
                    this.audioManager.setVolume(pct / 100);
                }
                if (volValue) volValue.textContent = `${pct}%`;
            });
        }

        if (this.canvas) {
            this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

            this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        }
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        if (this.logicPuzzle && this.logicPuzzle.active) {
            this.logicPuzzle.handleClick(x, y);
            return;
        }

        if (this.inMiniGame && this.miniGame) {
            this.miniGame.handleClick(x, y);
            return;
        }

        if (this.inCombat) {
            return;
        }

        this.checkItemPickup(x, y);
        this.checkAbilityUsage(x, y);
    }

    checkItemPickup(x, y) {
        const worldX = x + this.camera.x;
        const worldY = y + this.camera.y;

        for (const itemId in this.gameState.gameItems) {
            const item = this.gameState.gameItems[itemId];
            if (item.found || !item.position) continue;

            const dx = worldX - item.position.x;
            const dy = worldY - item.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 30) {
                if (this.gameState.pickupItem(itemId)) {
                    console.log(`Picked up ${itemId}`);
                    this.gameState.save();
                }
                break;
            }
        }
    }

    checkAbilityUsage(x, y) {
        const currentChar = this.gameState.getCurrentCharacter();
        if (!currentChar || !currentChar.abilities) return;

        const worldX = x + this.camera.x;
        const worldY = y + this.camera.y;

        switch (currentChar.id) {
            case 'opal':
                if (currentChar.abilities.includes('teleport')) {
                    const targetX = Math.max(0, Math.min(this.mapWidth - this.player.width, worldX));
                    const targetY = Math.max(0, Math.min(this.mapHeight - this.player.height, worldY));

                    if (this.isValidTeleportLocation(targetX, targetY)) {
                        this.player.x = targetX;
                        this.player.y = targetY;
                        this.gameState.save();
                    } else {
                        this.showFloatingText(this.player.x, this.player.y - 40, 'Cannot teleport there!', '#ff6666');
                    }
                }
                break;

            case 'chloe':
                if (currentChar.abilities.includes('heal')) {
                    const healRadius = 50;
                    let healed = false;

                    for (const npc of this.npcs) {
                        const npcCenterX = npc.position.x + 16;
                        const npcCenterY = npc.position.y + 16;
                        const distance = Math.hypot(worldX - npcCenterX, worldY - npcCenterY);

                        if (distance < healRadius) {
                            this.gameState.combatStats.health = Math.min(
                                this.gameState.combatStats.health + 30,
                                100
                            );
                            healed = true;
                            this.showFloatingText(npc.position.x, npc.position.y, '+30 HP', '#9cff86');
                            break;
                        }
                    }

                    const playerDistance = Math.hypot(
                        worldX - (this.player.x + this.player.width / 2),
                        worldY - (this.player.y + this.player.height / 2)
                    );
                    if (playerDistance < healRadius && !healed) {
                        this.gameState.combatStats.health = Math.min(
                            this.gameState.combatStats.health + 30,
                            100
                        );
                        this.showFloatingText(this.player.x, this.player.y, '+30 HP', '#9cff86');
                    }
                }
                break;

            case 'isabell':
                if (currentChar.abilities.includes('gristCreator')) {
                    this.gameState.buildProgress.grist = Math.min(
                        (this.gameState.buildProgress.grist || 0) + 10,
                        100
                    );
                    this.showFloatingText(worldX - this.camera.x, worldY - this.camera.y, '+10 Grist', '#d85221');
                    this.updateQuestUI();
                }
                break;

            case 'austine':
                if (currentChar.abilities.includes('puzzleSolver')) {
                    this.showFloatingText(worldX - this.camera.x, worldY - this.camera.y, 'Puzzle Auto-Solved!', '#5db473');
                }
                break;

            case 'alexis':
                if (currentChar.abilities.includes('weaponSteal')) {
                    const stealRadius = 50;
                    for (const npc of this.npcs) {
                        const npcCenterX = npc.position.x + 16;
                        const npcCenterY = npc.position.y + 16;
                        const distance = Math.hypot(worldX - npcCenterX, worldY - npcCenterY);

                        if (distance < stealRadius) {
                            const weaponId = `${npc.id}_weapon`;
                            if (!this.gameState.combatStats.weaponsCollected.includes(weaponId)) {
                                this.gameState.combatStats.weaponsCollected.push(weaponId);
                                this.showFloatingText(npc.position.x, npc.position.y, `Stole ${npc.name}'s Weapon!`, '#6600ff');
                                this.updateQuestUI();
                            }
                            break;
                        }
                    }
                }
                break;
        }
    }

    showFloatingText(x, y, text, color) {
        const floatingText = {
            x: x,
            y: y,
            text: text,
            color: color,
            alpha: 1.0,
            lifetime: 60
        };

        if (!this.floatingTexts) this.floatingTexts = [];
        this.floatingTexts.push(floatingText);
    }

    isValidTeleportLocation(newX, newY) {
        const playerTileLeft = Math.floor(newX / this.tileSize);
        const playerTileRight = Math.floor((newX + this.player.width - 1) / this.tileSize);
        const playerTileTop = Math.floor(newY / this.tileSize);
        const playerTileBottom = Math.floor((newY + this.player.height - 1) / this.tileSize);

        for (let ty = playerTileTop; ty <= playerTileBottom; ty++) {
            for (let tx = playerTileLeft; tx <= playerTileRight; tx++) {
                if (ty >= 0 && ty < this.mapRows && tx >= 0 && tx < this.mapCols) {
                    const tileType = this.mapTiles[ty][tx];
                    if (tileType === 1 || tileType === 2) {
                        return false;
                    }
                }
            }
        }

        for (const boulder of this.boulders) {
            if (newX < boulder.x + this.tileSize &&
                newX + this.player.width > boulder.x &&
                newY < boulder.y + this.tileSize &&
                newY + this.player.height > boulder.y) {
                return false;
            }
        }

        for (const obstacle of this.obstacles) {
            if (!obstacle.broken) {
                if (newX < obstacle.x + this.tileSize &&
                    newX + this.player.width > obstacle.x &&
                    newY < obstacle.y + this.tileSize &&
                    newY + this.player.height > obstacle.y) {
                    return false;
                }
            }
        }

        for (const chasm of this.fillableChasms) {
            if (!chasm.filled) {
                if (newX < chasm.x + this.tileSize &&
                    newX + this.player.width > chasm.x &&
                    newY < chasm.y + this.tileSize &&
                    newY + this.player.height > chasm.y) {
                    return false;
                }
            }
        }

        if (this.gameState && this.gameState.combatStats.agentsDefeated < 3) {
            const agents = [
                { x: 750, y: 750 },
                { x: 1280, y: 320 },
                { x: 1280, y: 1280 }
            ];

            const defeatedCount = this.gameState.combatStats.agentsDefeated || 0;
            for (let i = defeatedCount; i < agents.length; i++) {
                const agent = agents[i];
                const tileSize = 32;

                if (newX < agent.x + tileSize &&
                    newX + this.player.width > agent.x &&
                    newY < agent.y + tileSize &&
                    newY + this.player.height > agent.y) {
                    return false;
                }
            }
        }

        return true;
    }

    onMiniGameComplete(success) {
        this.inMiniGame = false;

        if (this.miniGameForSwitch) {
            this.miniGameForSwitch = false;
            const targetNpcId = this.dialogueManager.pendingSwitch;

            if (this.dialogueManager.handleMiniGameComplete(success, targetNpcId)) {
                this.showingDialogue = true;
                this.showDialogueUI();
            }
        } else {
            if (success) {
                this.gameState.unlockCharacter('nicholas');
                this.gameState.save();
                this.showNicholasDialogue(true);
            } else {
                this.showNicholasDialogue(false);
            }
        }
    }

    startSwitchMiniGame() {
        this.miniGameForSwitch = true;
        this.inMiniGame = true;
        this.miniGame.start();
    }

    saveChestStates() {
        this.gameState.chestStates = this.chests.map(chest => ({
            opened: chest.opened || false,
            puzzleSolved: chest.puzzleSolved || false
        }));
    }

    restoreChestStates() {
        if (this.gameState.chestStates && this.gameState.chestStates.length > 0) {
            this.gameState.chestStates.forEach((savedState, index) => {
                if (this.chests[index]) {
                    this.chests[index].opened = savedState.opened || false;
                    this.chests[index].puzzleSolved = savedState.puzzleSolved || false;
                }
            });
        }
    }

    onLogicPuzzleComplete(success) {
        if (success && this.currentPuzzleChest) {
            const chest = this.currentPuzzleChest;

            chest.puzzleSolved = true;
            this.showFloatingText(chest.x + this.tileSize/2, chest.y, 'Puzzle solved!', '#00ff00');
            this.saveChestStates();
            this.gameState.save();
        } else if (!success) {
            this.showFloatingText(this.player.x, this.player.y - 40, 'Puzzle failed! Try again', '#ff6666');
        }

        this.currentPuzzleChest = null;
    }

    showMiniGamePrompt() {
        this.showingSwitchPrompt = true;
        if (this.miniGamePrompt) {
            this.miniGamePrompt.style.display = 'block';
        }
    }

    handleMiniGamePrompt(accepted) {
        if (this.miniGamePrompt) {
            this.miniGamePrompt.style.display = 'none';
        }
        this.showingSwitchPrompt = false;

        if (accepted) {
            this.inMiniGame = true;
            this.miniGame.start();
        } else {
            this.nextCharacterToSwitch = null;
        }
    }

    showNicholasDialogue(success) {
        this.showingDialogue = true;
        if (this.dialogueBox) {
            this.dialogueBox.style.display = 'block';
        }

        if (success) {
            if (this.dialogueText) {
                this.dialogueText.textContent = "Impressive shooting! I didn't expect you to hit all of those. You've proven yourself worthy.";
                this.dialogueText.style.color = CHARACTERS.nicholas.color;
            }
        } else {
            if (this.dialogueText) {
                this.dialogueText.textContent = "Not bad, but you'll need to get good if you want to unlock my potential. Try again!";
                this.dialogueText.style.color = CHARACTERS.nicholas.color;
            }
        }

        setTimeout(() => {
            this.showingDialogue = false;
            if (this.dialogueBox) {
                this.dialogueBox.style.display = 'none';
            }

            if (success && this.nextCharacterToSwitch === 'nicholas') {
                setTimeout(() => this.showSwitchPrompt(), 400);
            } else {
                this.nextCharacterToSwitch = null;
            }
        }, 3000);
    }

    showNicholasDialogue(success) {
        this.showingDialogue = true;
        if (this.dialogueBox) {
            this.dialogueBox.style.display = 'block';
        }

        if (success) {
            if (this.dialogueText) {
                this.dialogueText.textContent = "Impressive shooting! I didn't expect you to hit all of those. You've proven yourself worthy.";
                this.dialogueText.style.color = CHARACTERS.nicholas.color;
            }
        } else {
            if (this.dialogueText) {
                this.dialogueText.textContent = "Not bad, but you'll need to get good if you want to unlock my potential. Try again!";
                this.dialogueText.style.color = CHARACTERS.nicholas.color;
            }
        }

        setTimeout(() => {
            this.showingDialogue = false;
            if (this.dialogueBox) {
                this.dialogueBox.style.display = 'none';
            }

            if (success) {
                setTimeout(() => this.showSwitchPrompt(), 400);
            }
        }, 3000);
    }

    updateSettingsPanel() {
        const current = this.gameState.getCurrentCharacter();
        const nameEl = document.getElementById('settingsCurrentCharacter');
        const charProg = document.getElementById('settingsCharProgress');
        const charTotal = document.getElementById('settingsCharTotal');
        const questInfo = document.getElementById('settingsQuestInfo');
        const questStatus = document.getElementById('settingsQuestStatus');

        if (nameEl) nameEl.textContent = current.name;

        if (this.gameState) {
            const done = this.gameState.getCompletedCountForCharacter(current.id);
            const total = this.gameState.getTotalTargetsPerCharacter(current.id);
            if (charProg) charProg.textContent = String(done);
            if (charTotal) charTotal.textContent = String(total);

            const charData = CHARACTERS[current.id];
            if (charData) {
                if (questInfo && charData.quest) {
                    questInfo.textContent = charData.quest.description || 'No quest';
                }

                if (questStatus) {
                    const isCompleted = this.gameState.completedQuests.has(current.id);
                    questStatus.textContent = isCompleted ? 'Complete' : 'Ongoing';
                }
            }
        }
    }

    updateInventoryUI() {
        const itemsEl = document.getElementById('inventoryItems');
        if (!itemsEl) return;

        const currentChar = this.gameState.getCurrentCharacter();
        const inventory = this.gameState.inventory[currentChar.id] || [];
        const capacity = this.gameState.inventoryCapacity[currentChar.id] || 5;

        if (inventory.length === 0) {
            itemsEl.innerHTML = '<div>Empty</div>';
        } else {
            itemsEl.innerHTML = inventory.map(item => `<div>• ${item}</div>`).join('');
        }
        itemsEl.innerHTML += `<div style="margin-top: 4px; font-size: 12px; color: var(--muted);">${inventory.length}/${capacity} slots</div>`;
    }

    updateQuestUI() {
        const questDesc = document.getElementById('questDescription');
        const questProg = document.getElementById('questProgress');
        if (!questDesc || !questProg) return;

        const currentChar = this.gameState.getCurrentCharacter();
        const charData = CHARACTERS[currentChar.id];

        if (!charData || !charData.quest) {
            questDesc.innerHTML = '<div>No active quest</div>';
            questProg.innerHTML = '<div>Progress: -</div>';
            return;
        }

        const quest = charData.quest;
        const progress = this.gameState.questProgress[currentChar.id] || 0;
        const isCompleted = this.gameState.completedQuests.has(currentChar.id);

        questDesc.innerHTML = `<div>${quest.description}</div>`;

        if (isCompleted) {
            questProg.innerHTML = '<div style="color: var(--accent);">✓ Quest Complete!</div>';
        } else {
            const completion = quest.completionCriteria;
            if (completion.type === 'collect') {
                const items = this.gameState.inventory[currentChar.id] || [];
                const hasItem = items.includes(completion.item);
                questProg.innerHTML = `<div>Collect ${completion.item}: ${hasItem ? '✓' : '✗'}</div>`;
            } else if (completion.type === 'defeat') {
                const defeated = this.gameState.combatStats.agentsDefeated || 0;
                questProg.innerHTML = `<div>Defeat agents: ${defeated}/${completion.count}</div>`;
            } else if (completion.type === 'minigame') {
                const score = this.gameState.miniGameScores.nicholas || 0;
                questProg.innerHTML = `<div>Mini-game score: ${score}/${completion.score}</div>`;
            } else if (completion.type === 'talkToAll') {
                const talked = Object.keys(this.gameState.interactions).filter(id =>
                    this.gameState.interactions[id] > 0 && id !== currentChar.id
                ).length;
                const total = Object.keys(CHARACTERS).length - 1;
                questProg.innerHTML = `<div>Talk to all: ${talked}/${total}</div>`;
            } else {
                questProg.innerHTML = `<div>Progress: ${progress}</div>`;
            }
        }
    }

    updateAbilitiesUI() {
        const abilitiesDesc = document.getElementById('abilitiesDescription');
        if (!abilitiesDesc) return;

        const currentChar = this.gameState.getCurrentCharacter();
        if (!currentChar || !currentChar.abilities || currentChar.abilities.length === 0) {
            abilitiesDesc.innerHTML = '<div>No abilities</div>';
            return;
        }

        const abilityDescriptions = {
            teleport: '🌟 Teleport: Click anywhere to teleport',
            heal: '💚 Heal: Click on a character to heal (+30 HP)',
            gristCreator: '⚒️ Grist Creator: Click to create grist (+10)',
            puzzleSolver: '🧩 Puzzle Solver: Auto-solve puzzles',
            weaponSteal: '⚔️ Weapon Steal: Click on characters to steal their weapon',
            invincible: '🛡️ Invincible: Cannot take damage in combat',
            damageBoost: '💥 Damage x10: Massive damage in combat'
        };

        const abilityList = currentChar.abilities
            .map(ability => abilityDescriptions[ability] || ability)
            .join('<br>');

        abilitiesDesc.innerHTML = abilityList;
    }

    handleKeyPress(e) {
        const now = Date.now();

        // If settings modal is open, ignore gameplay keys (ESC is handled by a separate listener)
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal && settingsModal.style.display === 'block') return;

        switch(e.code) {
            case 'Space':
                e.preventDefault();
                if (this.showingDialogue) {
                    if (this.dialogueManager.showingMenu) {
                        this.dialogueManager.confirmMenuSelection();
                        if (!this.dialogueManager.showingMenu && !this.dialogueManager.isActive) {
                            this.closeDialogue();
                        } else if (this.dialogueManager.isActive && !this.dialogueManager.showingMenu) {
                            this.showDialogueUI();
                        }
                    } else {
                        this.advanceDialogue();
                    }
                } else if (now - this.lastInteractionTime > 500) {
                    const npcInteracted = this.tryInteract();
                    if (!npcInteracted) {
                        this.tryInteractWithObjects();
                    }
                    this.lastInteractionTime = now;
                }
                break;

            case 'ArrowUp':
            case 'ArrowDown':
            case 'KeyW':
            case 'KeyS':
                if (this.dialogueManager.showingMenu) {
                    e.preventDefault();
                    const direction = (e.code === 'ArrowUp' || e.code === 'KeyW') ? 'up' : 'down';
                    this.dialogueManager.navigateMenu(direction);
                    this.renderMenu();
                }
                break;

            case 'Escape':
                // Escape handling is centralized in setupEventListeners global listener
                // to manage closing/opening UI overlays. No action here to avoid duplication.
                break;
        }
    }

    tryInteractWithObjects() {
        const currentChar = this.gameState.getCurrentCharacter();
        const interactionRange = this.tileSize * 1.5;

        // Check for nearby chests
        for (const chest of this.chests) {
            if (!chest.opened) {
                const dx = this.player.x - chest.x;
                const dy = this.player.y - chest.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < interactionRange) {
                    // Check if this chest requires a logic puzzle
                    if (chest.requiresPuzzle) {
                        // Check if character is restricted
                        if (chest.restrictedTo && !chest.restrictedTo.includes(currentChar.id)) {
                            this.showFloatingText(chest.x + this.tileSize/2, chest.y, 'Only Opal or Austine can open this', '#ff6666');
                            return;
                        }
                        // Set puzzle type based on chest item
                        // If puzzle is already solved, just open the chest
                        if (chest.puzzleSolved) {
                            // Check if item is character-restricted
                            if (chest.item === 'opalMap' && currentChar.id !== 'opal') {
                                this.showFloatingText(chest.x + this.tileSize/2, chest.y, 'Only Opal can pick up this map!', '#ff6666');
                                return;
                            }
                            if (chest.item === 'austineMap' && currentChar.id !== 'austine') {
                                this.showFloatingText(chest.x + this.tileSize/2, chest.y, 'Only Austine can pick up this map!', '#ff6666');
                                return;
                            }

                            chest.opened = true;
                            this.gameState.addToInventory(currentChar.id, chest.item);
                            this.showFloatingText(chest.x + this.tileSize/2, chest.y, `Found ${chest.item}!`, '#FFD700');

                            // Update quest items
                            if (chest.item === 'opalMap' && this.gameState.gameItems && this.gameState.gameItems.opalMap) {
                                this.gameState.gameItems.opalMap.found = true;
                                // Complete Opal's quest
                                if (this.gameState.checkQuestCompletion('opal')) {
                                    this.gameState.completeQuest('opal');
                                    this.showFloatingText(chest.x + this.tileSize/2, chest.y - 40, 'Quest Complete!', '#00ff00');
                                }
                            } else if (chest.item === 'austineMap' && this.gameState.gameItems && this.gameState.gameItems.austineMap) {
                                this.gameState.gameItems.austineMap.found = true;
                            }

                            this.saveChestStates();
                            this.gameState.save();
                            return;
                        }

                        // Set puzzle type based on chest item
                        this.logicPuzzle.puzzleType = chest.item === 'opalMap' ? 'rowcol' : 'neighbor';
                        // Start logic puzzle
                        this.currentPuzzleChest = chest;
                        this.logicPuzzle.start(currentChar.id);
                        return;
                    }

                    // Open chest and add item to inventory
                    chest.opened = true;
                    this.gameState.addToInventory(currentChar.id, chest.item);
                    this.showFloatingText(chest.x + this.tileSize/2, chest.y, `Found ${chest.item}!`, '#FFD700');

                    // Update quest items if needed
                    if (chest.item === 'puzzlePiece' && this.gameState.gameItems && this.gameState.gameItems.puzzlePiece) {
                        this.gameState.gameItems.puzzlePiece.found = true;
                    }

                    this.saveChestStates();
                    this.gameState.save();
                    return;
                }
            }
        }

        // Check for nearby boulders (Opal only)
        if (currentChar.id === 'opal') {
            for (const boulder of this.boulders) {
                const dx = this.player.x - boulder.x;
                const dy = this.player.y - boulder.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < interactionRange) {
                    // Push boulder in the direction player is facing
                    let pushX = 0;
                    let pushY = 0;

                    if (this.player.direction === 'up') pushY = -this.tileSize;
                    else if (this.player.direction === 'down') pushY = this.tileSize;
                    else if (this.player.direction === 'left') pushX = -this.tileSize;
                    else if (this.player.direction === 'right') pushX = this.tileSize;

                    const newBoulderX = boulder.x + pushX;
                    const newBoulderY = boulder.y + pushY;

                    // Check if new position is valid (not colliding with walls, other boulders, etc.)
                    const boulderTileX = Math.floor(newBoulderX / this.tileSize);
                    const boulderTileY = Math.floor(newBoulderY / this.tileSize);

                    if (boulderTileY >= 0 && boulderTileY < this.mapRows &&
                        boulderTileX >= 0 && boulderTileX < this.mapCols) {
                        const tileType = this.mapTiles[boulderTileY][boulderTileX];
                        if (tileType === 0) {
                            // Move boulder
                            boulder.x = newBoulderX;
                            boulder.y = newBoulderY;
                            this.showFloatingText(boulder.x + this.tileSize/2, boulder.y, 'Pushed!', '#6a5a7a');
                        } else {
                            this.showFloatingText(boulder.x + this.tileSize/2, boulder.y, 'Cannot push here', '#ff6666');
                        }
                    }
                    return;
                }
            }
        }

        // Check for nearby obstacles (Opal only)
        if (currentChar.id === 'opal') {
            for (const obstacle of this.obstacles) {
                if (!obstacle.broken) {
                    const dx = this.player.x - obstacle.x;
                    const dy = this.player.y - obstacle.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < interactionRange) {
                        // Break obstacle
                        obstacle.broken = true;
                        this.showFloatingText(obstacle.x + this.tileSize/2, obstacle.y, 'Smashed!', '#5a4a6a');
                        return;
                    }
                }
            }
        }

        // Check for nearby fillable chasms (Isabella only)
        if (currentChar.id === 'isabell') {
            for (const chasm of this.fillableChasms) {
                if (!chasm.filled) {
                    const dx = this.player.x - chasm.x;
                    const dy = this.player.y - chasm.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < interactionRange) {
                        // Check if Isabella has grist
                        if (this.gameState.grist >= 10) {
                            chasm.filled = true;
                            this.gameState.grist -= 10;
                            this.showFloatingText(chasm.x + this.tileSize/2, chasm.y, 'Chasm Filled!', '#4a3a5a');
                            this.gameState.save();
                        } else {
                            this.showFloatingText(chasm.x + this.tileSize/2, chasm.y, 'Need 10 grist', '#ff6666');
                        }
                        return;
                    }
                }
            }
        }
    }


    async loadSprites() {
        // Create sprite containers
        this.sprites = {
            characters: {},
            npcs: {},
            backgrounds: {}
        };

        // Build simple 4-frame walking animations per direction for each character
        // Frames are procedurally drawn stick-figure humans using the theme color
        for (const charId of Object.keys(CHARACTERS)) {
            const color = this.characters[charId].color;
            this.sprites.characters[charId] = this.createHumanSpriteSheet(color);
        }

        // Load NPC sprites (procedural human in gray or provided color)
        for (const npc of this.npcs) {
            this.sprites.npcs[npc.id] = this.createHumanSpriteSheet(npc.color || '#888');
        }

        // Generate a procedural background and cache it
        this.sprites.backgrounds.main = this.createBackgroundSprite();

        this.spritesLoaded = true;
    }

    // Human sprite sheet generator: 4 directions x 4 frames = 16 tiles
    // Each frame is 32x32, sheet is 128x128
    createHumanSpriteSheet(color) {
        const tile = 32;
        const cols = 4; // frames per direction
        const rows = 4; // directions: 0=down,1=left,2=right,3=up
        const canvas = document.createElement('canvas');
        canvas.width = tile * cols;
        canvas.height = tile * rows;
        const ctx = canvas.getContext('2d');

        // Draw a simple human made of shapes: head, body, limbs
        // Vary limb positions by frame to simulate a walk cycle
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * tile;
                const y = row * tile;
                this.drawHumanFrame(ctx, x, y, tile, color, row, col);
            }
        }
        return canvas;
    }

    // row = direction, col = frame
    drawHumanFrame(ctx, x, y, size, color, direction, frame) {
        // Clear
        ctx.clearRect(x, y, size, size);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(x + size/2, y + size - 4, size/3, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body parameters
        const headR = 5;
        const bodyH = 12;
        const bodyW = 8;
        const centerX = x + size/2;
        const baseY = y + size/2;

        // Walk swing amount based on frame
        const swing = (frame === 0 || frame === 2) ? 2 : -2;

        // Colors
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        // Head
        ctx.beginPath();
        ctx.arc(centerX, baseY - 10, headR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Body
        ctx.fillStyle = color;
        ctx.fillRect(centerX - bodyW/2, baseY - bodyH/2, bodyW, bodyH);
        ctx.strokeRect(centerX - bodyW/2, baseY - bodyH/2, bodyW, bodyH);

        // Limb positions vary by direction
        // Arms
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        // Left arm
        ctx.moveTo(centerX - bodyW/2, baseY - bodyH/2 + 3);
        ctx.lineTo(centerX - bodyW/2 - 6, baseY - bodyH/2 + 3 + (direction === 1 ? swing : direction === 2 ? -swing : swing));
        // Right arm
        ctx.moveTo(centerX + bodyW/2, baseY - bodyH/2 + 3);
        ctx.lineTo(centerX + bodyW/2 + 6, baseY - bodyH/2 + 3 + (direction === 1 ? -swing : direction === 2 ? swing : -swing));
        ctx.stroke();

        // Legs
        ctx.beginPath();
        // Left leg
        ctx.moveTo(centerX - 3, baseY + bodyH/2);
        ctx.lineTo(centerX - 3 + (direction === 1 ? -swing : direction === 2 ? swing : -swing), baseY + bodyH/2 + 8);
        // Right leg
        ctx.moveTo(centerX + 3, baseY + bodyH/2);
        ctx.lineTo(centerX + 3 + (direction === 1 ? swing : direction === 2 ? -swing : swing), baseY + bodyH/2 + 8);
        ctx.stroke();

        // Face hint based on direction
        ctx.fillStyle = '#000';
        if (direction === 0) { // down
            ctx.fillRect(centerX - 3, baseY - 12, 2, 2);
            ctx.fillRect(centerX + 1, baseY - 12, 2, 2);
        } else if (direction === 3) { // up
            ctx.fillRect(centerX - 3, baseY - 12, 2, 2);
            ctx.fillRect(centerX + 1, baseY - 12, 2, 2);
        } else if (direction === 1) { // left
            ctx.fillRect(centerX - 4, baseY - 12, 2, 2);
        } else if (direction === 2) { // right
            ctx.fillRect(centerX + 2, baseY - 12, 2, 2);
        }
    }

    initializeMap() {
        for (let y = 0; y < this.mapRows; y++) {
            this.mapTiles[y] = [];
            for (let x = 0; x < this.mapCols; x++) {
                this.mapTiles[y][x] = 1;
            }
        }

        const createRoom = (startX, startY, width, height, walled = 0) => {
            for (let y = startY; y < startY + height; y++) {
                for (let x = startX; x < startX + width; x++) {
                    if (x >= 0 && x < this.mapCols && y >= 0 && y < this.mapRows) {
                        this.mapTiles[y][x] = 0;
                    }
                }
            }

            if (walled === 1) {
                for (let x = startX; x < startX + width; x++) {
                    if (x >= 0 && x < this.mapCols) {
                        if (startY >= 0 && startY < this.mapRows) {
                            this.mapTiles[startY][x] = 1;
                        }
                        if (startY + height - 1 >= 0 && startY + height - 1 < this.mapRows) {
                            this.mapTiles[startY + height - 1][x] = 1;
                        }
                    }
                }
                for (let y = startY; y < startY + height; y++) {
                    if (y >= 0 && y < this.mapRows) {
                        if (startX >= 0 && startX < this.mapCols) {
                            this.mapTiles[y][startX] = 1;
                        }
                        if (startX + width - 1 >= 0 && startX + width - 1 < this.mapCols) {
                            this.mapTiles[y][startX + width - 1] = 1;
                        }
                    }
                }
            }
        };

        const createGap = (startX, startY, width, height) => {
            for (let y = startY; y < startY + height; y++) {
                for (let x = startX; x < startX + width; x++) {
                    if (x >= 0 && x < this.mapCols && y >= 0 && y < this.mapRows) {
                        this.mapTiles[y][x] = 2;
                    }
                }
            }
        };

        
        createGap(0, 0, 160, 160,1);
        createRoom(65, 65, 30, 30,1);
        createRoom(5, 65, 30, 30,1);
        createRoom(5, 5, 30, 30,1);
        createRoom(65, 5, 30, 30,1);
        createRoom(125, 65, 30, 30,1);
        createRoom(65, 125, 30, 30,1);
        createRoom(125, 125, 30, 30,1);
        createRoom(125, 5, 30, 30,1);
        createRoom(5, 125, 30, 30,1);

        createRoom(17, 35, 6, 30,1);
        createRoom(17, 95, 6, 30,1);
        createRoom(137, 35, 6, 30,1);
        createRoom(137, 95, 6, 30,1);
        createRoom(35, 17, 30, 6,1);
        createRoom(35, 137, 30, 6,1);
        createRoom(95, 137, 30, 6,1);
        createRoom(77, 95, 6, 30,1);

        createRoom(18, 34, 4, 32);
        createRoom(18, 94, 4, 32);
        createRoom(138, 34, 4, 32);
        createRoom(138, 94, 4, 32);
        createRoom(34, 18, 32, 4);
        createRoom(34, 138, 32, 4);
        createRoom(94, 138, 32, 4);
        createRoom(78, 94, 4, 32);

        this.boulders = [
            { x: 78 * this.tileSize, y: 83 * this.tileSize },
            { x: 82 * this.tileSize, y: 85 * this.tileSize },
            { x: 86 * this.tileSize, y: 87 * this.tileSize },
            { x: 80 * this.tileSize, y: 91 * this.tileSize },
            { x: 84 * this.tileSize, y: 93 * this.tileSize },

            { x: 15 * this.tileSize, y: 83 * this.tileSize },
            { x: 18 * this.tileSize, y: 86 * this.tileSize },
            { x: 22 * this.tileSize, y: 89 * this.tileSize },
            { x: 25 * this.tileSize, y: 92 * this.tileSize },

            { x: 75 * this.tileSize, y: 23 * this.tileSize },
            { x: 78 * this.tileSize, y: 26 * this.tileSize },
            { x: 82 * this.tileSize, y: 29 * this.tileSize },
            { x: 86 * this.tileSize, y: 32 * this.tileSize },
            { x: 90 * this.tileSize, y: 35 * this.tileSize },
        ];

        this.obstacles = [
            { x: 76 * this.tileSize, y: 83 * this.tileSize, broken: false },
            { x: 80 * this.tileSize, y: 85 * this.tileSize, broken: false },
            { x: 84 * this.tileSize, y: 87 * this.tileSize, broken: false },
            { x: 88 * this.tileSize, y: 89 * this.tileSize, broken: false },
            { x: 82 * this.tileSize, y: 92 * this.tileSize, broken: false },

            { x: 115 * this.tileSize, y: 83 * this.tileSize, broken: false },
            { x: 118 * this.tileSize, y: 85 * this.tileSize, broken: false },
            { x: 122 * this.tileSize, y: 87 * this.tileSize, broken: false },
            { x: 126 * this.tileSize, y: 89 * this.tileSize, broken: false },
            { x: 130 * this.tileSize, y: 91 * this.tileSize, broken: false },

            { x: 12 * this.tileSize, y: 133 * this.tileSize, broken: false },
            { x: 15 * this.tileSize, y: 135 * this.tileSize, broken: false },
            { x: 18 * this.tileSize, y: 137 * this.tileSize, broken: false },
            { x: 22 * this.tileSize, y: 139 * this.tileSize, broken: false },

            { x: 142 * this.tileSize, y: 138 * this.tileSize, broken: false },
            { x: 145 * this.tileSize, y: 140 * this.tileSize, broken: false },
            { x: 148 * this.tileSize, y: 142 * this.tileSize, broken: false },
            { x: 152 * this.tileSize, y: 144 * this.tileSize, broken: false },
            { x: 156 * this.tileSize, y: 146 * this.tileSize, broken: false },
        ];

        this.fillableChasms = [
            { x: 145 * this.tileSize, y: 33 * this.tileSize, filled: false },
            { x: 146 * this.tileSize, y: 33 * this.tileSize, filled: false },
            { x: 147 * this.tileSize, y: 33 * this.tileSize, filled: false },
            { x: 148 * this.tileSize, y: 33 * this.tileSize, filled: false },
            { x: 149 * this.tileSize, y: 33 * this.tileSize, filled: false },
            { x: 150 * this.tileSize, y: 33 * this.tileSize, filled: false },
            { x: 151 * this.tileSize, y: 37 * this.tileSize, filled: false },
            { x: 152 * this.tileSize, y: 37 * this.tileSize, filled: false },
            { x: 153 * this.tileSize, y: 37 * this.tileSize, filled: false },
            { x: 154 * this.tileSize, y: 37 * this.tileSize, filled: false },

            { x: 15 * this.tileSize, y: 38 * this.tileSize, filled: false },
            { x: 16 * this.tileSize, y: 38 * this.tileSize, filled: false },
            { x: 17 * this.tileSize, y: 38 * this.tileSize, filled: false },
            { x: 18 * this.tileSize, y: 38 * this.tileSize, filled: false },
            { x: 19 * this.tileSize, y: 38 * this.tileSize, filled: false },
            { x: 20 * this.tileSize, y: 38 * this.tileSize, filled: false },
            { x: 18 * this.tileSize, y: 45 * this.tileSize, filled: false },
            { x: 19 * this.tileSize, y: 45 * this.tileSize, filled: false },
            { x: 20 * this.tileSize, y: 45 * this.tileSize, filled: false },
            { x: 21 * this.tileSize, y: 45 * this.tileSize, filled: false },
        ];

        this.chests = [
            { x: 82 * this.tileSize, y: 87 * this.tileSize, opened: false, item: 'puzzlePiece' },

            { x: 22 * this.tileSize, y: 87 * this.tileSize, opened: false, item: 'lostAnimal' },

            { x: 82 * this.tileSize, y: 142 * this.tileSize, opened: false, item: 'notebook' },

            { x: 82 * this.tileSize, y: 27 * this.tileSize, opened: false, item: 'opalMap', requiresPuzzle: true, restrictedTo: ['opal', 'austine'] },

            { x: 152 * this.tileSize, y: 37 * this.tileSize, opened: false, item: 'austineMap', requiresPuzzle: true, restrictedTo: ['opal', 'austine'] },

            { x: 122 * this.tileSize, y: 87 * this.tileSize, opened: false, item: 'ancientArtifact' },

            { x: 20 * this.tileSize, y: 42 * this.tileSize, opened: false, item: 'magicalCrystal' },

            { x: 147 * this.tileSize, y: 142 * this.tileSize, opened: false, item: 'heroicSword' },

            { x: 17 * this.tileSize, y: 135 * this.tileSize, opened: false, item: 'shieldOfValor' },

            { x: 122 * this.tileSize, y: 42 * this.tileSize, opened: false, item: 'mysticalOrb' },
        ];
    }

    createBackgroundSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = this.mapWidth;
        canvas.height = this.mapHeight;
        const ctx = canvas.getContext('2d');

        // Create purple Derse-themed tiled background with patterns
        const tileSize = 64;
        for (let x = 0; x < this.mapWidth; x += tileSize) {
            for (let y = 0; y < this.mapHeight; y += tileSize) {
                const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
                // Purple color palette
                ctx.fillStyle = isEven ? '#2a1a3a' : '#1a0a2a';
                ctx.fillRect(x, y, tileSize, tileSize);

                // Add Derse-like checkerboard pattern
                ctx.fillStyle = isEven ? '#3a2a4a' : '#2a1a3a';
                const patternSize = 8;
                for (let px = 0; px < tileSize; px += patternSize * 2) {
                    for (let py = 0; py < tileSize; py += patternSize * 2) {
                        if ((px / patternSize + py / patternSize) % 2 === 0) {
                            ctx.fillRect(x + px, y + py, patternSize, patternSize);
                        }
                    }
                }
            }
        }

        // Add decorative purple patches
        ctx.fillStyle = '#4a3a5a';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.mapWidth;
            const y = Math.random() * this.mapHeight;
            const size = 20 + Math.random() * 40;
            ctx.fillRect(x, y, size, size);
        }

        return canvas;
    }

    update() {
        if (!this.isGameRunning || this.showingDialogue || this.showingSwitchPrompt) return;

        // Update logic puzzle if active
        if (this.logicPuzzle && this.logicPuzzle.active) {
            this.logicPuzzle.update();
            return;
        }

        // Update mini-game if active
        if (this.inMiniGame && this.miniGame) {
            this.miniGame.update();
            return;
        }

        this.updatePlayerMovement();
        this.updateCamera();
        this.updateAnimations();
        this.checkForInteractions();
        this.checkForItemPickups();
        this.checkForCombatEncounters();
        this.updateFloatingTexts();

        // Update UI
        this.updateInventoryUI();
        this.updateQuestUI();
        this.updateAbilitiesUI();
    }

    updateFloatingTexts() {
        if (!this.floatingTexts) return;

        this.floatingTexts = this.floatingTexts.filter(text => {
            text.y -= 1;
            text.alpha -= 0.016;
            text.lifetime--;
            return text.lifetime > 0 && text.alpha > 0;
        });
    }

    checkForItemPickups() {
        if (!this.gameState || !this.gameState.gameItems) return;

        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        const pickupDistance = 40;

        for (const [itemId, itemData] of Object.entries(this.gameState.gameItems)) {
            if (!itemData.collected) {
                const dx = playerCenterX - (itemData.x + 16);
                const dy = playerCenterY - (itemData.y + 16);
                const distance = Math.hypot(dx, dy);

                if (distance < pickupDistance) {
                    this.gameState.pickupItem(itemId);
                    this.updateInventoryUI();
                    this.updateQuestUI();
                }
            }
        }
    }

    checkForCombatEncounters() {
        if (this.inCombat || !this.gameState) return;

        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        const encounterDistance = 40;

        if (this.gameState.combatStats.agentsDefeated < 3) {
            const agents = [
                { x: 750, y: 750 },
                { x: 1280, y: 320 },
                { x: 1280, y: 1280 }
            ];

            const defeatedCount = this.gameState.combatStats.agentsDefeated || 0;
            for (let i = defeatedCount; i < agents.length; i++) {
                const agent = agents[i];
                const dx = playerCenterX - (agent.x + 16);
                const dy = playerCenterY - (agent.y + 16);
                const distance = Math.hypot(dx, dy);

                if (distance < encounterDistance) {
                    this.startCombat();
                    break;
                }
            }
        }
    }

    startCombat() {
        this.inCombat = true;
        const combatUI = document.getElementById('combatUI');
        if (combatUI) combatUI.style.display = 'block';

        const currentChar = this.gameState.getCurrentCharacter();
        this.combatSystem.startCombat('derseAgent');

        document.getElementById('playerName').textContent = currentChar.name;
        document.getElementById('playerHP').textContent = this.combatSystem.playerHP;
        document.getElementById('playerMaxHP').textContent = this.combatSystem.playerMaxHP;
        document.getElementById('enemyName').textContent = 'Derse Agent';
        document.getElementById('enemyHP').textContent = this.combatSystem.enemyHP;
        document.getElementById('enemyMaxHP').textContent = this.combatSystem.enemyMaxHP;

        const moves = this.combatSystem.getMoves(currentChar.id);
        const moveButtons = document.querySelectorAll('.combatMove');
        moveButtons.forEach((btn, index) => {
            if (moves[index]) {
                btn.textContent = `${moves[index].name} (${moves[index].damage})`;
                btn.onclick = () => this.useCombatMove(index);
            }
        });
    }

    useCombatMove(moveIndex) {
        const result = this.combatSystem.playerAttack(moveIndex);

        document.getElementById('playerHP').textContent = this.combatSystem.playerHP;
        document.getElementById('enemyHP').textContent = this.combatSystem.enemyHP;

        const logEl = document.getElementById('combatLog');
        if (logEl && result) {
            logEl.innerHTML += `<div>${result.message}</div>`;
            logEl.scrollTop = logEl.scrollHeight;
        }

        if (!this.combatSystem.inCombat && result) {
            setTimeout(() => this.endCombat(result.playerWon), 1500);
        }
    }



    endCombat(playerWon) {
        this.inCombat = false;
        const combatUI = document.getElementById('combatUI');
        if (combatUI) combatUI.style.display = 'none';

        const logEl = document.getElementById('combatLog');
        if (logEl) logEl.innerHTML = '';

        if (playerWon) {
            this.updateQuestUI();
        }
    }

    updatePlayerMovement() {
        // Prevent movement during combat
        if (this.inCombat) return;
        if (this.dialogueManager.showingMenu) return;

        let dx = 0;
        let dy = 0;

        const base = this.player.speed;
        // Slight diagonal normalization so diagonals aren't too fast
        const vertical = (this.keys['KeyW'] || this.keys['ArrowUp']) || (this.keys['KeyS'] || this.keys['ArrowDown']);
        const horizontal = (this.keys['KeyA'] || this.keys['ArrowLeft']) || (this.keys['KeyD'] || this.keys['ArrowRight']);
        const step = (vertical && horizontal) ? base * 0.82 : base;

        // Handle input
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            dy = -step;
            this.player.direction = 'up';
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            dy = step;
            this.player.direction = 'down';
        }
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            dx = -step;
            this.player.direction = 'left';
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            dx = step;
            this.player.direction = 'right';
        }

        this.player.isMoving = dx !== 0 || dy !== 0;

        // Calculate new position with bounds checking
        let newX = Math.max(0, Math.min(this.mapWidth - this.player.width, this.player.x + dx));
        let newY = Math.max(0, Math.min(this.mapHeight - this.player.height, this.player.y + dy));

        // Check collision with map tiles (walls and chasms)
        const playerTileLeft = Math.floor(newX / this.tileSize);
        const playerTileRight = Math.floor((newX + this.player.width - 1) / this.tileSize);
        const playerTileTop = Math.floor(newY / this.tileSize);
        const playerTileBottom = Math.floor((newY + this.player.height - 1) / this.tileSize);

        for (let ty = playerTileTop; ty <= playerTileBottom; ty++) {
            for (let tx = playerTileLeft; tx <= playerTileRight; tx++) {
                if (ty >= 0 && ty < this.mapRows && tx >= 0 && tx < this.mapCols) {
                    const tileType = this.mapTiles[ty][tx];
                    if (tileType === 1 || tileType === 2) {
                        // Wall or chasm - block movement
                        return;
                    }
                }
            }
        }

        // Check collision with boulders
        for (const boulder of this.boulders) {
            if (newX < boulder.x + this.tileSize &&
                newX + this.player.width > boulder.x &&
                newY < boulder.y + this.tileSize &&
                newY + this.player.height > boulder.y) {
                // Collision with boulder - block movement
                return;
            }
        }

        // Check collision with obstacles
        for (const obstacle of this.obstacles) {
            if (!obstacle.broken) {
                if (newX < obstacle.x + this.tileSize &&
                    newX + this.player.width > obstacle.x &&
                    newY < obstacle.y + this.tileSize &&
                    newY + this.player.height > obstacle.y) {
                    // Collision with unbroken obstacle - block movement
                    return;
                }
            }
        }

        // Check collision with fillable chasms (unfilled)
        for (const chasm of this.fillableChasms) {
            if (!chasm.filled) {
                if (newX < chasm.x + this.tileSize &&
                    newX + this.player.width > chasm.x &&
                    newY < chasm.y + this.tileSize &&
                    newY + this.player.height > chasm.y) {
                    // Collision with unfilled chasm - block movement
                    return;
                }
            }
        }

        // Check collision with agents
        if (this.gameState && this.gameState.combatStats.agentsDefeated < 3) {
            const agents = [
                { x: 750, y: 750 },
                { x: 1280, y: 320 },
                { x: 1280, y: 1280 }
            ];

            const defeatedCount = this.gameState.combatStats.agentsDefeated || 0;
            for (let i = defeatedCount; i < agents.length; i++) {
                const agent = agents[i];
                const tileSize = 32;

                // Check if new position would collide with agent
                if (newX < agent.x + tileSize &&
                    newX + this.player.width > agent.x &&
                    newY < agent.y + tileSize &&
                    newY + this.player.height > agent.y) {
                    // Collision detected, don't move
                    return;
                }
            }
        }

        // Apply movement
        this.player.x = newX;
        this.player.y = newY;

        // Save current player position to game state
        const currentChar = this.gameState.getCurrentCharacter();
        if (currentChar && currentChar.id) {
            this.gameState.characterPositions[currentChar.id] = { x: this.player.x, y: this.player.y };
        }
    }

    showDialogueUI() {
        if (this.dialogueManager.showingMenu) {
            this.renderMenu();
            return;
        }

        const current = this.dialogueManager.getCurrentLine();
        const npc = this.dialogueManager.getCurrentNPC();
        const currentChar = this.gameState.getCurrentCharacter();

        if (current && npc) {
            // Back-and-forth visual treatment
            this.dialogueText.textContent = current.text;

            // Determine colors from global theme and character theme
            const playerColor = currentChar.color;
            const npcColor = npc.color || '#888';
            // Style dialogue text color based on the current speaker
            if (this.dialogueText) {
                this.dialogueText.style.color = current.speaker === 'player' ? playerColor : npcColor;
            }

            // Toggle speaker highlight classes on dialogue box
            if (this.dialogueBox) {
                this.dialogueBox.classList.toggle('speaker-player', current.speaker === 'player');
                this.dialogueBox.classList.toggle('speaker-npc', current.speaker === 'npc');
                this.dialogueBox.style.display = 'block';
            }
        }
    }

    renderMenu() {
        const npc = this.dialogueManager.getCurrentNPC();
        const options = this.dialogueManager.menuOptions;
        const selectedIdx = this.dialogueManager.selectedMenuOption;

        if (!npc || !options || !this.dialogueBox || !this.dialogueText) {
            return;
        }

        let menuHTML = `<div style="text-align: center; color: ${npc.color || '#888'}; margin-bottom: 15px;"><strong>${npc.name}</strong></div>`;
        menuHTML += '<div style="display: flex; flex-direction: column; gap: 10px;" id="menuOptionsContainer">';

        options.forEach((option, idx) => {
            const isSelected = idx === selectedIdx;
            const isEnabled = option.enabled;
            const cursor = isSelected ? '> ' : '  ';
            const color = !isEnabled ? '#555' : (isSelected ? '#fff' : '#aaa');
            const weight = isSelected ? 'bold' : 'normal';
            const cursorStyle = isEnabled ? 'pointer' : 'default';
            const hoverStyle = isEnabled ? 'transition: transform 0.1s;' : '';

            menuHTML += `<div
                data-option-idx="${idx}"
                data-option-id="${option.id}"
                data-enabled="${isEnabled}"
                style="color: ${color}; font-weight: ${weight}; opacity: ${isEnabled ? 1 : 0.5}; cursor: ${cursorStyle}; ${hoverStyle}"
                class="menu-option">${cursor}${option.label}</div>`;
        });

        menuHTML += '</div>';
        menuHTML += '<div style="text-align: center; margin-top: 15px; font-size: 12px; color: #888;">↑↓/WS to navigate, SPACE/Click to select</div>';

        this.dialogueText.innerHTML = menuHTML;
        this.dialogueBox.style.display = 'block';
        this.dialogueBox.classList.remove('speaker-player', 'speaker-npc');

        this.attachMenuEventListeners();
    }

    attachMenuEventListeners() {
        const menuOptions = this.dialogueText.querySelectorAll('.menu-option');

        menuOptions.forEach((optionElement, idx) => {
            const isEnabled = optionElement.getAttribute('data-enabled') === 'true';

            if (isEnabled) {
                optionElement.addEventListener('mouseenter', () => {
                    this.dialogueManager.selectedMenuOption = idx;
                    this.renderMenu();
                });

                optionElement.addEventListener('click', () => {
                    const optionId = optionElement.getAttribute('data-option-id');
                    this.dialogueManager.selectMenuOption(optionId);
                    if (!this.dialogueManager.showingMenu && !this.dialogueManager.isActive) {
                        this.closeDialogue();
                    } else if (this.dialogueManager.isActive && !this.dialogueManager.showingMenu) {
                        this.showDialogueUI();
                    }
                });
            }
        });
    }

    updateCamera() {
        // Center camera on player, but handle map edges
        const centerX = this.player.x + this.player.width / 2;
        const centerY = this.player.y + this.player.height / 2;

        // Calculate desired camera position
        let targetCameraX = centerX - this.camera.width / 2;
        let targetCameraY = centerY - this.camera.height / 2;

        // Clamp camera to map bounds
        targetCameraX = Math.max(0, Math.min(this.mapWidth - this.camera.width, targetCameraX));
        targetCameraY = Math.max(0, Math.min(this.mapHeight - this.camera.height, targetCameraY));

        // Smooth camera movement
        this.camera.x += (targetCameraX - this.camera.x) * 0.1;
        this.camera.y += (targetCameraY - this.camera.y) * 0.1;
    }

    updateAnimations() {
        if (this.player.isMoving) {
            this.player.animationTimer++;
            if (this.player.animationTimer > 10) {
                this.player.animationFrame = (this.player.animationFrame + 1) % 4;
                this.player.animationTimer = 0;
            }
        } else {
            this.player.animationFrame = 0;
        }
    }

    checkForInteractions() {
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        const interactionDistance = 50;

        // Check for nearby NPCs
        for (const npc of this.npcs) {
            const dx = playerCenterX - (npc.position.x + 16);
            const dy = playerCenterY - (npc.position.y + 16);
            const distance = Math.hypot(dx, dy);

            if (distance < interactionDistance) {
                // Show interaction hint (could add UI element here)
                return;
            }
        }
    }

    tryInteract() {
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        const interactionDistance = 50;

        let closestNPC = null;
        let closestDistance = interactionDistance;

        for (const npc of this.npcs) {
            if (npc.id === this.gameState.currentCharacter) continue;

            const dx = playerCenterX - (npc.position.x + 16);
            const dy = playerCenterY - (npc.position.y + 16);
            const distance = Math.hypot(dx, dy);

            if (distance < closestDistance) {
                closestNPC = npc;
                closestDistance = distance;
            }
        }

        if (closestNPC) {
            this.showInteractionMenu(closestNPC.id);
            return true;
        }

        return false;
    }

    showInteractionMenu(npcId) {
        if (this.dialogueManager.showInteractionMenu(npcId)) {
            this.showingDialogue = true;
            this.showDialogueUI();
        }
    }

    startDialogue(npcId) {
        if (this.dialogueManager.startDialogue(npcId)) {
            // Track last talked-to NPC for switching logic
            if (this.gameState && typeof this.gameState.setLastTalkedNPC === 'function') {
                this.gameState.setLastTalkedNPC(npcId);
                if (typeof this.gameState.save === 'function') {
                    this.gameState.save();
                }
            }

            this.showingDialogue = true;
            this.showDialogueUI();
        }
    }

    advanceDialogue() {
        const result = this.dialogueManager.nextLine();

        if (result && typeof result === 'object' && result.action === 'minigame') {
            this.closeDialogue();
            this.dialogueManager.pendingSwitch = result.target;
            this.startSwitchMiniGame();
        } else if (!result) {
            this.closeDialogue();
        } else {
            const current = this.dialogueManager.getCurrentLine();
            const npc = this.dialogueManager.getCurrentNPC();
            const currentChar = this.gameState.getCurrentCharacter();

            if (current && npc) {
                if (this.dialogueText) {
                    this.dialogueText.textContent = current.text;
                    this.dialogueText.style.color = (current.speaker === 'player') ? currentChar.color : (npc.color || '#888');
                }

                if (this.dialogueBox) {
                    this.dialogueBox.classList.toggle('speaker-player', current.speaker === 'player');
                    this.dialogueBox.classList.toggle('speaker-npc', current.speaker === 'npc');
                    this.dialogueBox.style.display = 'block';
                }
            }
        }
    }


    closeDialogue() {
        this.showingDialogue = false;
        if (this.dialogueBox) this.dialogueBox.style.display = 'none';

        // If there is a last-talked NPC recorded, unlock them as a playable character
        // (but do not unlock if they are marked as the final character).
        const lastId = this.gameState.lastNPCTalkedId;
        if (lastId && CHARACTERS[lastId] && !CHARACTERS[lastId].isFinalCharacter) {
            if (typeof this.gameState.unlockCharacter === 'function') {
                this.gameState.unlockCharacter(lastId);
            }
            if (typeof this.gameState.save === 'function') {
                this.gameState.save();
            }
        }

        // Trigger Nicholas mini-game prompt after talking to him
        if (lastId === 'nicholas' && !this.inMiniGame && this.gameState.miniGameScores.nicholas < 5) {
            setTimeout(() => {
                this.showMiniGamePrompt();
            }, 500);
            return;
        }

        // Check if all interactions are complete (remaining === 0)
        // If so, and we're not Victor, fade out the music
        const remaining = (this.gameState && typeof this.gameState.getRemainingInteractionsToFinishGame === 'function')
            ? this.gameState.getRemainingInteractionsToFinishGame()
            : 1;
        const currentChar = this.gameState.getCurrentCharacter();

        if (remaining === 0 && currentChar && currentChar.id !== 'victor') {
            // All 49 interactions complete and not playing as Victor - fade out music
            if (this.audioManager && typeof this.audioManager.fadeOutAndStop === 'function') {
                this.audioManager.fadeOutAndStop(2500); // 2.5 second fade
            }
        }

        // Show switch prompt after dialogue closes (with a short delay)
        setTimeout(() => {
            this.showSwitchPrompt();
        }, 400);

        // Refresh settings panel progress if open
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal && settingsModal.style.display === 'block' && typeof this.updateSettingsPanel === 'function') {
            this.updateSettingsPanel();
        }
    }

    showSwitchPrompt() {
        const currentChar = this.gameState.getCurrentCharacter();

        // Determine who we are allowed to propose as a switch target under strict rules
        // Rule 1: If Until game complete > 0, Victor must NEVER be proposed.
        // Rule 2: If Until game complete == 0 AND we have spoken to Victor as this character,
        //         and the current interaction was with Victor, then propose Victor.
        // Rule 3: Otherwise, propose ONLY the last non-final NPC we actually interacted with (not self).

        const remaining = (this.gameState && typeof this.gameState.getRemainingInteractionsToFinishGame === 'function')
            ? this.gameState.getRemainingInteractionsToFinishGame()
            : 1;
        const spokeVictor = (this.gameState && typeof this.gameState.hasCompletedDialogue === 'function')
            ? this.gameState.hasCompletedDialogue(this.gameState.currentCharacter, 'victor')
            : false;
        const lastTalked = this.gameState && this.gameState.lastNPCTalkedId;

        // NEW: If we just talked to Victor but the unlock criteria aren't met, don't show any prompt
        if (lastTalked === 'victor') {
            // Only show prompt if Victor's unlock criteria are fully met
            if (!(remaining === 0 && spokeVictor && this.gameState.canSwitchToCharacter && this.gameState.canSwitchToCharacter('victor'))) {
                return; // Don't show switch prompt when talking to Victor unless unlock criteria met
            }
        }

        let targetId = null;
        if (remaining === 0 && spokeVictor && lastTalked === 'victor' && this.gameState.canSwitchToCharacter && this.gameState.canSwitchToCharacter('victor')) {
            targetId = 'victor';
        } else if (remaining > 0) {
            // Strict: only propose the last non-final NPC when they are eligible, never Victor
            if (this.gameState && typeof this.gameState.getLastSwitchTarget === 'function') {
                targetId = this.gameState.getLastSwitchTarget(currentChar.id);
            } else {
                targetId = null;
            }
        } else {
            // remaining == 0 but we either haven't spoken to Victor or last talk wasn't Victor.
            // In either case, fall back to strict non-final last target; do NOT propose Victor.
            if (this.gameState && typeof this.gameState.getLastSwitchTarget === 'function') {
                targetId = this.gameState.getLastSwitchTarget(currentChar.id);
            } else {
                targetId = null;
            }
        }

        // If there is no valid target under strict rules, do not show the prompt
        if (!targetId) return;

        const nextChar = CHARACTERS[targetId];
        if (!nextChar) return;

        const fromEl = document.getElementById('switchFromCharacter');
        const toEl = document.getElementById('switchToCharacter');
        if (fromEl) fromEl.textContent = currentChar.name;
        if (toEl) toEl.textContent = nextChar.name;

        // If a dialogue box is visible, hide it while showing the switch prompt
        if (this.dialogueBox) {
            this.dialogueBox.style.display = 'none';
        }

        this.showingSwitchPrompt = true;
        if (this.switchPrompt) this.switchPrompt.style.display = 'block';
        this.nextCharacterToSwitch = nextChar.id;
    }

    handleCharacterSwitch(confirmed) {
        this.showingSwitchPrompt = false;
        if (this.switchPrompt) this.switchPrompt.style.display = 'none';

        if (confirmed && this.nextCharacterToSwitch) {
            const targetChar = CHARACTERS[this.nextCharacterToSwitch];

            // Special check for Nicholas - require mini-game completion
            if (this.nextCharacterToSwitch === 'nicholas' && this.gameState.miniGameScores.nicholas < 5) {
                this.showingDialogue = true;
                if (this.dialogueBox) {
                    this.dialogueBox.style.display = 'block';
                }
                if (this.dialogueText) {
                    this.dialogueText.textContent = "Hold on there. Before we switch, I need to know you can handle my abilities. Let me test your aim.";
                    this.dialogueText.style.color = CHARACTERS.nicholas.color;
                }

                setTimeout(() => {
                    this.showingDialogue = false;
                    if (this.dialogueBox) {
                        this.dialogueBox.style.display = 'none';
                    }
                    setTimeout(() => {
                        this.showMiniGamePrompt();
                    }, 300);
                }, 2500);
                return;
            }

            // If target is the final character (Victor), only allow when remaining == 0 and we just interacted with Victor
            const remaining = (this.gameState && typeof this.gameState.getRemainingInteractionsToFinishGame === 'function')
                ? this.gameState.getRemainingInteractionsToFinishGame()
                : 1;
            const lastTalked = this.gameState && this.gameState.lastNPCTalkedId;
            if (targetChar && targetChar.isFinalCharacter) {
                if (remaining === 0 && lastTalked === 'victor' && this.gameState.canSwitchToCharacter && this.gameState.canSwitchToCharacter('victor')) {
                    if (this.audioManager && typeof this.audioManager.playCharacterMusic === 'function') {
                        this.audioManager.playCharacterMusic('victor');
                    }
                    this.triggerGlitchEnding();
                    return;
                } else {
                    return;
                }
            }

            // Check if we can actually switch to this character (verify unlock criteria)
            if (!this.gameState.canSwitchToCharacter(this.nextCharacterToSwitch)) {
                // Show a message indicating why the switch is not allowed
                this.showingDialogue = true;
                if (this.dialogueBox) {
                    this.dialogueBox.style.display = 'block';
                }
                if (this.dialogueText) {
                    const reqMessage = this.getUnlockRequirementMessage(this.nextCharacterToSwitch);
                    this.dialogueText.textContent = reqMessage || "You cannot switch to this character yet. Complete their unlock requirements first.";
                    this.dialogueText.style.color = targetChar.color || '#ffffff';
                }
                setTimeout(() => {
                    this.showingDialogue = false;
                    if (this.dialogueBox) {
                        this.dialogueBox.style.display = 'none';
                    }
                }, 3000);
                return;
            }

            // Track which characters have been played for unlock conditions
            if (this.gameState.playedCharacters) {
                this.gameState.playedCharacters.add(this.nextCharacterToSwitch);
            }

            // Perform normal character switch with NPC swap logic
            const prevChar = this.gameState.getCurrentCharacter();
            const prevPos = { x: this.player.x, y: this.player.y };

            // Switch state
            this.switchToCharacter(this.nextCharacterToSwitch);

            // Track former swap partner mapping so that you don't need to talk to the person you just swapped from
            if (this.gameState && prevChar && targetChar) {
                if (!this.gameState.formerSwapPartnerByCharacter) this.gameState.formerSwapPartnerByCharacter = {};
                this.gameState.formerSwapPartnerByCharacter[targetChar.id] = prevChar.id;
            }

            // Remove any NPC that matches the new current character (since the player is now that character)
            const currentChar = this.gameState.getCurrentCharacter();
            this.npcs = this.npcs.filter(n => n.id !== (currentChar && currentChar.id));

            // Add an NPC where the player used to be (the old character appears at your previous position)
            const ghostNPC = {
                id: prevChar.id,
                name: prevChar.name,
                position: prevPos,
                color: prevChar.color,
            };

            // Replace old ghost if already present
            this.npcs = this.npcs.filter(n => n.id !== ghostNPC.id);
            this.npcs.push(ghostNPC);

            // Ensure sprite exists for ghost
            if (this.sprites) {
                if (!this.sprites.npcs) this.sprites.npcs = {};
                const existing = this.sprites.npcs && this.sprites.npcs[ghostNPC.id];
                this.sprites.npcs[ghostNPC.id] = existing || this.createHumanSpriteSheet(ghostNPC.color || '#888');
            }

            // Update DialogueManager NPC list
            if (this.dialogueManager) this.dialogueManager.npcs = this.npcs;

            // Apply new theme and music (keep UI consistent immediately after switching)
            if (this.gameState) {
                const active = this.gameState.getCurrentCharacter();
                if (active) {
                    this.applyCharacterTheme(active);
                    if (this.audioManager && typeof this.audioManager.playCharacterMusic === 'function') {
                        this.audioManager.playCharacterMusic(active.id);
                    }
                }
            }

            // Persist current NPC positions too (so ghost NPCs remain where you left them)
            if (Array.isArray(this.npcs) && this.gameState) {
                if (!this.gameState.characterPositions) this.gameState.characterPositions = {};
                for (const npc of this.npcs) {
                    if (npc && npc.id && npc.position) {
                        this.gameState.characterPositions[npc.id] = { x: npc.position.x, y: npc.position.y };
                    }
                }
                if (typeof this.gameState.save === 'function') this.gameState.save();
            }
        }

        this.nextCharacterToSwitch = null;
    }

    getUnlockRequirementMessage(characterId) {
        const character = CHARACTERS[characterId];
        if (!character || !character.quest) {
            return "You cannot switch to this character yet.";
        }

        const quest = character.quest;
        const unlockCriteria = quest.unlockCriteria;

        switch (unlockCriteria) {
            case 'startingCharacter':
                return `${character.name} is always available to switch to.`;

            case 'defeat3Agents':
                const defeated = this.gameState.combatStats.agentsDefeated || 0;
                return `You need to defeat 3 Derse agents to unlock ${character.name}. Currently defeated: ${defeated}/3`;

            case 'findPuzzlePiece':
                return `You need to find the puzzle piece to unlock ${character.name}. Look around the map!`;

            case 'bringLostAnimal':
                const hasAnimal = this.gameState.inventory[this.gameState.currentCharacter]?.includes('lostAnimal');
                return hasAnimal
                    ? `Bring the lost animal to ${character.name} to unlock them.`
                    : `You need to find and bring the lost animal to unlock ${character.name}.`;

            case 'talkToAll':
                const currentCharName = this.gameState.getCurrentCharacter().name;
                return `${currentCharName} needs to talk to all characters to unlock ${character.name}.`;

            case 'beatMiniGame':
                const score = this.gameState.miniGameScores.nicholas || 0;
                return `You need to beat Nicholas's mini-game (score 5+) to unlock him. Current score: ${score}/5`;

            case 'beOpalCompleted':
                return `Complete Opal's quest first to unlock ${character.name}.`;

            case 'playedAllCharacters':
                const playedCount = this.gameState.playedCharacters ? this.gameState.playedCharacters.size : 0;
                const totalNeeded = Object.keys(CHARACTERS).length - 1;
                return `Play as all other characters first to unlock ${character.name}. Played: ${playedCount}/${totalNeeded}`;

            default:
                return `You cannot switch to ${character.name} yet. Complete their unlock requirements first.`;
        }
    }

    switchToCharacter(characterId) {
        if (!this.gameState.canSwitchToCharacter(characterId)) return false;
        if (!CHARACTERS[characterId]) return false;

        const oldCharId = this.gameState.currentCharacter;

        // Save current player position before switching
        this.gameState.characterPositions[oldCharId] = {
            x: this.player.x,
            y: this.player.y
        };

        // Switch the character in game state
        if (this.gameState.switchCharacter(characterId)) {
            const newChar = this.gameState.getCurrentCharacter();

            // Rebuild NPCs list: remove new character, add old character
            this.npcs = NPCS.filter(npc => npc.id !== characterId).map(npc => ({ ...npc }));

            // Update NPC positions from saved state
            for (const npc of this.npcs) {
                const saved = this.gameState.characterPositions[npc.id];
                if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
                    npc.position = { x: saved.x, y: saved.y };
                }
            }

            // Update dialogue manager NPCs reference
            if (this.dialogueManager) this.dialogueManager.npcs = this.npcs;

            // Update player position to new character's saved position
            const savedPos = this.gameState.characterPositions[characterId];
            if (savedPos) {
                this.player.x = savedPos.x;
                this.player.y = savedPos.y;
            }

            // Update UI and theme
            this.updateCharacterUI();
            this.applyCharacterTheme(newChar);

            // Switch music
            this.audioManager.playCharacterMusic(characterId);

            // Unlock the character for future switches
            this.gameState.unlockCharacter(characterId);
            this.gameState.save();

            return true;
        }

        return false;
    }

    triggerGlitchEnding() {
        // FIRST: Switch to Victor before the glitch starts
        // This makes it feel like switching to Victor is what breaks reality
        const victorChar = CHARACTERS['victor'];
        if (victorChar && this.gameState.currentCharacter !== 'victor') {
            // Force switch to Victor
            this.gameState.currentCharacter = 'victor';
            this.gameState.unlockCharacter('victor');

            // Update player position to Victor's position
            const savedPos = this.gameState.characterPositions['victor'];
            if (savedPos) {
                this.player.x = savedPos.x;
                this.player.y = savedPos.y;
            }

            // Update UI and theme
            this.updateCharacterUI();
            this.applyCharacterTheme(victorChar);

            // Brief pause to let the theme transition start before glitching
            setTimeout(() => {
                this.startGlitchSequence();
            }, 500); // Half second delay to see Victor's theme start to apply
        } else {
            // Already Victor, start immediately
            this.startGlitchSequence();
        }
    }

    startGlitchSequence() {
        // Stop the normal game loop and start the glitch renderer instead
        this.isGameRunning = false;
        this.isGlitching = true;

        // Ensure Victor's music plays during the glitch (ending theme)
        if (this.audioManager && typeof this.audioManager.playCharacterMusic === 'function') {
            this.audioManager.playCharacterMusic('victor');
        }

        // Show the overlay for flashing visuals
        if (this.glitchOverlay) this.glitchOverlay.style.display = 'block';

        // Add extra glitchy effects to make it feel like reality is breaking
        this.addRealityBreakEffects();

        // Prepare glitch buffers and artifacts
        this.startGlitchEffect();

        // Kick off the glitch animation loop
        this.runGlitchLoop();
    }

    addRealityBreakEffects() {
        // Make the canvas shake/vibrate
        if (this.canvas) {
            this.canvas.style.animation = 'glitch-shake 0.3s infinite';
        }

        // Add random color shifts to the page
        const colorShiftInterval = setInterval(() => {
            if (!this.isGlitching) {
                clearInterval(colorShiftInterval);
                return;
            }

            // Random hue rotation
            const hue = Math.random() * 360;
            if (this.canvas) {
                this.canvas.style.filter = `hue-rotate(${hue}deg) saturate(${1 + Math.random() * 0.5})`;
            }
        }, 200);

        // Randomly invert colors briefly
        const invertInterval = setInterval(() => {
            if (!this.isGlitching) {
                clearInterval(invertInterval);
                return;
            }

            if (Math.random() < 0.3) { // 30% chance each interval
                if (this.canvas) {
                    this.canvas.style.filter = 'invert(1)';
                    setTimeout(() => {
                        if (this.canvas && this.isGlitching) {
                            this.canvas.style.filter = '';
                        }
                    }, 100);
                }
            }
        }, 400);

        // Make UI elements glitch out
        const uiElements = [
            document.getElementById('currentCharacter'),
            document.getElementById('ui'),
            document.getElementById('dialogueBox')
        ];

        const uiGlitchInterval = setInterval(() => {
            if (!this.isGlitching) {
                clearInterval(uiGlitchInterval);
                return;
            }

            uiElements.forEach(el => {
                if (el && Math.random() < 0.4) {
                    el.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
                    setTimeout(() => {
                        if (el) el.style.transform = '';
                    }, 100);
                }
            });
        }, 300);
    }

    startGlitchEffect() {
        // Take a snapshot of the current canvas to use as a source for stuck pixels
        if (!this.glitchFrozenCanvas) this.glitchFrozenCanvas = document.createElement('canvas');
        this.glitchFrozenCanvas.width = this.canvas.width;
        this.glitchFrozenCanvas.height = this.canvas.height;
        const gfc = this.glitchFrozenCanvas.getContext('2d');
        gfc.drawImage(this.canvas, 0, 0);

        // Downscale buffer used for pixelation
        if (!this.glitchScratchCanvas) this.glitchScratchCanvas = document.createElement('canvas');
        const px = Math.max(2, this.glitchPixelSize || 4);
        this.glitchScratchCanvas.width = Math.max(1, Math.floor(this.canvas.width / px));
        this.glitchScratchCanvas.height = Math.max(1, Math.floor(this.canvas.height / px));

        // Precompute a set of "stuck" cells that will not update (they remain as the snapshot)
        const cells = [];
        const cellCount = 80; // number of frozen cells
        for (let i = 0; i < cellCount; i++) {
            const w = Math.floor(2 + Math.random() * 10);
            const h = Math.floor(2 + Math.random() * 10);
            const x = Math.floor(Math.random() * (this.canvas.width - w));
            const y = Math.floor(Math.random() * (this.canvas.height - h));
            cells.push({ x, y, w, h });
        }
        this.glitchStuckCells = cells;

        // Cycle overlay background to simulate flashing images at a regular interval
        if (this.glitchOverlayIntervalId) {
            clearInterval(this.glitchOverlayIntervalId);
        }
        const patterns = [
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0 2px, rgba(0,0,0,0.0) 2px 4px)',
            'repeating-linear-gradient(90deg, rgba(255,0,0,0.3) 0 6px, rgba(0,255,0,0.3) 6px 12px, rgba(0,0,255,0.3) 12px 18px)',
            'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0) 60%)',
            'repeating-linear-gradient(180deg, rgba(255,255,0,0.35) 0 3px, rgba(255,0,255,0.35) 3px 6px, rgba(0,255,255,0.35) 6px 9px)'
        ];
        let pIndex = 0;
        this.glitchOverlayIntervalId = setInterval(() => {
            if (this.glitchOverlay) {
                this.glitchOverlay.style.backgroundImage = patterns[pIndex % patterns.length];
                pIndex++;
            }
        }, 120); // regular flashing interval
    }

    runGlitchLoop() {
        if (!this.isGlitching) return;
        this.renderGlitchFrame();

        const now = performance.now();
        if (!this._nextScrambleAt) this._nextScrambleAt = now + 1200; // small initial delay
        if (!this.scrambleActive && now >= this._nextScrambleAt) {
            this.startScrambleBurst();
        }

        requestAnimationFrame(() => this.runGlitchLoop());
    }

    startScrambleBurst() {
        this.scrambleActive = true;
        // Cache original positions to restore later
        if (!this._origPositions) this._origPositions = {};
        this._origPositions.player = { x: this.player.x, y: this.player.y };
        this._origPositions.npcs = (this.npcs || []).map(n => ({ id: n.id, x: n.position.x, y: n.position.y }));

        // Allow a short initial delay so players can observe the glitch visuals
        // before the first scramble occurs. This value (ms) can be adjusted elsewhere
        // if needed, and defaults to 1500ms.
        if (typeof this._initialScrambleDelay !== 'number') this._initialScrambleDelay = 1500;

        // Time-lapse grouping: several scenes over ~2s, then ~5s calm
        const activeDuration = 2000; // ms - active phase where characters jump around
        const restDuration = 5000;   // ms - calm phase where characters stay in present
        const perScene = 300;        // ms per snapshot scene (faster transitions for more dramatic effect)
        const sceneSteps = Math.max(1, Math.floor(activeDuration / perScene));

        const minDistance = 28;   // minimum spacing between characters in a cluster
        const clusterRadius = 70; // cluster radius from center (larger for more visible grouping)
        const mapW = this.mapWidth || this.canvas.width;
        const mapH = this.mapHeight || this.canvas.height;
        const pad = 24;
        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

        // Build a list of all participants (player + npcs)
        const participants = [
            { type: 'player', id: 'player', ref: this.player, orig: this._origPositions.player },
            ...((this.npcs || []).map(n => ({ type: 'npc', id: n.id, ref: n, orig: this._origPositions.npcs.find(o => o.id === n.id) })))
        ];

        let groupTargets = new Map(); // updated per scene

        const computeSceneTargets = () => {
            const targets = new Map();
            // Choose 1 or 2 clusters per scene (50% chance for 2 clusters to show varied conversations)
            const clusterCount = (participants.length > 3 && Math.random() < 0.5) ? 2 : 1;

            // Pick anchors (actual characters) for clusters
            const anchors = [];
            const shuffled = participants.slice().sort(() => Math.random() - 0.5);
            for (const p of shuffled) { if (anchors.length >= clusterCount) break; anchors.push(p); }

            // Choose cluster centers anywhere on the map to make movement obvious
            const centers = [];
            for (let i = 0; i < anchors.length; i++) {
                let tries = 20; let cx = 0; let cy = 0; let ok = false;
                while (tries-- > 0 && !ok) {
                    cx = clamp(Math.random() * mapW, pad, mapW - pad);
                    cy = clamp(Math.random() * mapH, pad, mapH - pad);
                    ok = true;
                    // Ensure clusters are well-separated
                    for (const c of centers) {
                        if (Math.hypot(c.x - cx, c.y - cy) < 150) { ok = false; break; }
                    }
                }
                centers.push({ x: cx, y: cy, anchor: anchors[i] });
            }

            // Partition participants across clusters; ensure each cluster has at least the anchor and one more if possible
            const others = participants.filter(p => !anchors.includes(p));
            const buckets = centers.map(c => [c.anchor]);
            const shuffledOthers = others.slice().sort(() => Math.random() - 0.5);
            for (let i = 0; i < shuffledOthers.length; i++) {
                const idx = (i % centers.length);
                buckets[idx].push(shuffledOthers[i]);
            }

            // Place members near their cluster center with spacing
            for (let i = 0; i < buckets.length; i++) {
                const center = centers[i];
                const placed = [];
                for (const m of buckets[i]) {
                    let tries = 28; let pos = null;
                    while (tries-- > 0 && !pos) {
                        const angle = Math.random() * Math.PI * 2;
                        const r = (Math.random() ** 0.65) * clusterRadius; // bias toward center
                        const tx = clamp(center.x + Math.cos(angle) * r, pad, mapW - pad);
                        const ty = clamp(center.y + Math.sin(angle) * r, pad, mapH - pad);
                        let ok = true;
                        for (const p of placed) {
                            if (Math.hypot(p.x - tx, p.y - ty) < minDistance) { ok = false; break; }
                        }
                        if (ok) pos = { x: tx, y: ty };
                    }
                    if (!pos) pos = { x: center.x, y: center.y };
                    placed.push(pos);
                    targets.set(m, pos);
                }
            }
            return targets;
        };

        const applyTargets = () => {
            for (const [p, pos] of groupTargets.entries()) {
                if (p.type === 'player') { p.ref.x = pos.x; p.ref.y = pos.y; }
                else { p.ref.position.x = pos.x; p.ref.position.y = pos.y; }
                // Optional: orient towards cluster center by looking at nearest neighbor
                if (p.ref && typeof p.ref.direction === 'string') {
                    // Find closest other for facing
                    let nearest = null; let nd = Infinity;
                    for (const [q, qpos] of groupTargets.entries()) {
                        if (q === p) continue;
                        const d = Math.hypot(qpos.x - pos.x, qpos.y - pos.y);
                        if (d < nd) { nd = d; nearest = qpos; }
                    }
                    if (nearest) {
                        const dx = nearest.x - pos.x; const dy = nearest.y - pos.y;
                        if (Math.abs(dx) > Math.abs(dy)) p.ref.direction = dx < 0 ? 'left' : 'right';
                        else p.ref.direction = dy < 0 ? 'up' : 'down';
                    }
                }
            }
        };

        // Subtle micro-motions during a scene to imply conversation
        let microAnimId;
        let microFrame = 0;
        const microMotion = () => {
            if (!this.scrambleActive) return;
            microFrame++;
            for (const [p, center] of groupTargets.entries()) {
                // Oscillating motion that looks like characters are gesturing/talking
                const jitter = 3 + Math.sin(microFrame * 0.15) * 2; // 1-5px oscillating drift
                const angle = (microFrame * 0.1 + (p.ref.id ? p.ref.id.charCodeAt(0) : 0) * 0.5) % (Math.PI * 2);
                const nx = clamp(center.x + Math.cos(angle) * jitter, pad, mapW - pad);
                const ny = clamp(center.y + Math.sin(angle) * jitter, pad, mapH - pad);
                if (p.type === 'player') { p.ref.x = nx; p.ref.y = ny; }
                else { p.ref.position.x = nx; p.ref.position.y = ny; }

                // Occasionally change facing direction to simulate animated conversation
                if (microFrame % 20 === 0 && p.ref && typeof p.ref.direction === 'string') {
                    const dirs = ['up', 'down', 'left', 'right'];
                    p.ref.direction = dirs[Math.floor(Math.random() * dirs.length)];
                }
            }
            microAnimId = requestAnimationFrame(microMotion);
        };

        // Scene progression chain
        let step = 0;
        const runScene = () => {
            if (!this.scrambleActive) return;
            groupTargets = computeSceneTargets();
            applyTargets();

            // Move camera to show the action - focus on the center of all character positions
            if (groupTargets.size > 0) {
                let sumX = 0, sumY = 0, count = 0;
                for (const pos of groupTargets.values()) {
                    sumX += pos.x;
                    sumY += pos.y;
                    count++;
                }
                const centerX = sumX / count;
                const centerY = sumY / count;
                // Smoothly move camera toward the center of action
                const targetCameraX = centerX - this.canvas.width / 2;
                const targetCameraY = centerY - this.canvas.height / 2;
                this.camera.x += (targetCameraX - this.camera.x) * 0.3;
                this.camera.y += (targetCameraY - this.camera.y) * 0.3;
            }

            // Add a subtle flash to indicate scene transition
            if (this.glitchOverlay && step > 0) {
                this.glitchOverlay.style.opacity = '0.6';
                setTimeout(() => {
                    if (this.glitchOverlay) this.glitchOverlay.style.opacity = '0.3';
                }, 50);
            }

            step++;
            if (step < sceneSteps) {
                this._sceneTimer = setTimeout(runScene, perScene);
            }
        };

        // Kick off scene progression and micro-motion
        runScene();
        microAnimId = requestAnimationFrame(microMotion);

        // End active phase -> restore originals and schedule next window after calm period
        clearTimeout(this._scrambleTimeout);
        this._scrambleTimeout = setTimeout(() => {
            this.scrambleActive = false;
            if (this._sceneTimer) clearTimeout(this._sceneTimer);
            if (microAnimId) cancelAnimationFrame(microAnimId);
            // Restore exact originals for the present moment
            this.player.x = this._origPositions.player.x;
            this.player.y = this._origPositions.player.y;
            for (const npc of (this.npcs || [])) {
                const orig = this._origPositions.npcs.find(o => o.id === npc.id);
                if (orig) { npc.position.x = orig.x; npc.position.y = orig.y; }
            }
            // Reset camera to follow player
            this.camera.x = this.player.x - this.canvas.width / 2;
            this.camera.y = this.player.y - this.canvas.height / 2;
            // Schedule next scramble after calm
            this._nextScrambleAt = performance.now() + restDuration;
        }, activeDuration);
    }

    renderGlitchFrame() {
        const ctx = this.ctx;
        if (!ctx) return;
        const scratch = this.glitchScratchCanvas && this.glitchScratchCanvas.getContext('2d');
        if (!scratch || !this.glitchFrozenCanvas) return;

        // First, render the current game world (with characters at their current scrambled positions)
        // This allows us to see the time-lapse grouping effect
        if (typeof this.render === 'function') {
            this.render();
        }

        // Capture the current render to the frozen canvas
        const gfc = this.glitchFrozenCanvas.getContext('2d');
        if (gfc) {
            gfc.clearRect(0, 0, this.glitchFrozenCanvas.width, this.glitchFrozenCanvas.height);
            gfc.drawImage(this.canvas, 0, 0);
        }

        // Now apply glitch effects on top
        // Pixelation pass (jittered)
        ctx.imageSmoothingEnabled = false;
        scratch.imageSmoothingEnabled = false;

        const sW = this.glitchScratchCanvas.width;
        const sH = this.glitchScratchCanvas.height;
        const jitterX = Math.floor(Math.random() * 8) - 4;
        const jitterY = Math.floor(Math.random() * 8) - 4;

        scratch.clearRect(0, 0, sW, sH);
        scratch.drawImage(this.glitchFrozenCanvas, jitterX, jitterY, this.canvas.width, this.canvas.height, 0, 0, sW, sH);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.drawImage(this.glitchScratchCanvas, 0, 0, sW, sH, 0, 0, this.canvas.width, this.canvas.height);

        // Horizontal slice offsets
        for (let i = 0; i < 10; i++) {
            const y = Math.floor(Math.random() * this.canvas.height);
            const h = Math.max(2, Math.floor(Math.random() * 12));
            const dx = Math.floor(Math.random() * 40) - 20;
            ctx.drawImage(this.glitchFrozenCanvas, 0, y, this.canvas.width, h, dx, y, this.canvas.width, h);
        }

        // Stuck cells - reduce intensity slightly so movement is more visible
        for (let i = 0; i < Math.min(40, this.glitchStuckCells.length); i++) {
            const cell = this.glitchStuckCells[i];
            ctx.drawImage(
                this.glitchFrozenCanvas,
                cell.x, cell.y, cell.w, cell.h,
                cell.x, cell.y, cell.w, cell.h
            );
        }
    }

    updateCharacterUI() {
        const currentChar = this.gameState.getCurrentCharacter();
        if (this.characterName) this.characterName.textContent = currentChar.name;

        // Update all UI elements to reflect new character
        this.updateInventoryUI();
        this.updateQuestUI();
        this.updateAbilitiesUI();

        // Also refresh settings panel values if open
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal && settingsModal.style.display === 'block') {
            this.updateSettingsPanel();
        }
    }

    applyCharacterTheme(character) {
        // Map new character IDs to site aspect themes for background/surface tinting
        const THEME_BY_CHAR = {
            alexis: 'rage',
            austine: 'mind',
            chloe: 'life',
            isabell: 'blood',
            nicholas: 'light',
            opal: 'space',
            tyson: 'doom',
            victor: 'time',
        };

        // Check user's theme preference from localStorage
        const themeKey = 'mspa:theme';
        let userTheme = null;
        try {
            userTheme = localStorage.getItem(themeKey);
        } catch (e) {
            // localStorage not available or access denied; fall back to default behavior
        }

        // Only request a theme change from the parent if user has selected "Default" or has no preference
        // If user selected a specific theme (e.g. 'space', 'breath', etc.), respect that choice
        if (!userTheme || userTheme === 'default') {
            const theme = (character && character.id && THEME_BY_CHAR[character.id])
                ? THEME_BY_CHAR[character.id]
                : 'space';

            // Instead of changing the embed's own theme, ask the parent page to change its theme via postMessage.
            // Parent pages can listen for message.type === 'GAME_THEME_CHANGE' to apply the theme change.
            try {
                window.parent.postMessage({
                    type: 'GAME_THEME_CHANGE',
                    theme: theme
                }, '*');
            } catch (e) {
                // If we can't communicate with parent, that's okay — just fail silently.
                console.warn('Could not send theme change to parent page', e);
            }
        }
        // If the user has a specific theme preference, do not override it here.

        // Always drive UI accent directly from the current character color inside the iframe/game UI
        if (character && character.color) {
            document.documentElement.style.setProperty('--accent', character.color);
        }
    }

    transitionToTheme(oldTheme, newTheme) {
        const overlay = document.getElementById('themeTransitionOverlay');
        if (!overlay) {
            // Fallback: just change theme instantly if overlay doesn't exist
            document.documentElement.setAttribute('data-theme', newTheme);
            return;
        }

        // Ensure overlay has necessary base styles for transition
        // (expected CSS: overlay positioned over the viewport, transitions opacity over 2s)
        overlay.setAttribute('data-overlay-theme', newTheme);

        // Kick off a crossfade:
        //  - Add 'transitioning' class to fade the overlay in (0 -> 1 opacity) over ~1s
        //  - At the halfway point (1s), swap the document theme so the new theme is revealed
        //  - Then remove 'transitioning' after the full 2s to fade the overlay out
        overlay.classList.add('transitioning');

        // After 1 second (halfway through the 2s transition), change the actual theme
        setTimeout(() => {
            document.documentElement.setAttribute('data-theme', newTheme);
        }, 1000);

        // After 2 seconds (full transition), fade out and clean up
        setTimeout(() => {
            overlay.classList.remove('transitioning');
            // Cleanup attribute to keep DOM tidy (optional)
            overlay.removeAttribute('data-overlay-theme');
        }, 2000);
    }

    // Render the world, slicing sprite sheets per direction/frame for NPCs and player
    render() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background (fallback fill if sprite not ready yet)
        const bg = this.sprites && this.sprites.backgrounds && this.sprites.backgrounds.main;
        if (bg) {
            this.ctx.drawImage(
                bg,
                -this.camera.x, -this.camera.y
            );
        } else {
            this.ctx.fillStyle = '#0f0f0f';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        const tile = 32;

        // Draw map tiles (walls and chasms)
        const startCol = Math.max(0, Math.floor(this.camera.x / this.tileSize));
        const endCol = Math.min(this.mapCols, Math.ceil((this.camera.x + this.canvas.width) / this.tileSize));
        const startRow = Math.max(0, Math.floor(this.camera.y / this.tileSize));
        const endRow = Math.min(this.mapRows, Math.ceil((this.camera.y + this.canvas.height) / this.tileSize));

        for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
                const tileType = this.mapTiles[row][col];
                const x = col * this.tileSize - this.camera.x;
                const y = row * this.tileSize - this.camera.y;

                if (tileType === 1) {
                    // Wall
                    this.ctx.fillStyle = '#9f01ff';
                    this.ctx.fillRect(x, y, this.tileSize, this.tileSize);

                    // Derse pattern on walls
                    this.ctx.fillStyle = '#6c01fd';
                    for (let py = 0; py < this.tileSize; py += 8) {
                        for (let px = 0; px < this.tileSize; px += 8) {
                            if ((px / 8 + py / 8) % 2 === 0) {
                                this.ctx.fillRect(x + px, y + py, 4, 4);
                            }
                        }
                    }

                    // Border
                    this.ctx.strokeStyle = '#6200b5';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(x, y, this.tileSize, this.tileSize);
                } else if (tileType === 2) {
                    // Chasm - completely pitch black
                    const drawX = Math.floor(x);
                    const drawY = Math.floor(y);
                    this.ctx.fillStyle = '#000000';
                    this.ctx.fillRect(drawX, drawY, this.tileSize + 1, this.tileSize + 1);
                }
            }
        }

        // Draw fillable chasms
        for (const chasm of this.fillableChasms) {
            const screenX = chasm.x - this.camera.x;
            const screenY = chasm.y - this.camera.y;

            if (screenX > -tile && screenX < this.canvas.width &&
                screenY > -tile && screenY < this.canvas.height) {

                if (chasm.filled) {
                    // Filled chasm (looks like floor)
                    this.ctx.fillStyle = '#000000ff';
                    this.ctx.fillRect(screenX, screenY, tile, tile);
                } else {
                    // Unfilled chasm
                    this.ctx.fillStyle = '#000000ff';
                    this.ctx.fillRect(screenX, screenY, tile, tile);

                    // Pulsing effect
                    const pulse = Math.sin(Date.now() / 500) * 0.2 + 0.8;
                    this.ctx.fillStyle = `rgba(90, 50, 110, ${pulse * 0.3})`;
                    this.ctx.fillRect(screenX + 4, screenY + 4, tile - 8, tile - 8);
                }
            }
        }

        // Draw boulders
        for (const boulder of this.boulders) {
            const screenX = boulder.x - this.camera.x;
            const screenY = boulder.y - this.camera.y;

            if (screenX > -tile && screenX < this.canvas.width &&
                screenY > -tile && screenY < this.canvas.height) {

                // Boulder
                this.ctx.fillStyle = '#6a5a7a';
                this.ctx.fillRect(screenX, screenY, tile, tile);

                // Highlights
                this.ctx.fillStyle = '#7a6a8a';
                this.ctx.fillRect(screenX + 4, screenY + 4, 8, 8);
                this.ctx.fillRect(screenX + tile - 12, screenY + 4, 8, 8);

                // Shadow
                this.ctx.fillStyle = '#4a3a5a';
                this.ctx.fillRect(screenX + 4, screenY + tile - 12, tile - 8, 8);
            }
        }

        // Draw breakable obstacles
        for (const obstacle of this.obstacles) {
            if (!obstacle.broken) {
                const screenX = obstacle.x - this.camera.x;
                const screenY = obstacle.y - this.camera.y;

                if (screenX > -tile && screenX < this.canvas.width &&
                    screenY > -tile && screenY < this.canvas.height) {

                    // Rock-like obstacle
                    this.ctx.fillStyle = '#5a4a6a';
                    this.ctx.fillRect(screenX + 4, screenY + 8, tile - 8, tile - 12);
                    this.ctx.fillRect(screenX + 8, screenY + 4, tile - 16, tile - 8);

                    // Cracks
                    this.ctx.strokeStyle = '#3a2a4a';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(screenX + 12, screenY + 8);
                    this.ctx.lineTo(screenX + tile / 2, screenY + tile / 2);
                    this.ctx.lineTo(screenX + tile - 12, screenY + tile - 8);
                    this.ctx.stroke();
                }
            }
        }

        // Draw chests
        for (const chest of this.chests) {
            if (!chest.opened) {
                const screenX = chest.x - this.camera.x;
                const screenY = chest.y - this.camera.y;

                if (screenX > -tile && screenX < this.canvas.width &&
                    screenY > -tile && screenY < this.canvas.height) {

                    // Chest body
                    this.ctx.fillStyle = '#8B4513';
                    this.ctx.fillRect(screenX + 6, screenY + 12, tile - 12, tile - 14);

                    // Chest lid
                    this.ctx.fillStyle = '#A0522D';
                    this.ctx.fillRect(screenX + 4, screenY + 8, tile - 8, 8);

                    // Lock
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.fillRect(screenX + tile / 2 - 2, screenY + 14, 4, 6);

                    // Glow effect
                    this.ctx.shadowColor = '#FFD700';
                    this.ctx.shadowBlur = 10;
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.beginPath();
                    this.ctx.arc(screenX + tile / 2, screenY + 17, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                }
            }
        }

        // Draw items on map
        if (this.gameState && this.gameState.gameItems) {
            for (const [itemId, itemData] of Object.entries(this.gameState.gameItems)) {
                if (!itemData.collected) {
                    const screenX = itemData.x - this.camera.x;
                    const screenY = itemData.y - this.camera.y;

                    if (screenX > -tile && screenX < this.canvas.width &&
                        screenY > -tile && screenY < this.canvas.height) {

                        this.ctx.fillStyle = '#FFD700';
                        this.ctx.shadowColor = '#FFD700';
                        this.ctx.shadowBlur = 10;

                        this.ctx.beginPath();
                        this.ctx.arc(screenX + tile/2, screenY + tile/2, 12, 0, Math.PI * 2);
                        this.ctx.fill();

                        this.ctx.shadowBlur = 0;

                        this.ctx.fillStyle = '#fff';
                        this.ctx.font = 'bold 10px Arial';
                        this.ctx.textAlign = 'center';
                        this.ctx.fillText(itemId, screenX + tile/2, screenY - 8);
                    }
                }
            }
        }

        // Draw Derse agents (enemies)
        if (this.gameState && this.gameState.combatStats && this.gameState.combatStats.agentsDefeated < 3) {
            const agents = [
                { x: 750, y: 750 },
                { x: 1280, y: 320 },
                { x: 1280, y: 1280 }
            ];

            const defeatedCount = this.gameState.combatStats.agentsDefeated || 0;
            for (let i = defeatedCount; i < agents.length; i++) {
                const agent = agents[i];
                const screenX = agent.x - this.camera.x;
                const screenY = agent.y - this.camera.y;

                if (screenX > -tile && screenX < this.canvas.width &&
                    screenY > -tile && screenY < this.canvas.height) {

                    this.ctx.fillStyle = '#8B0000';
                    this.ctx.shadowColor = '#8B0000';
                    this.ctx.shadowBlur = 8;
                    this.ctx.fillRect(screenX, screenY, tile, tile);
                    this.ctx.shadowBlur = 0;

                    this.ctx.fillStyle = '#fff';
                    this.ctx.font = 'bold 10px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('AGENT', screenX + tile/2, screenY - 8);
                }
            }
        }


        // Draw NPCs
        if (Array.isArray(this.npcs)) {
            for (const npc of this.npcs) {
                if (!npc || !npc.position) continue;
                const screenX = npc.position.x - this.camera.x;
                const screenY = npc.position.y - this.camera.y;

                if (screenX > -tile && screenX < this.canvas.width &&
                    screenY > -tile && screenY < this.canvas.height) {
                    // Slice sheet: idle down frame
                    const frame = 0;
                    const dirRow = 0;
                    const sprite = this.sprites && this.sprites.npcs && this.sprites.npcs[npc.id];
                    if (sprite) {
                        this.ctx.drawImage(
                            sprite,
                            frame * tile, dirRow * tile, tile, tile,
                            screenX, screenY, tile, tile
                        );
                    } else {
                        // Fallback: simple colored square
                        this.ctx.fillStyle = npc.color || '#888';
                        this.ctx.fillRect(screenX, screenY, tile, tile);
                    }

                    // NPC name
                    this.ctx.fillStyle = npc.color || '#fff';
                    this.ctx.font = '12px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(npc.name || npc.id, screenX + (tile / 2), screenY - 5);
                }
            }
        }

        // Draw player
        const currentChar = this.gameState.getCurrentCharacter();
        const playerScreenX = this.player.x - this.camera.x;
        const playerScreenY = this.player.y - this.camera.y;

        const playerFrame = (typeof this.player.animationFrame === 'number') ? this.player.animationFrame : 0;
        const playerDirRow = this.player.direction === 'down' ? 0 :
                             this.player.direction === 'left' ? 1 :
                             this.player.direction === 'right' ? 2 : 3; // up
        const charSprite = this.sprites && this.sprites.characters && this.sprites.characters[currentChar.id];
        if (charSprite) {
            this.ctx.drawImage(
                charSprite,
                playerFrame * tile, playerDirRow * tile, tile, tile,
                playerScreenX, playerScreenY, tile, tile
            );
        } else {
            // Fallback player marker
            this.ctx.fillStyle = currentChar.color || '#fff';
            this.ctx.fillRect(playerScreenX, playerScreenY, tile, tile);
        }
        // Player name
        this.ctx.fillStyle = currentChar.color || '#fff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(currentChar.name, playerScreenX + (tile / 2), playerScreenY - 5);

        // Render floating texts
        if (this.floatingTexts && this.floatingTexts.length > 0) {
            this.ctx.save();
            for (const text of this.floatingTexts) {
                this.ctx.globalAlpha = text.alpha;
                this.ctx.fillStyle = text.color;
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                this.ctx.shadowBlur = 4;
                const screenX = text.x - this.camera.x;
                const screenY = text.y - this.camera.y;
                this.ctx.fillText(text.text, screenX, screenY);
            }
            this.ctx.shadowBlur = 0;
            this.ctx.restore();
        }

        // Render mini-game if active
        if (this.inMiniGame && this.miniGame) {
            this.miniGame.render(this.ctx);
        }

        // Render logic puzzle if active
        if (this.logicPuzzle && this.logicPuzzle.active) {
            this.logicPuzzle.render();
        }
    }

    gameLoop() {
        this.update();
        this.render();

        if (this.isGameRunning) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new SwitchGame();
});