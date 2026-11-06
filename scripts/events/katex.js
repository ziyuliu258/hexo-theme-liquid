'use strict'

const { version } = require('katex/package.json')

// KaTeX HTML and CSS must use the same version: internal class names can change.
// Run after the theme resolves its CDN URLs (default priority 10).
hexo.extend.filter.register('before_generate', () => {
  const { asset, math } = hexo.theme.config
  if (math?.use !== 'katex' || !asset) return

  for (const key of ['katex', 'katex_copytex']) {
    if (!asset[key]) continue
    asset[key] = asset[key]
      .replace(/((?:cdn\.jsdelivr\.net\/npm|unpkg\.com)\/katex)(?:@[^/]+)?\//, `$1@${version}/`)
      .replace(/(cdnjs\.cloudflare\.com\/ajax\/libs\/KaTeX\/)[^/]+\//, `$1${version}/`)
  }
}, 20)
