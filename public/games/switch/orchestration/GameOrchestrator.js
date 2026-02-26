import { BaseOrchestrator } from './BaseOrchestrator.js';
import { MapOrchestrator } from '../map/MapOrchestrator.js';
import { BattleOrchestrator } from '../battle/BattleOrchestrator.js';
import { DialogueOrchestrator } from '../dialogue/DialogueOrchestrator.js';

export class GameOrchestrator extends BaseOrchestrator {
    constructor(game) {
        super();
        this.game = game;
        this.currentMode = 'map';
        
        this.mapOrchestrator = new MapOrchestrator(game);
        this.battleOrchestrator = new BattleOrchestrator(game);
        this.dialogueOrchestrator = new DialogueOrchestrator(game);
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.mapOrchestrator.on('combatTriggered', (agent) => {
            this.onCombatTriggered(agent);
        });
        
        this.mapOrchestrator.on('dialogueRequested', (npcId) => {
            this.switchToDialogueMode(npcId);
        });
        
        this.mapOrchestrator.on('questCompleted', (questId) => {
            this.onQuestCompleted(questId);
        });
        
        this.battleOrchestrator.on('battleEnd', (result) => {
            this.onCombatEnded(result);
        });
        
        this.dialogueOrchestrator.on('dialogueEnd', (npcId) => {
            this.onDialogueEnded();
        });
        
        this.dialogueOrchestrator.on('minigameRequested', (targetChar) => {
            this.onMinigameRequested(targetChar);
        });
    }

    initialize() {
        super.initialize();
        this.mapOrchestrator.initialize();
        this.battleOrchestrator.initialize();
        this.dialogueOrchestrator.initialize();
        this.currentMode = 'map';
    }

    start() {
        this.isActive = true;
        this.currentMode = 'map';
        this.mapOrchestrator.resume();
    }

    pause() {
        super.pause();
        this.mapOrchestrator.pause();
        this.battleOrchestrator.pause();
        this.dialogueOrchestrator.pause();
    }

    resume() {
        super.resume();
        if (this.currentMode === 'map') {
            this.mapOrchestrator.resume();
        } else if (this.currentMode === 'battle') {
            this.battleOrchestrator.resume();
        } else if (this.currentMode === 'dialogue') {
            this.dialogueOrchestrator.resume();
        }
    }

    update(deltaTime) {
        if (!this.isActive) return;

        if (this.game.logicPuzzle && this.game.logicPuzzle.active) {
            this.game.logicPuzzle.update();
            return;
        }

        if (this.game.inMiniGame && this.game.miniGame) {
            this.game.miniGame.update();
            return;
        }

        if (this.currentMode === 'map' && !this.game.inCombat && !this.game.showingDialogue) {
            this.mapOrchestrator.update(deltaTime);
        } else if (this.currentMode === 'battle' && this.game.inCombat) {
            this.battleOrchestrator.update(deltaTime);
        } else if (this.currentMode === 'dialogue' && this.game.showingDialogue) {
            this.dialogueOrchestrator.update();
        }
    }

    render(ctx) {
        if (!this.isActive) return;
    }

    switchToMapMode() {
        console.log('[GameOrchestrator] switchToMapMode called');
        this.currentMode = 'map';
        this.game.inCombat = false;
        this.game.showingDialogue = false;
        this.game.inMiniGame = false;

        console.log('[GameOrchestrator] Pausing battle and dialogue, resuming map');
        this.battleOrchestrator.pause();
        this.dialogueOrchestrator.pause();
        this.mapOrchestrator.resume();

        console.log('[GameOrchestrator] Map resumed. isActive:', this.mapOrchestrator.isActive);
        this.emit('modeChanged', 'map');
    }

    switchToBattleMode(agent) {
        this.currentMode = 'battle';

        this.mapOrchestrator.pause();
        this.dialogueOrchestrator.pause();

        const currentChar = this.game.gameState.getCurrentCharacter();

        this.battleOrchestrator.startBattle({
            playerName: currentChar.id,
            enemyName: 'derseAgent',
            agent: agent
        });

        this.emit('modeChanged', 'battle');
    }

    switchToDialogueMode(npcId) {
        this.currentMode = 'dialogue';
        this.game.showingDialogue = true;
        
        this.mapOrchestrator.pause();
        this.dialogueOrchestrator.startDialogue(npcId);
        
        this.emit('modeChanged', 'dialogue');
    }

