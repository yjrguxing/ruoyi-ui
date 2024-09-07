<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="150px">
      <el-row :span="24" :gutter="10">
        <el-col :span="11" :offset="1">
          <el-form-item label="施設名" prop="deptName">
            <el-input
                v-model="queryParams.deptName"
                placeholder=""
                clearable
                @keyup.enter="handleQuery"
                style="width: 20vw"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="アップロードユーザ" prop="nickName" >
            <el-input
                v-model="queryParams.nickName"
                placeholder=""
                clearable
                @keyup.enter="handleQuery"
                style="width: 20vw"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :span="24" :gutter="10">
        <el-col :span="11" :offset="1">
          <el-form-item label="健診者ID " prop="name">
            <el-input
                v-model="queryParams.name"
                placeholder=""
                clearable
                @keyup.enter="handleQuery"
                style="width: 20vw"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="アップロード時間">
            <el-date-picker
              v-model="daterangeCreatedTime"
              value-format="YYYY-MM-DD"
              type="daterange"
              range-separator="-"
              start-placeholder="開始"
              end-placeholder="終了"
              style="width: 20vw"
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :span="24" :gutter="10">
        <el-col :span="11" :offset="1">
          <el-form-item label="診断日">
            <el-date-picker
                v-model="daterangeExamday"
                value-format="YYYY-MM-DD"
                type="daterange"
                range-separator="-"
                start-placeholder="開始"
                end-placeholder="終了"
                style="width: 20vw"
            ></el-date-picker>
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

    <el-row :gutter="10" class="mb8" v-hasRole="['general_user']">
      <el-col :span="1.5">
        <el-upload
            v-model:file-list="fileList"
            class="upload-demo"
            :headers="{'Content-Type': 'multipart/form-data'}"
            :limit="1"
            :show-file-list="false"
            :http-request="fileUpload"
            action="/dementia-api/physicalExaminationData/upload"
            :accept=filecheck
        >
          <el-button
              type="primary"
              plain
              icon="Plus"
              v-hasPermi="['dementia-api:physicalExaminationData:add']"
          >アップロード</el-button>
        </el-upload>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['dementia-api:physicalExaminationData:remove']"
        >削除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-link
            :underline="false"
            type="primary"
            style="height: 100%;text-decoration: rgb(121, 187, 255) underline;text-underline-offset:0.4vw;"
            @click="TemplateDownload">
          テンプレートダウンロード</el-link>
      </el-col>
