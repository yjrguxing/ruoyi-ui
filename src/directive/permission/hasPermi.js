 /**
 * v-hasPermi 操作権限処理
 * Copyright (c) 
 */
 
import useUserStore from '@/store/modules/user'

export default {
  mounted(el, binding, vnode) {
    const { value } = binding
    const all_permission = "*:*:*";
    const permissions = useUserStore().permissions

    if (value && value instanceof Array && value.length > 0) {
      const permissionFlag = value

      const hasPermissions = permissions.some(permission => {
        return all_permission === permission || permissionFlag.includes(permission)
      })

      if (!hasPermissions) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`操作権限ラベル値を設定してください`)
    }
  }
}
