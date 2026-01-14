---
title: 贡献指南
---
# 🛠️ 详细贡献指南

## 📋 完整的贡献流程

### 第一步：准备开发环境

#### 1.1 Fork项目仓库
1. 访问项目主页：https://github.com/hestiacn/wow-map
2. 点击右上角 **"Fork"** 按钮
3. 选择你的GitHub账户作为目标
4. 等待Fork完成，你将拥有自己的副本：`https://github.com/你的用户名/wow-map`

#### 1.2 克隆到本地
```bash
# 克隆你的Fork仓库
git clone https://github.com/你的用户名/wow-map.git

# 进入项目目录
cd wow-map

# 添加上游仓库（原项目）作为远程源
git remote add upstream https://github.com/hestiacn/wow-map.git

# 验证远程仓库配置
git remote -v
# 应该看到：
# origin    https://github.com/你的用户名/wow-map.git (fetch)
# origin    https://github.com/你的用户名/wow-map.git (push)
# upstream  https://github.com/hestiacn/wow-map.git (fetch)
# upstream  https://github.com/hestiacn/wow-map.git (push)
```

#### 1.3 同步上游代码（重要！）
在开始新功能前，确保你的分支是最新的：
```bash
# 拉取上游最新代码
git fetch upstream

# 切换到主分支
git checkout master

# 合并上游更新
git merge upstream/master

# 推送到你的Fork
git push origin master
```

### 第二步：创建特性分支

#### 2.1 分支命名规范
使用清晰、有意义的分支名，遵循以下格式：

| 分支类型 | 格式 | 示例 | 说明 |
|---------|------|------|------|
| **功能开发** | `feat/简短描述` | `feat/add-druid-teleports` | 新功能开发 |
| **错误修复** | `fix/问题描述` | `fix/map-rendering-bug` | 修复Bug |
| **文档更新** | `docs/更新内容` | `docs/update-contributing-guide` | 文档修改 |
| **代码重构** | `refactor/重构内容` | `refactor/utils-modules` | 代码重构 |
| **样式调整** | `style/调整内容` | `style/improve-ui-colors` | CSS/样式修改 |
| **测试相关** | `test/测试内容` | `test/add-unit-tests` | 测试代码 |

#### 2.2 创建分支
```bash
# 从最新的master分支创建新分支
git checkout -b feat/your-feature-name

# 验证当前分支
git branch
# 应该看到：
#   master
# * feat/your-feature-name
```

### 第三步：编写高质量代码

#### 3.1 代码风格要求

**Vue组件规范**：
```vue
<!-- 组件结构顺序 -->
<template>
  <!-- 1. 模板部分 -->
</template>

<script>
// 2. 脚本部分 - 使用组合式API
import { ref, computed, onMounted } from 'vue'
import { RegionUtils } from '../utils/regionUtils.js'

export default {
  name: 'ComponentName', // 3. 组件名（PascalCase）
  
  // 4. 组件继承（如需要）
  extends: AnotherComponent,
  
  // 5. 混入（如需要）
  mixins: [MyMixin],
  
  // 6. 组件属性
  components: { CopyToClipboardInput },
  
  // 7. 自定义指令
  directives: { focus },
  
  // 8. 属性定义（Props）
  props: {
    propName: {
      type: String,
      required: true,
      default: ''
    }
  },
  
  // 9. 发射事件定义
  emits: ['update:modelValue'],
  
  // 10. 组合式API的setup函数
  setup(props, { emit }) {
    // 变量声明顺序：
    // 1) 响应式状态（ref/reactive）
    const count = ref(0)
    const state = reactive({ x: 0, y: 0 })
    
    // 2) 计算属性
    const doubleCount = computed(() => count.value * 2)
    
    // 3) 方法函数
    function increment() {
      count.value++
    }
    
    // 4) 生命周期钩子
    onMounted(() => {
      console.log('组件已挂载')
    })
    
    // 5) 返回模板使用的值
    return {
      count,
      state,
      doubleCount,
      increment
    }
  }
}
</script>

<style scoped>
/* 11. 样式部分 - 使用scoped避免污染全局 */
.component-class {
  /* CSS属性顺序：
     1) 布局属性（display, position, float等）
     2) 盒模型（width, height, margin, padding等）
     3) 文字相关（font, color, text-align等）
     4) 视觉（background, border, opacity等）
     5) 动画（transition, animation等）
     6) 其他
  */
}
</style>
```

