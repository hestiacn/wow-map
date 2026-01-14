import navConfig from "./nav";
import LocalSearchPlugin from "./plugins/localSearchPlugin.js"

const BUILD_YEAR = new Date().getFullYear();

export default {
  lang: 'zh-CN',
  markdown: { codeCopyButtonTitle: '复制' },
  title: '魔兽世界地图库 | 交互式 WebP 地图',
  description: '魔兽世界交互式地图查看器 - 基于 HTML5 Canvas 和 WebP 技术，支持卡利姆多、东部王国等大陆的探索，提供多语言标注、实时预览和地图导出功能。',
  cleanUrls: false,
  head: [
    ['script', {}, `(function(){function updateYear(){var el=document.getElementById('dynamicYear');if(el){var year=new Date().getFullYear();el.textContent!==year.toString()&&(el.textContent=year);}}document.readyState==='loading'?document.addEventListener('DOMContentLoaded',updateYear):updateYear();setInterval(updateYear,3600000);})();`],
    ['meta', {name: 'viewport',content: 'width=device-width, initial-scale=1.0, viewport-fit=cover'}],
    ['meta', { name: 'theme-color', content: '#ffd100' }],
    ['meta', { name: 'keywords', content: '魔兽世界交互式地图 - 基于 HTML5 Canvas 和 WebP 技术' }],
    ['link', { rel: 'icon', href: '/favicon.pub/favicon.ico', type: 'image/x-icon'}],
    ['link', { rel: 'icon', href: '/favicon.pub/favicon-16x16.png', type: 'image/png', sizes: '16x16'}],
    ['link', { rel: 'icon', href: '/favicon.pub/favicon-32x32.png', type: 'image/png', sizes: '32x32'}],
    ['link', { rel: 'icon', href: '/favicon.pub/favicon-48x48.png', type: 'image/png', sizes: '48x48'}],
    ['link', { rel: 'apple-touch-icon', href: '/favicon.pub/apple-touch-icon.png', sizes: '180x180'}],
    ['link', { rel: 'icon', href: '/favicon.pub/android-chrome-192x192.png', sizes: '192x192', type: 'image/png'}],
    ['link', { rel: 'icon', href: '/favicon.pub/favicon.svg', type: 'image/svg+xml'}],
    ['link', { rel: 'mask-icon', href: '/favicon.pub/safari-pinned-tab.svg', color: '#ffd100'}],
    ['link', { rel: 'manifest', href: '/favicon.pub/site.webmanifest'}],
    // ['script', { defer: true,src: 'https://cloud.umami.is/script.js','data-website-id': 'YOUR_WEBSITE_ID'}],
  ],
  vite: {
    plugins: [LocalSearchPlugin()]
  },
  themeConfig: {
    logo: "/nav.webp",
    siteTitle: '魔兽世界地图编辑工具库',
    nav: navConfig.nav,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/hestiacn/wow-map' },
    ],
    search: {
      provider: "local",
      options: {
        placeholder: "搜索地图文档",
        minMatchCharLength: 1,
        threshold: 0.3,
        distance: 10000,
        keys: ["title", "content", "headers"],
        tokenize: (text) => {
          return text.split('').filter(char => char.trim());
        },
        translations: {
          button: { buttonText: "搜索文档" },
          modal: {
            noResultsText: "未找到相关内容",
            displayDetails: "显示详细信息",
            resetButtonTitle: "清除搜索条件",
            errorScreen: {
              titleText: "无法获取结果",
              helpText: "请检查网络连接",
            },
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭",},},
        },
      },
    },
    sidebar: {
      '/': [
        {
          text: '地图版本',
          collapsed: false,
          items: [
            { text: '60版本旧世界大陆-制作中', link: '/docs/map/60-vanilla' },
            { text: '70版本燃烧的远征-计划中', link: '/docs/map/70-tbc' },
            { text: '80版本燃烧的远征-计划中', link: '/docs/map/80-wotlk' }
          ]
        },
        {
          text: '使用说明',
          collapsed: false,
          items: [
            { text: '开发背景', link: '/docs/help/dev' },
            { text: '使用说明', link: '/docs/help/use' },
            { text: '更新日志', link: '/docs/CHANGELOG' }
          ]
        }
      ]
    },
    outlineTitle: "页面导航",
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    editLink: {
      pattern: 'https://github.com/hestiacn/wow-map/edit/master/docs/:path',
      text: '在 微信开发平台 上编辑此页面',
    },
    footer: {
      message: '基于 <a href="https://developer.mozilla.org/docs/Web/API/Canvas_API" target="_blank" title="MDN Canvas API 文档"><img src="https://img.shields.io/badge/Canvas-API-orange?logo=html5" alt="Canvas API" style="display: inline-block !important; height: 20px; margin: -4px 0 0 3px; vertical-align: middle;"></a> 与 <a href="https://vitepress.dev" target="_blank" title="VitePress 官方站点"><img src="https://img.shields.io/npm/v/vitepress?style=flat-square&logo=vite&logoColor=white&label=VitePress&color=646cff" alt="VitePress" style="display: inline-block !important; height: 20px; margin: -4px 0 0 3px; vertical-align: middle;"></a> 框架构建',
     
      copyright: '版权所有 © 2024-<span id="dynamicYear">' + BUILD_YEAR + '</span> 魔兽世界地图库 | 版权归属: <a href="https://www.blizzard.com" target="_blank" title="暴雪娱乐官方网站"><img src="https://img.shields.io/badge/Blizzard-Classic-005AC2?labelColor=005AC2&color=FFD100" alt="Blizzard" style="display: inline-block !important; height: 20px; margin: -4px 0 0 3px; vertical-align: middle;"></a>'
    },
    sidebarMenuLabel: '功能目录',
    darkModeSwitchLabel: '主题切换',
    returnToTopLabel: '返回顶部',
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium',
        timeZone: 'Asia/Shanghai'
      },
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
  },
};