<script setup>

import {
  addPatientAdvice, Approved,
  downloadPDF,
  getAdvice,
  getAdviceByQianFan,
  updatePatientAdvice
} from "@/api/dementia-api/patient-diagnosis.js";
import {useRoute} from "vue-router";
import useUserStore from "@/store/modules/user.js";
import {parseTime} from "@/utils/ruoyi.js";
import { onMounted } from 'vue';
const props = defineProps(['patientId'])
defineEmits(['closeDialog'])
const { proxy } = getCurrentInstance();
// const patientId = useRoute().query.id
const isAdmin = ref(useUserStore().roles == "admin")

const open = ref(false);
const loading = ref(true);
const isUpdate = ref(false);
const patientData = reactive({
  patient:{},
  patientAdvice:{
    diseaseRisk: "",
    dietaryAdvice: "",
    exerciseAdvice: "",
    approved: null
  }
});

onMounted(() => {
  document.title = "認知機能リスク判定結果"
});

/** 患者情報リスト */
function getPatientAdvice() {
  loading.value = true;
  getAdvice(props.patientId).then(response => {
    if (response.data){
      if(!response.data?.patientAdvice){
        getAdviceByQianFan(props.patientId).then(response => {
          if (response.data){
            patientData.patientAdvice = response.data
            addPatientAdvice({
              patientId: props.patientId,
              diseaseRisk: patientData.patientAdvice.diseaseRisk,
              dietaryAdvice: patientData.patientAdvice.dietaryAdvice,
              exerciseAdvice: patientData.patientAdvice.exerciseAdvice,
              createdUser: useUserStore().id,
              createdTime: new Date()
            }).then(function (res){
              isUpdate.value = true;
              if(res.code === 200){
                loading.value = false;
              }else{
                proxy.$modal.msgError("データ保存失敗");
                loading.value = false;
              }
            })
          }
        })
      }else{
        patientData.patientAdvice = response.data?.patientAdvice
        isUpdate.value = true
        loading.value = false;
      }
      if(response.data?.patient){
        patientData.patient = response.data?.patient
      }
    }
  });
}

function loadData(){
  getPatientAdvice()
}

function handleUpdate(){
  if(isUpdate.value){
    updatePatientAdvice({
      patientId: props.patientId,
      diseaseRisk: patientData.patientAdvice.diseaseRisk,
      dietaryAdvice: patientData.patientAdvice.dietaryAdvice,
      exerciseAdvice: patientData.patientAdvice.exerciseAdvice,
      updatedUser: useUserStore().id,
      updatedTime: new Date()
    }).then(function (res){
      if(res.code === 200){
        proxy.$modal.msgSuccess("保存成功");
      }else{
        proxy.$modal.msgError("保存失敗");
      }
    })
  } else{
    addPatientAdvice({
      patientId: props.patientId,
      diseaseRisk: patientData.patientAdvice.diseaseRisk,
      dietaryAdvice: patientData.patientAdvice.dietaryAdvice,
      exerciseAdvice: patientData.patientAdvice.exerciseAdvice,
      createdUser: useUserStore().id,
      createdTime: new Date()
    }).then(function (res){
      if(res.code === 200){
        proxy.$modal.msgSuccess("保存成功");
      }else{
        proxy.$modal.msgError("保存失敗");
      }
    })
  }
}

function handleDownload(){
  downloadPDF(props.patientId,patientData.patient.name,parseTime(patientData.patient.examday, '{y}-{m}-{d}'))
}

function handleApproved(){
  Approved(props.patientId,1).then(function (res){
    if(res.code === 200){
      proxy.$modal.msgSuccess("操作が成功しました");
      loadData()
    }else{
      proxy.$modal.msgError("操作に失敗しました");
    }
  })
}

function handleUnApproved(){
  Approved(props.patientId,0).then(function (res){
    if(res.code === 200){
      proxy.$modal.msgSuccess("操作が成功しました");
      loadData()
    }else{
      proxy.$modal.msgError("操作に失敗しました");
    }
  })
}
loadData();
</script>

