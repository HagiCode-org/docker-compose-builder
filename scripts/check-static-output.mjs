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
  assert.ok(html.includes('src="https://sdk.51.la/js-sdk-pro.min.js"'), "Expected the shared 51LA script");
  assert.ok(html.includes(`siteId = "${process.env.VITE_51LA_ID || "L6b88a5yK4h2Xnci"}"`), "Expected the 51LA site id");
  assert.ok(html.includes("https://www.googletagmanager.com/gtag/js?id=G-EN03FMT2Q4"), "Expected the shared Google Analytics script");
  assert.ok(!html.includes("data-51la-id"), "The inline 51LA bootstrap should be replaced by the shared component");
  assert.ok(stylesheets.includes(".builder-workspace{visibility:hidden}"));
  assert.ok(island, "Expected the server-rendered React workspace island");
  assert.ok(island.includes('client="load"'), "Expected a client:load island");

  const faviconHref = readAttribute(html.match(/<link rel="icon"[^>]*>/)?.[0] ?? "", "href");
  assert.equal(faviconHref, `${base}favicon.ico`);
  assert.ok(existsSync(path.join(distDir, "favicon.ico")));

  const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  assert.equal(ogImage, `${siteUrl}${base}og-image.png`);
  assert.ok(existsSync(path.join(distDir, "og-image.png")));

  const robots = readFileSync(path.join(distDir, "robots.txt"), "utf8");
  assert.ok(
    robots.includes(`Sitemap: ${siteUrl}${base}sitemap-index.xml`),
    "robots.txt should advertise the base-aware hagilight sitemap index",
  );
  const sitemapIndex = readFileSync(path.join(distDir, "sitemap-index.xml"), "utf8");
  assert.ok(sitemapIndex.includes(`${siteUrl}${base}sitemap-0.xml`));
  assert.ok(readFileSync(path.join(distDir, "sitemap-0.xml"), "utf8").includes(`<loc>${siteUrl}${base}</loc>`));
  assert.ok(html.includes(`href="${base}sitemap-index.xml"`), "Footer should link to the generated sitemap index");
  assert.ok(html.includes("beian.miit.gov.cn"), "Footer should render the shared filing links");
  assert.ok(html.includes("Powered By hagilight@"), "Footer should be the hagilight default footer");
  assert.ok(html.includes(`href="${siteUrl}${base}rss.xml"`), "Footer should link the generated RSS feed");
  assert.ok(html.includes("<hagilight-promoto-banner"), "Expected the hagilight PromotoBanner");
  const liveHtml = html.replace(/<template[\s\S]*?<\/template>/g, "");
  assert.equal(
    (liveHtml.match(/<footer\b/g) ?? []).length,
    1,
    "PromotoBanner tracks document.querySelector('footer'), so only one footer may be live",
  );
  for (const locale of ["en-US", "ja-JP", "ru-RU", "zh-Hant"]) {
    assert.ok(html.includes(`<template data-footer-locale="${locale}">`), `Expected a ${locale} footer template`);
  }

  for (const feed of ["rss.xml", "rss.en.xml", "rss.zh-CN.xml", "rss.ja-JP.xml"]) {
    const xml = readFileSync(path.join(distDir, feed), "utf8");
    assert.ok(xml.includes("<channel>"), `${feed} should be an RSS channel`);
    assert.ok((xml.match(/<item>/g) ?? []).length >= 1, `${feed} should not be empty`);
    assert.ok(xml.includes(`<link>${siteUrl}${base}</link>`), `${feed} should link to the base-aware site root`);
  }
  assert.ok(readFileSync(path.join(distDir, "rss.xml"), "utf8").includes("<language>en-US</language>"));
  assert.ok(readFileSync(path.join(distDir, "rss.zh-CN.xml"), "utf8").includes("<language>zh-CN</language>"));
  assert.ok(
    html.includes(`<link rel="alternate" type="application/rss+xml"`) && html.includes(`href="${base}rss.xml"`),
    "Head should advertise the RSS feed",
  );

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
