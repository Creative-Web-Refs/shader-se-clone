# Shader.se 技术拆解

## 一句话本质

一条自定义长滚动时间线驱动多个实时 3D 场景进入同一个固定 Canvas，再通过可配置的
WebGPU/TSL 后处理，把结果变成弯曲、带噪点的 1980 年代企业显示器画面。

## A. 有证据支持的架构

### 渲染

- `SOURCE` — 响应头确认页面由 Next.js 静态预渲染。
- `SOURCE` — 运行时只存在一个固定 `<canvas>`；在 1280×720 CSS 视口下，
  backing store 为 1920×1080。
- `SOURCE` — 检查到的 vendor/application bundle 包含 Three.js WebGPU
  renderer 与 TSL 节点构建代码。
- `SOURCE` — 场景配置包含 `hero`、`projects`、`office`、`about-us`、
  `golden-tie-reveal`、`golden-tie`、`contact`。

### 合成

- `SOURCE` — 应用先把活动场景渲染到 FBO，再执行最终合成。
- `SOURCE` — 合成节点接受 Bloom intensity/threshold/radius、Sepia、Brightness、
  Contrast、Chromatic aberration、Motion blur、Lens distortion、UI textures、
  Time/noise 与 Vignette 等参数。
- `SOURCE` — 不同章节拥有独立 effect preset，并在章节/子页面转场时插值。
- `PARTIAL` — bundle 证据能确认控制项和图连接，但 source map 不可用，因此无法得到
  原始友好模块名。

### 交互

- `SOURCE` — 桌面运行时存在约 17,452px 的自定义滚动容器，而 body 本身保持视口
  高度。
- `SOURCE` — 配置包含 4 种转场类型：`fade`、`direct`、`overlay`、`below`。
- `SOURCE` — 无障碍层将语义导航、Hero、项目轮播、About、Contact 和项目控制与
  Canvas 分离。
- `GUESS` — 未拿到原始 source map 时，无法单独还原全部缓动曲线、相机路径及私有
  模型动画细节。

### 资产与数据

- `SOURCE` — 首页 HTML 内包含 Prismic 项目数据与 Mux playback id。
- `SOURCE` — 网络捕获记录到主站、`www.gstatic.com` 和站点分析 host 的请求。
- `SOURCE` — 加载画面明确标注原作“All Rights Reserved”。

Hash 与非代码证据保存在
[`RECON/source-evidence.json`](./RECON/source-evidence.json)。

## B. 当前镜像方案

`main` 不再独立重写原站场景，而是通过
[`public/_worker.js`](./public/_worker.js) 流式转发当前生产响应：

| 原站行为 | 镜像处理 |
|---|---|
| Next.js HTML 与 chunks | 相同路径、相同 query 原样转发 |
| WebGPU/TSL 场景 | 浏览器执行原生产 bundle |
| 模型、纹理、字体与动画帧 | 相对路径继续经过同源镜像 |
| 项目 Mux/Prismic 数据 | 保留原生产请求逻辑 |
| 路由重定向 | 仅把同源 Location 改写回镜像域名 |
| 访客 cookie 与 IP 转发头 | 转发前移除 |

根 HTML 解压后与上游逐字节一致，因此 Canvas 场景、后处理、滚动状态、移动端逻辑和
项目交互均为原站当前部署版本。

## C. 可迁移方法

1. 对 WebGL 重前端站，先确认能否获取真实部署资产，不要先用截图猜 shader。
2. 反向代理需要保持 pathname 与 query 不变，否则 Next chunks 和运行时资源会失效。
3. 响应 body 应使用 stream 透传，避免 HTML 重写破坏 nonce、RSC 或压缩。
4. 只改写必要的同源 redirect，不修改生产脚本和场景资源。
5. 使用健康检查、响应来源头、README 与分支隔离明确镜像身份。
6. 实时 mirror 依赖上游可用性；需要离线归档时应另做全量资产捕获，而不是混用两种
   交付口径。
