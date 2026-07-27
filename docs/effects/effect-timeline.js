/**
 * 章节后处理权重与四层插值。
 *
 * 证据级别：SOURCE（函数边界和变量名为 PARTIAL）
 * 来源：render-pipeline.pretty.js 54870–54884、74468–74650。
 *
 * 注意：saturation 在 GPU 的每个场景纹理采样阶段处理，不在这组 CPU 加权字段中。
 */

export const EFFECT_KEYS = [
  "bloomIntensity",
  "sepiaIntensity",
  "noiseIntensity",
  "noiseVelocity",
  "bloomThreshold",
  "bloomRadius",
  "bloomSmoothing",
  "contrast",
  "brightness",
  "lensDistortion",
  "lensDistortionBorders",
  "motionBlur",
  "pow",
  "vignetteRadius",
  "vignetteSmoothness",
  "vignetteIntensity",
  "chromaticAbberationStrength",
];

export function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function remap(value, inStart, inEnd, outStart, outEnd) {
  return (
    outStart + ((value - inStart) * (outEnd - outStart)) / (inEnd - inStart)
  );
}

export function lerp(from, to, progress) {
  return from * (1 - progress) + to * progress;
}

export function smoothstep(edge0, edge1, value) {
  if (value <= edge0) return 0;
  if (value >= edge1) return 1;

  const progress = (value - edge0) / (edge1 - edge0);
  return progress * progress * (3 - 2 * progress);
}

export function smoothstep01(value) {
  const progress = clamp(value, 0, 1);
  return progress * progress * (3 - 2 * progress);
}

/**
 * effectTransitionLength 只控制后处理参数的交叉淡化窗。
 * effectOffset < 0 会让目标章节的效果提前进入。
 */
export function calculateSceneWeights(scroll, pages) {
  if (scroll <= 0) {
    return pages.map((_, index) => Number(index === 0));
  }

  return pages.map((page, index) => {
    const duration = page.effectTransitionLength ?? page.transitionLength ?? 0;
    const offset = page.effectOffset ?? 0;
    const fadeInStart = page.range.start - duration + offset;
    const fadeInEnd = page.range.start + offset;

    if (scroll >= fadeInStart && scroll <= fadeInEnd) {
      return smoothstep(fadeInStart, fadeInEnd, scroll);
    }

    const next = pages[index + 1];
    const nextDuration =
      next?.effectTransitionLength ?? next?.transitionLength ?? 0;
    const nextOffset = next?.effectOffset ?? 0;
    const plateauStart = page.range.start + offset;
    const plateauEnd = page.range.end - nextDuration + nextOffset;
    const fadeOutEnd = page.range.end + nextOffset;

    if (scroll >= plateauStart && scroll <= plateauEnd) {
      return 1;
    }

    if (scroll >= plateauEnd && scroll <= fadeOutEnd) {
      return 1 - smoothstep(plateauEnd, fadeOutEnd, scroll);
    }

    return 0;
  });
}

export function weightedPresetSum(pages, weights) {
  const effects = Object.fromEntries(EFFECT_KEYS.map((key) => [key, 0]));

  for (let index = 0; index < pages.length; index += 1) {
    const weight = weights[index] ?? 0;
    if (weight === 0) continue;

    for (const key of EFFECT_KEYS) {
      effects[key] += weight * (pages[index].effects[key] ?? 0);
    }
  }

  return effects;
}

export function lerpEffects(from, to, progress) {
  return Object.fromEntries(
    EFFECT_KEYS.map((key) => [
      key,
      lerp(from[key] ?? 0, to[key] ?? 0, progress),
    ]),
  );
}

/**
 * 原站的特效混合顺序：
 *
 * 主场景 presets
 *   → 子页面 preset
 *   → Loading preset
 *   → 章节跳转目标 preset
 */
export function resolveEffects({
  scroll,
  pages,
  subPagePreset,
  subPageTransition = 0,
  loadingPreset,
  initialTransition = 1,
  sectionTargetPreset,
  sectionTransition = 0,
}) {
  const weights = calculateSceneWeights(scroll, pages);
  let effects = weightedPresetSum(pages, weights);

  if (subPagePreset) {
    effects = lerpEffects(
      effects,
      subPagePreset,
      smoothstep01(subPageTransition),
    );
  }

  if (loadingPreset) {
    effects = lerpEffects(
      effects,
      loadingPreset,
      smoothstep01(1 - initialTransition),
    );
  }

  if (sectionTargetPreset) {
    const lateSectionProgress = clamp(
      remap(sectionTransition, 0.5, 1, 0, 1),
      0,
      1,
    );

    effects = lerpEffects(
      effects,
      sectionTargetPreset,
      smoothstep01(lateSectionProgress),
    );
  }

  return {
    effects,
    weights,
  };
}

export function describeEffectWindow(page, nextPage) {
  const duration = page.effectTransitionLength ?? page.transitionLength ?? 0;
  const offset = page.effectOffset ?? 0;
  const nextDuration =
    nextPage?.effectTransitionLength ?? nextPage?.transitionLength ?? 0;
  const nextOffset = nextPage?.effectOffset ?? 0;

  return {
    fadeIn: {
      start: page.range.start - duration + offset,
      end: page.range.start + offset,
    },
    plateau: {
      start: page.range.start + offset,
      end: page.range.end - nextDuration + nextOffset,
    },
    fadeOut: {
      start: page.range.end - nextDuration + nextOffset,
      end: page.range.end + nextOffset,
    },
  };
}
