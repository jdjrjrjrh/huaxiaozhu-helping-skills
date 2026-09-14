# 华小助项目重构全量分析与设计说明

## 1. 重构目标与边界

本次重构以旧版 HTML 原型为视觉与业务参考，目标是把“可查看的移动端页面稿”整理为“可直接部署、可完整演示、便于继续维护的纯静态多页面项目”。

确定的技术边界如下：

- 不引入 Vue、React、Angular、Vite、Webpack 等框架或构建工具；
- 不依赖 Node.js、PHP、Java、Python、数据库或服务端路由；
- 不使用 CDN，运行所需的 CSS、JavaScript、字体、图片和图表库均放在项目内；
- 页面使用相对路径，可部署在域名根目录或普通子目录；
- 登录、进度、自测、记录、收藏等数据使用 LocalStorage 保存在当前浏览器；
- 保留旧版青绿色、白色圆角卡片、柔和阴影、插画资源和移动端中间训练入口等视觉特征；
- 同时支持手机、平板和桌面浏览器。

## 2. 旧版项目分析

### 2.1 旧版目录与技术栈

旧版主要由 7 个 HTML 页面、1 个全局 CSS、若干图片、jQuery、flexible.js、Swiper 和 ECharts 组成：

```text
旧版项目
├── index.html
├── 登录.html
├── 训练.html
├── 重述技术训练.html
├── 重述技术训练2.html
├── 训练记录.html
├── 我的.html
├── css/
│   ├── style.css
│   ├── swiper.min.css
│   └── 旧版商业字体（开源版已移除）
├── js/
│   ├── common.js
│   ├── jquery.min.js
│   ├── flexible.js
│   ├── swiper.min.js
│   └── echarts.min.js
└── images/
```

旧版 JavaScript 主要是直接绑定 DOM 的零散脚本：

- `common.js`：Tab 切换、滚动时添加头部 class、微信字体设置；
- 登录页：显示和隐藏说明弹窗；
- 训练页：点击禁用项目时显示提示弹窗；
- 技术训练页：简单倒计时；
- 训练记录页：使用固定数组绘制 ECharts 折线图；
- 训练对话页：关闭固定弹窗。

### 2.2 旧版主要问题

| 类别 | 旧版情况 | 影响 |
| --- | --- | --- |
| 页面跳转 | 大部分链接为 `href="#"` 或 `href="###"` | 页面之间没有真实业务闭环 |
| JS 结构 | 逻辑散落在页面内和 `common.js` 中 | 难以复用、扩展和定位问题 |
| 数据 | 列表、图表和评价为写死内容 | 无法形成用户进度和历史记录 |
| 响应式 | 主要依赖 flexible.js 和移动端 rem | 桌面端会被放大，不具备完整宽屏布局 |
| 导航 | 页面之间导航状态不统一 | 用户难以判断当前位置 |
| 交互 | 登录、训练、记录等大多只有视觉外观 | 无法完成可演示流程 |
| 资源 | 引入 jQuery、Swiper，但实际功能很少 | 依赖偏重，维护成本高 |
| 可访问性 | 多处可点击元素使用空链接 | 键盘使用、语义和可维护性较弱 |
| 部署 | 文件名与逻辑缺少统一规范 | 后续主机部署和功能扩展容易出错 |

## 3. 重构后架构

### 3.1 目录结构

