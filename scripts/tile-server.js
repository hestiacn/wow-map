import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.static(path.join(__dirname, '../docs/.vitepress/public')));

app.get('/tiles/:z/:x/:y.png', (req, res) => {
  const { z, x, y } = req.params;
  const tilePath = path.join(__dirname, '../docs/.vitepress/public/tiles', z, x, `${y}.png`);
  
  res.set({
    'Content-Type': 'image/png',
    'Cache-Control': 'public, max-age=3600'
  });
  
  res.sendFile(tilePath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Tile not found' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`🗺️ 瓦片服务器运行在: http://localhost:${PORT}`);
});