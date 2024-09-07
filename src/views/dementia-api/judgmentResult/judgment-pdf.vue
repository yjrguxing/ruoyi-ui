<script setup>
import {getJudgmentPdf, updateJudgmentResult, approve, checkData} from "@/api/dementia-api/judgmentResult.js";

import {useRoute} from "vue-router";
import useUserStore from "@/store/modules/user.js";
import {parseTime} from "@/utils/ruoyi.js";
import { onMounted } from 'vue';
const props = defineProps(['judgmentResultId'])
defineEmits(['closeDialog'])
const { proxy } = getCurrentInstance();
const isAdmin = ref(useUserStore().roles == "admin")
const { risk_level } = proxy.useDict('risk_level');

const open = ref(false);
const loading = ref(true);
const judgmentPdfData = reactive({
  judgmentResult:{},
  physicalExaminationData: {},
  patientAdvice:{
    judgmentResultId: null,
    riskLevel: null,
    diseaseRisk: "",
    dietaryAdvice: "",
    exerciseAdvice: "",
    approvedStatus: null
  }
});
const tableData = reactive([])
const isApproveOrAdmin = proxy.$auth.hasRoleOr(["approve_user"]);

onMounted(() => {
  document.title = "認知機能リスク判定結果";
  loadData();
});

const loadData = ()=>{
  loading.value = true;
  getJudgmentPdf(props.judgmentResultId).then(response => {
    judgmentPdfData.judgmentResult = response.data.judgmentResult
    judgmentPdfData.physicalExaminationData = response.data.physicalExaminationData
    judgmentPdfData.patientAdvice.judgmentResultId = response.data.judgmentResult.judgmentResultId
    judgmentPdfData.patientAdvice.riskLevel = response.data.judgmentResult.riskLevel.toString()
    judgmentPdfData.patientAdvice.diseaseRisk = response.data.judgmentResult.diseaseRisk
    judgmentPdfData.patientAdvice.dietaryAdvice = response.data.judgmentResult.dietaryAdvice
    judgmentPdfData.patientAdvice.exerciseAdvice = response.data.judgmentResult.exerciseAdvice
    judgmentPdfData.patientAdvice.approvedStatus = response.data.judgmentResult.approvedStatus

    // BMI
    tableData.push({ item: "BMI",
      result: judgmentPdfData.physicalExaminationData.bmi,
      unit: "-",
      range: "21.5～24.9",
      color: judgmentPdfData.physicalExaminationData.bmi >= 21.5 && judgmentPdfData.physicalExaminationData.bmi <= 24.9?"":"red"
    })
    // 拡張期血圧
    tableData.push({ item: "拡張期血圧",
      result: judgmentPdfData.physicalExaminationData.dp,
      unit: "ｍｍHg",
      range: "60～100",
      color: judgmentPdfData.physicalExaminationData.dp >= 60 && judgmentPdfData.physicalExaminationData.dp <= 100?"":"red"
    })
    // 収縮期血圧
    tableData.push({ item: "収縮期血圧",
      result: judgmentPdfData.physicalExaminationData.sp,
      unit: "ｍｍHg",
      range: "90～160",
      color: judgmentPdfData.physicalExaminationData.sp >= 90 && judgmentPdfData.physicalExaminationData.sp <= 160?"":"red"
    })
    // 白血球数
    tableData.push({ item: "白血球数",
      result: judgmentPdfData.physicalExaminationData.wbc,
      unit: "×10²/㎜³",
      range: "33～89",
      color: judgmentPdfData.physicalExaminationData.wbc >= 33 && judgmentPdfData.physicalExaminationData.wbc <= 89?"":"red"
    })
    // 赤血球数
    let rbcColor = "";
    if (judgmentPdfData.physicalExaminationData.sex === 0) {
      rbcColor = judgmentPdfData.physicalExaminationData.rbc >= 400 && judgmentPdfData.physicalExaminationData.rbc <= 539?"":"red"
    } else {
      rbcColor = judgmentPdfData.physicalExaminationData.rbc >= 360 && judgmentPdfData.physicalExaminationData.rbc <= 489?"":"red"
    }
    tableData.push({ item: "赤血球数",
      result: judgmentPdfData.physicalExaminationData.rbc,
      unit: "×10⁴/㎜³",
      range: "男性 400～539/女性 360～489",
      color: rbcColor
    });
    // ヘマトクリット
    let htColor = "";
    if (judgmentPdfData.physicalExaminationData.sex === 0) {
      htColor = judgmentPdfData.physicalExaminationData.ht >= 38.0 && judgmentPdfData.physicalExaminationData.ht <= 48.9?"":"red"
    } else {
      htColor = judgmentPdfData.physicalExaminationData.ht >= 34.0 && judgmentPdfData.physicalExaminationData.ht <= 43.9?"":"red"
    }
    tableData.push({ item: "ヘマトクリット",
      result: judgmentPdfData.physicalExaminationData.ht,
      unit: "％",
      range: "男性 38.0～48.9/女性 34.0～43.9",
      color: htColor
    })
    // ヘモグロビン
    let hbColor = "";
    if (judgmentPdfData.physicalExaminationData.sex === 0) {
      hbColor = judgmentPdfData.physicalExaminationData.hb >= 13.0 && judgmentPdfData.physicalExaminationData.hb <= 16.6?"":"red"
    } else {
      hbColor = judgmentPdfData.physicalExaminationData.hb >= 11.4 && judgmentPdfData.physicalExaminationData.hb <= 14.6?"":"red"
    }
    tableData.push({ item: "ヘモグロビン",
      result: judgmentPdfData.physicalExaminationData.hb,
      unit: "g/dL",
      range: "男性 13.0～16.6/女性 11.4～14.6",
      color: hbColor
    })
    // 血小板数
    tableData.push({ item: "血小板数",
      result: judgmentPdfData.physicalExaminationData.plt,
      unit: "×10⁴/㎜³",
      range: "14.0～35.9",
      color: judgmentPdfData.physicalExaminationData.plt >= 14.0 && judgmentPdfData.physicalExaminationData.plt <= 35.9?"":"red"
    })
    // AST（GOT）
    tableData.push({ item: "AST（GOT）",
      result: judgmentPdfData.physicalExaminationData.ast,
      unit: "U/L",
      range: "0～30",
      color: judgmentPdfData.physicalExaminationData.ast >= 0 && judgmentPdfData.physicalExaminationData.ast <= 30?"":"red"
    })
    // ALT（GPT）
    tableData.push({ item: "ALT（GPT）",
      result: judgmentPdfData.physicalExaminationData.alt,
      unit: "U/L",
      range: "0～30",
      color: judgmentPdfData.physicalExaminationData.alt >= 0 && judgmentPdfData.physicalExaminationData.alt <= 30?"":"red"
    })
    // γ-GTP
    tableData.push({ item: "γ-GTP",
      result: judgmentPdfData.physicalExaminationData.rGt,
      unit: "IU/L",
      range: "0～50",
      color: judgmentPdfData.physicalExaminationData.rGt >= 0 && judgmentPdfData.physicalExaminationData.rGt <= 50?"":"red"
    })
    // トリグリセリド
    tableData.push({ item: "トリグリセリド",
      result: judgmentPdfData.physicalExaminationData.tg,
      unit: "mg/dL",
      range: "30～149",
      color: judgmentPdfData.physicalExaminationData.tg >= 30 && judgmentPdfData.physicalExaminationData.tg <= 149?"":"red"
    })
    // HDLコレステロール
    tableData.push({ item: "HDLコレステロール",
      result: judgmentPdfData.physicalExaminationData.hdlCho,
      unit: "mg/dL",
      range: "40～89",
      color: judgmentPdfData.physicalExaminationData.hdlCho >= 40 && judgmentPdfData.physicalExaminationData.hdlCho <= 89?"":"red"
    })
    // LDLコレステロール
    tableData.push({ item: "LDLコレステロール",
      result: judgmentPdfData.physicalExaminationData.ldlCho,
      unit: "mg/dL",
      range: "60～119",
      color: judgmentPdfData.physicalExaminationData.ldlCho >= 60 && judgmentPdfData.physicalExaminationData.ldlCho <= 119?"":"red"
    })
    // グルコース
    tableData.push({ item: "グルコース",
      result: judgmentPdfData.physicalExaminationData.glu,
      unit: "mg/dL",
      range: "70～99",
      color: judgmentPdfData.physicalExaminationData.glu >= 70 && judgmentPdfData.physicalExaminationData.glu <= 99?"":"red"
    })
    // HbA1c
    tableData.push({ item: "HbA1c",
      result: judgmentPdfData.physicalExaminationData.hba1c,
      unit: "%",
      range: "4.6～5.5",
      color: judgmentPdfData.physicalExaminationData.hba1c >= 4.6 && judgmentPdfData.physicalExaminationData.hba1c <= 5.5?"":"red"
    })
    // クレアチニン
    let crColor = "";
    if (judgmentPdfData.physicalExaminationData.sex === 0) {
      crColor = judgmentPdfData.physicalExaminationData.cr >= 0.61 && judgmentPdfData.physicalExaminationData.cr <= 1.04?"":"red"
    } else {
      crColor = judgmentPdfData.physicalExaminationData.cr >= 0.47 && judgmentPdfData.physicalExaminationData.cr <= 0.79?"":"red"
    }
    tableData.push({ item: "クレアチニン",
      result: judgmentPdfData.physicalExaminationData.cr,
      unit: "mg/dL",
      range: "男性 0.61～1.04/女性 0.47～0.79",
      color: crColor
    })
    // 尿酸
    let uaColor = "";
    if (judgmentPdfData.physicalExaminationData.sex === 0) {
      uaColor = judgmentPdfData.physicalExaminationData.ua >= 3.7 && judgmentPdfData.physicalExaminationData.ua <= 7.0?"":"red"
    } else {
      uaColor = judgmentPdfData.physicalExaminationData.ua >= 2.6 && judgmentPdfData.physicalExaminationData.ua <= 5.7?"":"red"
    }
    tableData.push({ item: "尿酸",
      result: judgmentPdfData.physicalExaminationData.ua,
      unit: "mg/dL",
      range: "男性 3.7～7.0/女性 2.6～5.7",
      color: uaColor
    })
    // BUN
    tableData.push({ item: "BUN",
      result: judgmentPdfData.physicalExaminationData.bun,
      unit: "mg/dL",
      range: "8.0～22.0",
      color: judgmentPdfData.physicalExaminationData.bun >= 8.0 && judgmentPdfData.physicalExaminationData.bun <= 22.0?"":"red"
    })
    // 総タンパク
    tableData.push({ item: "総タンパク",
      result: judgmentPdfData.physicalExaminationData.tp,
      unit: "g/dL",
      range: "6.7～8.3",
      color: judgmentPdfData.physicalExaminationData.tp >= 6.7 && judgmentPdfData.physicalExaminationData.tp <= 8.3?"":"red"
    })
    // アルブミン
    tableData.push({ item: "アルブミン",
      result: judgmentPdfData.physicalExaminationData.alb,
      unit: "g/dL",
      range: "3.8～5.2",
      color: judgmentPdfData.physicalExaminationData.alb >= 3.8 && judgmentPdfData.physicalExaminationData.alb <= 5.2?"":"red"
    })
    // A/G比
    tableData.push({ item: "A/G比",
      result: judgmentPdfData.physicalExaminationData.ag,
      unit: "-",
      range: "1.1～2.1",
      color: judgmentPdfData.physicalExaminationData.ag >= 1.1 && judgmentPdfData.physicalExaminationData.ag <= 2.1?"":"red"
    })
    // Na
    tableData.push({ item: "Na",
      result: judgmentPdfData.physicalExaminationData.na,
      unit: "mEq/L",
      range: "137～147",
      color: judgmentPdfData.physicalExaminationData.na >= 137 && judgmentPdfData.physicalExaminationData.na <= 147?"":"red"
    })
    // K
    tableData.push({ item: "K",
      result: judgmentPdfData.physicalExaminationData.k,
      unit: "mEq/L",
      range: "3.5～5.0",
      color: judgmentPdfData.physicalExaminationData.k >= 3.5 && judgmentPdfData.physicalExaminationData.k <= 5.0?"":"red"
    })
    // CI
    tableData.push({ item: "Cl",
      result: judgmentPdfData.physicalExaminationData.cl,
      unit: "mEq/L",
      range: "98～108",
      color: judgmentPdfData.physicalExaminationData.cl >= 98 && judgmentPdfData.physicalExaminationData.cl <= 108?"":"red"
    })
    // CRP
    tableData.push({ item: "CRP",
      result: judgmentPdfData.physicalExaminationData.crp,
      unit: "-",
      range: "0～0.3",
      color: judgmentPdfData.physicalExaminationData.crp >= 0 && judgmentPdfData.physicalExaminationData.crp <= 0.3?"":"red"
    })
    // MCV
    tableData.push({ item: "MCV",
      result: judgmentPdfData.physicalExaminationData.mcv,
      unit: "fL",
      range: "80～98",
      color: judgmentPdfData.physicalExaminationData.mcv >= 80 && judgmentPdfData.physicalExaminationData.mcv <= 98?"":"red"
    })
    // MMSE（実測）
    tableData.push({ item: "MMSE（実測）",
      result: judgmentPdfData.physicalExaminationData.mmse,
      unit: "-",
      range: "-",
      color: judgmentPdfData.physicalExaminationData.mmse >= 27 && judgmentPdfData.physicalExaminationData.mmse <= 30?"":"red"
    })

    loading.value = false;
  })
}

