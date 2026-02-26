import { BattleAI } from './battleAI.js';

export class BattleController {
    constructor(config) {
        if (config.game) {
            this.game = config.game;
            this.gameState = config.game.gameState;
            this.battleUI = config.game.battleUI;
            this.combatSystem = config.game.combatSystem;
            this.player = config.game.player;
            this.spawnPosition = {
                x: config.game.playerStartX,
                y: config.game.playerStartY
            };
            this.getInCombat = () => config.game.inCombat;
            this.setInCombat = (value) => { config.game.inCombat = value; };
            this.getCurrentAgent = () => config.game.currentAgentInCombat;
            this.setCurrentAgent = (agent) => { config.game.currentAgentInCombat = agent; };
            this.updateQuestUI = () => config.game.updateQuestUI?.();
            this.showFloatingText = (x, y, text, color) => config.game.showFloatingText?.(x, y, text, color);
        } else {
            this.gameState = config.gameState;
            this.battleUI = config.battleUI;
            this.combatSystem = config.combatSystem;
            this.player = config.player;
            this.spawnPosition = config.spawnPosition || { x: 0, y: 0 };
            this.getInCombat = config.getInCombat || (() => false);
            this.setInCombat = config.setInCombat || (() => {});
            this.getCurrentAgent = config.getCurrentAgent || (() => null);
            this.setCurrentAgent = config.setCurrentAgent || (() => {});
            this.updateQuestUI = config.callbacks?.updateQuestUI || (() => {});
            this.showFloatingText = config.callbacks?.showFloatingText || (() => {});
        }

        this.battleAI = new BattleAI();
    }

    startAgentCombat(agent, playerData = null, enemyData = null) {
        this.setInCombat(true);
        this.setCurrentAgent(agent);

        this.battleUI.showStrifeTitle(() => {
            const currentChar = playerData || this.gameState.getCurrentCharacter();

            const enemy = enemyData || {
                id: 'derseAgent',
                name: 'Derse Agent',
                health: 75,
                maxHealth: 75,
                attack: 60,
                defense: 50
            };

            const combatData = this.combatSystem.startCombat(enemy, currentChar);

            this.battleUI.combatData = combatData;
            this.battleUI.show(combatData);

            this.battleUI.onMoveSelected = (moveIndex) => {
                this.useCombatMove(moveIndex);
            };

            this.battleUI.onStrifeAction = (action) => {
                this.useStrifeAction(action);
            };

            this.battleUI.onAbscond = () => {
                const currentChar = this.gameState.getCurrentCharacter();

                if (currentChar.id === 'tyson') {
                    this.battleUI.commandPrompt = '==> Tyson uses his TIME powers to RESET!';
                    this.battleUI.render();

                    setTimeout(() => {
                        agent.x = agent.spawnX;
                        agent.y = agent.spawnY;
                        agent.chasing = false;

                        this.player.x = this.spawnPosition.x;
                        this.player.y = this.spawnPosition.y;

                        this.endCombat(false, true);
                    }, 1500);
                } else {
                    this.battleUI.commandPrompt = '==> Could not escape! You take damage!';
                    this.battleUI.currentPhase = 'animating';
                    this.battleUI.render();

                    setTimeout(() => {
                        const result = this.combatSystem.enemyAttack();
                        if (result && result.messages) {
                            result.messages.forEach(msg => this.battleUI.addLogMessage(msg));
                        }

                        this.battleUI.playDamageAnimation(true);

                        this.battleUI.updateCombatData({
                            player: this.combatSystem.player,
                            enemy: this.combatSystem.enemy
                        });

                        if (!this.combatSystem.inCombat && result && result.type === 'combatEnd') {
                            setTimeout(() => this.endCombat(result.won), 1500);
                        } else {
                            this.battleUI.currentPhase = 'selecting';
                            this.battleUI.commandPrompt = '==> What will you do?';
                            this.battleUI.render();
                        }
                    }, 1500);
                }
            };
        });
    }

