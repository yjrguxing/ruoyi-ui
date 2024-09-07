<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="テーブル名" prop="tableName">
        <el-input
          v-model="queryParams.tableName"
          placeholder="テーブル名を入力してください"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="テーブル説明" prop="tableComment">
        <el-input
          v-model="queryParams.tableComment"
          placeholder="テーブル説明を入力してください"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="作成日時" style="width: 308px">
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
          icon="Download"
          :disabled="multiple"
          @click="handleGenTable"
          v-hasPermi="['tool:gen:code']"
        >生成</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="openCreateTable"
          v-hasRole="['admin']"
        >新規</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Upload"
          @click="openImportTable"
          v-hasPermi="['tool:gen:import']"
        >インポート</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleEditTable"
          v-hasPermi="['tool:gen:edit']"
        >変更</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['tool:gen:remove']"
        >削除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" width="55"></el-table-column>
      <el-table-column label="番号" type="index" width="50" align="center">
        <template #default="scope">
          <span>{{(queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1}}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="テーブル名"
        align="center"
        prop="tableName"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="テーブル説明"
        align="center"
        prop="tableComment"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="エンティティ"
        align="center"
        prop="className"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="作成日時" align="center" prop="createTime" width="160" />
      <el-table-column label="更新日時" align="center" prop="updateTime" width="160" />
      <el-table-column label="操作" align="center" width="330" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="プレビュー" placement="top">
            <el-button link type="primary" icon="View" @click="handlePreview(scope.row)" v-hasPermi="['tool:gen:preview']"></el-button>
          </el-tooltip>
          <el-tooltip content="編集" placement="top">
            <el-button link type="primary" icon="Edit" @click="handleEditTable(scope.row)" v-hasPermi="['tool:gen:edit']"></el-button>
          </el-tooltip>
          <el-tooltip content="削除" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['tool:gen:remove']"></el-button>
          </el-tooltip>
          <el-tooltip content="同期" placement="top">
            <el-button link type="primary" icon="Refresh" @click="handleSynchDb(scope.row)" v-hasPermi="['tool:gen:edit']"></el-button>
          </el-tooltip>
          <el-tooltip content="コードの生成" placement="top">
            <el-button link type="primary" icon="Download" @click="handleGenTable(scope.row)" v-hasPermi="['tool:gen:code']"></el-button>
          </el-tooltip>
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
    <!-- プレビュー -->
    <el-dialog :title="preview.title" v-model="preview.open" width="80%" top="5vh" append-to-body class="scrollbar">
      <el-tabs v-model="preview.activeName">
        <el-tab-pane
          v-for="(value, key) in preview.data"
          :label="key.substring(key.lastIndexOf('/')+1,key.indexOf('.vm'))"
          :name="key.substring(key.lastIndexOf('/')+1,key.indexOf('.vm'))"
          :key="value"
        >
          <el-link :underline="false" icon="DocumentCopy" v-copyText="value" v-copyText:callback="copyTextSuccess" style="float:right">&nbsp;コピー</el-link>
          <pre>{{ value }}</pre>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <import-table ref="importRef" @ok="handleQuery" />
    <create-table ref="createRef" @ok="handleQuery" />
  </div>
</template>

<script setup name="Gen">
import { listTable, previewTable, delTable, genCode, synchDb } from "@/api/tool/gen";
import router from "@/router";
import importTable from "./importTable";
import createTable from "./createTable";

const route = useRoute();
const { proxy } = getCurrentInstance();

const tableList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const tableNames = ref([]);
const dateRange = ref([]);
const uniqueId = ref("");

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tableName: undefined,
    tableComment: undefined
  },
  preview: {
    open: false,
    title: "コードプレビュー",
    data: {},
    activeName: "domain.java"
  }
});

const { queryParams, preview } = toRefs(data);

onActivated(() => {
  const time = route.query.t;
  if (time != null && time != uniqueId.value) {
    uniqueId.value = time;
    queryParams.value.pageNum = Number(route.query.pageNum);
    dateRange.value = [];
    proxy.resetForm("queryForm");
    getList();
  }
})

/** テーブル集合 */
function getList() {
  loading.value = true;
  listTable(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    tableList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 検索ボタン操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 生成コード操作 */
function handleGenTable(row) {
  const tbNames = row.tableName || tableNames.value;
  if (tbNames == "") {
    proxy.$modal.msgError("生成するデータを選択してください");
    return;
  }
  if (row.genType === "1") {
    genCode(row.tableName).then(response => {
      proxy.$modal.msgSuccess("カスタムパスの生成に成功しました：" + row.genPath);
    });
  } else {
    proxy.$download.zip("/tool/gen/batchGenCode?tables=" + tbNames, "ruoyi.zip");
  }
}
/** 同期データベース操作 */
function handleSynchDb(row) {
  const tableName = row.tableName;
  proxy.$modal.confirm('同期"' + tableName + '"テキストブル構造を強制することを確認しますか？').then(function () {
    return synchDb(tableName);
  }).then(() => {
    proxy.$modal.msgSuccess("同期成功");
  }).catch(() => {});
}
/** インポートユニットの弾窓を開く */
function openImportTable() {
  proxy.$refs["importRef"].show();
}
/** 新規テーブルブル弾窓を開く */
function openCreateTable() {
  proxy.$refs["createRef"].show();
}
/** リセットボタン操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}
/** プレビューボタン */
function handlePreview(row) {
  previewTable(row.tableId).then(response => {
    preview.value.data = response.data;
    preview.value.open = true;
    preview.value.activeName = "domain.java";
  });
}
/** コピーコード成功 */
function copyTextSuccess() {
  proxy.$modal.msgSuccess("コピー成功");
}
// 複数選択ボックス選択データ
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.tableId);
  tableNames.value = selection.map(item => item.tableName);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 修正ボタン操作 */
function handleEditTable(row) {
  const tableId = row.tableId || ids.value[0];
  router.push({ path: "/tool/gen-edit/index/" + tableId, query: { pageNum: queryParams.value.pageNum } });
}
/** 削除ボタン操作 */
function handleDelete(row) {
  const tableIds = row.tableId || ids.value;
  proxy.$modal.confirm('削除されたタイトル番号が"' + tableIds + '"のデータ項目であることを確認しますか？').then(function () {
    return delTable(tableIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除に成功しました");
  }).catch(() => {});
}

getList();
</script>
