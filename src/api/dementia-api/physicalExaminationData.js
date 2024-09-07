import request from '@/utils/request'
import useUserStore from "@/store/modules/user.js";
import {download} from "../../utils/request.js";

// 健診データリスト
export function listPhysicalExaminationData(query) {
  return request({
    url: '/dementia-api/physicalExaminationData/list',
    method: 'get',
    params: query
  })
}

// 健診データ詳細
export function getPhysicalExaminationData(physicalExaminationId) {
  return request({
    url: '/dementia-api/physicalExaminationData/' + physicalExaminationId,
    method: 'get'
  })
}

// 新規作成健診データ
export function addPhysicalExaminationData(data) {
  return request({
    url: '/dementia-api/physicalExaminationData',
    method: 'post',
    data: data
  })
}

// 変更健診データ
export function updatePhysicalExaminationData(data) {
  return request({
    url: '/dementia-api/physicalExaminationData',
    method: 'put',
    data: data
  })
}

// 削除健診データ
export function delPhysicalExaminationData(physicalExaminationId) {
  return request({
    url: '/dementia-api/physicalExaminationData/' + physicalExaminationId,
    method: 'delete'
  })
}

export function csvTemplateDownload(){
  return download('/dementia-api/physicalExaminationData/' + 'download/csvTemplate',{},'健診データテンプレート.csv')
}

export function uploadFile(option){
    const formData = new FormData()
    formData.append('file',option.file)
    formData.append('userId',useUserStore().id)
    return request({
        url: option.action,
        method: 'post',
        headers: option.headers  || {},
        data: formData
    })
}
