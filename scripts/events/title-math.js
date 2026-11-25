'use strict'

const { url_for: urlFor } = require('hexo-util')
const { collectMathTitles, renderMathTitles } = require('../common/title-math')

let mathTitles = new Map()

// Read the model directly: site locals may still cache an empty post list during
// the first generation after `hexo clean` and are invalidated by generators later.
hexo.extend.filter.register('before_generate', () => {
  mathTitles = collectMathTitles(hexo.model('Post').toArray())
}, 30)

hexo.extend.filter.register('after_render:html', data => {
  const stylesheet = hexo.theme.config.asset?.katex
  const fallback = hexo.theme.config.CDN?.fallback?.katex
  return renderMathTitles(data, mathTitles, stylesheet && urlFor.call(hexo, stylesheet), fallback && urlFor.call(hexo, fallback))
}, 20)