const handleUpdate = () => {
  loading.value = true
  checkData([props.judgmentResultId]).then(function (res) {
        if(res.code === 200){
          updateJudgmentResult(judgmentPdfData.patientAdvice).then(function (res){
            if(res.code === 200){
              proxy.$modal.msgSuccess("操作が成功しました");
              loadData();
            }else{
              proxy.$modal.msgError("操作に失敗しました");
            }
            loading.value = false
          })
        }
      }).catch(function (res) {
        loading.value = false
      })
}

function handleApproved(){
  proxy.$modal.confirm(proxy.message.phyexam.PhyExam_E0006)
      .then(()=>{
        loading.value = true
        checkData([props.judgmentResultId]).then(function (res) {
          if(res.code === 200){
            approve(judgmentPdfData.patientAdvice).then(function (res){
              if(res.code === 200){
                proxy.$modal.msgSuccess("操作が成功しました");
                loadData();
              }else{
                proxy.$modal.msgError("操作に失敗しました");
              }
              loading.value = false
            })
          }
        }).catch(function (res) {
          loading.value = false
        })
  })
}
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
            <div class="big-font grid-content ep-bg-purple-dark" >氏名：{{ judgmentPdfData.physicalExaminationData.name }}</div>
          </el-col>
          <el-col :span="6">
            <div class="big-font grid-content ep-bg-purple-dark" style="display: inline-block" >リスク群：
              <el-select v-model="judgmentPdfData.patientAdvice.riskLevel" style="width: 100px" placeholder=""
              v-if="isApproveOrAdmin">
                <el-option
                    v-for="dict in risk_level"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                />
              </el-select>
              <dict-tag style="display: inline-block" v-if="!isApproveOrAdmin" :options="risk_level" :value="judgmentPdfData.patientAdvice.riskLevel"/>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="big-font grid-content ep-bg-purple-dark" >健診日：{{ parseTime(judgmentPdfData.physicalExaminationData.examday, '{y}-{m}-{d}') }}</div>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="6" :offset="3">
            <div class="big-font grid-content ep-bg-purple-dark" >性別：{{ judgmentPdfData.physicalExaminationData.sex === 0 ? '男' : '女' }}</div>
          </el-col>
          <el-col :span="6" :offset="6">
            <div class="big-font grid-content ep-bg-purple-dark" >判定日：{{ parseTime(judgmentPdfData.judgmentResult.judgmentDate, '{y}-{m}-{d}') }}</div>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="18" :offset="3">
            <el-text class="big-font grid-content ep-bg-purple-dark" size="large">検査結果は3段階のグル-プに分類されます</el-text>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="18" :offset="3">
            <el-text class="big-font grid-content ep-bg-purple-dark" size="large">A　明らかな認知障害のリスクは認められません。</el-text>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="18" :offset="3">
            <el-text class="big-font grid-content ep-bg-purple-dark" size="large">統計上、比較的良好な状態にある群です。健康な生活習慣を保つよう心がけてください。</el-text>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="18" :offset="3">
            <el-text class="big-font grid-content ep-bg-purple-dark" size="large">B　軽度認知障害（MCI）のリスクがあります。</el-text>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="18" :offset="3">
            <el-text class="big-font grid-content ep-bg-purple-dark" size="large">軽度認知障害（MCI)のリスクが統計的に認められる群です。生活習慣を向上させ予防に取組みましょう。</el-text>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="18" :offset="3">
            <el-text class="big-font grid-content ep-bg-purple-dark" size="large">C　認知障害のリスクがあります。</el-text>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="18" :offset="3">
            <el-text class="big-font grid-content ep-bg-purple-dark" size="large">認知障害のリスクが統計的に認められる群です。気になる方は專門医等の受診をご検討ください。</el-text>
          </el-col>
        </el-row>
        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="18" :offset="3">
            <el-text class="big-font grid-content ep-bg-purple-dark" size="large">※本検査は認知症やMCIの診断をしているわけではありません。</el-text>
          </el-col>
        </el-row>
        <el-row class="header-row row">
          <el-col :span="24">
            <el-text class="mx-1 header-font" size="large" tag="p" style="text-align: center;color: black;">コメント</el-text>
          </el-col>
        </el-row>

        <el-row :gutter="20" justify="center" class="row">
          <el-col :span="18" :offset="3">
            <div>
              <span class="big-font grid-content ep-bg-purple-dark">1 . </span>
              <span class="small-font grid-content ep-bg-purple-dark">認知障害発症リスクとなる代謝障害</span>
            </div>
            <el-input
                v-model="judgmentPdfData.patientAdvice.diseaseRisk"
                style="width: 100%"
                :rows="12"
                type="textarea"
                :disabled="!isApproveOrAdmin"
                maxlength="2000"
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
                v-model="judgmentPdfData.patientAdvice.dietaryAdvice"
                style="width: 100%"
                :rows="12"
                type="textarea"
                :disabled="!isApproveOrAdmin"
                maxlength="2000"
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
                v-model="judgmentPdfData.patientAdvice.exerciseAdvice"
                style="width: 100%"
                :rows="12"
                type="textarea"
                :disabled="!isApproveOrAdmin"
                maxlength="2000"
            />
          </el-col>
        </el-row>
      </el-main>
      <el-footer>
        <el-row :gutter="20" justify="center" class="row" >
          <el-col :span="4" v-hasPermi="['dementia-api:judgmentResult:edit']" style="text-align: center;">
            <el-button
                type="success"
                plain
                @click="handleUpdate"
            >保存</el-button>
          </el-col>
          <el-col :span="4" v-hasPermi="['dementia-api:judgmentResult:approve']" style="text-align: center;">
            <el-button
                type="success"
                plain
                :disabled="judgmentPdfData.patientAdvice.approvedStatus === 1"
                @click="handleApproved"
            >承認</el-button>
          </el-col>
          <el-col :span="4" style="text-align: center;">
            <el-button
                type="danger"
                plain
                @click="proxy.$emit('closeDialog')"
            >閉じる</el-button>
          </el-col>
        </el-row>
        <el-row v-if="isApproveOrAdmin">
          <el-container>
            <el-header style="align-content: center;margin-top: 2rem">
              <el-row>
                <el-col :span="24">
                  <el-divider border-style="dashed" />
                  <el-text class="mx-1 header-font" size="large" tag="p" style="text-align: center;color: black;">参考エリア</el-text>
                </el-col>
              </el-row>
            </el-header>
            <el-main style="align-content: center">
              <el-row :gutter="20" justify="center" class="row">
                <el-col :span="8" :offset="3">
                  <el-text class="mx-1" size="large">新バージョン判定結果：<dict-tag style="display: inline-block" :options="risk_level" :value="judgmentPdfData.judgmentResult.newJudgmentResult"/></el-text>
                </el-col>
                <el-col :span="8">
                  <el-text class="mx-1" size="large">新バージョンMMSE予測値：{{judgmentPdfData.judgmentResult.newMmse}}</el-text>
                </el-col>
              </el-row>
              <el-row :gutter="20" justify="center" class="row">
                <el-col :span="8" :offset="3">
                  <el-text class="mx-1" size="large">旧バージョン判定結果：<dict-tag style="display: inline-block" :options="risk_level" :value="judgmentPdfData.judgmentResult.oldJudgmentResult"/></el-text>
                </el-col>
                <el-col :span="8">
                  <el-text class="mx-1" size="large">旧バージョンMMSE予測値：{{judgmentPdfData.judgmentResult.oldMmse}}</el-text>
                </el-col>
              </el-row>
              <el-row :gutter="20" justify="center" class="row">
                <el-col :span="4" :offset="3">
                  <el-text class="mx-1" size="large">健診者ID：{{judgmentPdfData.physicalExaminationData.name}}</el-text>
                </el-col>
                <el-col :span="4">
                  <el-text class="mx-1" size="large">年齢：{{judgmentPdfData.physicalExaminationData.age}}</el-text>
                </el-col>
                <el-col :span="4">
                  <el-text class="mx-1" size="large">生年月日：{{ parseTime(judgmentPdfData.physicalExaminationData.birthday, '{y}-{m}-{d}') }}</el-text>
                </el-col>
                <el-col :span="4">
                  <el-text class="mx-1" size="large">診断日：{{ parseTime(judgmentPdfData.physicalExaminationData.examday, '{y}-{m}-{d}') }}</el-text>
                </el-col>
              </el-row>
              <el-row :gutter="20" justify="center" class="row">
                <el-col :span="4" :offset="3">
                  <el-text class="mx-1" size="large">性別：{{ judgmentPdfData.physicalExaminationData.sex === 0 ? '男' : '女' }}</el-text>
                </el-col>
                <el-col :span="4">
                  <el-text class="mx-1" size="large" v-if="judgmentPdfData.physicalExaminationData.height != null">身長：{{judgmentPdfData.physicalExaminationData.height}}CM</el-text>
                  <el-text class="mx-1" size="large" v-else>身長：{{judgmentPdfData.physicalExaminationData.height}}</el-text>
                </el-col>
                <el-col :span="4">
                  <el-text class="mx-1" size="large" v-if="judgmentPdfData.physicalExaminationData.weight != null">体重：{{judgmentPdfData.physicalExaminationData.weight}}KG</el-text>
                  <el-text class="mx-1" size="large" v-else>体重：{{judgmentPdfData.physicalExaminationData.weight}}</el-text>
                </el-col>
                <el-col :span="4"></el-col>
              </el-row>
              <el-row :gutter="20" justify="center" class="row">
                <el-col :span="16" :offset="3">
                  <el-text class="mx-1" size="large">
                    <el-row>
                      <el-col :span="3">疾患名：</el-col>
                      <el-col :span="22">{{judgmentPdfData.physicalExaminationData.diseaseName}}</el-col>
                    </el-row>
                  </el-text>
                </el-col>
              </el-row>
              <el-row :gutter="20" justify="center" class="row">
                <el-col :span="16" :offset="3">
                  <el-text class="mx-1" size="large">
                    <el-row>
                      <el-col :span="3">投薬内容：</el-col>
                      <el-col :span="22">{{judgmentPdfData.physicalExaminationData.medicalAdvice}}</el-col>
                    </el-row>
                  </el-text>
                </el-col>
              </el-row>
              <el-row :gutter="20" justify="center" class="row">
                <el-col :span="18" :offset="3">
                  <el-table :data="tableData" style="width: 100%" :border="true" :show-overflow-tooltip="true">
                    <el-table-column prop="item" label="項目" />
                    <el-table-column prop="result" label="結果">
                      <template #default="scope">
                        <span :style="{color:scope.row.color}">{{ scope.row.result }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column prop="unit" label="単位" />
                    <el-table-column prop="range" label="参照範囲" width="600">
                      <template #default="scope">
                        <span style="white-space: pre">{{ scope.row.range }}</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-col>
              </el-row>
            </el-main>
          </el-container>
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
  .out-of-range {
    color: red;
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