import nav from "./nav";
import LocalSearchPlugin from "./plugins/localSearchPlugin.js"

export default {
  markdown: {
    codeCopyButtonTitle: '复制'
  },
  locale: 'zh_CN', 
  title: '魔兽世界地图库 | 交互式 WebP 瓦片地图',
  description: '魔兽世界交互式地图查看器 - 基于 Leaflet 和 WebP 瓦片技术，支持卡利姆多、东部王国等大陆的探索，提供多语言标注、实时预览和地图导出功能。',
  cleanUrls: false,
  head: [
    ['meta', {name: 'viewport',content: 'width=device-width, initial-scale=1.0, viewport-fit=cover'}],
    ['meta', { name: 'theme-color', content: '#ffd100' }],
    ['meta', { name: 'keywords', content: '魔兽世界地图,WebP瓦片地图,Leaflet地图,艾泽拉斯,卡利姆多,东部王国' }],
    ['link', { rel: 'icon', sizes: 'any', href: '/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', sizes: '16x16', href: '/logo.svg' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    // ['script', { defer: true,src: 'https://cloud.umami.is/script.js','data-website-id': 'YOUR_WEBSITE_ID'}],
  ],
  vite: {
    plugins: [LocalSearchPlugin()]
  },
  themeConfig: {
    logo: "/nav.webp",
    siteTitle: '魔兽世界地图编辑工具库',
    nav: [
      { text: '首页', link: '/' },
      { text: '文档查看', link: 'docs/help/use' },
      { text: '地图制作', link: 'docs/map' },
      { text: '图例标识', link: 'docs/Legend' },
      { text: '图片查看', link: 'images/demo/demo.webp' },
      { text: '项目源码', link: 'https://github.com/hestiacn/wow-map' }
    ],
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
      pattern: 'https://github.com/hestiacn/wow-map/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面',
    },
    footer: {
      message: '基于 HTML5 <a href="https://developer.mozilla.org/docs/Web/API/Canvas_API " target="_blank">Canvas API</a> 与<a href="https://vitepress.dev/ " target="_blank">VitePress框架构建</a>',
      copyright: '版权所有 © 2024-' + new Date().getFullYear() + ' 魔兽世界地图库 | 游戏数据归属: <a href="https://blizzard.com " target="_blank">Blizzard Entertainment</a>'
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