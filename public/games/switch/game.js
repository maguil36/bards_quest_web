 // Main game logic for the Switch game
class SwitchGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = new GameState();
        this.npcs = []; // will be built dynamically in init()
        this.characters = CHARACTERS;
        this.dialogueManager = new DialogueManager(this.gameState, this.npcs);
        this.audioManager = new AudioManager();

        // Game world settings
        this.mapWidth = 1600;
        this.mapHeight = 1200;
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
            x: 400,
            y: 300,
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
        this.characterPortraits = document.getElementById('characterPortraits');
        this.leftPortrait = document.getElementById('leftPortrait');
        this.rightPortrait = document.getElementById('rightPortrait');
        this.switchPrompt = document.getElementById('switchPrompt');
        this.glitchOverlay = document.getElementById('glitchOverlay');
        this.errorMessage = document.getElementById('errorMessage');
        this.characterName = document.getElementById('characterName');

        // Ensure overlays/prompts are hidden initially
        if (this.glitchOverlay) this.glitchOverlay.style.display = 'none';
        if (this.switchPrompt) this.switchPrompt.style.display = 'none';
        if (this.dialogueBox) this.dialogueBox.style.display = 'none';

        // Game state
        this.isGameRunning = true;
        this.showingDialogue = false;
        this.showingSwitchPrompt = false;

        this.init();
    }

    async init() {
        // Ensure CSS variable-driven colors are up-to-date
        if (typeof refreshCharacterColors === 'function') {
            try { refreshCharacterColors(); } catch (_) {}
        }

        // Load game state
        this.gameState.load();

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

        // Load sprites
        await this.loadSprites();

        // Start background music
        this.audioManager.playCharacterMusic(currentChar.id);

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
                    try { refreshCharacterColors(); } catch (_) {}
                }

                this.audioManager.playCharacterMusic(currentChar.id);
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

        // Settings UI
        const settingsBtn = document.getElementById('settingsButton');
        const settingsModal = document.getElementById('settingsModal');
        const settingsClose = document.getElementById('settingsClose');
        const volSlider = document.getElementById('volumeSlider');
        const volValue = document.getElementById('volumeValue');
        const restartBtn = document.getElementById('restartGameBtn');

        const openSettings = () => {
            if (typeof this.updateSettingsPanel === 'function') {
                try { this.updateSettingsPanel(); } catch (_) {}
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

                try {
                    // Reset game state if available
                    if (this.gameState && typeof this.gameState.reset === 'function') {
                        try { this.gameState.reset(); } catch (_) {}
                    }

                    // Clear saved audio settings and general save data
                    try { localStorage.removeItem('switchAudioSettings'); } catch (_) {}
                    try { localStorage.removeItem('switchSave'); } catch (_) {}

                    // Reload page to reinitialize everything cleanly
                    window.location.reload();
                } catch (e) {
                    console.error('Failed to restart game:', e);
                }
            });
        }

        // Close settings with Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && settingsModal && settingsModal.style.display === 'block') {
                // Prevent other Escape handlers from re-opening settings in the same keypress
                e.preventDefault();
                if (typeof e.stopImmediatePropagation === 'function') {
                    e.stopImmediatePropagation();
                } else {
                    e.stopPropagation();
                }
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

            // If dialogue is currently open, close it without marking completion
            if (this.showingDialogue && this.dialogueManager && typeof this.dialogueManager.cancelDialogue === 'function') {
                e.preventDefault();
                try { this.dialogueManager.cancelDialogue(); } catch (_) {}
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
                try { this.updateSettingsPanel(); } catch (_) {}
            }
            if (settingsModal) settingsModal.style.display = 'block';
        });

        // Initialize slider from audio manager
        if (volSlider && volValue && this.audioManager && typeof this.audioManager.getVolume === 'function') {
            try {
                const v = Math.round(this.audioManager.getVolume() * 100);
                volSlider.value = String(v);
                volValue.textContent = `${v}%`;
            } catch (_) {}
            volSlider.addEventListener('input', () => {
                const pct = parseInt(volSlider.value, 10) || 0;
                if (this.audioManager && typeof this.audioManager.setVolume === 'function') {
                    try { this.audioManager.setVolume(pct / 100); } catch (_) {}
                }
                if (volValue) volValue.textContent = `${pct}%`;
            });
        }

        // Prevent context menu on canvas
        if (this.canvas) {
            this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        }
    }

    updateSettingsPanel() {
        const current = this.gameState.getCurrentCharacter();
        const nameEl = document.getElementById('settingsCurrentCharacter');
        const charProg = document.getElementById('settingsCharProgress');
        const charTotal = document.getElementById('settingsCharTotal');
        const charRem = document.getElementById('settingsCharRemaining');
        const gameRemain = document.getElementById('settingsGameRemaining');
        if (nameEl) nameEl.textContent = current.name;

        if (this.gameState) {
            const done = this.gameState.getCompletedCountForCharacter(current.id);
            const total = this.gameState.getTotalTargetsPerCharacter(current.id);
            const rem = this.gameState.getRemainingForCharacterProgress(current.id);
            const remainingGame = this.gameState.getRemainingInteractionsToFinishGame();
            if (charProg) charProg.textContent = String(done);
            if (charTotal) charTotal.textContent = String(total);
            if (charRem) charRem.textContent = String(rem);
            if (gameRemain) gameRemain.textContent = String(remainingGame);
        }

        // Also reflect these values in the switch prompt portraits when visible
        // so that players get immediate feedback while deciding to switch
        const left = this.leftPortrait;
        const right = this.rightPortrait;
        if (left && right && this.showingSwitchPrompt) {
            try {
                left.dataset.progress = `${this.gameState.getCompletedCountForCharacter(current.id)}/${this.gameState.getTotalTargetsPerCharacter(current.id)}`;
                const targetId = this.nextCharacterToSwitch;
                if (targetId) {
                    right.dataset.progress = `${this.gameState.getCompletedCountForCharacter(targetId)}/${this.gameState.getTotalTargetsPerCharacter(targetId)}`;
                }
            } catch (_) {}
        }
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
                    this.advanceDialogue();
                } else if (now - this.lastInteractionTime > 500) {
                    this.tryInteract();
                    this.lastInteractionTime = now;
                }
                break;

            case 'Escape':
                // Escape handling is centralized in setupEventListeners global listener
                // to manage closing/opening UI overlays. No action here to avoid duplication.
                break;
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

    createBackgroundSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = this.mapWidth;
        canvas.height = this.mapHeight;
        const ctx = canvas.getContext('2d');

        // Create a simple tiled background (checker of two greens)
        const tileSize = 64;
        for (let x = 0; x < this.mapWidth; x += tileSize) {
            for (let y = 0; y < this.mapHeight; y += tileSize) {
                const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
                ctx.fillStyle = isEven ? '#2a4a2a' : '#1a3a1a';
                ctx.fillRect(x, y, tileSize, tileSize);
            }
        }

        // Add some decorative patches
        ctx.fillStyle = '#4a6a4a';
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

        this.updatePlayerMovement();
        this.updateCamera();
        this.updateAnimations();
        this.checkForInteractions();
    }

    updatePlayerMovement() {
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

            // Reset portraits highlight on movement
            if (this.characterPortraits) {
                this.leftPortrait.style.outline = '2px solid var(--border)';
                this.rightPortrait.style.outline = '2px solid var(--border)';
                this.characterPortraits.style.display = 'none';
            }
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            dy = step;
            this.player.direction = 'down';

            if (this.characterPortraits) {
                this.leftPortrait.style.outline = '2px solid var(--border)';
                this.rightPortrait.style.outline = '2px solid var(--border)';
                this.characterPortraits.style.display = 'none';
            }
        }
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            dx = -step;
            this.player.direction = 'left';

            if (this.characterPortraits) {
                this.leftPortrait.style.outline = '2px solid var(--border)';
                this.rightPortrait.style.outline = '2px solid var(--border)';
                this.characterPortraits.style.display = 'none';
            }
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            dx = step;
            this.player.direction = 'right';
        }

        // Update movement state

        // Save position (player -> current character)
        if (this.gameState && typeof this.gameState.getCurrentCharacter === 'function') {
            const currentChar = this.gameState.getCurrentCharacter();
            if (currentChar && currentChar.id) {
                this.gameState.characterPositions = this.gameState.characterPositions || {};
                this.gameState.characterPositions[currentChar.id] = { x: this.player.x, y: this.player.y };
            }
        }

        // Persist current NPC positions too (so ghost NPCs remain where you left them)
        if (Array.isArray(this.npcs) && this.gameState) {
            this.gameState.characterPositions = this.gameState.characterPositions || {};
            for (const npc of this.npcs) {
                if (npc && npc.id && npc.position && typeof npc.position.x === 'number' && typeof npc.position.y === 'number') {
                    this.gameState.characterPositions[npc.id] = { x: npc.position.x, y: npc.position.y };
                }
            }
        }
        this.player.isMoving = dx !== 0 || dy !== 0;

        // Apply movement with bounds checking
        const newX = Math.max(0, Math.min(this.mapWidth - this.player.width, this.player.x + dx));
        const newY = Math.max(0, Math.min(this.mapHeight - this.player.height, this.player.y + dy));

        this.player.x = newX;
        this.player.y = newY;

        // Save position
        const currentChar = this.gameState.getCurrentCharacter();
        this.gameState.characterPositions[currentChar.id] = { x: this.player.x, y: this.player.y };
    }

    showDialogueUI() {
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
            // Player speaks: use player color; NPC speaks: use NPC color
            if (this.dialogueText) this.dialogueText.style.color = current.speaker === 'player' ? playerColor : npcColor;

            // Toggle speaker highlight classes on dialogue box
            if (this.dialogueBox) {
                this.dialogueBox.classList.toggle('speaker-player', current.speaker === 'player');
                this.dialogueBox.classList.toggle('speaker-npc', current.speaker === 'npc');
            }

            // Highlight speaker portrait card
            if (this.characterPortraits) this.characterPortraits.style.display = 'block';
            if (this.leftPortrait) this.leftPortrait.style.outline = current.speaker === 'npc' ? `4px solid ${npcColor}` : '2px solid var(--border)';
            if (this.rightPortrait) this.rightPortrait.style.outline = current.speaker === 'player' ? `4px solid ${playerColor}` : '2px solid var(--border)';
            if (this.leftPortrait) this.leftPortrait.style.background = 'var(--surface)';
            if (this.rightPortrait) this.rightPortrait.style.background = 'var(--surface)';

            // Show dialogue box
            if (this.dialogueBox) this.dialogueBox.style.display = 'block';
        }
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

        // Find closest NPC (playable character avatars in the world)
        let closestNPC = null;
        let closestDistance = interactionDistance;

        for (const npc of this.npcs) {
            // Do not allow interacting with your own avatar
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
            this.startDialogue(closestNPC.id);
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

    // Legacy wrapper - route to the unified showDialogueUI above
    showDialogueUI() {
        const current = this.dialogueManager.getCurrentLine();
        const npc = this.dialogueManager.getCurrentNPC();
        const currentChar = this.gameState.getCurrentCharacter();

        if (current && npc) {
            if (this.dialogueText) this.dialogueText.textContent = current.text;
            if (this.dialogueText) this.dialogueText.style.color = (current.speaker === 'player') ? currentChar.color : (npc.color || '#888');

            // Ensure dialogue box and portraits are visible
            if (this.dialogueBox) this.dialogueBox.style.display = 'block';
            if (this.characterPortraits) this.characterPortraits.style.display = 'block';
            this.showingDialogue = true;
        }
    }

    advanceDialogue() {
        if (!this.dialogueManager.nextLine()) {
            // Dialogue completed
            this.closeDialogue();

            // Check if ready to switch (per-character completion), but do NOT interfere when we just talked to Victor and can switch to him
            const lastId = this.gameState && this.gameState.lastNPCTalkedId;
            const canSwitchVictor = this.gameState && typeof this.gameState.canSwitchToCharacter === 'function' && this.gameState.canSwitchToCharacter('victor');
            if (this.gameState.isReadyToSwitch() && !(lastId === 'victor' && canSwitchVictor)) {
                setTimeout(() => this.showSwitchPrompt(), 500);
            }
        } else {
            // Update dialogue UI using structured current line object (text/speaker)
            const current = this.dialogueManager.getCurrentLine();
            const npc = this.dialogueManager.getCurrentNPC();
            const currentChar = this.gameState.getCurrentCharacter();

            if (current && npc) {
                if (this.dialogueText) this.dialogueText.textContent = current.text;
                if (this.dialogueText) this.dialogueText.style.color = (current.speaker === 'player') ? currentChar.color : (npc.color || '#888');

                // Ensure dialogue box and portraits are visible
                if (this.dialogueBox) this.dialogueBox.style.display = 'block';
                if (this.characterPortraits) this.characterPortraits.style.display = 'block';
                this.showingDialogue = true;
            }
        }
    }

    closeDialogue() {
        this.showingDialogue = false;
        if (this.dialogueBox) this.dialogueBox.style.display = 'none';
        if (this.characterPortraits) this.characterPortraits.style.display = 'none';

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

        // Refresh settings panel progress if open
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal && settingsModal.style.display === 'block' && typeof this.updateSettingsPanel === 'function') {
            try { this.updateSettingsPanel(); } catch (_) {}
        }
    }

    showSwitchPrompt() {
        const currentChar = this.gameState.getCurrentCharacter();

        let targetId = null;

        // If we just talked to Victor and are eligible to switch to him, propose Victor explicitly now
        const lastId = this.gameState && this.gameState.lastNPCTalkedId;
        const canSwitchVictor = this.gameState && typeof this.gameState.canSwitchToCharacter === 'function' && this.gameState.canSwitchToCharacter('victor');
        if (lastId === 'victor' && canSwitchVictor) {
            targetId = 'victor';
        }

        // Otherwise fall back to the last non-final NPC we talked to (not self)
        if (!targetId) {
            targetId = this.gameState.getLastSwitchTarget(currentChar.id);
        }
        if (!targetId) return; // If none, don’t show prompt

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

        // Ensure portraits are visible and styled consistently with dialogue UI
        if (this.characterPortraits) {
            this.characterPortraits.style.display = 'block';

            if (this.leftPortrait) {
                this.leftPortrait.textContent = currentChar.name;
                this.leftPortrait.style.outline = `4px solid ${currentChar.color || '#888'}`;
            }

            if (this.rightPortrait) {
                this.rightPortrait.textContent = nextChar.name;
                this.rightPortrait.style.outline = `4px solid ${nextChar.color || '#888'}`;
            }
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

            // Check if this is the final character (triggers glitch ending)
            if (targetChar && targetChar.isFinalCharacter) {
                this.triggerGlitchEnding();
                return;
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
                if (typeof this.gameState.save === 'function') this.gameState.save();
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
    switchToCharacter(characterId) {
        if (this.gameState.switchCharacter(characterId)) {
            const newChar = this.gameState.getCurrentCharacter();

            // Update player position
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
        }
    }

    triggerGlitchEnding() {
        this.isGameRunning = false;

        // Show glitch overlay
        if (this.glitchOverlay) this.glitchOverlay.style.display = 'block';

        // Stop music
        if (this.audioManager && typeof this.audioManager.stopMusic === 'function') {
            try { this.audioManager.stopMusic(); } catch (_) {}
        }
    }

    updateCharacterUI() {
        const currentChar = this.gameState.getCurrentCharacter();
        if (this.characterName) this.characterName.textContent = currentChar.name;

        // Also refresh settings panel values if open
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal && settingsModal.style.display === 'block') {
            this.updateSettingsPanel();
        }
    }

    applyCharacterTheme(character) {
        // Map new character IDs to site aspect themes for background/surface tinting
        const THEME_BY_CHAR = {
            alexis: 'breath',
            austine: 'light',
            chloe: 'time',
            isabell: 'space',
            nicholas: 'heart',
            opal: 'mind',
            tyson: 'hope',
            victor: 'rage',
        };
        const theme = (character && character.id && THEME_BY_CHAR[character.id]) ? THEME_BY_CHAR[character.id] : 'space';
        document.documentElement.setAttribute('data-theme', theme);
        // Drive UI accent directly from the current character color
        if (character && character.color) {
            document.documentElement.style.setProperty('--accent', character.color);
        }
    }

    showCharacterMenu() {
        // Removed dependency on getAvailableCharacters; simply show a switch prompt if there is a valid target
        this.showSwitchPrompt();
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