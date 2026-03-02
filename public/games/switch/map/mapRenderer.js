class GameRenderer {
  constructor() {
    this.tileSize = 32;
  }

  render(ctx, gameState) {
    if (!ctx || !gameState) return;

    const {
      canvas,
      camera,
      sprites,
      mapTiles,
      mapCols,
      mapRows,
      fillableChasms,
      boulders,
      obstacles,
      chests,
      npcs,
      agents,
      player,
      floatingTexts,
      inMiniGame,
      miniGame,
      logicPuzzle
    } = gameState;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.drawBackground(ctx, canvas, camera, sprites);
    this.drawMapTiles(ctx, canvas, camera, mapTiles, mapCols, mapRows);
    this.drawFillableChasms(ctx, canvas, camera, fillableChasms);
    this.drawBoulders(ctx, canvas, camera, boulders);
    this.drawObstacles(ctx, canvas, camera, obstacles);
    this.drawChests(ctx, canvas, camera, chests);
    this.drawItems(ctx, canvas, camera, gameState.gameState);
    this.drawNPCs(ctx, canvas, camera, npcs, sprites);
    this.drawAgents(ctx, canvas, camera, agents, sprites);
    this.drawPlayer(ctx, canvas, camera, player, sprites, gameState.gameState);
    this.drawFloatingTexts(ctx, canvas, camera, floatingTexts);

    if (inMiniGame && miniGame) {
      miniGame.render(ctx);
    }

    if (logicPuzzle && logicPuzzle.active) {
      logicPuzzle.render();
    }
  }

  drawBackground(ctx, canvas, camera, sprites) {
    const bg = sprites && sprites.backgrounds && sprites.backgrounds.main;
    if (bg) {
      ctx.drawImage(bg, -camera.x, -camera.y);
    } else {
      ctx.fillStyle = '#0f0f0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  drawMapTiles(ctx, canvas, camera, mapTiles, mapCols, mapRows) {
    const startCol = Math.max(0, Math.floor(camera.x / this.tileSize));
    const endCol = Math.min(mapCols, Math.ceil((camera.x + canvas.width) / this.tileSize));
    const startRow = Math.max(0, Math.floor(camera.y / this.tileSize));
    const endRow = Math.min(mapRows, Math.ceil((camera.y + canvas.height) / this.tileSize));

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const tileType = mapTiles[row][col];
        const x = col * this.tileSize - camera.x;
        const y = row * this.tileSize - camera.y;

        if (tileType === 1) {
          ctx.fillStyle = '#9f01ff';
          ctx.fillRect(x, y, this.tileSize, this.tileSize);

          ctx.fillStyle = '#6c01fd';
          for (let py = 0; py < this.tileSize; py += 8) {
            for (let px = 0; px < this.tileSize; px += 8) {
              if ((px / 8 + py / 8) % 2 === 0) {
                ctx.fillRect(x + px, y + py, 4, 4);
              }
            }
          }

          ctx.strokeStyle = '#6200b5';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, this.tileSize, this.tileSize);
        } else if (tileType === 2) {
          const drawX = Math.floor(x);
          const drawY = Math.floor(y);
          ctx.fillStyle = '#000000';
          ctx.fillRect(drawX, drawY, this.tileSize + 1, this.tileSize + 1);
        }
      }
    }
  }

  drawFillableChasms(ctx, canvas, camera, fillableChasms) {
    const tile = this.tileSize;
    
    for (const chasm of fillableChasms) {
      const screenX = chasm.x - camera.x;
      const screenY = chasm.y - camera.y;

      if (screenX > -tile && screenX < canvas.width &&
          screenY > -tile && screenY < canvas.height) {

        if (chasm.filled) {
          ctx.fillStyle = '#000000ff';
          ctx.fillRect(screenX, screenY, tile, tile);
        } else {
          ctx.fillStyle = '#000000ff';
          ctx.fillRect(screenX, screenY, tile, tile);

          const pulse = Math.sin(Date.now() / 500) * 0.2 + 0.8;
          ctx.fillStyle = `rgba(90, 50, 110, ${pulse * 0.3})`;
          ctx.fillRect(screenX + 4, screenY + 4, tile - 8, tile - 8);
        }
      }
    }
  }

  drawBoulders(ctx, canvas, camera, boulders) {
    const tile = this.tileSize;
    
    for (const boulder of boulders) {
      const screenX = boulder.x - camera.x;
      const screenY = boulder.y - camera.y;

      if (screenX > -tile && screenX < canvas.width &&
          screenY > -tile && screenY < canvas.height) {

        ctx.fillStyle = '#6a5a7a';
        ctx.fillRect(screenX, screenY, tile, tile);

        ctx.fillStyle = '#7a6a8a';
        ctx.fillRect(screenX + 4, screenY + 4, 8, 8);
        ctx.fillRect(screenX + tile - 12, screenY + 4, 8, 8);

        ctx.fillStyle = '#4a3a5a';
        ctx.fillRect(screenX + 4, screenY + tile - 12, tile - 8, 8);
      }
    }
  }

  drawObstacles(ctx, canvas, camera, obstacles) {
    const tile = this.tileSize;
    
    for (const obstacle of obstacles) {
      if (!obstacle.broken) {
        const screenX = obstacle.x - camera.x;
        const screenY = obstacle.y - camera.y;

        if (screenX > -tile && screenX < canvas.width &&
            screenY > -tile && screenY < canvas.height) {

          ctx.fillStyle = '#5a4a6a';
          ctx.fillRect(screenX + 4, screenY + 8, tile - 8, tile - 12);
          ctx.fillRect(screenX + 8, screenY + 4, tile - 16, tile - 8);

          ctx.strokeStyle = '#3a2a4a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(screenX + 12, screenY + 8);
          ctx.lineTo(screenX + tile / 2, screenY + tile / 2);
          ctx.lineTo(screenX + tile - 12, screenY + tile - 8);
          ctx.stroke();
        }
      }
    }
  }

  drawChests(ctx, canvas, camera, chests) {
    const tile = this.tileSize;
    
    for (const chest of chests) {
      if (!chest.opened) {
        const screenX = chest.x - camera.x;
        const screenY = chest.y - camera.y;

        if (screenX > -tile && screenX < canvas.width &&
            screenY > -tile && screenY < canvas.height) {

          ctx.fillStyle = '#8B4513';
          ctx.fillRect(screenX + 6, screenY + 12, tile - 12, tile - 14);

          ctx.fillStyle = '#A0522D';
          ctx.fillRect(screenX + 4, screenY + 8, tile - 8, 8);

          ctx.fillStyle = '#FFD700';
          ctx.fillRect(screenX + tile / 2 - 2, screenY + 14, 4, 6);

          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(screenX + tile / 2, screenY + 17, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  drawItems(ctx, canvas, camera, gameState) {
    const tile = this.tileSize;
    
    if (gameState && gameState.gameItems) {
      for (const [itemId, itemData] of Object.entries(gameState.gameItems)) {
        if (!itemData.collected) {
          const screenX = itemData.x - camera.x;
          const screenY = itemData.y - camera.y;

          if (screenX > -tile && screenX < canvas.width &&
              screenY > -tile && screenY < canvas.height) {

            ctx.fillStyle = '#FFD700';
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10;

            ctx.beginPath();
            ctx.arc(screenX + tile/2, screenY + tile/2, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(itemId, screenX + tile/2, screenY - 8);
          }
        }
      }
    }
  }

  drawNPCs(ctx, canvas, camera, npcs, sprites) {
    const tile = this.tileSize;
    
    if (Array.isArray(npcs)) {
      for (const npc of npcs) {
        if (!npc || !npc.position) continue;
        const screenX = npc.position.x - camera.x;
        const screenY = npc.position.y - camera.y;

        if (screenX > -tile && screenX < canvas.width &&
            screenY > -tile && screenY < canvas.height) {
          const frame = 0;
          const dirRow = 0;
          const sprite = sprites && sprites.npcs && sprites.npcs[npc.id];
          if (sprite) {
            ctx.drawImage(
              sprite,
              frame * tile, dirRow * tile, tile, tile,
              screenX, screenY, tile, tile
            );
          } else {
            ctx.fillStyle = npc.color || '#888';
            ctx.fillRect(screenX, screenY, tile, tile);
          }

          ctx.fillStyle = npc.color || '#fff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(npc.name || npc.id, screenX + (tile / 2), screenY - 5);
        }
      }
    }
  }

  drawAgents(ctx, canvas, camera, agents, sprites) {
    const tile = this.tileSize;
    
    for (const agent of agents) {
      if (!agent.defeated) {
        const screenX = agent.x - camera.x;
        const screenY = agent.y - camera.y;

        if (screenX > -tile && screenX < canvas.width &&
            screenY > -tile && screenY < canvas.height) {

          const frame = agent.animationFrame || 0;
          const dirRow = agent.direction === 'down' ? 0 :
                         agent.direction === 'left' ? 1 :
                         agent.direction === 'right' ? 2 : 3;

          const agentSprite = sprites && sprites.characters && sprites.characters['opal'];

          if (agentSprite) {
            ctx.save();
            ctx.filter = 'brightness(0)';
            ctx.drawImage(
              agentSprite,
              frame * tile, dirRow * tile, tile, tile,
              screenX, screenY, tile, tile
            );
            ctx.restore();
          } else {
            ctx.fillStyle = '#000000';
            ctx.fillRect(screenX, screenY, tile, tile);
          }

          if (agent.alerted) {
            ctx.save();
            ctx.fillStyle = '#ff0000';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            const alertX = screenX + tile / 2;
            const alertY = screenY - 5;
            ctx.strokeText('!', alertX, alertY);
            ctx.fillText('!', alertX, alertY);
            ctx.restore();
          }

          if (agent.chasing) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX - 2, screenY - 2, tile + 4, tile + 4);
          }

          const centerX = screenX + tile / 2;
          const centerY = screenY + tile / 2;
          const visionLength = agent.detectionRange * tile;
          ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();

          switch (agent.direction) {
            case 'up':
              ctx.moveTo(centerX, centerY);
              ctx.lineTo(centerX - 8, centerY - visionLength);
              ctx.lineTo(centerX + 8, centerY - visionLength);
              break;
            case 'down':
              ctx.moveTo(centerX, centerY);
              ctx.lineTo(centerX - 8, centerY + visionLength);
              ctx.lineTo(centerX + 8, centerY + visionLength);
              break;
            case 'left':
              ctx.moveTo(centerX, centerY);
              ctx.lineTo(centerX - visionLength, centerY - 8);
              ctx.lineTo(centerX - visionLength, centerY + 8);
              break;
            case 'right':
              ctx.moveTo(centerX, centerY);
              ctx.lineTo(centerX + visionLength, centerY - 8);
              ctx.lineTo(centerX + visionLength, centerY + 8);
              break;
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    }
  }

  drawPlayer(ctx, canvas, camera, player, sprites, gameState) {
    const tile = this.tileSize;
    const currentChar = gameState.getCurrentCharacter();
    const playerScreenX = player.x - camera.x;
    const playerScreenY = player.y - camera.y;

    const playerFrame = (typeof player.animationFrame === 'number') ? player.animationFrame : 0;
    const playerDirRow = player.direction === 'down' ? 0 :
                         player.direction === 'left' ? 1 :
                         player.direction === 'right' ? 2 : 3;
    const charSprite = sprites && sprites.characters && sprites.characters[currentChar.id];
    if (charSprite) {
      ctx.drawImage(
        charSprite,
        playerFrame * tile, playerDirRow * tile, tile, tile,
        playerScreenX, playerScreenY, tile, tile
      );
    } else {
      ctx.fillStyle = currentChar.color || '#fff';
      ctx.fillRect(playerScreenX, playerScreenY, tile, tile);
    }

    ctx.fillStyle = currentChar.color || '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(currentChar.name, playerScreenX + (tile / 2), playerScreenY - 5);
  }

  drawFloatingTexts(ctx, canvas, camera, floatingTexts) {
    if (floatingTexts && floatingTexts.length > 0) {
      ctx.save();
      for (const text of floatingTexts) {
        ctx.globalAlpha = text.alpha;
        ctx.fillStyle = text.color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        const screenX = text.x - camera.x;
        const screenY = text.y - camera.y;
        ctx.fillText(text.text, screenX, screenY);
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  drawHumanFrame(ctx, x, y, size, color, direction, frame) {
    ctx.clearRect(x, y, size, size);

    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(x + size/2, y + size - 4, size/3, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    const headR = 5;
    const bodyH = 12;
    const bodyW = 8;
    const centerX = x + size/2;
    const baseY = y + size/2;

    const swing = (frame === 0 || frame === 2) ? 2 : -2;

    ctx.fillStyle = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(centerX, baseY - 10, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.fillRect(centerX - bodyW/2, baseY - bodyH/2, bodyW, bodyH);
    ctx.strokeRect(centerX - bodyW/2, baseY - bodyH/2, bodyW, bodyH);

    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(centerX - bodyW/2, baseY - bodyH/2 + 3);
    ctx.lineTo(centerX - bodyW/2 - 6, baseY - bodyH/2 + 3 + (direction === 1 ? swing : direction === 2 ? -swing : swing));
    ctx.moveTo(centerX + bodyW/2, baseY - bodyH/2 + 3);
    ctx.lineTo(centerX + bodyW/2 + 6, baseY - bodyH/2 + 3 + (direction === 1 ? -swing : direction === 2 ? swing : -swing));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX - 3, baseY + bodyH/2);
    ctx.lineTo(centerX - 3 + (direction === 1 ? -swing : direction === 2 ? swing : -swing), baseY + bodyH/2 + 8);
    ctx.moveTo(centerX + 3, baseY + bodyH/2);
    ctx.lineTo(centerX + 3 + (direction === 1 ? swing : direction === 2 ? -swing : swing), baseY + bodyH/2 + 8);
    ctx.stroke();

    ctx.fillStyle = '#000';
    if (direction === 0) {
      ctx.fillRect(centerX - 3, baseY - 12, 2, 2);
      ctx.fillRect(centerX + 1, baseY - 12, 2, 2);
    } else if (direction === 3) {
      ctx.fillRect(centerX - 3, baseY - 12, 2, 2);
      ctx.fillRect(centerX + 1, baseY - 12, 2, 2);
    } else if (direction === 1) {
      ctx.fillRect(centerX - 4, baseY - 12, 2, 2);
    } else if (direction === 2) {
      ctx.fillRect(centerX + 2, baseY - 12, 2, 2);
    }
  }
}