<!--      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>-->
    </el-row>

    <el-table v-loading="loading" :data="physicalExaminationDataList" @selection-change="handleSelectionChange" scrollbar-always-on max-height="463">
      <el-table-column v-hasRole="['general_user']" header-align="center" type="selection" width="55" align="center" />
      <el-table-column header-align="center" label="施設名" align="center" prop="deptName" width="200"/>
      <el-table-column header-align="center" label="健診者ID" align="center" prop="name" width="180" show-overflow-tooltip/>
      <el-table-column header-align="center" label="年齢" align="center" prop="age" width="100"/>
      <el-table-column header-align="center" label="生年月日" align="center" prop="birthday" width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.birthday, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column header-align="center" label="診断日" align="center" prop="examday" width="110">
        <template #default="scope">
          <span>{{ parseTime(scope.row.examday, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column header-align="center" label="性別" align="center" prop="sex" width="100">
        <template #default="scope">
          <span>{{ scope.row.sex === 0 ? '男' : '女' }}</span>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="height"  width="100">
        <template #header="scope">
          <div>身長</div>
          <div>（cm）</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="weight"  width="100">
        <template #header="scope">
          <div>体重</div>
          <div>（kg）</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" label="BMI" align="center" prop="bmi"  width="100"/>
      <el-table-column header-align="center" align="center" prop="dp" width="100">
        <template #header="scope">
          <div>拡張期血圧</div>
          <div>（mmHg）</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="sp" width="100">
        <template #header="scope">
          <div>収縮期血圧</div>
          <div>（mmHg）</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="wbc" width="100">
        <template #header="scope">
          <div>白血球数</div>
          <div>(10²/㎜³)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="rbc" width="100">
        <template #header="scope">
          <div>赤血球数</div>
          <div>(10⁴/㎜³)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="ht" width="150">
        <template #header="scope">
          <div>ヘマトクリット</div>
          <div>(%)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="hb" width="150">
        <template #header="scope">
          <div>ヘモグロビン</div>
          <div>(g/dL)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="plt" width="100">
        <template #header="scope">
          <div>血小板数</div>
          <div>(10⁴/㎜³)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="ast" width="100">
        <template #header="scope">
          <div>AST(GOT)</div>
          <div>(U/L)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="alt" width="100">
        <template #header="scope">
          <div>ALT(GPT)</div>
          <div>(U/L)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="rGt" width="100">
        <template #header="scope">
          <div>γ-GTP</div>
          <div>(IU/L)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="tg" width="150">
        <template #header="scope">
          <div>トリグリセリド</div>
          <div>(mg/dL)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="hdlCho" width="160">
        <template #header="scope">
          <div>HDLコレステロール</div>
          <div>(mg/dL)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="ldlCho" width="150">
        <template #header="scope">
          <div>LDLコレステロール</div>
          <div>(mg/dL)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="glu" width="100">
        <template #header="scope">
          <div>グルコース</div>
          <div>(mg/dL)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="hba1c" width="100">
        <template #header="scope">
          <div>HbA1C</div>
          <div>(%)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="cr" width="150">
        <template #header="scope">
          <div>クレアチニン</div>
          <div>(mg/dL)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="ua" width="100">
        <template #header="scope">
          <div>尿酸</div>
          <div>(mg/dL)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="bun" width="100">
        <template #header="scope">
          <div>BUN</div>
          <div>(mg/dL)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="tp" width="100">
        <template #header="scope">
          <div>総タンパク</div>
          <div>(g/dL)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="alb" width="100">
        <template #header="scope">
          <div>アルブミン</div>
          <div>(g/dL)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" label="Ａ／Ｇ比" align="center" prop="ag" width="100"/>
      <el-table-column header-align="center" align="center" prop="na" width="100">
        <template #header="scope">
          <div>Ｎａ</div>
          <div>(mEq/L)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" align="center" prop="k" width="100">
        <template #header="scope">
          <div>Ｋ</div>
          <div>(mEq/L)</div>
        </template>
      </el-table-column>>
      <el-table-column header-align="center" align="center" prop="cl" width="100">
        <template #header="scope">
          <div>Ｃｌ</div>
          <div>(mEq/L)</div>
        </template>
      </el-table-column>>
      <el-table-column header-align="center" label="CRP" align="center" prop="crp" width="100"/>
      <el-table-column header-align="center" align="center" prop="mcv" width="100">
        <template #header="scope">
          <div>MCV</div>
          <div>(fL)</div>
        </template>
      </el-table-column>
      <el-table-column header-align="center" label="MMSE" align="center" prop="mmse" width="100"/>
      <el-table-column header-align="center" label="アップロードユーザ" align="center" prop="nickName" width="170" show-overflow-tooltip/>
      <el-table-column header-align="center" label="アップロード時間" align="center" prop="createdTime" width="200" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column header-align="center" label="ファイル名" align="center" prop="fileName" width="300" show-overflow-tooltip/>
      <el-table-column header-align="center" label="操作" align="center" class-name="small-padding fixed-width" v-hasRole="['general_user']">
        <template #default="scope">
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['dementia-api:physicalExaminationData:remove']">削除</el-button>
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

    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="physicalExaminationDataRef" :model="form" :rules="rules" label-width="80px">
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PhysicalExaminationData">
import { listPhysicalExaminationData,
  getPhysicalExaminationData,
  delPhysicalExaminationData,
  addPhysicalExaminationData,
  updatePhysicalExaminationData,
  csvTemplateDownload,
  uploadFile } from "@/api/dementia-api/physicalExaminationData";

const { proxy } = getCurrentInstance();

const physicalExaminationDataList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeExamday = ref([]);
const daterangeCreatedTime = ref([]);
const fileList = ref([]);
const filecheck = ref([".csv"])
const trueFileCheck = ref([".csv",".xlsx",".xls"])
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    deptId: null,
    deptName: null,
    name: null,
    examday: null,
    createdTime: null,
    createdUser: null,
    nickName: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeExamday.value && '' != daterangeExamday.value) {
    queryParams.value.params["beginExamday"] = daterangeExamday.value[0];
    queryParams.value.params["endExamday"] = daterangeExamday.value[1];
  }
  if (null != daterangeCreatedTime.value && '' != daterangeCreatedTime.value) {
    queryParams.value.params["beginCreatedTime"] = daterangeCreatedTime.value[0];
    queryParams.value.params["endCreatedTime"] = daterangeCreatedTime.value[1];
  }
  listPhysicalExaminationData(queryParams.value).then(response => {
    physicalExaminationDataList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    physicalExaminationId: null,
    deptId: null,
    name: null,
    age: null,
    birthday: null,
    examday: null,
    sex: null,
    height: null,
    weight: null,
    bmi: null,
    dp: null,
    sp: null,
    wbc: null,
    rbc: null,
    ht: null,
    hb: null,
    plt: null,
    ast: null,
    alt: null,
    rGt: null,
    tg: null,
    hdlCho: null,
    ldlCho: null,
    glu: null,
    hba1c: null,
    cr: null,
    ua: null,
    bun: null,
    tp: null,
    alb: null,
    ag: null,
    na: null,
    k: null,
    cl: null,
    crp: null,
    mmse: null,
    fileUploadHistoryId: null,
    updatedTime: null,
    updatedUser: null,
    createdTime: null,
    createdUser: null
  };
  proxy.resetForm("physicalExaminationDataRef");
}


function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}


function resetQuery() {
  daterangeExamday.value = [];
  daterangeCreatedTime.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}


function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.physicalExaminationId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}



function submitForm() {
  proxy.$refs["physicalExaminationDataRef"].validate(valid => {
    if (valid) {
      if (form.value.physicalExaminationId != null) {
        updatePhysicalExaminationData(form.value).then(response => {
          proxy.$modal.msgSuccess("変更に成功しました。");
          open.value = false;
          getList();
        });
      } else {
        addPhysicalExaminationData(form.value).then(response => {
          proxy.$modal.msgSuccess("新規追加に成功しました");
          open.value = false;
          getList();
        });
      }
    }
  });
}


function handleDelete(row) {
  const _physicalExaminationIds = row.physicalExaminationId || ids.value;
  proxy.$modal.confirm('選択したレコードを削除してよろしいですか。').then(function() {
    return delPhysicalExaminationData(_physicalExaminationIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除に成功しました");
  }).catch(() => {});
}

function TemplateDownload(){
  return csvTemplateDownload();
}

function fileUpload(option){
  if(fileCheck(option.file.name)){
    uploadFile(option).then(function (res){
      if(res.code === 200){
        proxy.$modal.msgSuccess(res.msg);
      }
      fileList.value = []
      getList();
    }).catch(function (res){
      fileList.value = []
    })
  }else{
    fileList.value = []
    proxy.$modal.msgError(proxy.message.common.Common_E0011.replace("{0}", "csv"));
  }
}

function fileCheck(fileName){
  return !!((fileName && trueFileCheck.value.includes("." + fileName.split('.').pop())));

}

getList();
</script>
