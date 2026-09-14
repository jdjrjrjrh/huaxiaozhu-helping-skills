# 第三方与视觉资源说明

- `assets/vendor/echarts.min.js`：Apache ECharts 5.3.2，用于自测雷达图和训练趋势图；上游版权及 Apache-2.0 声明保留在文件中。
- `assets/images/illustrations/`：为本开源版本重新绘制的 SVG 插画，可随项目代码按 MIT License 使用。
- `assets/images/legacy/`：项目自有的品牌角色与界面图标，仅保留运行时实际引用的 11 个文件；发布前已移除未使用素材和带第三方品牌文案的旧封面。

开源版本不再携带旧版商业字体，界面改用系统字体栈。运行代码未引入 jQuery、flexible.js 或 Swiper，也不会从 CDN 请求资源。完整许可边界见仓库根目录的 `NOTICE.md`。
