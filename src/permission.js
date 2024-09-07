import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

NProgress.configure({ showSpinner: false });

const whiteList = ['/login', '/register'];

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        // 現在のユーザがuser_info情報を引き出したかどうかを判断する
        useUserStore().getInfo().then(() => {
          isRelogin.show = false
          usePermissionStore().generateRoutes().then(accessRoutes => {
            // roles権限に基づいたアクセスのルーティング機能の生成
            accessRoutes.forEach(route => {
              if (!isHttp(route.path)) {
                router.addRoute(route) // 動的追加可アクスル・オペレーション・ブル
              }
            })
            next({ ...to, replace: true }) // hackメソッドはaddRoutesが完了していることを確認します
          })
        }).catch(err => {
          useUserStore().logOut().then(() => {
            ElMessage.error(err)
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else {
    // トーケンなし
    if (whiteList.indexOf(to.path) !== -1) {
      // フリーランディングホワイトリストで、直接アクセス
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`) // そうでない場合は、すべてログインページにリダイレクトします
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
