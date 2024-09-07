import { createApp } from 'vue'

import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import locale from 'element-plus/es/locale/lang/ja'

import '@/assets/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive

// 登録命令
import plugins from './plugins' // plugins
import i18n from './lang'
import { download } from '@/utils/request'

// svgアイコン
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon'
import elementIcons from '@/components/SvgIcon/svgicon'

import './permission' // permission control

import { useDict } from '@/utils/dict'
import { parseTime, resetForm, addDateRange, handleTree, selectDictLabel, selectDictLabels } from '@/utils/ruoyi'

// 改ページコンポーネント
import Pagination from '@/components/Pagination'
// カスタムテーブルツールコンポーネント
import RightToolbar from '@/components/RightToolbar'
// コンポーネント
import Editor from "@/components/Editor"
// ファイルアップロードコンポーネント
import FileUpload from "@/components/FileUpload"
// 画像アップロードコンポーネント
import ImageUpload from "@/components/ImageUpload"
// 画像プレビューコンポーネント
import ImagePreview from "@/components/ImagePreview"
// カスタムコンポーネント
import TreeSelect from '@/components/TreeSelect'
// 辞書ラベルコンポーネント
import DictTag from '@/components/DictTag'
import VueCropper from "@/components/VueCropper";

import message from "@/message/index.js"

const app = createApp(App)

// グローバルメソッドのマウント
app.config.globalProperties.useDict = useDict
app.config.globalProperties.download = download
app.config.globalProperties.parseTime = parseTime
app.config.globalProperties.resetForm = resetForm
app.config.globalProperties.handleTree = handleTree
app.config.globalProperties.addDateRange = addDateRange
app.config.globalProperties.selectDictLabel = selectDictLabel
app.config.globalProperties.selectDictLabels = selectDictLabels

app.config.globalProperties.message = message

// グローバルコンポーネントマウント
app.component('DictTag', DictTag)
app.component('Pagination', Pagination)
app.component('TreeSelect', TreeSelect)
app.component('FileUpload', FileUpload)
app.component('ImageUpload', ImageUpload)
app.component('ImagePreview', ImagePreview)
app.component('RightToolbar', RightToolbar)
app.component('Editor', Editor)
app.component('VueCropper', VueCropper)

app.use(router)
app.use(store)
app.use(i18n)
app.use(plugins)
app.use(elementIcons)
app.component('svg-icon', SvgIcon)

directive(app)

// element-plusを使用してグローバル・サイズを設定する
app.use(ElementPlus, {
  locale: locale,
  // large、default、smallをサポート
  size: Cookies.get('size') || 'default'
})

app.mount('#app')
