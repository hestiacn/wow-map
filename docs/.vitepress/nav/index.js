import { version } from '../../../package.json';
export default {
  nav: [
    { text: '首页', link: '/' },
    { text: '文档查看', link: '/docs/help/use' },
    { text: '地图制作', link: '/docs/map' },
    { text: '图例标识', link: '/docs/Legend' },
    { text: '图片查看', link: '/images/demo/demo.webp' },
    { text: `最新版本 v ${version}`,
    items: [
    {text: '开发背景',link: '/docs/help/dev', },
    {text: '版本更新日志',link: '/docs/CHANGELOG', },],},
  ]
};