import request, {download, downloadZip} from '@/utils/request'
import {updatePatient} from "@/api/dementia-api/patient.js";

export function getAdvice(id){
    return request({
        url: '/dementia-api/patient-advice/' + id,
        method: 'get',
    })
}

export function getAdviceByQianFan(id){
    return request({
        url: '/dementia-api/patient-advice/qianfan/' + id,
        method: 'get',
    })
}

export function addPatientAdvice(data){
    return request({
        url: '/dementia-api/patient-advice',
        method: 'post',
        data: data
    })
}

export function updatePatientAdvice(data){
    return request({
        url: '/dementia-api/patient-advice',
        method: 'put',
        data: data
    })
}

export function downloadPDF(id,name,examDay){
    return download(
        '/dementia-api/patient-advice/downloadPDF',
        {
            id: id,
        },
        name + "-" + examDay + ".pdf")
}

export function batchDownloadPDF(ids,name){
    return downloadZip(
        '/dementia-api/patient-advice/batchDownloadPDF',
        {
            ids: ids,
        },
        name + ".zip")
}

export function Approved(patientId,approved){
    return request({
        url: '/dementia-api/patient-advice/ApprovedPatientAdvice?patientIds=' + patientId + "&approved=" + approved ,
        method: 'post'
    })
}

export function batchApproved(patientId,approved){
    return request({
        url: '/dementia-api/patient-advice/batchApprovedPatientAdvice?patientIds=' + patientId + "&approved=" + approved ,
        method: 'post'
    })
}