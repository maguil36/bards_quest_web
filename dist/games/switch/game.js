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

        // Glitch/ending state
        this.isGlitching = false;
        this.glitchFrozenCanvas = null; // snapshot used for stuck-pixel effect
        this.glitchStuckCells = [];     // array of {x,y,w,h}
        this.glitchPixelSize = 4;       // base pixelation size
        this.glitchScratchCanvas = null; // downscale buffer
        this.glitchOverlayIntervalId = null; // cycles flashing images
        this.scrambleActive = false;    // NPC/player jump-around burst
        this._nextScrambleAt = 0;       // timestamp for next scramble start

        this.init();
    }

    async init() {
        // Ensure CSS variable-driven colors are up-to-date
        if (typeof refreshCharacterColors === 'function') {
            refreshCharacterColors();
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

        // Apply movement with bounds checking
        const newX = Math.max(0, Math.min(this.mapWidth - this.player.width, this.player.x + dx));
        const newY = Math.max(0, Math.min(this.mapHeight - this.player.height, this.player.y + dy));

        this.player.x = newX;
        this.player.y = newY;

        // Save current player position to game state
        const currentChar = this.gameState.getCurrentCharacter();
        if (currentChar && currentChar.id) {
            this.gameState.characterPositions[currentChar.id] = { x: this.player.x, y: this.player.y };
        }
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

    advanceDialogue() {
        if (!this.dialogueManager.nextLine()) {
            // Dialogue completed
            this.closeDialogue();

            // Always evaluate whether a switch prompt should be shown based on strict rules
            setTimeout(() => this.showSwitchPrompt(), 400);
        } else {
            // Update dialogue UI using structured current line object (text/speaker)
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
                this.showingDialogue = true;
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

        // Refresh settings panel progress if open
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal && settingsModal.style.display === 'block' && typeof this.updateSettingsPanel === 'function') {
            this.updateSettingsPanel();
        }
    }

    showSwitchPrompt() {
        const currentChar = this.gameState.getCurrentCharacter();

        // Check if current character has completed all required dialogues (Remaining to progress: 0)
        const remainingForCharacter = (this.gameState && typeof this.gameState.getRemainingForCharacterProgress === 'function')
            ? this.gameState.getRemainingForCharacterProgress(currentChar.id)
            : 1;

        // Only allow switching if the current character has talked to everyone they need to (remaining = 0)
        if (remainingForCharacter > 0) {
            return; // Don't show switch prompt if character hasn't completed all dialogues
        }

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

            // If target is the final character (Victor), only allow when remaining == 0 and we just interacted with Victor
            const remaining = (this.gameState && typeof this.gameState.getRemainingInteractionsToFinishGame === 'function')
                ? this.gameState.getRemainingInteractionsToFinishGame()
                : 1;
            const lastTalked = this.gameState && this.gameState.lastNPCTalkedId;
            if (targetChar && targetChar.isFinalCharacter) {
                if (!(remaining === 0 && lastTalked === 'victor' && this.gameState.canSwitchToCharacter && this.gameState.canSwitchToCharacter('victor'))) {
                    // Guard: do not allow switching to Victor unless strict conditions met
                    return;
                }

                // Begin glitch ending while playing Victor's music
                if (this.audioManager && typeof this.audioManager.playCharacterMusic === 'function') {
                    try { this.audioManager.playCharacterMusic('victor'); } catch(_) {}
                }
                this.triggerGlitchEnding();
                // Begin glitch ending while playing Victor's music
                if (this.audioManager && typeof this.audioManager.playCharacterMusic === 'function') {
                    this.audioManager.playCharacterMusic('victor');
                }
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