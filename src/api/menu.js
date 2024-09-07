import request from '@/utils/request'

// ルーティング
export const getRouters = () => {
  return request({
    url: '/getRouters',
    method: 'get'
  })
}