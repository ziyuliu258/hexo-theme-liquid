'use strict'

const fs = require('node:fs')
const path = require('node:path')

// Keep the local stylesheet and font files aligned with the KaTeX renderer.
hexo.extend.generator.register('local-katex', () => {
  const { asset, CDN } = hexo.theme.config
  const stylesheet = 'vendor/katex/katex.min.css'
  if (asset.katex !== stylesheet && CDN.fallback?.katex !== stylesheet) return []

  const pkg = path.dirname(require.resolve('katex/package.json'))
  const dist = path.join(pkg, 'dist')
  const assets = ['katex.min.css', 'contrib/copy-tex.min.js',
    ...fs.readdirSync(path.join(dist, 'fonts')).map(name => 'fonts/' + name)]
  return [...assets, 'LICENSE'].map(name => ({
    path: 'vendor/katex/' + name,
    data: () => fs.createReadStream(path.join(name === 'LICENSE' ? pkg : dist, name))
  }))
})
