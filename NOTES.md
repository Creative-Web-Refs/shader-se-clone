# shader-se-clone · 克隆笔记

## 源信息
- 原站 URL: https://www.shader.se
- 源码仓库: 无公开仓库；`shader-sweden` GitHub 组织无公开 repo
- 原作者: Shader Development Studio / Shader Sweden AB
- 许可证: 原站加载画面明确标注 **All Rights Reserved**
- 致谢要求: 明确技术参考来源、非关联声明；不再分发原 bundle/媒体/品牌资产

## 技术栈
- 框架 / 关键库 / Node 版本: Vite 7、Three.js 0.179、原生 HTML/CSS/JS、Node 22

## 复刻前预判
- 复杂度等级: L5
- 推荐模式: clean-room 视觉复刻
- 可高保真的部分: 单 Canvas、滚动分镜、CRT/模拟录像后处理、复古企业视觉节奏
- 需要近似或替代的部分: WebGPU/TSL → WebGL/GLSL；私有模型/视频 → 原创程序几何
- 不克隆的部分: Prismic 数据、Mux 视频、项目详情页、原品牌/联系信息、分析追踪
- 主要风险: 原站无开放许可证且明确 All Rights Reserved，因此禁止镜像/公开重部署原代码资产

## 跑起来
```bash
cd /Users/sunebear/Code/Zworks/Wsune/creative-refs-2025/shader-se-clone
npm install
npm run dev
```

## 改了什么（对照原版）
- 全部品牌与文案替换为虚构的 Circuit Office
- 不使用原站 bundle、Prismic 内容、Mux 视频、字体、模型或纹理
- 用 6 组程序几何替代原站 7 个私有场景阶段
- 用 WebGLRenderTarget + 单 GLSL composite 复现核心模拟屏幕语言
- 未加入任何统计、像素或追踪脚本

## 原站 vs 克隆站
| 模块 | 原站表现 | 克隆实现 | 差异 / 取舍 | 证据 |
|---|---|---|---|---|
| 首屏 | 企业录像带加载 + 3D hero | 原创 boot + Circuit 3D hero | 品牌、构图、文字均替换 | `RECON/screenshots/` |
| 导航 | Canvas 视觉 + 隐藏语义层 | 可见语义导航与章节 | 更直接可访问 | `index.html` |
| 核心动效 | WebGPU/TSL FBO 多效果合成 | WebGL FBO + GLSL 单合成 | 架构同类，节点图简化 | `src/main.js` |
| 内容区块 | 7 阶段 + 项目详情路由 | 6 个原创章节、单页 | 不克隆项目页 | `RECON/routes*/` |
| 移动端 | 单 Canvas 响应式 | 390px 验证通过 | 文案重排，功能保留 | `RECON/screenshots/clone-390.png` |

## 复刻评分
- 源证据: 4/5
- 结构保真: 3/5
- 视觉保真: 3/5
- 动效/交互: 4/5
- 响应式: 4/5
- 功能完整: 4/5
- 内容替换: 5/5
- 法务/部署风险: 4/5
- 总评: 31/40；可公开部署的独立技术研究，不是逐像素复制品

## 替换地图（要换什么改哪）
- 文字 → `index.html`
- 图片/媒体 → 无原始媒体；程序纹理由 `src/main.js` 生成
- 配色 → `src/style.css` 的 `:root` 与 `src/main.js` 的 `palette`
- 3D 场景 → `src/main.js` 的 `buildHero`…`buildContact`

## 验证
- [x] 本地跑通、console 0 error
- [x] 截图对照原站（RECON/screenshots/）
- [x] 原站/克隆站路由地图
- [x] 克隆站 interaction probe（16 actions）
- [x] visual-diff 原始指标（方法学限制见 CLONE_REPORT）
- [x] audit-clone 残留审计
- 验证不了的点（如实记，别伪造）: 原站 interaction probe 因连续 `ERR_TUNNEL_CONNECTION_FAILED` 未完成；未宣称自动验证了原站滚动/拖拽
