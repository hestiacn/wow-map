const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class TileGenerator {
  constructor(inputMapPath, outputDir) {
    this.inputMapPath = inputMapPath;
    this.outputDir = outputDir;
    this.tileSize = 512;
  }

  async generateTilesForRegion(regionId, bounds) {
    const regionDir = path.join(this.outputDir, regionId);
    
    if (!fs.existsSync(regionDir)) {
      fs.mkdirSync(regionDir, { recursive: true });
    }

    const cols = Math.ceil(bounds.width / this.tileSize);
    const rows = Math.ceil(bounds.height / this.tileSize);

    console.log(`Generating tiles for ${regionId}: ${cols}x${rows} tiles`);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = bounds.x + col * this.tileSize;
        const y = bounds.y + row * this.tileSize;
        
        const tileWidth = Math.min(this.tileSize, bounds.width - col * this.tileSize);
        const tileHeight = Math.min(this.tileSize, bounds.height - row * this.tileSize);

        const outputPath = path.join(regionDir, `${row}_${col}.webp`);

        try {
          await sharp(this.inputMapPath)
            .extract({ 
              left: x, 
              top: y, 
              width: tileWidth, 
              height: tileHeight 
            })
            .webp({ quality: 85 })
            .toFile(outputPath);

          console.log(`Generated: ${regionId}/${row}_${col}.webp`);
        } catch (error) {
          console.error(`Failed to generate ${outputPath}:`, error);
        }
      }
    }
  }

  async generateAllTiles(regions) {
    for (const [regionId, config] of Object.entries(regions)) {
      await this.generateTilesForRegion(regionId, config.bounds);
    }
    console.log('All tiles generated successfully!');
  }
}

// 使用示例
const regions = {
  'eastern-kingdoms': { bounds: { x: 4000, y: 0, width: 4000, height: 4500 } },
  'kalimdor': { bounds: { x: 0, y: 0, width: 4000, height: 4500 } },
  'Theramore': { bounds: { x: 2600, y: 3000, width: 1792, height: 1280 } }
};

const generator = new TileGenerator(
  './docs/public/images/maps/fullmap.webp',
  './docs/public/images/maps/tiles'
);

generator.generateAllTiles(regions).catch(console.error);