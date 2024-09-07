<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="タスク名" prop="jobName">
            <el-input
               v-model="queryParams.jobName"
               clearable
               style="width: 230px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="タスクグループ名" prop="jobGroup">
            <el-select v-model="queryParams.jobGroup" placeholder="" clearable style="width: 230px">
               <el-option
                  v-for="dict in sys_job_group"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="タスクステータス" prop="status">
            <el-select v-model="queryParams.status" placeholder="" clearable style="width: 230px">
               <el-option
                  v-for="dict in sys_job_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
            <el-button icon="Refresh" @click="resetQuery">リセット</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['monitor:job:add']"
            >新規作成</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['monitor:job:edit']"
            >変更</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['monitor:job:remove']"
            >削除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['monitor:job:export']"
            >エクスポート</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="info"
               plain
               icon="Operation"
               @click="handleJobLog"
               v-hasPermi="['monitor:job:query']"
            >ログ</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="jobList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="タスク番号" width="100" align="center" prop="jobId" />
         <el-table-column label="タスク名" align="center" prop="jobName" :show-overflow-tooltip="true" />
         <el-table-column label="タスクグループ名" align="center" prop="jobGroup">
            <template #default="scope">
               <dict-tag :options="sys_job_group" :value="scope.row.jobGroup" />
            </template>
         </el-table-column>
         <el-table-column label="呼び出しターゲットテキスト" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
         <el-table-column label="cron実行式" align="center" prop="cronExpression" :show-overflow-tooltip="true" />
         <el-table-column label="ステータス" align="center">
            <template #default="scope">
               <el-switch
                  v-model="scope.row.status"
                  active-value="0"
                  inactive-value="1"
                  @change="handleStatusChange(scope.row)"
               ></el-switch>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-tooltip content="変更" placement="top">
                  <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['monitor:job:edit']"></el-button>
               </el-tooltip>
               <el-tooltip content="削除" placement="top">
                  <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['monitor:job:remove']"></el-button>
               </el-tooltip>
               <el-tooltip content="1回実行" placement="top">
                  <el-button link type="primary" icon="CaretRight" @click="handleRun(scope.row)" v-hasPermi="['monitor:job:changeStatus']"></el-button>
               </el-tooltip>
               <el-tooltip content="タスクの詳細" placement="top">
                  <el-button link type="primary" icon="View" @click="handleView(scope.row)" v-hasPermi="['monitor:job:query']"></el-button>
               </el-tooltip>
               <el-tooltip content="スケジュールログ" placement="top">
                  <el-button link type="primary" icon="Operation" @click="handleJobLog(scope.row)" v-hasPermi="['monitor:job:query']"></el-button>
               </el-tooltip>
            </template>
         </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

      <!-- 追加または修正タイミングタスク -->
      <el-dialog :title="title" v-model="open" width="850px" append-to-body>
         <el-form ref="jobRef" :model="form" :rules="rules" label-width="166px">
            <el-row>
               <el-col :span="14">
                  <el-form-item label="タスク名" prop="jobName">
                     <el-input v-model="form.jobName" placeholder="タスク名を入力してください" />
                  </el-form-item>
               </el-col>
               <el-col :span="10" style="padding-left: 5px">
                  <el-form-item label="タスクのグループ化" prop="jobGroup">
                     <el-select v-model="form.jobGroup" placeholder="選択してください">
                        <el-option
                           v-for="dict in sys_job_group"
                           :key="dict.value"
                           :label="dict.label"
                           :value="dict.value"
                        ></el-option>
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item prop="invokeTarget">
                     <template #label>
                        <span>
                           メソッドの呼び出し
                           <el-tooltip placement="top">
                              <template #content>
                                 <div>
                                    Bean呼び出し：ryTask.ryParams（'ry'）
                                    <br />Class呼び出し：com.ruoyi.quartz.task.RyTask.ryParams('ry')
                                    <br />パラメータの説明：テキスト、ブル型、ローグ整数、浮動小数点型、整数型をセットします
                                 </div>
                              </template>
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                        </span>
                     </template>
                     <el-input v-model="form.invokeTarget" placeholder="呼び出し先のテキストを入力してください" />
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="cron式" prop="cronExpression">
                     <el-input v-model="form.cronExpression" placeholder="cron実行式を入力してください">
                        <template #append>
                           <el-button type="primary" @click="handleShowCron">
                              式
                              <i class="el-icon-time el-icon--right"></i>
                           </el-button>
                        </template>
                     </el-input>
                  </el-form-item>
               </el-col>
               <el-col :span="24" v-if="form.jobId !== undefined">
                  <el-form-item label="ステータス">
                     <el-radio-group v-model="form.status">
                        <el-radio
                           v-for="dict in sys_job_status"
                           :key="dict.value"
                           :label="dict.value"
                        >{{ dict.label }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="14">
                  <el-form-item label="戦略実行" prop="misfirePolicy">
                     <el-radio-group v-model="form.misfirePolicy">
                        <el-radio-button label="1">今すぐ実行</el-radio-button>
                        <el-radio-button label="2">1回実行</el-radio-button>
                        <el-radio-button label="3">実行破棄</el-radio-button>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="10" style="padding-left: 8px">
                  <el-form-item label="同時実行するかどうか" prop="concurrent">
                     <el-radio-group v-model="form.concurrent">
                        <el-radio-button label="0">許可</el-radio-button>
                        <el-radio-button label="1">禁止</el-radio-button>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">確 定</el-button>
               <el-button @click="cancel">キャンセル</el-button>
            </div>
         </template>
      </el-dialog>

     <el-dialog title="cron 式ジェネレーター" v-model="openCron" append-to-body destroy-on-close>
       <crontab ref="crontabRef" @hide="openCron=false" @fill="crontabFill" :expression="expression"></crontab>
     </el-dialog>

      <!-- タスクログ詳細 -->
      <el-dialog title="タスクの詳細" v-model="openView" width="755px" append-to-body>
         <el-form :model="form" label-width="210px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="タスク番号：">{{ form.jobId }}</el-form-item>
                  <el-form-item label="タスク名：">{{ form.jobName }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="タスクのグループ化：">{{ jobGroupFormat(form) }}</el-form-item>
                  <el-form-item label="作成日時：">{{ form.createTime }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="cron式：">{{ form.cronExpression }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="次の実行日時：">{{ parseTime(form.nextValidTime) }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="呼び出しターゲットメソッド：">{{ form.invokeTarget }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="タスクステータス：">
                     <div v-if="form.status == 0">正常</div>
                     <div v-else-if="form.status == 1">一時停止</div>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="同時実行するかどうか：">
                     <div v-if="form.concurrent == 0">許可</div>
                     <div v-else-if="form.concurrent == 1">禁止</div>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="戦略実行：">
                     <div v-if="form.misfirePolicy == 0">デフォルト戦略</div>
                     <div v-else-if="form.misfirePolicy == 1">今すぐ実行</div>
                     <div v-else-if="form.misfirePolicy == 2">1回実行</div>
                     <div v-else-if="form.misfirePolicy == 3">実行破棄</div>
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button @click="openView = false">閉じる</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Job">
import { listJob, getJob, delJob, addJob, updateJob, runJob, changeJobStatus } from "@/api/monitor/job";
import Crontab from '@/components/Crontab'
const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_job_group, sys_job_status } = proxy.useDict("sys_job_group", "sys_job_status");

const jobList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const openView = ref(false);
const openCron = ref(false);
const expression = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    jobName: undefined,
    jobGroup: undefined,
    status: undefined
  },
  rules: {
    jobName: [{ required: true, message: "タスク名のご入力は必須です。", trigger: "blur" }],
    invokeTarget: [{ required: true, message: "呼び出しターゲットテキストのご入力は必須です。", trigger: "blur" }],
    cronExpression: [{ required: true, message: "cron実行式のご入力は必須です。", trigger: "change" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** タイミングタスクリスト */
function getList() {
  loading.value = true;
  listJob(queryParams.value).then(response => {
    jobList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** タスクグループ名辞書 */
function jobGroupFormat(row, column) {
  return proxy.selectDictLabel(sys_job_group.value, row.jobGroup);
}
/** 取消ボタン */
function cancel() {
  open.value = false;
  reset();
}
/** Formリセット */
function reset() {
  form.value = {
    jobId: undefined,
    jobName: undefined,
    jobGroup: undefined,
    invokeTarget: undefined,
    cronExpression: undefined,
    misfirePolicy: 1,
    concurrent: 1,
    status: "0"
  };
  proxy.resetForm("jobRef");
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
  ids.value = selection.map(item => item.jobId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
// その他のアクショントリガ
function handleCommand(command, row) {
  switch (command) {
    case "handleRun":
      handleRun(row);
      break;
    case "handleView":
      handleView(row);
      break;
    case "handleJobLog":
      handleJobLog(row);
      break;
    default:
      break;
  }
}
// タスクステータス修正
function handleStatusChange(row) {
  let text = row.status === "0" ? "スタート" : "停止";
  proxy.$modal.confirm('"' + text + '""' + row.jobName + '"タスクを確認しますか?').then(function () {
    return changeJobStatus(row.jobId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
}
/* 即時実行一回 */
function handleRun(row) {
  proxy.$modal.confirm('"' + row.jobName + '"タスクを即時実行することを確認しますか？?').then(function () {
    return runJob(row.jobId, row.jobGroup);
  }).then(() => {
    proxy.$modal.msgSuccess("実行成功");})
  .catch(() => {});
}
/** タスク詳細情報 */
function handleView(row) {
  getJob(row.jobId).then(response => {
    form.value = response.data;
    openView.value = true;
  });
}
/** cron式ボタン操作 */
function handleShowCron() {
  expression.value = form.value.cronExpression;
  openCron.value = true;
}
/** ポストフィードバック値の決定 */
function crontabFill(value) {
  form.value.cronExpression = value;
}
/** タスクログリスト */
function handleJobLog(row) {
  const jobId = row.jobId || 0;
  router.push('/monitor/job-log/index/' + jobId)
}
/** 新規ボタン操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "タスクの追加";
}
/** 修正ボタン操作 */
function handleUpdate(row) {
  reset();
  const jobId = row.jobId || ids.value;
  getJob(jobId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "タスクの変更";
  });
}
/** commitボタン */
function submitForm() {
  proxy.$refs["jobRef"].validate(valid => {
    if (valid) {
      if (form.value.jobId != undefined) {
        updateJob(form.value).then(response => {
          proxy.$modal.msgSuccess("変更に成功しました。");
          open.value = false;
          getList();
        });
      } else {
        addJob(form.value).then(response => {
          proxy.$modal.msgSuccess("新規追加に成功しました");
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** ボタン操作削除 */
function handleDelete(row) {
  const jobIds = row.jobId || ids.value;
  proxy.$modal.confirm('スケジュールタスク番号が"' + jobIds + '"のデータ項目を削除しますか。').then(function () {
    return delJob(jobIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除に成功しました");
  }).catch(() => {});
}
/** エクスポートボタン操作 */
function handleExport() {
  proxy.download("monitor/job/export", {
    ...queryParams.value,
  }, `job_${new Date().getTime()}.xlsx`);
}

getList();
</script>

<style>
.custom-width-modal{
  width: 300px !important;
}
.el-message-box__content {
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>

