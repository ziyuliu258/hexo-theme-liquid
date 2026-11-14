/**
 * Liquid
 * Table of contents with KaTeX
 *
 * Hexo 自带的 toc() 只取标题的纯文本，标题里的公式会被压成
 * “βt\beta_tβt”这样“字形 + 源码 + 字形”的重复串。
 * 这里在原生目录的基础上，用标题的富文本（保留 KaTeX 节点）替换目录项文字，
 * 让目录也能显示排好版的公式；匹配不到时回退到原生纯文本。
 */

'use strict'

const cheerio = require('cheerio')
const tocHelper = require('hexo/dist/plugins/helper/toc')

const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6'

function decodeHash(href) {
  const id = String(href).replace(/^#/, '')
  try {
    return decodeURIComponent(id)
  } catch (err) {
    return id
  }
}

hexo.extend.helper.register('toc', function (str, options = {}) {
  const html = tocHelper.call(this, str, options)
  if (!html || typeof str !== 'string' || str.indexOf('class="katex"') === -1) return html

  try {
    const $content = cheerio.load(str, { decodeEntities: false })
    const $toc = cheerio.load(html, { decodeEntities: false })
    const headings = $content(HEADING_SELECTOR).toArray()

    $toc('a.toc-link').each((_, link) => {
      const $link = $toc(link)
      const href = $link.attr('href')
      if (!href) return

      const id = decodeHash(href)
      const heading = headings.find(el => $content(el).attr('id') === id)
      if (!heading) return

      const $rich = $content(heading).clone()
      // 目录项本身是 <a>，标题里不能再嵌链接；图片和脚本同样不适合放进目录
      $rich.find('a, img, script, style, .headerlink').remove()
      const rich = $rich.html()
      if (!rich || rich.indexOf('class="katex"') === -1) return

      $link.find('.toc-text').html(rich)
    })

    return $toc.html()
  } catch (err) {
    hexo.log.warn('toc(): failed to render math in TOC, falling back to plain text. %s', err)
    return html
  }
})
