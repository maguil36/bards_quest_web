import { BaseOrchestrator } from '../orchestration/BaseOrchestrator.js';

export class DialogueOrchestrator extends BaseOrchestrator {
    constructor(game) {
        super();
        this.game = game;
        this.dialogueManager = game.dialogueManager;
        this.dialogueBox = game.dialogueBox;
        this.dialogueText = game.dialogueText;

        if (typeof DialoguePortraitManager !== 'undefined') {
            this.portraitManager = new DialoguePortraitManager(game);
        } else {
            this.portraitManager = null;
        }
    }

    initialize() {
        super.initialize();
    }

    startDialogue(npcId) {
        console.log('[DialogueOrchestrator] startDialogue called:', { npcId });
        this.dialogueManager.delayTextCrawlStart = true;

        if (this.dialogueManager.startDialogue(npcId)) {
            this.isActive = true;

            console.log('[DialogueOrchestrator] Dialogue started, updating portraits');

            if (this.portraitManager) {
                this.portraitManager.setEncounterMode(false);
                const currentLine = this.dialogueManager.getCurrentLine();
                const currentCharacter = this.game.gameState.getCurrentCharacter();

                console.log('[DialogueOrchestrator] Calling updatePortraitsForLine:', {
                    currentLine,
                    currentCharacterId: currentCharacter.id,
                    npcId
                });

                this.portraitManager.updatePortraitsForLine(currentLine, currentCharacter.id, npcId);
            } else {
                console.log('[DialogueOrchestrator] No portrait manager available');
            }

            setTimeout(() => {
                console.log('[DialogueOrchestrator] Starting text crawl after 400ms delay');
                this.dialogueManager.delayTextCrawlStart = false;
                this.dialogueManager.startTextCrawl();
            }, 400);

            this.emit('dialogueStart', npcId);
            return true;
        }
        console.log('[DialogueOrchestrator] Failed to start dialogue');
        return false;
    }

    startEncounterDialogue(agent) {
        if (this.dialogueManager.startEncounterDialogue(agent.type || 'derseAgent')) {
            this.isActive = true;
            this.game.encounteringAgent = agent;
            this.game.isEncounterDialogue = true;

            if (this.portraitManager) {
                this.portraitManager.setEncounterMode(true);
            }

            if (this.dialogueBox) {
                this.dialogueBox.style.display = 'block';
            }
            this.game.showDialogueUI();
            this.emit('encounterDialogueStart', agent);
            return true;
        }
        return false;
    }

    showMinigameResultDialogue(npcId, success) {
        this.dialogueManager.delayTextCrawlStart = true;

        if (this.dialogueManager.showMinigameResultDialogue(npcId, success)) {
            this.isActive = true;

            if (this.portraitManager) {
                this.portraitManager.setEncounterMode(false);
                const currentLine = this.dialogueManager.getCurrentLine();
                const currentCharacter = this.game.gameState.getCurrentCharacter();
                this.portraitManager.updatePortraitsForLine(currentLine, currentCharacter.id, npcId);
            }

            setTimeout(() => {
                this.dialogueManager.delayTextCrawlStart = false;
                this.dialogueManager.startTextCrawl();
            }, 400);

            if (this.dialogueBox) {
                this.dialogueBox.style.display = 'block';
            }
            this.game.showDialogueUI();
            return true;
        }
        return false;
    }

    handleMiniGameComplete(success, targetNpcId) {
        this.dialogueManager.delayTextCrawlStart = true;

        if (this.dialogueManager.handleMiniGameComplete(success, targetNpcId)) {
            this.isActive = true;

            if (this.portraitManager) {
                this.portraitManager.setEncounterMode(false);
                const currentLine = this.dialogueManager.getCurrentLine();
                const currentCharacter = this.game.gameState.getCurrentCharacter();
                this.portraitManager.updatePortraitsForLine(currentLine, currentCharacter.id, targetNpcId);
            }

            setTimeout(() => {
                this.dialogueManager.delayTextCrawlStart = false;
                this.dialogueManager.startTextCrawl();
            }, 400);

            if (this.dialogueBox) {
                this.dialogueBox.style.display = 'block';
            }
            this.game.showDialogueUI();
            return true;
        }
        return false;
    }

