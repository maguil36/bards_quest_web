import { BaseOrchestrator } from './BaseOrchestrator.js';
import { MapOrchestrator } from '../map/MapOrchestrator.js';
import { BattleOrchestrator } from '../battle/BattleOrchestrator.js';
import { DialogueOrchestrator } from '../dialogue/DialogueOrchestrator.js';
import { CHARACTER_STATS } from '../battle/battleCombatData.js';

export class GameOrchestrator extends BaseOrchestrator {
    constructor(game) {
        super();
        this.game = game;
        this.currentMode = 'map';
        
        this.mapOrchestrator = new MapOrchestrator(game);
        this.battleOrchestrator = new BattleOrchestrator({ game: game });
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

        if (this.currentMode === 'map' && !this.game.inCombat && (!this.game.showingDialogue || this.game.isEncounterDialogue)) {
            this.mapOrchestrator.update(deltaTime);
        } else if (this.currentMode === 'battle' && this.game.inCombat) {
            this.battleOrchestrator.update(deltaTime);
        } else if (this.currentMode === 'dialogue' && this.game.showingDialogue) {
            this.dialogueOrchestrator.update(deltaTime);
            this.mapOrchestrator.updateNPCAnimations();
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

        if (this.game.battleAudio) {
            this.game.battleAudio.stopMusic();
        }

        if (this.game.audioManager) {
            const currentChar = this.game.gameState.getCurrentCharacter();
            this.game.audioManager.playCharacterMusic(currentChar.id);
        }

        console.log('[GameOrchestrator] Map resumed. isActive:', this.mapOrchestrator.isActive);
        this.emit('modeChanged', 'map');
    }

    switchToBattleMode(agent) {
        this.currentMode = 'battle';

        this.mapOrchestrator.pause();
        this.dialogueOrchestrator.pause();

        console.log('[GameOrchestrator] Stopping map audio');
        if (this.game.audioManager) {
            this.game.audioManager.stopMusic();
        }

        const currentChar = this.game.gameState.getCurrentCharacter();

        this.battleOrchestrator.startBattle({
            playerName: currentChar.id,
            playerLevel: this.game.gameState.levels[currentChar.id] || 100,
            enemyName: agent.type || 'derseAgent',
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
        const { won, resetOnly, summary } = result;

        if (won && !resetOnly) {
            if (this.game.currentAgentInCombat) {
                const agentKey = `${this.game.currentAgentInCombat.x}_${this.game.currentAgentInCombat.y}`;
                if (!this.game.gameState.defeatedAgents.includes(agentKey)) {
                    this.game.gameState.defeatedAgents.push(agentKey);
                }
                this.game.currentAgentInCombat.defeated = true;
                this.game.currentAgentInCombat.chasing = false;
                this.game.currentAgentInCombat.alerted = false;
            }

            if (summary && summary.enemy && summary.playerCharacter) {
                const enemyId = summary.enemy.id;
                const playerId = summary.playerCharacter.id;
                const enemyStats = CHARACTER_STATS[enemyId];

                if (enemyStats && enemyStats.xpDrop) {
                    this.awardXP(playerId, enemyStats.xpDrop);
                }

                if (this.game.questLogic) {
                    const isBoss = ['DD', 'SS', 'HB', 'CB'].includes(enemyId);
                    const isArchagent = enemyId.includes('Archagent') || !isBoss;

                    this.game.questLogic.completeQuest('defeat_enemy_opal');

                    if (isArchagent) {
                        this.game.questLogic.completeQuest('defeat_archagent');
                    }

                    if (isBoss) {
                        this.game.questLogic.completeQuest('defeat_boss_alexis');
                        this.game.questLogic.completeQuest('enter_combat_boss');
                    }
                }
            }

            this.game.gameState.save();
        }

        this.game.playerFrozen = false;
        this.game.isEncounterDialogue = false;

        console.log('[GameOrchestrator] Calling switchToMapMode');
        this.switchToMapMode();
        this.emit('combatEnded', { won, resetOnly });
    }

    awardXP(characterId, xpAmount) {
        const currentXP = this.game.gameState.xp[characterId] || 0;
        const currentLevel = this.game.gameState.levels[characterId] || 1;

        const newXP = currentXP + xpAmount;
        this.game.gameState.xp[characterId] = newXP;

        const xpForNextLevel = this.calculateXpForLevel(currentLevel + 1);

        if (newXP >= xpForNextLevel && currentLevel < 100) {
            this.levelUp(characterId);

            if (this.game.questLogic && characterId === 'chloe') {
                const newLevel = currentLevel + 1;
                if (newLevel === 99) {
                    this.game.questLogic.completeQuest('level_up_99');
                } else if (newLevel === 100) {
                    this.game.questLogic.completeQuest('level_up_100');
                }
            }
        }

        console.log(`[GameOrchestrator] ${characterId} gained ${xpAmount} XP! Total: ${newXP}`);
    }

    calculateXpForLevel(level) {
        return Math.floor(Math.pow(level, 3));
    }

    levelUp(characterId) {
        const currentLevel = this.game.gameState.levels[characterId] || 1;
        const newLevel = currentLevel + 1;

        if (newLevel > 100) return;

        this.game.gameState.levels[characterId] = newLevel;

        const charStats = CHARACTER_STATS[characterId];
        if (charStats) {
            const statGrowth = {
                hp: Math.floor(charStats.maxHp / 100),
                attack: Math.floor(charStats.attack / 100),
                defense: Math.floor(charStats.defense / 100),
                specialAttack: Math.floor(charStats.specialAttack / 100),
                specialDefense: Math.floor(charStats.specialDefense / 100),
                speed: Math.floor(charStats.speed / 100)
            };

            if (!this.game.gameState.characters[characterId].statGrowth) {
                this.game.gameState.characters[characterId].statGrowth = {
                    hp: 0,
                    attack: 0,
                    defense: 0,
                    specialAttack: 0,
                    specialDefense: 0,
                    speed: 0
                };
            }

            this.game.gameState.characters[characterId].statGrowth.hp += statGrowth.hp;
            this.game.gameState.characters[characterId].statGrowth.attack += statGrowth.attack;
            this.game.gameState.characters[characterId].statGrowth.defense += statGrowth.defense;
            this.game.gameState.characters[characterId].statGrowth.specialAttack += statGrowth.specialAttack;
            this.game.gameState.characters[characterId].statGrowth.specialDefense += statGrowth.specialDefense;
            this.game.gameState.characters[characterId].statGrowth.speed += statGrowth.speed;
        }

        console.log(`[GameOrchestrator] ${characterId} leveled up to level ${newLevel}!`);
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
