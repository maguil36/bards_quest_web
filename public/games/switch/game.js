import {
    initializeMapTiles,
    createRoom,
    createGap,
    roomDefinitions,
    boulderPositions,
    obstaclePositions,
    fillableChasmPositions,
    chestPositions,
    agentConfigs
} from './map/mapData.js';

import { PokemonCombatSystem } from './battle/battleCombat.js';
import { EndingManager } from './map/mapEnding.js';
import { BattleController } from './battle/battleController.js';
import { BattleUI } from './battle/battleUI.js';
import { BattleAudio } from './battle/BattleAudio.js';
import { MapInteractions } from './map/mapInteractions.js';
import { MapAI } from './map/mapAI.js';
import { MapQuests } from './map/mapQuests.js';
import { MapCharacterStatsUI } from './map/mapCharacterStatsUI.js';
import { MapQuestUI } from './map/mapQuestUI.js';
import { MapQuestLogUI } from './map/mapQuestLogUI.js';
import { MapQuestLogic } from './map/mapQuestLogic.js';
import { GAME_CONSTANTS, CHARACTER_ASPECTS } from './constants.js';
import { CHARACTERS, GameState } from './map/mapCharacters.js';
import { GameOrchestrator } from './orchestration/GameOrchestrator.js';

 // Main game logic for the Switch game
class SwitchGame {
    constructor() {

        try {
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('❌ Canvas element not found! Check HTML for id="gameCanvas"');
            }

            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('❌ Could not get 2D context from canvas');
            }

            this.ctx.imageSmoothingEnabled = false;

            this.gameState = new GameState();

            this.npcs = []; // will be built dynamically in init()
            this.characters = CHARACTERS;

            this.dialogueManager = new DialogueManager(this.gameState, this.npcs, this);

            this.audioManager = new AudioManager();

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

            this.combatSystem = new PokemonCombatSystem(this.gameState);
            this.gameState.combatSystem = this.combatSystem;

            this.battleUI = new BattleUI(this.gameState);

            this.battleAudio = new BattleAudio();

            this.renderer = new GameRenderer();

            this.endingManager = new EndingManager(this);

            this.battleController = new BattleController({ game: this });
            this.gameState.battleController = this.battleController;

            this.characterStatsUI = new MapCharacterStatsUI(this.gameState);
            this.questUI = new MapQuestUI(this.gameState);
            this.questLogUI = new MapQuestLogUI(this.gameState);
            this.questLogic = new MapQuestLogic(this.gameState);

            this.mapWidth = GAME_CONSTANTS.MAP_WIDTH;
            this.mapHeight = GAME_CONSTANTS.MAP_HEIGHT;
            this.tileSize = GAME_CONSTANTS.TILE_SIZE;

            this.camera = {
                x: 0,
                y: 0,
                width: this.canvas.width,
                height: this.canvas.height
            };

            this.player = {
                x: GAME_CONSTANTS.PLAYER_START_X,
                y: GAME_CONSTANTS.PLAYER_START_Y,
                width: GAME_CONSTANTS.PLAYER_WIDTH,
                height: GAME_CONSTANTS.PLAYER_HEIGHT,
                speed: GAME_CONSTANTS.PLAYER_SPEED,
                direction: 'down',
                isMoving: false,
                animationFrame: 0,
                animationTimer: 0
            };

            this.keys = {};
            this.lastInteractionTime = 0;
            this.lastFrameTime = 0;

            this.sprites = {};
            this.spritesLoaded = false;

            this.dialogueBox = document.getElementById('dialogueBox');
            this.switchPrompt = document.getElementById('switchPrompt');
            this.miniGamePrompt = document.getElementById('miniGamePrompt');
            this.glitchOverlay = document.getElementById('glitchOverlay');
            this.errorMessage = document.getElementById('errorMessage');
            this.characterName = document.getElementById('characterName');
            this.inventoryUI = document.getElementById('inventoryUI');
            this.questUIElement = document.getElementById('questUI');
            this.abilitiesUI = document.getElementById('abilitiesUI');
            this.combatUI = document.getElementById('combatUI');

