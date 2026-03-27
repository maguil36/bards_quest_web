class BitmapFontRenderer {
  constructor(config = {}) {
    this.config = {
      fontFamily: config.fontFamily || '"Courier New", monospace',
      fontWeight: config.fontWeight || '400',
      baseFontSize: config.baseFontSize || 14,
      scale: config.scale || 1,
      opacityThreshold: config.opacityThreshold || 65
    };

    this.fontCache = null;
    this.clearCache();
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  clearCache() {
    this.fontCache = null;
  }

  hasStrongNeighborPixel(data, width, height, x, y, threshold) {
    const directions = [
      [-1, -1], [0, -1], [1, -1],
      [-1,  0],          [1,  0],
      [-1,  1], [0,  1], [1,  1]
    ];

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = (ny * width + nx) * 4;
        if (data[nIdx + 3] >= threshold) {
          return true;
        }
      }
    }

    return false;
  }

  generateBitmapFont(dilate = false, customFontSize = null) {
    const fontSize = customFontSize || this.config.baseFontSize;
    const cacheKey = `${dilate ? 'dilated' : 'normal'}_${fontSize}_${this.config.opacityThreshold}_${this.config.removeIsolatedPixels}_${this.config.minNeighbors}`;
    if (this.fontCache && this.fontCache[cacheKey]) return this.fontCache[cacheKey];

    if (!this.fontCache) this.fontCache = {};

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!?.:,\'-() 0123456789';
    const cache = {};

    chars.split('').forEach(char => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      ctx.font = `${this.config.fontWeight} ${fontSize}px ${this.config.fontFamily}`;
      const metrics = ctx.measureText(char);
      const charWidth = Math.ceil(metrics.width) + 2;

      canvas.width = charWidth;
      canvas.height = fontSize + 2;

      ctx.imageSmoothingEnabled = false;
      ctx.font = `${this.config.fontWeight} ${fontSize}px ${this.config.fontFamily}`;
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(char, 1, 1);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];

        if (alpha < this.config.opacityThreshold) {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 0;
        } else {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 255;
        }
      }

      if (this.config.removeIsolatedPixels) {
        const pixelData = new Uint8Array(width * height);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            pixelData[y * width + x] = data[idx + 3] > 0 ? 1 : 0;
          }
        }

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            if (data[idx + 3] === 0) continue;

            let neighborCount = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  if (pixelData[ny * width + nx] === 1) {
                    neighborCount++;
                  }
                }
              }
            }

            if (neighborCount < this.config.minNeighbors) {
              data[idx] = 0;
              data[idx + 1] = 0;
              data[idx + 2] = 0;
              data[idx + 3] = 0;
            }
          }
        }
      }

      if (dilate) {
        const dilatedData = this.dilatePixels(data, canvas.width, canvas.height);
        ctx.putImageData(dilatedData, 0, 0);
      } else {
        ctx.putImageData(imageData, 0, 0);
      }

      cache[char] = canvas;
    });

    this.fontCache[cacheKey] = cache;
    return cache;
  }

  dilatePixels(data, width, height) {
    const newData = new ImageData(width, height);
    const sourceData = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        if (sourceData[idx + 3] > 0) {
          newData.data[idx] = sourceData[idx];
          newData.data[idx + 1] = sourceData[idx + 1];
          newData.data[idx + 2] = sourceData[idx + 2];
          newData.data[idx + 3] = sourceData[idx + 3];
        } else {
          let hasNeighbor = false;

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;

              const nx = x + dx;
              const ny = y + dy;

              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nidx = (ny * width + nx) * 4;
                if (sourceData[nidx + 3] > 0) {
                  hasNeighbor = true;
                  break;
                }
              }
            }
            if (hasNeighbor) break;
          }

          if (hasNeighbor) {
            newData.data[idx] = 255;
            newData.data[idx + 1] = 255;
            newData.data[idx + 2] = 255;
            newData.data[idx + 3] = 255;
          }
        }
      }
    }

    return newData;
  }

  renderText(text, color = '#fff', bgColor = null, shadowColor = null, shadowOffset = 1, scale = null, dilate = false, customFontSize = null) {
    const bitmapFont = this.generateBitmapFont(dilate, customFontSize);

    let totalWidth = 0;
    const charData = [];

    text.toUpperCase().split('').forEach(char => {
      const charCanvas = bitmapFont[char] || bitmapFont[' '];
      charData.push({
        canvas: charCanvas,
        x: totalWidth
      });
      totalWidth += charCanvas.width;
    });

    const fontSize = customFontSize || this.config.baseFontSize;
    const offset = shadowColor ? shadowOffset : 0;
    const canvas = document.createElement('canvas');
    canvas.width = totalWidth + offset;
    canvas.height = fontSize + 2 + offset;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingEnabled = false;

    if (bgColor) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    charData.forEach(({ canvas: charCanvas, x }) => {
      if (shadowColor) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = charCanvas.width;
        tempCanvas.height = charCanvas.height;
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        tempCtx.imageSmoothingEnabled = false;

        tempCtx.fillStyle = shadowColor;
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.globalCompositeOperation = 'destination-in';
        tempCtx.drawImage(charCanvas, 0, 0);

        ctx.drawImage(tempCanvas, x + shadowOffset, shadowOffset);
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = charCanvas.width;
      tempCanvas.height = charCanvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.imageSmoothingEnabled = false;

      tempCtx.fillStyle = color;
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.globalCompositeOperation = 'destination-in';
      tempCtx.drawImage(charCanvas, 0, 0);

      ctx.drawImage(tempCanvas, x, 0);
    });

    const finalScale = scale !== null ? scale : this.config.scale;

    canvas.style.cssText = `
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: crisp-edges;
      width: ${canvas.width * finalScale}px;
      height: ${canvas.height * finalScale}px;
      transform-origin: top left;
    `;

    return canvas;
  }
}
