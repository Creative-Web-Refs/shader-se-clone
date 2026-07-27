import * as THREE from "three";
import "./style.css";

const canvas = document.querySelector("#scene");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.setClearColor(0x0a0710, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0, 0.25, 10.5);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x120c20, 0.055);

const ambient = new THREE.HemisphereLight(0xf4e9cb, 0x321f63, 2.7);
const key = new THREE.DirectionalLight(0xffe6a4, 5.2);
key.position.set(3, 5, 4);
const rim = new THREE.PointLight(0x7549ff, 50, 18);
rim.position.set(-4, 1, 4);
scene.add(ambient, key, rim);

const renderTarget = new THREE.WebGLRenderTarget(1, 1, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  colorSpace: THREE.SRGBColorSpace,
});

const postScene = new THREE.Scene();
const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const postUniforms = {
  tDiffuse: { value: renderTarget.texture },
  uTime: { value: 0 },
  uResolution: { value: new THREE.Vector2(1, 1) },
  uNoise: { value: 0.36 },
  uChromatic: { value: 1.1 },
  uDistortion: { value: 0.12 },
  uVignette: { value: 0.42 },
  uVelocity: { value: 0 },
  uTint: { value: new THREE.Color(0x6f54d9) },
};

const postMaterial = new THREE.ShaderMaterial({
  depthTest: false,
  depthWrite: false,
  uniforms: postUniforms,
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uNoise;
    uniform float uChromatic;
    uniform float uDistortion;
    uniform float uVignette;
    uniform float uVelocity;
    uniform vec3 uTint;
    varying vec2 vUv;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    vec2 barrel(vec2 uv, float strength) {
      vec2 p = uv * 2.0 - 1.0;
      float r2 = dot(p, p);
      p *= 1.0 + strength * r2;
      return p * 0.5 + 0.5;
    }

    void main() {
      vec2 uv = barrel(vUv, uDistortion);
      vec2 center = uv - 0.5;
      float edge = smoothstep(0.025, 0.055, uv.x)
        * smoothstep(0.025, 0.055, uv.y)
        * smoothstep(0.025, 0.055, 1.0 - uv.x)
        * smoothstep(0.025, 0.055, 1.0 - uv.y);

      float px = uChromatic / max(uResolution.x, 1.0);
      vec2 chroma = normalize(center + vec2(0.0001)) * px * (1.0 + length(center) * 4.0);
      vec2 smear = vec2(0.0, clamp(uVelocity, -1.0, 1.0) * 0.004);

      vec3 color;
      color.r = texture2D(tDiffuse, uv + chroma + smear).r;
      color.g = texture2D(tDiffuse, uv).g;
      color.b = texture2D(tDiffuse, uv - chroma - smear).b;
      color = mix(color, texture2D(tDiffuse, uv - smear * 0.5).rgb, 0.18);

      float scan = sin(uv.y * uResolution.y * 1.5) * 0.035;
      float bands = sin((uv.y + uTime * 0.018) * 34.0) * 0.018;
      float grain = hash(uv * uResolution.xy + fract(uTime) * 947.0) - 0.5;
      float vignette = smoothstep(0.94, 0.22, length(center * vec2(0.82, 1.0)));
      float flicker = 0.985 + sin(uTime * 19.0) * 0.008;

      color *= flicker - scan + bands;
      color += grain * uNoise * 0.12;
      color = mix(color, color * uTint, 0.075);
      color *= mix(1.0, vignette, uVignette);
      color *= edge;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
});
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMaterial));

const palette = {
  cream: 0xf2ead6,
  violet: 0x5a43b9,
  purple: 0x281a56,
  acid: 0xdbff54,
  gold: 0xd7a52b,
  black: 0x0b0810,
};

function material(color, options = {}) {
  const mat = new THREE.MeshPhongMaterial({
    color,
    transparent: true,
    opacity: options.opacity ?? 1,
    shininess: options.shininess ?? 35,
    flatShading: options.flatShading ?? false,
    side: options.side ?? THREE.FrontSide,
    wireframe: options.wireframe ?? false,
  });
  mat.userData.baseOpacity = mat.opacity;
  return mat;
}

function lineMaterial(color, opacity = 1) {
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
  });
  mat.userData.baseOpacity = opacity;
  return mat;
}

