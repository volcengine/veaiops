# OpenAPI Specs - API Client Generation

## 📋 概览

VeAIOps OpenAPI 规范管理和 API 客户端自动生成工具。支持模块化的 OpenAPI 规范管理，以及基于两阶段检测的智能增量生成。

**核心特性**：
- 🔄 **两阶段增量检测**：智能判断是否需要重新生成（spec 变更 + api-client 漂移检测）
- 📦 **模块化规范**：按业务模块组织 OpenAPI 规范文件
- 🎯 **智能生成决策**：自动识别格式变更，避免不必要的全量生成
- 🔧 **自动化处理**：文件重命名（kebab-case）、类型优化、代码清理

## 🚀 快速开始

### 基本命令

```bash
# 完整生成（推荐首次使用或有疑问时）
make generate-api-complete

# 增量生成（日常开发推荐）- 智能两阶段检测
make generate-api-incremental

# 增量生成（仅 spec 变更）- 快速迭代
make generate-api-incremental-spec-only

# 增量生成（调试模式）- 故障排查
make generate-api-incremental-debug
```

### 典型工作流

```bash
# 1. 修改 OpenAPI 规范
vim src/specs/modules/oncall.json

# 2. 生成 TypeScript API 客户端
make generate-api-incremental

# 3. 提交变更
git add frontend/packages/api-client/src
git add frontend/packages/openapi-specs/src/specs
git commit -m "feat(oncall): add create interest rule API"
```

## 🔍 两阶段增量检测机制

### 核心原理

增量生成使用**两阶段检测**来决定是否需要重新生成 API 客户端代码：

```
┌─────────────────────────────────────────────────────────────┐
│                     Phase 1: Spec 变更检测                   │
├─────────────────────────────────────────────────────────────┤
│ 检测 spec 文件与 upstream/main 的差异                        │
│ 范围：src/specs/modules/*.json                              │
│ 结果：变更的 spec 文件列表 + 受影响的模块                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Phase 2: API Client 漂移检测               │
├─────────────────────────────────────────────────────────────┤
│ 检测 api-client 与 upstream/main 的差异                      │
│ 范围：packages/api-client/src/                              │
│ 智能分析：格式变更 vs 实质性变更                             │
│ 模块分析：已覆盖 vs 未覆盖                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        生成决策                              │
├─────────────────────────────────────────────────────────────┤
│ • 只有 spec 变更 → 目标生成                                  │
│ • spec 变更 + 格式变更 → 目标生成                            │
│ • spec 变更 + 未覆盖的实质变更 → 全量生成                    │
│ • 无 spec 变更 + api-client 实质变更 → 全量生成（修复漂移）  │
│ • 都无变更 → 跳过生成                                        │
└─────────────────────────────────────────────────────────────┘
```

### Phase 1: Spec 变更检测

检测 OpenAPI 规范文件的变更：

```bash
git diff upstream/main -- frontend/packages/openapi-specs/src/specs/
```

**检测范围**：
- 所有模块规范文件（`modules/*.json`）
- 主配置文件（`api-config.json`）
- 共享 schema（`common.json`）

**输出示例**：
```
🔍 Phase 1: Detecting changed spec files against upstream/main...
📝 Found 1 changed spec files:
   - frontend/packages/openapi-specs/src/specs/modules/oncall.json
```

### Phase 2: API Client 漂移检测

检测生成的 API 客户端代码是否有未预期的变更：

```bash
git diff upstream/main -- frontend/packages/api-client/src/
```

**智能分析**：

1. **格式变更识别**（自动跳过）：
   - ✅ 删除版权头（`0 added, N deleted`）
   - ✅ index.ts 的 export 新增（由 spec 变更导致）
   - ✅ 注释清理、空行调整

