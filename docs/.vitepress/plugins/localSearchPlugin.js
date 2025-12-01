export default function LocalSearchPlugin() {
  const virtualModuleId = '/@localSearchIndex'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'vitepress-local-search-resolver',
    enforce: 'pre',
    
    resolveId(id) {
      if (id === virtualModuleId || id.startsWith(virtualModuleId + '?')) {
        return resolvedVirtualModuleId
      }
    },
    
    load(id) {
      if (id === resolvedVirtualModuleId) {
        console.log('[LocalSearchPlugin] 提供空搜索索引，使用 VitePress 自动索引')
        return `
          export default {
            data: [],
            index: {},
            language: 'zh',
            fields: ['title', 'content', 'headers'],
            storeFields: ['title', 'content', 'headers', 'path'],
            version: 'auto-${Date.now()}',
            __auto__: true
          };
        `
      }
    }
  }
}