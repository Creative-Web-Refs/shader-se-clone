/**
 * 最终后处理中的真实秒时钟。
 *
 * 证据级别：SOURCE（函数边界和变量名为 PARTIAL）
 * 来源：render-pipeline.pretty.js 73859–74219、74439–74447、74711–74713。
 *
 * 滚动时间线使用“视口高度页数”，这里的 elapsedSeconds 才是真实秒。
 */

export const MOTION_BLUR_REFERENCE_DELTA = 1 / 120;

/**
 * 原站每帧将 Three.js clock.getElapsedTime() 写入合成 uniform。
 */
export function writeFrameTime(uniforms, clock) {
  const elapsedSeconds = clock.getElapsedTime();
  uniforms.time.value = elapsedSeconds;
  return elapsedSeconds;
}

/**
 * Noise 的 velocity 是时间相位速度，不是位移幅度。
 */
export function computeNoisePhase(elapsedSeconds, noiseVelocity) {
  return elapsedSeconds * noiseVelocity;
}

/**
 * DPR 和移动端会降低噪声强度。
 */
export function computeNoiseStrength({
  noiseIntensity,
  devicePixelRatio,
  isMobile,
}) {
  const dprFactor = devicePixelRatio >= 2 ? 1 : 0.7;
  const mobileFactor = isMobile ? 0.65 : 1;

  return 0.037 * noiseIntensity * dprFactor * mobileFactor;
}

/**
 * Bloom 使用三个嵌套正弦产生轻微的 CRT 呼吸。
 */
export function computeBloomIntensity({
  elapsedSeconds,
  bloomIntensity,
  bloomBoost = 0,
}) {
  const flicker =
    (Math.sin(2.65 * elapsedSeconds) +
      Math.sin(5.85 * elapsedSeconds + 1.2 * Math.sin(1.05 * elapsedSeconds)) +
      Math.sin(
        11.95 * elapsedSeconds + 0.65 * Math.cos(3.55 * elapsedSeconds),
      )) *
    0.03 *
    bloomIntensity;

  return 1.5 * bloomIntensity + flicker + bloomBoost;
}

/**
 * Motion Blur 不是速度向量模糊，而是当前帧与历史帧的反馈混合。
 * 这里是写入 uniform 前的帧率补偿公式。
 */
export function normalizeMotionBlurStrength({
  configuredStrength,
  deltaSeconds,
}) {
  let correctedStrength = configuredStrength;

  if (deltaSeconds > MOTION_BLUR_REFERENCE_DELTA) {
    correctedStrength *= MOTION_BLUR_REFERENCE_DELTA / deltaSeconds;
  } else {
    correctedStrength **= deltaSeconds / MOTION_BLUR_REFERENCE_DELTA;
  }

  return 1.3 * correctedStrength;
}

/**
 * 阅读用的后处理时钟更新摘要。
 */
export function updateTimeDrivenEffects({
  uniforms,
  elapsedSeconds,
  deltaSeconds,
  effects,
  devicePixelRatio,
  isMobile,
  bloomBoost,
}) {
  uniforms.time.value = elapsedSeconds;
  uniforms.noiseVelocity.value = effects.noiseVelocity;
  uniforms.noiseIntensity.value = computeNoiseStrength({
    noiseIntensity: effects.noiseIntensity,
    devicePixelRatio,
    isMobile,
  });
  uniforms.motionBlurStrength.value = normalizeMotionBlurStrength({
    configuredStrength: effects.motionBlur,
    deltaSeconds,
  });
  uniforms.bloomIntensity.value = computeBloomIntensity({
    elapsedSeconds,
    bloomIntensity: effects.bloomIntensity,
    bloomBoost,
  });
}
