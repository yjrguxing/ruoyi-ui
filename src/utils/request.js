import axios from 'axios'
import { ElNotification , ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { tansParams, blobValidate } from '@/utils/ruoyi'
import cache from '@/plugins/cache'
import { saveAs } from 'file-saver'
import useUserStore from '@/store/modules/user'

let downloadLoadingInstance;
// 再ログインを表示するかどうか
export let isRelogin = { show: false };

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 新規axiosインスタンス
const service = axios.create({
  // Maxiosにおけるリクエストは、リクエストURL共通部分を示すbaseURLオプシンを構成している
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // タイムアウト
  timeout: 100000
})

// リクエストのインターセプト
service.interceptors.request.use(config => {
  // token設定 
  const isToken = (config.headers || {}).isToken === false
  // データ重複提出防止が必要
  const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
  if (getToken() && !isToken) {
    config.headers['Authorization'] = 'Bearer ' + getToken() 
  }
  // getリクエストマッピングparamsパラメータ
  if (config.method === 'get' && config.params) {
    let url = config.url + '?' + tansParams(config.params);
    url = url.slice(0, -1);
    config.params = {};
    config.url = url;
  }
  if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
    const requestObj = {
      url: config.url,
      data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
      time: new Date().getTime()
    }
    const requestSize = Object.keys(JSON.stringify(requestObj)).length; // リクエストデータ大小
    const limitSize = 5 * 1024 * 1024; // 制限格納データ5 M
    if (requestSize >= limitSize) {
      console.warn(`[${config.url}]: ` + 'リクエストデータサイズが許容される5M制限を超えており、重複防止のための検査証の提出ができない。')
      return config;
    }
    const sessionObj = cache.session.getJSON('sessionObj')
    if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
      cache.session.setJSON('sessionObj', requestObj)
    } else {
      const s_url = sessionObj.url;                // リクエストアドレス
      const s_data = sessionObj.data;              // リクエストデータ
      const s_time = sessionObj.time;              // リクエスト日時
      const interval = 1000;                       // 间隔日時(ms）、この日未満の場合は重複コミットとみなす
      if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
        const message = 'データは処理中です。再送信しないでください';
        console.warn(`[${s_url}]: ` + message)
        return Promise.reject(new Error(message))
      } else {
        cache.session.setJSON('sessionObj', requestObj)
      }
    }
  }
  return config
}, error => {
    console.log(error)
    Promise.reject(error)
})

// レスポンスブロック
service.interceptors.response.use(res => {
    // ステータスコードが設定されていない場合はデフォルトで成功ステータスク
    const code = res.data.code || 200;
    // エラー情報
    const msg = errorCode[code] || res.data.msg || errorCode['default']
    // バイナリデータはそのまま戻ります
    if (res.request.responseType ===  'blob' || res.request.responseType ===  'arraybuffer') {
      return res.data
    }
    if (code === 401) {
      if (!isRelogin.show) {
          isRelogin.show = true;
          ElMessageBox.confirm('ログインステータスが期限切れになっているので、このページに残りますか、再ログインしますか', 'システムのヒント', { confirmButtonText: '再ログイン', cancelButtonText: 'キャンセル', type: 'warning' }).then(() => {
            isRelogin.show = false;
            useUserStore().logOut().then(() => {
              location.href = '/index';
            })
        }).catch(() => {
          isRelogin.show = false;
        });
      }
      return Promise.reject('セッションが無効であるか、セッションの有効期限が切れています。再度ログインしてください。')
    } else if (code === 500) {
      ElMessage({ message: msg, type: 'error', duration: 5000 })
      return Promise.reject(new Error(msg))
    } else if (code === 601) {
      ElMessage({ message: msg, type: 'warning' })
      return Promise.reject(new Error(msg))
    } else if (code !== 200) {
      ElNotification.error({ title: msg })
      return Promise.reject('error')
    } else {
      return  Promise.resolve(res.data)
    }
  },
  error => {
    console.log('err' + error)
    let { message } = error;
    if (message == "Network Error") {
      message = "バックエンドインタフェース接続異常";
    } else if (message.includes("timeout")) {
      message = "システムインターフェースリクエストのタイムアウト";
    } else if (message.includes("Request failed with status code")) {
      message = "システムインタフェース" + message.substr(message.length - 3) + "異常";
    }
    ElMessage({ message: message, type: 'error', duration: 5 * 1000 })
    return Promise.reject(error)
  }
)

// 共通ダウンロード方法
export function download(url, params, filename, config) {
  downloadLoadingInstance = ElLoading.service({ text: "データをダウンロードしています。お待ち下さい", background: "rgba(0, 0, 0, 0.7)", })
  return service.post(url, params, {
    transformRequest: [(params) => { return tansParams(params) }],
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    responseType: 'blob',
    ...config
  }).then(async (data) => {
    const isBlob = blobValidate(data);
    if (isBlob) {
      const blob = new Blob([data])
      saveAs(blob, filename)
    } else {
      const resText = await data.text();
      const rspObj = JSON.parse(resText);
      const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
      ElMessage.error(errMsg);
    }
    downloadLoadingInstance.close();
  }).catch((r) => {
    console.error(r)
    ElMessage.error('ファイルのダウンロード中にエラーが発生しました。管理者に連絡してください。')
    downloadLoadingInstance.close();
  })
}
// ダウンロード方法 zip
export function downloadZip(url, params, filename, config) {
  downloadLoadingInstance = ElLoading.service({ text: "データダウンロード中ですのでお待ちください", background: "rgba(0, 0, 0, 0.7)", })
  return service.post(url, params, {
    transformRequest: [(params) => { return tansParams(params) }],
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    responseType: 'blob',
    ...config
  }).then(async (data) => {
    const isBlob = blobValidate(data);
    if (isBlob) {
      const blob = new Blob([data], { type: 'application/zip' })
      saveAs(blob, filename)
    } else {
      const resText = await data.text();
      const rspObj = JSON.parse(resText);
      const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
      ElMessage.error(errMsg);
    }
    downloadLoadingInstance.close();
  }).catch((r) => {
    console.error(r)
    ElMessage.error('ファイルダウンロードにエラーが出現しました、管理者に連絡してください！')
    downloadLoadingInstance.close();
  })
}

export default service
