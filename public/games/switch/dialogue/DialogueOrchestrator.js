import { BaseOrchestrator } from '../orchestration/BaseOrchestrator.js';

export class DialogueOrchestrator extends BaseOrchestrator {
    constructor(game) {
        super();
        this.game = game;
        this.dialogueManager = game.dialogueManager;
        this.dialogueBox = game.dialogueBox;
        this.dialogueText = game.dialogueText;
    }

    initialize() {
        super.initialize();
    }

    startDialogue(npcId) {
        if (this.dialogueManager.startDialogue(npcId)) {
            this.isActive = true;
            this.emit('dialogueStart', npcId);
            return true;
        }
        return false;
    }

    update() {
        if (!this.isActive) return;
    }

    render(ctx) {
        if (!this.isActive) return;
    }

    advanceDialogue() {
        const result = this.dialogueManager.nextLine();
        
        if (result && typeof result === 'object' && result.action === 'minigame') {
            this.endDialogue();
            this.emit('minigameRequested', result.target);
            return result;
        } else if (!result) {
            this.endDialogue();
            return null;
        }
        
        return result;
    }

    endDialogue() {
        const npcId = this.currentNPC ? this.currentNPC.id : null;
        this.isActive = false;
        this.emit('dialogueEnd', npcId);
    }

    selectMenuOption(optionId) {
        this.dialogueManager.selectMenuOption(optionId);
    }

    navigateMenu(direction) {
        if (direction === 'up') {
            this.dialogueManager.navigateMenuUp();
        } else if (direction === 'down') {
            this.dialogueManager.navigateMenuDown();
        }
    }

    confirmMenuSelection() {
        this.dialogueManager.confirmMenuSelection();
    }

    isDialogueActive() {
        return this.isActive && this.dialogueManager.isActive;
    }

    isShowingMenu() {
        return this.dialogueManager.showingMenu;
    }

    getCurrentNPC() {
        return this.dialogueManager.currentNPC;
    }

    getCurrentLine() {
        return this.dialogueManager.getCurrentLine();
    }

    hasCompletedDialogue(charId, npcId) {
        return this.game.gameState.hasCompletedDialogue(charId, npcId);
    }

    getNearbyNPCs(position) {
        return this.game.npcs.filter(npc => {
            const dx = npc.position.x - position.x;
            const dy = npc.position.y - position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < 100;
        });
    }

    canInteractWithNPC(npcId) {
        const npc = this.game.npcs.find(n => n.id === npcId);
        if (!npc) return false;
        
        const player = this.game.player;
        const dx = npc.position.x - player.x;
        const dy = npc.position.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < 100;
    }

    showInteractionMenu(npcId) {
        return this.dialogueManager.showInteractionMenu(npcId);
    }

    pause() {
        super.pause();
    }

    resume() {
        super.resume();
    }
}
