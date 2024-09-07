import useUserStore from '@/store/modules/user'

function authPermission(permission) {
  const all_permission = "*:*:*";
  const permissions = useUserStore().permissions
  if (permission && permission.length > 0) {
    return permissions.some(v => {
      return all_permission === v || v === permission
    })
  } else {
    return false
  }
}

function authRole(role) {
  const super_admin = "admin";
  const roles = useUserStore().roles
  if (role && role.length > 0) {
    return roles.some(v => {
      return super_admin === v || v === role
    })
  } else {
    return false
  }
}

export default {
  // ユーザがある権利制限を備えているかどうかを検証する
  hasPermi(permission) {
    return authPermission(permission);
  },
  // ユーザに指定権が含まれているかどうかは、どちらかを含めるだけでよい
  hasPermiOr(permissions) {
    return permissions.some(item => {
      return authPermission(item)
    })
  },
  // ユーザに指定権が含まれているかどうかは、すべて所有しなければならない
  hasPermiAnd(permissions) {
    return permissions.every(item => {
      return authPermission(item)
    })
  },
  // ユーザはあるローラを備えているか
  hasRole(role) {
    return authRole(role);
  },
  // ユーザに指定ロールが含まれているかどうかは、どちらかを含めるだけでよい
  hasRoleOr(roles) {
    return roles.some(item => {
      return authRole(item)
    })
  },
  // ユザに指定ロールが含まれているかどうかは、すべてしている必要があります
  hasRoleAnd(roles) {
    return roles.every(item => {
      return authRole(item)
    })
  }
}