    getStatAbbreviation(stat) {
        const abbreviations = {
            'attack': 'ATK',
            'defense': 'DEF',
            'spAttack': 'SP ATK',
            'spDefense': 'SP DEF',
            'speed': 'SPD'
        };
        return abbreviations[stat] || stat.toUpperCase();
    }

    getMoveEffectLabel(move) {
        if (!move.effect) return null;

        if (move.effect.type === 'defenseBoost') {
            return 'DEF Boost';
        } else if (move.effect.type === 'heal') {
            return `Heal ${move.effect.percent}%`;
        } else if (move.effect.type === 'delayed') {
            return 'Delayed ATK';
        } else if (move.effect.type === 'selfKO') {
            return 'Self KO';
        } else if (move.effect.type === 'statChange' && move.effect.stats) {
            const statDesc = Object.entries(move.effect.stats).map(([stat, change]) => {
                return `${this.getStatAbbreviation(stat)} ${change > 0 ? '+' : ''}${change}`;
            }).join(', ');
            return statDesc;
        }

        return null;
    }

    useCombatMove(moveIndex) {
        this.battleUI.currentPhase = 'animating';
        this.battleUI.render();

        const player = this.combatSystem.player;
        const enemy = this.combatSystem.enemy;
        const playerMove = player.moves[moveIndex];

        setTimeout(() => {
            const playerName = player.name || player.id;
            this.battleUI.commandPrompt = `==> ${playerName} used ${playerMove.name}!`;
            this.battleUI.render();

            this.battleUI.playAttackAnimation(true, () => {
                const result = this.combatSystem.executeMove(player, enemy, moveIndex);

                if (result.success) {
                    if (result.multiHitData && result.multiHitData.length > 0) {
                        const initialMessage = `${playerName} used ${playerMove.name}!`;
                        this.battleUI.addLogMessage(initialMessage, '#0f0');

                        this.battleUI.waitForInput(() => {
                            this.battleUI.showMultiHitMessages(playerName, playerMove.name, result.multiHitData, () => {
                                if (enemy.hp <= 0) {
                                    this.combatSystem.inCombat = false;
                                    setTimeout(() => {
                                        this.battleUI.playVictoryAnimation(() => {
                                            this.endCombat(true);
                                        });
                                    }, 1000);
                                    return;
                                }

                                this.executeEnemyTurn();
                            });
                        }, 5000);
                        return;
                    }

                    let message = '';
                    let color = '#0f0';

                    if (result.hits) {
                        message = `${playerName} aggrieved with ${playerMove.name} and hit ${result.hits} time(s) for ${result.damage} damage`;
                    } else if (result.damage > 0) {
                        message = `${playerName} aggrieved with ${playerMove.name} for ${result.damage} damage`;
                    } else if (result.statChanges) {
                        const statDesc = Object.entries(result.statChanges).map(([stat, change]) => {
                            return `${this.getStatAbbreviation(stat)} ${change > 0 ? '+' : ''}${change}`;
                        }).join(', ');
                        message = `${playerName} used ${playerMove.name}! ${statDesc}`;
                        color = result.statTarget === 'self' ? 'rgb(0, 255, 0)' : 'rgb(255, 255, 0)';
                    } else if (result.healAmount) {
                        message = `${playerName} used ${playerMove.name} and restored ${result.healAmount} HP`;
                        color = 'rgb(0, 255, 0)';
                    } else if (playerMove.effect && playerMove.effect.type === 'defenseBoost') {
                        message = `${playerName} used ${playerMove.name}! DEF Boost`;
                        color = 'rgb(0, 255, 0)';
                    } else if (result.messages && result.messages.some(msg => msg.includes('missed'))) {
                        message = `${playerName} aggrieved with ${playerMove.name} but missed!`;
                    } else {
                        message = `${playerName} used ${playerMove.name}!`;
                    }

                    this.battleUI.addLogMessage(message, color);
                }

                this.battleUI.updateCombatData({
                    player: this.combatSystem.player,
                    enemy: this.combatSystem.enemy
                });

                if (enemy.hp <= 0) {
                    this.combatSystem.inCombat = false;
                    setTimeout(() => {
                        this.battleUI.playVictoryAnimation(() => {
                            this.endCombat(true);
                        });
                    }, 1000);
                    return;
                }

                this.battleUI.waitForInput(() => {
                    this.executeEnemyTurn();
                });
            });
        }, 300);
    }

