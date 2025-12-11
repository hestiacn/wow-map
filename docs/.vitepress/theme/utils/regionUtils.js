export class RegionUtils {
  static isPointInRegion(point, regionBounds) {
    return point.x >= regionBounds.x && 
           point.x <= regionBounds.x + regionBounds.width &&
           point.y >= regionBounds.y && 
           point.y <= regionBounds.y + regionBounds.height;
  }

  static toRegionCoordinates(point, regionBounds) {
    return {
      x: point.x - regionBounds.x,
      y: point.y - regionBounds.y
    };
  }

  static toCanvasCoordinates(point, regionBounds, canvasSize) {
    return {
      x: (point.x - regionBounds.x) / regionBounds.width * canvasSize.width,
      y: (point.y - regionBounds.y) / regionBounds.height * canvasSize.height
    };
  }

  static getPointsInRegion(points, regionId, regionBounds) {
    return points.filter(point => {
      if (point.region !== regionId) return false;
      return this.isPointInRegion(point.position, regionBounds);
    });
  }

  static getConnectedPoints(point, allPoints) {
    if (!point.connections || !Array.isArray(point.connections)) return [];
    
    return point.connections
      .map(connectionId => {
        const connectedPoint = allPoints.find(p => 
          p.id.toLowerCase() === connectionId.toLowerCase()
        );
        
        if (!connectedPoint) return null;
        
        if (point.type === 'ship' || point.type === 'zeppelin' || point.type === 'special') {
          return connectedPoint;
        }
        
        const isFactionCompatible = 
          point.faction === connectedPoint.faction || 
          point.faction === 'neutral' || 
          connectedPoint.faction === 'neutral';
        
        return isFactionCompatible ? connectedPoint : null;
      })
      .filter(Boolean);
  }

  static getConnectionType(pointA, pointB) {
    if (pointA.type === 'ship' && pointB.type === 'ship') return 'ship';
    if (pointA.type === 'zeppelin' && pointB.type === 'zeppelin') return 'zeppelin';
    if (pointA.type === 'special' && pointB.type === 'special') return 'special';
    
    return 'flight';
  }

  static exportData(data, filename = 'map-data.json') {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error('无效的JSON文件'));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  }

  static generateId() {
    return `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static validatePoint(point) {
    if (!point.name || !point.name.zh) {
      throw new Error('标记点必须包含中文名称');
    }
    if (!point.position || typeof point.position.x !== 'number' || typeof point.position.y !== 'number') {
      throw new Error('标记点必须包含有效的坐标位置');
    }
    return true;
  }
}