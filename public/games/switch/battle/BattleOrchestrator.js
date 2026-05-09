import { BaseOrchestrator } from '../orchestration/BaseOrchestrator.js';
import { BattleState } from './BattleState.js';
import { getCombatantData } from './battleCombatData.js';

export class BattleOrchestrator extends BaseOrchestrator {
    constructor(config) {
        super();

        if (config.game) {
            this.game = config.game;
            this.battleState = new BattleState({
                spawnPosition: { x: config.game.playerStartX, y: config.game.playerStartY }
            });
            this.gameState = config.game.gameState;
            this.combatSystem = config.game.combatSystem;
            this.battleUI = config.game.battleUI;
            this.battleController = config.game.battleController;
        } else {
            this.battleState = config.battleState || new BattleState({
                spawnPosition: config.spawnPosition || { x: 0, y: 0 },
                canEscape: config.canEscape
            });

            this.gameState = config.gameState;
            this.combatSystem = config.combatSystem;
            this.battleUI = config.battleUI;

            this.callbacks = {
                onVictory: config.onVictory || (() => {}),
                onDefeat: config.onDefeat || (() => {}),
                onEscape: config.onEscape || (() => {})
            };

            if (config.battleController) {
                this.battleController = config.battleController;
            }
        }
    }

    initialize() {
        super.initialize();
    }

    startBattle(combatConfig) {
        let playerData, enemyData;

        if (typeof combatConfig === 'string') {
            playerData = getCombatantData(combatConfig);
            enemyData = getCombatantData('derseAgent');
        } else if (combatConfig.playerName && combatConfig.enemyName) {
            playerData = getCombatantData(combatConfig.playerName);
            if (combatConfig.playerLevel !== undefined) {
                playerData.level = combatConfig.playerLevel;
            }
            enemyData = combatConfig.enemy && typeof combatConfig.enemy === 'object'
                ? combatConfig.enemy
                : getCombatantData(combatConfig.enemyName);
        } else if (combatConfig.player) {
            if (typeof combatConfig.player === 'string') {
                playerData = getCombatantData(combatConfig.player);
            } else {
                playerData = {
                    id: combatConfig.player.id,
                    name: combatConfig.player.name,
                    health: combatConfig.player.currentHp || combatConfig.player.health,
                    maxHealth: combatConfig.player.maxHp || combatConfig.player.maxHealth || 100,
                    attack: combatConfig.player.attack || 70,
                    defense: combatConfig.player.defense || 60,
                    moves: combatConfig.player.moves
                };
            }

            if (combatConfig.enemy) {
                if (typeof combatConfig.enemy === 'string') {
                    enemyData = getCombatantData(combatConfig.enemy);
                } else {
                    enemyData = combatConfig.enemy;
                }
            } else {
                enemyData = getCombatantData('derseAgent');
            }
        } else {
            console.error('Invalid combat config:', combatConfig);
            return;
        }

        if (!playerData || !enemyData) {
            console.error('Failed to resolve combatant data');
            return;
        }

        this.battleState.startBattle(playerData, enemyData, combatConfig.agent || null);
        this.isActive = true;

        console.log('[BattleOrchestrator] Attempting to play battle music for enemy:', enemyData.id);
        if (this.game?.battleAudio) {
            console.log('[BattleOrchestrator] battleAudio exists, calling playEnemyMusic');
            this.game.battleAudio.playEnemyMusic(enemyData.id);
        } else {
            console.warn('[BattleOrchestrator] battleAudio NOT found!', {
                hasGame: !!this.game,
                hasBattleAudio: !!this.game?.battleAudio
            });
        }

        this.emit('battleStart', { player: playerData, enemy: enemyData });

        if (this.battleController) {
            this.battleController.startAgentCombat(combatConfig.agent || null, playerData, enemyData);
        }
    }

    update(deltaTime) {
        if (!this.isActive || !this.battleState.isInCombat()) return;
    }

    render(ctx) {
        if (!this.isActive || !this.battleState.isInCombat()) return;
    }

    selectMove(moveIndex) {
        if (this.battleController) {
            this.battleController.useCombatMove(moveIndex);
        }
    }

    executePlayerTurn() {
    }

    executeEnemyTurn() {
        if (this.battleController) {
            this.battleController.executeEnemyTurn();
        }
    }

    endBattle(playerWon, resetOnly = false) {
        console.log('[BattleOrchestrator] endBattle called:', { playerWon, resetOnly });

        if (this.combatSystem && this.combatSystem.player && this.gameState) {
            const playerId = this.combatSystem.player.id;
            const currentCharge = this.combatSystem.player.fraymotifCharge || 0;
            if (this.gameState.characters[playerId]) {
                this.gameState.characters[playerId].fraymotifCharge = Math.min(1000, currentCharge);
                console.log(`[BattleOrchestrator] Saved fraymotif charge for ${playerId}: ${this.gameState.characters[playerId].fraymotifCharge}`);
            }
        }

        const summary = this.battleState.endBattle({ won: playerWon, escaped: resetOnly });

        console.log('[BattleOrchestrator] Emitting battleEnd event');
        this.emit('battleEnd', { won: playerWon, resetOnly, summary });
        this.isActive = false;

        if (this.callbacks) {
            if (playerWon) {
                this.callbacks.onVictory(summary);
            } else if (!resetOnly) {
                this.callbacks.onDefeat(summary);
            } else {
                this.callbacks.onEscape();
            }
        }
    }

    isInCombat() {
        return this.battleState.isInCombat();
    }

    getCurrentTurn() {
        return this.battleUI ? this.battleUI.currentPhase : null;
    }

    getPlayerHealth() {
        return this.combatSystem && this.combatSystem.player ? this.combatSystem.player.health : 0;
    }

    getEnemyHealth() {
        return this.combatSystem && this.combatSystem.enemy ? this.combatSystem.enemy.health : 0;
    }

    getCombatStats() {
        return {
            player: this.combatSystem ? this.combatSystem.player : null,
            enemy: this.combatSystem ? this.combatSystem.enemy : null
        };
    }

    getBattleSnapshot() {
        return this.battleState.getBattleSnapshot();
    }

    showMoveSelection() {
        if (this.battleUI) {
            this.battleUI.currentPhase = 'selecting';
            this.battleUI.render();
        }
    }

    updateHealthBars() {
        if (this.battleUI && this.combatSystem) {
            this.battleUI.updateCombatData({
                player: this.combatSystem.player,
                enemy: this.combatSystem.enemy
            });
        }
    }

    pause() {
        super.pause();
    }

    resume() {
        super.resume();
    }
}
