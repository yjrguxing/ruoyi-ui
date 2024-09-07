import request from '@/utils/request'

// 部門リスト
export function listDept(query) {
  return request({
    url: '/system/dept/list',
    method: 'get',
    params: query
  })
}

// 部門リスト
export function listDeptExcludeChild(deptId) {
  return request({
    url: '/system/dept/list/exclude/' + deptId,
    method: 'get'
  })
}

// 部門詳細
export function getDept(deptId) {
  return request({
    url: '/system/dept/' + deptId,
    method: 'get'
  })
}

// 新規部門
export function addDept(data) {
  return request({
    url: '/system/dept',
    method: 'post',
    data: data
  })
}

// 修正部門
export function updateDept(data) {
  return request({
    url: '/system/dept',
    method: 'put',
    data: data
  })
}

// 削除部門
export function delDept(deptId) {
  return request({
    url: '/system/dept/' + deptId,
    method: 'delete'
  })
}

/**
 * ddeptName-病院名
 * @deprecated 
 * @param deptId 部門id
 * @returns {*} 結果
 */
export function getDeptName(deptId){
  return request({
    url: '/system/dept/getDeptName/' + deptId,
    method: 'get'
  })
}