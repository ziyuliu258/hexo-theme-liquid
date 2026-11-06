'use strict'

const { collectMathTitles, renderMathTitles } = require('../common/title-math')

let mathTitles = new Map()

// Read the model directly: site locals may still cache an empty post list during
// the first generation after `hexo clean` and are invalidated by generators later.
hexo.extend.filter.register('before_generate', () => {
  mathTitles = collectMathTitles(hexo.model('Post').toArray())
}, 30)

hexo.extend.filter.register('after_render:html', data =>
  renderMathTitles(data, mathTitles, hexo.theme.config.asset && hexo.theme.config.asset.katex), 20)
