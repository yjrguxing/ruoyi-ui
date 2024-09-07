<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="お知らせのタイトル" prop="noticeTitle">
            <el-input
               v-model="queryParams.noticeTitle"
               placeholder="お知らせタイトルを入力してください"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="操作員" prop="createBy">
            <el-input
               v-model="queryParams.createBy"
               placeholder="操作員を入力してください"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="タイプ" prop="noticeType">
            <el-select v-model="queryParams.noticeType" placeholder="お知らせタイプ" clearable style="width: 200px">
               <el-option
                  v-for="dict in sys_notice_type"
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
               v-hasPermi="['system:notice:add']"
            >新規作成</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['system:notice:edit']"
            >変更</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['system:notice:remove']"
            >削除</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="noticeList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="番号" align="center" prop="noticeId" width="100" />
         <el-table-column
            label="お知らせのタイトル"
            align="center"
            prop="noticeTitle"
            :show-overflow-tooltip="true"
         />
         <el-table-column label="お知らせタイプ" align="center" prop="noticeType" width="100">
            <template #default="scope">
               <dict-tag :options="sys_notice_type" :value="scope.row.noticeType" />
            </template>
         </el-table-column>
         <el-table-column label="ステータス" align="center" prop="status" width="100">
            <template #default="scope">
               <dict-tag :options="sys_notice_status" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="作成者" align="center" prop="createBy" width="100" />
         <el-table-column label="作成日時" align="center" prop="createTime" width="100">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:notice:edit']">変更</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:notice:remove']" >削除</el-button>
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

      <!-- 追加または修正お知らせダイアログボックス -->
      <el-dialog :title="title" v-model="open" width="780px" append-to-body>
         <el-form ref="noticeRef" :model="form" :rules="rules" label-width="80px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="お知らせのタイトル" prop="noticeTitle">
                     <el-input v-model="form.noticeTitle" placeholder="お知らせタイトルを入力してください" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="お知らせタイプ" prop="noticeType">
                     <el-select v-model="form.noticeType" placeholder="選択してください">
                        <el-option
                           v-for="dict in sys_notice_type"
                           :key="dict.value"
                           :label="dict.label"
                           :value="dict.value"
                        ></el-option>
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="ステータス">
                     <el-radio-group v-model="form.status">
                        <el-radio
                           v-for="dict in sys_notice_status"
                           :key="dict.value"
                           :label="dict.value"
                        >{{ dict.label }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="内容">
                    <editor v-model="form.noticeContent" :min-height="192"/>
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
   </div>
</template>

<script setup name="Notice">
import { listNotice, getNotice, delNotice, addNotice, updateNotice } from "@/api/system/notice";

const { proxy } = getCurrentInstance();
const { sys_notice_status, sys_notice_type } = proxy.useDict("sys_notice_status", "sys_notice_type");

const noticeList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    noticeTitle: undefined,
    createBy: undefined,
    status: undefined
  },
  rules: {
    noticeTitle: [{ required: true, message: "お知らせタイトルのご入力は必須です。", trigger: "blur" }],
    noticeType: [{ required: true, message: "お知らせタイプのご入力は必須です。", trigger: "change" }]
  },
});

const { queryParams, form, rules } = toRefs(data);

/** お知らせリスト */
function getList() {
  loading.value = true;
  listNotice(queryParams.value).then(response => {
    noticeList.value = response.rows;
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
    noticeId: undefined,
    noticeTitle: undefined,
    noticeType: undefined,
    noticeContent: undefined,
    status: "0"
  };
  proxy.resetForm("noticeRef");
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
/** 複数選択ボックス選択データ */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.noticeId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 新規ボタン操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "お知らせの追加";
}
/**修正ボタン操作 */
function handleUpdate(row) {
  reset();
  const noticeId = row.noticeId || ids.value;
  getNotice(noticeId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修正お知らせ";
  });
}
/** commitボタン */
function submitForm() {
  proxy.$refs["noticeRef"].validate(valid => {
    if (valid) {
      if (form.value.noticeId != undefined) {
        updateNotice(form.value).then(response => {
          proxy.$modal.msgSuccess("変更に成功しました。");
          open.value = false;
          getList();
        });
      } else {
        addNotice(form.value).then(response => {
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
  const noticeIds = row.noticeId || ids.value
  proxy.$modal.confirm('お知らせ番号が「' + noticeIds + '」のデータ項目を削除しますか。').then(function() {
    return delNotice(noticeIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除に成功しました");
  }).catch(() => {});
}

getList();
</script>
