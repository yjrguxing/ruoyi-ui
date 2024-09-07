<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="120">
      <el-row :gutter="10">
        <el-col :span="11" :offset="1">
          <el-form-item label="施設名" prop="deptName">
            <el-input style="width:20vw"
                      v-model="queryParams.deptName"
                      clearable
                      @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="診断日">
            <el-date-picker
                v-model="daterangeExamday"
                value-format="YYYY/MM/DD"
                format="YYYY-MM-DD"
                type="daterange"
                start-placeholder="開始"
                end-placeholder="終了"
                range-separator="-"
                style="width: 20vw"
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="11" :offset="1">
          <el-form-item label="健診者ID" prop="name">
            <el-input style="width:20vw"
                      v-model="queryParams.name"
                      clearable
                      @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="ステータス" prop="approvedStatus" v-if="isApproveOrAdmin">
            <el-select v-model="queryParams.approvedStatus" clearable placeholder="" style="width:20vw">
              <el-option
                  v-for="dict in approved_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="11" :offset="1" v-if="!isApproveOrAdmin">
          <el-form-item label="リスク群" prop="riskLevel">
            <el-select v-model="queryParams.riskLevel" clearable style="width:20vw" placeholder="">
              <el-option
                  v-for="dict in risk_level"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="11" :offset="1" v-if="isApproveOrAdmin">
          <el-form-item label="承認待ち施設" prop="fileUploadHistoryId" >
            <el-select v-model="queryParams.fileUploadHistoryId" clearable style="width:20vw" placeholder="">
              <el-option
                  v-for="dict in deptList"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
            <el-button icon="Refresh" @click="resetQuery">リセット</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          :disabled="multiple || hasApproved"
          @click="handleApproved"
          v-hasPermi="['dementia-api:judgmentResult:approve']"
        >承認</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          :disabled="multiple || hasUnapproved"
          @click="handleDownload"
          v-hasPermi="['dementia-api:judgmentResult:download']"
        >ダウンロード</el-button>
      </el-col>
<!--      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>-->
    </el-row>

    <el-table v-loading="loading" :data="judgmentResultList" @selection-change="handleSelectionChange" max-height="47.5vh">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="施設名" header-align="center" align="center" prop="deptName" show-overflow-tooltip/>
      <el-table-column label="健診者ID" header-align="center" align="center" prop="name" show-overflow-tooltip/>
      <el-table-column label="診断日" header-align="center" align="center" prop="examday" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.examday, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="リスク群" header-align="center" align="center" prop="riskLevel">
        <template #default="scope">
          <dict-tag :options="risk_level" :value="scope.row.riskLevel"/>
        </template>
      </el-table-column>
      <el-table-column label="判定結果レポート" header-align="center" align="center" prop="" show-overflow-tooltip>
        <template #default="scope">
          <el-link type="primary" @click="navigateToDetail(scope.row)">
            {{scope.row.deptName}}_{{scope.row.name}}_{{ parseTime(scope.row.examday, '{y}{m}{d}') }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="ステータス" header-align="center" align="center" prop="approvedStatus" v-if="proxy.$auth.hasRole('approve_user')">
        <template #default="scope">
          <dict-tag :options="approved_status" :value="scope.row.approvedStatus"/>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
    <el-dialog v-model="dialogPDF" destroy-on-close :fullscreen="true" @close="dataRefresh">
      <pdf :judgment-result-id="judgmentResultId" @close-dialog="dialogPDF = false"/>
    </el-dialog>
  </div>
</template>

<script setup name="JudgmentResult">
import { listJudgmentResult, deptlist, batchDownloadPDF, checkData} from "@/api/dementia-api/judgmentResult";
import pdf from "./judgment-pdf.vue"
import useUserStore from "@/store/modules/user.js";
import {batchApproved} from "../../../api/dementia-api/judgmentResult.js";


onActivated(()=>{
  getDeptList();
})

const getDeptList = () => {
  if (proxy.$auth.hasRole("approve_user")) {
    deptlist().then(response => {
      deptList.value = response;
    });
  }
}

const { proxy } = getCurrentInstance();
const { approved_status, risk_level } = proxy.useDict('approved_status', 'risk_level');

const deptList = ref([])
const judgmentResultList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const hasUnapproved = ref(true)
const hasApproved = ref(true)
const total = ref(0);
const title = ref("");
const daterangeExamday = ref([]);
let changeFlag = ref(false)
const isApproveOrAdmin = proxy.$auth.hasRoleOr(["approve_user","admin"]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    deptName: null,
    name: null,
    riskLevel: null,
    approvedStatus: null,
    fileUploadHistoryId: null,
    beginExamday: null,
    endExamday: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

function dataRefresh(){
  getList();
  getDeptList();
}

/** クエリ判定結果リスト */
function getList() {
  loading.value = true;
  if (null != daterangeExamday && '' != daterangeExamday) {
    queryParams.value.beginExamday = daterangeExamday.value[0];
    queryParams.value.endExamday = daterangeExamday.value[1];
  }
  listJudgmentResult(queryParams.value).then(response => {
    judgmentResultList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 検索ボタンアクション */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** ボタン操作をリセット */
function resetQuery() {
  daterangeExamday.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 複数選択ボックスによるデータの選択
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.judgmentResultId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
  hasUnapproved.value = selection.some(item => item.approvedStatus !== 1)
  hasApproved.value = selection.some(item => item.approvedStatus !== 0)
}

getList();

const dialogPDF = ref(false)
const judgmentResultId = ref()
function navigateToDetail(row){
  checkData([row.judgmentResultId]).then(function (res) {
    if(res.code === 200){
      dialogPDF.value = true;
      judgmentResultId.value = row.judgmentResultId;
    }
  })
}

function handleApproved(){
  proxy.$modal.confirm(proxy.message.phyexam.PhyExam_E0006)
      .then(()=>{
        loading.value = true
        checkData(ids.value).then(function (res) {
          if(res.code === 200){
            batchApproved(ids.value).then(function (res){
              if(res.code === 200){
                proxy.$modal.msgSuccess("操作が成功しました");
                getList()
                getDeptList()
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

function handleDownload(){
  loading.value = true
  checkData(ids.value).then(function (res) {
    if(res.code === 200){
      let userName = useUserStore().name
      const idsString = ids.value.join(',');
      batchDownloadPDF(idsString,userName)
    }
  })
  loading.value = false
}
</script>
