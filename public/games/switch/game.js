 // Main game logic for the Switch game
class SwitchGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = new GameState();
        this.npcs = NPCS;
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
            speed: 4,
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

        // Game state
        this.isGameRunning = true;
        this.showingDialogue = false;
        this.showingSwitchPrompt = false;

        this.init();
    }

    async init() {
        // Load game state
        this.gameState.load();

        // Set initial player position
        const currentChar = this.gameState.getCurrentCharacter();
        const savedPos = this.gameState.characterPositions[currentChar.id];
        if (savedPos) {
            this.player.x = savedPos.x;
            this.player.y = savedPos.y;
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
                this.audioManager.playCharacterMusic(currentChar.id);
                this._audioUnlocked = true;
            }
            this.keys[e.code] = true;
            this.handleKeyPress(e);
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Switch prompt buttons
        document.getElementById('switchYes').addEventListener('click', () => {
            this.handleCharacterSwitch(true);
        });

        document.getElementById('switchNo').addEventListener('click', () => {
            this.handleCharacterSwitch(false);
        });

        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handleKeyPress(e) {
        const now = Date.now();

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
                e.preventDefault();
                if (this.showingDialogue) {
                    this.closeDialogue();
                } else if (!this.showingSwitchPrompt) {
                    this.showCharacterMenu();
                }
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

        // Handle input
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            dy = -this.player.speed;
            this.player.direction = 'up';

            // Reset portraits highlight on movement
            if (this.characterPortraits) {
                this.leftPortrait.style.outline = '2px solid var(--border)';
                this.rightPortrait.style.outline = '2px solid var(--border)';
                this.characterPortraits.style.display = 'none';
            }
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            dy = this.player.speed;
            this.player.direction = 'down';

            if (this.characterPortraits) {
                this.leftPortrait.style.outline = '2px solid var(--border)';
                this.rightPortrait.style.outline = '2px solid var(--border)';
                this.characterPortraits.style.display = 'none';
            }
        }
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            dx = -this.player.speed;
            this.player.direction = 'left';

            if (this.characterPortraits) {
                this.leftPortrait.style.outline = '2px solid var(--border)';
                this.rightPortrait.style.outline = '2px solid var(--border)';
                this.characterPortraits.style.display = 'none';
            }
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            dx = this.player.speed;
            this.player.direction = 'right';
        }

        // Update movement state
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
            this.dialogueText.style.color = current.speaker === 'player' ? playerColor : npcColor;

            // Toggle speaker highlight classes on dialogue box
            this.dialogueBox.classList.toggle('speaker-player', current.speaker === 'player');
            this.dialogueBox.classList.toggle('speaker-npc', current.speaker === 'npc');

            // Highlight speaker portrait card
            this.characterPortraits.style.display = 'block';
            this.leftPortrait.style.outline = current.speaker === 'npc' ? `4px solid ${npcColor}` : '2px solid var(--border)';
            this.rightPortrait.style.outline = current.speaker === 'player' ? `4px solid ${playerColor}` : '2px solid var(--border)';
            this.leftPortrait.style.background = 'var(--surface)';
            this.rightPortrait.style.background = 'var(--surface)';

            // Show dialogue box
            this.dialogueBox.style.display = 'block';
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
            const distance = Math.sqrt(
                Math.pow(playerCenterX - (npc.position.x + 16), 2) +
                Math.pow(playerCenterY - (npc.position.y + 16), 2)
            );

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

        // Find closest NPC
        let closestNPC = null;
        let closestDistance = interactionDistance;

        for (const npc of this.npcs) {
            const distance = Math.sqrt(
                Math.pow(playerCenterX - (npc.position.x + 16), 2) +
                Math.pow(playerCenterY - (npc.position.y + 16), 2)
            );

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
            // Back-and-forth visual treatment
            this.dialogueText.textContent = current.text;

            // Determine colors
            const playerColor = currentChar.color;
            const npcColor = npc.color || '#888';

            // Style
            this.dialogueText.style.color = current.speaker === 'player' ? playerColor : npcColor;
            this.dialogueBox.classList.toggle('speaker-player', current.speaker === 'player');
            this.dialogueBox.classList.toggle('speaker-npc', current.speaker === 'npc');
            this.characterPortraits.style.display = 'block';
            this.leftPortrait.style.outline = current.speaker === 'npc' ? `4px solid ${npcColor}` : '2px solid var(--border)';
            this.rightPortrait.style.outline = current.speaker === 'player' ? `4px solid ${playerColor}` : '2px solid var(--border)';
            this.leftPortrait.style.background = 'var(--surface)';
            this.rightPortrait.style.background = 'var(--surface)';
            this.dialogueBox.style.display = 'block';
        }
    }

    advanceDialogue() {
        if (!this.dialogueManager.nextLine()) {
            // Dialogue completed
            this.closeDialogue();

            // Check if ready to switch
            if (this.gameState.isReadyToSwitch()) {
                setTimeout(() => this.showSwitchPrompt(), 500);
            }
        } else {
            // Update dialogue UI using structured current line object (text/speaker)
            const current = this.dialogueManager.getCurrentLine();
            const npc = this.dialogueManager.getCurrentNPC();
            const currentChar = this.gameState.getCurrentCharacter();

            if (current && npc) {
                this.dialogueText.textContent = current.text;
                this.dialogueText.style.color = (current.speaker === 'player') ? currentChar.color : (npc.color || '#888');

                // Ensure dialogue box and portraits are visible
                this.dialogueBox.style.display = 'block';
                this.characterPortraits.style.display = 'block';
                this.showingDialogue = true;
            } else {
                // Fallback to legacy UI rendering if structured data unavailable
                this.showDialogueUI();
            }
        }
    }

    closeDialogue() {
        this.showingDialogue = false;
        this.dialogueBox.style.display = 'none';
        this.characterPortraits.style.display = 'none';
    }

    showSwitchPrompt() {
        const availableCharacters = this.gameState.getAvailableCharacters();
        if (availableCharacters.length === 0) return;

        const currentChar = this.gameState.getCurrentCharacter();
        const nextChar = availableCharacters[0]; // For simplicity, pick the first available

        document.getElementById('switchFromCharacter').textContent = currentChar.name;
        document.getElementById('switchToCharacter').textContent = nextChar.name;

        // If a dialogue box is visible, hide it while showing the switch prompt
        if (this.dialogueBox) {
            this.dialogueBox.style.display = 'none';
        }

        // Ensure portraits are visible and styled consistently with dialogue UI
        if (this.characterPortraits) {
            this.characterPortraits.style.display = 'block';

            if (this.leftPortrait) {
                // leftPortrait is a div; use textContent and outline instead of img properties
                this.leftPortrait.textContent = currentChar.name;
                this.leftPortrait.style.outline = `4px solid ${currentChar.color || '#888'}`;
            }

            if (this.rightPortrait) {
                // rightPortrait is a div; use textContent and outline instead of img properties
                this.rightPortrait.textContent = nextChar.name;
                this.rightPortrait.style.outline = `4px solid ${nextChar.color || '#888'}`;
            }
        }

        this.showingSwitchPrompt = true;
        this.switchPrompt.style.display = 'block';
        this.nextCharacterToSwitch = nextChar.id;
    }

    handleCharacterSwitch(confirmed) {
        this.showingSwitchPrompt = false;
        this.switchPrompt.style.display = 'none';

        if (confirmed && this.nextCharacterToSwitch) {
            const targetChar = CHARACTERS[this.nextCharacterToSwitch];

            // Check if this is the final character (triggers glitch ending)
            if (targetChar && targetChar.isFinalCharacter) {
                this.triggerGlitchEnding();
                return;
            }

            // Perform normal character switch
            this.switchToCharacter(this.nextCharacterToSwitch);
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
        this.glitchOverlay.style.display = 'block';

        // Stop music
        this.audioManager.stopMusic();
    }

    // Duplicate render method removed — consolidated render() is defined later in this file.
    render() {
        // Intentionally left blank to avoid duplicate method definitions.
        // The consolidated render implementation (with proper spritesLoaded checks)
        // appears later in the file and will be used.
    }

    updateCharacterUI() {
        const currentChar = this.gameState.getCurrentCharacter();
        this.characterName.textContent = currentChar.name;
    }

    applyCharacterTheme(character) {
        document.documentElement.setAttribute('data-theme', character.theme);
    }

    showCharacterMenu() {
        // Simple character selection (could be expanded into a full menu)
        const availableChars = this.gameState.getAvailableCharacters();
        if (availableChars.length > 0) {
            this.showSwitchPrompt();
        }
    }

    // Render the world, slicing sprite sheets per direction/frame for NPCs and player
    render() {
        if (!this.ctx || !this.spritesLoaded) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.ctx.drawImage(
            this.sprites.backgrounds.main,
            -this.camera.x, -this.camera.y
        );

        const tile = 32;

        // Draw NPCs
        for (const npc of this.npcs) {
            const screenX = npc.position.x - this.camera.x;
            const screenY = npc.position.y - this.camera.y;

            if (screenX > -tile && screenX < this.canvas.width &&
                screenY > -tile && screenY < this.canvas.height) {
                // Slice sheet: idle down frame
                const frame = 0;
                const dirRow = 0;
                const sprite = this.sprites.npcs[npc.id];
                if (sprite) {
                    this.ctx.drawImage(
                        sprite,
                        frame * tile, dirRow * tile, tile, tile,
                        screenX, screenY, tile, tile
                    );
                }

                // NPC name
                this.ctx.fillStyle = npc.color || '#fff';
                this.ctx.font = '12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(npc.name, screenX + (tile / 2), screenY - 5);
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
        const charSprite = this.sprites.characters[currentChar.id];
        if (charSprite) {
            this.ctx.drawImage(
                charSprite,
                playerFrame * tile, playerDirRow * tile, tile, tile,
                playerScreenX, playerScreenY, tile, tile
            );
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