```text
华小助_静态重构版/
├── index.html                    # 欢迎入口
├── login.html                    # 本地演示登录/注册
├── home.html                     # 登录后首页
├── assessment*.html             # 自测中心、答题、结果
├── training*.html               # 训练中心、导学、会话、结果
├── records.html                  # 训练趋势与记录
├── record-detail.html            # 记录详情
├── learning.html                 # 学习中心
├── article.html                  # 文章详情
├── profile*.html                 # 个人中心与编辑资料
├── 404.html                      # 静态 404 页面
├── assets/
│   ├── css/
│   │   ├── main.css              # 基础、组件和页面样式
│   │   ├── responsive.css        # 响应式与打印样式
│   │   └── 系统字体栈（不随仓库分发字体文件）
│   ├── js/
│   │   ├── data.js               # 路由、技术、题目、案例、文章、演示记录
│   │   ├── app.js                # 公共能力、布局和启动器
│   │   ├── pages-main.js         # 欢迎、登录、首页、训练/学习中心、个人中心
│   │   ├── pages-assessment.js   # 自测闭环
│   │   ├── pages-training.js     # 训练闭环与本地评价
│   │   └── pages-records.js      # 记录、图表和详情
│   ├── images/legacy/            # 沿用并整理的旧版图片资源
│   └── vendor/echarts.min.js     # 本地图表库
├── docs/
└── README.md
```

### 3.2 技术栈

| 层次 | 使用技术 | 用途 |
| --- | --- | --- |
| 页面 | HTML5 多页面 | 每个入口对应真实 `.html` 文件，静态主机直接访问 |
| 样式 | 原生 CSS3 | CSS Variables、Flex、Grid、`clamp()`、动画、打印样式 |
| 响应式 | `@media` | 手机底部导航、平板卡片布局、桌面侧边导航 |
| 逻辑 | 原生 JavaScript | ES5 风格模块封装，少量现代浏览器 API，无第三方 DOM 框架 |
| 持久化 | LocalStorage | 登录状态、资料、答题、训练、记录、收藏和反馈 |
| 图表 | 本地 ECharts 5.3.2 | 自测雷达图与训练趋势折线图 |
| 路由 | 文件路由 + Query String | 例如 `article.html?id=restatement-basics` |

项目没有 `package.json`、构建命令或运行时安装步骤。

## 4. JavaScript 函数结构

所有脚本统一挂载到 `window.HXZ`，避免把大量函数和变量直接放到全局作用域。

### 4.1 `data.js`：静态数据层

`HXZ.data` 包含：

- `site`：站点名称、版本和简介；
- `navigation`：五个主导航入口；
- `routes`：逻辑路由名到 HTML 文件的映射；
- `pageTitles`：页面标题；
- `techniques`：训练技术配置；
- `assessments`、`assessmentQuestions`、`assessmentOptions`：自测数据；
- `trainingCases`：训练案例、核心事实、避免用语和参考表达；
- `articles`：学习文章；
- `demoRecords`：首次体验时生成的演示记录。

新增内容时优先修改数据文件，不需要复制页面。

### 4.2 `app.js`：公共应用层

| 模块 | 主要函数 | 作用 |
| --- | --- | --- |
| `HXZ.util` | `qs`、`qsa`、`escapeHTML`、`clamp`、`uid`、`debounce`、`formatDate`、`average` | DOM 查询、转义、数值处理、ID、日期和通用工具 |
| `HXZ.storage` | `get`、`set`、`remove`、`clearAll` | 给 LocalStorage 统一加 `hxz_v2_` 前缀并处理异常 |
| `HXZ.auth` | `isLoggedIn`、`getUser`、`login`、`demoLogin`、`updateUser`、`logout` | 本地演示登录与资料管理 |
| `HXZ.records` | `ensureSeeded`、`getAll`、`getById`、`add`、`latest`、`clear` | 训练记录的读取、排序和保存 |
| `HXZ.navigation` | `getQuery`、`build`、`go`、`replace`、`back`、`groupForPage`、`isSubPage` | 统一生成和执行页面跳转 |
| `HXZ.ui` | `toast`、`modal`、`closeModal`、`lockedNotice` | 消息提示、确认弹窗和锁定提示 |
| `HXZ.charts` | `create` | 创建 ECharts，并监听窗口和容器尺寸变化 |
| `HXZ.layout` | `renderPublicHeader`、`renderSidebar`、`renderMobileNav`、`renderHeader`、`renderApp`、`renderPublic` | 统一生成公共页和登录后页面骨架 |
| `HXZ.common` | `bind` | 代理处理 `data-route`、参数和返回按钮 |
| `HXZ.boot` | 启动函数 | 读取 `body[data-page]`、检查登录、选择控制器、渲染并初始化 |

