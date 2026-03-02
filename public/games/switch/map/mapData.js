export function initializeMapTiles(mapTiles, mapRows, mapCols) {
    for (let y = 0; y < mapRows; y++) {
        mapTiles[y] = [];
        for (let x = 0; x < mapCols; x++) {
            mapTiles[y][x] = 1;
        }
    }
    return mapTiles;
}

export function createRoom(mapTiles, mapRows, mapCols, startX, startY, width, height, walled = 0) {
    for (let y = startY; y < startY + height; y++) {
        for (let x = startX; x < startX + width; x++) {
            if (x >= 0 && x < mapCols && y >= 0 && y < mapRows) {
                mapTiles[y][x] = 0;
            }
        }
    }

    if (walled === 1) {
        for (let x = startX; x < startX + width; x++) {
            if (x >= 0 && x < mapCols) {
                if (startY >= 0 && startY < mapRows) {
                    mapTiles[startY][x] = 1;
                }
                if (startY + height - 1 >= 0 && startY + height - 1 < mapRows) {
                    mapTiles[startY + height - 1][x] = 1;
                }
            }
        }
        for (let y = startY; y < startY + height; y++) {
            if (y >= 0 && y < mapRows) {
                if (startX >= 0 && startX < mapCols) {
                    mapTiles[y][startX] = 1;
                }
                if (startX + width - 1 >= 0 && startX + width - 1 < mapCols) {
                    mapTiles[y][startX + width - 1] = 1;
                }
            }
        }
    }
}

export function createGap(mapTiles, mapRows, mapCols, startX, startY, width, height) {
    for (let y = startY; y < startY + height; y++) {
        for (let x = startX; x < startX + width; x++) {
            if (x >= 0 && x < mapCols && y >= 0 && y < mapRows) {
                mapTiles[y][x] = 2;
            }
        }
    }
}

export const roomDefinitions = [
    { type: 'gap', x: 0, y: 0, width: 160, height: 160, walled: 1 },
    { type: 'room', x: 65, y: 65, width: 30, height: 30, walled: 1 },
    { type: 'room', x: 5, y: 65, width: 30, height: 30, walled: 1 },
    { type: 'room', x: 5, y: 5, width: 30, height: 30, walled: 1 },
    { type: 'room', x: 65, y: 5, width: 30, height: 30, walled: 1 },
    { type: 'room', x: 125, y: 65, width: 30, height: 30, walled: 1 },
    { type: 'room', x: 65, y: 125, width: 30, height: 30, walled: 1 },
    { type: 'room', x: 125, y: 125, width: 30, height: 30, walled: 1 },
    { type: 'room', x: 125, y: 5, width: 30, height: 30, walled: 1 },
    { type: 'room', x: 5, y: 125, width: 30, height: 30, walled: 1 },
    { type: 'room', x: 17, y: 35, width: 6, height: 30, walled: 1 },
    { type: 'room', x: 17, y: 95, width: 6, height: 30, walled: 1 },
    { type: 'room', x: 137, y: 35, width: 6, height: 30, walled: 1 },
    { type: 'room', x: 137, y: 95, width: 6, height: 30, walled: 1 },
    { type: 'room', x: 35, y: 17, width: 30, height: 6, walled: 1 },
    { type: 'room', x: 35, y: 137, width: 30, height: 6, walled: 1 },
    { type: 'room', x: 95, y: 137, width: 30, height: 6, walled: 1 },
    { type: 'room', x: 77, y: 95, width: 6, height: 30, walled: 1 },
    { type: 'room', x: 18, y: 34, width: 4, height: 32, walled: 0 },
    { type: 'room', x: 18, y: 94, width: 4, height: 32, walled: 0 },
    { type: 'room', x: 138, y: 34, width: 4, height: 32, walled: 0 },
    { type: 'room', x: 138, y: 94, width: 4, height: 32, walled: 0 },
    { type: 'room', x: 34, y: 18, width: 32, height: 4, walled: 0 },
    { type: 'room', x: 34, y: 138, width: 32, height: 4, walled: 0 },
    { type: 'room', x: 94, y: 138, width: 32, height: 4, walled: 0 },
    { type: 'room', x: 78, y: 94, width: 4, height: 32, walled: 0 },
];

export const boulderPositions = [
    { x: 78, y: 83 },
    { x: 82, y: 85 },
    { x: 86, y: 87 },
    { x: 80, y: 91 },
    { x: 84, y: 93 },
    { x: 15, y: 83 },
    { x: 18, y: 86 },
    { x: 22, y: 89 },
    { x: 25, y: 92 },
    { x: 75, y: 23 },
    { x: 78, y: 26 },
    { x: 82, y: 29 },
    { x: 86, y: 32 },
    { x: 90, y: 35 },
];

export const obstaclePositions = [
    { x: 76, y: 83, broken: false },
    { x: 80, y: 85, broken: false },
    { x: 84, y: 87, broken: false },
    { x: 88, y: 89, broken: false },
    { x: 82, y: 92, broken: false },
    { x: 115, y: 83, broken: false },
    { x: 118, y: 85, broken: false },
    { x: 122, y: 87, broken: false },
    { x: 126, y: 89, broken: false },
    { x: 130, y: 91, broken: false },
    { x: 12, y: 133, broken: false },
    { x: 15, y: 135, broken: false },
    { x: 18, y: 137, broken: false },
    { x: 22, y: 139, broken: false },
    { x: 142, y: 138, broken: false },
    { x: 145, y: 140, broken: false },
    { x: 148, y: 142, broken: false },
    { x: 152, y: 144, broken: false },
    { x: 156, y: 146, broken: false },
];

