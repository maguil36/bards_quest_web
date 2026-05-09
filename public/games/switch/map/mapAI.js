export class MapAI {
    constructor(config) {
        if (config.game) {
            this.game = config.game;
            this.player = config.game.player;
            this.agents = config.game.agents;
            this.tileSize = config.game.tileSize;
            this.getInCombat = () => config.game.inCombat;
            this.setPlayerFrozen = (value) => { config.game.playerFrozen = value; };
            this.startAgentCombat = (agent) => config.game.startAgentCombat(agent);
            this.checkCollision = (x, y, w, h, excludeAgent) => config.game.checkCollision(x, y, w, h, excludeAgent);
            this.playEncounterMusic = (enemyType) => {
                if (config.game.audioManager && typeof config.game.audioManager.playEncounterMusic === 'function') {
                    config.game.audioManager.playEncounterMusic(enemyType);
                }
            };
            this.startEncounterDialogue = (agent) => {
                if (config.game.startEncounterDialogue) {
                    config.game.startEncounterDialogue(agent);
                }
            };
        } else {
            this.player = config.player;
            this.agents = config.agents;
            this.tileSize = config.tileSize;
            this.getInCombat = config.getInCombat || (() => false);
            this.setPlayerFrozen = config.setPlayerFrozen || (() => {});
            this.startAgentCombat = config.callbacks?.startAgentCombat || (() => {});
            this.checkCollision = config.callbacks?.checkCollision || (() => false);
            this.playEncounterMusic = config.callbacks?.playEncounterMusic || (() => {});
            this.startEncounterDialogue = config.callbacks?.startEncounterDialogue || (() => {});
        }
    }

    updateAgents() {
        if (this.getInCombat()) return;

        for (const agent of this.agents) {
            if (agent.defeated) continue;

            let isMoving = false;

            if (agent.alerted && !agent.chasing) {
                const alertDuration = Date.now() - agent.alertTime;
                if (alertDuration >= 1000) {
                    agent.chasing = true;
                    agent.alerted = false;
                    this._persistAgentState(agent);
                }
            } else if (agent.chasing) {
                const dx = this.player.x - agent.x;
                const dy = this.player.y - agent.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                const minStoppingDistance = this.tileSize * 0.8;

                if (distance > minStoppingDistance) {
                    const chaseSpeed = agent.speed;
                    const moveX = dx / distance * chaseSpeed;
                    const moveY = dy / distance * chaseSpeed;

                    if (Math.abs(dx) > Math.abs(dy)) {
                        agent.direction = dx > 0 ? 'right' : 'left';
                    } else {
                        agent.direction = dy > 0 ? 'down' : 'up';
                    }

                    const newX = agent.x + moveX;
                    const newY = agent.y + moveY;

                    if (!this.checkCollision(newX, newY, this.tileSize, this.tileSize, agent)) {
                        agent.x = newX;
                        agent.y = newY;
                        isMoving = true;
                    } else {
                        const tryX = agent.x + moveX;
                        const tryY = agent.y;
                        if (!this.checkCollision(tryX, tryY, this.tileSize, this.tileSize, agent)) {
                            agent.x = tryX;
                            agent.y = tryY;
                            isMoving = true;
                        } else {
                            const tryX2 = agent.x;
                            const tryY2 = agent.y + moveY;
                            if (!this.checkCollision(tryX2, tryY2, this.tileSize, this.tileSize, agent)) {
                                agent.x = tryX2;
                                agent.y = tryY2;
                                isMoving = true;
                            }
                        }
                    }
                }

                if (distance < this.tileSize * 1.5 && !agent.encounterStarted) {
                    agent.encounterStarted = true;
                    this.startEncounterDialogue(agent);
                }
            } else {
                const wasMoving = this.updateAgentPatrol(agent);
                if (wasMoving) isMoving = true;
                this.checkAgentDetection(agent);
            }

            if (isMoving) {
                agent.animationTimer = (agent.animationTimer || 0) + 1;
                if (agent.animationTimer > 10) {
                    agent.animationFrame = ((agent.animationFrame || 0) + 1) % 4;
                    agent.animationTimer = 0;
                }
            } else {
                agent.animationFrame = 0;
            }
        }
    }

    updateAgentPatrol(agent) {
        if (!agent.patrolPath || agent.patrolPath.length === 0) {
            return false;
        }

        if (agent.patrolPath.length === 1) {
            return false;
        }

        if (!agent.patrolIndex && agent.patrolIndex !== 0) agent.patrolIndex = 0;

        const target = agent.patrolPath[agent.patrolIndex];
        if (!target) {
            return false;
        }

        const targetX = target[0] * this.tileSize;
        const targetY = target[1] * this.tileSize;

        const dx = targetX - agent.x;
        const dy = targetY - agent.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < agent.speed * 2) {
            if (agent.patrolReverse) {
                agent.patrolIndex--;
                if (agent.patrolIndex < 0) {
                    agent.patrolIndex = 1;
                    agent.patrolReverse = false;
                }
            } else {
                agent.patrolIndex++;
                if (agent.patrolIndex >= agent.patrolPath.length) {
                    agent.patrolIndex = agent.patrolPath.length - 2;
                    agent.patrolReverse = true;
                }
            }
            return false;
        } else {
            const moveX = dx / distance * agent.speed;
            const moveY = dy / distance * agent.speed;

            if (Math.abs(dx) > Math.abs(dy)) {
                agent.direction = dx > 0 ? 'right' : 'left';
            } else {
                agent.direction = dy > 0 ? 'down' : 'up';
            }

            const newX = agent.x + moveX;
            const newY = agent.y + moveY;

            const collisionResult = this.checkCollision(newX, newY, this.tileSize, this.tileSize, agent);

            if (!collisionResult) {
                agent.x = newX;
                agent.y = newY;
                agent.stuckCounter = 0;
                return true;
            } else {
                const tryX = agent.x + moveX;
                const tryY = agent.y;
                const tryXCollision = this.checkCollision(tryX, tryY, this.tileSize, this.tileSize, agent);

                if (!tryXCollision) {
                    agent.x = tryX;
                    agent.y = tryY;
                    agent.stuckCounter = 0;
                    return true;
                } else {
                    const tryX2 = agent.x;
                    const tryY2 = agent.y + moveY;
                    const tryY2Collision = this.checkCollision(tryX2, tryY2, this.tileSize, this.tileSize, agent);

                    if (!tryY2Collision) {
                        agent.x = tryX2;
                        agent.y = tryY2;
                        agent.stuckCounter = 0;
                        return true;
                    } else {
                        agent.stuckCounter = (agent.stuckCounter || 0) + 1;
                        if (agent.stuckCounter > 60) {
                            if (agent.patrolReverse) {
                                agent.patrolIndex--;
                                if (agent.patrolIndex < 0) {
                                    agent.patrolIndex = 1;
                                    agent.patrolReverse = false;
                                }
                            } else {
                                agent.patrolIndex++;
                                if (agent.patrolIndex >= agent.patrolPath.length) {
                                    agent.patrolIndex = agent.patrolPath.length - 2;
                                    agent.patrolReverse = true;
                                }
                            }
                            agent.stuckCounter = 0;
                        }
                        return false;
                    }
                }
            }
        }
    }

    checkAgentDetection(agent) {
        const detectionDistance = agent.detectionRange * this.tileSize;
        let checkX = agent.x;
        let checkY = agent.y;

        switch (agent.direction) {
            case 'up':
                for (let i = 1; i <= agent.detectionRange; i++) {
                    checkY = agent.y - i * this.tileSize;
                    if (Math.abs(this.player.x - agent.x) < this.tileSize / 2 &&
                        Math.abs(this.player.y - checkY) < this.tileSize / 2) {
                        if (!agent.alerted && !agent.chasing) {
                            agent.alerted = true;
                            agent.alertTime = Date.now();
                            this.setPlayerFrozen(true);
                            this.playEncounterMusic(agent.type || 'derseAgent');
                            this._persistAgentState(agent);
                        }
                        return;
                    }
                }
                break;
            case 'down':
                for (let i = 1; i <= agent.detectionRange; i++) {
                    checkY = agent.y + i * this.tileSize;
                    if (Math.abs(this.player.x - agent.x) < this.tileSize / 2 &&
                        Math.abs(this.player.y - checkY) < this.tileSize / 2) {
                        if (!agent.alerted && !agent.chasing) {
                            agent.alerted = true;
                            agent.alertTime = Date.now();
                            this.setPlayerFrozen(true);
                            this.playEncounterMusic(agent.type || 'derseAgent');
                            this._persistAgentState(agent);
                        }
                        return;
                    }
                }
                break;
            case 'left':
                for (let i = 1; i <= agent.detectionRange; i++) {
                    checkX = agent.x - i * this.tileSize;
                    if (Math.abs(this.player.x - checkX) < this.tileSize / 2 &&
                        Math.abs(this.player.y - agent.y) < this.tileSize / 2) {
                        if (!agent.alerted && !agent.chasing) {
                            agent.alerted = true;
                            agent.alertTime = Date.now();
                            this.setPlayerFrozen(true);
                            this.playEncounterMusic(agent.type || 'derseAgent');
                            this._persistAgentState(agent);
                        }
                        return;
                    }
                }
                break;
            case 'right':
                for (let i = 1; i <= agent.detectionRange; i++) {
                    checkX = agent.x + i * this.tileSize;
                    if (Math.abs(this.player.x - checkX) < this.tileSize / 2 &&
                        Math.abs(this.player.y - agent.y) < this.tileSize / 2) {
                        if (!agent.alerted && !agent.chasing) {
                            agent.alerted = true;
                            agent.alertTime = Date.now();
                            this.setPlayerFrozen(true);
                            this.playEncounterMusic(agent.type || 'derseAgent');
                            this._persistAgentState(agent);
                        }
                        return;
                    }
                }
                break;
        }
    }

    _agentKey(agent) {
        return `${agent.spawnX}_${agent.spawnY}`;
    }

    _persistAgentState(agent) {
        if (!this.game || !this.game.gameState) return;
        const gs = this.game.gameState;
        const key = this._agentKey(agent);

        gs.alertedAgents = gs.alertedAgents || [];
        gs.chasingAgents = gs.chasingAgents || [];

        if (agent.alerted) {
            if (!gs.alertedAgents.includes(key)) gs.alertedAgents.push(key);
            gs.chasingAgents = gs.chasingAgents.filter(k => k !== key);
        } else if (agent.chasing) {
            if (!gs.chasingAgents.includes(key)) gs.chasingAgents.push(key);
            gs.alertedAgents = gs.alertedAgents.filter(k => k !== key);
        } else {
            gs.alertedAgents = gs.alertedAgents.filter(k => k !== key);
            gs.chasingAgents = gs.chasingAgents.filter(k => k !== key);
        }

        gs.save();
    }
}
