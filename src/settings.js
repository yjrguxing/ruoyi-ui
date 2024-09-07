export default {
  /**
   * Webページタイトル
   */
  title: import.meta.env.VITE_APP_TITLE,
  /**
   * サイドバーテーマダークテーマtheme-dark、ライトテーマtheme-light
   */
  sideTheme: 'theme-dark',
  /**
   * システムレイアウト構成の有無
   */
  showSettings: true,

  /**
   * トップ・ナビゲーションを表示するかどうか
   */
  topNav: false,

  /**
   * tagsViewを表示するかどうか
   */
  tagsView: true,

  /**
   * 頭部を固定するか
   */
  fixedHeader: false,

  /**
   * ロゴを表示するかどうか
   */
  sidebarLogo: true,

  /**
   * 動的バイトルを表示するかどうか
   */
  dynamicTitle: false,

  /**
   * @type {string | array} 'production' | ['production', 'development']
   * @description Need show err logs component.
   * The default is only used in the production env
   * If you want to also use it in dev, you can pass ['production', 'development']
   */
  errorLog: 'production'
}