export const fillableChasmPositions = [
    { x: 145, y: 33, filled: false },
    { x: 146, y: 33, filled: false },
    { x: 147, y: 33, filled: false },
    { x: 148, y: 33, filled: false },
    { x: 149, y: 33, filled: false },


    { x: 21, y: 45, filled: false },
];

export const chestPositions = [
    { x: 82, y: 87, opened: false, item: 'puzzlePiece' },
    { x: 22, y: 87, opened: false, item: 'lostAnimal' },
    { x: 82, y: 142, opened: false, item: 'notebook' },
    { x: 82, y: 27, opened: false, item: 'opalMap', requiresPuzzle: true, restrictedTo: ['opal', 'austine'] },
    { x: 152, y: 37, opened: false, item: 'austineMap', requiresPuzzle: true, restrictedTo: ['opal', 'austine'] },
    { x: 122, y: 87, opened: false, item: 'ancientArtifact' },
    { x: 20, y: 42, opened: false, item: 'magicalCrystal' },
    { x: 147, y: 142, opened: false, item: 'heroicSword' },
    { x: 17, y: 135, opened: false, item: 'shieldOfValor' },
    { x: 122, y: 42, opened: false, item: 'mysticalOrb' },
];

export const agentConfigs = [
    {
        x: 20,
        y: 69,
        direction: 'right',
        patrolPath: [[20, 69], [30, 69]],
        patrolIndex: 0,
        patrolReverse: false,
        speed: 1,
        detectionRange: 5,
        chasing: false,
        defeated: false,
        animationFrame: 0,
        animationTimer: 0,
        type: 'derseGuard'
    },
    {
        x: 80,
        y: 80,
        direction: 'down',
        patrolPath: [[80, 80], [80, 90]],
        patrolIndex: 0,
        patrolReverse: false,
        speed: 1,
        detectionRange: 5,
        chasing: false,
        defeated: false,
        animationFrame: 0,
        animationTimer: 0,
        type: 'derseAgent'
    },
    {
        x: 20,
        y: 80,
        direction: 'right',
        patrolPath: [[20, 80], [30, 80]],
        patrolIndex: 0,
        patrolReverse: false,
        speed: 1,
        detectionRange: 5,
        chasing: false,
        defeated: false,
        animationFrame: 0,
        animationTimer: 0,
        type: 'derseAgent'
    },
    {
        x: 20,
        y: 75,
        direction: 'right',
        patrolPath: [[20, 75], [30, 75]],
        patrolIndex: 0,
        patrolReverse: false,
        speed: 1,
        detectionRange: 5,
        chasing: false,
        defeated: false,
        animationFrame: 0,
        animationTimer: 0,
        type: 'derseAgent'
    },
        {
        x: 20,
        y: 74,
        direction: 'right',
        patrolPath: [[20, 74], [30, 74]],
        patrolIndex: 0,
        patrolReverse: false,
        speed: 1,
        detectionRange: 5,
        chasing: false,
        defeated: false,
        animationFrame: 0,
        animationTimer: 0,
        type: 'derseAgent'
    },
    {
        x: 20,
        y: 73,
        direction: 'right',
        patrolPath: [[20, 73], [30, 73]],
        patrolIndex: 0,
        patrolReverse: false,
        speed: 1,
        detectionRange: 5,
        chasing: false,
        defeated: false,
        animationFrame: 0,
        animationTimer: 0,
        type: 'derseAgent'
    },
    {
        x: 20,
        y: 70,
        direction: 'right',
        patrolPath: [[20, 70], [30, 70]],
        patrolIndex: 0,
        patrolReverse: false,
        speed: 1,
        detectionRange: 5,
        chasing: false,
        defeated: false,
        animationFrame: 0,
        animationTimer: 0,
        type: 'derseAgent'
    },
    {
        x: 120,
        y: 80,
        direction: 'left',
        patrolPath: [[120, 80]],
        patrolIndex: 0,
        patrolReverse: false,
        speed: 1,
        detectionRange: 4,
        chasing: false,
        defeated: false,
        animationFrame: 0,
        animationTimer: 0,
        type: 'derseAgent'
    },
    {
        x: 20,
        y: 81,
        direction: 'right',
        patrolPath: [[20, 81], [30, 81]],
        patrolIndex: 0,
        patrolReverse: false,
        speed: 1,
        detectionRange: 6,
        chasing: false,
        defeated: false,
        animationFrame: 0,
        animationTimer: 0,
        type: 'derseArchagent'
    },
    {
        x: 20,
        y: 82,
        direction: 'right',
        patrolPath: [[20, 82], [30, 82]],
        patrolIndex: 0,
        patrolReverse: false,
        speed: 1,
        detectionRange: 6,
        chasing: false,
        defeated: false,
        animationFrame: 0,
        animationTimer: 0,
        type: 'dd'
    },
    {
        x: 20,
        y: 83,
        direction: 'right',
        patrolPath: [[20, 83], [30, 83]],
        patrolIndex: 0,
        patrolReverse: false,
        speed: 1,
        detectionRange: 6,
        chasing: false,
        defeated: false,
        animationFrame: 0,
        animationTimer: 0,
        type: 'cd'
    },
    {
        x: 20,
        y: 84,
        direction: 'right',
        patrolPath: [[20, 84], [30, 84]],
        patrolIndex: 0,
        patrolReverse: false,
        speed: 1,
        detectionRange: 6,
        chasing: false,
        defeated: false,
        animationFrame: 0,
        animationTimer: 0,
        type: 'hb'
    },
    {
        x: 20,
        y: 85,
        direction: 'right',
        patrolPath: [[20, 85], [30, 85]],
        patrolIndex: 0,
        patrolReverse: false,
        speed: 1,
        detectionRange: 6,
        chasing: false,
        defeated: false,
        animationFrame: 0,
        animationTimer: 0,
        type: 'ss'
    },
];
