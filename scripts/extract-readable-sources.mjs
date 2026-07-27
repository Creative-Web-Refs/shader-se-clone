import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { format } from "prettier";

const ORIGIN = "https://www.shader.se";
const DEFAULT_OUTPUT = ".cache/shader-readable";
const MAX_ATTEMPTS = 5;

const targets = [
  {
    id: "scene-config",
    markers: [
      "golden-tie-reveal",
      "effectTransitionLength",
      "transitionTypeMap",
    ],
  },
  {
    id: "render-pipeline",
    markers: [
      "scrollProgress",
      "chromaticAbberationStrength",
      "motionBlurStrength",
      "sectionTransition",
    ],
  },
  {
    id: "section-navigation",
    markers: [
      "useNavbarClickHandler",
      "sectionTransitionState",
      "sectionLensDistortion",
    ],
  },
];

function parseArguments(argv) {
  const outputIndex = argv.indexOf("--output");
  return {
    output:
      outputIndex >= 0 && argv[outputIndex + 1]
        ? argv[outputIndex + 1]
        : DEFAULT_OUTPUT,
  };
}

async function fetchText(url) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          accept: "*/*",
          "user-agent": "shader-se-clone-source-reader/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
  }

  throw new Error(`下载失败：${url}\n${lastError}`);
}

function findChunkUrls(html) {
  const matches = html.matchAll(
    /\/_next\/static\/chunks\/[^"'\\\s<>]+?\.js(?:\?[^"'\\\s<>]*)?/g,
  );

  return [
    ...new Set(
      [...matches].map(([value]) =>
        new URL(value.replaceAll("&amp;", "&"), ORIGIN).toString(),
      ),
    ),
  ];
}

function sha256(source) {
  return createHash("sha256").update(source).digest("hex");
}

function findTarget(source, foundTargets) {
  return targets.find(
    ({ id, markers }) =>
      !foundTargets.has(id) &&
      markers.every((marker) => source.includes(marker)),
  );
}

const { output } = parseArguments(process.argv.slice(2));
const outputDirectory = path.resolve(output);
const rawDirectory = path.join(outputDirectory, "raw");
const formattedDirectory = path.join(outputDirectory, "formatted");

await Promise.all([
  mkdir(rawDirectory, { recursive: true }),
  mkdir(formattedDirectory, { recursive: true }),
]);

console.log(`读取 ${ORIGIN} 的生产 HTML…`);
const html = await fetchText(`${ORIGIN}/`);
const chunkUrls = findChunkUrls(html);

if (chunkUrls.length === 0) {
  throw new Error("没有从生产 HTML 中找到 Next.js chunks。");
}

console.log(`发现 ${chunkUrls.length} 个生产 chunks，开始定位核心时间代码…`);

const found = new Map();
for (const url of chunkUrls) {
  const source = await fetchText(url);
  const target = findTarget(source, found);

  if (!target) continue;

  const pretty = await format(source, {
    parser: "babel",
    printWidth: 80,
    semi: true,
    singleQuote: false,
  });
  const urlObject = new URL(url);
  const fileName = path.basename(urlObject.pathname);

  await Promise.all([
    writeFile(path.join(rawDirectory, `${target.id}.min.js`), source),
    writeFile(path.join(formattedDirectory, `${target.id}.pretty.js`), pretty),
  ]);

  found.set(target.id, {
    id: target.id,
    url,
    deployedFileName: fileName,
    sha256: sha256(source),
    bytes: Buffer.byteLength(source),
    markers: target.markers,
    localRaw: `raw/${target.id}.min.js`,
    localFormatted: `formatted/${target.id}.pretty.js`,
  });

  console.log(`已定位 ${target.id}：${fileName}`);
}

const missing = targets.filter(({ id }) => !found.has(id));
if (missing.length > 0) {
  throw new Error(`没有定位到：${missing.map(({ id }) => id).join("、")}`);
}

const manifest = {
  generatedAt: new Date().toISOString(),
  origin: ORIGIN,
  notice: "这些本地缓存来自上游生产 bundle，仅用于阅读和验证，不会提交到仓库。",
  prettierVersion: "3.6.2",
  sources: targets.map(({ id }) => found.get(id)),
};

await writeFile(
  path.join(outputDirectory, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`完成。格式化文件位于 ${formattedDirectory}`);
console.log(`证据清单位于 ${path.join(outputDirectory, "manifest.json")}`);
