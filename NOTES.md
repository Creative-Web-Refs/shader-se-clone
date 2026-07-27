# shader-se-clone · 克隆笔记

## 源信息

- 原站 URL: https://www.shader.se
- 源码仓库: 无公开仓库；`shader-sweden` GitHub 组织无公开 repo
- 原作者: Shader Development Studio / Shader Sweden AB
- 许可证: 原站加载画面标注 **All Rights Reserved**
- 发布策略: clean-room 高保真视觉复刻；不再分发原 bundle、模型、视频或照片

## 技术栈

- Vite 7
- 原生 HTML/CSS/JavaScript
- 低分辨率 Canvas grain
- CSS sticky stages、渐变、clip-path、透视与 blend modes
- Playwright 视觉/交互验证

## 本轮 1:1 重做

- 恢复原站 Shader 品牌、公开标题、章节顺序与导航结构
- 按原站逐屏重建 8 个画面：
  1. CRT 电脑首屏
  2. 蓝色胶片项目轮播
  3. 无限办公室与 About Us 翻页
  4. 米色年报 About
  5. Still Not Convinced / 星形揭示
  6. Golden Tie
  7. 电话与 “Hello”
  8. `Good buy.` 联系页
- 5 张核心场景图为本项目重新生成并自托管，没有下载原站素材
- 用 CSS + Canvas 模拟原站 WebGPU 后处理观感
- 未加入分析、像素或追踪脚本

## 原站 vs 克隆站

| 模块 | 原站表现 | 克隆实现 | 差异 / 取舍 |
|---|---|---|---|
| 首屏 | 烟雾、复古电脑、左侧大标题 | 原创 CRT 电脑资产 + 同构排版 | 电脑型号细节不同 |
| 作品区 | WebGPU 曲面胶片 + Mux 视频 | CSS 透视胶片 + 原创项目帧 | 不分发原视频 |
| 办公室 | 3D 重复模型 + 纸张转场 | 原创办公室资产 + CSS 翻页 | 镜头为 2.5D |
| About | 企业年报、人物与品牌 logo | 同构年报 + 原创人物/抽象商标 | 不复制真实 logo |
| 终章 | 星形揭示、人物视频、金领带、电话 | clip-path / CSS 干涉 + 原创场景图 | 人物不相同 |
| 后处理 | WebGPU/TSL 多节点 | Canvas grain + CSS scanline/vignette | 实现不同、外观相近 |

## 验证

- [x] `npm run build`
- [x] 1440 / 768 / 390 三宽度浏览器测试
- [x] 三宽度 console 0 error、page error 0
- [x] 桌面逐屏与原站人工对照
- [x] 项目轮播按钮与锚点导航可用
- [x] reduced-motion 路径
- [x] audit-clone 人工复核

## 仍然不同的部分

- 原站的真实 3D 模型、视频人物和项目媒体受版权保护，使用原创生成素材替代。
- 原站的 WebGPU 曲面/镜头形变比 CSS 2.5D 更连续。
- 项目详情路由、Prismic 内容接口和 Mux 播放器未复刻。

这些差异不会改变首页的主要构图、章节、滚动节奏和整体时代质感。
