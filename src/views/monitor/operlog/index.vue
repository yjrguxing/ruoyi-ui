<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="操作アドレス" prop="operIp">
            <el-input
               v-model="queryParams.operIp"
               placeholder="操作アドレスを入力してください"
               clearable
               style="width: 240px;"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="システムモジュール" prop="title">
            <el-input
               v-model="queryParams.title"
               placeholder="システムモジュールを入力してください"
               clearable
               style="width: 240px;"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="操作員" prop="operName">
            <el-input
               v-model="queryParams.operName"
               placeholder="操作員を入力してください"
               clearable
               style="width: 240px;"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="タイプ" prop="businessType">
            <el-select
               v-model="queryParams.businessType"
               placeholder="操作タイプ"
               clearable
               style="width: 240px"
            >
               <el-option
                  v-for="dict in sys_oper_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="ステータス" prop="status">
            <el-select
               v-model="queryParams.status"
               placeholder="操作ステータス"
               clearable
               style="width: 240px"
            >
               <el-option
                  v-for="dict in sys_common_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="操作日時" style="width: 308px">
            <el-date-picker
               v-model="dateRange"
               value-format="YYYY-MM-DD HH:mm:ss"
               type="daterange"
               range-separator="-"
               start-placeholder="開始日付"
               end-placeholder="終了日付"
               :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
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
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['monitor:operlog:remove']"
            >削除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               @click="handleClean"
               v-hasPermi="['monitor:operlog:remove']"
            >クリア</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['monitor:operlog:export']"
            >エクスポート</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table ref="operlogRef" v-loading="loading" :data="operlogList" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
         <el-table-column type="selection" width="50" align="center" />
         <el-table-column label="ログ番号" align="center" prop="operId" />
         <el-table-column label="システムモジュール" align="center" prop="title" :show-overflow-tooltip="true" />
         <el-table-column label="操作タイプ" align="center" prop="businessType">
            <template #default="scope">
               <dict-tag :options="sys_oper_type" :value="scope.row.businessType" />
            </template>
         </el-table-column>
         <el-table-column label="操作員" align="center" width="110" prop="operName" :show-overflow-tooltip="true" sortable="custom" :sort-orders="['descending', 'ascending']" />
         <el-table-column label="操作アドレス" align="center" prop="operIp" width="130" :show-overflow-tooltip="true" />
         <el-table-column label="操作ステータス" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_common_status" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="操作日付" align="center" prop="operTime" width="180" sortable="custom" :sort-orders="['descending', 'ascending']">
            <template #default="scope">
               <span>{{ parseTime(scope.row.operTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="使う日時" align="center" prop="costTime" width="110" :show-overflow-tooltip="true" sortable="custom" :sort-orders="['descending', 'ascending']">
            <template #default="scope">
               <span>{{ scope.row.costTime }}ミリ秒</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="View" @click="handleView(scope.row, scope.index)" v-hasPermi="['monitor:operlog:query']">詳細</el-button>
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

      <!-- 操作ログの詳細 -->
      <el-dialog title="操作ログの詳細" v-model="open" width="800px" append-to-body>
         <el-form :model="form" label-width="100px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="オペレーションモジュール：">{{ form.title }} / {{ typeFormat(form) }}</el-form-item>
                  <el-form-item
                    label="ログイン情報："
                  >{{ form.operName }} / {{ form.operIp }} / {{ form.operLocation }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="リクエストアドレス：">{{ form.operUrl }}</el-form-item>
                  <el-form-item label="リクエスト方法：">{{ form.requestMethod }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="リクエストパラメータ：">{{ form.operParam }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="パラメータを返す：">{{ form.jsonResult }}</el-form-item>
               </el-col>
               <el-col :span="8">
                  <el-form-item label="操作ステータス：">
                     <div v-if="form.status === 0">正常</div>
                     <div v-else-if="form.status === 1">失敗</div>
                  </el-form-item>
               </el-col>
               <el-col :span="8">
                  <el-form-item label="使う日時：">{{ form.costTime }}ミリ秒</el-form-item>
               </el-col>
               <el-col :span="8">
                  <el-form-item label="操作日時：">{{ parseTime(form.operTime) }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="異常情報：" v-if="form.status === 1">{{ form.errorMsg }}</el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button @click="open = false">閉じる</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Operlog">
import { list, delOperlog, cleanOperlog } from "@/api/monitor/operlog";

const { proxy } = getCurrentInstance();
const { sys_oper_type, sys_common_status } = proxy.useDict("sys_oper_type","sys_common_status");

const operlogList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const defaultSort = ref({ prop: "operTime", order: "descending" });

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    operIp: undefined,
    title: undefined,
    operName: undefined,
    businessType: undefined,
    status: undefined
  }
});

const { queryParams, form } = toRefs(data);

/** 登録ログ */
function getList() {
  loading.value = true;
  list(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    operlogList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 操作ログタイプ辞書 */
function typeFormat(row, column) {
  return proxy.selectDictLabel(sys_oper_type.value, row.businessType);
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
  queryParams.value.pageNum = 1;
  proxy.$refs["operlogRef"].sort(defaultSort.value.prop, defaultSort.value.order);
}
/** 複数選択ボックス選択データ */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.operId);
  multiple.value = !selection.length;
}
/** ソケットトリガイベント */
function handleSortChange(column, prop, order) {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order;
  getList();
}
/** 詳細ボタン操作 */
function handleView(row) {
  open.value = true;
  form.value = row;
}
/** 削除ボタン操作 */
function handleDelete(row) {
  const operIds = row.operId || ids.value;
  proxy.$modal.confirm('ログ番号が"' + operIds + '"のデータ項目を削除しますか。').then(function () {
    return delOperlog(operIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除に成功しました");
  }).catch(() => {});
}
/** クリアボタン操作 */
function handleClean() {
  proxy.$modal.confirm("すべての操作ログデータを削除しますか").then(function () {
    return cleanOperlog();
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除に成功しました");
  }).catch(() => {});
}
/** エクスポートボタン操作 */
function handleExport() {
  proxy.download("monitor/operlog/export",{
    ...queryParams.value,
  }, `config_${new Date().getTime()}.xlsx`);
}

getList();
</script>
