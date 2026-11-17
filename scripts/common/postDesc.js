'use strict'

const { stripHTML, truncate } = require('hexo-util')
const cheerio = require('cheerio')

// KaTeX 会输出两份内容：隐藏的 MathML（含原始 TeX 源码）和可见的 HTML。
// 直接 stripHTML 会把两份叠起来，变成 “π0\pi_0π0”。这里先丢掉隐藏分支。
const cleanMath = html => {
  if (typeof html !== 'string' || html.indexOf('class="katex"') === -1) return html

  try {
    const $ = cheerio.load(html, { decodeEntities: false })
    $('.katex-mathml').remove()
    return $.html()
  } catch (error) {
    return html
  }
}

// Truncates the given content to a specified length, removing HTML tags and replacing newlines with spaces.
const truncateContent = (content, length) => {
  const text = stripHTML(cleanMath(content)).replace(/\u200b/g, '')
  return truncate(text, { length, separator: ' ' }).replace(/\n/g, ' ')
}

// Generates a post description based on the provided data and theme configuration.
const postDesc = (data, hexo) => {
  const { description, content, postDesc } = data

  if (postDesc) return postDesc

  const { length, method } = hexo.theme.config.index_post_content

  if (method === false) return

  let result
  switch (method) {
    case 1:
      result = description
      break
    case 2:
      result = description || truncateContent(content, length)
      break
    default:
      result = truncateContent(content, length)
  }

  data.postDesc = result
  return result
}

module.exports = { truncateContent, postDesc }
