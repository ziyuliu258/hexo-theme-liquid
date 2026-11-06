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