页面跳转不再散落写 `window.location`。常规跳转统一使用：

```js
HXZ.navigation.go("trainingGuide", { technique: "restatement" });
```

生成地址：

```text
training-guide.html?technique=restatement
```

HTML 中也可以声明式跳转：

```html
<button
  type="button"
  data-route="trainingGuide"
  data-param-technique="restatement">
  开始训练
</button>
```

### 4.3 `pages-main.js`：基础页面控制器

通用渲染函数：

- `renderTechniqueCard(item)`：训练技术卡片；
- `renderArticleCard(article)`：学习文章卡片。

页面控制器：

- `HXZ.pages.welcome`：欢迎页与游客入口；
- `HXZ.pages.login`：登录/注册模式、校验和演示登录；
- `HXZ.pages.home`：训练概况、快捷入口、推荐和最近记录；
- `HXZ.pages.training`：训练分类筛选与锁定技术提示；
- `HXZ.pages.learning`：文章搜索与分类筛选；
- `HXZ.pages.article`：文章正文与本地收藏；
- `HXZ.pages.profile`：进度、反馈、清除数据和退出；
- `HXZ.pages["profile-edit"]`：编辑本地资料。

每个控制器使用相同约定：

```js
HXZ.pages.pageName = {
  options: { title: "页面标题" },
  render: function () {
    return "页面内容";
  },
  init: function () {
    // DOM 已插入后绑定交互
  }
};
```

### 4.4 `pages-assessment.js`：自测闭环

内部函数：

- `progressKey(id)`：生成答题进度键；
- `resultKey(id)`：生成自测结果键；
- `getResult(id)`：读取结果；
- `getProgress(id)`：读取或创建答题进度；
- `renderAssessmentCard(item)`：生成自测卡片。

控制器：

- `assessment`：展示可用/锁定自测与最近结果；
- `assessment-session`：逐题作答、上一题、下一题、退出保存、提交计算；
- `assessment-result`：结果环、维度列表、ECharts 雷达图和训练建议。

计算逻辑：每题 1–5 分，同维度题目取平均后乘以 20，生成 0–100 分维度结果；总体分数按全部题目计算。结果用于学习建议，不代表心理诊断。

### 4.5 `pages-training.js`：训练闭环

内部函数：

- `createSession(techniqueId)`：创建训练会话；
- `getSession(techniqueId)`：恢复或创建当前会话；
- `saveSession(session)`：保存会话；
- `casesForTechnique(techniqueId)`：取得当前技术案例；
- `keywordMatch(reply, phrase)`：识别核心信息及近义表达；
- `evaluateReply(reply, caseData)`：生成本地演示评价；
- `dimensionLabel(key)`：把内部维度名转换为中文。

控制器：

- `training-guide`：技术目标、正反例和阅读倒计时；
- `training-session`：案例切换、输入、评价、重试、反馈和完成训练；
- `training-result`：总分、分项表现、回应对照和再次训练。

`evaluateReply` 从四个维度计算：

1. 准确性：覆盖多少案例核心事实；
2. 简洁性：回应长度是否适中；
3. 中立性：是否出现判断、推断或说教词；
4. 自然度：长度和基本表达形态是否自然。

这是离线演示规则，后续若接入真实接口，只需替换评价来源，页面和记录结构可继续沿用。

### 4.6 `pages-records.js`：记录层

内部函数：

- `dimensionLabel(key)`：分项名称本地化；
- `renderRecordCard(record)`：记录卡片。

控制器：

