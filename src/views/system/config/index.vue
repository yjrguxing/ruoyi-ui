<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="パラメータ名" prop="configName">
            <el-input
               v-model="queryParams.configName"
               placeholder="パラメータ名を入力してください"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="パラメータキー名" prop="configKey">
            <el-input
               v-model="queryParams.configKey"
               placeholder="パラメータキー名を入力してください"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="システムビルトイン " prop="configType">
            <el-select v-model="queryParams.configType" placeholder="システムビルトイン " clearable>
               <el-option
                  v-for="dict in sys_yes_no"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="作成日時" style="width: 308px;">
            <el-date-picker
               v-model="dateRange"
               value-format="YYYY-MM-DD"
               type="daterange"
               range-separator="-"
               start-placeholder="開始日付"
               end-placeholder="終了日付"
            ></el-date-picker>
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
               v-hasPermi="['system:config:add']"
            >新規作成</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['system:config:edit']"
            >変更</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['system:config:remove']"
            >削除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['system:config:export']"
            >エクスポート</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Refresh"
               @click="handleRefreshCache"
               v-hasPermi="['system:config:remove']"
            >キャッシュのリフレッシュ</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="パラメータ主キー" align="center" prop="configId" />
         <el-table-column label="パラメータ名" align="center" prop="configName" :show-overflow-tooltip="true" />
         <el-table-column label="パラメータキー名" align="center" prop="configKey" :show-overflow-tooltip="true" />
         <el-table-column label="パラメータキー値" align="center" prop="configValue" :show-overflow-tooltip="true" />
         <el-table-column label="システムビルトイン " align="center" prop="configType">
            <template #default="scope">
               <dict-tag :options="sys_yes_no" :value="scope.row.configType" />
            </template>
         </el-table-column>
         <el-table-column label="備考" align="center" prop="remark" :show-overflow-tooltip="true" />
         <el-table-column label="作成日時" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:config:edit']" >変更</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:config:remove']">削除</el-button>
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

      <!-- 追加または修正パラメータ -->
      <el-dialog :title="title" v-model="open" width="500px" append-to-body>
         <el-form ref="configRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="パラメータ名" prop="configName">
               <el-input v-model="form.configName" placeholder="パラメータ名を入力してください" />
            </el-form-item>
            <el-form-item label="パラメータキー名" prop="configKey">
               <el-input v-model="form.configKey" placeholder="パラメータキー名を入力してください" />
            </el-form-item>
            <el-form-item label="パラメータキー値" prop="configValue">
               <el-input v-model="form.configValue" placeholder="パラメータキー値を入力してください" />
            </el-form-item>
            <el-form-item label="システムビルトイン " prop="configType">
               <el-radio-group v-model="form.configType">
                  <el-radio
                     v-for="dict in sys_yes_no"
                     :key="dict.value"
                     :label="dict.value"
                  >{{ dict.label }}</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="備考" prop="remark">
               <el-input v-model="form.remark" type="textarea" placeholder="内容を入力してください" />
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">確 定</el-button>
               <el-button @click="cancel">キャンセル</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Config">
import { listConfig, getConfig, delConfig, addConfig, updateConfig, refreshCache } from "@/api/system/config";

const { proxy } = getCurrentInstance();
const { sys_yes_no } = proxy.useDict("sys_yes_no");

const configList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configName: undefined,
    configKey: undefined,
    configType: undefined
  },
  rules: {
    configName: [{ required: true, message: "パラメータ名のご入力は必須です。", trigger: "blur" }],
    configKey: [{ required: true, message: "パラメータキー名のご入力は必須です。", trigger: "blur" }],
    configValue: [{ required: true, message: "パラメータキー値のご入力は必須です。", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** パラメータリスト */
function getList() {
  loading.value = true;
  listConfig(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    configList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 取消ボタン */
function cancel() {
  open.value = false;
  reset();
}
/** Formリセット */
function reset() {
  form.value = {
    configId: undefined,
    configName: undefined,
    configKey: undefined,
    configValue: undefined,
    configType: "Y",
    remark: undefined
  };
  proxy.resetForm("configRef");
}
/** 検索ボタン操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** リセットボタン操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}
/** 複数選択ボックス選択データ */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.configId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 新規ボタン操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "パラメータの追加";
}
/** 修正ボタン操作 */
function handleUpdate(row) {
  reset();
  const configId = row.configId || ids.value;
  getConfig(configId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "パラメータの変更";
  });
}
/** commitボタン */
function submitForm() {
  proxy.$refs["configRef"].validate(valid => {
    if (valid) {
      if (form.value.configId != undefined) {
        updateConfig(form.value).then(response => {
          proxy.$modal.msgSuccess("変更に成功しました。");
          open.value = false;
          getList();
        });
      } else {
        addConfig(form.value).then(response => {
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
  const configIds = row.configId || ids.value;
  proxy.$modal.confirm('パラメータ番号が「' + configIds + '」のデータ項目を削除しますか。').then(function () {
    return delConfig(configIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除に成功しました");
  }).catch(() => {});
}
/** エクスポートボタン操作 */
function handleExport() {
  proxy.download("system/config/export", {
    ...queryParams.value
  }, `config_${new Date().getTime()}.xlsx`);
}
/** リフレッシュキャッシュボタン操作 */
function handleRefreshCache() {
  refreshCache().then(() => {
    proxy.$modal.msgSuccess("キャッシュのリフレッシュに成功しました");
  });
}

getList();
</script>
