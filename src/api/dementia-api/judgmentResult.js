import request, {downloadZip} from '@/utils/request'

export function listJudgmentResult(query) {
  return request({
    url: '/dementia-api/judgmentResult/list',
    method: 'get',
    params: query
  })
}

export function deptlist() {
  return request({
    url: '/dementia-api/judgmentResult/deptlist',
    method: 'get'
  })
}

export function getJudgmentPdf(id) {
  return request({
    url: '/dementia-api/judgmentResult/getjudgmentpdf/'+ id,
    method: 'get'
  })
}

export function batchApproved(ids){
  return request({
    url: '/dementia-api/judgmentResult/batchApprove',
    method: 'post',
    data: ids
  })
}

export function checkData(ids){
  return request({
    url: '/dementia-api/judgmentResult/checkData',
    method: 'post',
    data: ids
  })
}

export function updateJudgmentResult(data){
  return request({
    url: '/dementia-api/judgmentResult/updateJudgmentResult',
    method: 'post',
    data: data
  })
}

export function approve(data){
  return request({
    url: '/dementia-api/judgmentResult/approve',
    method: 'post',
    data: data
  })
}

export function batchDownloadPDF(ids,name){
  return downloadZip(
      '/dementia-api/judgmentResult/batchDownloadPDF',
      {
        ids: ids,
      },
      name + "_" + dateFormat() + ".zip")
}

function dateFormat(){
  const localDate = new Date();
  const utcDate = new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000);
  const eastNineDate = new Date(+utcDate + 9 * 60 * 60 * 1000);
  const year = eastNineDate.getFullYear();
  const month = (eastNineDate.getMonth() + 1).toString().padStart(2, '0');
  const day = eastNineDate.getDate().toString().padStart(2, '0');
  const hours = eastNineDate.getHours().toString().padStart(2, '0');
  const minutes = eastNineDate.getMinutes().toString().padStart(2, '0');
  const seconds = eastNineDate.getSeconds().toString().padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}