function addEdges(mesh, color = palette.cream, opacity = 0.5) {
  const edges = new THREE.EdgesGeometry(mesh.geometry);
  const lines = new THREE.LineSegments(edges, lineMaterial(color, opacity));
  mesh.add(lines);
  return mesh;
}

function makeTextTexture(lines, options = {}) {
  const size = 1024;
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = size;
  textureCanvas.height = size / 2;
  const context = textureCanvas.getContext("2d");
  context.fillStyle = options.background ?? "#4b35ad";
  context.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = options.color ?? "#f1e9d6";
  context.font = `${options.weight ?? 400} ${options.size ?? 160}px Georgia`;
  context.fillText(lines[0], size / 2, textureCanvas.height * 0.42);
  if (lines[1]) {
    context.font = "24px 'Courier New'";
    context.letterSpacing = "6px";
    context.fillText(
      lines[1].toUpperCase(),
      size / 2,
      textureCanvas.height * 0.72,
    );
  }
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildHero() {
  const group = new THREE.Group();
  group.userData.tint = new THREE.Color(0x5940c2);
  group.userData.effects = [0.42, 1.3, 0.15, 0.52];

  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 12),
    material(palette.violet, { shininess: 4 }),
  );
  backdrop.position.z = -3.8;
  group.add(backdrop);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(8.2, 4.1),
    new THREE.MeshBasicMaterial({
      map: makeTextTexture(["CIRCUIT", "Creative systems bureau"]),
      transparent: true,
    }),
  );
  screen.material.userData.baseOpacity = 1;
  screen.position.set(0.8, 0.25, -0.1);
  screen.rotation.z = -0.035;
  group.add(screen);

  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(1.05, 0.14, 16, 72),
    material(palette.acid, { shininess: 80 }),
  );
  torus.position.set(-3.8, 1.8, 1.3);
  torus.rotation.set(1.1, 0.2, 0.25);
  group.add(torus);

  for (let i = 0; i < 32; i += 1) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.035 + (i % 3) * 0.012, 8, 8),
      material(i % 4 === 0 ? palette.acid : palette.cream),
    );
    const angle = (i / 32) * Math.PI * 2;
    dot.position.set(
      Math.cos(angle) * 5.1,
      Math.sin(angle) * 2.6,
      -1.4 + (i % 4) * 0.35,
    );
    group.add(dot);
  }
  return group;
}

function buildWork() {
  const group = new THREE.Group();
  group.userData.tint = new THREE.Color(0x243f9f);
  group.userData.effects = [0.3, 0.9, 0.18, 0.34];

  const floor = new THREE.GridHelper(22, 28, palette.cream, 0x453c71);
  floor.material.transparent = true;
  floor.material.opacity = 0.55;
  floor.material.userData.baseOpacity = 0.55;
  floor.rotation.x = 0;
  floor.position.y = -2.6;
  group.add(floor);

  const colors = [0xd9ff57, 0x5d42c0, 0xf2ead6];
  for (let i = 0; i < 7; i += 1) {
    const height = 1.8 + (i % 3) * 0.95;
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, height, 0.72),
      material(colors[i % colors.length], { shininess: 65 }),
    );
    tower.position.set(
      -4.2 + i * 1.4,
      -2.6 + height / 2,
      -0.6 - Math.abs(3 - i) * 0.35,
    );
    addEdges(tower, palette.cream, 0.42);
    group.add(tower);
  }

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(2.3, 0.04, 8, 96),
    material(palette.cream),
  );
  halo.position.set(0.6, 0.8, -1.4);
  halo.rotation.x = 1.35;
  group.add(halo);
  return group;
}

function buildOffice() {
  const group = new THREE.Group();
  group.userData.tint = new THREE.Color(0xb36f2f);
  group.userData.effects = [0.52, 2.2, 0.22, 0.65];

  const room = new THREE.Mesh(
    new THREE.BoxGeometry(8.8, 5.5, 6.5),
    material(0xd9b370, { side: THREE.BackSide, shininess: 5 }),
  );
  room.position.z = -1.7;
  group.add(room);

  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(5.7, 0.26, 2.4),
    material(0x5a2f20, { shininess: 80 }),
  );
  desk.position.set(0.8, -1.4, 0.4);
  desk.rotation.y = -0.15;
  group.add(desk);

  for (const x of [-1.25, 0, 1.25]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.17, 1.8, 0.17),
      material(0x251815, { shininess: 55 }),
    );
    leg.position.set(x + 0.8, -2.25, 0.4);
    group.add(leg);
  }

  const lampStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 2.1, 12),
    material(palette.cream),
  );
  lampStem.position.set(-1.1, 0.1, 0.2);
  lampStem.rotation.z = -0.55;
  group.add(lampStem);

  const lamp = new THREE.Mesh(
    new THREE.ConeGeometry(0.65, 0.85, 24, 1, true),
    material(palette.acid, { side: THREE.DoubleSide, shininess: 30 }),
  );
  lamp.position.set(-1.7, 0.95, 0.2);
  lamp.rotation.z = 0.75;
  group.add(lamp);
  return group;
}