- `records`：统计卡片、ECharts 趋势、筛选和历史列表；
- `record-detail`：完整训练过程、逐轮评价、分项结果和打印报告。

## 5. 页面入口与详细设计

| 页面 | 文件 | 主要内容 | 移动端 | 桌面端 |
| --- | --- | --- | --- | --- |
| 欢迎页 | `index.html` | 产品定位、三项能力、登录与游客体验 | 文案与插画纵向排列 | 双栏首屏 |
| 登录/注册 | `login.html` | 模式切换、字段校验、本地说明、体验入口 | 卡片占满主要宽度 | 左图右表单 |
| 首页 | `home.html` | 今日建议、统计、快捷入口、推荐训练、最近记录、学习推荐 | 单列并保留底部导航 | 侧栏 + 多列仪表盘 |
| 自测中心 | `assessment.html` | 说明、最近结果、可用和待开放自测 | 单列卡片 | 双列自测卡片 |
| 自测答题 | `assessment-session.html` | 题目、五级选项、自动保存、上下题 | 大触控区域 | 居中窄内容区 |
| 自测结果 | `assessment-result.html` | 总分、等级、雷达图、分项、推荐 | 图表与分项纵向 | 图表与分项双栏 |
| 训练中心 | `training.html` | 分类、技术卡片、锁定状态 | 卡片单列/双列 | 三列技术卡片 |
| 技术导学 | `training-guide.html` | 技术说明、目标、正反例、倒计时 | 插画在上、内容在下 | 插画和内容双栏 |
| 模拟训练 | `training-session.html` | 案例任务、对话、输入、本地评价、案例进度 | 案例区与聊天区纵向 | 左侧任务、右侧对话 |
| 训练结果 | `training-result.html` | 总分、四维表现、回应对照、下一步 | 单列结果 | 双栏对照 |
| 训练记录 | `records.html` | 次数、平均、最佳、趋势、列表 | 单列统计和记录 | 三统计卡 + 宽图表 |
| 记录详情 | `record-detail.html` | 完整对话、逐轮反馈、分项和打印 | 纵向内容 | 主内容 + 右侧结果栏 |
| 学习中心 | `learning.html` | 搜索、分类、文章卡片 | 单列/双列卡片 | 三列文章卡片 |
| 文章详情 | `article.html` | 元信息、正文、收藏、对应训练 | 阅读宽度自适应 | 居中阅读版心 |
| 个人中心 | `profile.html` | 资料、成长、收藏、反馈、清理、退出 | 单列菜单 | 多列概况 + 菜单 |
| 编辑资料 | `profile-edit.html` | 昵称、单位、身份 | 全宽表单 | 居中表单卡片 |
| 404 | `404.html` | 错误说明与返回入口 | 纵向 | 文案与插画双栏 |

## 6. 导航与业务流程

### 6.1 主导航

主导航固定为五项：

1. 首页；
2. 自测；
3. 训练；
4. 学习；
5. 我的。

小于 1024px 时使用底部导航，“训练”保留旧版中间凸起视觉。大于等于 1024px 时切换为左侧导航，底部导航隐藏。

### 6.2 自测流程

```text
自测中心 → 开始/继续答题 → 自动保存 → 提交 → 结果画像 → 推荐训练或学习
```

### 6.3 训练流程

```text
训练中心 → 技术导学 → 模拟案例 → 本地演示评价 → 下一案例 → 训练结果 → 训练记录
```

### 6.4 学习流程

```text
学习中心 → 搜索/分类 → 文章详情 → 收藏或进入对应训练
```

## 7. 本地数据结构

所有键自动加 `hxz_v2_` 前缀。

