import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import { useData } from 'vitepress';
import MapViewer from './components/MapViewer.vue';
import NotFound from './components/NotFound.vue';
import './styles/custom.scss';
import './styles/rainbow.css';

export default {
  extends: DefaultTheme,
  
  Layout: () => {
    const { frontmatter, page } = useData();
    
    const isMapPage = page.value?.filePath?.includes('map') || 
                     page.value?.relativePath?.includes('map') ||
                     frontmatter.value?.layoutClass === 'map-page';
    
    const props = {
      class: frontmatter.value?.layoutClass || (isMapPage ? 'map-page' : '')
    };
    
    if (isMapPage) {
      return h(DefaultTheme.Layout, props, {
        'sidebar': () => null,
        'aside': () => null,
        'doc-before': () => null,
        'doc-after': () => null,
        'not-found': () => h(NotFound)
      });
    }
    
    return h(DefaultTheme.Layout, props, {
      'not-found': () => h(NotFound)
    });
  },
  
  enhanceApp({ app }) {
    // 注册地图组件
    app.component('MapViewer', MapViewer);
    
    // 开发模式下暴露全局地图对象
    if (import.meta.env?.DEV) {
      app.config.globalProperties.$mapDebug = {
        version: '1.0.0',
        features: ['webp-tiles', 'hot-reload', 'export-function']
      };
    }
  }
};