**JavaScript/TypeScript规范**：
```javascript
// 1. 导入顺序：
// a) 第三方库
import { ref, computed } from 'vue'
// b) 工具函数
import { formatDate, validatePoint } from '@/utils/helpers'
// c) 类型定义
import type { Point, Region } from '@/types/map'
// d) 样式（如需要）
import './styles.css'

// 2. 常量使用全大写，单词间用下划线
const MAX_ZOOM_LEVEL = 5
const DEFAULT_MAP_SIZE = { width: 9440, height: 7928 }

// 3. 函数命名：动词+名词，使用camelCase
function calculateDistance(pointA, pointB) {
  // 4. 添加JSDoc注释
  /**
   * 计算两点之间的距离
   * @param {Point} pointA - 第一个点
   * @param {Point} pointB - 第二个点
   * @returns {number} 两点距离
   */
  const dx = pointB.x - pointA.x
  const dy = pointB.y - pointA.y
  return Math.sqrt(dx * dx + dy * dy)
}

// 5. 异步函数使用async/await
async function loadMapData() {
  try {
    const response = await fetch('/data/map-data.json')
    if (!response.ok) throw new Error('网络请求失败')
    return await response.json()
  } catch (error) {
    console.error('加载地图数据失败:', error)
    return null
  }
}

// 6. 使用解构赋值
const { x, y } = point
const [firstPoint, ...restPoints] = points

// 7. 使用模板字符串
const message = `坐标: (${x}, ${y})`
```

**CSS/SCSS规范**：
```scss
// 1. 使用BEM命名约定
.map-viewer {
  &__control-panel {  // Block__Element
    padding: 1rem;
    
    &--expanded {  // Block__Element--Modifier
      width: 300px;
    }
  }
  
  &__button {
    background: #0078FF;
    
    &:hover {
      background: darken(#0078FF, 10%);
    }
    
    &--primary {
      background: #E10B00;
    }
  }
}

// 2. 属性顺序建议
.selector {
  /* 定位和布局 */
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  
  /* 盒模型 */
  width: 100%;
  height: auto;
  margin: 0;
  padding: 1rem;
  
  /* 文字相关 */
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  color: #333;
  text-align: center;
  
  /* 视觉样式 */
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  opacity: 1;
  
  /* 动画 */
  transition: all 0.3s ease;
  
  /* 其他 */
  cursor: pointer;
  z-index: 10;
}
```

#### 3.2 代码质量检查
项目使用ESLint和Prettier确保代码质量：

```bash
# 1. 安装开发依赖（如果尚未安装）
pnpm install

# 2. 检查代码规范
pnpm run lint

# 3. 自动修复可修复的问题
pnpm run lint --fix

# 4. 格式化代码
pnpm run format

# 5. 在提交前自动检查和格式化（通过husky）
# 已配置pre-commit钩子，会自动运行lint-staged
```

**lint-staged配置**（项目已有的）：
```json
{
  "lint-staged": {
    "*.{js,vue,md}": [
      "prettier --write",
      "eslint --fix"
    ]
  }
}
```

### 第四步：添加测试用例

#### 4.1 测试文件结构
```
wow-map/
├── tests/
│   ├── unit/                    # 单元测试
│   │   ├── utils/              # 工具函数测试
│   │   │   ├── regionUtils.spec.js
│   │   │   └── tileMerger.spec.js
│   │   └── components/         # 组件测试
│   │       └── MapViewer.spec.js
│   ├── integration/            # 集成测试
│   │   └── map-integration.spec.js
│   └── e2e/                    # 端到端测试
│       └── basic.spec.js
```

