'use strict'

const DEFAULT_SERIES_PATH = 'series/'
const DEFAULT_MUSIC_PAGE = 'music/'
const DEFAULT_MUSIC_PLAYLIST = 'music/playlist.json'

function normalizePath (value, fallback) {
  let path = String(value || fallback || '').trim()
  path = path.replace(/^\/+/, '')
  if (path && !path.endsWith('/')) path += '/'
  return path
}

function normalizeAssetPath (value, fallback) {
  return String(value || fallback || '').trim().replace(/^\/+/, '')
}

function liquidConfig (theme) {
  return (theme && theme.liquid) || {}
}

function seriesConfig (theme) {
  const config = liquidConfig(theme).series || {}
  const path = normalizePath(config.path, DEFAULT_SERIES_PATH)
  return {
    enable: config.enable !== false,
    path,
    itemPath: normalizePath(config.item_path, path),
    title: config.title || '',
    moreText: config.more_text || '',
    limit: Number(config.limit) > 0 ? Number(config.limit) : 0
  }
}

function statisticsConfig (theme) {
  const liquid = liquidConfig(theme).statistics || {}
  const legacy = (theme && theme.busuanzi) || {}
  const has = value => value !== undefined && value !== null
  const enabled = has(liquid.enable)
    ? liquid.enable !== false
    : Boolean(legacy.site_uv || legacy.site_pv || legacy.page_pv)

  return {
    enable: enabled,
    provider: liquid.provider || 'busuanzi',
    api: liquid.api || legacy.api || '',
    siteUv: has(liquid.site_uv) ? liquid.site_uv !== false : legacy.site_uv !== false,
    sitePv: has(liquid.site_pv) ? liquid.site_pv !== false : legacy.site_pv !== false,
    pagePv: has(liquid.page_pv) ? liquid.page_pv !== false : legacy.page_pv !== false,
    note: liquid.note || ''
  }
}

function musicConfig (theme) {
  const config = liquidConfig(theme).music || {}
  const sync = config.sync || {}
  return {
    enable: config.enable !== false,
    pagePath: normalizePath(config.page_path, DEFAULT_MUSIC_PAGE),
    playlistPath: normalizeAssetPath(config.playlist_path, DEFAULT_MUSIC_PLAYLIST),
    sync: {
      enable: sync.enable === true,
      script: sync.script || 'tools/sync-music-playlist.py',
      playlistId: sync.playlist_id ? String(sync.playlist_id) : ''
    }
  }
}

function commentsConfig (theme) {
  return liquidConfig(theme).comments || {}
}

function announcementConfig (theme) {
  const config = liquidConfig(theme).announcement || {}
  return {
    enable: config.enable === true && Boolean(config.content),
    title: config.title || '',
    content: config.content || ''
  }
}

function assetVersion (hexo, relativePath) {
  const fs = require('fs')
  const path = require('path')
  const crypto = require('crypto')
  const candidates = [
    path.join(hexo.source_dir, relativePath),
    path.join(hexo.theme_dir, 'source', relativePath)
  ]
  const file = candidates.find(candidate => fs.existsSync(candidate))
  if (!file) return ''
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 12)
}

module.exports = {
  liquidConfig,
  seriesConfig,
  statisticsConfig,
  musicConfig,
  commentsConfig,
  announcementConfig,
  assetVersion,
  normalizePath,
  normalizeAssetPath
}