| 逻辑键 | 内容 |
| --- | --- |
| `auth` | 当前本地登录状态 |
| `user` | 昵称、账号、单位、身份、头像 |
| `records` | 训练记录数组 |
| `latestRecordId` | 最近完成记录 ID |
| `active_training_session` | 当前未完成训练及全部回应 |
| `guide_completed_restatement` | 导学倒计时完成状态 |
| `assessment_progress_helping-baseline` | 当前题号、答案和时间 |
| `assessment_result_helping-baseline` | 总分、等级、维度与建议依据 |
| `favorites` | 收藏文章 ID 数组 |
| `lastArticle` | 最近阅读文章 ID |
| `feedback` | 仅保存在本机的反馈内容 |

清除浏览器站点数据或点击个人中心的“清除本地数据”后，这些内容会被删除。

## 8. CSS 与响应式方案

### 8.1 视觉延续

- 主色：旧版青绿色系；
- 背景：低饱和浅蓝灰；
- 容器：白色圆角卡片与柔和阴影；
- 强调：浅青、暖黄色 badge 和进度状态；
- 图片：继续使用旧版插画和品牌图标；
- 对话：保留头像、气泡和反馈卡片结构。

### 8.2 断点

| 断点 | 目标 |
| --- | --- |
| `max-width: 520px` | 小屏手机字体、按钮、卡片和图表进一步压缩 |
| `min-width: 768px` | 平板增加双列/三列卡片，提高空间利用率 |
| `min-width: 1024px` | 显示桌面侧栏，隐藏底部导航，启用宽屏布局 |
| `min-width: 1280px` | 增加侧栏和内容留白，限制最大阅读宽度 |
| `@media print` | 隐藏导航与操作按钮，输出结果/记录报告 |

布局不再依赖按 1920 宽度计算 rem 的方案，使用 Grid/Flex 和内容最大宽度，因此不会在桌面端把移动页面简单放大。

## 9. 本次实际修改清单

- 将 7 个旧页面扩展为 17 个明确入口；
- 英文文件名替代业务入口中的中文文件名，降低部署兼容风险；
- 重写全站页面骨架、导航、弹窗、消息提示和返回行为；
- 移除 jQuery、flexible.js 和未使用的 Swiper 运行依赖；
- 保留 ECharts，但改为本地加载并绑定真实 LocalStorage 演示数据；
- 增加自测完整流程；
- 增加技术导学、3 个案例、逐轮本地评价与训练结果；
- 增加记录详情、文章详情、资料编辑和 404 页面；
- 增加登录保护、游客体验和本地注册演示；
- 增加搜索、筛选、收藏、反馈、打印和清除数据；
- 重写桌面/移动响应式 CSS；
- 增加部署、功能数据和全量设计文档。

## 10. 验收状态

当前版本已完成以下检查：

- 全部项目 JavaScript 通过语法检查；
- 17 个 HTML 文件的本地 CSS、JS、图片和页面引用无缺失；
- 16 个动态页面控制器在模拟登录与完整数据下均能生成有效内容；
- 自测结果、训练结果和记录详情分别覆盖有数据状态；
- 页面路由映射的全部目标文件存在；
- 本地评价中，覆盖核心事实且保持中立的回应得分高于明显说教/推测的回应；
- 所有 HTML 页面及核心静态资源通过本地 HTTP 访问返回 200；
- CSS 包含手机、平板、桌面、大屏与打印媒体规则；
- 可执行项目代码不依赖外部 URL。

## 11. 后续扩展建议

仍保持纯静态时，可以继续：

- 在 `data.js` 增加文章、自测题或只读技术介绍；
- 为已存在的训练技术增加案例并把状态改为 `available`；
- 将本地数据导出/导入为 JSON 文件；
- 增加不同训练维度的前端规则。

如果未来允许后端，可在不推翻页面结构的前提下增加：

- 真实账号、权限和多设备同步；
- 服务端保存训练与自测记录；
- AI 模型评价接口；
- 内容管理后台；
- 正式反馈提交和运营统计。

正式对外使用时，应明确“训练工具不替代专业咨询、诊断或督导”，并对账号、隐私、数据保存、未成年人使用和模型输出建立相应规范。