    useStrifeAction(action) {
        this.battleUI.currentPhase = 'animating';
        this.battleUI.commandPrompt = '==> Engaging in STRIFE...';
        this.battleUI.render();

        const player = this.combatSystem.player;
        const enemy = this.combatSystem.enemy;

        setTimeout(() => {
            const playerName = player.name || player.id;
            const actionNames = {
                'aggrieve': 'AGGRIEVE',
                'assault': 'ASSAULT',
                'avenge': 'AVENGE',
                'assail': 'ASSAIL',
                'abjure': 'ABJURE',
                'apparate': 'APPARATE'
            };
            const actionName = actionNames[action] || action.toUpperCase();

            this.battleUI.commandPrompt = `==> ${playerName} used ${actionName}!`;
            this.battleUI.render();

            this.battleUI.playAttackAnimation(true, () => {
                const result = this.combatSystem.executeStrifeOption(action);

                if (result.success) {
                    if (result.multiHitData && result.multiHitData.length > 0) {
                        const initialMessage = `${playerName} used ${actionName}!`;
                        this.battleUI.addLogMessage(initialMessage, '#0f0');

                        this.battleUI.waitForInput(() => {
                            this.battleUI.showMultiHitMessages(playerName, actionName, result.multiHitData, () => {
                                if (enemy.hp <= 0) {
                                    this.combatSystem.inCombat = false;
                                    setTimeout(() => {
                                        this.battleUI.playVictoryAnimation(() => {
                                            this.endCombat(true);
                                        });
                                    }, 1000);
                                    return;
                                }

                                this.executeEnemyTurn();
                            });
                        }, 5000);
                        return;
                    }

                    let message = result.damage > 0
                        ? `${playerName} used ${actionName} for ${result.damage} damage`
                        : `${playerName} used ${actionName}!`;

                    this.battleUI.addLogMessage(message, '#0f0');
                }

                this.battleUI.updateCombatData({
                    player: this.combatSystem.player,
                    enemy: this.combatSystem.enemy
                });

                if (enemy.hp <= 0) {
                    this.combatSystem.inCombat = false;
                    setTimeout(() => {
                        this.battleUI.playVictoryAnimation(() => {
                            this.endCombat(true);
                        });
                    }, 1000);
                    return;
                }

                this.battleUI.waitForInput(() => {
                    this.executeEnemyTurn();
                });
            });
        }, 200);
    }

