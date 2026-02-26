export class MapQuests {
    constructor(config) {
        if (config.game) {
            this.gameState = config.game.gameState;
        } else {
            this.gameState = config.gameState;
        }
    }

    checkQuestProgress(characterId) {
        const character = this.gameState.characters[characterId];
        if (!character || !character.quest) return null;

        const quest = character.quest;
        const completion = quest.completionCriteria;

        switch (completion.type) {
            case 'collect':
                const items = this.gameState.inventory[characterId] || [];
                return items.includes(completion.item);

            case 'defeat':
                const defeated = this.gameState.combatStats.agentsDefeated || 0;
                return defeated >= completion.count;

            case 'minigame':
                const score = this.gameState.miniGameScores.nicholas || 0;
                return score >= completion.score;

            case 'talkToAll':
                const talked = Object.keys(this.gameState.interactions).filter(id =>
                    this.gameState.interactions[id] > 0 && id !== characterId
                ).length;
                const total = Object.keys(CHARACTERS).length - 1;
                return talked >= total;

            default:
                return false;
        }
    }

    getQuestProgressText(characterId) {
        const gameState = this.gameState;
        const character = CHARACTERS[characterId];
        
        if (!character || !character.quest) {
            return { description: 'No active quest', progress: 'Progress: -' };
        }

        const quest = character.quest;
        const isCompleted = gameState.completedQuests.has(characterId);

        if (isCompleted) {
            return { 
                description: quest.description, 
                progress: '<div style="color: var(--accent);">✓ Quest Complete!</div>' 
            };
        }

        const completion = quest.completionCriteria;
        let progressHTML = '';

        if (completion.type === 'collect') {
            const items = gameState.inventory[characterId] || [];
            const hasItem = items.includes(completion.item);
            progressHTML = `<div>Collect ${completion.item}: ${hasItem ? '✓' : '✗'}</div>`;
        } else if (completion.type === 'defeat') {
            const defeated = gameState.combatStats.agentsDefeated || 0;
            progressHTML = `<div>Defeat agents: ${defeated}/${completion.count}</div>`;
        } else if (completion.type === 'minigame') {
            const score = gameState.miniGameScores.nicholas || 0;
            progressHTML = `<div>Mini-game score: ${score}/${completion.score}</div>`;
        } else if (completion.type === 'talkToAll') {
            const talked = Object.keys(gameState.interactions).filter(id =>
                gameState.interactions[id] > 0 && id !== characterId
            ).length;
            const total = Object.keys(CHARACTERS).length - 1;
            progressHTML = `<div>Talk to all: ${talked}/${total}</div>`;
        } else {
            const progress = gameState.questProgress[characterId] || 0;
            progressHTML = `<div>Progress: ${progress}</div>`;
        }

        return { description: quest.description, progress: progressHTML };
    }

    getUnlockRequirementMessage(characterId) {
        const character = CHARACTERS[characterId];
        if (!character || !character.quest) {
            return "You cannot switch to this character yet.";
        }

        const quest = character.quest;
        const unlockCriteria = quest.unlockCriteria;
        const gameState = this.gameState;

        switch (unlockCriteria) {
            case 'startingCharacter':
                return `${character.name} is always available to switch to.`;

            case 'defeat3Agents':
                const defeated = gameState.combatStats.agentsDefeated || 0;
                return `You need to defeat 3 Derse agents to unlock ${character.name}. Currently defeated: ${defeated}/3`;

            case 'findPuzzlePiece':
                return `You need to find the puzzle piece to unlock ${character.name}. Look around the map!`;

            case 'bringLostAnimal':
                const hasAnimal = gameState.inventory[gameState.currentCharacter]?.includes('lostAnimal');
                return hasAnimal
                    ? `Bring the lost animal to ${character.name} to unlock them.`
                    : `You need to find and bring the lost animal to unlock ${character.name}.`;

            case 'talkToAll':
                const currentCharName = gameState.getCurrentCharacter().name;
                return `${currentCharName} needs to talk to all characters to unlock ${character.name}.`;

            case 'beatMiniGame':
                const score = gameState.miniGameScores.nicholas || 0;
                return `You need to beat Nicholas's mini-game (score 5+) to unlock him. Current score: ${score}/5`;

            case 'beOpalCompleted':
                return `Complete Opal's quest first to unlock ${character.name}.`;

            case 'playedAllCharacters':
                const playedCount = gameState.playedCharacters ? gameState.playedCharacters.size : 0;
                const totalNeeded = Object.keys(CHARACTERS).length - 1;
                return `Play as all other characters first to unlock ${character.name}. Played: ${playedCount}/${totalNeeded}`;

            default:
                return `You cannot switch to ${character.name} yet. Complete their unlock requirements first.`;
        }
    }

    updateQuestUI() {
        const questDesc = document.getElementById('questDescription');
        const questProg = document.getElementById('questProgress');
        if (!questDesc || !questProg) return;

        const currentChar = this.gameState.getCurrentCharacter();
        const questInfo = this.getQuestProgressText(currentChar.id);

        questDesc.innerHTML = `<div>${questInfo.description}</div>`;
        questProg.innerHTML = questInfo.progress;
    }
}