            if (this.glitchOverlay) {
                this.glitchOverlay.style.display = 'none';
            } else {
            }
            if (this.switchPrompt) {
                this.switchPrompt.style.display = 'none';
            } else {
            }
            if (this.miniGamePrompt) {
                this.miniGamePrompt.style.display = 'none';
            } else {
            }
            if (this.dialogueBox) {
                this.dialogueBox.style.display = 'none';
            } else {
            }
            if (this.combatUI) {
                this.combatUI.style.display = 'none';
            } else {
            }

            this.isGameRunning = true;
            this.showingDialogue = false;
            this.showingSwitchPrompt = false;
            this.inMiniGame = false;
            this.miniGameForSwitch = false;
            this.inCombat = false;
            this.playerFrozen = false;
            this.boulderPushing = false;
            this.currentPuzzleChest = null;

            this.floatingTexts = [];

            this.mapTiles = [];
            this.mapCols = Math.floor(this.mapWidth / this.tileSize);
            this.mapRows = Math.floor(this.mapHeight / this.tileSize);

            this.chests = [];
            this.boulders = [];
            this.obstacles = [];
            this.fillableChasms = [];
            this.walls = [];
            this.agents = [];

            this.gameState.load();

            this.initializeMap();

            this.mapInteractions = new MapInteractions(this);

            this.mapAI = new MapAI({ game: this });

            this.mapQuests = new MapQuests({ game: this });

            this.gameOrchestrator = new GameOrchestrator(this);

