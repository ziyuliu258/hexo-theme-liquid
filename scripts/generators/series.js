'use strict'

const { slugize } = require('hexo-util')
const { seriesConfig } = require('../common/config')

function collectSeries (posts) {
  const groups = new Map()

  posts.sort('date', 1).forEach(post => {
    if (typeof post.series !== 'string' || !post.series.trim()) return
    const name = post.series.trim()
    if (!groups.has(name)) {
      groups.set(name, { name, slug: slugize(name), posts: [] })
    }
    groups.get(name).posts.push(post)
  })

  return [...groups.values()].sort((a, b) =>
    b.posts[b.posts.length - 1].date.valueOf() - a.posts[a.posts.length - 1].date.valueOf() ||
    a.name.localeCompare(b.name, 'zh-CN')
  )
}

hexo.extend.helper.register('series_catalog', function () {
  const config = seriesConfig(this.theme)
  if (!config.enable) return []
  return collectSeries(this.site.posts).map(item => ({
    ...item,
    path: `${config.itemPath}${item.slug}/`
  }))
})

hexo.extend.generator.register('liquid-series', function (locals) {
  const config = seriesConfig(this.theme)
  if (!config.enable) return []

  const series = collectSeries(locals.posts)
  const pages = series.map(item => ({
    path: `${config.itemPath}${item.slug}/index.html`,
    layout: 'series',
    data: {
      title: item.name,
      type: 'series',
      series_name: item.name,
      posts: item.posts,
      post_count: item.posts.length
    }
  }))

  pages.push({
    path: `${config.path}index.html`,
    layout: 'series',
    data: {
      title: config.title || null,
      type: 'series',
      series_catalog: series.map(item => ({
        ...item,
        path: `${config.itemPath}${item.slug}/`
      }))
    }
  })

  return pages
})
