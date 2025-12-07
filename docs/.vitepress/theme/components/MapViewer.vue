<style src="@theme/styles/map.css"></style>
<template>
  <div class="map-viewer">
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="control-group">
        <label>地图选择:</label>
        <select v-model="currentRegion" @change="loadMap">
          <option value="full">完整地图</option>
          <option v-for="region in regions" :key="region.id" :value="region.id">
            {{ region.name[currentLanguage] }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <label>语言:</label>
        <select v-model="currentLanguage" @change="updateDisplay">
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </div>

      <!-- 视图控制 -->
      <div class="control-group">
        <button @click="zoomIn" class="btn-secondary" title="放大">+</button>
        <button @click="zoomOut" class="btn-secondary" title="缩小">-</button>
        <button @click="resetView" class="btn-secondary" title="重置视图">↺</button>
        <span class="zoom-level">{{ Math.round(viewport.scale * 100) }}%</span>
      </div>

      <div class="control-group">
        <label><input type="checkbox" v-model="showFlightPaths" @change="updateDisplay" />飞行路线</label>
        <label><input type="checkbox" v-model="showPoints" @change="updateDisplay" checked />标记点</label>
        <label><input type="checkbox" v-model="showDungeons" @change="updateDisplay" checked />副本</label>
        <label><input type="checkbox" v-model="showRegionTexts" @change="updateDisplay" checked />区域名称</label>
        <label><input type="checkbox" v-model="showTransport" @change="updateDisplay" checked />交通系统</label>
        <label><input type="checkbox" v-model="showTransportRoutes" @change="updateDisplay" checked />交通路线</label>
      </div>

      <div class="control-group">
        <button @click="toggleAddMarkerMode" 
                :class="{ active: addMarkerMode }" class="btn-primary">
          {{ addMarkerMode ? '取消标注' : '添加标记' }}
        </button>
        <button @click="showAddRegionDialog" class="btn-primary">添加区域</button>
        <button @click="exportData" class="btn-secondary">导出数据</button>
        <button @click="exportImage" class="btn-secondary">导出图片</button>
        <input type="file" @change="importData" accept=".json" style="display: none" ref="fileInput">
        <button @click="triggerFileInput" class="btn-secondary">导入数据</button>
        <button @click="refreshMap" class="btn-secondary" title="刷新地图数据">刷新</button>
        <button @click="showHelpDialog = true" class="btn-secondary">使用说明</button>
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="map-container" ref="mapContainer">
      <canvas 
        ref="mapCanvas" 
        :width="canvasWidth" 
        :height="canvasHeight"
        @mousedown="startDrag"
        @mousemove="handleMouseMove"
        @mouseup="endDrag"
        @mouseleave="endDrag"
        @wheel="handleWheel"
        @click="handleMapClick"
      ></canvas>
      
      <!-- 添加标记提示 -->
      <div v-if="addMarkerMode" class="add-marker-hint">
        <div class="hint-content">
          <span class="hint-icon">📍</span>
          <span>点击地图添加标记点</span>
        </div>
      </div>

      <!-- 区域放置提示 -->
      <div v-if="placingRegion" class="region-placement-hint">
        <div class="hint-content">
          <span class="hint-icon">🗺️</span>
          <span v-if="!isPlacingRegion">点击地图确定区域左上角位置</span>
          <span v-else>
            {{ getPlacementHint() }}
          </span>
          <div class="placement-controls" v-if="showRegionAdjustmentControls">
            <button @click="confirmRegionAdjustment" class="btn-primary" 
                    :disabled="!regionPlacement.width || !regionPlacement.height">
              确认区域调整
            </button>
            <button @click="cancelRegionPlacement" class="btn-secondary">取消放置</button>
          </div>
        </div>
      </div>

      <!-- 区域大小调整控制 -->
      <div v-if="showRegionAdjustmentControls" class="region-size-controls">
        <div class="size-control-header">
          <h4>区域调整控制</h4>
          <button @click="showRegionAdjustmentControls = false" class="btn-small">隐藏</button>
        </div>
        
        <div class="size-control-group">
          <label>位置 X:</label>
          <input type="number" v-model.number="regionPlacement.x" class="size-input" step="10">
          <button @click="adjustRegionPosition('x', 10)" class="btn-small">+10</button>
          <button @click="adjustRegionPosition('x', -10)" class="btn-small">-10</button>
        </div>
        
        <div class="size-control-group">
          <label>位置 Y:</label>
          <input type="number" v-model.number="regionPlacement.y" class="size-input" step="10">
          <button @click="adjustRegionPosition('y', 10)" class="btn-small">+10</button>
          <button @click="adjustRegionPosition('y', -10)" class="btn-small">-10</button>
        </div>
        
        <div class="size-control-group">
          <label>宽度:</label>
          <input type="number" v-model.number="regionPlacement.width" min="100" step="50" class="size-input">
          <button @click="adjustRegionSize('width', 50)" class="btn-small">+50</button>
          <button @click="adjustRegionSize('width', -50)" class="btn-small">-50</button>
        </div>
        
        <div class="size-control-group">
          <label>高度:</label>
          <input type="number" v-model.number="regionPlacement.height" min="100" step="50" class="size-input">
          <button @click="adjustRegionSize('height', 50)" class="btn-small">+50</button>
          <button @click="adjustRegionSize('height', -50)" class="btn-small">-50</button>
        </div>
        
        <div class="size-control-group">
          <label>保持比例:</label>
          <input type="checkbox" v-model="maintainAspectRatio">
          <span class="ratio-display" v-if="maintainAspectRatio">
            比例: {{ (regionImageSize.width / regionImageSize.height).toFixed(2) }}:1
          </span>
        </div>

        <div class="size-control-group">
          <label>操作提示:</label>
          <span class="hint-text">
            • 拖拽区域内部可移动位置<br>
            • 拖拽角点可调整大小<br>
            • Shift+拖拽可等比例缩放<br>
            • 使用输入框进行精确调整
          </span>
        </div>
      </div>

      <!-- 导航提示 -->
      <div class="navigation-hint">
        <div class="hint-item">🖱️ 滚轮缩放</div>
        <div class="hint-item">🖱️ 拖拽移动</div>
        <div class="hint-item" v-if="currentRegion === 'full' && viewport.scale > 1.5">🖱️ 点击添加区域</div>
        <div class="hint-item" v-if="isPlacingRegion">🖱️ 拖拽调整区域</div>
        <div class="hint-item" v-if="isPlacingRegion">⇧ Shift + 拖拽等比例缩放</div>
      </div>

      <!-- 坐标显示 -->
      <div class="coordinate-display" v-if="hoverPosition">
        坐标: ({{ Math.round(currentWorldCoords.x) }}, {{ Math.round(currentWorldCoords.y) }})
        <div v-if="isPlacingRegion">
          区域: {{ Math.round(regionPlacement.width) }} × {{ Math.round(regionPlacement.height) }}
        </div>
      </div>
    </div>

    <!-- 标记点信息面板 -->
    <div v-if="selectedPoint" class="point-panel">
      <div class="panel-header">
        <h3>{{ selectedPoint.name[currentLanguage] }}</h3>
        <button @click="selectedPoint = null" class="btn-close">×</button>
      </div>
      <div class="panel-content">
        <p><strong>类型:</strong> {{ getPointTypeName(selectedPoint.type) }}</p>
        
        <!-- 区域名称标注的特殊显示 -->
        <div v-if="selectedPoint.type === 'regionText'" class="region-text-info">
          <div class="form-group">
            <label>数据来源:</label>
            <span :class="selectedPoint.fromSubnames ? 'source-subnames' : 'source-main'">
              {{ selectedPoint.fromSubnames ? 'region-subnames.json' : 'map-data.json' }}
            </span>
          </div>
          
          <div class="form-group">
            <label>文本内容:</label>
            <div class="language-texts">
              <div v-for="(text, lang) in selectedPoint.languages" :key="lang" class="language-text-item">
                <span class="lang-label">{{ getLanguageName(lang) }}:</span>
                <span class="text-content">{{ text }}</span>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>文本颜色:</label>
            <div class="color-display">
              <span class="color-preview" :style="{ backgroundColor: selectedPoint.textColor }"></span>
              <span>{{ selectedPoint.textColor.toUpperCase() }}</span>
            </div>
          </div>
          
          <div class="form-group">
            <label>字体大小:</label>
            <span>{{ selectedPoint.fontSize || 24 }}px</span>
          </div>
          
          <!-- 保存提示 -->
          <div v-if="!selectedPoint.fromSubnames" class="save-hint">
            <div class="hint-icon">💡</div>
            <div class="hint-content">
              <p><strong>重要提示:</strong> 请将此区域名称标注保存到以下文件：</p>
              <code>docs/public/data/region-subnames.json</code>
              <p>地图数据文件(map-data.json)只保存主城和地图块名称。</p>
            </div>
          </div>
          
          <!-- 如果来自 region-subnames.json 的提示 -->
          <div v-else class="save-hint success">
            <div class="hint-icon">✅</div>
            <div class="hint-content">
              <p><strong>数据来源:</strong> 此标注已保存在 region-subnames.json 文件中</p>
              <p>删除此标注会同时从内存数据中移除，请记得导出更新后的数据文件。</p>
            </div>
          </div>
        </div>
        
        <!-- 普通标记点的阵营显示 -->
        <p v-else><strong>阵营:</strong> {{ getFactionName(selectedPoint.faction) }}</p>
        
        <!-- 坐标显示和复制功能 -->
        <div class="position-group">
          <label class="section-label">📍 地图模块位置坐标 (JSON格式)</label>
          <div class="coordinate-display-group">
            <div class="coordinate-item">
              <div class="coordinate-content">
                <span class="coordinate-type">JSON数据请及时复制</span>
                <span class="coordinate-hint">完整坐标对象</span>
              </div>
              <CopyToClipboardInput 
                :value="selectedPointJson" 
                class="json-input"
              />
            </div>
          </div>
          <div class="coordinate-hint">
            <small>💡 复制坐标后，可添加到地图数据 public\data\map-data.json 文件中</small>
          </div>
        </div>
        
        <div v-if="selectedPoint.level" class="form-group">
          <label>等级:</label>
          <span>{{ selectedPoint.level }}</span>
        </div>
        
        <div class="panel-actions">
          <button @click="editPoint(selectedPoint)" class="btn-primary">编辑</button>
          <button @click="removePoint(selectedPoint)" class="btn-danger">删除</button>
        </div>
      </div>
    </div>

    <!-- 添加标记对话框 -->
    <div v-if="showAddDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>{{ editingPoint ? '编辑标记点' : '添加标记点' }}</h3>
        <div class="dialog-content">
          <div class="form-group">
            <label>名称:</label>//zhe
            <input v-model="newPoint.name.zh" placeholder="中文名称">
            <input v-model="newPoint.name.en" placeholder="英文名称">
          </div>
          <div class="form-group">//zhe
            <label>类型:</label>
            <select v-model="newPoint.type" @change="handleTypeChange">
              <option value="town">城镇</option>
              <option value="capital">主城</option>
              <option value="flightMaster">飞行点</option>
              <option value="dungeon">5人副本</option>
              <option value="raid">团队副本</option>
              <option value="ship">港口航线</option>
              <option value="zeppelin">飞艇航线</option>
              <option value="special">特殊交通</option>
              <option value="regionText">名称标注</option>
            </select>
          </div>
          
          <!-- 普通标记点的名称输入 -->
          <div class="form-group" v-if="newPoint.type !== 'regionText'">
            <label>名称:</label>
            <input v-model="newPoint.name.zh" placeholder="中文名称">
            <input v-model="newPoint.name.en" placeholder="英文名称">
          </div>
          
          <!-- 区域文本标注的多语言输入 -->
          <div class="form-group" v-if="newPoint.type === 'regionText'">
            <label class="section-label">🌐 区域名称标注 (多语言)</label>
            
            <!-- 文本颜色选择 -->
            <div class="form-group">
              <label>文本颜色:</label>
              <div class="color-picker-group">
                <input type="color" v-model="newPoint.textColor" class="color-picker">
                <span class="color-preview" :style="{ backgroundColor: newPoint.textColor }"></span>
                <span>{{ newPoint.textColor.toUpperCase() }}</span>
              </div>
            </div>
            
            <!-- 字体大小选择 -->
            <div class="form-group">
              <label>字体大小:</label>
              <select v-model="newPoint.fontSize">
                <option value="18">小 (18px)</option>
                <option value="24">中 (24px)</option>
                <option value="30">大 (30px)</option>
                <option value="36">特大 (36px)</option>
                <option value="42">超大 (42px)</option>
                <option value="48">巨型 (48px)</option>
              </select>
            </div>
            
            <div class="language-inputs">
              <div class="language-input-group">
                <label>中文:</label>
                <input v-model="newPoint.languages.zh" placeholder="中文区域名称">
              </div>
              <div class="language-input-group">
                <label>英文:</label>
                <input v-model="newPoint.languages.en" placeholder="English region name">
              </div>
              <div class="language-input-group">
                <label>韩文:</label>
                <input v-model="newPoint.languages.ko" placeholder="한국어 지역 이름">
              </div>
              <div class="language-input-group">
                <label>日文:</label>
                <input v-model="newPoint.languages.ja" placeholder="日本語の地域名">
              </div>
            </div>
            
            <!-- 保存提示 -->
            <div class="save-instruction">
              <div class="instruction-header">💡 保存说明</div>
              <div class="instruction-content">
                <p>此区域名称标注需要保存到单独的文件：</p>
                <code>docs/public/data/region-subnames.json</code>
                <p>地图数据文件(map-data.json)只保存主城和地图块名称。</p>
              </div>
            </div>
          </div>
          
          <!-- 阵营选择（区域文本标注和交通点不需要阵营） -->
          <div class="form-group" v-if="newPoint.type !== 'regionText' && newPoint.type !== 'ship' && newPoint.type !== 'zeppelin' && newPoint.type !== 'special' && newPoint.type !== 'raid' && newPoint.type !== 'dungeon'">
            <label>阵营:</label>
            <select v-model="newPoint.faction">
              <option value="alliance">联盟</option>
              <option value="horde">部落</option>
              <option value="neutral">中立</option>
            </select>
          </div>
          
          <div class="form-group" v-if="newPoint.type === 'dungeon' || newPoint.type === 'raid'">
            <label>等级:</label>
            <input v-model="newPoint.level" placeholder="例如: 15-20 或 60(团队)">
          </div>
          
          <!-- 交通点说明 -->
          <div class="form-group" v-if="newPoint.type === 'ship' || newPoint.type === 'zeppelin' || newPoint.type === 'special'">
            <label>说明:</label>
            <input v-model="newPoint.note.zh" placeholder="中文说明">
            <input v-model="newPoint.note.en" placeholder="英文说明">
          </div>
          
          <!-- 坐标显示和复制功能 -->
          <div class="form-group">
            <label class="section-label">📍 地图模块位置坐标 (JSON格式)</label>
            <div class="coordinate-display-group">
              <div class="coordinate-item">
                <div class="coordinate-content">
                  <span class="coordinate-type">JSON数据请及时复制</span>
                  <span class="coordinate-hint">完整坐标对象</span>
                </div>
                <CopyToClipboardInput
                  :value="newPointJson"
                  class="json-input"
                />
              </div>
            </div>
            <div class="coordinate-hint">
              <small>复制坐标后，可添加到地图数据 public\data\map-data.json 文件中</small>
            </div>
          </div>
        </div>
        <div class="dialog-actions">
          <button @click="confirmAddPoint" class="btn-primary">确认</button>
          <button @click="cancelAddPoint" class="btn-secondary">取消</button>
        </div>
      </div>
    </div>

    <!-- 添加区域对话框 -->
    <div v-if="showRegionDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>添加区域地图</h3>
        <div class="dialog-content">
          <div class="form-group">
            <label>区域ID:</label>
            <input v-model="newRegion.id" placeholder="英文ID，如: Theramore">
            <small>只能使用英文、数字和连字符</small>
          </div>
          <div class="form-group">
            <label>区域名称:</label>
            <input v-model="newRegion.name.zh" placeholder="中文名称">
            <input v-model="newRegion.name.en" placeholder="英文名称">
          </div>
          <div class="form-group">
            <label>区域图片文件名:</label>
            <div class="file-input-group">
              <input v-model="newRegion.imageName" placeholder="例如: theramore.webp">
              <button @click="checkRegionImage" class="btn-secondary" :disabled="!newRegion.imageName">
                检查文件
              </button>
            </div>
            <div v-if="regionImageStatus" class="image-status" :class="regionImageStatus.type">
              {{ regionImageStatus.message }}
            </div>
            <div v-if="regionImageStatus && regionImageStatus.type === 'error'" class="directory-hint">
              <p><strong>请将文件放置在以下目录:</strong></p>
              <code>docs/public/images/maps/regions/</code>
              <p>文件名: <strong>{{ newRegion.imageName }}</strong></p>
            </div>
          </div>
          <div v-if="regionImagePreview" class="form-group">
            <label>图片预览:</label>
            <div class="image-preview">
              <img :src="regionImagePreview" alt="区域预览">
              <p>尺寸: {{ regionImageSize.width }} × {{ regionImageSize.height }} 像素</p>
            </div>
          </div>
        </div>
        <div class="dialog-actions">
          <button @click="startRegionPlacement" class="btn-primary" 
                  :disabled="!regionImagePreview">
            开始区域放置
          </button>
          <button @click="cancelAddRegion" class="btn-secondary">取消</button>
        </div>
      </div>
    </div>

    <!-- 区域放置确认对话框 -->
    <div v-if="showRegionPlacementConfirm" class="dialog-overlay">
      <div class="dialog">
        <h3>确认区域信息</h3>
        <div class="dialog-content">
          <div class="region-summary">
            <p><strong>区域名称:</strong> {{ newRegion.name.zh }}</p>
            <p><strong>区域ID:</strong> {{ newRegion.id }}</p>
            
            <!-- 区域坐标复制功能 -->
            <div class="position-group">
              <label class="section-label">📍 区域边界 (JSON格式)</label>
              <div class="coordinate-display-group">
                <div class="coordinate-item">
                  <div class="coordinate-content">
                    <span class="coordinate-type">边界 JSON</span>
                    <span class="coordinate-hint">完整边界对象</span>
                  </div>
                  <CopyToClipboardInput 
                    :value="regionBoundsJson" 
                    class="json-input"
                  />
                </div>
              </div>
              <div class="coordinate-hint">
                <small>💡 复制边界数据后，可添加到地图数据 JSON 文件中</small>
              </div>
            </div>
          </div>
          <div class="warning-message">
            <p>⚠️ 确认后将暂时保存区域信息到地图数据中，请记得及时导出数据</p>
          </div>
        </div>
        <div class="dialog-actions">
          <button @click="confirmRegionSave" class="btn-primary">确认保存</button>
          <button @click="showRegionPlacementConfirm = false" class="btn-secondary">继续编辑</button>
        </div>
      </div>
    </div>

    <!-- 四面调整控制面板 -->
    <div v-if="showRegionAdjustmentControls && isPlacingRegion" class="edge-adjustment-panel">
      <div class="panel-header">
        <h4>四面调整控制</h4>
        <button @click="showEdgeAdjustmentPanel = !showEdgeAdjustmentPanel" class="btn-small">
          {{ showEdgeAdjustmentPanel ? '隐藏' : '显示' }}
        </button>
      </div>
      
      <div v-if="showEdgeAdjustmentPanel" class="edge-controls">
        <!-- 上边调整 -->
        <div class="edge-control-group">
          <label class="edge-label">上边:</label>
          <div class="edge-controls-row">
            <button @click="adjustEdge('top', -10)" class="btn-edge" title="上移10px">↑</button>
            <input 
              type="number" 
              v-model.number="edgeAdjustment.top" 
              @change="applyEdgeAdjustment('top')"
              class="edge-input"
              placeholder="Y坐标"
            >
            <button @click="adjustEdge('top', 10)" class="btn-edge" title="下移10px">↓</button>
            <span class="edge-value">{{ Math.round(regionPlacement.y) }}</span>
          </div>
        </div>
        
        <!-- 下边调整 -->
        <div class="edge-control-group">
          <label class="edge-label">下边:</label>
          <div class="edge-controls-row">
            <button @click="adjustEdge('bottom', -10)" class="btn-edge" title="上移10px">↑</button>
            <input 
              type="number" 
              v-model.number="edgeAdjustment.bottom" 
              @change="applyEdgeAdjustment('bottom')"
              class="edge-input"
              placeholder="底部位置"
            >
            <button @click="adjustEdge('bottom', 10)" class="btn-edge" title="下移10px">↓</button>
            <span class="edge-value">{{ Math.round(regionPlacement.y + regionPlacement.height) }}</span>
          </div>
        </div>
        
        <!-- 左边调整 -->
        <div class="edge-control-group">
          <label class="edge-label">左边:</label>
          <div class="edge-controls-row">
            <button @click="adjustEdge('left', -10)" class="btn-edge" title="左移10px">←</button>
            <input 
              type="number" 
              v-model.number="edgeAdjustment.left" 
              @change="applyEdgeAdjustment('left')"
              class="edge-input"
              placeholder="X坐标"
            >
            <button @click="adjustEdge('left', 10)" class="btn-edge" title="右移10px">→</button>
            <span class="edge-value">{{ Math.round(regionPlacement.x) }}</span>
          </div>
        </div>
        
        <!-- 右边调整 -->
        <div class="edge-control-group">
          <label class="edge-label">右边:</label>
          <div class="edge-controls-row">
            <button @click="adjustEdge('right', -10)" class="btn-edge" title="左移10px">←</button>
            <input 
              type="number" 
              v-model.number="edgeAdjustment.right" 
              @change="applyEdgeAdjustment('right')"
              class="edge-input"
              placeholder="右边位置"
            >
            <button @click="adjustEdge('right', 10)" class="btn-edge" title="右移10px">→</button>
            <span class="edge-value">{{ Math.round(regionPlacement.x + regionPlacement.width) }}</span>
          </div>
        </div>
        
        <!-- 快速操作 -->
        <div class="quick-actions">
          <label>快速操作:</label>
          <div class="quick-buttons">
            <button @click="centerRegion" class="btn-small">居中区域</button>
            <button @click="fitToCanvas" class="btn-small">适应画布</button>
            <button @click="resetEdgeAdjustment" class="btn-small">重置调整</button>
          </div>
        </div>
        
        <!-- 尺寸信息 -->
        <div class="size-info">
          <p>当前尺寸: {{ Math.round(regionPlacement.width) }} × {{ Math.round(regionPlacement.height) }}</p>
          <p>位置: ({{ Math.round(regionPlacement.x) }}, {{ Math.round(regionPlacement.y) }})</p>
        </div>
      </div>
    </div>

    <!-- 使用说明对话框 -->
    <div v-if="showHelpDialog" class="dialog-overlay">
      <div class="dialog help-dialog">
        <h3>魔兽世界地图标注工具 - 使用说明</h3>
        <div class="dialog-content help-content">
          <div class="help-section">
            <h4>基本功能</h4>
            <ul>
              <li><strong>地图选择</strong>: 在顶部选择要查看的地图区域</li>
              <li><strong>语言切换</strong>: 支持中文和英文显示</li>
              <li><strong>显示控制</strong>: 可以切换显示飞行路线、标记点、副本、文本标注和交通系统</li>
              <li><strong>添加标记</strong>: 点击"添加标记"按钮后，在地图上点击即可添加新标记点</li>
              <li><strong>数据管理</strong>: 支持导出当前数据或导入外部数据文件</li>
            </ul>
          </div>

          <div class="help-section">
            <h4>标记点类型</h4>
            <div class="icon-list">
              <div class="icon-item">
                <img :src="iconImages.dungeon ? iconImages.dungeon.src : ''" alt="5人副本" class="icon-img" v-if="iconImages.dungeon">
                <span v-else class="icon">⚔️</span>
                <span><strong>5人副本</strong> - 5人地下城</span>
              </div>
              <div class="icon-item">
                <img :src="iconImages.raid ? iconImages.raid.src : ''" alt="团队副本" class="icon-img" v-if="iconImages.raid">
                <span v-else class="icon">🏰</span>
                <span><strong>团队副本</strong> - 团队地下城</span>
              </div>
              <div class="icon-item">
                <img :src="iconImages.ship ? iconImages.ship.src : ''" alt="联盟船坞" class="icon-img" v-if="iconImages.ship">
                <span v-else class="icon">🚢</span>
                <span><strong>港口航线</strong> - 轮船交通路线</span>
              </div>
              <div class="icon-item">
                <img :src="iconImages.zeppelin ? iconImages.zeppelin.src : ''" alt="部落飞艇" class="icon-img" v-if="iconImages.zeppelin">
                <span v-else class="icon">🚁</span>
                <span><strong>飞艇航线</strong> - 飞艇交通路线</span>
              </div>
              <div class="icon-item">
                <img :src="iconImages.special ? iconImages.special.src : ''" alt="地铁" class="icon-img" v-if="iconImages.special">
                <span v-else class="icon">🚇</span>
                <span><strong>特殊交通</strong> - 地铁等特殊路线</span>
              </div>
              <div class="icon-item">
                <span class="icon">🏠</span>
                <span><strong>城镇</strong> - 小型定居点</span>
              </div>
              <div class="icon-item">
                <span class="icon">✈️</span>
                <span><strong>飞行点</strong> - 飞行管理员位置</span>
              </div>
              <div class="icon-item">
                <span class="icon">📝</span>
                <span><strong>名称标注</strong> - 自定义文本说明</span>
              </div>
            </div>
          </div>

          <div class="help-section">
            <h4>操作快捷键</h4>
            <ul>
              <li><kbd>+</kbd> / <kbd>-</kbd>: 放大/缩小地图</li>
              <li><kbd>0</kbd>: 重置视图</li>
              <li><kbd>Esc</kbd>: 取消当前操作</li>
              <li><kbd>Shift</kbd> + 拖拽: 等比例调整区域大小</li>
              <li>鼠标滚轮: 缩放地图</li>
              <li>拖拽地图: 移动视图</li>
            </ul>
          </div>

          <div class="help-section">
            <h4>数据保存说明</h4>
            <ul>
              <li><strong>主城、城镇、飞行点、5人副本、团队副本、交通系统</strong>: 保存到 <code>map-data.json</code></li>
              <li><strong>区域名称标注</strong>: 保存到 <code>region-subnames.json</code></li>
              <li><strong>区域地图块</strong>: 保存到 <code>map-data.json</code> 的 regions 部分</li>
            </ul>
          </div>
        </div>
        <div class="dialog-actions">
          <button @click="showHelpDialog = false" class="btn-primary">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { RegionUtils } from '../utils/regionUtils.js';
import CopyToClipboardInput from './CopyToClipboardInput.vue';

export default {
  name: 'MapViewer',
  components: {CopyToClipboardInput},
  data() {
    return {
      mapData: null,
      regionSubnames: [],
      currentRegion: 'full',
      currentLanguage: 'zh',
      showFlightPaths: true,
      showPoints: true,
      showDungeons: true,
      showRegionTexts: true,
      showTransport: true,
      addMarkerMode: false,
      showTransportRoutes: true,
      selectedPoint: null,
      showAddDialog: false,
      showRegionDialog: false,
      exportInProgress: false,
      regionImageCache: {},
      showRegionPlacementConfirm: false,
      showHelpDialog: false,
      editingPoint: null,
      newPoint: this.getDefaultNewPoint(),
      newRegion: this.getDefaultNewRegion(),
      canvas: null,
      ctx: null,
      mapImage: null,
      hoverPosition: null,
      hoverPoint: null,
      dataLoaded: false,
      currentWorldCoords: { x: 0, y: 0 },
      regionAdjustmentStage: false,
      showRegionAdjustmentControls: false,
      
      // 图标图片定义
      iconImages: {
        zeppelin: null,  // 部落飞艇
        ship: null,      // 联盟船坞
        special: null,   // 地铁
        dungeon: null,   // 5人副本
        raid: null       // 团队副本
      },
      iconsLoaded: false,
      
      // 固定图标大小
      iconSize: 32,
      
      // 视图控制状态
      viewport: {
        scale: 1.0,
        offsetX: 0,
        offsetY: 0
      },
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      lastOffset: { x: 0, y: 0 },
      
      // 区域添加状态
      regionImageStatus: null,
      regionImagePreview: null,
      regionImageSize: { width: 0, height: 0 },
      placingRegion: false,
      regionPlacement: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      isPlacingRegion: false,
      tempRegionImage: null,
      
      // 区域放置交互状态
      regionResizeHandle: null,
      resizeStart: { x: 0, y: 0 },
      regionMoveStart: { x: 0, y: 0 },
      isMovingRegion: false,
      
      // 键盘状态
      shiftPressed: false,
      
      // 区域调整状态
      maintainAspectRatio: false,
      originalRegionSize: { width: 0, height: 0 },
      originalRegionPosition: { x: 0, y: 0 },

      // 四面调整控制
      showEdgeAdjustmentPanel: false,
      edgeAdjustment: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    };
  },
  computed: {
    regions() {
      if (!this.mapData?.regions) return [];
      return Object.entries(this.mapData.regions).map(([id, config]) => ({
        id,
        ...config
      }));
    },
    canvasWidth() {
      if (this.currentRegion === 'full') {
        return this.mapData?.config?.fullMapSize?.width || 9440;
      }
      return this.mapData?.regions[this.currentRegion]?.canvasSize?.width || 4000;
    },
    canvasHeight() {
      if (this.currentRegion === 'full') {
        return this.mapData?.config?.fullMapSize?.height || 7928;
      }
      return this.mapData?.regions[this.currentRegion]?.canvasSize?.height || 4500;
    },
    allPoints() {
      if (!this.mapData?.points) return [];
      
      const points = [];
      
      // 添加飞行点（包括交通点）
      if (this.showPoints) {
        points.push(...(this.mapData.points.flightPoints || []));
        
        // 添加区域文本标注
        if (this.showRegionTexts && this.mapData.points.regionTexts) {
          points.push(...this.mapData.points.regionTexts);
        }
      }
      
      // 添加副本
      if (this.showDungeons) {
        points.push(...(this.mapData.points.dungeons || []));
      }
      
      return points;
    },
    currentPoints() {
      if (this.currentRegion === 'full') {
        return this.allPoints;
      }
      
      const region = this.mapData?.regions[this.currentRegion];
      if (!region) return [];
      
      return this.allPoints.filter(point => {
        // 对于完整地图上的点，检查是否在当前区域内
        if (point.region && point.region !== this.currentRegion) return false;
        
        return RegionUtils.isPointInRegion(point.position, region.bounds);
      });
    },
    // 专门获取交通点（轮船、飞艇、地铁）
    transportPoints() {
      return this.allPoints.filter(point => 
        point.type === 'ship' || point.type === 'zeppelin' || point.type === 'special'
      );
    },
    // 获取飞行点（排除交通点）
    flightMasterPoints() {
      return this.allPoints.filter(point => 
        point.type === 'flightMaster' || point.type === 'capital' || point.type === 'town'
      );
    },
    currentPoints() {
      if (this.currentRegion === 'full') {
        return this.allPoints;
      }
      
      const region = this.mapData?.regions[this.currentRegion];
      if (!region) return [];
      
      return this.allPoints.filter(point => {
        if (point.region !== this.currentRegion) return false;
        return point.position.x >= region.bounds.x && 
              point.position.x <= region.bounds.x + region.bounds.width &&
              point.position.y >= region.bounds.y && 
              point.position.y <= region.bounds.y + region.bounds.height;
      });
    },
    selectedPointJson() {
      if (!this.selectedPoint) return '';
      return JSON.stringify({
        x: Math.round(this.selectedPoint.position.x),
        y: Math.round(this.selectedPoint.position.y)
      }, null, 2);
    },
    
    newPointJson() {
      return JSON.stringify({
        x: Math.round(this.newPoint.position.x),
        y: Math.round(this.newPoint.position.y)
      }, null, 2);
    },
    
    regionBoundsJson() {
      return JSON.stringify({
        x: Math.round(this.regionPlacement.x),
        y: Math.round(this.regionPlacement.y),
        width: Math.round(this.regionPlacement.width),
        height: Math.round(this.regionPlacement.height)
      }, null, 2);
    }
  },
  async mounted() {
    await this.loadMapData();
    this.initCanvas();
    this.loadMap();
    this.setupEventListeners();
    await this.loadIcons(); // 加载图标图片
  },
  beforeUnmount() {
    this.removeEventListeners();
  },
  methods: {
    setupEventListeners() {
      document.addEventListener('keydown', this.handleKeyDown);
      document.addEventListener('keyup', this.handleKeyUp);
    },
    
    removeEventListeners() {
      document.removeEventListener('keydown', this.handleKeyDown);
      document.removeEventListener('keyup', this.handleKeyUp);
    },
    
    handleKeyDown(event) {
      if (event.target.tagName === 'INPUT') return;
      
      switch(event.key) {
        case '+':
        case '=':
          event.preventDefault();
          this.zoomIn();
          break;
        case '-':
          event.preventDefault();
          this.zoomOut();
          break;
        case '0':
          event.preventDefault();
          this.resetView();
          break;
        case 'Escape':
          if (this.placingRegion) {
            this.cancelRegionPlacement();
          } else {
            this.addMarkerMode = false;
            this.selectedPoint = null;
          }
          break;
        case 'Shift':
          this.shiftPressed = true;
          break;
      }
    },
    
    handleKeyUp(event) {
      if (event.key === 'Shift') {
        this.shiftPressed = false;
      }
    },
    
    getPlacementHint() {
      if (this.isMovingRegion) {
        return '拖拽移动区域位置';
      } else if (this.regionResizeHandle) {
        return this.shiftPressed ? '拖拽等比例调整区域大小' : '拖拽调整区域大小';
      } else {
        return '拖拽调整区域大小，拖拽内部可移动位置';
      }
    },
    
    zoomIn() {
      this.zoomAt(1.2);
    },
    
    zoomOut() {
      this.zoomAt(0.8);
    },
    
    zoomAt(zoomFactor) {
      if (!this.hoverPosition) return;
      
      const worldBeforeZoom = this.screenToWorld(this.hoverPosition.x, this.hoverPosition.y);
      this.viewport.scale *= zoomFactor;
      this.viewport.scale = Math.max(0.1, Math.min(5, this.viewport.scale));
      const worldAfterZoom = this.screenToWorld(this.hoverPosition.x, this.hoverPosition.y);
      
      this.viewport.offsetX += (worldAfterZoom.x - worldBeforeZoom.x) * this.viewport.scale;
      this.viewport.offsetY += (worldAfterZoom.y - worldBeforeZoom.y) * this.viewport.scale;
      
      this.drawMap();
    },
    
    resetView() {
      this.viewport = {
        scale: 1.0,
        offsetX: 0,
        offsetY: 0
      };
      this.drawMap();
    },
    
    startDrag(event) {
      if (this.addMarkerMode) return;
      
      // 检查是否点击了区域调整手柄
      if (this.isPlacingRegion) {
        const handle = this.getResizeHandle(event);
        if (handle) {
          this.regionResizeHandle = handle;
          this.resizeStart = {
            x: event.clientX,
            y: event.clientY
          };
          // 记录原始尺寸用于等比例缩放
          this.originalRegionSize = {
            width: this.regionPlacement.width,
            height: this.regionPlacement.height
          };
          return;
        }
        
        // 检查是否点击了区域内部（用于移动）
        if (this.isPointInRegion(event)) {
          this.isMovingRegion = true;
          this.regionMoveStart = {
            x: event.clientX,
            y: event.clientY
          };
          this.originalRegionPosition = {
            x: this.regionPlacement.x,
            y: this.regionPlacement.y
          };
          return;
        }
      }
      
      if (this.placingRegion) return;
      
      this.isDragging = true;
      this.dragStart = {
        x: event.clientX - this.viewport.offsetX,
        y: event.clientY - this.viewport.offsetY
      };
      this.lastOffset = { ...this.viewport };
      
      this.canvas.style.cursor = 'grabbing';
    },
    
    isPointInRegion(event) {
      if (!this.isPlacingRegion) return false;
      
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const worldCoords = this.screenToWorld(x, y);
      
      return worldCoords.x >= this.regionPlacement.x && 
             worldCoords.x <= this.regionPlacement.x + this.regionPlacement.width &&
             worldCoords.y >= this.regionPlacement.y && 
             worldCoords.y <= this.regionPlacement.y + this.regionPlacement.height;
    },
    
    handleMouseMove(event) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      this.hoverPosition = { x, y };
      this.currentWorldCoords = this.screenToWorld(x, y);
      
      // 区域移动处理
      if (this.isMovingRegion) {
        this.handleRegionMove(event);
        return;
      }
      
      // 区域调整处理
      if (this.regionResizeHandle) {
        this.handleRegionResize(event);
        return;
      }
      
      // 拖拽处理
      if (this.isDragging) {
        this.viewport.offsetX = event.clientX - this.dragStart.x;
        this.viewport.offsetY = event.clientY - this.dragStart.y;
        this.drawMap();
        return;
      }
      
      // 设置光标样式
      this.updateCursorStyle(x, y);
      
      this.drawMap();
    },
    
    handleRegionMove(event) {
      const deltaX = event.clientX - this.regionMoveStart.x;
      const deltaY = event.clientY - this.regionMoveStart.y;
      
      const worldDeltaX = deltaX / this.viewport.scale;
      const worldDeltaY = deltaY / this.viewport.scale;
      
      this.regionPlacement.x = this.originalRegionPosition.x + worldDeltaX;
      this.regionPlacement.y = this.originalRegionPosition.y + worldDeltaY;
      
      // 确保区域不会移出地图边界
      this.regionPlacement.x = Math.max(0, Math.min(this.canvasWidth - this.regionPlacement.width, this.regionPlacement.x));
      this.regionPlacement.y = Math.max(0, Math.min(this.canvasHeight - this.regionPlacement.height, this.regionPlacement.y));
      
      this.drawMap();
    },
    
    updateCursorStyle(x, y) {
      if (this.isPlacingRegion) {
        const handle = this.getResizeHandleAt(x, y);
        if (handle) {
          this.canvas.style.cursor = this.getResizeCursor(handle);
          return;
        }
        
        // 检查是否在区域内部
        const worldCoords = this.screenToWorld(x, y);
        if (worldCoords.x >= this.regionPlacement.x && 
            worldCoords.x <= this.regionPlacement.x + this.regionPlacement.width &&
            worldCoords.y >= this.regionPlacement.y && 
            worldCoords.y <= this.regionPlacement.y + this.regionPlacement.height) {
          this.canvas.style.cursor = 'move';
          return;
        }
      }
      
      if (!this.addMarkerMode && !this.placingRegion) {
        this.hoverPoint = null;
        
        for (const point of this.currentPoints) {
          const pointCoords = this.worldToScreen(point.position.x, point.position.y);
          if (!pointCoords) continue;
          
          const distance = Math.sqrt(
            Math.pow(x - pointCoords.x, 2) + 
            Math.pow(y - pointCoords.y, 2)
          );
          
          if (distance < 20 / this.viewport.scale) {
            this.hoverPoint = point;
            this.canvas.style.cursor = 'pointer';
            return;
          }
        }
      }
      
      this.canvas.style.cursor = this.addMarkerMode ? 'crosshair' : 'grab';
    },
    
    getResizeHandleAt(screenX, screenY) {
      if (!this.isPlacingRegion) return null;
      
      const regionScreen = this.worldToScreen(this.regionPlacement.x, this.regionPlacement.y);
      if (!regionScreen) return null;
      
      const regionEndScreen = this.worldToScreen(
        this.regionPlacement.x + this.regionPlacement.width,
        this.regionPlacement.y + this.regionPlacement.height
      );
      if (!regionEndScreen) return null;
      
      const regionWidth = regionEndScreen.x - regionScreen.x;
      const regionHeight = regionEndScreen.y - regionScreen.y;
      
      const handles = [
        { type: 'nw', x: regionScreen.x - 5, y: regionScreen.y - 5 },
        { type: 'ne', x: regionEndScreen.x - 5, y: regionScreen.y - 5 },
        { type: 'sw', x: regionScreen.x - 5, y: regionEndScreen.y - 5 },
        { type: 'se', x: regionEndScreen.x - 5, y: regionEndScreen.y - 5 },
        // 四个边的手柄
        { type: 'n', x: regionScreen.x + regionWidth / 2 - 5, y: regionScreen.y - 5 },
        { type: 's', x: regionScreen.x + regionWidth / 2 - 5, y: regionEndScreen.y - 5 },
        { type: 'w', x: regionScreen.x - 5, y: regionScreen.y + regionHeight / 2 - 5 },
        { type: 'e', x: regionEndScreen.x - 5, y: regionScreen.y + regionHeight / 2 - 5 }
      ];
      
      for (const handle of handles) {
        if (Math.abs(screenX - handle.x) < 10 && Math.abs(screenY - handle.y) < 10) {
          return handle.type;
        }
      }
      
      return null;
    },
    
    getResizeCursor(handle) {
      const cursors = {
        'nw': 'nw-resize',
        'ne': 'ne-resize',
        'sw': 'sw-resize',
        'se': 'se-resize',
        'n': 'n-resize',
        's': 's-resize',
        'w': 'w-resize',
        'e': 'e-resize'
      };
      return cursors[handle] || 'default';
    },
    
    getResizeHandle(event) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      return this.getResizeHandleAt(x, y);
    },
    
    handleRegionResize(event) {
      const deltaX = event.clientX - this.resizeStart.x;
      const deltaY = event.clientY - this.resizeStart.y;
      
      const worldDeltaX = deltaX / this.viewport.scale;
      const worldDeltaY = deltaY / this.viewport.scale;
      
      // 等比例缩放逻辑
      if (this.shiftPressed) {
        this.handleProportionalResize(worldDeltaX, worldDeltaY);
      } else {
        this.handleNormalResize(worldDeltaX, worldDeltaY);
      }
      
      this.resizeStart = {
        x: event.clientX,
        y: event.clientY
      };
      
      this.drawMap();
    },
    
    handleNormalResize(worldDeltaX, worldDeltaY) {
      switch (this.regionResizeHandle) {
        case 'nw':
          this.regionPlacement.x += worldDeltaX;
          this.regionPlacement.y += worldDeltaY;
          this.regionPlacement.width -= worldDeltaX;
          this.regionPlacement.height -= worldDeltaY;
          break;
        case 'ne':
          this.regionPlacement.y += worldDeltaY;
          this.regionPlacement.width += worldDeltaX;
          this.regionPlacement.height -= worldDeltaY;
          break;
        case 'sw':
          this.regionPlacement.x += worldDeltaX;
          this.regionPlacement.width -= worldDeltaX;
          this.regionPlacement.height += worldDeltaY;
          break;
        case 'se':
          this.regionPlacement.width += worldDeltaX;
          this.regionPlacement.height += worldDeltaY;
          break;
        // 四个边的调整
        case 'n':
          this.regionPlacement.y += worldDeltaY;
          this.regionPlacement.height -= worldDeltaY;
          break;
        case 's':
          this.regionPlacement.height += worldDeltaY;
          break;
        case 'w':
          this.regionPlacement.x += worldDeltaX;
          this.regionPlacement.width -= worldDeltaX;
          break;
        case 'e':
          this.regionPlacement.width += worldDeltaX;
          break;
      }
      
      // 确保最小尺寸
      this.regionPlacement.width = Math.max(50, this.regionPlacement.width);
      this.regionPlacement.height = Math.max(50, this.regionPlacement.height);
      
      this.drawMap();
    },
    
    handleProportionalResize(worldDeltaX, worldDeltaY) {
      const aspectRatio = this.originalRegionSize.width / this.originalRegionSize.height;
      
      switch (this.regionResizeHandle) {
        case 'nw':
          {
            const delta = Math.max(worldDeltaX, worldDeltaY * aspectRatio);
            this.regionPlacement.x += delta;
            this.regionPlacement.y += delta / aspectRatio;
            this.regionPlacement.width -= delta;
            this.regionPlacement.height -= delta / aspectRatio;
          }
          break;
        case 'ne':
          {
            const delta = Math.max(worldDeltaX, -worldDeltaY * aspectRatio);
            this.regionPlacement.y -= delta / aspectRatio;
            this.regionPlacement.width += delta;
            this.regionPlacement.height += delta / aspectRatio;
          }
          break;
        case 'sw':
          {
            const delta = Math.max(-worldDeltaX, worldDeltaY * aspectRatio);
            this.regionPlacement.x -= delta;
            this.regionPlacement.width += delta;
            this.regionPlacement.height += delta / aspectRatio;
          }
          break;
        case 'se':
          {
            const delta = Math.max(worldDeltaX, worldDeltaY * aspectRatio);
            this.regionPlacement.width += delta;
            this.regionPlacement.height += delta / aspectRatio;
          }
          break;
        // 四个边的等比例调整（只对对角线手柄保持比例）
        case 'n':
        case 's':
        case 'w':
        case 'e':
          // 边手柄不保持比例
          this.handleNormalResize(worldDeltaX, worldDeltaY);
          break;
      }
      
      // 确保最小尺寸
      this.regionPlacement.width = Math.max(50, this.regionPlacement.width);
      this.regionPlacement.height = Math.max(50, this.regionPlacement.height);
      
      this.drawMap();
    },

    endDrag() {
      this.isDragging = false;
      this.regionResizeHandle = null;
      this.isMovingRegion = false;
      this.updateCursorStyle(this.hoverPosition?.x || 0, this.hoverPosition?.y || 0);
    },
    
    handleWheel(event) {
      event.preventDefault();
      
      const zoomIntensity = 0.1;
      const wheel = event.deltaY < 0 ? 1 : -1;
      const zoom = Math.exp(wheel * zoomIntensity);
      
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      const worldBeforeZoom = this.screenToWorld(mouseX, mouseY);
      this.viewport.scale *= zoom;
      this.viewport.scale = Math.max(0.1, Math.min(5, this.viewport.scale));
      const worldAfterZoom = this.screenToWorld(mouseX, mouseY);
      
      this.viewport.offsetX += (worldAfterZoom.x - worldBeforeZoom.x) * this.viewport.scale;
      this.viewport.offsetY += (worldAfterZoom.y - worldBeforeZoom.y) * this.viewport.scale;
      
      this.drawMap();
    },
    
    screenToWorld(screenX, screenY) {
      const untransformedX = (screenX - this.viewport.offsetX) / this.viewport.scale;
      const untransformedY = (screenY - this.viewport.offsetY) / this.viewport.scale;
      
      if (this.currentRegion === 'full') {
        return { 
          x: Math.max(0, Math.min(this.canvasWidth, untransformedX)),
          y: Math.max(0, Math.min(this.canvasHeight, untransformedY))
        };
      }
      
      const region = this.mapData?.regions[this.currentRegion];
      if (!region) return { x: 0, y: 0 };
      
      return {
        x: region.bounds.x + (untransformedX / this.canvas.width) * region.bounds.width,
        y: region.bounds.y + (untransformedY / this.canvas.height) * region.bounds.height
      };
    },
    
    worldToScreen(worldX, worldY) {
      let screenX, screenY;
      
      if (this.currentRegion === 'full') {
        screenX = worldX;
        screenY = worldY;
      } else {
        const region = this.mapData?.regions[this.currentRegion];
        if (!region) return null;
        
        if (worldX < region.bounds.x || worldX > region.bounds.x + region.bounds.width ||
            worldY < region.bounds.y || worldY > region.bounds.y + region.bounds.height) {
          return null;
        }
        
        screenX = ((worldX - region.bounds.x) / region.bounds.width) * this.canvas.width;
        screenY = ((worldY - region.bounds.y) / region.bounds.height) * this.canvas.height;
      }
      
      return {
        x: screenX * this.viewport.scale + this.viewport.offsetX,
        y: screenY * this.viewport.scale + this.viewport.offsetY
      };
    },
    
    // 预加载图标图片
    async loadIcons() {
      const iconPaths = {
        zeppelin: '/images/map-icons/zeppelin.webp',
        ship: '/images/map-icons/ship.webp',
        special: '/images/map-icons/special.webp',
        dungeon: '/images/map-icons/dungeon.webp',
        raid: '/images/map-icons/raid.webp'
      };
      
      const loadPromises = Object.entries(iconPaths).map(([key, path]) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            this.iconImages[key] = img;
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load icon: ${path}`);
            resolve(); // 即使加载失败也继续
          };
          img.src = path;
        });
      });
      
      await Promise.all(loadPromises);
      this.iconsLoaded = true;
      console.log('图标加载完成');
      
      // 图标加载完成后重绘地图
      this.drawMap();
    },
    
    // 检查是否应该使用图片图标
    shouldUseIcon(point) {
      const iconTypes = ['zeppelin', 'ship', 'special', 'dungeon', 'raid'];
      return iconTypes.includes(point.type) && this.iconsLoaded && this.iconImages[point.type];
    },
    
    // 获取图标图片
    getIconImage(point) {
      if (this.shouldUseIcon(point)) {
        return this.iconImages[point.type];
      }
      return null;
    },
    
    async loadMapData() {
      try {
        // 加载主地图数据
        const response = await fetch('/data/map-data.json');
        if (response.ok) {
          const externalData = await response.json();
          this.mapData = externalData;
          console.log('外部地图数据加载成功');
          
          // 修复区域图片路径
          this.fixRegionImagePaths();
        } else {
          throw new Error('无法加载地图数据文件');
        }
        
        // 新增：加载区域文本标记数据
        await this.loadRegionSubnames();
        
      } catch (error) {
        console.warn('无法加载外部地图数据:', error);
        // 使用默认空数据结构
        this.mapData = {
          points: {
            flightPoints: [],
            dungeons: [],
            regionTexts: []
          },
          regions: {},
          config: {
            fullMapSize: { width: 9440, height: 7928 },
            pointTypes: {},
            factions: {}
          }
        };
        this.regionSubnames = [];
      } finally {
        this.dataLoaded = true;
      }
    },

    // 新增：修复区域图片路径
    fixRegionImagePaths() {
      if (!this.mapData?.regions) return;
      
      Object.entries(this.mapData.regions).forEach(([id, region]) => {
        // 跳过东部王国和卡利姆多
        if (id === 'eastern-kingdoms' || id === 'kalimdor') return;
        
        // 确保图片路径正确
        if (region.image && !region.image.startsWith('http') && !region.image.startsWith('/')) {
          region.image = `/images/maps/regions/${region.image}`;
        }
        
        // 如果图片路径为空，设置一个默认的占位图片
        if (!region.image) {
          region.image = this.createPlaceholderImage(region.bounds?.width || 300, region.bounds?.height || 300);
        }
      });
    },

    // 新增：创建占位图片
    createPlaceholderImage(width, height) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // 绘制灰色背景
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(0, 0, width, height);
      
      // 绘制边框
      ctx.strokeStyle = '#718096';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, width, height);
      
      // 绘制文字
      ctx.fillStyle = '#a0aec0';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('区域图片', width / 2, height / 2);
      
      return canvas.toDataURL();
    },
    
    async loadRegionSubnames() {
      try {
        const response = await fetch('/data/region-subnames.json');
        if (response.ok) {
          const subnamesData = await response.json();
          
          // 确保 regionSubnames 是数组
          if (Array.isArray(subnamesData)) {
            this.regionSubnames = subnamesData;
          } else if (subnamesData && typeof subnamesData === 'object') {
            // 如果是对象，转换为数组
            this.regionSubnames = Object.values(subnamesData);
          } else {
            this.regionSubnames = [];
          }
          
          console.log('区域文本标记数据加载成功:', this.regionSubnames.length, '条记录');
          
          // 将区域文本标记数据合并到地图数据中
          this.mergeRegionSubnames();
        } else {
          console.warn('无法加载区域文本标记文件，使用空数据');
          this.regionSubnames = [];
        }
      } catch (error) {
        console.warn('加载区域文本标记数据时出错:', error);
        this.regionSubnames = [];
      }
    },
    
    // 修改：合并区域文本标记数据到地图数据
    mergeRegionSubnames() {
      if (!this.regionSubnames || !Array.isArray(this.regionSubnames)) {
        return;
      }
      
      // 确保 regionTexts 数组存在
      if (!this.mapData.points.regionTexts) {
        this.mapData.points.regionTexts = [];
      }
      
      // 清空现有的区域文本标记（避免重复）
      this.mapData.points.regionTexts = this.mapData.points.regionTexts.filter(
        point => point.type !== 'regionText' || !point.fromSubnames
      );
      
      // 添加从 region-subnames.json 加载的标记
      this.regionSubnames.forEach(subname => {
        // 确保 subname 是有效的对象
        if (!subname || typeof subname !== 'object') return;
        
        const regionTextPoint = {
          id: subname.id || RegionUtils.generateId(),
          name: { 
            zh: subname.languages?.zh || '区域标注', 
            en: subname.languages?.en || 'Region Text' 
          },
          type: 'regionText',
          faction: 'neutral',
          position: subname.position || { x: 0, y: 0 },
          languages: subname.languages || {},
          textColor: subname.textColor || '#FFFFFF',
          fontSize: subname.fontSize || 24,
          fromSubnames: true // 标记来自 region-subnames.json
        };
        
        this.mapData.points.regionTexts.push(regionTextPoint);
      });
      
      console.log('区域文本标记数据合并完成，共', this.regionSubnames.length, '条记录');
    },
    
    // 修改：处理区域文本标注导出，现在保存到 regionSubnames 中
    handleRegionTextExport(regionTextPoint) {
      // 构建要保存到 region-subnames.json 的数据
      const subnameData = {
        id: regionTextPoint.id,
        position: {
          x: Math.round(regionTextPoint.position.x),
          y: Math.round(regionTextPoint.position.y)
        },
        languages: {},
        textColor: regionTextPoint.textColor || '#FFFFFF',
        fontSize: regionTextPoint.fontSize || 24
      };
      
      // 只添加有内容的语言
      Object.entries(regionTextPoint.languages).forEach(([lang, text]) => {
        if (text && text.trim()) {
          subnameData.languages[lang] = text.trim();
        }
      });
      
      // 确保 regionSubnames 是数组
      if (!this.regionSubnames) {
        this.regionSubnames = [];
      }
      
      // 检查是否已存在相同ID的条目
      const existingIndex = this.regionSubnames.findIndex(item => item && item.id === subnameData.id);
      if (existingIndex > -1) {
        this.regionSubnames[existingIndex] = subnameData;
      } else {
        this.regionSubnames.push(subnameData);
      }
      
      // 创建下载链接
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.regionSubnames, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "region-subnames.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      document.body.removeChild(downloadAnchorNode);
      
      // 显示提示信息
      alert(`区域名称标注已保存到 region-subnames.json 数据中！\n\n请用下载的文件替换原文件：\ndocs/public/data/region-subnames.json\n\n坐标: (${subnameData.position.x}, ${subnameData.position.y})\n文本颜色: ${subnameData.textColor}\n字体大小: ${subnameData.fontSize}px`);
      this.mergeRegionSubnames();
      this.drawMap();
    },
    
    initCanvas() {
      this.canvas = this.$refs.mapCanvas;
      this.ctx = this.canvas.getContext('2d');
      this.canvas.style.cursor = 'grab';
    },
    
    async loadMap() {
      if (!this.dataLoaded) {
        await this.loadMapData();
      }

      this.resetView();

      this.mapImage = new Image();
      this.mapImage.onload = () => {
        this.drawMap();
      };
      this.mapImage.onerror = () => {
        console.error(`无法加载主地图图片: ${this.mapImage.src}`);
        // 创建一个空白图片作为后备
        this.mapImage = new Image();
        this.mapImage.onload = () => {
          this.drawMap();
        };
        // 创建一个空白 canvas 作为后备
        const canvas = document.createElement('canvas');
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('地图加载失败', canvas.width / 2, canvas.height / 2);
        this.mapImage.src = canvas.toDataURL();
      };

      // 统一使用完整地图作为画布背景
      this.mapImage.src = '/images/maps/fullmap.webp';
    },
    
    refreshMap() {
      this.loadMapData().then(() => {
        this.loadMap();
        this.drawMap();
        alert('地图数据已刷新！');
      });
    },
    
    drawMap() {
      if (!this.mapImage || !this.ctx) return;
      
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.save();
      this.ctx.translate(this.viewport.offsetX, this.viewport.offsetY);
      this.ctx.scale(this.viewport.scale, this.viewport.scale);
      
      try {
        // 绘制底层地图
        if (this.mapImage.complete && this.mapImage.naturalWidth !== 0) {
          this.ctx.drawImage(this.mapImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
          // 如果主地图加载失败，绘制灰色背景
          this.ctx.fillStyle = '#2d3748';
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // 在完整地图上绘制所有区域的地图块
        if (this.currentRegion === 'full') {
          this.drawRegionMapTiles();
          this.drawRegionBounds();
        }
        
        // 绘制区域放置预览
        if (this.placingRegion && this.tempRegionImage) {
          this.drawRegionPlacement();
        }
        
        // 绘制飞行路线（包括交通路线）
        this.drawFlightPaths();
        
        // 绘制标记点
        this.drawPoints();
        
        // 绘制悬停标记
        if (this.addMarkerMode && this.hoverPosition) {
          const worldCoords = this.screenToWorld(this.hoverPosition.x, this.hoverPosition.y);
          
          this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
          this.ctx.beginPath();
          this.ctx.arc(worldCoords.x, worldCoords.y, 10 / this.viewport.scale, 0, 2 * Math.PI);
          this.ctx.fill();
          this.ctx.strokeStyle = '#FFFFFF';
          this.ctx.lineWidth = 2 / this.viewport.scale;
          this.ctx.stroke();
        }
        
      } catch (error) {
        console.error('绘制地图时出错:', error);
        // 在画布上显示错误信息
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('绘制错误: ' + error.message, 10, 30);
      }
      
      this.ctx.restore();
    },

    drawRegionMapTiles() {
      if (!this.mapData?.regions) return;
      
      Object.entries(this.mapData.regions).forEach(([id, region]) => {
        if (id === 'eastern-kingdoms' || id === 'kalimdor') return;
        if (!this.regionImageCache[id]) {
          this.regionImageCache[id] = new Image();
          this.regionImageCache[id].onload = () => {
            this.drawMap();
          };
          this.regionImageCache[id].onerror = () => {
            console.warn(`无法加载区域图片: ${region.image}`);
            delete this.regionImageCache[id];
          };
          this.regionImageCache[id].src = region.image;
          return;
        }
        if (this.regionImageCache[id].complete && this.regionImageCache[id].naturalWidth !== 0) {
          try {
            this.ctx.globalAlpha = 0.8;
            this.ctx.drawImage(
              this.regionImageCache[id],
              region.bounds.x,
              region.bounds.y,
              region.bounds.width,
              region.bounds.height
            );
            this.ctx.globalAlpha = 1.0;
          } catch (error) {
            console.warn(`绘制区域图片失败: ${region.image}`, error);
            delete this.regionImageCache[id];
          }
        }
      });
    },

    drawRegionBounds() {
      if (this.exportInProgress) return;
      if (!this.mapData?.regions) return;
      
      Object.entries(this.mapData.regions).forEach(([id, region]) => {
        // 为不同区域使用不同颜色
        let borderColor = '#FF0000'; // 默认红色
        if (id === 'eastern-kingdoms') borderColor = '#0078FF'; // 联盟蓝
        if (id === 'kalimdor') borderColor = '#E10B00'; // 部落红
        
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = 3 / this.viewport.scale;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(
          region.bounds.x,
          region.bounds.y,
          region.bounds.width,
          region.bounds.height
        );
        this.ctx.setLineDash([]);
        
        this.ctx.fillStyle = borderColor;
        this.ctx.font = `${16 / this.viewport.scale}px Arial`;
        this.ctx.fillText(
          region.name[this.currentLanguage],
          region.bounds.x + 5,
          region.bounds.y + 20
        );
      });
    },
    
    drawRegionPlacement() {
      if (!this.tempRegionImage) return;
      
      const { x, y, width, height } = this.regionPlacement;
      
      this.ctx.globalAlpha = 0.7;
      this.ctx.drawImage(this.tempRegionImage, x, y, width, height);
      this.ctx.globalAlpha = 1.0;
      
      // 绘制区域边框
      this.ctx.strokeStyle = '#00FF00';
      this.ctx.lineWidth = 3 / this.viewport.scale;
      this.ctx.setLineDash([5, 5]);
      this.ctx.strokeRect(x, y, width, height);
      this.ctx.setLineDash([]);
      
      // 绘制调整手柄
      if (this.isPlacingRegion) {
        this.drawResizeHandles(x, y, width, height);
      }
      
      // 绘制区域信息
      this.ctx.fillStyle = '#00FF00';
      this.ctx.font = `${14 / this.viewport.scale}px Arial`;
      this.ctx.fillText(
        `${this.newRegion.name.zh}`,
        x + 5,
        y - 10
      );
      
      // 绘制等比例缩放提示
      if (this.shiftPressed && this.isPlacingRegion) {
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.font = `${12 / this.viewport.scale}px Arial`;
        this.ctx.fillText(
          '等比例缩放模式',
          x + 5,
          y - 25
        );
      }
    },
    
    drawResizeHandles(x, y, width, height) {
      const handles = [
        // 四个角的手柄
        { type: 'nw', x: x - 5, y: y - 5 },
        { type: 'ne', x: x + width - 5, y: y - 5 },
        { type: 'sw', x: x - 5, y: y + height - 5 },
        { type: 'se', x: x + width - 5, y: y + height - 5 },
        // 四个边的手柄
        { type: 'n', x: x + width / 2 - 5, y: y - 5 },
        { type: 's', x: x + width / 2 - 5, y: y + height - 5 },
        { type: 'w', x: x - 5, y: y + height / 2 - 5 },
        { type: 'e', x: x + width - 5, y: y + height / 2 - 5 }
      ];
      
      this.ctx.fillStyle = '#00FF00';
      handles.forEach(handle => {
        this.ctx.fillRect(handle.x, handle.y, 10, 10);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(handle.x, handle.y, 10, 10);
      });
    },
    
    drawPoints() {
      this.currentPoints.forEach(point => {
        this.drawPoint(point);
      });
      
      if (this.hoverPoint && !this.addMarkerMode && !this.placingRegion) {
        this.drawPoint(this.hoverPoint, true);
      }
    },

    // 绘制区域文本标注
    drawRegionText(point, isHover = false) {
      let worldX, worldY;
      
      if (this.currentRegion === 'full') {
        worldX = point.position.x;
        worldY = point.position.y;
      } else {
        const region = this.mapData?.regions[this.currentRegion];
        if (!region || point.region !== this.currentRegion) {
          return;
        }
        
        const regionX = ((point.position.x - region.bounds.x) / region.bounds.width) * this.canvas.width;
        const regionY = ((point.position.y - region.bounds.y) / region.bounds.height) * this.canvas.height;
        
        worldX = regionX;
        worldY = regionY;
      }
      
      // 根据当前语言显示对应的文本，优先显示中文
      const text = point.languages[this.currentLanguage] ||
                  point.languages.zh ||  // 优先显示中文
                  Object.values(point.languages).find(t => t && t.trim()) ||
                  '';
        
      if (!text) return;
      
      // 使用自定义文本颜色，默认为白色
      const textColor = point.textColor || '#FFFFFF';
      // 使用自定义字体大小，默认为24px
      const fontSize = point.fontSize || 24;
      
      // 设置文本样式
      this.ctx.fillStyle = isHover ? '#FFFF00' : textColor; // 悬停时显示黄色
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 3 / this.viewport.scale;
      this.ctx.lineJoin = 'round';
      this.ctx.font = `bold ${Math.max(16, fontSize / this.viewport.scale)}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      // 绘制文本描边（黑色边框）
      this.ctx.strokeText(text, worldX, worldY);
      // 绘制文本填充（自定义颜色或黄色）
      this.ctx.fillText(text, worldX, worldY);
      
      // 悬停时显示提示
      if (isHover) {
        this.ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
        this.ctx.font = `${Math.max(12, 14 / this.viewport.scale)}px Arial`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        const infoText = '区域名称标注 - 点击查看详情';
        this.ctx.fillText(infoText, worldX + 10, worldY + 10);
      }
    },

    // 绘制图标图片
    drawIconImage(point, x, y, iconImage, isHover = false) {
      if (!iconImage || !iconImage.complete) return;
      
      // 固定图标大小：32x32像素（在世界坐标系中，不随缩放变化）
      const baseSize = this.iconSize;
      const size = isHover ? baseSize * 1.2 : baseSize; // 悬停时稍微放大
      
      // 计算绘制位置（居中）
      const drawX = x - size / 2;
      const drawY = y - size / 2;
      
      // 保存上下文状态
      this.ctx.save();
      
      // 悬停时添加发光效果
      if (isHover) {
        this.ctx.shadowColor = '#FFFF00';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
      }
      
      // 绘制图标
      this.ctx.drawImage(iconImage, drawX, drawY, size, size);
      
      // 恢复上下文状态
      this.ctx.restore();
    },
    // 更新 drawPoint 方法
    drawPoint(point, isHover = false) {
      // 区域文本标注不显示标记点，只显示文本
      if (point.type === 'regionText') {
        this.drawRegionText(point, isHover);
        return;
      }
      
      let worldX, worldY;
      
      if (this.currentRegion === 'full') {
        worldX = point.position.x;
        worldY = point.position.y;
      } else {
        const region = this.mapData?.regions[this.currentRegion];
        if (!region || point.region !== this.currentRegion) {
          return; 
        }
        
        const regionX = ((point.position.x - region.bounds.x) / region.bounds.width) * this.canvas.width;
        const regionY = ((point.position.y - region.bounds.y) / region.bounds.height) * this.canvas.height;
        
        worldX = regionX;
        worldY = regionY;
      }
      
      // 检查是否为需要显示图标的类型
      const iconTypes = ['ship', 'zeppelin', 'special', 'dungeon', 'raid'];
      
      if (iconTypes.includes(point.type) && this.iconsLoaded && this.iconImages[point.type]) {
        // 使用图片图标（固定大小）
        this.drawIconImage(point, worldX, worldY, this.iconImages[point.type], isHover);
        
        // 绘制标签 - 只在缩放较大时显示
        if (this.viewport.scale > 0.5) {
          const labelOffset = this.iconSize + 5; // 固定偏移量
          this.drawPointLabel(point, worldX, worldY, labelOffset, isHover);
        }
      } else {
            // 使用原来的圆形标记方式
            const typeConfig = this.mapData?.config?.pointTypes[point.type] || { size: 18, color: '#2196F3' };
            
            // 修复阵营颜色配置
            let factionColor;
            switch(point.faction) {
            case 'alliance':
                factionColor = '#0078FF'; // 联盟蓝色
                break;
            case 'horde':
                factionColor = '#E10B00'; // 部落红色
                break;
            case 'neutral':
                factionColor = '#FFD700'; // 中立金色
                break;
            }
            
            // 使用固定大小，不随缩放变化
            const baseSize = typeConfig.size || 18;
            const fixedSize = isHover ? baseSize * 1.2 : baseSize;
            
            // 绘制圆形标记
            this.ctx.fillStyle = factionColor;
            this.ctx.beginPath();
            this.ctx.arc(worldX, worldY, fixedSize, 0, 2 * Math.PI);
            this.ctx.fill();
            
            this.ctx.strokeStyle = isHover ? '#FFFF00' : '#FFFFFF';
            this.ctx.lineWidth = isHover ? 3 : 2;
            this.ctx.stroke();
            
            // 绘制标签 - 只在缩放较大时显示
            if (this.viewport.scale > 0.5) {
            this.drawPointLabel(point, worldX, worldY, fixedSize, isHover);
            }
        }
    },
    drawPointLabel(point, x, y, offset, isHover) {
      this.ctx.fillStyle = '#FFFFFF';
      // 使用固定字体大小，不随缩放变化
      this.ctx.font = `bold 14px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'bottom';
      
      const text = point.name[this.currentLanguage];
      const textWidth = this.ctx.measureText(text).width;
      
      this.ctx.fillStyle = isHover ? 'rgba(255, 255, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(
        x - textWidth / 2 - 6,
        y - offset - 5,
        textWidth + 12,
        20
      );
      
      this.ctx.fillStyle = isHover ? '#000000' : '#FFFFFF';
      this.ctx.fillText(text, x, y - offset + 10);
      
      // 为交通点添加额外说明
      if (point.note) {
        const noteText = point.note[this.currentLanguage];
        if (noteText && this.viewport.scale > 0.7) {
          this.ctx.font = `12px Arial`;
          this.ctx.fillStyle = isHover ? 'rgba(255, 255, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)';
          this.ctx.fillRect(
            x - textWidth / 2 - 6,
            y - offset - 25,
            textWidth + 12,
            16
          );
          this.ctx.fillStyle = isHover ? '#000000' : '#FFFFFF';
          this.ctx.fillText(noteText, x, y - offset - 15);
        }
      }
    },
    
    drawFlightPaths() {
    if (this.showFlightPaths) {
        const drawnConnections = new Set();
        
        const flightPoints = this.flightMasterPoints.filter(point => 
        point.connections && point.connections.length > 0
        );
        
        flightPoints.forEach(point => {
        const connectedPoints = RegionUtils.getConnectedPoints(point, this.flightMasterPoints);
        connectedPoints.forEach(targetPoint => {
            if (this.currentPoints.some(p => p.id === targetPoint.id) && 
                this.isSameRegion(point, targetPoint)) {
            const connectionKey = [point.id, targetPoint.id].sort().join('-');
            
            if (!drawnConnections.has(connectionKey)) {
                this.drawConnection(point, targetPoint, 'flight');
                drawnConnections.add(connectionKey);
            }
            }
        });
        });
    }
    if (this.showTransport && this.showTransportRoutes) {
        this.drawTransportRoutes();
        }
    },

    // 新增：检查两个点是否在同一地图区域
    isSameRegion(pointA, pointB) {
      // 如果当前显示的是完整地图，检查两个点是否在同一大陆
      if (this.currentRegion === 'full') {
        const regionA = this.getPointRegion(pointA);
        const regionB = this.getPointRegion(pointB);
        
        // 东部王国和卡利姆多之间不连接
        if ((regionA === 'eastern-kingdoms' && regionB === 'kalimdor') ||
            (regionA === 'kalimdor' && regionB === 'eastern-kingdoms')) {
          return false;
        }
      }
      
      // 其他情况都允许连接
      return true;
    },

    // 新增：获取点所在的主要区域
    getPointRegion(point) {
      if (!point.region) return 'unknown';
      
      // 如果是东部王国或卡利姆多区域内的点
      if (point.region === 'eastern-kingdoms') return 'eastern-kingdoms';
      if (point.region === 'kalimdor') return 'kalimdor';
      
      // 对于其他区域，检查它们属于哪个大陆
      const region = this.mapData?.regions[point.region];
      if (!region) return 'unknown';
      
      // 根据区域位置判断属于哪个大陆
      if (region.bounds.x < this.canvasWidth / 2) {
        return 'kalimdor'; // 在画布左半部分，属于卡利姆多
      } else {
        return 'eastern-kingdoms'; // 在画布右半部分，属于东部王国
      }
    },

    drawTransportRoutes() {
      this.transportPoints.forEach(point => {
        if (!point.connections || !Array.isArray(point.connections)) return;
        
        point.connections.forEach(connectionId => {
          const connectedPoint = this.transportPoints.find(p => 
            p.id.toLowerCase() === connectionId.toLowerCase()
          );
          
          if (!connectedPoint) return;
          
          // 根据类型绘制不同的路线（不连接，只延伸一段）
          this.drawTransportLine(point, connectedPoint, point.type);
        });
      });
    },

    // 新增：绘制交通线路（不连接）
    drawTransportLine(pointA, pointB, connectionType) {
      let coordsA, coordsB;
      
      if (this.currentRegion === 'full') {
        coordsA = { x: pointA.position.x, y: pointA.position.y };
        coordsB = { x: pointB.position.x, y: pointB.position.y };
      } else {
        const region = this.mapData?.regions[this.currentRegion];
        if (!region || pointA.region !== this.currentRegion || pointB.region !== this.currentRegion) {
          return;
        }
        
        coordsA = {
          x: ((pointA.position.x - region.bounds.x) / region.bounds.width) * this.canvas.width,
          y: ((pointA.position.y - region.bounds.y) / region.bounds.height) * this.canvas.height
        };
        
        coordsB = {
          x: ((pointB.position.x - region.bounds.x) / region.bounds.width) * this.canvas.width,
          y: ((pointB.position.y - region.bounds.y) / region.bounds.height) * this.canvas.height
        };
      }
      
      // 计算方向向量
      const dx = coordsB.x - coordsA.x;
      const dy = coordsB.y - coordsA.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 归一化方向向量
      const dirX = dx / distance;
      const dirY = dy / distance;
      
      // 设置延伸长度（固定长度）
      const extensionLength = Math.min(150, distance * 0.3);
      
      // 计算延伸段的终点
      const extensionEndA = {
        x: coordsA.x + dirX * extensionLength,
        y: coordsA.y + dirY * extensionLength
      };
      
      const extensionEndB = {
        x: coordsB.x - dirX * extensionLength,
        y: coordsB.y - dirY * extensionLength
      };
      
      // 根据连接类型确定样式
      let lineStyle = this.getConnectionStyle(connectionType);
      
      // 绘制从A点出发的延伸线
      this.ctx.strokeStyle = lineStyle.color;
      this.ctx.lineWidth = lineStyle.width; // 固定宽度
      this.ctx.setLineDash(lineStyle.dash);
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(coordsA.x, coordsA.y);
      this.ctx.lineTo(extensionEndA.x, extensionEndA.y);
      this.ctx.stroke();
      
      // 绘制从B点出发的延伸线
      this.ctx.beginPath();
      this.ctx.moveTo(coordsB.x, coordsB.y);
      this.ctx.lineTo(extensionEndB.x, extensionEndB.y);
      this.ctx.stroke();
      
      // 绘制箭头
      this.drawArrow(extensionEndA, { x: dirX, y: dirY }, lineStyle.color, connectionType);
      this.drawArrow(extensionEndB, { x: -dirX, y: -dirY }, lineStyle.color, connectionType);
      
      this.ctx.setLineDash([]);
    },

    // 新增：绘制箭头
    drawArrow(position, direction, color, type) {
      const arrowLength = 15; // 固定箭头长度
      const arrowWidth = 10; // 固定箭头宽度
      
      // 计算箭头尖端位置
      const tipX = position.x + direction.x * arrowLength;
      const tipY = position.y + direction.y * arrowLength;
      
      // 计算垂直方向
      const perpendicularX = -direction.y;
      const perpendicularY = direction.x;
      
      // 计算箭头两个底角
      const leftX = position.x + perpendicularX * arrowWidth / 2;
      const leftY = position.y + perpendicularY * arrowWidth / 2;
      const rightX = position.x - perpendicularX * arrowWidth / 2;
      const rightY = position.y - perpendicularY * arrowWidth / 2;
      
      // 根据类型调整箭头样式
      let arrowStyle = this.getArrowStyle(type);
      
      this.ctx.fillStyle = color;
      this.ctx.strokeStyle = arrowStyle.strokeColor;
      this.ctx.lineWidth = arrowStyle.lineWidth; // 固定线宽
      
      // 绘制箭头
      this.ctx.beginPath();
      this.ctx.moveTo(tipX, tipY);
      this.ctx.lineTo(leftX, leftY);
      this.ctx.lineTo(rightX, rightY);
      this.ctx.closePath();
      
      this.ctx.fill();
      
      // 如果需要描边
      if (arrowStyle.strokeColor) {
        this.ctx.stroke();
      }
    },

    // 新增：获取箭头样式
    getArrowStyle(type) {
      const styles = {
        ship: {
          strokeColor: '#000000',
          lineWidth: 1
        },
        zeppelin: {
          strokeColor: '#000000',
          lineWidth: 1
        },
        special: {
          strokeColor: '#000000',
          lineWidth: 1
        },
        flight: {
          strokeColor: null, // 无描边
          lineWidth: 0
        }
      };
      
      return styles[type] || styles.flight;
    },

  drawConnection(pointA, pointB, connectionType = 'flight') {
    let coordsA, coordsB;
    
    if (this.currentRegion === 'full') {
      coordsA = { x: pointA.position.x, y: pointA.position.y };
      coordsB = { x: pointB.position.x, y: pointB.position.y };
    } else {
      const region = this.mapData?.regions[this.currentRegion];
      if (!region || pointA.region !== this.currentRegion || pointB.region !== this.currentRegion) {
        return;
      }
      
      coordsA = {
        x: ((pointA.position.x - region.bounds.x) / region.bounds.width) * this.canvas.width,
        y: ((pointA.position.y - region.bounds.y) / region.bounds.height) * this.canvas.height
      };
      
      coordsB = {
        x: ((pointB.position.x - region.bounds.x) / region.bounds.width) * this.canvas.width,
        y: ((pointB.position.y - region.bounds.y) / region.bounds.height) * this.canvas.height
      };
    }
    if (!this.isSameRegion(pointA, pointB)) {
      return;
    }
    let lineStyle = this.getConnectionStyle(connectionType, pointA, pointB);
    const fixedLineWidth = lineStyle.width;
    this.ctx.strokeStyle = lineStyle.color;
    this.ctx.lineWidth = fixedLineWidth / this.viewport.scale; // 反缩放，保持固定像素宽度
    this.ctx.lineCap = 'round';
    const dashPattern = lineStyle.dash || [15, 15];
    const scaledDash = dashPattern.map(d => d / this.viewport.scale);
    this.ctx.setLineDash(scaledDash);
    this.ctx.beginPath();
    this.ctx.moveTo(coordsA.x, coordsA.y);
    this.ctx.lineTo(coordsB.x, coordsB.y);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  },

    // 获取连接样式
    getConnectionStyle(connectionType, pointA = null, pointB = null) {
      // 飞行路线的特殊处理 - 根据阵营确定颜色
      if (connectionType === 'flight' && pointA && pointB) {
        return this.getFlightConnectionStyle(pointA, pointB);
      }
      
      const styles = {
        flight: {
          color: '#FFD700', // 默认中立金色
          width: 3, // 固定宽度
          dash: [15, 15]
        },
        ship: {
          color: '#00BCD4', // 青色
          width: 3, // 固定宽度
          dash: [10, 5]
        },
        zeppelin: {
          color: '#FF9800', // 橙色
          width: 3, // 固定宽度
          dash: [8, 4]
        },
        special: {
          color: '#795548', // 棕色
          width: 3, // 固定宽度
          dash: [6, 3, 2, 3]
        }
      };
      
      return styles[connectionType] || styles.flight;
    },

    // 获取飞行路线连接样式（根据阵营）
    getFlightConnectionStyle(pointA, pointB) {
      // 阵营颜色配置
      const factionColors = {
        alliance: '#0078FF', // 联盟蓝
        horde: '#E10B00',    // 部落红
        neutral: '#FFD700'   // 中立金
      };
      
      let connectionColor = factionColors.neutral; // 默认中立金色
      
      // 判断连接类型
      if (pointA.faction === 'alliance' && pointB.faction === 'alliance') {
        connectionColor = factionColors.alliance; // 联盟-联盟：蓝色
      } else if (pointA.faction === 'horde' && pointB.faction === 'horde') {
        connectionColor = factionColors.horde; // 部落-部落：红色
      } else if (pointA.faction === 'neutral' && pointB.faction === 'neutral') {
        connectionColor = factionColors.neutral; // 中立-中立：金色
      } else {
        // 混合阵营：使用中立颜色
        connectionColor = factionColors.neutral;
      }
      
      return {
        color: connectionColor,
        width: 4,
        dash: [15, 15]
      };
    },

    handleMapClick(event) {
      const rect = this.canvas.getBoundingClientRect();
      const canvasX = event.clientX - rect.left;
      const canvasY = event.clientY - rect.top;
      
      if (this.addMarkerMode) {
        const worldCoords = this.screenToWorld(canvasX, canvasY);
        this.newPoint.position = worldCoords;
        this.showAddDialog = true;
      } else if (this.placingRegion) {
        this.handleRegionPlacementClick(canvasX, canvasY);
      } else if (this.hoverPoint) {
        this.selectedPoint = this.hoverPoint;
      }
    },
    
    showAddRegionDialog() {
      this.showRegionDialog = true;
      this.newRegion = this.getDefaultNewRegion();
    },
    
    handleRegionPlacementClick(x, y) {
      const worldCoords = this.screenToWorld(x, y);
      
      if (!this.isPlacingRegion) {
        // 第一次点击：设置区域起始位置
        this.isPlacingRegion = true;
        const defaultScale = 0.3; // 30% 的原始大小
        this.regionPlacement = {
          x: worldCoords.x,
          y: worldCoords.y,
          width: Math.max(300, this.regionImageSize.width * defaultScale),
          height: Math.max(300, this.regionImageSize.height * defaultScale)
        };
        this.showRegionAdjustmentControls = true; // 显示调整控件
        this.drawMap();
      }
    },
    
    adjustRegionPosition(dimension, delta) {
      if (dimension === 'x') {
        this.regionPlacement.x = Math.max(0, this.regionPlacement.x + delta);
        this.regionPlacement.x = Math.min(this.canvasWidth - this.regionPlacement.width, this.regionPlacement.x);
      } else if (dimension === 'y') {
        this.regionPlacement.y = Math.max(0, this.regionPlacement.y + delta);
        this.regionPlacement.y = Math.min(this.canvasHeight - this.regionPlacement.height, this.regionPlacement.y);
      }
      this.drawMap();
    },

    adjustRegionSize(dimension, delta) {
      if (this.maintainAspectRatio) {
        const aspectRatio = this.regionImageSize.width / this.regionImageSize.height;
        if (dimension === 'width') {
          this.regionPlacement.width = Math.max(100, this.regionPlacement.width + delta);
          this.regionPlacement.height = this.regionPlacement.width / aspectRatio;
        } else if (dimension === 'height') {
          this.regionPlacement.height = Math.max(100, this.regionPlacement.height + delta);
          this.regionPlacement.width = this.regionPlacement.height * aspectRatio;
        }
      } else {
        if (dimension === 'width') {
          this.regionPlacement.width = Math.max(100, this.regionPlacement.width + delta);
        } else if (dimension === 'height') {
          this.regionPlacement.height = Math.max(100, this.regionPlacement.height + delta);
        }
      }
      
      // 确保不超出画布边界
      this.regionPlacement.x = Math.max(0, Math.min(this.canvasWidth - this.regionPlacement.width, this.regionPlacement.x));
      this.regionPlacement.y = Math.max(0, Math.min(this.canvasHeight - this.regionPlacement.height, this.regionPlacement.y));
      
      this.drawMap();
    },

    // 四面调整相关方法
    adjustEdge(edge, delta) {
      switch (edge) {
        case 'top':
          this.regionPlacement.y += delta;
          this.regionPlacement.height -= delta;
          break;
        case 'bottom':
          this.regionPlacement.height += delta;
          break;
        case 'left':
          this.regionPlacement.x += delta;
          this.regionPlacement.width -= delta;
          break;
        case 'right':
          this.regionPlacement.width += delta;
          break;
      }
      this.drawMap();
    },

    applyEdgeAdjustment(edge) {
      // 这里可以根据需要实现具体的边缘调整逻辑
      this.drawMap();
    },

    centerRegion() {
      this.regionPlacement.x = (this.canvasWidth - this.regionPlacement.width) / 2;
      this.regionPlacement.y = (this.canvasHeight - this.regionPlacement.height) / 2;
      this.drawMap();
    },

    fitToCanvas() {
      const scaleX = this.canvasWidth / this.regionImageSize.width;
      const scaleY = this.canvasHeight / this.regionImageSize.height;
      const scale = Math.min(scaleX, scaleY) * 0.9; // 90% 的画布大小
      
      this.regionPlacement.width = this.regionImageSize.width * scale;
      this.regionPlacement.height = this.regionImageSize.height * scale;
      this.regionPlacement.x = (this.canvasWidth - this.regionPlacement.width) / 2;
      this.regionPlacement.y = (this.canvasHeight - this.regionPlacement.height) / 2;
      this.drawMap();
    },

    resetEdgeAdjustment() {
      this.edgeAdjustment = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      };
      this.drawMap();
    },

    // 处理类型变化
    handleTypeChange() {
      if (this.newPoint.type === 'regionText') {
        // 区域名称标注不需要阵营
        this.newPoint.faction = 'neutral';
      } else if (this.newPoint.type === 'ship' || this.newPoint.type === 'zeppelin' || this.newPoint.type === 'special') {
        // 交通点默认为中立
        this.newPoint.faction = 'neutral';
      }
    },

    getDefaultNewPoint() {
      return {
        name: { zh: '', en: '' },
        type: 'town',
        faction: 'neutral',
        position: { x: 0, y: 0 },
        note: { zh: '', en: '' },
        // 为区域文本标注添加语言支持和文本颜色
        languages: {
          zh: '', // 中文 - 作为默认语言
          en: '', // 英语
          ko: '', // 韩语
          ja: '', // 日语
        },
        textColor: '#FFFFFF', // 默认文本颜色为白色
        fontSize: 24 // 默认字体大小
      };
    },

    toggleAddMarkerMode() {
      this.addMarkerMode = !this.addMarkerMode;
      this.canvas.style.cursor = this.addMarkerMode ? 'crosshair' : 'grab';
      this.drawMap();
    },

    confirmAddPoint() {
      if (!this.newPoint.name.zh.trim() && this.newPoint.type !== 'regionText') {
        alert('请输入标记点中文名称');
        return;
      }
      
      // 区域文本标注的特殊验证
      if (this.newPoint.type === 'regionText') {
        // 确保 languages 对象存在
        if (!this.newPoint.languages) {
          this.newPoint.languages = { zh: '', en: '', ko: '', ja: '' };
        }
        
        // 确保文本颜色存在
        if (!this.newPoint.textColor) {
          this.newPoint.textColor = '#FFFFFF'; // 默认白色
        }
        
        // 检查是否有任何语言字段包含非空文本
        const hasText = Object.values(this.newPoint.languages).some(text => {
          return text && typeof text === 'string' && text.trim().length > 0;
        });
        
        if (!hasText) {
          alert('请至少输入一种语言的区域名称文本');
          return;
        }
      }
      
      try {
        RegionUtils.validatePoint(this.newPoint);
        
        if (this.editingPoint) {
          Object.assign(this.editingPoint, this.newPoint);
        } else {
          const newPoint = {
            id: RegionUtils.generateId(),
            ...this.newPoint,
            region: this.currentRegion === 'full' ? 'eastern-kingdoms' : this.currentRegion
          };
          
          // 特殊处理区域文本标注
          if (newPoint.type === 'regionText') {
            this.handleRegionTextExport(newPoint);
          }
          
          if (newPoint.type === 'dungeon' || newPoint.type === 'raid') {
            if (!this.mapData.points.dungeons) this.mapData.points.dungeons = [];
            this.mapData.points.dungeons.push(newPoint);
          } else if (newPoint.type === 'regionText') {
            // 区域文本标注单独存储
            if (!this.mapData.points.regionTexts) {
              this.mapData.points.regionTexts = [];
            }
            this.mapData.points.regionTexts.push(newPoint);
          } else {
            if (!this.mapData.points.flightPoints) this.mapData.points.flightPoints = [];
            this.mapData.points.flightPoints.push(newPoint);
          }
        }
        
        this.showAddDialog = false;
        this.addMarkerMode = false;
        this.editingPoint = null;
        this.resetNewPoint();
        this.drawMap();
        
      } catch (error) {
        alert('错误: ' + error.message);
      }
    },

    cancelAddPoint() {
      this.showAddDialog = false;
      this.editingPoint = null;
      this.resetNewPoint();
    },
    
    resetNewPoint() {
      this.newPoint = this.getDefaultNewPoint();
    },

    editPoint(point) {
      this.editingPoint = point;
      this.newPoint = {
        name: { ...point.name },
        type: point.type,
        faction: point.faction,
        position: { ...point.position },
        level: point.level || '',
        note: point.note ? { ...point.note } : { zh: '', en: '' },
        languages: point.languages ? { ...point.languages } : { zh: '', en: '', ko: '', ja: '' },
        textColor: point.textColor || '#FFFFFF',
        fontSize: point.fontSize || 24
      };
      this.showAddDialog = true;
    },

    // 修改：删除标记点时也要从 regionSubnames 中删除
    removePoint(point) {
      if (confirm(`确定要删除 "${point.name[this.currentLanguage]}" 吗？`)) {
        let index = -1;
        
        // 从对应的数据数组中删除
        if (this.mapData.points.flightPoints) {
          index = this.mapData.points.flightPoints.findIndex(p => p.id === point.id);
          if (index > -1) {
            this.mapData.points.flightPoints.splice(index, 1);
          }
        }
        
        if (index === -1 && this.mapData.points.dungeons) {
          index = this.mapData.points.dungeons.findIndex(p => p.id === point.id);
          if (index > -1) {
            this.mapData.points.dungeons.splice(index, 1);
          }
        }
        
        if (index === -1 && this.mapData.points.regionTexts) {
          index = this.mapData.points.regionTexts.findIndex(p => p.id === point.id);
          if (index > -1) {
            this.mapData.points.regionTexts.splice(index, 1);
          }
        }
        
        // 新增：如果是从 region-subnames.json 加载的标记，也要从内存数据中删除
        if (point.fromSubnames && Array.isArray(this.regionSubnames)) {
          const subnameIndex = this.regionSubnames.findIndex(item => item && item.id === point.id);
          if (subnameIndex > -1) {
            this.regionSubnames.splice(subnameIndex, 1);
          }
        }
        
        this.selectedPoint = null;
        this.drawMap();
      }
    },

    getDefaultNewRegion() {
      return {
        id: '',
        name: { zh: '', en: '' },
        bounds: null,
        image: '',
        imageName: '',
        canvasSize: { width: 0, height: 0 }
      };
    },

    async checkRegionImage() {
      if (!this.newRegion.imageName.trim()) {
        alert('请输入区域图片文件名');
        return;
      }
      
      const imagePath = `/images/maps/regions/${this.newRegion.imageName}`;
      
      try {
        const exists = await this.checkImageExists(imagePath);
        if (exists) {
          this.tempRegionImage = new Image();
          
          this.tempRegionImage.onload = () => {
            this.regionImagePreview = this.tempRegionImage.src;
            this.regionImageSize = {
              width: this.tempRegionImage.width,
              height: this.tempRegionImage.height
            };
            this.newRegion.canvasSize = { ...this.regionImageSize };
            
            this.regionImageStatus = {
              type: 'success',
              message: `✅ 文件加载成功: ${this.newRegion.imageName} (${this.tempRegionImage.width} × ${this.tempRegionImage.height})`
            };
          };
          
          this.tempRegionImage.onerror = () => {
            this.regionImageStatus = {
              type: 'error',
              message: `❌ 图片加载失败: ${imagePath}`
            };
            this.regionImagePreview = null;
            this.tempRegionImage = null;
          };
          
          this.regionImageStatus = {
            type: 'info',
            message: '🔄 正在加载图片...'
          };
          
          this.tempRegionImage.src = imagePath;
          
        } else {
          this.regionImageStatus = {
            type: 'error',
            message: `❌ 文件不存在: ${imagePath}`
          };
          this.regionImagePreview = null;
          this.tempRegionImage = null;
        }
      } catch (error) {
        this.regionImageStatus = {
          type: 'error',
          message: `❌ 检查文件时出错: ${error.message}`
        };
        this.regionImagePreview = null;
        this.tempRegionImage = null;
      }
    },

    async checkImageExists(url) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
      } catch (error) {
        return false;
      }
    },

    startRegionPlacement() {
      if (!this.tempRegionImage) {
        alert('请先检查并加载区域图片');
        return;
      }
      
      this.showRegionDialog = false;
      this.placingRegion = true;
      this.isPlacingRegion = false; // 等待用户第一次点击
      this.showRegionAdjustmentControls = true; // 显示调整控件
      this.canvas.style.cursor = 'crosshair';
      
      // 使用图片的实际尺寸作为默认大小，但缩小到合适比例
      const defaultScale = 0.3; // 30% 的原始大小
      this.regionPlacement = {
        x: 0,
        y: 0,
        width: Math.max(300, this.regionImageSize.width * defaultScale),
        height: Math.max(300, this.regionImageSize.height * defaultScale)
      };
      
      this.drawMap();
    },

    confirmRegionAdjustment() {
      if (!this.tempRegionImage || !this.regionPlacement.width || !this.regionPlacement.height) {
        alert('请先完成区域放置和调整');
        return;
      }
      
      // 进入最终确认阶段
      this.showRegionPlacementConfirm = true;
    },

    confirmRegionSave() {
      // 验证区域ID是否唯一
      const regionId = this.newRegion.id.toLowerCase();
      if (this.mapData.regions[regionId]) {
        alert(`区域ID "${regionId}" 已存在，请使用其他ID`);
        return;
      }
      
      // 构建区域数据
      const regionData = {
        name: { 
          zh: this.newRegion.name.zh || '中文名称',
          en: this.newRegion.name.en || this.newRegion.id.toLowerCase()
        },
        bounds: {
          x: Math.round(this.regionPlacement.x),
          y: Math.round(this.regionPlacement.y),
          width: Math.round(this.regionPlacement.width),
          height: Math.round(this.regionPlacement.height)
        },
        image: `/images/maps/regions/${this.newRegion.imageName}`,
        canvasSize: {
          width: this.regionImageSize.width,
          height: this.regionImageSize.height
        }
      };
      
      // 添加到地图数据
      if (!this.mapData.regions) this.mapData.regions = {};
      this.mapData.regions[regionId] = regionData;
      
      console.log('✅ 新添加的区域数据:', {
        id: regionId,
        bounds: regionData.bounds,
        image: regionData.image
      });
      
      alert(`✅ 区域 "${this.newRegion.name.zh}" 添加成功！\n\n位置: (${regionData.bounds.x}, ${regionData.bounds.y})\n尺寸: ${regionData.bounds.width} × ${regionData.bounds.height}\n\n区域地图块已添加到完整地图上。`);
      
      this.showRegionPlacementConfirm = false;
      this.cancelRegionPlacement();
      
      // 强制重绘地图以显示新区域
      this.drawMap();
    },

    cancelRegionPlacement() {
      this.placingRegion = false;
      this.isPlacingRegion = false;
      this.regionAdjustmentStage = false;
      this.showRegionAdjustmentControls = false;
      this.regionResizeHandle = null;
      this.isMovingRegion = false;
      this.tempRegionImage = null;
      this.regionImagePreview = null;
      this.regionImageStatus = null;
      this.newRegion = this.getDefaultNewRegion();
      this.canvas.style.cursor = 'grab';
      this.drawMap();
    },

    cancelAddRegion() {
      this.showRegionDialog = false;
      this.newRegion = this.getDefaultNewRegion();
      this.regionImagePreview = null;
      this.regionImageStatus = null;
      this.tempRegionImage = null;
    },

    // 修改：处理区域文本标注导出，现在保存到 regionSubnames 中
    handleRegionTextExport(regionTextPoint) {
      // 构建要保存到 region-subnames.json 的数据
      const subnameData = {
        id: regionTextPoint.id,
        position: {
          x: Math.round(regionTextPoint.position.x),
          y: Math.round(regionTextPoint.position.y)
        },
        languages: {},
        textColor: regionTextPoint.textColor || '#FFFFFF',
        fontSize: regionTextPoint.fontSize || 24
      };
      
      // 只添加有内容的语言
      Object.entries(regionTextPoint.languages).forEach(([lang, text]) => {
        if (text && text.trim()) {
          subnameData.languages[lang] = text.trim();
        }
      });
      
      // 添加到内存中的 regionSubnames 数据
      if (!this.regionSubnames) {
        this.regionSubnames = [];
      }
      
      // 检查是否已存在相同ID的条目
      const existingIndex = this.regionSubnames.findIndex(item => item.id === subnameData.id);
      if (existingIndex > -1) {
        this.regionSubnames[existingIndex] = subnameData;
      } else {
        this.regionSubnames.push(subnameData);
      }
      
      // 创建下载链接
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.regionSubnames, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "region-subnames.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      document.body.removeChild(downloadAnchorNode);
      
      // 显示提示信息
      alert(`区域名称标注已保存到 region-subnames.json 数据中！\n\n请用下载的文件替换原文件：\ndocs/public/data/region-subnames.json\n\n坐标: (${subnameData.position.x}, ${subnameData.position.y})\n文本颜色: ${subnameData.textColor}\n字体大小: ${subnameData.fontSize}px`);
      
      // 重新合并数据以确保界面显示最新内容
      this.mergeRegionSubnames();
      this.drawMap();
    },

    exportData() {
      if (!this.mapData) return;
      
      this.mapData.lastUpdated = new Date().toISOString().split('T')[0];

      // 创建只包含新添加区域的数据
      const newRegions = {};

      // 找出新添加的区域（排除默认的东部王国和卡利姆多）
      if (this.mapData.regions) {
        Object.entries(this.mapData.regions).forEach(([id, region]) => {
          if (id !== 'eastern-kingdoms' && id !== 'kalimdor') {
            newRegions[id] = {
              name: {
                zh: region.name.zh || '未命名区域',
                en: region.name.en || id.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')
              },
              bounds: {
                x: Math.round(region.bounds.x),
                y: Math.round(region.bounds.y),
                width: Math.round(region.bounds.width),
                height: Math.round(region.bounds.height)
              },
              image: region.image,
              canvasSize: {
                width: region.canvasSize.width,
                height: region.canvasSize.height
              }
            };
          }
        });
      }

      if (Object.keys(newRegions).length === 0) {
        alert('警告：没有找到任何新添加的区域数据，导出文件将为空。');
        return;
      }

      // 创建符合您要求格式的导出数据
      const exportData = {};
      Object.keys(newRegions).forEach(key => {
        exportData[key] = newRegions[key];
      });
      
      // 直接调用 RegionUtils.exportData 方法
      RegionUtils.exportData(exportData, 'wow-map-new-regions.json');
    },

    exportImage() {
      const oldViewport = { ...this.viewport };
      const oldHover = this.hoverPoint;
      const oldSelected = this.selectedPoint;
      this.hoverPoint = null;
      this.selectedPoint = null;
      this.exportInProgress = true;
      this.viewport = { scale: 1, offsetX: 0, offsetY: 0 };
      this.drawMap();
      const link = document.createElement('a');
      const regionName = this.currentRegion === 'full' ? 'complete' : this.currentRegion;
      link.download = `wow-map-${regionName}-${Date.now()}.webp`;
      link.href = this.canvas.toDataURL('image/webp', 0.9);
      link.click();
      this.viewport = oldViewport;
      this.hoverPoint = oldHover;
      this.selectedPoint = oldSelected;
      this.exportInProgress = false;
      this.drawMap();
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    async importData(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      try {
        const newData = await RegionUtils.importData(file);
        this.mapData = newData;
        event.target.value = '';
        this.drawMap();
        alert('数据导入成功！');
      } catch (error) {
        alert('导入失败: ' + error.message);
      }
    },

    updateDisplay() {
      this.drawMap();
    },

    getPointTypeName(type) {
      return this.mapData?.config?.pointTypes[type]?.name[this.currentLanguage] || type;
    },

    getFactionName(faction) {
      return this.mapData?.config?.factions[faction]?.name[this.currentLanguage] || faction;
    },

    // 获取语言名称
    getLanguageName(lang) {
      const languages = {
        zh: '中文',
        en: '英文',
        ko: '韩文',
        ja: '日文'
      };
      return languages[lang] || lang;
    }
  }
};
</script>