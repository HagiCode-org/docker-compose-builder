import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const distDir = path.join(projectRoot, "dist");
const astroCli = path.join(projectRoot, "node_modules/astro/bin/astro.mjs");
const siteUrl = "https://builder.hagicode.com";

function normalizeBase(value) {
  const segments = value.split("/").filter(Boolean);
  return segments.length ? `/${segments.join("/")}/` : "/";
}

function readAttribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1] ?? null;
}

function checkOutput(base) {
  const html = readFileSync(path.join(distDir, "index.html"), "utf8");
  const island = html.match(/<astro-island\b[^>]*>/)?.[0];
  const noScriptContent = [...html.matchAll(/<noscript>(.*?)<\/noscript>/g)]
    .map((match) => match[1])
    .join(" ");
  const stylesheets = [...html.matchAll(/href="([^"]+\.css)"/g)]
    .map((match) => match[1])
    .map((href) => readFileSync(path.join(distDir, href.slice(base.length)), "utf8"))
    .join("\n");

  assert.match(html, /<title>Hagicode Docker Compose Builder<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]+">/);
  assert.ok(html.includes(`<link rel="canonical" href="${siteUrl}">`));
  assert.ok(!html.includes("使用可视化表单配置服务、网络和持久化选项"));
  assert.ok(!html.includes(">Hagicode</p>"));
  assert.ok(noScriptContent.includes("Docker Compose 配置编辑器需要启用 JavaScript"));
  assert.ok(html.includes(`data-51la-id="${process.env.VITE_51LA_ID || "L6b88a5yK4h2Xnci"}"`));
  assert.ok(stylesheets.includes(".builder-workspace{visibility:hidden}"));
  assert.ok(island, "Expected the server-rendered React workspace island");
  assert.ok(island.includes('client="load"'), "Expected a client:load island");

  const faviconHref = readAttribute(html.match(/<link rel="icon"[^>]*>/)?.[0] ?? "", "href");
  assert.equal(faviconHref, `${base}favicon.ico`);
  assert.ok(existsSync(path.join(distDir, "favicon.ico")));

  const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  assert.equal(ogImage, `${siteUrl}${base}og-image.png`);
  assert.ok(existsSync(path.join(distDir, "og-image.png")));

  for (const attribute of ["component-url", "renderer-url"]) {
    const assetUrl = readAttribute(island, attribute);
    assert.ok(assetUrl?.startsWith(`${base}_astro/`), `${attribute} should use the configured base path`);
    assert.ok(existsSync(path.join(distDir, assetUrl.slice(base.length))));
  }

  for (const [, assetUrl] of html.matchAll(/(?:href|src)="([^"]*\/_astro\/[^"]+)"/g)) {
    assert.ok(assetUrl.startsWith(`${base}_astro/`), `Asset reference ${assetUrl} should use ${base}`);
    assert.ok(existsSync(path.join(distDir, assetUrl.slice(base.length))));
  }
}

function buildForBase(base) {
  const result = spawnSync(process.execPath, [astroCli, "build"], {
    cwd: projectRoot,
    env: { ...process.env, VITE_BASE_PATH: base },
    encoding: "utf8",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Astro build failed for base ${base}:\n${result.stdout}\n${result.stderr}`);
  }
}

if (process.argv.includes("--all-bases")) {
  for (const base of ["/", "/builder-preview/"]) {
    buildForBase(base);
    checkOutput(base);
  }
} else {
  checkOutput(normalizeBase(process.env.VITE_BASE_PATH || "/"));
}
