# Shader.se · 镜像验证报告

## 结论

`main` 分支现在是透明 Cloudflare Pages 反向代理镜像，不再是手工重绘版本。

| 维度 | 原站 | 镜像 | 结果 |
|---|---|---|---|
| 根 HTML | Vercel / Next.js 生产响应 | 解压后相同字节 | 完全一致 |
| JavaScript / CSS | 生产 `_next` chunks | 原样流式转发 | 完全一致 |
| WebGPU 场景 | 原 renderer、shader、模型 | 原始运行时 | 完全一致 |
| 字体/纹理/视频帧 | 原公开资产 | 相同路径经过镜像 | 完全一致 |
| 滚动时间线 | 原自定义 wheel/touch 状态 | 原始运行时 | 完全一致 |
| 路由 | 当前生产路由 | 同路径代理 | 完全一致 |
| 响应式 | 当前生产逻辑 | 相同运行时 | 完全一致 |

## 运行时验证

- HTTP 根路径：200
- 页面标题：`Shader Development Studio`
- H1：`A Creative Development Studio, Plugged into the Future`
- Canvas 数量：1
- 加载后 Console error：0
- 滚动至项目胶片后 Console error：0
- 项目胶片截图：与原站一致

## 架构取舍

保真度现在依赖上游可用性。该实现是实时镜像，不是冻结的离线快照。上一版自包含
近似实现保留在 `clean-room-recreation`。