<template>
  <div class="app-container">
    <el-container v-loading="loading">
      <el-header>
        <el-row class="header-row">
          <el-col :span="24">
            <el-text class="mx-1 header-font" size="large" tag="p" style="text-align: center;color: black;">認知機能リスク判定結果</el-text>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="6" :offset="3">
            <div class="big-font grid-content ep-bg-purple-dark" >氏名:{{patientData.patient.name}}</div>
          </el-col>
          <el-col :span="6">
            <div class="big-font grid-content ep-bg-purple-dark" >リスク群:{{patientData.patient.score}}</div>
          </el-col>
          <el-col :span="6">
            <div class="big-font grid-content ep-bg-purple-dark" >健診日:{{parseTime(patientData.patient.examday, '{y}-{m}-{d}')}}</div>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="6" :offset="3">
            <div class="big-font grid-content ep-bg-purple-dark" >性別:{{patientData.patient.sex === 0 ? '男':'女'}}</div>
          </el-col>
          <el-col :span="6" :offset="6">
            <div class="big-font grid-content ep-bg-purple-dark" >判定日:{{parseTime(patientData.patient.examday, '{y}-{m}-{d}')}}</div>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" class="header-row row">
          <el-col :span="18" :offset="3">
            <el-text class="mx-1 header-font" size="large" tag="p" style="color: black;">検査結果は3段階のグル-プに分類されます</el-text>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="18" :offset="3">
            <div class="underline_header-row big-font grid-content ep-bg-purple-dark">顕著なリスクが認められない</div>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" class="row info-row">
          <el-col :span="16" :offset="3">
            <div>
              <span class="more-big-font grid-content ep-bg-purple-dark">A </span>
              <span class="big-font grid-content ep-bg-purple-dark">統計上は、現時点では比較の良好な状態にある群です。健康な生活習慣を保つよう心がけてください。</span>
            </div>
            <div style="direction: rtl">
              <span class="info-font">認知症やMCIの検査をしているわけではごさいません※</span>
            </div>
          </el-col>
          <el-col :span="2"/>
        </el-row>
        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="18" :offset="3">
            <div class="underline_header-row big-font grid-content ep-bg-purple-dark" >認知機能リスクがある</div>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" class="row info-row">
          <el-col :span="16" :offset="3">
            <div>
              <span class="more-big-font grid-content ep-bg-purple-dark">B </span>
              <span class="big-font grid-content ep-bg-purple-dark">認知機能低下リスクが統計のには、高い群です。生活習惯を向上させ予防に取り組みましょう。</span>
            </div>
            <div style="direction: rtl">
              <span class="info-font">認知症やMCIの検査をしているわけではごさいません※</span>
            </div>
          </el-col>
          <el-col :span="2"/>
        </el-row>
        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="18" :offset="3">
            <div class="underline_header-row big-font grid-content ep-bg-purple-dark" >認知機能リスクが高い</div>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" class="row info-row">
          <el-col :span="16" :offset="3">
            <div>
              <span class="more-big-font grid-content ep-bg-purple-dark">C </span>
              <span class="big-font grid-content ep-bg-purple-dark">認知機能低下リスクが統計のには、高い群です。気になる方は專門医等の受診をご検討ください。</span>
            </div>
            <div style="direction: rtl">
              <span class="info-font">認知症やMCIの検査をしているわけではごさいません※</span>
            </div>
          </el-col>
          <el-col :span="2"/>
        </el-row>

        <el-row class="header-row">
          <el-col :span="24">
            <el-text class="mx-1 header-font" size="large" tag="p" style="text-align: center;color: black;">コメント</el-text>
          </el-col>
        </el-row>

        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="18" :offset="3">
            <div>
              <span class="big-font grid-content ep-bg-purple-dark">1 . </span>
              <span class="small-font grid-content ep-bg-purple-dark">認知障害発症リスクとなる謝障害</span>
            </div>
            <el-input
                v-model="patientData.patientAdvice.diseaseRisk"
                style="width: 100%"
                :rows="3"
                type="textarea"
                :disabled="!isAdmin"
            />
          </el-col>
        </el-row>

        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="18" :offset="3">
            <div>
              <span class="big-font grid-content ep-bg-purple-dark">2 . </span>
              <span class="small-font grid-content ep-bg-purple-dark">リスクを下げる食材食事</span>
            </div>
            <el-input
                v-model="patientData.patientAdvice.dietaryAdvice"
                style="width: 100%"
                :rows="3"
                type="textarea"
                :disabled="!isAdmin"
            />
          </el-col>
        </el-row>

        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="18" :offset="3">
            <div>
              <span class="big-font grid-content ep-bg-purple-dark">3 . </span>
              <span class="small-font grid-content ep-bg-purple-dark">リスクを下げる運動</span>
            </div>
            <el-input
                v-model="patientData.patientAdvice.exerciseAdvice"
                style="width: 100%"
                :rows="3"
                type="textarea"
                :disabled="!isAdmin"
            />
          </el-col>
        </el-row>
      </el-main>
      <el-footer>
        <el-row :gutter="20" justify="center" class="row" >
          <el-col :span="3" :offset="6">
            <el-button
                type="success"
                plain
                :disabled="!isAdmin"
                @click="handleUpdate"
            >保存</el-button>
          </el-col>
          <el-col :span="3">
            <el-button
                type="success"
                plain
                :disabled="(!isAdmin) || patientData.patientAdvice.approved === '1'"
                @click="handleApproved"
            >許可</el-button>
          </el-col>
          <el-col :span="3">
            <el-button
                type="primary"
                plain
                :disabled="(!isAdmin) || patientData.patientAdvice.approved === '0'"
                @click="handleUnApproved"
            >拒否</el-button>
          </el-col>
          <el-col :span="3">
            <el-button
                type="primary"
                plain
                @click="handleDownload"
            >ダウンロード</el-button>
          </el-col>
          <el-col :span="3">
            <el-button
                type="danger"
                plain
                @click="proxy.$emit('closeDialog')"
            >閉じる</el-button>
          </el-col>
        </el-row>
      </el-footer>
    </el-container>

  </div>
</template>

<style scoped lang="scss">
  .row{
    margin-top: 1rem;
  }
  .header-row{
    margin-bottom: 2rem;
  }
  .underline_header-row{
    text-decoration: underline red;
    margin-top: 1rem;
  }
  .info-row{
    margin-top: 0;
  }
  .more-big-font{
    font-size: 40px;
  }
  .header-font{
    font-size: 26px;
  }
  .big-font{
    font-size: 20px;
  }
  .small-font{
    font-size: 17px;
  }
  .info-font{
    font-size: 13px;
  }
</style>