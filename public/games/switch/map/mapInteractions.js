import { getInteractionRange } from '../constants.js';

export class MapInteractions {
    constructor(game) {
        this.game = game;
    }

    handleClickAbility(x, y) {
        const currentChar = this.game.gameState.getCurrentCharacter();
        const worldX = x + this.game.camera.x;
        const worldY = y + this.game.camera.y;

        switch (currentChar.id) {
            case 'opal':
                if (currentChar.abilities.includes('teleport')) {
                    this.handleTeleport(worldX, worldY);
                }
                break;

            case 'isabela':
                if (currentChar.abilities.includes('gristCreator')) {
                    this.handleGristCreation(worldX, worldY);
                }
                break;

            case 'austine':
                if (currentChar.abilities.includes('puzzleSolver')) {
                    this.game.showFloatingText(worldX - this.game.camera.x, worldY - this.game.camera.y, 'Puzzle Auto-Solved!', '#5db473');
                }
                break;
        }
    }

    handleTeleport(targetX, targetY) {
        if (this.game.playerFrozen) {
            this.game.showFloatingText(this.game.player.x, this.game.player.y - 40, 'Cannot teleport while being watched!', '#ff6666');
            return;
        }

        const centerOffsetX = this.game.player.width / 2;
        const centerOffsetY = this.game.player.height / 2;
        const targetPlayerX = targetX - centerOffsetX;
        const targetPlayerY = targetY - centerOffsetY;

        const clampedX = Math.max(0, Math.min(this.game.mapWidth - this.game.player.width, targetPlayerX));
        const clampedY = Math.max(0, Math.min(this.game.mapHeight - this.game.player.height, targetPlayerY));

        if (this.isValidTeleportLocation(clampedX, clampedY)) {
            this.game.player.x = clampedX;
            this.game.player.y = clampedY;
            this.game.gameState.save();
        } else {
            this.game.showFloatingText(this.game.player.x, this.game.player.y - 40, 'Cannot teleport there!', '#ff6666');
        }
    }

    isValidTeleportLocation(newX, newY) {
        const safetyMargin = 1;
        const playerRight = newX + this.game.player.width;
        const playerBottom = newY + this.game.player.height;

        const tileLeft = Math.floor((newX - safetyMargin) / this.game.tileSize);
        const tileRight = Math.floor((playerRight + safetyMargin - 1) / this.game.tileSize);
        const tileTop = Math.floor((newY - safetyMargin) / this.game.tileSize);
        const tileBottom = Math.floor((playerBottom + safetyMargin - 1) / this.game.tileSize);

        for (let ty = tileTop; ty <= tileBottom; ty++) {
            for (let tx = tileLeft; tx <= tileRight; tx++) {
                if (ty < 0 || ty >= this.game.mapRows || tx < 0 || tx >= this.game.mapCols) {
                    return false;
                }

                const tileType = this.game.mapTiles[ty][tx];
                if (tileType !== 0) {
                    return false;
                }
            }
        }

        for (const boulder of this.game.boulders) {
            if (newX < boulder.x + this.game.tileSize + safetyMargin &&
                newX + this.game.player.width > boulder.x - safetyMargin &&
                newY < boulder.y + this.game.tileSize + safetyMargin &&
                newY + this.game.player.height > boulder.y - safetyMargin) {
                return false;
            }
        }

        for (const npc of this.game.npcs) {
            if (npc && npc.position && npc.id !== 'pet') {
                if (newX < npc.position.x + this.game.tileSize + safetyMargin &&
                    newX + this.game.player.width > npc.position.x - safetyMargin &&
                    newY < npc.position.y + this.game.tileSize + safetyMargin &&
                    newY + this.game.player.height > npc.position.y - safetyMargin) {
                    return false;
                }
            }
        }

        for (const agent of this.game.agents) {
            if (!agent.defeated) {
                if (newX < agent.x + this.game.tileSize + safetyMargin &&
                    newX + this.game.player.width > agent.x - safetyMargin &&
                    newY < agent.y + this.game.tileSize + safetyMargin &&
                    newY + this.game.player.height > agent.y - safetyMargin) {
                    return false;
                }
            }
        }

        for (const chasm of this.game.fillableChasms) {
            if (!chasm.filled) {
                if (newX < chasm.x + this.game.tileSize + safetyMargin &&
                    newX + this.game.player.width > chasm.x - safetyMargin &&
                    newY < chasm.y + this.game.tileSize + safetyMargin &&
                    newY + this.game.player.height > chasm.y - safetyMargin) {
                    return false;
                }
            }
        }

        for (const obstacle of this.game.obstacles) {
            if (!obstacle.broken) {
                if (newX < obstacle.x + this.game.tileSize + safetyMargin &&
                    newX + this.game.player.width > obstacle.x - safetyMargin &&
                    newY < obstacle.y + this.game.tileSize + safetyMargin &&
                    newY + this.game.player.height > obstacle.y - safetyMargin) {
                    return false;
                }
            }
        }

        return true;
    }

