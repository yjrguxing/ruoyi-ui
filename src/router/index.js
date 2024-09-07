import { createWebHistory, createRouter } from 'vue-router'
/* Layout */
import Layout from '@/layout'
import PatientPdf from "@/views/dementia-api/patient-diagnosis/patient-pdf.vue";

/**
 * Note: ルーティング構成項目
 *
 * hidden: true                     // trueを設定すると、このルーティングは401、loginなどの画面がサイドバーに表示されなくなり、またいくつかの編集画面/edit/1
 * alwaysShow: true                 // 1つのルーティングの下にあるチルドレン宣言のルーティングが1つより大きいと、自動的にネストされたモードになります。例えば、コンポーネント画面
 *                                  // 1つだけの場合は、そのサブルーティングをルートフィールドとしてサイドバーに表示します。ガイド画面のように
 *                                  // ルーティングの次のチルドレン宣言の個数にかかわらずルーティングを表示したい場合
 *                                  // alwaysShow:trueを設定することができます。これにより、前に定義されたルールが無視され、ルートフィールドが表示されます。
 * redirect: noRedirect             // noRedirectを設定すると、パンくずナビゲーションではクリックできない
 * name:'router-name'               // ルーティングの名前を設定するには、必ず記入しないと<keep-alive>を使用するとさまざまな問題が発生します
 * query: '{"id": 1, "name": "ry"}' // アクスルティーリングのデフォルト転送パラメータ
 * roles: ['admin', 'common']       // アクセスルーティングのロール権限
 * permissions: ['a:a:a', 'b:b:b']  // アクセスルーティングのメニュー権限
 * meta : {
    noCache: true                   // trueに設定されている場合、<keep-alive>キャッチ（デフォルトfalse）は使用されません
    title: 'title'                  // サイドバーとパンくずに表示する名前を設定する
    icon: 'svg-name'                // このルーティングのアイコンを設定し、pasrc/assets/icons/svgに対応
    breadcrumb: false               // falseに設定すると、breadcrumbパンくずには表示されません
    activeMenu: '/system/user'      // この属性を設定すると、対応するサイドバーがハイライトされます。
  }
 */

// 公共ルーティング
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register'),
    hidden: true
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import('@/views/error/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        component: () => import('@/views/index'),
        name: 'Index',
        meta: { title: 'トップページ', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/user/profile/index'),
        name: 'Profile',
        meta: { title: 'パーソナルセンター', icon: 'user' }
      }
    ]
  },
  {
    path: '/patient-managerment/patient-diagnosis/pdf/:id?', // 動的ルーティングパラメータ
    name: 'PatientPdf',
    component: PatientPdf
  }
]

// 動的ルーティング，ユザの権限に応じて動的にロード
export const dynamicRoutes = [
  {
    path: '/system/user-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:user:edit'],
    children: [
      {
        path: 'role/:userId(\\d+)',
        component: () => import('@/views/system/user/authRole'),
        name: 'AuthRole',
        meta: { title: 'ロールの割り当て', activeMenu: '/system/user' }
      }
    ]
  },
  {
    path: '/system/role-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:role:edit'],
    children: [
      {
        path: 'user/:roleId(\\d+)',
        component: () => import('@/views/system/role/authUser'),
        name: 'AuthUser',
        meta: { title: 'ユーザの割当て', activeMenu: '/system/role' }
      }
    ]
  },
  {
    path: '/system/dict-data',
    component: Layout,
    hidden: true,
    permissions: ['system:dict:list'],
    children: [
      {
        path: 'index/:dictId(\\d+)',
        component: () => import('@/views/system/dict/data'),
        name: 'Data',
        meta: { title: '辞書データ', activeMenu: '/system/dict' }
      }
    ]
  },
  {
    path: '/monitor/job-log',
    component: Layout,
    hidden: true,
    permissions: ['monitor:job:list'],
    children: [
      {
        path: 'index/:jobId(\\d+)',
        component: () => import('@/views/monitor/job/log'),
        name: 'JobLog',
        meta: { title: 'スケジュールログ', activeMenu: '/monitor/job' }
      }
    ]
  },
  {
    path: '/tool/gen-edit',
    component: Layout,
    hidden: true,
    permissions: ['tool:gen:edit'],
    children: [
      {
        path: 'index/:tableId(\\d+)',
        component: () => import('@/views/tool/gen/editTable'),
        name: 'GenEdit',
        meta: { title: '修正生成構成', activeMenu: '/tool/gen' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory('/jp/'),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
});

export default router;