    switchToMinigameMode(gameType) {
        this.currentMode = 'minigame';
        this.game.inMiniGame = true;
        
        this.mapOrchestrator.pause();
        this.battleOrchestrator.pause();
        this.dialogueOrchestrator.pause();
        
        this.emit('modeChanged', 'minigame');
    }

    switchCharacter(characterId) {
        const success = this.game.switchToCharacter(characterId);
        if (success) {
            this.emit('characterSwitched', characterId);
        }
        return success;
    }

    getCurrentCharacter() {
        return this.game.gameState.getCurrentCharacter();
    }

    unlockCharacter(characterId) {
        this.game.gameState.unlockCharacter(characterId);
        this.emit('characterUnlocked', characterId);
    }

    saveGame() {
        this.game.gameState.save();
        this.emit('gameSaved');
    }

    loadGame() {
        this.game.gameState.load();
        this.emit('gameLoaded');
    }

    resetGame() {
        this.game.gameState.reset();
        this.emit('gameReset');
    }

    getGameState() {
        return this.game.gameState;
    }

    getPlayerPosition() {
        return {
            x: this.game.player.x,
            y: this.game.player.y
        };
    }

    isSystemBusy() {
        return this.game.inCombat || this.game.showingDialogue || this.game.inMiniGame || this.game.showingSwitchPrompt;
    }

    onCombatTriggered(agent) {
        if (this.game.inCombat || this.game.showingDialogue) return;
        
        this.switchToBattleMode(agent);
        this.emit('combatStarted', agent);
    }

    onCombatEnded(result) {
        console.log('[GameOrchestrator] onCombatEnded called:', result);
        const { won, resetOnly } = result;

        if (won && !resetOnly && this.game.currentAgentInCombat) {
            const agentKey = `${this.game.currentAgentInCombat.x}_${this.game.currentAgentInCombat.y}`;
            if (!this.game.gameState.defeatedAgents.includes(agentKey)) {
                this.game.gameState.defeatedAgents.push(agentKey);
            }
            this.game.currentAgentInCombat.defeated = true;
            this.game.gameState.save();
        }

        console.log('[GameOrchestrator] Calling switchToMapMode');
        this.switchToMapMode();
        this.emit('combatEnded', { won, resetOnly });
    }

    onDialogueStarted(npcId) {
        this.emit('dialogueStarted', npcId);
    }

    onDialogueEnded() {
        this.game.showingDialogue = false;
        this.switchToMapMode();
        this.emit('dialogueEnded');
    }

    onQuestCompleted(questId) {
        this.emit('questCompleted', questId);
    }

    onCharacterSwitched(newChar) {
        this.emit('characterSwitched', newChar);
    }

    onMinigameRequested(targetChar) {
        this.game.dialogueManager.pendingSwitch = targetChar;
        this.game.startSwitchMiniGame();
        this.emit('minigameRequested', targetChar);
    }

    handleKeyDown(keyCode) {
        if (this.game.showingSwitchPrompt || !this.isActive) return;

        if (this.currentMode === 'map') {
            this.handleMapKeyDown(keyCode);
        } else if (this.currentMode === 'dialogue') {
            this.handleDialogueKeyDown(keyCode);
        } else if (this.currentMode === 'battle') {
            this.handleBattleKeyDown(keyCode);
        }
    }

    handleMapKeyDown(keyCode) {
        if (keyCode === 'Space') {
            this.mapOrchestrator.handlePlayerInteraction();
        }
    }

    handleDialogueKeyDown(keyCode) {
        if (keyCode === 'Space') {
            if (this.dialogueOrchestrator.isShowingMenu()) {
                this.dialogueOrchestrator.confirmMenuSelection();
            } else {
                this.dialogueOrchestrator.advanceDialogue();
            }
        } else if (keyCode === 'ArrowUp' || keyCode === 'KeyW') {
            if (this.dialogueOrchestrator.isShowingMenu()) {
                this.dialogueOrchestrator.navigateMenu('up');
            }
        } else if (keyCode === 'ArrowDown' || keyCode === 'KeyS') {
            if (this.dialogueOrchestrator.isShowingMenu()) {
                this.dialogueOrchestrator.navigateMenu('down');
            }
        }
    }

    handleBattleKeyDown(keyCode) {
    }

    destroy() {
        super.destroy();
        this.mapOrchestrator.destroy();
        this.battleOrchestrator.destroy();
        this.dialogueOrchestrator.destroy();
    }
}
