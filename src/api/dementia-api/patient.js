import request from '@/utils/request'
import useUserStore from "@/store/modules/user.js";

// 患者情報リスト
export function listPatient(query) {
  return request({
    url: '/dementia-api/patient/list',
    method: 'get',
    params: query
  })
}

// 承認の患者情報リスト
export function listApprovedPatient(query) {
  return request({
    url: '/dementia-api/patient/listApprovedPatient',
    method: 'get',
    params: query
  })
}

// 患者情報詳細
export function getPatient(id) {
  return request({
    url: '/dementia-api/patient/' + id,
    method: 'get'
  })
}

// 患者情報新規
export function addPatient(data) {
  return request({
    url: '/dementia-api/patient',
    method: 'post',
    data: data
  })
}

// 患者情報修正
export function updatePatient(data) {
  return request({
    url: '/dementia-api/patient',
    method: 'put',
    data: data
  })
}

// 患者情報削除
export function delPatient(id) {
  return request({
    url: '/dementia-api/patient/' + id,
    method: 'delete'
  })
}

export function uploadFile(option){
  const formData = new FormData()
  formData.append('file',option.file)
  formData.append('patientId',useUserStore().id)
  return request({
    url: option.action,
    method: 'post',
    headers: option.headers  || {},
    data: formData
  })
}

export function patientDiagnosis(){
  return request({
    url: '/dementia-api/patient/patientDiagnosis',
    method: 'get',
  })
}

export function patientDiagnosisById(ids){
  return request({
    url: '/dementia-api/patient/patientDiagnosis/'+ ids,
    method: 'get',
  })
}

export function diagnosisStateCheck(ids){
  return request({
    url: '/dementia-api/patient/diagnosisStateCheck/'+ ids,
    method: 'get',
  })
}

export function getPatientByIds(ids){
  return request({
    url: '/dementia-api/patient/getPatientByIds/'+ ids,
    method: 'get',
  })
}

