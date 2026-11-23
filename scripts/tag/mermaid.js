/**
 * Liquid
 * mermaid
 * https://github.com/mermaid-js/mermaid
 */

'use strict'

const { escapeHTML } = require('hexo-util')

const mermaid = (args, content) => {
  return `<div class="mermaid-wrap"><pre class="mermaid-src">${escapeHTML(content.trim())}</pre></div>`
}

hexo.extend.tag.register('mermaid', mermaid, { ends: true })
