hexo.on('ready', () => {
  const { version } = require('../../package.json')
  hexo.log.info(`
  ===================================================================
      hexo-theme-liquid ${version}
      https://github.com/ziyuliu258/hexo-theme-liquid
  ===================================================================`)
})
