'use strict'

const {
  assetVersion,
  seriesConfig,
  statisticsConfig,
  musicConfig,
  commentsConfig,
  announcementConfig,
  liquidConfig
} = require('../common/config')

hexo.extend.helper.register('liquid_config', function () {
  return liquidConfig(this.theme)
})

// The main stylesheet also depends on imported Stylus files and theme settings.
let stylesheetVersion
hexo.extend.filter.register('before_generate', () => {
  const fs = require('node:fs')
  const path = require('node:path')
  const hash = require('node:crypto').createHash('sha256')
  const dir = path.join(hexo.theme_dir, 'source/css')
  const files = fs.readdirSync(dir, { recursive: true }).filter(file => /\.(styl|css)$/.test(file)).sort()
  for (const file of files) hash.update(file).update(fs.readFileSync(path.join(dir, file)))
  hash.update(JSON.stringify(hexo.theme.config))
  stylesheetVersion = hash.digest('hex').slice(0, 12)
})
hexo.extend.helper.register('liquid_stylesheet_version', () => stylesheetVersion)

hexo.extend.helper.register('liquid_asset_version', function (relativePath) {
  return assetVersion(hexo, relativePath)
})

hexo.extend.helper.register('liquid_series', function () {
  return seriesConfig(this.theme)
})

hexo.extend.helper.register('liquid_stats', function () {
  return statisticsConfig(this.theme)
})

hexo.extend.helper.register('liquid_music', function () {
  return musicConfig(this.theme)
})

hexo.extend.helper.register('liquid_comments', function () {
  return commentsConfig(this.theme)
})

hexo.extend.helper.register('liquid_announcement', function () {
  return announcementConfig(this.theme)
})
