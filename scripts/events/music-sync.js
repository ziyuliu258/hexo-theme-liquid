'use strict'

const path = require('path')
const { spawnSync } = require('child_process')
const { musicConfig } = require('../common/config')

// Optional NetEase playlist refresh. The theme only reads the generated JSON;
// this hook exists for sites that keep a playlist source in their repository.
hexo.extend.filter.register('before_generate', () => {
  const config = musicConfig(hexo.theme.config)
  if (!config.enable || !config.sync.enable) return

  const command = hexo.extend.console.alias[hexo.env.cmd] || hexo.env.cmd
  if (command !== 'generate') return

  const script = path.resolve(hexo.base_dir, config.sync.script)
  const args = [script]
  if (config.sync.playlistId) args.push('--playlist-id', config.sync.playlistId)

  hexo.log.info('正在更新音乐歌单…')
  const result = spawnSync('python3', args, {
    cwd: hexo.base_dir,
    encoding: 'utf-8',
    timeout: 240000
  })
  const output = `${result.stdout || ''}${result.stderr || ''}`.trim()
  if (result.error || result.status !== 0) {
    if (output) hexo.log.warn(output)
    else if (result.error) hexo.log.warn(result.error.message)
    hexo.log.warn('歌单更新失败，继续使用已有的歌单文件生成。')
    return
  }
  if (output) hexo.log.info(output)
})