#### 4.2 编写单元测试示例
```javascript
// tests/unit/utils/regionUtils.spec.js
import { describe, it, expect, beforeEach } from 'vitest'
import { RegionUtils } from '@/utils/regionUtils.js'

describe('RegionUtils', () => {
  describe('generateId()', () => {
    it('应该生成唯一的ID', () => {
      const id1 = RegionUtils.generateId()
      const id2 = RegionUtils.generateId()
      
      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
    })
  })
  
  describe('isPointInRegion()', () => {
    const region = {
      x: 100,
      y: 100,
      width: 200,
      height: 200
    }
    
    it('点在区域内应返回true', () => {
      const point = { x: 150, y: 150 }
      expect(RegionUtils.isPointInRegion(point, region)).toBe(true)
    })
    
    it('点在区域外应返回false', () => {
      const point = { x: 50, y: 50 }
      expect(RegionUtils.isPointInRegion(point, region)).toBe(false)
    })
    
    it('点在边界上应返回true', () => {
      const point = { x: 100, y: 100 }
      expect(RegionUtils.isPointInRegion(point, region)).toBe(true)
    })
  })
  
  describe('validatePoint()', () => {
    it('有效的点应该通过验证', () => {
      const validPoint = {
        name: { zh: '测试点', en: 'Test Point' },
        type: 'town',
        position: { x: 100, y: 100 }
      }
      
      expect(() => {
        RegionUtils.validatePoint(validPoint)
      }).not.toThrow()
    })
    
    it('缺少名称应该抛出错误', () => {
      const invalidPoint = {
        type: 'town',
        position: { x: 100, y: 100 }
      }
      
      expect(() => {
        RegionUtils.validatePoint(invalidPoint)
      }).toThrow('标记点必须包含名称')
    })
    
    it('坐标超出范围应该抛出错误', () => {
      const invalidPoint = {
        name: { zh: '测试点', en: 'Test Point' },
        type: 'town',
        position: { x: -10, y: 10000 }
      }
      
      expect(() => {
        RegionUtils.validatePoint(invalidPoint)
      }).toThrow('坐标超出有效范围')
    })
  })
})
```

#### 4.3 组件测试示例
```javascript
// tests/unit/components/MapViewer.spec.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MapViewer from '@/components/MapViewer.vue'

// Mock依赖
vi.mock('@/utils/regionUtils.js', () => ({
  RegionUtils: {
    generateId: () => 'mock-id-123',
    validatePoint: vi.fn()
  }
}))

describe('MapViewer组件', () => {
  let wrapper
  
  beforeEach(() => {
    wrapper = mount(MapViewer, {
      global: {
        stubs: {
          'CopyToClipboardInput': true
        }
      }
    })
  })
  
  it('应该正确渲染组件', () => {
    expect(wrapper.find('.map-viewer').exists()).toBe(true)
    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(wrapper.find('.control-panel').exists()).toBe(true)
  })
  
  it('初始化时应该加载地图数据', async () => {
    // 模拟fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          points: { flightPoints: [] },
          regions: {},
          config: {}
        })
      })
    )
    
    await wrapper.vm.loadMapData()
    
    expect(fetch).toHaveBeenCalledWith('/data/map-data.json')
    expect(wrapper.vm.mapData).toBeDefined()
  })
  
  it('切换语言应该更新界面', async () => {
    // 初始为中文
    expect(wrapper.vm.currentLanguage).toBe('zh')
    
    // 切换到英文
    await wrapper.setData({ currentLanguage: 'en' })
    
    expect(wrapper.vm.currentLanguage).toBe('en')
  })
  
  it('添加标记点模式应该切换光标', async () => {
    expect(wrapper.vm.addMarkerMode).toBe(false)
    
    await wrapper.vm.toggleAddMarkerMode()
    
    expect(wrapper.vm.addMarkerMode).toBe(true)
    // 可以检查光标样式或相关类名
  })
})
```

#### 4.4 运行测试
```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test tests/unit/utils/regionUtils.spec.js

# 运行测试并生成覆盖率报告
pnpm test --coverage

# 监视模式（开发时使用）
pnpm test --watch
```

### 第五步：提交代码

#### 5.1 Commit信息规范
使用**约定式提交**（Conventional Commits）格式：

```
<类型>[可选 范围]: <描述>

[可选 正文]

[可选 脚注]
```

