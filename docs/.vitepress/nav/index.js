import { version } from '../../../package.json';

export default [
  { text: '首页', link: '/' },
  { text: '地图查看', link: '/map' },
  { 
    text: '功能特性', 
    items: [
      { text: 'WebP 瓦片地图', link: '/docs/features/webp-tiles' },
      { text: '多语言支持', link: '/docs/features/multi-language' },
      { text: '地图导出功能', link: '/docs/features/export' },
      { text: '热重载开发', link: '/docs/development/local-setup' }
    ]
  },
  { 
    text: '项目文档', 
    link: '/docs/introduction/getting-started', 
    activeMatch: '/docs/' 
  },
  { 
    text: '开发相关', 
    items: [
      { text: '技术架构', link: '/docs/development/architecture' },
      { text: '本地开发', link: '/docs/development/local-setup' },
      { text: '部署指南', link: '/docs/development/deployment' },
      { text: '贡献指南', link: '/docs/development/contribution' }
    ]
  },
  { 
    text: '社区', 
    items: [
      { text: '问题反馈', link: 'https://github.com/hestiacn/wow-map/issues' },
      { text: '功能建议', link: 'https://github.com/hestiacn/wow-map/discussions' },
      { text: '在线演示', link: 'https://your-demo-site.com' }
    ]
  },
  { 
    text: `v${version}`,
    items: [
      { text: '版本更新日志', link: '/changelog' },
      { text: '开发路线图', link: '/roadmap' },
      { text: '技术栈说明', link: '/tech-stack' }
    ]
  }
];