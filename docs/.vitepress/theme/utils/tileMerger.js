// 瓦片地图整合工具
export class TileMerger {
  constructor(regionsData) {
    this.regions = regionsData;
  }

  // 生成完整地图的瓦片配置
  generateFullMapTiles() {
    const tiles = [];
    const fullMapWidth = 8000;
    const fullMapHeight = 4500;
    const tileSize = 512;

    const cols = Math.ceil(fullMapWidth / tileSize);
    const rows = Math.ceil(fullMapHeight / tileSize);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tile = {
          row,
          col,
          x: col * tileSize,
          y: row * tileSize,
          width: Math.min(tileSize, fullMapWidth - col * tileSize),
          height: Math.min(tileSize, fullMapHeight - row * tileSize)
        };

        // 确定瓦片属于哪个区域
        tile.region = this.getTileRegion(tile);
        tiles.push(tile);
      }
    }

    return tiles;
  }

  // 确定瓦片属于哪个区域
  getTileRegion(tile) {
    const tileCenter = {
      x: tile.x + tile.width / 2,
      y: tile.y + tile.height / 2
    };

    for (const [regionId, region] of Object.entries(this.regions)) {
      if (this.isPointInRegion(tileCenter, region.bounds)) {
        return regionId;
      }
    }

    return 'unknown';
  }

  isPointInRegion(point, regionBounds) {
    return point.x >= regionBounds.x && 
           point.x <= regionBounds.x + regionBounds.width &&
           point.y >= regionBounds.y && 
           point.y <= regionBounds.y + regionBounds.height;
  }

  // 获取瓦片的URL
  getTileUrl(regionId, row, col) {
    return `/images/maps/tiles/${regionId}/${row}_${col}.webp`;
  }

  // 异步加载瓦片
  loadTile(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load tile: ${url}`));
      img.src = url;
    });
  }

  // 合并瓦片到完整地图
  async mergeTilesToFullMap(tiles, canvas) {
    const ctx = canvas.getContext('2d');
    
    for (const tile of tiles) {
      try {
        const tileUrl = this.getTileUrl(tile.region, tile.row, tile.col);
        const tileImage = await this.loadTile(tileUrl);
        
        ctx.drawImage(
          tileImage,
          tile.x, tile.y,
          tile.width, tile.height
        );
        
        console.log(`Loaded tile: ${tile.region}/${tile.row}_${tile.col}`);
      } catch (error) {
        console.warn(`Failed to load tile: ${tile.region}/${tile.row}_${tile.col}`, error);
        // 绘制占位符
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(tile.x, tile.y, tile.width, tile.height);
        ctx.strokeStyle = '#999999';
        ctx.strokeRect(tile.x, tile.y, tile.width, tile.height);
      }
    }
  }
}