            this.init();

        } catch (error) {
            throw error;
        }
    }

    async init() {
        try {

            if (typeof refreshCharacterColors === 'function') {
                refreshCharacterColors();
            } else {
            }

            this.restoreChestStates();

            const currentChar = this.gameState.getCurrentCharacter();
            const savedPos = this.gameState.characterPositions[currentChar.id];
            if (savedPos) {
                this.player.x = savedPos.x;
                this.player.y = savedPos.y;
            } else {
            }

            this.npcs = NPCS.filter(npc => npc.id !== currentChar.id).map(npc => ({
                ...npc,
                animationFrame: 0,
                animationTimer: 0,
                direction: 'down'
            }));
            if (this.dialogueManager) {
                this.dialogueManager.npcs = this.npcs;
            }

            for (const npc of this.npcs) {
                const saved = this.gameState.characterPositions[npc.id];
                if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
                    npc.position = { x: saved.x, y: saved.y };
                }
            }

            this.updateCharacterUI();

            this.setupEventListeners();

            if (this.glitchOverlay) this.glitchOverlay.style.display = 'none';
            if (this.switchPrompt) this.switchPrompt.style.display = 'none';
            if (this.miniGamePrompt) this.miniGamePrompt.style.display = 'none';
            if (this.dialogueBox) this.dialogueBox.style.display = 'none';
            if (this.combatUI) this.combatUI.style.display = 'none';

            this.isGameRunning = true;
            this.showingDialogue = false;
            this.showingSwitchPrompt = false;
            this.inMiniGame = false;
            this.miniGameForSwitch = false;
            this.inCombat = false;
            this.abilityMode = null;

            await this.loadSprites();

            if (this.audioManager && typeof this.audioManager.playCharacterMusic === 'function') {
                this.audioManager.playCharacterMusic(currentChar.id);
            } else {
            }

            this.applyCharacterTheme(currentChar);

            this.gameOrchestrator.initialize();
            this.gameOrchestrator.start();

            this.gameLoop();

            const pc = this.gameState.pendingCombat;
            if (pc) {
                const agent = this.agents.find(a => `${a.spawnX}_${a.spawnY}` === pc.agentKey && !a.defeated);
                if (agent) {
                    agent.chasing = true;
                    agent.alerted = false;
                    this.gameOrchestrator.switchToBattleMode(agent);
                } else {
                    this.gameState.pendingCombat = null;
                    this.gameState.save();
                }
            }
        } catch (error) {
            throw error;
        }
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

        // Character stats modal
        const statsModal = document.getElementById('characterStatsModal');
        const statsModalClose = document.getElementById('statsModalClose');
        const openStatsModalBtn = document.getElementById('openStatsModalBtn');
        const viewCharacterStatsBtn = document.getElementById('viewCharacterStatsBtn');

        const openStatsModal = () => {
            if (this.characterStatsUI && typeof this.characterStatsUI.updateStatsModal === 'function') {
                this.characterStatsUI.updateStatsModal();
            }
            if (statsModal) {
                statsModal.style.display = 'block';
                statsModal.classList.add('show');
            }
            if (settingsModal) {
                settingsModal.style.display = 'none';
            }
        };

        const closeStatsModal = () => {
            if (statsModal) {
                statsModal.style.display = 'none';
                statsModal.classList.remove('show');
            }
        };

        if (openStatsModalBtn) openStatsModalBtn.addEventListener('click', openStatsModal);
        if (viewCharacterStatsBtn) viewCharacterStatsBtn.addEventListener('click', openStatsModal);
        if (statsModalClose) statsModalClose.addEventListener('click', closeStatsModal);

        // E key to toggle stats modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'e' || e.key === 'E') {
                if (this.showingDialogue || this.inBattle) return;
                if (settingsModal && settingsModal.style.display === 'block') return;
                e.preventDefault();
                if (statsModal && statsModal.style.display === 'block') {
                    closeStatsModal();
                } else {
                    openStatsModal();
                }
            }
        });

        // Escape to close stats modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && statsModal && statsModal.style.display === 'block') {
                e.preventDefault();
                e.stopImmediatePropagation();
                closeStatsModal();
            }
        });

        // Quest log modal
        const questLogModal = document.getElementById('questLogModal');
        const questModalClose = document.getElementById('questLogModalClose');
        const openQuestLogBtn = document.getElementById('openQuestLogBtn');
        const viewQuestLogBtn = document.getElementById('viewQuestLogBtn');

        const openQuestLogModal = () => {
            if (this.questLogUI && typeof this.questLogUI.updateQuestLog === 'function') {
                this.questLogUI.updateQuestLog();
            }
            if (questLogModal) {
                questLogModal.style.display = 'block';
                questLogModal.classList.add('show');
            }
            if (settingsModal) {
                settingsModal.style.display = 'none';
            }
        };

        const closeQuestLogModal = () => {
            if (questLogModal) {
                questLogModal.style.display = 'none';
                questLogModal.classList.remove('show');
            }
        };

        if (openQuestLogBtn) openQuestLogBtn.addEventListener('click', openQuestLogModal);
        if (viewQuestLogBtn) viewQuestLogBtn.addEventListener('click', openQuestLogModal);
        if (questModalClose) questModalClose.addEventListener('click', closeQuestLogModal);

        // Q key to toggle quest log modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'q' || e.key === 'Q') {
                if (this.showingDialogue || this.inBattle) return;
                if (settingsModal && settingsModal.style.display === 'block') return;
                e.preventDefault();
                if (questLogModal && questLogModal.style.display === 'block') {
                    closeQuestLogModal();
                } else {
                    openQuestLogModal();
                }
            }
        });

        // Escape to close quest log modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && questLogModal && questLogModal.style.display === 'block') {
                e.preventDefault();
                e.stopImmediatePropagation();
                closeQuestLogModal();
            }
        });

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
        this.mapInteractions.handleCanvasClick(e);
    }

    checkItemPickup(x, y) {
        this.mapInteractions.checkItemPickup(x, y);
    }

    checkAbilityUsage(x, y) {
        const currentChar = this.gameState.getCurrentCharacter();
        if (!currentChar || !currentChar.abilities) return;

        this.mapInteractions.handleClickAbility(x, y);
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

    onMiniGameComplete(success) {
        this.inMiniGame = false;

        const targetNpcId = this.dialogueManager.pendingSwitch;
        const isNicholasUnlock = targetNpcId === 'nicholas' && !this.gameState.unlockedCharacters.has('nicholas');
        const isNicholasChallenge = targetNpcId === 'nicholas' && this.gameState.unlockedCharacters.has('nicholas');


        if (isNicholasUnlock) {
            this.miniGameForSwitch = false;

            if (success) {
                this.gameState.unlockCharacter('nicholas');

                if (!this.gameState.miniGameScores) {
                    this.gameState.miniGameScores = {};
                }
                this.gameState.miniGameScores.nicholas = this.miniGame.score;

                if (this.questLogic) {
                    this.questLogic.autoCompleteHistoricalActions('nicholas');

                    if (this.updateQuestUI) {
                        this.updateQuestUI();
                    }
                }

                this.gameState.save();
                this.gameOrchestrator.switchToDialogueMode('nicholas');
                this.gameOrchestrator.dialogueOrchestrator.showMinigameResultDialogue('nicholas', true);
            } else {
                this.gameOrchestrator.switchToDialogueMode('nicholas');
                this.gameOrchestrator.dialogueOrchestrator.showMinigameResultDialogue('nicholas', false);
            }
        } else if (isNicholasChallenge) {
            this.miniGameForSwitch = false;
            this.dialogueManager.pendingSwitch = null;

            if (!this.gameState.miniGameScores) {
                this.gameState.miniGameScores = {};
            }
            if (!this.gameState.miniGameScores.nicholasChallenge) {
                this.gameState.miniGameScores.nicholasChallenge = 0;
            }
            if (success) {
                this.gameState.miniGameScores.nicholasChallenge++;
                this.gameState.unlockCharacter('nicholas');

                if (this.questLogic) {
                    this.questLogic.autoCompleteHistoricalActions('nicholas');
                    if (this.updateQuestUI) {
                        this.updateQuestUI();
                    }
                }
            }
            this.gameState.save();

            this.gameState.save();

            if (success) {
                this.dialogueManager.currentDialogue = [
                    { speaker: 'npc', text: "Impressive! You've got real skill with a bow." },
                    { speaker: 'npc', text: "I think you can handle my abilities after all." },
                    { speaker: 'npc', text: "If you want to switch to me, just ask." }
                ];
            } else {
                this.dialogueManager.currentDialogue = [
                    { speaker: 'npc', text: "Not bad, but you'll need more practice." },
                    { speaker: 'npc', text: "Try again when you're ready." }
                ];
            }
            this.dialogueManager.currentLineIndex = 0;
            this.dialogueManager.isActive = true;
            this.dialogueManager.currentNPC = this.npcs.find(n => n.id === 'nicholas') || { id: 'nicholas', name: 'Nicholas' };
            this.showingDialogue = true;
            this.showDialogueUI();
        } else if (this.miniGameForSwitch) {
            this.miniGameForSwitch = false;

            if (this.gameOrchestrator.dialogueOrchestrator.handleMiniGameComplete(success, targetNpcId)) {
                this.gameOrchestrator.currentMode = 'dialogue';
                this.showingDialogue = true;
            }
        }
    }

    startSwitchMiniGame() {
        this.miniGameForSwitch = true;
        this.inMiniGame = true;
        this.miniGame.start();
    }

    saveChestStates() {
        this.mapInteractions.saveChestStates();
    }

    restoreChestStates() {
        this.mapInteractions.restoreChestStates();
    }

    onLogicPuzzleComplete(success) {
        this.mapInteractions.onLogicPuzzleComplete(success);
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

    updateSettingsPanel() {
        if (this.characterStatsUI) {
            this.characterStatsUI.updateStatsModal();
        }

        if (this.questUI) {
            this.questUI.updateQuestDisplay();
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
        this.mapQuests.updateQuestUI();
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
                        this.gameOrchestrator.dialogueOrchestrator.confirmMenuSelection();
                        if (!this.dialogueManager.showingMenu && !this.dialogueManager.isActive) {
                            this.gameOrchestrator.dialogueOrchestrator.endDialogue();
                        } else if (this.dialogueManager.isActive && !this.dialogueManager.showingMenu) {
                            this.showDialogueUI();
                        }
                    } else {
                        this.gameOrchestrator.dialogueOrchestrator.advanceDialogue();
                        this.showDialogueUI();
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
        this.mapInteractions.handleSpaceKeyInteractions();
    }


    async loadCharacterSprites(characterId) {
        const sprites = {
            forward_still: new Image(),
            forward_left: new Image(),
            forward_right: new Image(),
            back_left: new Image(),
            back_right: new Image(),
            side_still: new Image(),
            side_walk: new Image()
        };

        sprites.forward_still.src = `images/map/characters/${characterId}/${characterId}_foward_still.png`;
        sprites.forward_left.src = `images/map/characters/${characterId}/${characterId}_foward_left.png`;
        sprites.forward_right.src = `images/map/characters/${characterId}/${characterId}_foward_right.png`;
        sprites.back_left.src = `images/map/characters/${characterId}/${characterId}_back_left.png`;
        sprites.back_right.src = `images/map/characters/${characterId}/${characterId}_back_right.png`;
        sprites.side_still.src = `images/map/characters/${characterId}/${characterId}_side_still.png`;
        sprites.side_walk.src = `images/map/characters/${characterId}/${characterId}_side_walk.png`;

        await Promise.all(
            Object.values(sprites).map(img => new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => {
                    console.warn(`Failed to load ${characterId} sprite:`, img.src);
                    resolve();
                };
            }))
        );

        return sprites;
    }

    async loadSprites() {
        this.sprites = {
            characters: {},
            npcs: {},
            backgrounds: {}
        };

        for (const charId of Object.keys(CHARACTERS)) {
            this.sprites.characters[charId] = await this.loadCharacterSprites(charId);
        }

        for (const npc of this.npcs) {
            if (Object.keys(CHARACTERS).includes(npc.id)) {
                this.sprites.npcs[npc.id] = await this.loadCharacterSprites(npc.id);
            } else {
                this.sprites.npcs[npc.id] = this.createHumanSpriteSheet(npc.color || '#888');
            }
        }

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
                this.renderer.drawHumanFrame(ctx, x, y, tile, color, row, col);
            }
        }
        return canvas;
    }



    initializeMap() {
        initializeMapTiles(this.mapTiles, this.mapRows, this.mapCols);

        for (const room of roomDefinitions) {
            if (room.type === 'gap') {
                createGap(this.mapTiles, this.mapRows, this.mapCols, room.x, room.y, room.width, room.height);
            } else if (room.type === 'room') {
                createRoom(this.mapTiles, this.mapRows, this.mapCols, room.x, room.y, room.width, room.height, room.walled);
            }
        }

        this.boulders = boulderPositions.map(pos => ({
            x: pos.x * this.tileSize,
            y: pos.y * this.tileSize
        }));

        this.obstacles = obstaclePositions.map(pos => ({
            x: pos.x * this.tileSize,
            y: pos.y * this.tileSize,
            broken: pos.broken
        }));

        this.fillableChasms = fillableChasmPositions.map(pos => ({
            x: pos.x * this.tileSize,
            y: pos.y * this.tileSize,
            filled: pos.filled
        }));

        this.chests = chestPositions.map(chest => ({
            x: chest.x * this.tileSize,
            y: chest.y * this.tileSize,
            opened: chest.opened,
            item: chest.item,
            requiresPuzzle: chest.requiresPuzzle,
            restrictedTo: chest.restrictedTo
        }));

        this.agents = agentConfigs.map(agent => {
            const agentX = agent.x * this.tileSize;
            const agentY = agent.y * this.tileSize;
            const agentKey = `${agentX}_${agentY}`;
            const isDefeated = this.gameState.defeatedAgents && this.gameState.defeatedAgents.includes(agentKey);
            const isAlerted = this.gameState.alertedAgents && this.gameState.alertedAgents.includes(agentKey);
            const isChasing = this.gameState.chasingAgents && this.gameState.chasingAgents.includes(agentKey);

            return {
                x: agentX,
                y: agentY,
                spawnX: agentX,
                spawnY: agentY,
                direction: agent.direction,
                patrolPath: agent.patrolPath,
                patrolIndex: agent.patrolIndex,
                patrolReverse: agent.patrolReverse,
                speed: agent.speed,
                detectionRange: agent.detectionRange,
                alerted: isAlerted,
                alertTime: isAlerted ? Date.now() : undefined,
                chasing: isChasing,
                defeated: isDefeated,
                animationFrame: agent.animationFrame,
                animationTimer: agent.animationTimer,
                type: agent.type || 'derseAgent'
            };
        });
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

    update(deltaTime) {
        if (!this.isGameRunning || this.showingSwitchPrompt) return;
        this.gameOrchestrator.update(deltaTime);
    }

    updateAgents() {
        this.mapAI.updateAgents();
    }

    updateAgentPatrol(agent) {
        return this.mapAI.updateAgentPatrol(agent);
    }

    checkAgentDetection(agent) {
        this.mapAI.checkAgentDetection(agent);
    }

    startEncounterDialogue(agent) {
        this.gameOrchestrator.switchToEncounterDialogueMode(agent);
    }

    startAgentCombat(agent) {
        if (this.audioManager && typeof this.audioManager.stopEncounterMusic === 'function') {
            this.audioManager.stopEncounterMusic();
        }
        this.gameOrchestrator.onCombatTriggered(agent);
    }

    checkCollision(x, y, width, height, excludeAgent = null) {
        return this.mapInteractions.checkCollision(x, y, width, height, excludeAgent);
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
        this.mapInteractions.checkForItemPickups();
    }

    useCombatMove(moveIndex) {
        this.battleController.useCombatMove(moveIndex);
    }

    executeEnemyTurn() {
        this.battleController.executeEnemyTurn();
    }

    endCombat(playerWon) {
        this.battleController.endCombat(playerWon);
    }

    updatePlayerMovement() {
        this.mapInteractions.updatePlayerMovement();
    }

    showDialogueUI() {
        const interactionMenu = document.getElementById('interactionMenu');

        if (this.dialogueManager.showingMenu) {
            this.renderMenu();
            return;
        }

        if (interactionMenu) {
            interactionMenu.style.display = 'none';
        }

        const current = this.dialogueManager.getCurrentLine();
        const npc = this.dialogueManager.getCurrentNPC();
        const currentChar = this.gameState.getCurrentCharacter();

        if (current && npc) {
            const visibleText = this.dialogueManager.getVisibleText();

            if (this.dialogueBox) {
                this.dialogueBox.textContent = visibleText;

                const playerColor = currentChar.color;
                const npcColor = npc.color || '#888';

                this.dialogueBox.style.color = current.speaker === 'player' ? playerColor : npcColor;

                this.dialogueBox.classList.toggle('speaker-player', current.speaker === 'player');
                this.dialogueBox.classList.toggle('speaker-npc', current.speaker === 'npc');
                this.dialogueBox.classList.toggle('encounter-mode', this.isEncounterDialogue || false);
                this.dialogueBox.style.display = 'block';
            }
        }
    }

    renderMenu() {
        const npc = this.dialogueManager.getCurrentNPC();
        const options = this.dialogueManager.menuOptions;
        const selectedIdx = this.dialogueManager.selectedMenuOption;

        const interactionMenu = document.getElementById('interactionMenu');
        const interactionMenuContent = document.getElementById('interactionMenuContent');

        if (!npc || !options || !interactionMenu || !interactionMenuContent) {
            return;
        }

        let menuHTML = '';

        options.forEach((option, idx) => {
            const isSelected = idx === selectedIdx;
            const isEnabled = option.enabled;
            const cursor = isSelected ? '> ' : '  ';
            const color = !isEnabled ? '#555' : (isSelected ? '#fff' : '#aaa');
            const weight = isSelected ? 'bold' : 'normal';
            const cursorStyle = isEnabled ? 'pointer' : 'default';

            menuHTML += `<div
                data-option-idx="${idx}"
                data-option-id="${option.id}"
                data-enabled="${isEnabled}"
                style="color: ${color}; font-weight: ${weight}; opacity: ${isEnabled ? 1 : 0.5}; cursor: ${cursorStyle};"
                class="menu-option">${cursor}${option.label}</div>`;
        });

        menuHTML += '<div class="menu-hint">↑↓ SPACE</div>';

        interactionMenuContent.innerHTML = menuHTML;

        const screenX = npc.position.x - this.camera.x;
        const screenY = npc.position.y - this.camera.y;

        const menuX = screenX + 16;
        const menuY = screenY + 40;

        interactionMenu.style.left = `${menuX}px`;
        interactionMenu.style.top = `${menuY}px`;
        interactionMenu.style.display = 'block';

        if (this.dialogueBox) {
            this.dialogueBox.style.display = 'none';
        }

        this.attachMenuEventListeners();
    }

    attachMenuEventListeners() {
        const interactionMenuContent = document.getElementById('interactionMenuContent');
        if (!interactionMenuContent) return;

        const menuOptions = interactionMenuContent.querySelectorAll('.menu-option');

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

                    const interactionMenu = document.getElementById('interactionMenu');
                    if (interactionMenu) {
                        interactionMenu.style.display = 'none';
                    }

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
        this.mapInteractions.updateCamera();
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
        this.mapInteractions.checkForInteractions();
    }

    tryInteract() {
        return this.mapInteractions.tryInteract();
    }

    showInteractionMenu(npcId) {
        if (this.dialogueManager.showInteractionMenu(npcId)) {
            this.showingDialogue = true;
            this.showDialogueUI();
        }
    }

    startDialogue(npcId) {
        if (this.dialogueManager.startDialogue(npcId)) {
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
            if (this.isEncounterDialogue && this.encounteringAgent) {
                this.closeDialogue();
                this.startAgentCombat(this.encounteringAgent);
                this.encounteringAgent = null;
            } else {
                this.closeDialogue();
            }
        } else {
            this.showDialogueUI();
        }
    }


    closeDialogue() {
        this.showingDialogue = false;
        if (this.dialogueBox) this.dialogueBox.style.display = 'none';

        const interactionMenu = document.getElementById('interactionMenu');
        if (interactionMenu) interactionMenu.style.display = 'none';

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

        // Refresh settings panel progress if open
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal && settingsModal.style.display === 'block' && typeof this.updateSettingsPanel === 'function') {
            this.updateSettingsPanel();
        }
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
                    this.dialogueBox.textContent = "Hold on there. Before we switch, I need to know you can handle my abilities. Let me test your aim.";
                    this.dialogueBox.style.color = CHARACTERS.nicholas.color;
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
                    const reqMessage = this.getUnlockRequirementMessage(this.nextCharacterToSwitch);
                    this.dialogueBox.textContent = reqMessage || "You cannot switch to this character yet. Complete their unlock requirements first.";
                    this.dialogueBox.style.color = targetChar.color || '#ffffff';
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

            // Ensure sprite exists for ghost — prefer the pre-loaded character sprite
            if (this.sprites) {
                if (!this.sprites.npcs) this.sprites.npcs = {};
                this.sprites.npcs[ghostNPC.id] =
                    (this.sprites.npcs && this.sprites.npcs[ghostNPC.id]) ||
                    (this.sprites.characters && this.sprites.characters[ghostNPC.id]) ||
                    this.createHumanSpriteSheet(ghostNPC.color || '#888');
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
        return this.mapQuests.getUnlockRequirementMessage(characterId);
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

            if (!this.gameState.characterSwitches) {
                this.gameState.characterSwitches = {};
            }
            if (!this.gameState.characterSwitches[oldCharId]) {
                this.gameState.characterSwitches[oldCharId] = 0;
            }
            this.gameState.characterSwitches[oldCharId]++;
            this.gameState.characterSwitches[characterId] = true;

            if (!this.gameState.playedCharacters) {
                this.gameState.playedCharacters = new Set();
            }
            this.gameState.playedCharacters.add(characterId);

            if (characterId === 'chloe' && this.gameState.petFollowing && !this.gameState.petGivenToChloe) {
                this.gameState.petGivenToChloe = true;
                this.gameState.petFollowing = true;
            }

            // Rebuild NPCs list: remove new character, add old character
            this.npcs = NPCS.filter(npc => npc.id !== characterId).map(npc => ({
                ...npc,
                animationFrame: 0,
                animationTimer: 0,
                direction: 'down'
            }));

            // Update NPC positions from saved state
            for (const npc of this.npcs) {
                const saved = this.gameState.characterPositions[npc.id];
                if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
                    npc.position = { x: saved.x, y: saved.y };
                }
            }

            // Ensure every NPC has a sprite — copy from sprites.characters if not already in sprites.npcs
            if (this.sprites) {
                if (!this.sprites.npcs) this.sprites.npcs = {};
                for (const npc of this.npcs) {
                    if (!this.sprites.npcs[npc.id] && this.sprites.characters && this.sprites.characters[npc.id]) {
                        this.sprites.npcs[npc.id] = this.sprites.characters[npc.id];
                    }
                }
            }

            // Update dialogue manager NPCs reference
            if (this.dialogueManager) this.dialogueManager.npcs = this.npcs;

            // Update player position to new character's saved position
            const savedPos = this.gameState.characterPositions[characterId] || CHARACTERS[characterId]?.position;
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

            // Check quest progress for all characters after switch completes
            if (this.questLogic) {
                this.questLogic.autoCompleteHistoricalActions('austine');
                this.questLogic.autoCompleteHistoricalActions('isabela');
                this.questLogic.autoCompleteHistoricalActions('alexis');
                this.questLogic.autoCompleteHistoricalActions('nicholas');
                this.questLogic.autoCompleteHistoricalActions('tyson');
                this.questLogic.autoCompleteHistoricalActions('chloe');
                this.questLogic.autoCompleteHistoricalActions('opal');
                this.questLogic.autoCompleteHistoricalActions('victor');
            }

            this.gameState.save();

            return true;
        }

        return false;
    }

    triggerGlitchEnding() {
        this.endingManager.triggerGlitchEnding();
    }

    updateCharacterUI() {
        const currentChar = this.gameState.getCurrentCharacter();
        if (this.characterName) this.characterName.textContent = currentChar.name;

        // Update all UI elements to reflect new character
        this.updateInventoryUI();
        this.updateQuestUI();

        // Also refresh settings panel values if open
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal && settingsModal.style.display === 'block') {
            this.updateSettingsPanel();
        }
    }

    applyCharacterTheme(character) {
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
            const theme = (character && character.id && CHARACTER_ASPECTS[character.id])
                ? CHARACTER_ASPECTS[character.id]
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
            }
        }
        // If the user has a specific theme preference, do not override it here.

        // Always drive UI accent directly from the current character color inside the iframe/game UI
        if (character && character.color) {
            document.documentElement.style.setProperty('--accent', character.color);
        }
    }

    transitionToTheme(newTheme) {
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

    render() {
        this.renderer.render(this.ctx, {
            canvas: this.canvas,
            camera: this.camera,
            sprites: this.sprites,
            mapTiles: this.mapTiles,
            mapCols: this.mapCols,
            mapRows: this.mapRows,
            fillableChasms: this.fillableChasms,
            boulders: this.boulders,
            obstacles: this.obstacles,
            chests: this.chests,
            npcs: this.npcs,
            agents: this.agents,
            player: this.player,
            floatingTexts: this.floatingTexts,
            inMiniGame: this.inMiniGame,
            miniGame: this.miniGame,
            logicPuzzle: this.logicPuzzle,
            gameState: this.gameState
        });
    }

    gameLoop(currentTime = 0) {
        if (!this.lastFrameTime) {
            this.lastFrameTime = currentTime;
        }

        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        this.update(deltaTime);
        this.render();

        if (this.isGameRunning) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        new SwitchGame();
    } catch (error) {
        console.error('❌ Game initialization failed:', error);
        const errorBox = document.getElementById('errorMessage');
        if (errorBox) {
            errorBox.style.display = 'block';
            errorBox.textContent = 'Game initialization failed:\n' + (error.stack || error.message || error);
        }
    }
});