<template>
  <div class="legend-generator">
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="control-group">
        <label>图例样式:</label>
        <select v-model="legendStyle">
          <option value="classic">经典样式</option>
          <option value="modern">现代样式</option>
          <option value="minimal">简约样式</option>
          <option value="dark">深色主题</option>
          <option value="transparent">透明背景</option>
        </select>
      </div>
      
      <div class="control-group" v-if="!isTransparentBackground">
        <label>背景颜色:</label>
        <input type="color" v-model="backgroundColor">
        <input v-model="backgroundColor" class="color-input">
      </div>
      
      <div class="control-group">
        <label>文字颜色:</label>
        <input type="color" v-model="textColor">
        <input v-model="textColor" class="color-input">
      </div>
      
      <div class="control-group" v-if="!isTransparentBackground">
        <label>边框颜色:</label>
        <input type="color" v-model="borderColor">
        <input v-model="borderColor" class="color-input">
      </div>
      
      <!-- 修改：边框宽度控制 -->
      <div class="control-group">
        <label>边框宽度:</label>
        <select v-model="borderWidth">
          <option value="thin">细 (1px)</option>
          <option value="normal">标准 (2px)</option>
          <option value="thick">粗 (4px)</option>
          <option value="extra-thick">特粗 (6px)</option>
          <option value="custom">自定义</option>
        </select>
        <div v-if="borderWidth === 'custom'" class="custom-border-control">
          <input
            v-model.number="customBorderWidth"
            type="number"
            min="1"
            max="40"
            step="1"
            class="border-width-input"
            @input="updateCustomBorderWidth"
          >
          <span class="unit">px</span>
          <input
            v-model.number="customBorderWidth"
            type="range"
            min="1"
            max="40"
            step="1"
            class="border-width-slider"
            @input="updateCustomBorderWidth"
          >
        </div>
      </div>
      
      <!-- 修改：调整字体大小选项 -->
      <div class="control-group">
        <label>字体大小:</label>
        <select v-model="fontSize">
          <option value="14">小 (14px)</option>
          <option value="16">标准 (16px)</option>
          <option value="18">大 (18px)</option>
          <option value="20">特大 (20px)</option>
          <option value="22">超大 (22px)</option>
        </select>
      </div>
      
      <!-- 新增：标题字体大小 -->
      <div class="control-group">
        <label>标题大小:</label>
        <select v-model="titleSize">
          <option value="18">标准 (18px)</option>
          <option value="20">大 (20px)</option>
          <option value="22">特大 (22px)</option>
          <option value="24">超大 (24px)</option>
        </select>
      </div>
      
      <!-- 新增：标题加粗控制 -->
      <div class="control-group">
        <label>标题加粗:</label>
        <select v-model="titleFontWeight">
          <option value="300">细体</option>
          <option value="normal">正常</option>
          <option value="500">中等</option>
          <option value="600">半粗</option>
          <option value="bold">加粗</option>
          <option value="800">超粗</option>
          <option value="900">特粗</option>
        </select>
      </div>

      <!-- 新增：普通文本加粗控制 -->
      <div class="control-group">
        <label>文本加粗:</label>
        <select v-model="textFontWeight">
          <option value="300">细体</option>
          <option value="normal">正常</option>
          <option value="500" selected>中等</option>
          <option value="600">半粗</option>
          <option value="bold">加粗</option>
          <option value="800">超粗</option>
        </select>
      </div>

      <!-- 新增：分割线控制组 -->
      <div class="control-group">
        <label>分割线样式:</label>
        <select v-model="sectionDividerStyle">
          <option value="solid">实线</option>
          <option value="dashed">虚线</option>
          <option value="dotted">点线</option>
          <option value="double">双线</option>
          <option value="groove">凹槽</option>
          <option value="ridge">脊线</option>
        </select>
      </div>

      <div class="control-group">
        <label>分割线宽度:</label>
        <select v-model="sectionDividerWidth">
          <option value="1px">细 (1px)</option>
          <option value="2px">标准 (2px)</option>
          <option value="3px">粗 (3px)</option>
          <option value="4px">特粗 (4px)</option>
          <option value="5px">超粗 (5px)</option>
        </select>
      </div>

      <div class="control-group">
        <label>分割线颜色:</label>
        <input type="color" v-model="sectionDividerColor">
        <input v-model="sectionDividerColor" class="color-input">
        <button @click="sectionDividerColor = 'currentColor'" class="btn-small">使用文字颜色</button>
      </div>
      
      <!-- 虚线样式选择 -->
      <div class="control-group">
        <label>虚线样式:</label>
        <select v-model="dashStyle">
          <option value="dash-long">长虚线</option>
          <option value="dash-medium">中等虚线</option>
          <option value="dash-short">短虚线</option>
          <option value="dot">点状线</option>
          <option value="dash-dot">点划线</option>
        </select>
        <div class="dash-preview" :style="getDashPreviewStyle()"></div>
      </div>
      
      <div class="control-group">
        <label>图例项目:</label>
        <div class="checkbox-group">
          <label><input type="checkbox" v-model="showFlightPathsLegend" checked> 飞行路线</label>
          <label><input type="checkbox" v-model="showTransportLegend" checked> 交通系统</label>
          <label><input type="checkbox" v-model="showDungeonsLegend" checked> 副本标志</label>
          <label><input type="checkbox" v-model="showFactionLegend" checked> 阵营标记</label>
        </div>
      </div>
      
      <!-- 快速预设按钮 -->
      <div class="control-group">
        <label>快速预设:</label>
        <div class="preset-buttons">
          <button @click="applyPreset('bold')" class="btn-small">粗体模式</button>
          <button @click="applyPreset('light')" class="btn-small">细体模式</button>
          <button @click="applyPreset('modern')" class="btn-small">现代样式</button>
        </div>
      </div>
      
      <div class="control-group">
        <button @click="generateLegendImage" class="btn-primary">生成图例图片</button>
        <button @click="saveAsWebP" class="btn-primary">保存为WebP</button>
        <button @click="copyToClipboard" class="btn-secondary">复制到剪贴板</button>
        <button @click="resetSettings" class="btn-secondary">重置设置</button>
      </div>
      
      <!-- WebP质量设置 -->
      <div class="control-group" v-if="showImageDialog">
        <label>WebP质量:</label>
        <input type="range" v-model="webpQuality" min="0.1" max="1" step="0.1" style="width: 120px;">
        <span>{{ Math.round(webpQuality * 100) }}%</span>
        <small>质量越高，文件越大</small>
      </div>
    </div>
    
    <!-- 预览区域 -->
    <div class="preview-container">
      <div class="preview-header">
        <h3>图例预览</h3>
        <div class="preview-controls">
          <span>缩放: {{ previewScale }}x</span>
          <button @click="zoomInPreview" class="btn-small">+</button>
          <button @click="zoomOutPreview" class="btn-small">-</button>
          <button @click="resetPreview" class="btn-small">重置</button>
        </div>
      </div>
      
      <div class="preview-wrapper" ref="previewWrapper">
        <div class="legend-preview" :style="previewStyles" ref="legendPreview">
          <!-- 飞行路线图例 -->
          <div v-if="showFlightPathsLegend" class="legend-section">
            <h4 class="section-title" :style="titleStyle">飞行路线</h4>
            <div class="legend-item">
              <div class="legend-symbol">
                <div class="flight-line alliance" :style="getFlightLineStyle('alliance')"></div>
              </div>
              <div class="legend-text" :style="textStyle">联盟航线 (蓝色虚线)</div>
            </div>
            <div class="legend-item">
              <div class="legend-symbol">
                <div class="flight-line horde" :style="getFlightLineStyle('horde')"></div>
              </div>
              <div class="legend-text" :style="textStyle">部落航线 (红色虚线)</div>
            </div>
            <div class="legend-item">
              <div class="legend-symbol">
                <div class="flight-line neutral" :style="getFlightLineStyle('neutral')"></div>
              </div>
              <div class="legend-text" :style="textStyle">中立航线 (金色虚线)</div>
            </div>
          </div>
          
          <!-- 交通系统图例 -->
          <div v-if="showTransportLegend" class="legend-section">
            <h4 class="section-title" :style="titleStyle">交通系统</h4>
            <div class="legend-item">
              <div class="legend-symbol">
                <div class="transport-icon zeppelin">
                  <img v-if="icons.zeppelin" :src="icons.zeppelin.src" alt="飞艇">
                  <span v-else class="icon-fallback">🚁</span>
                </div>
              </div>
              <div class="legend-text" :style="textStyle">飞艇航线 (部落)</div>
            </div>
            <div class="legend-item">
              <div class="legend-symbol">
                <div class="transport-icon ship">
                  <img v-if="icons.ship" :src="icons.ship.src" alt="轮船">
                  <span v-else class="icon-fallback">🚢</span>
                </div>
              </div>
              <div class="legend-text" :style="textStyle">港口航线 (联盟)</div>
            </div>
            <div class="legend-item">
              <div class="legend-symbol">
                <div class="transport-icon special">
                  <img v-if="icons.special" :src="icons.special.src" alt="地铁">
                  <span v-else class="icon-fallback">🚇</span>
                </div>
              </div>
              <div class="legend-text" :style="textStyle">地铁标识 (联盟)</div>
            </div>
          </div>
          
          <!-- 副本标志图例 -->
          <div v-if="showDungeonsLegend" class="legend-section">
            <h4 class="section-title" :style="titleStyle">副本标志</h4>
            <div class="legend-item">
              <div class="legend-symbol">
                <div class="dungeon-icon dungeon">
                  <img v-if="icons.dungeon" :src="icons.dungeon.src" alt="5人副本">
                  <span v-else class="icon-fallback">⚔️</span>
                </div>
              </div>
              <div class="legend-text" :style="textStyle">5人副本 (蓝色)</div>
            </div>
            <div class="legend-item">
              <div class="legend-symbol">
                <div class="dungeon-icon raid">
                  <img v-if="icons.raid" :src="icons.raid.src" alt="团队副本">
                  <span v-else class="icon-fallback">🏰</span>
                </div>
              </div>
              <div class="legend-text" :style="textStyle">团队副本 (绿色)</div>
            </div>
          </div>
          
          <!-- 阵营标记图例 -->
          <div v-if="showFactionLegend" class="legend-section">
            <h4 class="section-title" :style="titleStyle">阵营标记</h4>
            <div class="legend-item">
              <div class="legend-symbol">
                <div class="faction-point alliance-point"></div>
              </div>
              <div class="legend-text" :style="textStyle">联盟城镇 (蓝色圆点)</div>
            </div>
            <div class="legend-item">
              <div class="legend-symbol">
                <div class="faction-point horde-point"></div>
              </div>
              <div class="legend-text" :style="textStyle">部落城镇 (红色圆点)</div>
            </div>
            <div class="legend-item">
              <div class="legend-symbol">
                <div class="faction-point neutral-point"></div>
              </div>
              <div class="legend-text" :style="textStyle">中立城镇 (金色圆点)</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 生成信息 -->
      <div class="generation-info">
        <div class="info-item">
          <span class="info-label">尺寸:</span>
          <span class="info-value">{{ previewSize.width }} × {{ previewSize.height }} 像素</span>
        </div>
        <div class="info-item">
          <span class="info-label">背景:</span>
          <span class="info-value" :style="{ backgroundColor: isTransparentBackground ? 'transparent' : backgroundColor }">
            {{ isTransparentBackground ? '透明' : backgroundColor }}
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">边框宽度:</span>
          <span class="info-value">{{ getBorderWidthName }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">虚线样式:</span>
          <span class="info-value">{{ getDashStyleName }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">标题粗细:</span>
          <span class="info-value">{{ getTitleFontWeightName }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">文本粗细:</span>
          <span class="info-value">{{ getTextFontWeightName }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">分割线:</span>
          <span class="info-value">{{ sectionDividerWidth }} {{ sectionDividerStyle }}</span>
        </div>
      </div>
    </div>
    
    <!-- 图片生成对话框 -->
    <div v-if="showImageDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>图例图片生成成功</h3>
        <div class="dialog-content">
          <div class="image-preview">
            <img :src="generatedImageUrl" alt="生成的图例图片" ref="generatedImage" 
                 :style="previewBackgroundStyle">
          </div>
          <div class="image-info">
            <p><strong>格式:</strong> WebP ({{ isTransparentBackground ? '透明背景' : '不透明背景' }})</p>
            <p><strong>尺寸:</strong> {{ generatedImageDimensions.width }} × {{ generatedImageDimensions.height }} 像素</p>
            <p><strong>质量:</strong> {{ Math.round(webpQuality * 100) }}%</p>
            <p><strong>文件大小:</strong> {{ generatedImageSizeKB }} KB</p>
            <p><strong>边框宽度:</strong> {{ getBorderWidthName }}</p>
            <p><strong>虚线样式:</strong> {{ getDashStyleName }}</p>
            <p><strong>标题粗细:</strong> {{ getTitleFontWeightName }}</p>
            <p><strong>文本粗细:</strong> {{ getTextFontWeightName }}</p>
            <p><strong>分割线样式:</strong> {{ sectionDividerWidth }} {{ sectionDividerStyle }}</p>
            <p v-if="isTransparentBackground" class="transparent-hint">
              ✅ 已启用透明背景，适合叠加在其他图片上
            </p>
          </div>
        </div>
        <div class="dialog-actions">
          <button @click="downloadImage" class="btn-primary">下载WebP</button>
          <button @click="copyImageToClipboard" class="btn-secondary" v-if="canCopyToClipboard">
            复制图片
          </button>
          <button @click="closeImageDialog" class="btn-secondary">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import html2canvas from 'html2canvas';

export default {
  name: 'LegendGenerator',
  
  data() {
    return {
      legendStyle: 'transparent',
      backgroundColor: '#1a1a2e',
      textColor: '#e6e6e6',
      borderColor: '#4a5568',
      fontSize: '16',
      titleSize: '20',
      titleFontWeight: 'bold',
      textFontWeight: '500',
      borderWidth: 'thick',
      dashStyle: 'dash-long',
      showFlightPathsLegend: true,
      showTransportLegend: true,
      showDungeonsLegend: true,
      showFactionLegend: true,
      previewScale: 1,
      previewSize: { width: 300, height: 400 },
      webpQuality: 0.9,
      icons: {
        zeppelin: null,
        ship: null,
        special: null,
        dungeon: null,
        raid: null
      },
      showImageDialog: false,
      generatedImageUrl: '',
      generatedFileSize: 0,
      generatedImageFormat: 'image/webp',
      generatedImageDimensions: { width: 0, height: 0 },
      customBorderWidth: 8,
      sectionDividerWidth: '2px',
      sectionDividerStyle: 'solid',
      sectionDividerColor: 'currentColor',
      
      stylePresets: {
        classic: {
          backgroundColor: '#1a1a2e',
          textColor: '#e6e6e6',
          borderColor: '#4a5568',
          borderWidth: 'thick',
          fontSize: '16',
          titleSize: '20',
          titleFontWeight: 'bold',
          textFontWeight: '500',
          sectionDividerWidth: '2px',
          sectionDividerStyle: 'solid'
        },
        modern: {
          backgroundColor: '#ffffff',
          textColor: '#2d3748',
          borderColor: '#e2e8f0',
          borderWidth: 'thick',
          fontSize: '16',
          titleSize: '20',
          titleFontWeight: '600',
          textFontWeight: '500',
          sectionDividerWidth: '1px',
          sectionDividerStyle: 'solid'
        },
        minimal: {
          backgroundColor: '#f8f9fa',
          textColor: '#2d3748',
          borderColor: '#dee2e6',
          borderWidth: 'normal',
          fontSize: '16',
          titleSize: '18',
          titleFontWeight: '600',
          textFontWeight: '400',
          sectionDividerWidth: '1px',
          sectionDividerStyle: 'dashed'
        },
        dark: {
          backgroundColor: '#0a0a0a',
          textColor: '#cccccc',
          borderColor: '#333333',
          borderWidth: 'thick',
          fontSize: '16',
          titleSize: '20',
          titleFontWeight: 'bold',
          textFontWeight: '500',
          sectionDividerWidth: '2px',
          sectionDividerStyle: 'solid'
        },
        transparent: {
          backgroundColor: 'transparent',
          textColor: '#ffffff',
          borderColor: 'transparent',
          borderWidth: 'normal',
          fontSize: '16',
          titleSize: '20',
          titleFontWeight: 'bold',
          textFontWeight: '600',
          sectionDividerWidth: '2px',
          sectionDividerStyle: 'solid'
        }
      },
      
      // 虚线样式预设
      dashStyles: {
        'dash-long': {
          name: '长虚线',
          pattern: [10, 5],
          lineCap: 'butt'
        },
        'dash-medium': {
          name: '中等虚线',
          pattern: [6, 3],
          lineCap: 'butt'
        },
        'dash-short': {
          name: '短虚线',
          pattern: [3, 2],
          lineCap: 'butt'
        },
        'dot': {
          name: '点状线',
          pattern: [1, 4],
          lineCap: 'round'
        },
        'dash-dot': {
          name: '点划线',
          pattern: [8, 4, 1, 4],
          lineCap: 'butt'
        }
      },
      borderWidths: {
        'thin': { name: '细边框', value: '1px' },
        'normal': { name: '标准边框', value: '2px' },
        'thick': { name: '粗边框', value: '4px' },
        'extra-thick': { name: '特粗边框', value: '6px' }
      }
    };
  },
  
  computed: {
    isTransparentBackground() {
      return this.legendStyle === 'transparent' || this.backgroundColor === 'transparent';
    },
    currentBorderWidth() {
      if (this.borderWidth === 'custom') {
        return `${this.customBorderWidth}px`;
      }
      return this.borderWidths[this.borderWidth]?.value || '4px';
    },
    
    textStyle() {
      return {
        fontSize: `${this.fontSize}px`,
        fontWeight: this.textFontWeight,
        lineHeight: '1.4',
        letterSpacing: '0.2px',
        textShadow: this.isTransparentBackground 
          ? '0 1px 2px rgba(0, 0, 0, 0.6)' 
          : '0 1px 1px rgba(0, 0, 0, 0.2)'
      };
    },
    
    titleStyle() {
      return {
        fontSize: `${this.titleSize}px`,
        fontWeight: this.titleFontWeight,
        marginBottom: '15px',
        paddingBottom: '12px',
        borderBottom: `${this.sectionDividerWidth} ${this.sectionDividerStyle} ${this.sectionDividerColor === 'currentColor' ? this.textColor : this.sectionDividerColor}`,
        textAlign: 'center',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        textShadow: this.isTransparentBackground 
          ? '0 2px 4px rgba(0, 0, 0, 0.9)' 
          : '0 2px 3px rgba(0, 0, 0, 0.3)'
      };
    },
    
    previewStyles() {
        const styles = {
            color: this.textColor,
            fontSize: `${this.fontSize}px`,
            transform: `scale(${this.previewScale})`,
            transformOrigin: 'top left'
        };
        const borderWidthValue = this.currentBorderWidth;
    
    if (!this.isTransparentBackground) {
        styles.backgroundColor = this.backgroundColor;
        styles.border = `${borderWidthValue} solid ${this.borderColor}`;
        styles.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.6)';
    } else {
        styles.backgroundColor = 'transparent';
        styles.backgroundImage = 'none';
        styles.border = `${borderWidthValue} solid ${this.textColor}`;
        styles.boxShadow = '0 0 12px rgba(0, 0, 0, 0.4)';
    }
        styles.padding = '30px';
        
        return styles;
    },
    
    previewBackgroundStyle() {
      if (this.isTransparentBackground) {
        return {
          backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%),
                           linear-gradient(-45deg, #ccc 25%, transparent 25%),
                           linear-gradient(45deg, transparent 75%, #ccc 75%),
                           linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        };
      }
      return {};
    },
    
    generatedImageSizeKB() {
      return this.generatedFileSize ? (this.generatedFileSize / 1024).toFixed(2) : '0';
    },
    
    getLegendStyleName() {
      const names = {
        classic: '经典样式',
        modern: '现代样式',
        minimal: '简约样式',
        dark: '深色主题',
        transparent: '透明背景'
      };
      return names[this.legendStyle] || '自定义样式';
    },
    
    getDashStyleName() {
      return this.dashStyles[this.dashStyle]?.name || '长虚线';
    },
    
    getBorderWidthName() {
      if (this.borderWidth === 'custom') {
        return `自定义 (${this.customBorderWidth}px)`;
      }
      return this.borderWidths[this.borderWidth]?.name || '粗边框';
    },

    getTitleFontWeightName() {
      const names = {
        '300': '细体',
        'normal': '正常',
        '400': '正常',
        '500': '中等',
        '600': '半粗', 
        'bold': '加粗',
        '700': '加粗',
        '800': '超粗',
        '900': '特粗'
      };
      return names[this.titleFontWeight] || this.titleFontWeight;
    },
    
    getTextFontWeightName() {
      const names = {
        '300': '细体',
        'normal': '正常',
        '400': '正常',
        '500': '中等',
        '600': '半粗', 
        'bold': '加粗',
        '700': '加粗',
        '800': '超粗'
      };
      return names[this.textFontWeight] || this.textFontWeight;
    }
  },
  
  watch: {
    legendStyle(newStyle) {
      if (this.stylePresets[newStyle]) {
        const preset = this.stylePresets[newStyle];
        this.backgroundColor = preset.backgroundColor;
        this.textColor = preset.textColor;
        this.borderColor = preset.borderColor;
        this.borderWidth = preset.borderWidth;
        this.fontSize = preset.fontSize;
        this.titleSize = preset.titleSize;
        this.titleFontWeight = preset.titleFontWeight;
        this.textFontWeight = preset.textFontWeight;
        this.sectionDividerWidth = preset.sectionDividerWidth;
        this.sectionDividerStyle = preset.sectionDividerStyle;
        this.sectionDividerColor = 'currentColor';
      }
    },
    
    previewScale(newScale) {
      this.$nextTick(() => {
        this.updatePreviewSize();
      });
    }
  },
  
  async mounted() {
    await this.loadIcons();
    this.updatePreviewSize();
    this.setupResizeObserver();
  },
  
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    // 清理生成的图片URL
    if (this.generatedImageUrl) {
      URL.revokeObjectURL(this.generatedImageUrl);
    }
  },
  
  methods: {
    updateCustomBorderWidth() {
      if (this.customBorderWidth < 1) this.customBorderWidth = 1;
      if (this.customBorderWidth > 40) this.customBorderWidth = 40;
      this.borderWidth = 'custom';
    },
    
    // 获取飞行路线样式
    getFlightLineStyle(faction) {
      // 阵营颜色
      const colors = {
        alliance: '#0078FF',
        horde: '#E10B00',
        neutral: '#FFD700'
      };
      
      const color = colors[faction] || colors.neutral;
      
      // 根据虚线样式创建背景图片
      const dashConfig = this.dashStyles[this.dashStyle];
      
      // 创建虚线效果的背景图片
      let backgroundImage = '';
      if (this.dashStyle === 'dot') {
        // 点状线
        backgroundImage = `radial-gradient(circle at 2px 2px, ${color} 2px, transparent 2px)`;
      } else {
        // 其他虚线样式
        const pattern = dashConfig.pattern;
        let gradientStops = '';
        
        if (this.dashStyle === 'dash-dot') {
          // 点划线特殊处理
          const total = pattern[0] + pattern[1] + pattern[2] + pattern[3];
          const p1 = (pattern[0] / total) * 100;
          const p2 = ((pattern[0] + pattern[1]) / total) * 100;
          const p3 = ((pattern[0] + pattern[1] + pattern[2]) / total) * 100;
          
          gradientStops = `
            ${color} 0%, ${color} ${p1}%,
            transparent ${p1}%, transparent ${p2}%,
            ${color} ${p2}%, ${color} ${p3}%,
            transparent ${p3}%, transparent 100%
          `;
        } else {
          // 普通虚线
          const total = pattern[0] + pattern[1];
          const percentage = (pattern[0] / total) * 100;
          
          gradientStops = `
            ${color} 0%, ${color} ${percentage}%,
            transparent ${percentage}%, transparent 100%
          `;
        }
        
        backgroundImage = `linear-gradient(90deg, ${gradientStops})`;
      }
      
      return {
        backgroundImage: backgroundImage,
        backgroundSize: this.getDashBackgroundSize(),
        backgroundRepeat: 'repeat-x',
        backgroundColor: 'transparent',
        height: '5px',
        width: '60px',
        border: 'none',
        margin: '12px 0'
      };
    },
    
    // 获取虚线背景尺寸
    getDashBackgroundSize() {
      const dashConfig = this.dashStyles[this.dashStyle];
      const pattern = dashConfig.pattern;
      
      if (this.dashStyle === 'dot') {
        return '8px 5px';
      } else if (this.dashStyle === 'dash-dot') {
        const total = pattern[0] + pattern[1] + pattern[2] + pattern[3];
        return `${total}px 5px`;
      } else {
        const total = pattern[0] + pattern[1];
        return `${total}px 5px`;
      }
    },
    
    // 获取虚线预览样式
    getDashPreviewStyle() {
      const dashConfig = this.dashStyles[this.dashStyle];
      const color = '#0078FF';
      
      let backgroundImage = '';
      if (this.dashStyle === 'dot') {
        backgroundImage = `radial-gradient(circle at 2px 2px, ${color} 2px, transparent 2px)`;
      } else {
        const pattern = dashConfig.pattern;
        
        if (this.dashStyle === 'dash-dot') {
          const total = pattern[0] + pattern[1] + pattern[2] + pattern[3];
          const p1 = (pattern[0] / total) * 100;
          const p2 = ((pattern[0] + pattern[1]) / total) * 100;
          const p3 = ((pattern[0] + pattern[1] + pattern[2]) / total) * 100;
          
          backgroundImage = `linear-gradient(90deg, 
            ${color} 0%, ${color} ${p1}%,
            transparent ${p1}%, transparent ${p2}%,
            ${color} ${p2}%, ${color} ${p3}%,
            transparent ${p3}%, transparent 100%
          )`;
        } else {
          const total = pattern[0] + pattern[1];
          const percentage = (pattern[0] / total) * 100;
          
          backgroundImage = `linear-gradient(90deg, 
            ${color} 0%, ${color} ${percentage}%,
            transparent ${percentage}%, transparent 100%
          )`;
        }
      }
      
      return {
        height: '5px',
        width: '80px',
        backgroundImage: backgroundImage,
        backgroundSize: this.getDashBackgroundSize(),
        backgroundRepeat: 'repeat-x',
        backgroundColor: 'transparent',
        border: 'none',
        margin: '0 10px',
        borderRadius: '0'
      };
    },
    
    // 加载图标
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
            this.icons[key] = img;
            resolve();
          };
          img.onerror = () => {
            console.warn(`无法加载图标: ${path}`);
            this.icons[key] = null;
            resolve();
          };
          img.src = path;
        });
      });
      
      await Promise.all(loadPromises);
      console.log('图例图标加载完成');
    },
    
    // 更新预览尺寸
    updatePreviewSize() {
      const previewElement = this.$refs.legendPreview;
      if (previewElement) {
        this.previewSize = {
          width: Math.ceil(previewElement.scrollWidth * this.previewScale),
          height: Math.ceil(previewElement.scrollHeight * this.previewScale)
        };
      }
    },
    
    // 监听尺寸变化
    setupResizeObserver() {
      this.$nextTick(() => {
        const previewElement = this.$refs.legendPreview;
        if (previewElement) {
          this.resizeObserver = new ResizeObserver(() => {
            this.updatePreviewSize();
          });
          this.resizeObserver.observe(previewElement);
        }
      });
    },
    
    // 缩放控制
    zoomInPreview() {
      this.previewScale = Math.min(2, this.previewScale + 0.1);
    },
    
    zoomOutPreview() {
      this.previewScale = Math.max(0.5, this.previewScale - 0.1);
    },
    
    resetPreview() {
      this.previewScale = 1;
    },
    
    // 重置设置
    resetSettings() {
      this.legendStyle = 'transparent';
      this.backgroundColor = 'transparent';
      this.textColor = '#ffffff';
      this.borderColor = 'transparent';
      this.borderWidth = 'thick';
      this.fontSize = '16';
      this.titleSize = '20';
      this.titleFontWeight = 'bold';
      this.textFontWeight = '500';
      this.webpQuality = 0.9;
      this.dashStyle = 'dash-long';
      this.customBorderWidth = 8;
      this.sectionDividerWidth = '2px';
      this.sectionDividerStyle = 'solid';
      this.sectionDividerColor = 'currentColor';
      
      this.showFlightPathsLegend = true;
      this.showTransportLegend = true;
      this.showDungeonsLegend = true;
      this.showFactionLegend = true;
      
      this.previewScale = 1;
    },
    
    // 快速应用预设
    applyPreset(presetName) {
      const presets = {
        bold: {
          titleFontWeight: 'bold',
          textFontWeight: '600',
          sectionDividerWidth: '3px',
          sectionDividerStyle: 'solid'
        },
        light: {
          titleFontWeight: '600',
          textFontWeight: 'normal',
          sectionDividerWidth: '1px',
          sectionDividerStyle: 'dashed'
        },
        modern: {
          titleFontWeight: '800',
          textFontWeight: '500',
          sectionDividerWidth: '2px',
          sectionDividerStyle: 'double'
        }
      };
      
      if (presets[presetName]) {
        Object.assign(this, presets[presetName]);
        alert(`已应用 ${presetName} 预设`);
      }
    },
    
    async generateLegendImage() {
      const previewElement = this.$refs.legendPreview;
      
      if (!previewElement) {
        alert('无法找到预览元素');
        return;
      }
      
      try {
        alert('正在生成图片，请稍候...');
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.left = '0';
        tempContainer.style.top = '0';
        tempContainer.style.width = '100vw';
        tempContainer.style.height = '100vh';
        tempContainer.style.zIndex = '9999';
        tempContainer.style.display = 'flex';
        tempContainer.style.justifyContent = 'center';
        tempContainer.style.alignItems = 'center';
        tempContainer.style.overflow = 'auto';
        if (this.isTransparentBackground) {
          tempContainer.style.backgroundColor = 'transparent';
          tempContainer.style.backgroundImage = 'none';
        } else {
          tempContainer.style.background = this.backgroundColor;
        }
        const clone = previewElement.cloneNode(true);
        clone.style.transform = 'scale(1)';
        clone.style.transformOrigin = 'top left';
        clone.style.position = 'relative';
        clone.style.margin = 'auto';
        const borderWidthValue = this.currentBorderWidth;
        if (this.isTransparentBackground) {
          clone.style.backgroundColor = 'transparent';
          clone.style.backgroundImage = 'none';
          clone.style.border = `${borderWidthValue} solid ${this.textColor}`;
        } else {
          clone.style.backgroundColor = this.backgroundColor;
          clone.style.border = `${borderWidthValue} solid ${this.borderColor}`;
        }
        
        // 应用其他样式
        clone.style.color = this.textColor;
        clone.style.fontSize = `${this.fontSize}px`;
        clone.style.borderRadius = '8px';
        clone.style.padding = '30px';
        clone.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.6)';
        clone.style.boxSizing = 'border-box';
        
        // 应用标题样式
        const titleElements = clone.querySelectorAll('.section-title');
        titleElements.forEach(title => {
          title.style.fontSize = `${this.titleSize}px`;
          title.style.fontWeight = this.titleFontWeight;
          title.style.marginBottom = '15px';
          title.style.paddingBottom = '12px';
          title.style.borderBottom = `${this.sectionDividerWidth} ${this.sectionDividerStyle} ${this.sectionDividerColor === 'currentColor' ? this.textColor : this.sectionDividerColor}`;
          title.style.textAlign = 'center';
          title.style.textTransform = 'uppercase';
          title.style.letterSpacing = '1px';
          title.style.textShadow = this.isTransparentBackground 
            ? '0 2px 4px rgba(0, 0, 0, 0.9)' 
            : '0 2px 3px rgba(0, 0, 0, 0.3)';
        });
        
        // 应用文本样式
        const textElements = clone.querySelectorAll('.legend-text');
        textElements.forEach(text => {
          text.style.fontSize = `${this.fontSize}px`;
          text.style.fontWeight = this.textFontWeight;
          text.style.lineHeight = '1.4';
          text.style.letterSpacing = '0.2px';
          text.style.textShadow = this.isTransparentBackground 
            ? '0 1px 2px rgba(0, 0, 0, 0.6)' 
            : '0 1px 1px rgba(0, 0, 0, 0.2)';
        });
        
        tempContainer.appendChild(clone);
        document.body.appendChild(tempContainer);
        
        // 确保所有资源加载完成
        await this.waitForAllResources(clone);
        
        // 计算实际尺寸（包括边框和内边距）
        const rect = clone.getBoundingClientRect();
        const width = Math.ceil(rect.width);
        const height = Math.ceil(rect.height);
        
        console.log('生成尺寸（包含边框）:', width, 'x', height);
        
        // 生成 canvas - 确保捕获所有内容（包括边框）
        const canvas = await html2canvas(clone, {
          // 关键修复：透明模式下，backgroundColor必须是null才能生成透明背景
          backgroundColor: this.isTransparentBackground ? null : this.backgroundColor,
          scale: 2, // 2倍缩放以获得更高清的图片
          useCORS: true,
          allowTaint: false,
          logging: false,
          imageTimeout: 15000,
          width: width,
          height: height,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          ignoreElements: (element) => {
            // 确保不会忽略任何需要的元素
            return false;
          },
          onclone: (document, element) => {
            // 确保克隆的元素样式正确
            element.style.transform = 'none';
            element.style.position = 'absolute';
            element.style.left = '0';
            element.style.top = '0';
            element.style.margin = 'auto';
            
            // 确保样式正确 - 特别注意边框和背景
            if (this.isTransparentBackground) {
              
              // 透明模式：确保背景透明，保留边框
              element.style.backgroundColor = 'transparent';
              element.style.backgroundImage = 'none';
              element.style.border = `${borderWidthValue} solid ${this.textColor}`;
              element.style.boxShadow = '0 0 12px rgba(0, 0, 0, 0.4)';
            } else {
              element.style.backgroundColor = this.backgroundColor;
              element.style.border = `${borderWidthValue} solid ${this.borderColor}`;
              element.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.6)';
            }
            
            element.style.color = this.textColor;
            element.style.fontSize = `${this.fontSize}px`;
            element.style.borderRadius = '8px';
            element.style.padding = '30px';
            element.style.boxSizing = 'border-box';
            
            // 修复标题样式
            const titleElements = element.querySelectorAll('.section-title');
            titleElements.forEach(title => {
              title.style.fontSize = `${this.titleSize}px`;
              title.style.fontWeight = this.titleFontWeight;
              title.style.marginBottom = '15px';
              title.style.paddingBottom = '12px';
              title.style.borderBottom = `${this.sectionDividerWidth} ${this.sectionDividerStyle} ${this.sectionDividerColor === 'currentColor' ? this.textColor : this.sectionDividerColor}`;
              title.style.textAlign = 'center';
              title.style.textTransform = 'uppercase';
              title.style.letterSpacing = '1px';
              title.style.textShadow = this.isTransparentBackground 
                ? '0 2px 4px rgba(0, 0, 0, 0.9)' 
                : '0 2px 3px rgba(0, 0, 0, 0.3)';
            });
            
            // 修复文本样式
            const textElements = element.querySelectorAll('.legend-text');
            textElements.forEach(text => {
              text.style.fontSize = `${this.fontSize}px`;
              text.style.fontWeight = this.textFontWeight;
              text.style.lineHeight = '1.4';
              text.style.letterSpacing = '0.2px';
              text.style.whiteSpace = 'nowrap';
              text.style.overflow = 'visible';
              text.style.textAlign = 'right';
              text.style.textShadow = this.isTransparentBackground 
                ? '0 1px 2px rgba(0, 0, 0, 0.6)' 
                : '0 1px 1px rgba(0, 0, 0, 0.2)';
            });
            
            // 修复所有虚线样式
            const flightLines = element.querySelectorAll('.flight-line');
            flightLines.forEach(line => {
              const faction = Array.from(line.classList).find(cls =>
                cls.includes('alliance') || cls.includes('horde') || cls.includes('neutral')
              );
              if (faction) {
                const style = this.getFlightLineStyle(faction.replace('-point', ''));
                Object.entries(style).forEach(([key, value]) => {
                  line.style[key] = value;
                });
              }
            });
            
            // 确保所有图标正确显示
            const icons = element.querySelectorAll('img');
            icons.forEach(img => {
              if (img.src && img.complete) {
                img.style.display = 'block';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
              }
            });

            // 确保所有图标容器正确显示
            const symbolContainers = element.querySelectorAll('.legend-symbol');
            symbolContainers.forEach(container => {
              container.style.minWidth = '80px';
              container.style.display = 'flex';
              container.style.justifyContent = 'center';
              container.style.alignItems = 'center';
              container.style.marginRight = '20px';
              container.style.flexShrink = '0';
            });
          }
        });
        
        // 清理临时容器
        document.body.removeChild(tempContainer);
        
        // 转换为 WebP 格式
        const webpDataUrl = canvas.toDataURL('image/webp', this.webpQuality);
        
        // 计算文件大小
        const base64Length = webpDataUrl.length - 'data:image/webp;base64,'.length;
        const fileSize = Math.floor(base64Length * 0.75); // 近似计算
        
        // 更新生成图片信息
        this.generatedImageUrl = webpDataUrl;
        this.generatedImageFormat = 'image/webp';
        this.generatedFileSize = fileSize;
        this.generatedImageDimensions = {
          width: canvas.width,
          height: canvas.height
        };
        
        this.showImageDialog = true;
        
      } catch (error) {
        console.error('生成图片失败:', error);
        alert(`生成图片失败: ${error.message}\n\n请检查控制台查看详细错误信息。`);
      }
    },
    
    // 等待所有资源加载完成
    waitForAllResources(element) {
      return new Promise((resolve) => {
        const images = element.getElementsByTagName('img');
        let loadedCount = 0;
        const totalImages = images.length;
        
        // 如果没有图片，直接解析
        if (totalImages === 0) {
          resolve();
          return;
        }
        
        const checkLoaded = () => {
          loadedCount++;
          console.log(`图片加载: ${loadedCount}/${totalImages}`);
          if (loadedCount === totalImages) {
            resolve();
          }
        };
        
        Array.from(images).forEach(img => {
          if (img.complete && img.naturalWidth !== 0) {
            checkLoaded();
          } else {
            img.onload = checkLoaded;
            img.onerror = () => {
              console.warn(`图片加载失败: ${img.src}`);
              checkLoaded();
            };
            
            // 如果图片有src但是还没有开始加载，尝试加载
            if (img.src && !img.complete) {
              img.load();
            }
          }
        });
        
        // 设置超时，防止无限等待
        setTimeout(() => {
          console.log('资源加载超时，继续生成');
          resolve();
        }, 3000);
      });
    },
    
    // 保存为WebP
    async saveAsWebP() {
      await this.generateLegendImage();
    },
    
    // 等待图片加载
    waitForImages(element) {
      return new Promise((resolve) => {
        const images = element.getElementsByTagName('img');
        let loadedCount = 0;
        const totalImages = images.length;
        
        if (totalImages === 0) {
          resolve();
          return;
        }
        
        const checkLoaded = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            resolve();
          }
        };
        
        Array.from(images).forEach(img => {
          if (img.complete) {
            checkLoaded();
          } else {
            img.onload = checkLoaded;
            img.onerror = checkLoaded;
          }
        });
      });
    },
    
    // 下载WebP图片
    downloadImage() {
      if (!this.generatedImageUrl) {
        alert('请先生成图片');
        return;
      }
      
      const link = document.createElement('a');
      link.href = this.generatedImageUrl;
      link.download = `wow-map-legend-${Date.now()}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 显示下载成功消息
      alert(`✅ WebP图片下载成功！\n\n文件名: wow-map-legend.webp\n尺寸: ${this.generatedImageDimensions.width} × ${this.generatedImageDimensions.height} 像素\n格式: WebP (${this.isTransparentBackground ? '透明背景' : '不透明背景'})`);
    },
    
    // 复制到剪贴板
    async copyToClipboard() {
      try {
        // 生成临时图片
        await this.generateLegendImage();
        
        // 复制图片到剪贴板
        const success = await this.copyImageToClipboard();
        
        if (success) {
          this.showImageDialog = false;
          alert('✅ 图例图片已复制到剪贴板！\n\n格式: WebP\n背景: ' + (this.isTransparentBackground ? '透明' : '自定义'));
        }
      } catch (error) {
        console.error('复制失败:', error);
        alert(`❌ 复制失败: ${error.message}\n\n请尝试下载图片或检查浏览器权限。`);
      }
    },
    
    // 复制图片到剪贴板
    async copyImageToClipboard() {
      try {
        if (!this.generatedImageUrl) {
          throw new Error('没有可复制的图片');
        }
        
        // 获取WebP图片的Blob
        const response = await fetch(this.generatedImageUrl);
        const blob = await response.blob();
        
        // 检查浏览器是否支持复制图片
        if (!navigator.clipboard || !navigator.clipboard.write) {
          throw new Error('您的浏览器不支持复制图片到剪贴板');
        }
        
        // 创建剪贴板项目
        const clipboardItem = new ClipboardItem({
          'image/webp': blob
        });
        
        // 写入剪贴板
        await navigator.clipboard.write([clipboardItem]);
        
        return true;
      } catch (error) {
        console.error('复制图片失败:', error);
        
        // 备选方案：尝试使用PNG格式
        try {
          if (this.generatedImageUrl && !this.isTransparentBackground) {
            // 如果是非透明背景，可以尝试转换为PNG
            const img = new Image();
            img.src = this.generatedImageUrl;
            
            await new Promise((resolve) => {
              img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob(async (blob) => {
                  const clipboardItem = new ClipboardItem({
                    'image/png': blob
                  });
                  await navigator.clipboard.write([clipboardItem]);
                  resolve();
                }, 'image/png');
              };
            });
            
            return true;
          }
        } catch (fallbackError) {
          console.error('备选方案也失败:', fallbackError);
        }
        
        alert('❌ 复制图片失败，请尝试下载图片或使用其他浏览器。\n\n支持复制图片的浏览器：Chrome 76+, Edge 79+, Opera 63+');
        return false;
      }
    },
    
    // 关闭对话框
    closeImageDialog() {
      this.showImageDialog = false;
      // 清理生成的图片URL以释放内存
      if (this.generatedImageUrl) {
        URL.revokeObjectURL(this.generatedImageUrl);
        this.generatedImageUrl = '';
      }
    },
    
    // 检查是否支持复制图片到剪贴板
    get canCopyToClipboard() {
      return navigator.clipboard && 'write' in navigator.clipboard;
    }
  }
};
</script>

<style scoped>
.legend-generator {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.control-panel {
  background: #2d3748;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.control-group {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.control-group label {
  min-width: 100px;
  color: #e2e8f0;
  font-weight: 500;
  font-size: 16px;
}

.control-group input[type="color"] {
  width: 50px;
  height: 30px;
  border: 2px solid #4a5568;
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
}

.color-input {
  width: 100px;
  padding: 6px 12px;
  border: 2px solid #4a5568;
  border-radius: 4px;
  background: #1a202c;
  color: #e2e8f0;
  font-family: monospace;
  font-size: 14px;
}

.control-group input[type="range"] {
  width: 120px;
  height: 8px;
  background: #4a5568;
  border-radius: 4px;
  outline: none;
}

.control-group small {
  color: #a0aec0;
  font-size: 14px;
  margin-left: 10px;
}

.dash-preview {
  height: 5px;
  width: 80px;
  border: none;
  margin: 0 10px;
  border-radius: 0;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: auto;
  font-size: 16px;
}

.checkbox-group input[type="checkbox"] {
  margin: 0;
  transform: scale(1.2);
}

.custom-border-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 10px;
  background: #1a202c;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #4a5568;
}

.border-width-input {
  width: 60px;
  padding: 6px 10px;
  border: 1px solid #4a5568;
  border-radius: 4px;
  background: #2d3748;
  color: #e2e8f0;
  font-size: 14px;
  text-align: center;
}

.border-width-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.3);
}

.unit {
  color: #a0aec0;
  font-size: 14px;
  font-weight: 500;
}

.border-width-slider {
  width: 80px;
  height: 6px;
  background: #4a5568;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.border-width-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #4299e1;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #2d3748;
}

.border-width-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #4299e1;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #2d3748;
}

.btn-primary, .btn-secondary, .btn-small {
  padding: 10px 20px;
  border: 2px solid;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 16px;
}

.btn-primary {
  background: #4299e1;
  color: white;
  border-color: #3182ce;
}

.btn-primary:hover {
  background: #3182ce;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-secondary {
  background: #718096;
  color: white;
  border-color: #4a5568;
}

.btn-secondary:hover {
  background: #4a5568;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-small {
  padding: 6px 12px;
  font-size: 14px;
  background: #4a5568;
  color: white;
  border: 1px solid #2d3748;
}

.btn-small:hover {
  background: #2d3748;
}

.preset-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.preview-container {
  background: #1a202c;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #2d3748;
  border-bottom: 2px solid #4a5568;
}

.preview-header h3 {
  margin: 0;
  color: #e2e8f0;
  font-size: 20px;
  font-weight: bold;
}

.preview-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
}

.preview-wrapper {
  padding: 30px;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(45deg, #2d3748 25%, transparent 25%),
              linear-gradient(-45deg, #2d3748 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #2d3748 75%),
              linear-gradient(-45deg, transparent 75%, #2d3748 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  overflow: auto;
}

/* 确保所有内容都能正确导出 */
.legend-preview * {
  box-sizing: border-box;
}

.legend-preview {
  background: var(--bg-color, transparent);
  color: var(--text-color, #ffffff);
  border: 4px solid var(--border-color, rgba(255, 255, 255, 0.4));
  border-radius: 8px;
  padding: 30px;
  width: 100%;
  max-width: 500px;
  min-width: 400px;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.6);
  transform-origin: top left;
  transition: transform 0.2s ease, background-color 0.3s ease, border-color 0.3s ease, border-width 0.3s ease;
  margin: 0 auto;
  overflow: visible;
  box-sizing: border-box;
}

.legend-section {
  margin-bottom: 30px;
  width: 100%;
  box-sizing: border-box;
}

.legend-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 15px 0;
  opacity: 0.9;
  font-size: 1.4em;
  color: inherit;
  position: relative;
  transition: all 0.3s ease;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 25%;
  width: 50%;
  height: 1px;
  background: linear-gradient(90deg, transparent, currentColor 50%, transparent);
  opacity: 0.3;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
  min-height: 50px;
  box-sizing: border-box;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.legend-symbol {
  min-width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  flex-shrink: 0;
}

/* 防止文本换行，确保完整导出 */
.legend-text {
  flex: 1;
  color: inherit;
  text-align: right;
  padding-left: 10px;
  word-break: keep-all;
  white-space: nowrap !important;
  overflow: visible !important;
  text-overflow: clip;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
}

/* 飞行路线样式 - 使用背景图片创建虚线 */
.flight-line {
  height: 5px;
  width: 60px;
  margin: 12px 0;
  border: none;
  border-radius: 0;
  background-color: transparent;
  display: block !important;
}

/* 交通图标样式 */
.transport-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.transport-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 3px rgba(0,0,0,0.9));
}

.icon-fallback {
  font-size: 28px;
  filter: drop-shadow(0 0 4px rgba(0,0,0,0.9));
}

/* 副本图标样式 */
.dungeon-icon {
  width: 36px; 
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dungeon-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 4px rgba(0,0,0,0.9));
}

/* 阵营标记点样式 */
.faction-point {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 6px rgba(0,0,0,0.9);
}

.faction-point.alliance-point {
  background: #0078FF;
}

.faction-point.horde-point {
  background: #E10B00;
}

.faction-point.neutral-point {
  background: #FFD700;
}

.faction-point.capital {
  width: 32px;
  height: 32px;
  background: #FF6B6B;
  border-width: 4px;
}

.generation-info {
  padding: 20px;
  background: #2d3748;
  border-top: 2px solid #4a5568;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  color: #e2e8f0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 0 auto;
}

.info-label {
  font-weight: 600;
  opacity: 0.9;
  font-size: 16px;
}

.info-value {
  padding: 5px 10px;
  background: #4a5568;
  border-radius: 6px;
  font-family: monospace;
  font-size: 16px;
  min-width: 120px;
  text-align: center;
  border: 1px solid #718096;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: #2d3748;
  border-radius: 10px;
  padding: 25px;
  max-width: 650px;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7);
  border: 2px solid #4a5568;
}

.dialog h3 {
  margin: 0 0 25px 0;
  color: #e2e8f0;
  text-align: center;
  font-size: 22px;
  font-weight: bold;
}

.image-preview {
  margin-bottom: 25px;
  border: 2px solid #4a5568;
  border-radius: 6px;
  overflow: hidden;
  background: white;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

.image-info {
  background: #4a5568;
  padding: 20px;
  border-radius: 6px;
  color: #e2e8f0;
  margin-bottom: 25px;
  border: 1px solid #718096;
}

.image-info p {
  margin: 8px 0;
  display: flex;
  justify-content: space-between;
  font-size: 16px;
}

.image-info p strong {
  opacity: 0.9;
  font-weight: 600;
}

.transparent-hint {
  color: #90ee90;
  font-style: italic;
  margin-top: 15px !important;
  padding-top: 15px;
  border-top: 2px solid #718096;
  font-size: 16px;
}

.dialog-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

/* WebP格式提示 */
.webp-info {
  background: #4299e1;
  color: white;
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 15px;
  font-size: 16px;
  text-align: center;
  border: 1px solid #3182ce;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .control-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .control-group label {
    margin-bottom: 5px;
    min-width: auto;
  }
  
  .checkbox-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .preview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .preview-controls {
    align-self: flex-end;
  }
  
  .generation-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .dialog {
    margin: 10px;
    max-width: calc(100% - 20px);
  }
  
  .legend-preview {
    min-width: 350px;
    padding: 25px;
  }
  
  .legend-symbol {
    min-width: 70px;
    margin-right: 15px;
  }
  
  .legend-text {
    font-size: 15px;
  }
  
  /* 移动端自定义边框控制 */
  .custom-border-control {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    margin-left: 0;
    margin-top: 10px;
  }
  
  .border-width-input {
    width: 100%;
  }
  
  .border-width-slider {
    width: 100%;
  }
  
  .preset-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .info-item {
    flex: 1 0 100%;
  }
  
  .info-value {
    min-width: auto;
    flex: 1;
  }
}
</style>