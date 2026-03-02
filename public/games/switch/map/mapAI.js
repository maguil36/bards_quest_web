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
            this.checkCollision = (x, y, w, h) => config.game.checkCollision(x, y, w, h);
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
                }
            } else if (agent.chasing) {
                const dx = this.player.x - agent.x;
                const dy = this.player.y - agent.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.tileSize * 1.5) {
                    agent.chasing = false;
                    this.startEncounterDialogue(agent);
                    return;
                }

                const moveX = dx / distance * agent.speed;
                const moveY = dy / distance * agent.speed;

                if (Math.abs(dx) > Math.abs(dy)) {
                    agent.direction = dx > 0 ? 'right' : 'left';
                } else {
                    agent.direction = dy > 0 ? 'down' : 'up';
                }

                const newX = agent.x + moveX;
                const newY = agent.y + moveY;

                if (!this.checkCollision(newX, newY, 32, 32)) {
                    agent.x = newX;
                    agent.y = newY;
                    isMoving = true;
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
        if (agent.patrolPath.length === 0) return false;
        if (agent.patrolPath.length === 1) {
            const [targetX, targetY] = agent.patrolPath[0];
            agent.x = targetX * this.tileSize;
            agent.y = targetY * this.tileSize;
            return false;
        }

        const currentTarget = agent.patrolPath[agent.patrolIndex];
        const targetX = currentTarget[0] * this.tileSize;
        const targetY = currentTarget[1] * this.tileSize;

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

            agent.x += moveX;
            agent.y += moveY;
            return true;
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
                        }
                        return;
                    }
                }
                break;
        }
    }
}
