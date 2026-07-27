# 核心时间代码阅读指南

这里把 Shader.se 生产 bundle 中最关键的时间线逻辑重新命名、格式化并拆成几个小文件。
这些文件用于阅读和技术研究，不参与镜像运行。

## 建议阅读顺序

1. [`scene-presets.js`](./scene-presets.js)：七个章节的长度、转场和后处理参数。
2. [`timeline-runtime.js`](./timeline-runtime.js)：滚动像素如何变成时间轴单位，以及每帧
   如何选择活动章节和场景。
3. [`effect-timeline.js`](./effect-timeline.js)：章节权重、smoothstep 和四层特效插值。
4. [`post-processing-time.js`](./post-processing-time.js)：时钟、噪声相位、Bloom 呼吸和
   帧率补偿 Motion Blur。
5. [`source-map.json`](./source-map.json)：上述结论对应的生产 chunk、SHA-256 和
   Prettier 行号。

## 证据标签

- `SOURCE`：数值、公式或控制流可以直接从当前生产 bundle 证明。
- `PARTIAL`：控制流有源码证据，但模块边界和可读变量名是重新组织的。
- `GUESS`：仅凭视觉或上下文推断。本目录的核心数学没有使用 `GUESS`。

这些 `.js` 文件是**语义化阅读版**，不是 Shader Sweden AB 的原始源文件：

- 混淆变量被替换成可读名字；
- React、Zustand、Motion 和 TSL 包装被压缩成普通函数；
- 重复的字段插值被提取成帮助函数；
- 没有复制整份专有生产 bundle。

## 重新获取格式化生产代码

安装依赖后运行：

```bash
npm run extract:sources
```

脚本会从 `https://www.shader.se` 当前首页发现 Next.js chunks，按特征定位三个核心
bundle，校验 SHA-256，并将格式化结果写入：

```text
.cache/shader-readable/
├── manifest.json
├── raw/
│   ├── scene-config.min.js
│   ├── render-pipeline.min.js
│   └── section-navigation.min.js
└── formatted/
    ├── scene-config.pretty.js
    ├── render-pipeline.pretty.js
    └── section-navigation.pretty.js
```

`.cache/` 已加入 `.gitignore`。上游代码只留在本地，不会随仓库发布。原站更新后，
chunk 文件名、SHA-256 和行号可能变化，应重新运行脚本并更新
[`source-map.json`](./source-map.json)。

## 时间单位

配置中的 `length` 不是秒，而是“视口高度页数”。主页面的换算关系为：

```text
timelineProgress = scrollPixels / viewportHeight
```

因此滚动一个完整视口，主时间线前进 `1`。`clock.getElapsedTime()` 则是独立的真实秒
时钟，只用于 Noise、Bloom 等连续动画。

## 权利说明

原站生产代码及内容为 All Rights Reserved。本目录只提交重新命名的语义化重建、
少量事实参数和来源索引；完整格式化 bundle 由脚本按需下载到本地缓存。