**类型说明**：
| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 添加德鲁伊传送点标记` |
| `fix` | 错误修复 | `fix: 修复地图渲染时的内存泄漏` |
| `docs` | 文档更新 | `docs: 更新贡献指南` |
| `style` | 代码格式调整 | `style: 调整控制面板间距` |
| `refactor` | 代码重构 | `refactor: 提取坐标计算工具函数` |
| `test` | 测试相关 | `test: 添加RegionUtils单元测试` |
| `chore` | 构建/工具更新 | `chore: 更新依赖版本` |
| `perf` | 性能优化 | `perf: 优化Canvas重绘性能` |
| `ci` | CI配置 | `ci: 添加GitHub Actions工作流` |

**优秀示例**：
```bash
# 简单提交
git commit -m "feat: 添加副本难度等级显示"

# 带详细描述的提交
git commit -m "fix: 修复飞行路线连接逻辑

- 修复跨大陆飞行点错误连接的问题
- 添加阵营检查逻辑
- 优化路线颜色计算

Closes #42"

# 带破坏性变更的提交（BREAKING CHANGE）
git commit -m "feat!: 重构地图数据格式

BREAKING CHANGE: 地图数据API已更改，需要更新data-loader
- 移除旧的region字段
- 新增bounds对象结构
- 更新所有相关组件"
```

#### 5.2 提交流程示例
```bash
# 1. 查看当前状态
git status

# 2. 添加要提交的文件
git add docs/.vitepress/theme/components/MapViewer.vue
git add tests/unit/components/MapViewer.spec.js

# 或者添加所有修改的文件（小心使用）
git add .

# 3. 提交更改
git commit -m "feat: 添加地图导出为PNG格式功能

- 新增exportToPNG方法
- 支持透明背景选项
- 添加导出质量参数控制
- 更新使用说明文档

Related to #15"

# 4. 推送到你的Fork仓库
git push origin feat/add-png-export
```

### 第六步：创建Pull Request

#### 6.1 准备PR
1. **确保代码是最新的**：
   ```bash
   # 切换回master分支
   git checkout master
   
   # 拉取上游最新代码
   git pull upstream master
   
   # 切换回特性分支
   git checkout feat/your-feature-name
   
   # 合并master的最新更新
   git merge master
   
   # 解决可能的冲突
   # git mergetool
   
   # 测试合并后的代码
   pnpm run build
   pnpm test
   ```

2. **整理提交历史**（可选但推荐）：
   ```bash
   # 交互式rebase，整理提交记录
   git rebase -i master
   
   # 可以选择：
   # pick - 保留提交
   # squash - 合并到前一个提交
   # reword - 修改提交信息
   # fixup - 合并并丢弃提交信息
   # drop - 删除提交
   ```

#### 6.2 创建PR的步骤
1. 访问你的Fork仓库：`https://github.com/你的用户名/wow-map`
2. 点击 **"Compare & pull request"** 按钮
3. 或者点击 **"Pull requests"** → **"New pull request"**
4. 选择基础仓库和分支：
   - **base repository**: `hestiacn/wow-map`
   - **base**: `master`
   - **head repository**: `你的用户名/wow-map`
   - **compare**: `feat/your-feature-name`

#### 6.3 填写PR模板
项目应该有一个PR模板，如果没有，请包含以下信息：

**标题格式**：`[类型] 简短描述`
- `[feat] 添加区域文本标注多语言支持`
- `[fix] 修复地图缩放时的性能问题`
- `[docs] 更新API使用文档`

**PR描述模板**：
```markdown
## 变更描述
<!-- 清晰描述这个PR做了什么 -->

## 相关Issue
<!-- 关联的Issue，例如：Fixes #123, Closes #456 -->
- Fixes #(issue编号)
- Related to #(issue编号)

## 变更类型
<!-- 勾选适用的类型 -->
- [ ] 🐛 Bug修复
- [ ] ✨ 新功能
- [ ] 🎨 代码风格调整
- [ ] ♻️ 代码重构
- [ ] 📝 文档更新
- [ ] ✅ 测试添加/更新
- [ ] 🚀 性能优化
- [ ] 🔧 工具/配置更新
- [ ] 🚨 破坏性变更

## 测试说明
<!-- 描述如何测试这些变更 -->
1. 启动开发服务器：`pnpm run dev`
2. 访问 http://localhost:5173
3. 测试步骤：
   - [ ] 步骤1
   - [ ] 步骤2
   - [ ] 步骤3

## 检查清单
<!-- 提交前请确认以下事项 -->
- [ ] 我的代码遵循了项目的代码风格
- [ ] 我已对自己的代码进行了自我审查
- [ ] 我已添加/更新了必要的测试
- [ ] 所有测试都通过了 (`pnpm test`)
- [ ] 构建成功 (`pnpm run build`)
- [ ] 我已更新了相关文档
- [ ] 我的更改没有引入新的警告或错误

## 截图/屏幕录像
<!-- 如果适用，添加UI变更的截图或GIF -->
| 变更前 | 变更后 |
|--------|--------|
| ![before](图片链接) | ![after](图片链接) |

## 其他说明
<!-- 任何额外的信息 -->
```

