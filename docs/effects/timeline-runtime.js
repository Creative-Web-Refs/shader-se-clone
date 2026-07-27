/**
 * 滚动时间线与每帧场景选择的语义化阅读版。
 *
 * 证据级别：SOURCE（模块拆分与变量名为 PARTIAL）
 * 来源：
 * - scene-config.pretty.js 26911–26929
 * - render-pipeline.pretty.js 2136–2263、116095–116299
 * - section-navigation.pretty.js 5126–5257
 *
 * 这些函数不参与镜像运行。
 */

export function buildPageTimeline(pageConfigs) {
  let cursor = 0;
  const pagesById = new Map();

  const pages = pageConfigs.map((config) => {
    const range = {
      start: cursor,
      end: cursor + config.length,
    };
    const renderPreroll = Math.max(
      config.renderOffset?.beforeStart ?? 0,
      config.transitionLength ?? 0,
    );
    const page = {
      ...config,
      range,
      renderRange: {
        start: range.start - renderPreroll,
        end: range.end + (config.renderOffset?.afterEnd ?? 0),
      },
    };

    cursor = range.end;
    pagesById.set(page.id, page);
    return page;
  });

  return {
    pages,
    pagesById,
    totalLength: cursor,
  };
}

/**
 * 主时间线以一个 viewportHeight 为一个单位。
 */
export function scrollPixelsToTimeline({
  scrollPixels,
  velocityPixels,
  viewportHeight,
}) {
  const pageUnit = Math.max(viewportHeight, 1);

  return {
    progress: scrollPixels / pageUnit,
    velocity: velocityPixels / pageUnit,
  };
}

/**
 * Accessibility/FWA 子页面使用 0–1 的完整页面进度。
 */
export function scrollPixelsToNormalizedSubPage({
  scrollPixels,
  velocityPixels,
  viewportHeight,
  pageCount,
}) {
  const scrollablePixels = Math.max((pageCount - 1) * viewportHeight, 1);

  return {
    progress: clamp(scrollPixels / scrollablePixels, 0, 1),
    velocity: velocityPixels / scrollablePixels,
  };
}

/**
 * 返回当前帧应该激活的语义页面、UI 页面和场景集合。
 *
 * 原代码从末尾向前遍历。重叠时，较早定义的页面最后覆盖 activePage，
 * 但所有命中 renderRange 的场景都会进入 renderScenes。
 */
export function selectFramePlan(pages, scroll, hasSubPage = false) {
  let activePage = null;
  let activeUiPage = null;
  const renderScenes = new Set();

  for (let index = pages.length - 1; index >= 0; index -= 1) {
    const page = pages[index];

    const pageStart = page.range.start + (page.pageOffset?.start ?? 0);
    const pageEnd = page.range.end + (page.pageOffset?.end ?? 0);

    if (pageStart <= scroll && pageEnd > scroll) {
      activePage = page.id;
    }

    const uiStart = page.range.start + (page.uiPageOffset?.start ?? 0);
    const uiEnd = page.range.end + (page.uiPageOffset?.end ?? 0);

    if (!hasSubPage && uiStart <= scroll && uiEnd > scroll) {
      activeUiPage = page.id;
    }

    const renderRange = page.renderRange ?? page.range;
    if (renderRange.start < scroll && renderRange.end > scroll) {
      renderScenes.add(page.id);
    }
  }

  return {
    activePage,
    activeUiPage,
    renderScenes,
  };
}

/**
 * 原站交替复用两个 Set。刚离开 renderRange 的场景还会收到最后一次更新，
 * 使模拟和缓存纹理有机会完成收尾。
 */
export function findScenesLeavingFrame(previousScenes, currentScenes) {
  return new Set(
    [...previousScenes].filter((sceneId) => !currentScenes.has(sceneId)),
  );
}

/**
 * 普通相邻页面的纹理转场计划。
 *
 * 转场参数来自“下一页面”，不是当前页面。
 */
export function describePageBlend(pages, currentIndex, scroll) {
  const current = pages[currentIndex];
  const next = pages[currentIndex + 1];

  if (!next) {
    return {
      type: "single",
      current: current.id,
      progress: 0,
    };
  }

  const transitionStart = current.range.end - (next.transitionLength ?? 0);
  const transitionEnd = current.range.end;

  if (scroll <= transitionStart) {
    return {
      type: "single",
      current: current.id,
      progress: 0,
    };
  }

  return {
    type: next.transition,
    current: current.id,
    next: next.id,
    progress: smoothstep(transitionStart, transitionEnd, scroll),
  };
}

/**
 * Navbar 的章节跳转。
 *
 * `controller` 对应 Lenis，`motion` 对应 MotionValue/animate。这里通过依赖注入
 * 保留原始时序，避免携带 React/Zustand 包装。
 */
export function navigateToSection({
  fromPageId,
  toPage,
  viewportHeight,
  controller,
  motion,
}) {
  const isHeroProjectsPair =
    (fromPageId === "hero" && toPage.id === "projects") ||
    (fromPageId === "projects" && toPage.id === "hero");

  if (isHeroProjectsPair) {
    controller.scrollTo(toPage.range.start * viewportHeight, {
      duration: 0.8,
      easing: [0.48, 0.09, 0.22, 1],
      lock: true,
    });
    return;
  }

  const target =
    toPage.id === "contact" ? toPage.range.start + 0.05 : toPage.range.start;

  motion.sectionTransitionState.set({
    to: toPage.id,
    target,
  });
  motion.sectionLensDistortion.set(toPage.effects.lensDistortion);
  motion.sectionLensDistortionBorder.set(toPage.effects.lensDistortionBorders);

  controller.stop();
  motion.animate(motion.sectionTransition, 1, {
    duration: 1.25,
    onComplete: () => {
      controller.start();
      motion.sectionTransitionState.set(null);
      motion.sectionTransition.set(0);
      motion.sectionLensDistortion.set(0);
      motion.sectionLensDistortionBorder.set(0);
      controller.scrollTo(target * viewportHeight, {
        immediate: true,
      });
    },
  });
}

export function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function smoothstep(edge0, edge1, value) {
  if (value <= edge0) return 0;
  if (value >= edge1) return 1;

  const progress = (value - edge0) / (edge1 - edge0);
  return progress * progress * (3 - 2 * progress);
}