function buildAbout() {
  const group = new THREE.Group();
  group.userData.tint = new THREE.Color(0x355f93);
  group.userData.effects = [0.26, 0.8, 0.12, 0.42];

  const globe = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.7, 3),
    material(palette.cream, { wireframe: true, opacity: 0.82 }),
  );
  globe.position.set(2.7, 0.1, -0.2);
  group.add(globe);

  for (let i = 0; i < 5; i += 1) {
    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(3.2 + i * 0.25, 0.018, 5, 120),
      material(i % 2 ? palette.acid : palette.cream, { opacity: 0.35 }),
    );
    orbit.position.copy(globe.position);
    orbit.rotation.set(0.4 + i * 0.22, 0.2 + i * 0.45, 0.35);
    group.add(orbit);
  }

  const pyramid = new THREE.Mesh(
    new THREE.ConeGeometry(1.8, 3.3, 4),
    material(palette.violet, { opacity: 0.88, shininess: 90 }),
  );
  pyramid.position.set(-3.8, -1.1, -1.4);
  pyramid.rotation.y = Math.PI * 0.25;
  addEdges(pyramid, palette.acid, 0.55);
  group.add(pyramid);
  return group;
}

function buildTie() {
  const group = new THREE.Group();
  group.userData.tint = new THREE.Color(0xaf7923);
  group.userData.effects = [0.38, 1.2, 0.16, 0.38];

  const knot = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.85, 0),
    material(palette.gold, { shininess: 120 }),
  );
  knot.position.set(2.1, 2.25, 0.4);
  knot.scale.set(1.3, 0.85, 0.55);
  group.add(knot);

  const tie = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 1.45, 5.4, 4),
    material(palette.gold, { shininess: 110 }),
  );
  tie.position.set(2.1, -0.55, 0.2);
  tie.rotation.y = Math.PI * 0.25;
  group.add(tie);

  for (let i = 0; i < 18; i += 1) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 3 + (i % 5) * 0.45, 0.12),
      material(i % 3 === 0 ? palette.acid : palette.cream, { opacity: 0.62 }),
    );
    const angle = (i / 18) * Math.PI * 2;
    bar.position.set(Math.cos(angle) * 4.3 - 1.1, Math.sin(angle) * 2.2, -1.8);
    bar.rotation.z = angle;
    group.add(bar);
  }
  return group;
}

function buildContact() {
  const group = new THREE.Group();
  group.userData.tint = new THREE.Color(0x723db6);
  group.userData.effects = [0.45, 1.15, 0.18, 0.45];

  const screenTexture = makeTextTexture(
    ["OPEN LINE", "Channel 05 / standing by"],
    {
      background: "#1d1734",
      color: "#d8ff45",
      size: 124,
    },
  );
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(8.4, 4.2),
    new THREE.MeshBasicMaterial({ map: screenTexture, transparent: true }),
  );
  panel.material.userData.baseOpacity = 1;
  panel.position.set(0, 0.15, -0.6);
  group.add(panel);

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(9.1, 4.9, 0.55),
    material(0x161021, { shininess: 80 }),
  );
  frame.position.set(0, 0.15, -0.95);
  addEdges(frame, palette.acid, 0.5);
  group.add(frame);

  for (let i = 0; i < 20; i += 1) {
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 8),
      material(i % 4 === 0 ? palette.acid : palette.violet),
    );
    led.position.set(-4.15 + i * 0.44, -2.15, -0.28);
    group.add(led);
  }
  return group;
}

const groups = [
  buildHero(),
  buildWork(),
  buildOffice(),
  buildAbout(),
  buildTie(),
  buildContact(),
];
groups.forEach((group, index) => {
  group.userData.index = index;
  scene.add(group);
});

