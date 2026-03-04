import { BaseOrchestrator } from '../orchestration/BaseOrchestrator.js';

export class MapOrchestrator extends BaseOrchestrator {
    constructor(game) {
        super();
        this.game = game;
        this.mapInteractions = game.mapInteractions;
        this.mapAI = game.mapAI;
        this.mapQuests = game.mapQuests;
    }

    initialize() {
        super.initialize();
    }

    update(deltaTime) {
        if (!this.isActive) return;

        this.updatePlayerMovement();
        this.updateCamera();
        this.updateAnimations();
        this.updateAgents();
        this.checkForInteractions();
        this.checkForItemPickups();
        this.updateFloatingTexts();
        this.updateUI();
        this.updateUI();
    }

    updatePlayerMovement() {
        this.mapInteractions.updatePlayerMovement();
    }

    updateCamera() {
        this.mapInteractions.updateCamera();
    }

    updateAnimations() {
        const player = this.game.player;
        const currentChar = this.game.gameState.getCurrentCharacter();
        const isAustine = currentChar && currentChar.id === 'austine';
        const animationSpeed = isAustine ? 12.5 : 10;

        if (player.isMoving) {
            player.animationTimer++;
            if (player.animationTimer > animationSpeed) {
                player.animationFrame = (player.animationFrame + 1) % 4;
                player.animationTimer = 0;
            }
        } else {
            player.animationFrame = 0;
        }

        this.updateNPCAnimations();
    }

    updateNPCAnimations() {
        for (const npc of this.game.npcs) {
            if (!npc.animationTimer) npc.animationTimer = 0;
            npc.animationTimer++;
            if (npc.animationTimer > 30) {
                npc.animationFrame = (npc.animationFrame + 1) % 2;
                npc.animationTimer = 0;
            }
        }
    }

    updateAgents() {
        this.mapAI.updateAgents();
    }

    checkForInteractions() {
        this.mapInteractions.checkForInteractions();
    }

    checkForItemPickups() {
        this.mapInteractions.checkForItemPickups();
    }

    updateFloatingTexts() {
        if (!this.game.floatingTexts) return;

        this.game.floatingTexts = this.game.floatingTexts.filter(text => {
            text.y -= 1;
            text.alpha -= 0.016;
            text.lifetime--;
            return text.lifetime > 0 && text.alpha > 0;
        });
    }

    updateUI() {
        if (this.game.updateInventoryUI) {
            this.game.updateInventoryUI();
        }
        if (this.game.updateQuestUI) {
            this.game.updateQuestUI();
        }
    }

    handlePlayerInteraction() {
        const npcInteracted = this.tryInteract();
        if (!npcInteracted) {
            this.tryInteractWithObjects();
        }
        return npcInteracted;
    }

    tryInteract() {
        const result = this.mapInteractions.tryInteract();
        if (result) {
            this.emit('dialogueRequested', result);
        }
        return result;
    }

    tryInteractWithObjects() {
        this.mapInteractions.tryInteractWithObjects();
    }

    movePlayer(direction) {
        const player = this.game.player;
        player.direction = direction;
    }

    teleportPlayer(x, y) {
        this.game.player.x = x;
        this.game.player.y = y;
    }

    getPlayerPosition() {
        return {
            x: this.game.player.x,
            y: this.game.player.y
        };
    }

    isPlayerNearNPC(npcId) {
        return this.mapInteractions.isPlayerNearNPC(npcId);
    }

    canPlayerMove() {
        return !this.game.playerFrozen && !this.game.inCombat && !this.game.showingDialogue;
    }

    getVisibleNPCs() {
        return this.game.npcs.filter(npc => {
            const dx = npc.position.x - this.game.player.x;
            const dy = npc.position.y - this.game.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < 500;
        });
    }

    onCombatTriggered(agent) {
        this.emit('combatTriggered', agent);
    }

    onQuestCompleted(questId) {
        this.emit('questCompleted', questId);
    }

    onPlayerMoved(position) {
        this.emit('playerMoved', position);
    }

    render(ctx, camera) {
    }

    pause() {
        super.pause();
    }

    resume() {
        super.resume();
    }
}
