<template>
  <div class="giscus-wrapper">
    <div class="giscus-container" ref="giscusRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useData, useRoute } from 'vitepress'

const { isDark } = useData()
const route = useRoute()
const giscusRef = ref(null)

// Giscus 配置（直接从你的 script 标签复制）
const GISCUS_CONFIG = {
  src: 'https://giscus.app/client.js',
  'data-repo': 'hestiacn/wow-map',
  'data-repo-id': 'R_kgDOQgzxtg',
  'data-category': 'Q&A',
  'data-category-id': 'DIC_kwDOQgzxts4C2UYw',
  'data-mapping': 'pathname',
  'data-strict': '0',
  'data-reactions-enabled': '1',
  'data-emit-metadata': '0',
  'data-input-position': 'top',
  'data-theme': 'preferred_color_scheme',
  'data-lang': 'zh-CN',
  'data-loading': 'lazy',
  crossorigin: 'anonymous',
  async: true
}

// 加载 Giscus 脚本
const loadGiscus = () => {
  // 清除旧的评论容器
  if (giscusRef.value) {
    giscusRef.value.innerHTML = ''
  }

  // 创建 script 元素
  const script = document.createElement('script')
  Object.entries(GISCUS_CONFIG).forEach(([key, value]) => {
    script.setAttribute(key, value)
  })

  // 挂载到容器
  if (giscusRef.value) {
    giscusRef.value.appendChild(script)
  }
}

// 监听路由变化（页面切换时重新加载）
watch(
  () => route.path,
  () => {
    nextTick(() => {
      loadGiscus()
    })
  }
)

// 监听深色模式切换（动态更新主题）
watch(isDark, (newVal) => {
  const iframe = document.querySelector('iframe.giscus-frame')
  if (iframe) {
    iframe.contentWindow?.postMessage({
      giscus: {
        setConfig: {
          theme: newVal ? 'dark' : 'light'
        }
      }
    }, 'https://giscus.app')
  }
})

// 初始加载
onMounted(() => {
  loadGiscus()
})
</script>

<style scoped>
.giscus-wrapper {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}

.giscus-container {
  width: 100%;
  min-height: 200px;
}
</style>