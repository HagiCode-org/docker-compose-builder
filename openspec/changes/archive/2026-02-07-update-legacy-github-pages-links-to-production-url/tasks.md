# 实施任务清单

## 阶段 1：搜索和识别

### 1.1 搜索所有 GitHub Pages 链接

```bash
# 搜索所有包含 github.io 的文件（排除 node_modules 和归档目录）
grep -r "github\.io" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=archive --exclude-dir=dist --exclude-dir=build .
```

**预期输出**：列出所有包含需要更新的链接的文件

**验证**：
- [ ] 确认搜索结果包含以下关键文件：
  - `index.html`
  - `src/config/seo.ts`
  - `src/config/navigationLinks.ts`
  - `public/robots.txt`
  - `public/sitemap.xml`

---

## 阶段 2：更新核心配置文件

### 2.1 更新 `src/config/seo.ts`

**文件**：`src/config/seo.ts`

**变更**：
```typescript
// 将
siteUrl: 'https://hagicode-org.github.io/docker-compose-builder/'
// 替换为
siteUrl: 'https://builder.hagicode.com'
```

**验证**：
- [ ] 文件中只有一处需要修改
- [ ] 新 URL 格式正确（无尾部斜杠）

### 2.2 更新 `src/config/navigationLinks.ts`

**文件**：`src/config/navigationLinks.ts`

**变更**：
```typescript
// 将
url: 'https://hagicode-org.github.io/site/'
// 替换为
url: 'https://hagicode.com'
```

**验证**：
- [ ] `officialSite.url` 已更新
- [ ] GitHub 仓库链接保持不变（如果正确）

### 2.3 更新 `index.html`

**文件**：`index.html`

**变更**：更新所有 SEO 相关的 meta 标签中的 URL

| 元素 | 当前值 | 新值 |
|------|--------|------|
| `link rel="canonical"` | `https://hagicode-org.github.io/docker-compose-builder/` | `https://builder.hagicode.com` |
| `meta property="og:url"` | `https://hagicode-org.github.io/docker-compose-builder/` | `https://builder.hagicode.com` |
| `meta property="og:image"` | `https://hagicode-org.github.io/docker-compose-builder/og-image.png` | `https://builder.hagicode.com/og-image.png` |
| `link rel="alternate" hreflang="en"` | `https://hagicode-org.github.io/docker-compose-builder/` | `https://builder.hagicode.com` |
| `link rel="alternate" hreflang="zh-CN"` | `https://hagicode-org.github.io/docker-compose-builder/?lang=zh-CN` | `https://builder.hagicode.com?lang=zh-CN` |

**验证**：
- [ ] 所有 `<link>` 标签中的 URL 已更新
- [ ] 所有 `<meta>` 标签中的 URL 已更新
- [ ] Open Graph 图片 URL 已更新

### 2.4 更新 `public/robots.txt`

**文件**：`public/robots.txt`

**变更**：
```text
# 将
Sitemap: https://hagicode-org.github.io/docker-compose-builder/sitemap.xml
# 替换为
Sitemap: https://builder.hagicode.com/sitemap.xml
```

**验证**：
- [ ] Sitemap URL 已更新

### 2.5 更新 `public/sitemap.xml`

**文件**：`public/sitemap.xml`

**变更**：
```xml
<!-- 将 -->
<url><loc>https://hagicode-org.github.io/docker-compose-builder/</loc></url>
<!-- 替换为 -->
<url><loc>https://builder.hagicode.com/</loc></url>
```

**验证**：
- [ ] 所有 `<loc>` 标签中的 URL 已更新

---

## 阶段 3：验证和测试

### 3.1 构建验证

```bash
npm run build
```

**验证**：
- [ ] 构建成功完成
- [ ] 无配置错误
- [ ] 无 TypeScript 错误

### 3.2 链接完整性检查

```bash
# 搜索确认没有遗留的 github.io 链接（排除归档目录）
grep -r "hagicode-org\.github\.io" --exclude-dir=archive --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build .
```

**验证**：
- [ ] 搜索结果为空（或仅显示归档文件中的引用）
- [ ] 归档文件 `openspec/changes/archive/` 中的历史引用保持不变

### 3.3 配置文件检查

**检查项**：
- [ ] `src/config/seo.ts` 中 `siteUrl` 为 `https://builder.hagicode.com`
- [ ] `src/config/navigationLinks.ts` 中官网链接为 `https://hagicode.com`
- [ ] `index.html` 中所有 meta 标签使用新 URL
- [ ] `public/robots.txt` 中 sitemap URL 正确
- [ ] `public/sitemap.xml` 中所有 URL 正确

---

## 完成检查表

### 文件更新
- [ ] `src/config/seo.ts`
- [ ] `src/config/navigationLinks.ts`
- [ ] `index.html`
- [ ] `public/robots.txt`
- [ ] `public/sitemap.xml`

### 验证通过
- [ ] 构建成功
- [ ] 无遗留的 github.io 链接（排除归档）
- [ ] 所有新 URL 格式正确
- [ ] 归档文件保持不变

### 文档更新（可选）
- [ ] 如果 `README.md` 包含部署说明，考虑更新为新的生产 URL
