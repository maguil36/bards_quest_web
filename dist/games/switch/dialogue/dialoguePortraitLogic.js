class DialoguePortraitManager {
    constructor(game) {
        this.game = game;
        this.playerPortraitContainer = null;
        this.npcPortraitContainer = null;
        this.playerImage = null;
        this.npcImage = null;
        this.currentPlayerCharacter = null;
        this.currentNPCCharacter = null;
        this.animationInterval = null;
        this.isPlayerVisible = false;
        this.isNPCVisible = false;
        this.isEncounterDialogue = false;
        
        this.initializePortraitContainers();
    }

    initializePortraitContainers() {
        this.playerPortraitContainer = document.createElement('div');
        this.playerPortraitContainer.id = 'player-portrait-container';
        this.playerPortraitContainer.style.cssText = `
            position: fixed;
            right: -100vh;
            top: 10vh;
            bottom: 0;
            width: 40vh;
            height: 80vh;
            transition: right 0.4s ease-in-out;
            z-index: 999;
            pointer-events: none;
        `;

        this.playerImage = document.createElement('img');
        this.playerImage.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
        `;
        this.playerPortraitContainer.appendChild(this.playerImage);

        this.npcPortraitContainer = document.createElement('div');
        this.npcPortraitContainer.id = 'npc-portrait-container';
        this.npcPortraitContainer.style.cssText = `
            position: fixed;
            left: -100vh;
            top: 10vh;
            bottom: 0;
            width: 40vh;
            height: 80vh;
            transition: left 0.4s ease-in-out;
            z-index: 999;
            pointer-events: none;
        `;

        this.npcImage = document.createElement('img');
        this.npcImage.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            transform: scaleX(-1);
        `;
        this.npcPortraitContainer.appendChild(this.npcImage);

        document.body.appendChild(this.playerPortraitContainer);
        document.body.appendChild(this.npcPortraitContainer);
    }

    setEncounterMode(isEncounter) {
        this.isEncounterDialogue = isEncounter;
        if (isEncounter) {
            this.hideAllPortraits();
        }
    }

    showPlayerPortrait(characterId, imageName, image2Name = null, duration = 250) {
        if (this.isEncounterDialogue) return;

        console.log('[PortraitManager] showPlayerPortrait:', {
            characterId,
            imageName,
            image2Name,
            duration,
            containerStyleBefore: this.playerPortraitContainer.style.right
        });

        this.currentPlayerCharacter = characterId;

        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }

        const basePath = `/games/switch/images/characters/${characterId}/`;

        if (image2Name) {
            let toggle = false;
            const image1Path = basePath + imageName;
            const image2Path = basePath + image2Name;

            this.playerImage.src = image1Path;

            this.animationInterval = setInterval(() => {
                toggle = !toggle;
                this.playerImage.src = toggle ? image2Path : image1Path;
            }, duration);
        } else {
            this.playerImage.src = basePath + imageName;
        }

        this.playerPortraitContainer.style.right = '0';
        this.isPlayerVisible = true;

        console.log('[PortraitManager] Player portrait updated:', {
            imageSrc: this.playerImage.src,
            containerStyleAfter: this.playerPortraitContainer.style.right,
            isVisible: this.isPlayerVisible
        });
    }

    showNPCPortrait(characterId, imageName, image2Name = null, duration = 250) {
        if (this.isEncounterDialogue) return;

        console.log('[PortraitManager] showNPCPortrait:', {
            characterId,
            imageName,
            image2Name,
            duration,
            containerStyleBefore: this.npcPortraitContainer.style.left
        });

        this.currentNPCCharacter = characterId;

        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }

        const basePath = `/games/switch/images/characters/${characterId}/`;

        if (image2Name) {
            let toggle = false;
            const image1Path = basePath + imageName;
            const image2Path = basePath + image2Name;

            this.npcImage.src = image1Path;

            this.animationInterval = setInterval(() => {
                toggle = !toggle;
                this.npcImage.src = toggle ? image2Path : image1Path;
            }, duration);
        } else {
            this.npcImage.src = basePath + imageName;
        }

        this.npcPortraitContainer.style.left = '0';
        this.isNPCVisible = true;

        console.log('[PortraitManager] NPC portrait updated:', {
            imageSrc: this.npcImage.src,
            containerStyleAfter: this.npcPortraitContainer.style.left,
            isVisible: this.isNPCVisible
        });
    }

    hidePlayerPortrait() {
        this.playerPortraitContainer.style.right = '-300px';
        this.isPlayerVisible = false;
    }

    hideNPCPortrait() {
        this.npcPortraitContainer.style.left = '-300px';
        this.isNPCVisible = false;
    }

    hideAllPortraits() {
        this.hidePlayerPortrait();
        this.hideNPCPortrait();
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }

    updatePortraitsForLine(line, currentPlayerCharacterId, currentNPCCharacterId) {
        console.log('[PortraitManager] updatePortraitsForLine called:', {
            line,
            currentPlayerCharacterId,
            currentNPCCharacterId,
            isEncounterDialogue: this.isEncounterDialogue
        });

        if (this.isEncounterDialogue) {
            console.log('[PortraitManager] Encounter dialogue - hiding all portraits');
            this.hideAllPortraits();
            return;
        }

        if (!line) {
            console.log('[PortraitManager] No line provided - hiding all portraits');
            this.hideAllPortraits();
            return;
        }

        if (line.speaker === 'player') {
            const image1 = line.image1 || 'talk_1.png';
            const image2 = line.image2 || null;
            const duration = line.duration || 250;

            console.log('[PortraitManager] Showing player portrait:', {
                characterId: currentPlayerCharacterId,
                image1,
                image2,
                duration
            });

            this.showPlayerPortrait(currentPlayerCharacterId, image1, image2, duration);
            this.hideNPCPortrait();
        } else if (line.speaker === 'npc') {
            const image1 = line.image1 || 'talk_1.png';
            const image2 = line.image2 || null;
            const duration = line.duration || 250;

            console.log('[PortraitManager] Showing NPC portrait:', {
                characterId: currentNPCCharacterId,
                image1,
                image2,
                duration
            });

            this.showNPCPortrait(currentNPCCharacterId, image1, image2, duration);
            this.hidePlayerPortrait();
        }
    }

    cleanup() {
        this.hideAllPortraits();
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }
}
