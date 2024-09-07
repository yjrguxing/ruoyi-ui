<template>
  <div class="app-container">
<!--    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">-->
<!--      <el-form-item label="患者名" prop="name">-->
<!--        <el-input-->
<!--          v-model="queryParams.name"-->
<!--          placeholder="患者名を入力してください"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="診断日" prop="examday">-->
<!--        <el-date-picker clearable-->
<!--          v-model="queryParams.examday"-->
<!--          type="date"-->
<!--          value-format="YYYY-MM-DD"-->
<!--          placeholder="診断日を入力してください">-->
<!--        </el-date-picker>-->
<!--      </el-form-item>-->
<!--      <el-form-item label="Score;&gt;=27 A 24-26 B &lt;24 C" prop="score">-->
<!--        <el-input-->
<!--          v-model="queryParams.score"-->
<!--          placeholder="Scoreを入力してください;&gt;=27 A 24-26 B &lt;24 C"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item>-->
<!--        <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>-->
<!--        <el-button icon="Refresh" @click="resetQuery">リセット</el-button>-->
<!--      </el-form-item>-->
<!--    </el-form>-->

    <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px" style="margin-left: 25px;">
      <el-form-item label="リスク群" prop="score">
        <el-input
            v-model="queryParams.score"
            placeholder="リスク群を入力してください"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item v-if="isAdmin" label="施設名" prop="deptName" style="margin-right: 70px;">
        <el-input
            v-model="queryParams.deptName"
            placeholder="施設名を入力してください"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item v-if="isAdmin" label="アップロード者" prop="doctorName" style="white-space: nowrap">
        <el-input
            v-model="queryParams.doctorName"
            placeholder="アップロード者/番号を入力してください"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
        <el-button icon="Refresh" @click="resetQuery">リセット</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Finished"
            :disabled="multiple"
            @click="handlePatientDiagnosis"
        >検査</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            v-if="isApproved"
            :disabled="multiple"
            @click="handleApproved"
        >許可</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            v-if="isApproved"
            :disabled="multiple"
            @click="handleUnApproved"
        >拒否</el-button>
      </el-col>
      <el-col :span="6">
        <el-button
            type="primary"
            plain
            :disabled="multiple"
            @click="handleDownload"
        >ダウンロード</el-button>
      </el-col>

      <right-toolbar v-model:showSearch="showSearch" :search="false" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="patientList" @selection-change="handleSelectionChange">
      <!---->
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="No." align="center" type="index" :index="indexMethod" />
      <el-table-column label="名前" align="center" prop="name">
        <template #default="scope">
          <el-link v-if="isAdmin" type="primary" @click="navigateToDetail(scope.row)">
            {{scope.row.name}}_{{scope.row.deptName}}_{{ parseTime(scope.row.examday, '{y}-{m}-{d}') }}
          </el-link>
          <el-link v-if="!isAdmin" type="primary" @click="navigateToDetail(scope.row)">
            {{scope.row.name}}_{{ parseTime(scope.row.examday, '{y}-{m}-{d}') }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="リスク群" align="center" prop="score">
        <template #default="scope">
          <span>{{ !scope.row.score ? "診断されていません" : scope.row.score}}</span>
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

    <el-dialog v-model="dialogPDF" destroy-on-close :fullscreen="true">
<!--      <div style="height:500px; overflow: auto">-->
        <pdf :patient-id="patientId" @close-dialog="dialogPDF = false"/>
<!--      </div>-->
    </el-dialog>
  </div>
</template>

<script setup name="PatientDiagnosis">
import {
  listPatient,
  getPatient,
  delPatient,
  addPatient,
  updatePatient,
  uploadFile,
  listApprovedPatient,
  patientDiagnosis, patientDiagnosisById, diagnosisStateCheck
} from "@/api/dementia-api/patient";
import useUserStore from "@/store/modules/user.js";
import {Approved, batchApproved, batchDownloadPDF} from "@/api/dementia-api/patient-diagnosis.js";
import {parseTime} from "@/utils/ruoyi.js";
import pdf from "./patient-pdf.vue"

const { proxy } = getCurrentInstance();
const isAdmin = ref(useUserStore().roles == "admin")
const isApproved = ref(useUserStore().roles == "admin" || useUserStore().roles == "approved")

const patientList = ref([]);
const open = ref(false);
const loading = ref(true);
// const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const dialogPDF = ref(false)
const patientId = ref()
const selectRow = ref()

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 患者情報リスト */
function getList() {
  loading.value = true;
  if(isAdmin.value){
    listPatient(queryParams.value).then(response => {
      patientList.value = response.rows;
      total.value = response.total;
      loading.value = false;
    });
  }else{
    queryParams.value.createdUser = useUserStore().id
    listApprovedPatient(queryParams.value).then(response => {
      patientList.value = response.rows;
      total.value = response.total;
      loading.value = false;
    });
  }
}

// Formリセット
function reset() {
  form.value = {
  };
  proxy.resetForm("patientRef");
}

/** 検索ボタン操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** リセットボタン操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 複数選択ボックス選択データ
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/** 新規ボタン操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "追加患者情報";
}

/** 修正ボタン操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getPatient(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "患者情報修正";
  });
}

/** commitボタン */
function submitForm() {
  proxy.$refs["patientRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePatient(form.value).then(response => {
          proxy.$modal.msgSuccess("変更に成功しました。");
          open.value = false;
          getList();
        });
      } else {
        addPatient(form.value).then(response => {
          proxy.$modal.msgSuccess("新規追加に成功しました");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 削除ボタン操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('患者情報削除番号が"' + _ids + '"のデータ項目であることを確認しますか？').then(function() {
    return delPatient(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除に成功しました");
  }).catch(() => {});
}

/** エクスポートボタン操作 */
function handleExport() {
  proxy.download('dementia-api/patient/export', {
    ...queryParams.value
  }, `patient_${new Date().getTime()}.xlsx`)
}

function fileUpload(option){
  uploadFile(option).then(function (res){
    if(res.code === 200){
      getList();
      proxy.$modal.msgSuccess("インポート成功しました");
    }
  })
}
function indexMethod(index){
  return index + 1
}

function navigateToDetail(row){
  dialogPDF.value = true;
  patientId.value = row.id;
}

function handlePatientDiagnosis(){
  if(ids.value.length){
    diagnosisStateCheck(ids.value).then(function (res){
      if(res.code === 200){
        proxy.$modal.msgSuccess("検査が始まりました。日時かかりますので、しばらくお待ちください。");
        getList();

        patientDiagnosisById(ids.value).then(function (res){
          if(res.code === 200){
            ElNotification({
              title: '検査',
              message: '患者の検査が完了しました',
              type: 'success',
            })
            getList();
          }else{
            proxy.$modal.msgError("検査中のデータがあるので、もう一度選択してください！");
          }
        })
      }else{
        proxy.$modal.msgWarning("");
      }
    })
  }else{
    patientDiagnosis().then(function (res){
      if(res.code === 200){
        proxy.$modal.msgSuccess("患者の検査が完了しました");
        getList();
      }else{
        proxy.$modal.msgWarning("検査サーバーがビジー状態です。後でもう一度お試しください。");
      }
    })
  }
}

function handleApproved(){
  loading.value = true
  batchApproved(ids.value,1).then(function (res){
    if(res.code === 200){
      proxy.$modal.msgSuccess("操作が成功しました");
      getList()
    }else{
      proxy.$modal.msgError("操作に失敗しました");
    }
    loading.value = false
  })
}

function handleUnApproved(){
  loading.value = true
  Approved(ids.value,0).then(function (res){
    if(res.code === 200){
      proxy.$modal.msgSuccess("操作が成功しました");
      getList()
    }else{
      proxy.$modal.msgError("操作に失敗しました");
    }
    loading.value = false
  })
}

function handleDownload(){
  loading.value = true
  var userName = useUserStore().name
  const idsString = ids.value.join(',');
  batchDownloadPDF(idsString,userName)
  loading.value = false
}

getList();
</script>
