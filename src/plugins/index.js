import tab from './tab'
import auth from './auth'
import cache from './cache'
import modal from './modal'
import download from './download'

export default function installPlugins(app){
  // ページチェック操作
  app.config.globalProperties.$tab = tab
  // 認証オブジェクト
  app.config.globalProperties.$auth = auth
  // キャッシュオブジェクト
  app.config.globalProperties.$cache = cache
  // モードボックスオブジェクト
  app.config.globalProperties.$modal = modal
  // ダウンロードファイル
  app.config.globalProperties.$download = download
}