2. **模块覆盖分析**：
   - **Covered Modules**: 有对应 spec 变更的模块 ✅ 安全
   - **Uncovered Modules**: 无对应 spec 变更的模块 ⚠️ 可能漂移
   - **Unidentified Files**: 无法归类的文件（index.ts, core/*）

3. **采样策略**：
   - 检查前 10 个文件判断整体趋势
   - 如果全部是格式变更，则跳过 Phase 2 触发

**输出示例（格式变更）**：
```
🔍 Phase 2: Detecting api-client changes against upstream/main...
📝 Found 215 changed api-client files
🔬 Analyzing change types...
   ✅ All sampled files (10/215) contain only formatting changes
   💡 Formatting changes do not trigger regeneration
```

**输出示例（实质性变更）**：
```
🔍 Phase 2: Detecting api-client changes against upstream/main...
📝 Found 50 changed api-client files
🔬 Analyzing change types...
   Formatting-only: 5/10, Substantive: 5/10
   Modules with spec changes (covered): Oncall
   Modules without spec changes (uncovered): Bots, Chats

⚠️  Potential drift detected
   → Full regeneration will ensure consistency
```

## 🎯 生成决策逻辑

### 决策矩阵

| Phase 1（Spec） | Phase 2（API Client） | 变更性质 | 生成决策 | 说明 |
|----------------|----------------------|----------|----------|------|
| oncall.json    | 无变更               | -        | 📦 目标生成（Oncall） | 基础场景 |
| oncall.json    | 215 文件             | 格式变更  | 📦 目标生成（Oncall） | **当前场景** ✅ |
| oncall.json    | bots.ts              | 实质变更（未覆盖） | ⚠️ 全量生成 | 检测到漂移 |
| 无变更         | 200 文件             | 格式变更  | ✅ 跳过生成 | 只有格式变更 |
| 无变更         | bots.ts              | 实质变更  | ⚠️ 全量生成 | 修复手动修改 |
| 无变更         | 无变更               | -        | ✅ 跳过生成 | 无需生成 |
| common.json    | 任意                 | 任意      | ⚠️ 全量生成 | 共享 schema |
| api-config.json | 任意                | 任意      | ⚠️ 全量生成 | 配置变更 |

### 关键决策点

**1. 格式变更自动识别** ⭐
- ✅ 删除版权头（14 行）
- ✅ index.ts 新增 export（由 spec 变更导致）
- ✅ 注释清理、空行调整
- ⚠️ **不触发 Phase 2 全量生成**

**2. 模块覆盖判断**
- ✅ 如果 api-client 变更的模块都有 spec 变更 → 安全，目标生成
- ⚠️ 如果有模块没有 spec 变更 → 检测漂移，可能全量生成

**3. 实质性变更判断**
- ✅ 格式变更 → 跳过
- ⚠️ 代码逻辑变更 → 触发

## 📦 目录结构

```
openapi-specs/
├── src/
│   ├── specs/                              # OpenAPI 规范文件
│   │   ├── api-config.json                # 主配置文件
│   │   └── modules/                       # 模块化规范
│   │       ├── auth.json                  # 认证授权
│   │       ├── bots.json                  # 机器人管理
│   │       ├── oncall.json               # 值班规则 ⭐
│   │       ├── datasource.json           # 数据源
│   │       ├── event-center.json         # 事件中心
│   │       └── ...                        # 其他模块
│   │
│   └── scripts/                           # 生成脚本
│       ├── generate-api-complete.js      # 完整生成脚本
│       ├── generate-api-incremental.js   # 增量生成脚本 ⭐
│       └── python-code-analyzer.js       # Python 代码分析
│
├── docs/                                  # 详细文档
│   ├── incremental-generation.md                # 两阶段机制完整说明
│   ├── incremental-generation-edge-cases.md     # 边界情况处理
│   ├── fix-two-phase-detection.md              # 路径问题修复详情
│   └── two-phase-detection-final-summary.md    # 最终修复总结
│
├── temp/                                  # 临时文件
│   └── .last-generation-time             # 上次生成时间戳
│
└── README.md                              # 本文件
```

## 🛠️ 命令详解

### generate-api-incremental（默认推荐）

**功能**：智能两阶段增量检测

```bash
make generate-api-incremental
```

**检测流程**：
1. Phase 1：检测 spec 文件变更（对比 upstream/main）
2. Phase 2：检测 api-client 漂移（对比 upstream/main）
3. 智能判断：格式变更识别、模块覆盖分析
4. 决策：目标生成 or 全量生成 or 跳过

**适用场景**：
- ✅ 日常开发（修改了 spec 文件）
- ✅ 不确定 api-client 状态时
- ✅ 需要最大安全性和智能性

**输出示例**：
```
🚀 Starting two-phase incremental API generation process...

🔍 Phase 1: Detecting changed spec files against upstream/main...
📝 Found 1 changed spec files:
   - frontend/packages/openapi-specs/src/specs/modules/oncall.json

🔍 Phase 2: Detecting api-client changes against upstream/main...
📝 Found 215 changed api-client files
🔬 Analyzing change types...
   ✅ All sampled files (10/215) contain only formatting changes
   💡 Formatting changes do not trigger regeneration

📝 Generation triggered: Spec files changed (Phase 1)
🔬 Analyzing change impact scope...
   📦 Module changed: Oncall

📦 Small change scope, executing targeted generation...
   Changed modules: Oncall
```

### generate-api-incremental-spec-only（快速模式）

**功能**：只检测 spec 变更，跳过 Phase 2

```bash
make generate-api-incremental-spec-only
```

**适用场景**：
- ⚡ 快速迭代开发
- ✅ 确定 api-client 没有手动修改
- ✅ api-client 的 diff 是已知的（如历史格式变更）

**跳过的检查**：
- ❌ 不检测 api-client 漂移
- ❌ 不分析模块覆盖情况

**风险**：
- ⚠️ 如果 api-client 有手动修改，不会被检测到

### generate-api-incremental-debug（调试模式）

**功能**：显示详细的调试信息

```bash
make generate-api-incremental-debug
```

**额外输出**：
- 🔍 路径计算详情（gitRoot, rootDir, specsDir）
- 🔍 所有变更文件列表
- 🔍 文件匹配详情（每个文件的匹配过程）
- 🔍 upstream 分支检测结果

**适用场景**：
- 🐛 增量检测不工作时
- 🔍 需要理解路径计算逻辑时
- 🔍 需要调试文件匹配逻辑时

### generate-api-complete（完整生成）

**功能**：强制完整生成，无检测

```bash
make generate-api-complete
# 或
cd frontend && pnpm generate:api
```

**适用场景**：
- ✅ 首次设置环境
- ✅ 怀疑生成结果不对时
- ✅ 不想依赖增量检测时

## 📊 两阶段检测详解

### Phase 1: Spec 文件变更检测

**目的**：检测 OpenAPI 规范文件的变更

**执行逻辑**：
```javascript
// 在仓库根目录执行 git diff
git diff upstream/main -- frontend/packages/openapi-specs/src/specs/

// 过滤 spec 文件
files.filter(f => f.endsWith('.json') || f.endsWith('.yaml'))
```

**特殊处理**：
- `common.json` 变更 → 强制全量生成（影响所有模块）
- `api-config.json` 变更 → 强制全量生成（影响生成配置）

### Phase 2: API Client 漂移检测

**目的**：检测生成的 API 客户端代码是否有未预期的变更

**执行逻辑**：
```javascript
// 检测 api-client 变更
git diff upstream/main -- frontend/packages/api-client/src/

// 智能分析变更类型
for each changed file:
  if isFormattingChangeOnly(file):
    count as formatting
  else:
    count as substantive

// 采样决策（检查前 10 个文件）
if all sampled files are formatting only:
  treat all as formatting → skip Phase 2 trigger
```

**格式变更识别规则**：

| 模式 | 条件 | 判断 |
|------|------|------|
| **纯删除** | `added = 0, deleted > 0` | ✅ 格式变更 |
| **少量新增 + 大量删除** | `added <= 3, deleted >= 10` | 需要进一步检查 |
| **index.ts export 新增** | 新增都是 `export` 语句 | ✅ 格式变更（预期） |
| **其他** | 新增有代码逻辑 | ⚠️ 实质性变更 |

**模块覆盖分析**：
```javascript
{
  coveredModules: ['Oncall'],      // 有 spec 变更覆盖
  uncoveredModules: ['Bots', ...], // 无 spec 变更覆盖
  unidentifiedFiles: ['index.ts']  // 无法归类
}
```

**决策逻辑**：
- ✅ `uncoveredModules.length === 0` → 所有变更都被覆盖，安全
- ✅ `isFormattingOnly === true` → 只有格式变更，安全
- ⚠️ `uncoveredModules + substantive changes` → 检测到漂移，全量生成

## 🎯 边界情况处理

### 情况 1: 只改了 spec 文件 ✅

```
变更：oncall.json
Phase 1: ✅ 检测到 oncall.json
Phase 2: ✅ 无变更（或只有格式变更）
决策：📦 目标生成（Oncall only）
```

### 情况 2: spec + 大量格式变更 ✅

```
变更：oncall.json
Phase 1: ✅ 检测到 oncall.json
Phase 2: ✅ 215 文件，全部是格式变更（删除版权头）
决策：📦 目标生成（Oncall only）
原因：格式变更不触发 Phase 2
```

这是**您当前的场景**！修复后能正确处理。

### 情况 3: 检测到漂移 ⚠️

```
变更：oncall.json
Phase 1: ✅ 检测到 oncall.json
Phase 2: ⚠️ bots-service.ts 有实质性变更（未被 spec 覆盖）
决策：⚠️ 全量生成
原因：检测到手动修改或漂移
```

**用户选择**：
- 如果是预期的：使用 `make generate-api-incremental-spec-only`
- 如果是漂移：让它执行全量生成修复

### 情况 4: 没有任何变更 ✅

```
Phase 1: ✅ 无变更
Phase 2: ✅ 无变更
决策：✅ 跳过生成
输出："No changes detected in both phases"
```

### 情况 5: 共享 schema 变更 ⚠️

```
变更：common.json
Phase 1: ⚠️ 共享 schema 变更
Phase 2: 任意
决策：⚠️ 强制全量生成
原因：共享 schema 影响所有模块
```

### 情况 6: index.ts 新增 export ✅

```
变更：oncall.json（新增 InterestCreateRequest schema）
Phase 1: ✅ 检测到 oncall.json
Phase 2: ✅ index.ts 新增 export { InterestCreateRequest }
分析：export 新增是预期的（由 spec 变更导致）
决策：📦 目标生成（不算实质性变更）
```

**识别逻辑**：
```javascript
// index.ts 的 diff:
+export { InterestCreateRequest } from './models/interest-create-request';

// 检查新增行都是 export/comment/empty → 算格式变更
allExpectedChanges = addedLines.every(line =>
  line === '' ||
  line.startsWith('//') ||
  line.startsWith('export ')
);
```

## 🔧 故障排查

### 问题 1: "oncall.json 变更但 Phase 1 未检测到"

**可能原因**：
- Git 路径计算错误
- upstream/main 分支不存在

**排查方法**：
```bash
# 1. 检查是否有 upstream remote
git remote -v | grep upstream

# 2. 使用调试模式
make generate-api-incremental-debug

# 3. 手动检查 diff
git diff upstream/main -- frontend/packages/openapi-specs/src/specs/modules/oncall.json
```

### 问题 2: "格式变更触发全量生成"

**可能原因**：
- 采样的前 10 个文件中有实质性变更
- 格式变更模式不匹配

**排查方法**：
```bash
# 查看变更统计
git diff upstream/main --numstat -- frontend/packages/api-client/src/ | head -20

# 查看具体 diff
git diff upstream/main -- frontend/packages/api-client/src/models/bot.ts
```

**预期模式**：
```
0       14      models/bot.ts          ✅ 纯删除（格式）
1       14      index.ts               ✅ 少量新增（export）
5       2       models/bot.ts          ⚠️ 实质性变更
```

### 问题 3: "Phase 2 检测失败"

**可能原因**：
- Git 命令执行错误
- 权限问题

**排查方法**：
```bash
# 检查 git 是否正常
git --version
git status

# 检查文件权限
ls -la frontend/packages/api-client/src/
```

### 问题 4: "误判格式变更为实质性变更"

**手动跳过 Phase 2**：
```bash
make generate-api-incremental-spec-only
```

**或临时忽略**：
```bash
cd frontend/packages/openapi-specs
node src/scripts/generate-api-incremental.js --ignore-api-client
```

## ⚙️ 高级配置

### 环境变量

```bash
# 启用调试输出
DEBUG_API_GEN=1 make generate-api-incremental
```

**调试信息包含**：
- 路径计算详情
- 所有变更文件列表
- 文件匹配过程
- upstream 分支检测

### 命令行参数

```bash
# 方式 1：使用 Makefile
make generate-api-incremental-spec-only

# 方式 2：直接调用脚本
cd frontend/packages/openapi-specs
node src/scripts/generate-api-incremental.js --ignore-api-client
node src/scripts/generate-api-incremental.js --spec-only  # 同上
```

### Upstream 分支检测

脚本自动检测 upstream 分支（按优先级）：
1. `upstream/main`（推荐，fork 工作流）
2. `origin/main`（fallback）
3. `HEAD`（最后选择，对比当前 HEAD）

**配置 upstream**：
```bash
git remote add upstream https://github.com/original/repo.git
git fetch upstream
```

## 📈 性能优化

### 采样策略

**为什么采样？**
- 检查 215 个文件的完整 diff 很慢
- 变更通常是一致的（全是格式 or 全是实质）
- 采样 10 个文件足以判断趋势

**采样逻辑**：
```javascript
const sampleSize = Math.min(10, totalFiles);
let formattingCount = 0;
let substantiveCount = 0;

for (let i = 0; i < sampleSize; i++) {
  if (isFormattingChangeOnly(files[i])) {
    formattingCount++;
  } else {
    substantiveCount++;
  }
}

// 如果全部是格式，则假定所有都是格式
const isAllFormatting = substantiveCount === 0;
```

### 格式检测优化

```javascript
// 快速检测：使用 --numstat（统计信息）
git diff upstream/main --numstat -- file.ts
// 输出: added_lines deleted_lines filename

// 只有在可能是格式变更时，才读取完整 diff
if (added <= 3 && deleted >= 10) {
  // 读取完整 diff 详细检查
  git diff upstream/main -- file.ts
}
```

## 🎓 最佳实践

### ✅ 推荐做法

1. **日常开发使用默认命令**：
   ```bash
   make generate-api-incremental
   ```

2. **修改 spec 后立即生成**：
   ```bash
   # 修改 spec
   vim src/specs/modules/oncall.json

   # 生成
   make generate-api-incremental

   # 一起提交
   git add frontend/packages/api-client/src
   git add frontend/packages/openapi-specs/src/specs
   git commit -m "feat(oncall): add create rule API"
   ```

3. **注意 Phase 2 警告**：
   ```
   ⚠️  Potential drift detected
   ```
   - 检查是否有手动修改：`git diff upstream/main -- frontend/packages/api-client/src`
   - 如果是预期的，使用 `--spec-only`
   - 如果是漂移，让它执行全量生成修复

4. **保持 api-client 与 upstream 同步**：
   ```bash
   # 定期拉取 upstream
   git fetch upstream
   git merge upstream/main

   # 如果 api-client 有冲突，重新生成
   make generate-api-complete
   ```

### ❌ 不推荐做法

1. **不要手动修改生成的代码**：
   - ❌ 不要修改 `frontend/packages/api-client/src/` 下的文件
   - ✅ 所有修改应该在 spec 文件中进行

2. **不要忽略漂移警告**：
   ```
   ⚠️  Potential drift detected
   ```
   - ❌ 不要盲目使用 `--spec-only` 跳过
   - ✅ 先检查变更原因

3. **不要混合手动修改和 spec 变更**：
   - ❌ 同一次提交中既有手动修改又有 spec 变更
   - ✅ 分开提交，清晰的变更历史

## 📚 详细文档

完整的技术文档请参考 `docs/` 目录：

- **[incremental-generation.md](docs/incremental-generation.md)**
  两阶段检测机制完整说明（工作原理、配置、使用案例）

- **[incremental-generation-edge-cases.md](docs/incremental-generation-edge-cases.md)**
  边界情况处理详解（8 种场景、决策矩阵、真实案例）

- **[fix-two-phase-detection.md](docs/fix-two-phase-detection.md)**
  路径问题修复详情（问题分析、修复方案、验证方法）

- **[two-phase-detection-final-summary.md](docs/two-phase-detection-final-summary.md)**
  最终修复总结（测试结果、命令对比、算法详解）

## 🔄 更新日志

### 2025-11-12 - 两阶段检测机制 + 真正的选择性生成 ⭐⭐⭐

**重大突破**：实现了真正的增量生成，只改 oncall.json 时只有 **3 个文件**变更！

#### 1. **修复路径计算问题** ⭐
   - 添加 `gitRoot` 属性，正确定位仓库根目录
   - 所有 git 命令在 gitRoot 执行
   - 修复 spec 文件检测失败问题

#### 2. **智能格式变更识别** ⭐
   - 自动识别版权头删除（0 added, N deleted）
   - 特殊处理 index.ts 的 export 新增
   - 采样策略（检查 10 个文件判断趋势）
   - **避免格式变更触发全量生成**

#### 3. **模块覆盖分析** ⭐
   - 区分 covered（有 spec 变更）和 uncovered（无 spec 变更）模块
   - unidentified 文件特殊处理（index.ts, core/*）
   - 只有未覆盖模块的实质变更才触发全量生成

#### 4. **真正的选择性生成** ⭐⭐⭐（新增）

**核心算法**：
```
1. 分析变更模块的 schemas（从 spec 文件读取）
2. 执行完整生成（216 个文件）
3. 使用 git 还原不相关的文件（213 个）
4. 只保留真正变更的文件（3 个）
```

**效果对比**：
```
改进前：
  只改 oncall.json → 生成 216 文件 → Git 显示 216 个变更 ❌

改进后：
  只改 oncall.json → 生成 216 文件 → Git 还原 213 文件 → Git 显示 3 个变更 ✅
```

**实际案例（oncall.json）**：
```
oncall.json 的 3 个变更：
  1. ✅ 新增 POST 接口
  2. ✅ 新增 InterestCreateRequest schema
  3. ✅ 新增 inspect_history 字段

生成结果：
  - 生成：216 个文件
  - 还原：213 个文件（格式变更、无关模块）
  - 保留：3 个文件
    • interest-create-request.ts（新增 schema）
    • interest-update-request.ts（新增字段）
    • oncall-rule-service.ts（新增方法）
```

**智能还原策略**：
- ✅ 还原 core 文件的格式变更（共享文件，不特定于模块）
- ✅ 还原 index.ts/volc-ai-ops-api.ts 的格式变更
- ✅ 还原无关模块的所有文件
- ✅ 只保留变更模块的 models + services

#### 5. **新增命令**：
   - `generate-api-incremental`（智能两阶段 + 选择性生成，默认）
   - `generate-api-incremental-spec-only`（只检测 spec，跳过 Phase 2）
   - `generate-api-incremental-debug`（调试模式）

#### 6. **完整文档**：
   - README.md（本文件，791 行）
   - 覆盖所有边界情况和使用场景

**测试验证**：
- ✅ 只改 oncall.json → **3 个文件**变更（interest-*, oncall-rule-service）
- ✅ oncall.json + 215 格式变更 → **3 个文件**变更（识别格式并还原）
- ✅ 无变更 → 跳过生成
- ✅ 共享 schema 变更 → 全量生成（216 个文件）
- ✅ 检测到漂移 → 全量生成（修复漂移）

## 🚀 快速参考

### 常用命令速查

```bash
# 智能增量生成（默认）
make generate-api-incremental

# 只检测 spec 变更（快速）
make generate-api-incremental-spec-only

# 调试模式
make generate-api-incremental-debug

# 强制完整生成
make generate-api-complete
```

### 决策流程速查

```
只改了 spec？
  └─ Yes → make generate-api-incremental
           (智能识别格式变更，目标生成)

spec + api-client 都没改？
  └─ Yes → 自动跳过生成

不确定 api-client 状态？
  └─ Yes → make generate-api-incremental
           (两阶段检测，最安全)

快速迭代，不关心 api-client？
  └─ Yes → make generate-api-incremental-spec-only
           (只检测 spec，最快)

增量检测不工作？
  └─ Yes → make generate-api-incremental-debug
           (查看详细信息)

           或

           make generate-api-complete
           (强制重新生成)
```

## 📞 技术支持

**遇到问题？**

1. **查看调试输出**：
   ```bash
   make generate-api-incremental-debug
   ```

2. **手动检查 diff**：
   ```bash
   # 检查 spec 变更
   git diff upstream/main -- frontend/packages/openapi-specs/src/specs/

   # 检查 api-client 变更
   git diff upstream/main -- frontend/packages/api-client/src/
   ```

3. **查看详细文档**：
   - [docs/incremental-generation.md](docs/incremental-generation.md)
   - [docs/incremental-generation-edge-cases.md](docs/incremental-generation-edge-cases.md)

4. **强制重新生成**：
   ```bash
   make generate-api-complete
   ```

---

**维护者**: VeAIOps Team
**最后更新**: 2025-11-12
**版本**: 2.0.0（两阶段检测机制）