#### 6.4 PR审核流程
1. **自动检查**：
   - CI/CD流水线会自动运行测试和构建
   - 代码质量检查（ESLint, Prettier）
   - 确保所有检查通过

2. **人工审核**：
   - 维护者会审查代码
   - 可能会请求更改
   - 及时响应审核意见

3. **处理审核意见**：
   ```bash
   # 1. 根据反馈修改代码
   # 2. 提交更改
   git add .
   git commit -m "fix: 根据PR反馈修复代码问题"
   
   # 3. 推送到同一分支
   git push origin feat/your-feature-name
   
   # PR会自动更新，无需新建
   ```

4. **合并PR**：
   - 审核通过后，维护者会合并PR
   - 可以选择合并策略：Squash、Merge、Rebase
   - PR关闭后，可以删除特性分支

### 第七步：后续维护

#### 7.1 同步你的Fork仓库
```bash
# 定期同步以获取最新代码
git checkout master
git pull upstream master
git push origin master
```

#### 7.2 清理分支
```bash
# 删除已合并的本地分支
git branch --merged | grep -v "\*" | grep -v "master" | xargs -n 1 git branch -d

# 删除远程分支（如果你的PR已合并）
git push origin --delete feat/your-feature-name
```

#### 7.3 参与Issue讨论
- 帮助解答其他用户的问题
- 复现和报告Bug
- 提出功能建议
- 参与功能设计讨论

## 📚 资源推荐

### 学习资源
1. **Vue 3官方文档**：https://vuejs.org/
2. **VitePress文档**：https://vitepress.dev/
3. **Git工作流**：https://www.atlassian.com/git/tutorials/comparing-workflows
4. **约定式提交**：https://www.conventionalcommits.org/

### 工具推荐
1. **Git图形化工具**：
   - GitHub Desktop
   - GitKraken
   - Sourcetree

2. **代码编辑器插件**：
   - VSCode: ESLint, Prettier, Vue Language Features
   - WebStorm: 内置Vue.js支持

3. **调试工具**：
   - Vue Devtools浏览器扩展
   - Chrome/Firefox开发者工具

## 🆘 遇到问题？

### 常见问题解决
1. **合并冲突**：
   ```bash
   # 查看冲突文件
   git status
   
   # 使用工具解决冲突
   git mergetool
   
   # 手动编辑冲突文件后
   git add 冲突文件
   git commit -m "解决合并冲突"
   ```

2. **测试失败**：
   ```bash
   # 运行特定失败的测试
   pnpm test -- --testNamePattern="测试名称"
   
   # 调试模式
   pnpm test -- --inspect-brk
   ```

3. **构建错误**：
   ```bash
   # 清理缓存
   rm -rf node_modules
   rm -f pnpm-lock.yaml
   
   # 重新安装
   pnpm install
   
   # 重新构建
   pnpm run build
   ```

### 寻求帮助
1. **查看现有文档**：README.md, CONTRIBUTING.md
2. **搜索已有Issue**：可能已有类似问题
3. **创建新Issue**：详细描述问题，提供复现步骤

---

**感谢你的贡献！** 🎉

每一个PR，无论大小，都是对开源社区的宝贵贡献。你的工作将帮助所有魔兽世界玩家和开发者更好地使用这个工具。

记住：开源协作是一个学习过程，不要担心犯错。维护者和社区成员都会乐意帮助你改进和成长。

**Happy Coding!** 💻✨