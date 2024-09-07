import request from '@/utils/request'

// サービス情報
export function getServer() {
  return request({
    url: '/monitor/server',
    method: 'get'
  })
}