    handleGristCreation(worldX, worldY) {
        this.game.gameState.buildProgress.grist = Math.min(
            (this.game.gameState.buildProgress.grist || 0) + 10,
            100
        );
        this.game.showFloatingText(worldX - this.game.camera.x, worldY - this.game.camera.y, '+10 Grist', '#d85221');

        this.game.updateQuestUI();
    }

    handleSpaceKeyInteractions() {
        const currentChar = this.game.gameState.getCurrentCharacter();
        const interactionRange = getInteractionRange();

        if (this.handleChestInteraction(currentChar, interactionRange)) return;
        if (this.handleObstacleInteraction(currentChar, interactionRange)) return;
        if (this.handleChasmInteraction(currentChar, interactionRange)) return;
    }

    handleChestInteraction(currentChar, interactionRange) {
        for (const chest of this.game.chests) {
            if (!chest.opened) {
                const dx = this.game.player.x - chest.x;
                const dy = this.game.player.y - chest.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < interactionRange) {
                    if (chest.requiresPuzzle) {
                        return this.handlePuzzleChest(chest, currentChar);
                    }
                    return this.openChest(chest, currentChar);
                }
            }
        }
        return false;
    }

    handlePuzzleChest(chest, currentChar) {
        if (chest.restrictedTo && !chest.restrictedTo.includes(currentChar.id)) {
            this.game.showFloatingText(chest.x + this.game.tileSize/2, chest.y, 'Only Opal or Austine can open this', '#ff6666');
            return true;
        }

        if (chest.puzzleSolved) {
            if (chest.item === 'opalMap' && currentChar.id !== 'opal') {
                this.game.showFloatingText(chest.x + this.game.tileSize/2, chest.y, 'Only Opal can pick up this map!', '#ff6666');
                return true;
            }
            if (chest.item === 'austineMap' && currentChar.id !== 'austine') {
                this.game.showFloatingText(chest.x + this.game.tileSize/2, chest.y, 'Only Austine can pick up this map!', '#ff6666');
                return true;
            }

            chest.opened = true;
            this.game.gameState.addToInventory(currentChar.id, chest.item);
            this.game.showFloatingText(chest.x + this.game.tileSize/2, chest.y, `Found ${chest.item}!`, '#FFD700');

            if (chest.item === 'opalMap' && this.game.gameState.gameItems?.opalMap) {
                this.game.gameState.gameItems.opalMap.found = true;
            } else if (chest.item === 'austineMap' && this.game.gameState.gameItems?.austineMap) {
                this.game.gameState.gameItems.austineMap.found = true;
            }

            if (this.game.questLogic) {
                this.game.questLogic.autoCompleteHistoricalActions('austine');
                this.game.questLogic.autoCompleteHistoricalActions('isabela');
                this.game.questLogic.autoCompleteHistoricalActions('alexis');
                this.game.questLogic.autoCompleteHistoricalActions('nicholas');
                this.game.questLogic.autoCompleteHistoricalActions('tyson');
                this.game.questLogic.autoCompleteHistoricalActions('chloe');
                this.game.questLogic.autoCompleteHistoricalActions('opal');
                this.game.questLogic.autoCompleteHistoricalActions('victor');

                if (this.game.updateQuestUI) {
                    this.game.updateQuestUI();
                }
            }

            this.saveChestStates();
            this.game.gameState.save();
            return true;
        }

        this.game.logicPuzzle.puzzleType = chest.item === 'opalMap' ? 'rowcol' : 'neighbor';
        this.game.currentPuzzleChest = chest;
        this.game.logicPuzzle.start(currentChar.id);
        return true;
    }

    openChest(chest, currentChar) {
        chest.opened = true;
        this.game.gameState.addToInventory(currentChar.id, chest.item);
        this.game.showFloatingText(chest.x + this.game.tileSize/2, chest.y, `Found ${chest.item}!`, '#FFD700');

        if (chest.item === 'puzzlePiece' && this.game.gameState.gameItems?.puzzlePiece) {
            this.game.gameState.gameItems.puzzlePiece.found = true;
        }

        if (this.game.questLogic) {
            this.game.questLogic.autoCompleteHistoricalActions('austine');
            this.game.questLogic.autoCompleteHistoricalActions('isabela');
            this.game.questLogic.autoCompleteHistoricalActions('alexis');
            this.game.questLogic.autoCompleteHistoricalActions('nicholas');
            this.game.questLogic.autoCompleteHistoricalActions('tyson');
            this.game.questLogic.autoCompleteHistoricalActions('chloe');
            this.game.questLogic.autoCompleteHistoricalActions('opal');
            this.game.questLogic.autoCompleteHistoricalActions('victor');

            if (this.game.updateQuestUI) {
                this.game.updateQuestUI();
            }
        }

        this.saveChestStates();
        this.game.gameState.save();
        return true;
    }

    handleBoulderInteraction(currentChar, interactionRange) {
        if (currentChar.id !== 'opal') return false;

        for (const boulder of this.game.boulders) {
            const dx = this.game.player.x - boulder.x;
            const dy = this.game.player.y - boulder.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < interactionRange) {
                let pushX = 0;
                let pushY = 0;

                if (this.game.player.direction === 'up') pushY = -this.game.tileSize;
                else if (this.game.player.direction === 'down') pushY = this.game.tileSize;
                else if (this.game.player.direction === 'left') pushX = -this.game.tileSize;
                else if (this.game.player.direction === 'right') pushX = this.game.tileSize;

                const newBoulderX = boulder.x + pushX;
                const newBoulderY = boulder.y + pushY;

                const boulderTileX = Math.floor(newBoulderX / this.game.tileSize);
                const boulderTileY = Math.floor(newBoulderY / this.game.tileSize);

                if (boulderTileY >= 0 && boulderTileY < this.game.mapRows &&
                    boulderTileX >= 0 && boulderTileX < this.game.mapCols) {
                    const tileType = this.game.mapTiles[boulderTileY][boulderTileX];

                    let boulderBlocked = false;
                    for (const otherBoulder of this.game.boulders) {
                        if (otherBoulder !== boulder) {
                            if (otherBoulder.x === newBoulderX && otherBoulder.y === newBoulderY) {
                                boulderBlocked = true;
                                break;
                            }
                        }
                    }

                    if (tileType === 0 && !boulderBlocked) {
                        boulder.x = newBoulderX;
                        boulder.y = newBoulderY;
                        this.game.showFloatingText(boulder.x + this.game.tileSize/2, boulder.y, 'Pushed!', '#6a5a7a');
                    } else {
                        this.game.showFloatingText(boulder.x + this.game.tileSize/2, boulder.y, 'Cannot push here', '#ff6666');
                    }
                }
                return true;
            }
        }
        return false;
    }

    handleObstacleInteraction(currentChar, interactionRange) {
        if (currentChar.id !== 'alexis') return false;

        for (const obstacle of this.game.obstacles) {
            if (!obstacle.broken) {
                const dx = this.game.player.x - obstacle.x;
                const dy = this.game.player.y - obstacle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < interactionRange) {
                    obstacle.broken = true;
                    this.game.showFloatingText(obstacle.x + this.game.tileSize/2, obstacle.y, 'Smashed!', '#5a4a6a');
                    return true;
                }
            }
        }
        return false;
    }

    handleChasmInteraction(currentChar, interactionRange) {
        if (currentChar.id !== 'isabela') return false;

        for (const chasm of this.game.fillableChasms) {
            if (!chasm.filled) {
                const dx = this.game.player.x - chasm.x;
                const dy = this.game.player.y - chasm.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < interactionRange) {
                    if (this.game.gameState.grist >= 10) {
                        chasm.filled = true;
                        this.game.gameState.grist -= 10;
                        this.game.showFloatingText(chasm.x + this.game.tileSize/2, chasm.y, 'Chasm Filled!', '#4a3a5a');
                        this.game.gameState.save();
                    } else {
                        this.game.showFloatingText(chasm.x + this.game.tileSize/2, chasm.y, 'Need 10 grist', '#ff6666');
                    }
                    return true;
                }
            }
        }
        return false;
    }

    saveChestStates() {
        this.game.gameState.chestStates = this.game.chests.map(chest => ({
            opened: chest.opened || false,
            puzzleSolved: chest.puzzleSolved || false
        }));
    }

    restoreChestStates() {
        if (this.game.gameState.chestStates && this.game.gameState.chestStates.length > 0) {
            this.game.gameState.chestStates.forEach((savedState, index) => {
                if (this.game.chests[index]) {
                    this.game.chests[index].opened = savedState.opened || false;
                    this.game.chests[index].puzzleSolved = savedState.puzzleSolved || false;
                }
            });
        }
    }

    onLogicPuzzleComplete(success) {
        if (success && this.game.currentPuzzleChest) {
            const chest = this.game.currentPuzzleChest;

            chest.puzzleSolved = true;
            this.game.showFloatingText(chest.x + this.game.tileSize/2, chest.y, 'Puzzle solved!', '#00ff00');
            this.saveChestStates();
            this.game.gameState.save();
        } else if (!success) {
            this.game.showFloatingText(this.game.player.x, this.game.player.y - 40, 'Puzzle failed! Try again', '#ff6666');
        }

        this.game.currentPuzzleChest = null;
    }

    handleCanvasClick(e) {
        const rect = this.game.canvas.getBoundingClientRect();
        const scaleX = this.game.canvas.width / rect.width;
        const scaleY = this.game.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        if (this.game.logicPuzzle && this.game.logicPuzzle.active) {
            this.game.logicPuzzle.handleClick(x, y);
            return;
        }

        if (this.game.inMiniGame && this.game.miniGame) {
            this.game.miniGame.handleClick(x, y);
            return;
        }

        if (this.game.inCombat) {
            return;
        }

        this.checkItemPickup(x, y);
        this.handleClickAbility(x, y);
    }

    checkItemPickup(x, y) {
        const worldX = x + this.game.camera.x;
        const worldY = y + this.game.camera.y;

        for (const itemId in this.game.gameState.gameItems) {
            const item = this.game.gameState.gameItems[itemId];
            if (item.found || !item.position) continue;

            const dx = worldX - item.position.x;
            const dy = worldY - item.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 40) {
                this.game.gameState.gameItems[itemId].found = true;
                this.game.gameState.addToInventory(this.game.gameState.currentCharacter, itemId);
                this.game.showFloatingText(item.position.x - this.game.camera.x, item.position.y - this.game.camera.y, `Found ${itemId}!`, '#FFD700');
                this.game.updateInventoryUI();
                this.game.updateQuestUI();
                this.game.gameState.save();
                return;
            }
        }
    }

    checkForItemPickups() {
        if (!this.game.gameState || !this.game.gameState.gameItems) return;

        const playerCenterX = this.game.player.x + this.game.player.width / 2;
        const playerCenterY = this.game.player.y + this.game.player.height / 2;
        const pickupDistance = 40;

        for (const [itemId, itemData] of Object.entries(this.game.gameState.gameItems)) {
            if (!itemData.collected) {
                const dx = playerCenterX - (itemData.x + 16);
                const dy = playerCenterY - (itemData.y + 16);
                const distance = Math.hypot(dx, dy);

                if (distance < pickupDistance) {
                    this.game.gameState.pickupItem(itemId);
                    this.game.updateInventoryUI();

                    if (this.game.questLogic) {
                        this.game.questLogic.autoCompleteHistoricalActions('austine');
                        this.game.questLogic.autoCompleteHistoricalActions('isabela');
                        this.game.questLogic.autoCompleteHistoricalActions('alexis');
                        this.game.questLogic.autoCompleteHistoricalActions('nicholas');
                        this.game.questLogic.autoCompleteHistoricalActions('tyson');
                        this.game.questLogic.autoCompleteHistoricalActions('chloe');
                        this.game.questLogic.autoCompleteHistoricalActions('opal');
                        this.game.questLogic.autoCompleteHistoricalActions('victor');
                    }

                    this.game.updateQuestUI();
                }
            }
        }
    }

    checkCollision(x, y, width, height, excludeAgent = null) {
        const tileLeft = Math.floor(x / this.game.tileSize);
        const tileRight = Math.floor((x + width - 1) / this.game.tileSize);
        const tileTop = Math.floor(y / this.game.tileSize);
        const tileBottom = Math.floor((y + height - 1) / this.game.tileSize);

        for (let ty = tileTop; ty <= tileBottom; ty++) {
            for (let tx = tileLeft; tx <= tileRight; tx++) {
                if (ty >= 0 && ty < this.game.mapRows && tx >= 0 && tx < this.game.mapCols) {
                    const tileType = this.game.mapTiles[ty][tx];
                    if (tileType === 1 || tileType === 2) {
                        return true;
                    }
                }
            }
        }

        for (const boulder of this.game.boulders) {
            if (x < boulder.x + this.game.tileSize &&
                x + width > boulder.x &&
                y < boulder.y + this.game.tileSize &&
                y + height > boulder.y) {
                return true;
            }
        }

        for (const obstacle of this.game.obstacles) {
            if (!obstacle.broken) {
                if (x < obstacle.x + this.game.tileSize &&
                    x + width > obstacle.x &&
                    y < obstacle.y + this.game.tileSize &&
                    y + height > obstacle.y) {
                    return true;
                }
            }
        }

        for (const chasm of this.game.fillableChasms) {
            if (!chasm.filled) {
                if (x < chasm.x + this.game.tileSize &&
                    x + width > chasm.x &&
                    y < chasm.y + this.game.tileSize &&
                    y + height > chasm.y) {
                    return true;
                }
            }
        }

        for (const npc of this.game.npcs) {
            if (npc && npc.position && npc.id !== 'pet') {
                if (x < npc.position.x + this.game.tileSize &&
                    x + width > npc.position.x &&
                    y < npc.position.y + this.game.tileSize &&
                    y + height > npc.position.y) {
                    return true;
                }
            }
        }

        for (const agent of this.game.agents) {
            if (agent && !agent.defeated && agent !== excludeAgent) {
                if (x < agent.x + this.game.tileSize &&
                    x + width > agent.x &&
                    y < agent.y + this.game.tileSize &&
                    y + height > agent.y) {
                    return true;
                }
            }
        }

        if (this.game.player) {
            if (x < this.game.player.x + this.game.player.width &&
                x + width > this.game.player.x &&
                y < this.game.player.y + this.game.player.height &&
                y + height > this.game.player.y) {
                const isPlayerMoving = (x === this.game.player.x && y === this.game.player.y);
                if (!isPlayerMoving) {
                    return true;
                }
            }
        }

        return false;
    }

    updatePlayerMovement() {
        if (this.game.inCombat) return;
        if (this.game.dialogueManager.showingMenu) return;
        if (this.game.playerFrozen) return;

        let dx = 0;
        let dy = 0;

        const base = this.game.player.speed;
        const vertical = (this.game.keys['KeyW'] || this.game.keys['ArrowUp']) || (this.game.keys['KeyS'] || this.game.keys['ArrowDown']);
        const horizontal = (this.game.keys['KeyA'] || this.game.keys['ArrowLeft']) || (this.game.keys['KeyD'] || this.game.keys['ArrowRight']);
        const step = (vertical && horizontal) ? base * 0.82 : base;

        if (this.game.keys['KeyW'] || this.game.keys['ArrowUp']) {
            dy = -step;
            this.game.player.direction = 'up';
        }
        if (this.game.keys['KeyS'] || this.game.keys['ArrowDown']) {
            dy = step;
            this.game.player.direction = 'down';
        }
        if (this.game.keys['KeyA'] || this.game.keys['ArrowLeft']) {
            dx = -step;
            this.game.player.direction = 'left';
        }
        if (this.game.keys['KeyD'] || this.game.keys['ArrowRight']) {
            dx = step;
            this.game.player.direction = 'right';
        }

        this.game.player.isMoving = dx !== 0 || dy !== 0;

        let newX = Math.max(0, Math.min(this.game.mapWidth - this.game.player.width, this.game.player.x + dx));
        let newY = Math.max(0, Math.min(this.game.mapHeight - this.game.player.height, this.game.player.y + dy));

        const playerTileLeft = Math.floor(newX / this.game.tileSize);
        const playerTileRight = Math.floor((newX + this.game.player.width - 1) / this.game.tileSize);
        const playerTileTop = Math.floor(newY / this.game.tileSize);
        const playerTileBottom = Math.floor((newY + this.game.player.height - 1) / this.game.tileSize);

        for (let ty = playerTileTop; ty <= playerTileBottom; ty++) {
            for (let tx = playerTileLeft; tx <= playerTileRight; tx++) {
                if (ty >= 0 && ty < this.game.mapRows && tx >= 0 && tx < this.game.mapCols) {
                    const tileType = this.game.mapTiles[ty][tx];
                    if (tileType === 1 || tileType === 2) {
                        return;
                    }
                }
            }
        }

        const currentChar = this.game.gameState.getCurrentCharacter();

        for (const boulder of this.game.boulders) {
            if (newX < boulder.x + this.game.tileSize &&
                newX + this.game.player.width > boulder.x &&
                newY < boulder.y + this.game.tileSize &&
                newY + this.game.player.height > boulder.y) {

                if (this.game.boulderPushing) {
                    return;
                }

                if (currentChar.id !== 'opal') {
                    return;
                }

                let pushX = 0;
                let pushY = 0;

                if (this.game.player.direction === 'up') pushY = -this.game.tileSize;
                else if (this.game.player.direction === 'down') pushY = this.game.tileSize;
                else if (this.game.player.direction === 'left') pushX = -this.game.tileSize;
                else if (this.game.player.direction === 'right') pushX = this.game.tileSize;

                const newBoulderX = boulder.x + pushX;
                const newBoulderY = boulder.y + pushY;

                const boulderTileX = Math.floor(newBoulderX / this.game.tileSize);
                const boulderTileY = Math.floor(newBoulderY / this.game.tileSize);

                if (boulderTileY >= 0 && boulderTileY < this.game.mapRows &&
                    boulderTileX >= 0 && boulderTileX < this.game.mapCols) {
                    const tileType = this.game.mapTiles[boulderTileY][boulderTileX];

                    let boulderBlocked = false;
                    for (const otherBoulder of this.game.boulders) {
                        if (otherBoulder !== boulder) {
                            if (otherBoulder.x === newBoulderX && otherBoulder.y === newBoulderY) {
                                boulderBlocked = true;
                                break;
                            }
                        }
                    }

                    if (tileType === 0 && !boulderBlocked) {
                        this.game.boulderPushing = true;
                        this.game.playerFrozen = true;

                        const startX = boulder.x;
                        const startY = boulder.y;
                        const startTime = Date.now();
                        const duration = 500;

                        const animatePush = () => {
                            const elapsed = Date.now() - startTime;
                            const progress = Math.min(elapsed / duration, 1);

                            boulder.x = startX + pushX * progress;
                            boulder.y = startY + pushY * progress;

                            if (progress < 1) {
                                requestAnimationFrame(animatePush);
                            } else {
                                boulder.x = newBoulderX;
                                boulder.y = newBoulderY;
                                this.game.boulderPushing = false;
                                this.game.playerFrozen = false;
                                this.game.showFloatingText(boulder.x + this.game.tileSize/2, boulder.y, 'Pushed!', '#6a5a7a');
                            }
                        };

                        animatePush();
                    } else {
                        this.game.showFloatingText(boulder.x + this.game.tileSize/2, boulder.y, 'Cannot push here', '#ff6666');
                    }
                }

                return;
            }
        }

        for (const obstacle of this.game.obstacles) {
            if (!obstacle.broken) {
                if (newX < obstacle.x + this.game.tileSize &&
                    newX + this.game.player.width > obstacle.x &&
                    newY < obstacle.y + this.game.tileSize &&
                    newY + this.game.player.height > obstacle.y) {
                    return;
                }
            }
        }

        for (const chasm of this.game.fillableChasms) {
            if (!chasm.filled) {
                if (newX < chasm.x + this.game.tileSize &&
                    newX + this.game.player.width > chasm.x &&
                    newY < chasm.y + this.game.tileSize &&
                    newY + this.game.player.height > chasm.y) {
                    return;
                }
            }
        }

        for (const npc of this.game.npcs) {
            if (npc && npc.position && npc.id !== 'pet') {
                if (newX < npc.position.x + this.game.tileSize &&
                    newX + this.game.player.width > npc.position.x &&
                    newY < npc.position.y + this.game.tileSize &&
                    newY + this.game.player.height > npc.position.y) {
                    return;
                }
            }
        }

        for (const agent of this.game.agents) {
            if (!agent.defeated) {
                if (newX < agent.x + this.game.tileSize &&
                    newX + this.game.player.width > agent.x &&
                    newY < agent.y + this.game.tileSize &&
                    newY + this.game.player.height > agent.y) {
                    return;
                }
            }
        }

        this.game.player.x = newX;
        this.game.player.y = newY;

        if (currentChar && currentChar.id) {
            this.game.gameState.characterPositions[currentChar.id] = { x: this.game.player.x, y: this.game.player.y };

            const location = this.getCurrentLocation(newX, newY);
            if (location) {
                if (!this.game.gameState.visitedLocations) {
                    this.game.gameState.visitedLocations = {};
                }
                if (!this.game.gameState.visitedLocations[location]) {
                    this.game.gameState.visitedLocations[location] = true;
                    if (this.game.questLogic) {
                        this.game.questLogic.autoCompleteHistoricalActions('austine');
                        this.game.questLogic.autoCompleteHistoricalActions('isabela');
                        this.game.questLogic.autoCompleteHistoricalActions('alexis');
                        this.game.questLogic.autoCompleteHistoricalActions('nicholas');
                        this.game.questLogic.autoCompleteHistoricalActions('tyson');
                        this.game.questLogic.autoCompleteHistoricalActions('chloe');
                        this.game.questLogic.autoCompleteHistoricalActions('opal');
                        this.game.questLogic.autoCompleteHistoricalActions('victor');
                    }
                }
            }
        }
    }

    getCurrentLocation(x, y) {
        if (x >= 5 && x <= 35 && y >= 5 && y <= 35) {
            return 'skia';
        }
        return null;
    }

    updateCamera() {
        const centerX = this.game.player.x + this.game.player.width / 2;
        const centerY = this.game.player.y + this.game.player.height / 2;

        let targetCameraX = centerX - this.game.camera.width / 2;
        let targetCameraY = centerY - this.game.camera.height / 2;

        targetCameraX = Math.max(0, Math.min(this.game.mapWidth - this.game.camera.width, targetCameraX));
        targetCameraY = Math.max(0, Math.min(this.game.mapHeight - this.game.camera.height, targetCameraY));

        this.game.camera.x += (targetCameraX - this.game.camera.x) * 0.1;
        this.game.camera.y += (targetCameraY - this.game.camera.y) * 0.1;
    }

    checkForInteractions() {
        const playerCenterX = this.game.player.x + this.game.player.width / 2;
        const playerCenterY = this.game.player.y + this.game.player.height / 2;
        const interactionDistance = 50;

        for (const npc of this.game.npcs) {
            const dx = playerCenterX - (npc.position.x + 16);
            const dy = playerCenterY - (npc.position.y + 16);
            const distance = Math.hypot(dx, dy);

            if (distance < interactionDistance) {
                return;
            }
        }
    }

    tryInteract() {
        const playerCenterX = this.game.player.x + this.game.player.width / 2;
        const playerCenterY = this.game.player.y + this.game.player.height / 2;
        const interactionDistance = 50;

        let closestNPC = null;
        let closestDistance = interactionDistance;

        for (const npc of this.game.npcs) {
            if (npc.id === this.game.gameState.currentCharacter) continue;

            const dx = playerCenterX - (npc.position.x + 16);
            const dy = playerCenterY - (npc.position.y + 16);
            const distance = Math.hypot(dx, dy);

            if (distance < closestDistance) {
                closestNPC = npc;
                closestDistance = distance;
            }
        }

        if (closestNPC) {
            const npcCenterX = closestNPC.position.x + 16;
            const npcCenterY = closestNPC.position.y + 16;
            const dx = playerCenterX - npcCenterX;
            const dy = playerCenterY - npcCenterY;

            if (Math.abs(dx) > Math.abs(dy)) {
                closestNPC.direction = dx > 0 ? 'right' : 'left';
            } else {
                closestNPC.direction = dy > 0 ? 'down' : 'up';
            }

            this.game.gameOrchestrator.showInteractionMenu(closestNPC.id);
            return true;
        }

        return false;
    }
}
