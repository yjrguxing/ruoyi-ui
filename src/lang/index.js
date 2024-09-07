import {createI18n} from 'vue-i18n'
import Cookies from 'js-cookie'
import elementEnLocale from "element-plus/es/locale/lang/en";
import elementZhLocale from "element-plus/es/locale/lang/zh-cn";
import elementJaLocale from "element-plus/es/locale/lang/ja";
import enLocale from './en'
import zhLocale from './zh'
import jaLocale from './ja'

const messages = {
    en: {
        ...enLocale,
        ...elementEnLocale
    },
    zh_CN: {
        ...zhLocale,
        ...elementZhLocale
    },
    ja: {
        ...jaLocale,
        ...elementJaLocale
    }
}

const i18n = createI18n({
    //  オプション en | zh
    locale: Cookies.get('language') || 'ja',
    // テキスト内容の設定
    messages
})

export default i18n