function setGroupOpacity(group, opacity) {
  group.visible = opacity > 0.002;
  group.traverse((object) => {
    if (!object.material) return;
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materials.forEach((mat) => {
      mat.transparent = true;
      mat.opacity = (mat.userData.baseOpacity ?? 1) * opacity;
    });
  });
}

const chapters = [...document.querySelectorAll(".chapter")];
const progressValue = document.querySelector(".progress__value");
const progressSection = document.querySelector(".progress__section");
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
let targetProgress = 0;
let smoothProgress = 0;
let lastSmoothProgress = 0;

function readScroll() {
  const max = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  targetProgress = window.scrollY / max;
}

function updateStory() {
  smoothProgress +=
    (targetProgress - smoothProgress) * (reducedMotion ? 1 : 0.16);
  const scaled = smoothProgress * (groups.length - 1);
  const current = Math.min(groups.length - 1, Math.floor(scaled));
  const next = Math.min(groups.length - 1, current + 1);
  const local = scaled - current;
  const eased = local * local * (3 - 2 * local);

  groups.forEach((group, index) => {
    const opacity = index === current ? 1 - eased : index === next ? eased : 0;
    setGroupOpacity(group, opacity);
  });

  const currentGroup = groups[current];
  const nextGroup = groups[next];
  postUniforms.uTint.value
    .copy(currentGroup.userData.tint)
    .lerp(nextGroup.userData.tint, eased);
  postUniforms.uNoise.value = THREE.MathUtils.lerp(
    currentGroup.userData.effects[0],
    nextGroup.userData.effects[0],
    eased,
  );
  postUniforms.uChromatic.value = THREE.MathUtils.lerp(
    currentGroup.userData.effects[1],
    nextGroup.userData.effects[1],
    eased,
  );
  postUniforms.uDistortion.value = THREE.MathUtils.lerp(
    currentGroup.userData.effects[2],
    nextGroup.userData.effects[2],
    eased,
  );
  postUniforms.uVignette.value = THREE.MathUtils.lerp(
    currentGroup.userData.effects[3],
    nextGroup.userData.effects[3],
    eased,
  );

  chapters.forEach((chapter, index) => {
    const distance = Math.abs(index - scaled);
    const opacity = THREE.MathUtils.smoothstep(1.12 - distance, 0, 1);
    chapter.style.setProperty("--chapter-opacity", opacity.toFixed(3));
  });

  document.documentElement.style.setProperty(
    "--page-progress",
    smoothProgress.toFixed(4),
  );
  progressValue.textContent = String(Math.round(smoothProgress * 100)).padStart(
    3,
    "0",
  );
  progressSection.textContent = `SEC. ${String(current + 1).padStart(2, "0")}`;

  const velocity = smoothProgress - lastSmoothProgress;
  postUniforms.uVelocity.value +=
    (velocity * 120 - postUniforms.uVelocity.value) * 0.18;
  lastSmoothProgress = smoothProgress;
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height, false);
  renderTarget.setSize(width * pixelRatio, height * pixelRatio);
  postUniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

const clock = new THREE.Clock();
function animate() {
  const elapsed = clock.getElapsedTime();
  updateStory();

  groups[0].rotation.y = Math.sin(elapsed * 0.13) * 0.035;
  groups[1].rotation.y = Math.sin(elapsed * 0.16) * 0.11;
  groups[1].children.forEach((child, index) => {
    if (child.isMesh)
      child.position.y += Math.sin(elapsed * 0.8 + index) * 0.0007;
  });
  groups[2].rotation.y = Math.sin(elapsed * 0.11) * 0.045;
  groups[3].rotation.y += 0.0008;
  groups[4].rotation.y = Math.sin(elapsed * 0.2) * 0.08;
  groups[5].rotation.z = Math.sin(elapsed * 0.15) * 0.012;

  camera.position.x = Math.sin(elapsed * 0.09) * 0.13;
  camera.position.y = 0.25 + Math.cos(elapsed * 0.07) * 0.09;
  camera.lookAt(0, 0, 0);

  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  postUniforms.uTime.value = elapsed;
  renderer.render(postScene, postCamera);
  requestAnimationFrame(animate);
}

window.addEventListener("scroll", readScroll, { passive: true });
window.addEventListener("resize", resize, { passive: true });
readScroll();
resize();
animate();

window.setTimeout(
  () => {
    document.querySelector(".boot").classList.add("is-complete");
  },
  reducedMotion ? 250 : 1250,
);
