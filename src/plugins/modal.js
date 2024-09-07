import { ElMessage, ElMessageBox, ElNotification, ElLoading } from 'element-plus'

let loadingInstance;

export default {
  // メッセージヒント
  msg(content) {
    ElMessage.info(content)
  },
  // エラーメッセージ
  msgError(content) {
    ElMessage.error({
      message:content,
      duration: 5000
    })
  },
  // 成功メッセージ
  msgSuccess(content) {
    ElMessage.success(content)
  },
  // 警告メッセージ
  msgWarning(content) {
    ElMessage.warning(content)
  },
  // ポップアップヒント
  alert(content) {
    ElMessageBox.alert(content, "システムのヒント")
  },
  // エラーヒント
  alertError(content) {
    ElMessageBox.alert(content, "システムのヒント", { type: 'error' })
  },
  // 成功ヒント
  alertSuccess(content) {
    ElMessageBox.alert(content, "システムのヒント", { type: 'success' })
  },
  // 警告ヒント
  alertWarning(content) {
    ElMessageBox.alert(content, "システムのヒント", { type: 'warning' })
  },
  // 通知ヒント
  notify(content) {
    ElNotification.info(content)
  },
  // エラー通知
  notifyError(content) {
    ElNotification.error(content);
  },
  // 成功通知
  notifySuccess(content) {
    ElNotification.success(content)
  },
  // 警告通知
  notifyWarning(content) {
    ElNotification.warning(content)
  },
  // 確認
  confirm(content) {
    return ElMessageBox.confirm(content, "システムのヒント", {
      confirmButtonText: '確定',
      cancelButtonText: 'キャンセル',
      type: "warning",
      customStyle:{
        "white-space": "pre"
      }
    })
  },
  // コミット内容
  prompt(content) {
    return ElMessageBox.prompt(content, "システムのヒント", {
      confirmButtonText: '確定',
      cancelButtonText: 'キャンセル',
      type: "warning",
    })
  },
  // マスクレイヤを開く
  loading(content) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: content,
      background: "rgba(0, 0, 0, 0.7)",
    })
  },
  // マスクレイヤを閉
  closeLoading() {
    loadingInstance.close();
  }
}