    executeEnemyTurn() {
        const enemy = this.combatSystem.enemy;
        const player = this.combatSystem.player;
        const enemyMoveIndex = this.battleAI.selectEnemyMove(enemy);
        const enemyMove = enemy.moves[enemyMoveIndex];
        const enemyName = enemy.name;

        this.battleUI.commandPrompt = `==> ${enemyName} used ${enemyMove.name}!`;
        this.battleUI.render();

        this.battleUI.playAttackAnimation(false, () => {
            const enemyResult = this.combatSystem.executeMove(enemy, player, enemyMoveIndex);

            if (enemyResult.success) {
                if (enemyResult.multiHitData && enemyResult.multiHitData.length > 0) {
                    const initialMessage = `${enemyName} used ${enemyMove.name}!`;
                    this.battleUI.addLogMessage(initialMessage, '#0f0');

                    this.battleUI.waitForInput(() => {
                        this.battleUI.showMultiHitMessages(enemyName, enemyMove.name, enemyResult.multiHitData, () => {
                            this.battleUI.updateCombatData({
                                player: this.combatSystem.player,
                                enemy: this.combatSystem.enemy
                            });

                            if (player.hp <= 0) {
                                this.combatSystem.inCombat = false;
                                setTimeout(() => this.endCombat(false), 1500);
                                return;
                            }

                            this.battleUI.currentPhase = 'selecting';
                            this.battleUI.commandPrompt = '==> What will you do?';
                            this.battleUI.render();
                        });
                    }, 5000);
                    return;
                }

                let message = '';
                let color = '#0f0';

                if (enemyResult.hits) {
                    message = `${enemyName} aggrieved with ${enemyMove.name} and hit ${enemyResult.hits} time(s) for ${enemyResult.damage} damage`;
                } else if (enemyResult.damage > 0) {
                    message = `${enemyName} aggrieved with ${enemyMove.name} for ${enemyResult.damage} damage`;
                } else if (enemyResult.statChanges) {
                    const statDesc = Object.entries(enemyResult.statChanges).map(([stat, change]) => {
                        return `${this.getStatAbbreviation(stat)} ${change > 0 ? '+' : ''}${change}`;
                    }).join(', ');
                    message = `${enemyName} used ${enemyMove.name}! ${statDesc}`;
                    color = enemyResult.statTarget === 'self' ? 'rgb(255, 255, 0)' : 'rgb(0, 255, 0)';
                } else if (enemyResult.healAmount) {
                    message = `${enemyName} used ${enemyMove.name} and restored ${enemyResult.healAmount} HP`;
                    color = 'rgb(255, 255, 0)';
                } else if (enemyMove.effect && enemyMove.effect.type === 'defenseBoost') {
                    message = `${enemyName} used ${enemyMove.name}! DEF Boost`;
                    color = 'rgb(255, 255, 0)';
                } else if (enemyResult.messages && enemyResult.messages.some(msg => msg.includes('missed'))) {
                    message = `${enemyName} aggrieved with ${enemyMove.name} but missed!`;
                } else {
                    message = `${enemyName} used ${enemyMove.name}!`;
                }

                this.battleUI.addLogMessage(message, color);
            }

            this.battleUI.updateCombatData({
                player: this.combatSystem.player,
                enemy: this.combatSystem.enemy
            });

            if (player.hp <= 0) {
                this.combatSystem.inCombat = false;
                setTimeout(() => this.endCombat(false), 1500);
                return;
            }

            this.battleUI.waitForInput(() => {
                this.battleUI.currentPhase = 'selecting';
                this.battleUI.commandPrompt = '==> What will you do?';
                this.battleUI.render();
            });
        });
    }

    endCombat(playerWon, resetOnly = false) {
        console.log('[BattleController] endCombat called:', { playerWon, resetOnly });
        this.setInCombat(false);

        this.battleUI.hide();

        const logEl = document.getElementById('combatLog');
        if (logEl) logEl.innerHTML = '';

        if (playerWon) {
            const currentAgent = this.getCurrentAgent();
            if (currentAgent) {
                currentAgent.defeated = true;
                this.gameState.defeatAgent(currentAgent.spawnX, currentAgent.spawnY);
                this.setCurrentAgent(null);
            }
            this.updateQuestUI();
        } else if (!resetOnly) {
            this.showFloatingText(this.player.x, this.player.y - 40, 'You have been defeated!', '#ff0000');
            setTimeout(() => {
                if (this.gameState && typeof this.gameState.reset === 'function') {
                    this.gameState.reset();
                }
                localStorage.removeItem('switchAudioSettings');
                localStorage.removeItem('switchGameState');
                window.location.reload();
            }, 2000);
        }

        console.log('[BattleController] Checking for orchestrator:', {
            hasGame: !!this.game,
            hasGameOrchestrator: !!this.game?.gameOrchestrator,
            hasBattleOrchestrator: !!this.game?.gameOrchestrator?.battleOrchestrator
        });

        if (this.game?.gameOrchestrator?.battleOrchestrator) {
            console.log('[BattleController] Calling battleOrchestrator.endBattle');
            this.game.gameOrchestrator.battleOrchestrator.endBattle(playerWon, resetOnly);
        } else if (this.onBattleEnd) {
            console.log('[BattleController] Calling onBattleEnd callback');
            this.onBattleEnd(playerWon, resetOnly);
        } else {
            console.error('[BattleController] NO WAY TO END BATTLE!');
        }
    }
}
