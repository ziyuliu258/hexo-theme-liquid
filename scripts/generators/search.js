'use strict'

const crypto = require('node:crypto')
const cheerio = require('cheerio')
const { collectMathTitles } = require('../common/title-math')

const DEFAULT_SEARCH_PATH = 'search.json'

function resolveSearchPath (themeConfig, siteConfig) {
  const localConfig = (themeConfig && themeConfig.search && themeConfig.search.local_search) || {}
  const raw = localConfig.path || (siteConfig && siteConfig.search && siteConfig.search.path) || DEFAULT_SEARCH_PATH
  return String(raw).trim().replace(/^\/+/, '') || DEFAULT_SEARCH_PATH
}

function extractPlainText (html) {
  if (!html) return ''
  const $ = cheerio.load(`<div id="__root">${html}</div>`, { decodeEntities: true })
  $('script, style, noscript, svg, iframe, td.gutter, .katex-html, .katex-mathml annotation, .highlight-tools, .code-expand-btn').remove()
  const cleanedHtml = $('#__root').html() || ''
  // Insert spaces around block-level boundaries so headings/paragraphs never glue together.
  const spaced = cleanedHtml.replace(/<\/?(?:p|div|li|ul|ol|h[1-6]|tr|td|th|blockquote|pre|br|hr|section|article|header|footer|figcaption|dt|dd)\b[^>]*>/gi, ' ')
  return cheerio.load(`<div id="__txt">${spaced}</div>`, { decodeEntities: true })('#__txt').text().replace(/\s+/g, ' ').trim()
}

function listNames (collection) {
  if (!collection) return []
  const items = typeof collection.toArray === 'function' ? collection.toArray() : Array.isArray(collection) ? collection : []
  return items
    .map(item => (item && typeof item.name === 'string' ? item.name.trim() : ''))
    .filter(Boolean)
}

function formatDate (value) {
  if (!value) return ''
  if (typeof value.format === 'function') return value.format('YYYY-MM-DD')
  const parsed = new Date(value)
  if (Number.isNaN(parsed.valueOf())) return ''
  return parsed.toISOString().slice(0, 10)
}

let searchVersion = ''

hexo.extend.filter.register('before_generate', () => {
  const hash = crypto.createHash('sha256')
  const posts = hexo.model('Post').toArray()
    .filter(post => post.published !== false && post.search !== false)
    .sort((a, b) => String(a.path || '').localeCompare(String(b.path || '')))

  for (const post of posts) {
    hash.update(String(post.path || ''))
    hash.update('\0')
    hash.update(String(post.title || ''))
    hash.update('\0')
    hash.update(String(post.updated ? post.updated.valueOf() : post.date ? post.date.valueOf() : ''))
    hash.update('\0')
    hash.update(String(post.series || ''))
    hash.update('\0')
    hash.update(post.password ? String(post.abstract || '') : String(post.raw || ''))
    hash.update('\n')
  }

  searchVersion = hash.digest('hex').slice(0, 12)
}, 20)

hexo.extend.helper.register('liquid_search_version', () => searchVersion)

hexo.extend.helper.register('liquid_search_path', function () {
  return resolveSearchPath(this.theme, this.config)
})

hexo.extend.generator.register('liquid-search', function (locals) {
  const themeConfig = hexo.theme.config || {}
  const searchConfig = themeConfig.search || {}
  if (searchConfig.use !== 'local_search') return []
  if (searchConfig.local_search && searchConfig.local_search.CDN) return []

  const outputPath = resolveSearchPath(themeConfig, hexo.config)
  const posts = locals.posts.sort('-date').toArray()
  const mathTitles = collectMathTitles(posts)

  const entries = []
  for (const post of posts) {
    if (post.search === false) continue

    const rawTitle = String(post.title || '').trim()
    if (!rawTitle) continue

    const mathTitle = mathTitles.get(rawTitle)
    const displayTitle = mathTitle ? mathTitle.text : rawTitle
    const categories = listNames(post.categories)
    const tags = listNames(post.tags)
    const series = typeof post.series === 'string' ? post.series.trim() : ''
    const isEncrypted = Boolean(post.password)
    const plainContent = isEncrypted
      ? extractPlainText(post.abstract || '')
      : extractPlainText(post.content || post.excerpt || '')

    const entry = {
      t: displayTitle,
      u: String(post.path || '').replace(/^\/+/, ''),
      d: formatDate(post.date)
    }
    if (mathTitle && rawTitle !== displayTitle) entry.m = rawTitle
    if (categories.length) entry.c = categories
    if (tags.length) entry.g = tags
    if (series) entry.s = series
    if (plainContent) entry.x = plainContent

    entries.push(entry)
  }

  return {
    path: outputPath,
    data: JSON.stringify(entries)
  }
})