    update(deltaTime = 16) {
        if (!this.isActive) return;

        // console.log('[DialogueOrchestrator] update called:', {
        //     deltaTime,
        //     isActive: this.isActive,
        //     dialogueManagerActive: this.dialogueManager?.isActive,
        //     showingMenu: this.dialogueManager?.showingMenu
        // });

        if (this.dialogueManager && this.dialogueManager.showingMenu) {
            this.game.showDialogueUI();
        } else if (this.dialogueManager && this.dialogueManager.isActive) {
            this.dialogueManager.updateTextCrawl(deltaTime);
            this.game.showDialogueUI();
        }
    }

    render(ctx) {
        if (!this.isActive) return;
    }

    advanceDialogue() {
        console.log('[DialogueOrchestrator] advanceDialogue called');
        const result = this.dialogueManager.nextLine();

        if (result && typeof result === 'object' && result.action === 'minigame') {
            this.endDialogue();
            this.emit('minigameRequested', result.target);
            return result;
        } else if (!result) {
            this.endDialogue();
            return null;
        }

        console.log('[DialogueOrchestrator] Line advanced, updating portraits');

        if (this.portraitManager && this.dialogueManager.isActive) {
            const currentLine = this.dialogueManager.getCurrentLine();
            const currentCharacter = this.game.gameState.getCurrentCharacter();
            const npcId = this.dialogueManager.currentNPC ? this.dialogueManager.currentNPC.id : null;

            console.log('[DialogueOrchestrator] Updating portraits after advance:', {
                currentLine,
                currentCharacterId: currentCharacter.id,
                npcId
            });

            this.portraitManager.updatePortraitsForLine(currentLine, currentCharacter.id, npcId);
        }

        return result;
    }

    endDialogue() {
        const npcId = this.currentNPC ? this.currentNPC.id : null;
        this.isActive = false;

        if (this.dialogueBox) {
            this.dialogueBox.style.display = 'none';
        }

        this.dialogueManager.cancelDialogue();

        if (this.portraitManager) {
            this.portraitManager.cleanup();
        }

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
        const wasShowingMenu = this.dialogueManager.showingMenu;
        const npcId = this.dialogueManager.currentNPC?.id;

        this.dialogueManager.confirmMenuSelection();

        if (wasShowingMenu && !this.dialogueManager.showingMenu) {
            if (this.dialogueManager.isActive) {
                console.log('[DialogueOrchestrator] Menu selection confirmed, setting up portraits');
                this.dialogueManager.delayTextCrawlStart = true;

                if (this.portraitManager) {
                    this.portraitManager.setEncounterMode(false);
                    const currentLine = this.dialogueManager.getCurrentLine();
                    const currentCharacter = this.game.gameState.getCurrentCharacter();

                    console.log('[DialogueOrchestrator] Setting up portraits for first dialogue line:', {
                        currentLine,
                        currentCharacterId: currentCharacter.id,
                        npcId
                    });

                    this.portraitManager.updatePortraitsForLine(currentLine, currentCharacter.id, npcId);
                }

                setTimeout(() => {
                    console.log('[DialogueOrchestrator] Starting text crawl after 400ms delay');
                    this.dialogueManager.delayTextCrawlStart = false;
                    this.dialogueManager.startTextCrawl();
                }, 400);
            } else {
                const interactionMenu = document.getElementById('interactionMenu');
                if (interactionMenu) {
                    interactionMenu.style.display = 'none';
                }
                this.game.closeDialogue();
            }
        }
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

    showInteractionMenuMode(npcId) {
        if (this.dialogueManager.showInteractionMenu(npcId)) {
            this.isActive = true;
            this.game.showingDialogue = true;
            if (this.dialogueBox) {
                this.dialogueBox.style.display = 'block';
            }
            this.game.showDialogueUI();
            return true;
        }
        return false;
    }

    pause() {
        super.pause();
    }

    resume() {
        super.resume();
    }
}
