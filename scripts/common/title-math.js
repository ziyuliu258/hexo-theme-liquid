'use strict'

const cheerio = require('cheerio')
const katex = require('katex')
const { escapeHTML } = require('hexo-util')

function collectMathTitles(posts) {
  const titles = new Map()
  for (const post of posts) {
    const title = String(post.title || '')
    const formulas = [...title.matchAll(/\$([^$\n]+)\$/g)]
    if (!formulas.length) continue

    let html = ''
    let text = ''
    let cursor = 0
    for (const formula of formulas) {
      const prefix = title.slice(cursor, formula.index)
      const rendered = katex.renderToString(formula[1], { throwOnError: true })
      const $ = cheerio.load(rendered, { decodeEntities: true })
      $('annotation').remove()
      html += escapeHTML(prefix) + rendered.replace('class="katex"', 'class="katex katex-show"')
      text += prefix + $('math').text()
      cursor = formula.index + formula[0].length
    }
    html += escapeHTML(title.slice(cursor))
    text += title.slice(cursor)
    titles.set(title, { html, text })
  }
  return titles
}

function renderMathTitles(data, titles, stylesheet) {
  if (![...titles.keys()].some(title => data.includes(escapeHTML(title)))) return data

  const $ = cheerio.load(data, { decodeEntities: false })
  let renderedMath = false
  let changed = false
  $('body *').each((_, element) => {
    if ($(element).closest('script, style, textarea, code, pre').length) return
    $(element).contents().each((__, node) => {
      if (node.type !== 'text') return
      const title = titles.get(node.data.trim())
      if (!title) return
      $(node).replaceWith(title.html)
      renderedMath = changed = true
    })
  })

  // Browser tabs, tooltips and social metadata cannot contain rendered HTML.
  $('title').each((_, element) => {
    let text = $(element).text()
    for (const [source, title] of titles) text = text.replace(source, title.text)
    if (text !== $(element).text()) {
      $(element).text(text)
      changed = true
    }
  })
  $('[title], [alt], [aria-label], meta[property="og:title"], meta[name="twitter:title"]').each((_, element) => {
    for (const attribute of ['title', 'alt', 'aria-label', 'content']) {
      const title = titles.get($(element).attr(attribute))
      if (!title) continue
      $(element).attr(attribute, title.text)
      changed = true
    }
  })
  if (!changed) return data

  if (renderedMath && stylesheet && !$('link').toArray().some(node => $(node).attr('href') === stylesheet)) {
    $('head').append($('<link rel="stylesheet">').attr('href', stylesheet))
  }
  return $.html()
}

module.exports = { collectMathTitles, renderMathTitles }
