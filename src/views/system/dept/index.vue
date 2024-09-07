<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="施設名" prop="deptName">
            <el-input
               v-model="queryParams.deptName"
               placeholder=""
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="ステータス" prop="status">
            <el-select v-model="queryParams.status" placeholder="" clearable style="width: 200px">
               <el-option
                  v-for="dict in sys_normal_disable"
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
               v-hasPermi="['system:dept:add']"
            >新規作成</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="info"
               plain
               icon="Sort"
               @click="toggleExpandAll"
            >展開/折りたたみ</el-button>
         </el-col>
<!--         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>-->
      </el-row>

      <el-table
         v-if="refreshTable"
         v-loading="loading"
         :data="deptList"
         row-key="deptId"
         :default-expand-all="isExpandAll"
         :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
         <el-table-column prop="deptName" label="施設名" width="460"></el-table-column>
         <el-table-column prop="orderNum" label="ソート" width="200"></el-table-column>
         <el-table-column prop="status" label="ステータス" width="100">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="作成日時" align="center" prop="createTime" width="200">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dept:edit']">変更</el-button>
               <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:dept:add']">新規作成</el-button>
               <el-button v-if="scope.row.parentId != 0" link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dept:remove']">削除</el-button>
            </template>
         </el-table-column>
      </el-table>

      <!-- 追加または修正施設ダイアログボックス -->
      <el-dialog :title="title" v-model="open" width="800px" append-to-body>
         <el-form ref="deptRef" :model="form" :rules="rules" label-width="120px">
            <el-row :gutter="20">
               <el-col :span="24" v-if="form.parentId !== 0">
                  <el-form-item label="上位施設" prop="parentId">
                     <el-tree-select
                        v-model="form.parentId"
                        :data="deptOptions"
                        :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
                        value-key="deptId"
                        placeholder="上位施設の選択"
                        check-strictly
                     />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="施設名" prop="deptName">
                     <el-input v-model="form.deptName" placeholder="施設名を入力してください" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="ソートを表示" prop="orderNum">
                     <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="担当者" prop="leader">
                     <el-input v-model="form.leader" placeholder="担当者を入力してください" maxlength="20" />
                  </el-form-item>
               </el-col>
<!--               <el-col :span="12">-->
<!--                  <el-form-item label="連絡先電話番号" prop="phone">-->
<!--                     <el-input v-model="form.phone" placeholder="連絡先電話番号を入力してください" maxlength="11" />-->
<!--                  </el-form-item>-->
<!--               </el-col>-->
<!--               <el-col :span="12">-->
<!--                  <el-form-item label="メールアドレス" prop="email">-->
<!--                     <el-input v-model="form.email" placeholder="メールアドレスを入力してください" maxlength="50" />-->
<!--                  </el-form-item>-->
<!--               </el-col>-->
               <el-col :span="12">
                  <el-form-item label="施設ステータス">
                     <el-radio-group v-model="form.status">
                        <el-radio
                           v-for="dict in sys_normal_disable"
                           :key="dict.value"
                           :label="dict.value"
                        >{{ dict.label }}</el-radio>
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
   </div>
</template>

<script setup name="Dept">
import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from "@/api/system/dept";

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const deptList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const deptOptions = ref([]);
const isExpandAll = ref(true);
const refreshTable = ref(true);

const data = reactive({
  form: {},
  queryParams: {
    deptName: undefined,
    status: undefined
  },
  rules: {
    parentId: [{ required: true, message: "上位施設のご入力は必須です。", trigger: "blur" }],
    deptName: [{ required: true, message: "施設名のご入力は必須です。", trigger: "blur" }],
    orderNum: [{ required: true, message: "表示ソートのご入力は必須です。", trigger: "blur" }],
    email: [{ type: "email", message: "正しいメールアドレスを入力してください", trigger: ["blur", "change"] }],
    phone: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "正しい携帯電話番号を入力してください", trigger: "blur" }]
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 施設リスト */
function getList() {
  loading.value = true;
  listDept(queryParams.value).then(response => {
    deptList.value = proxy.handleTree(response.data, "deptId");
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
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: 0,
    leader: undefined,
    phone: undefined,
    email: undefined,
    status: "0"
  };
  proxy.resetForm("deptRef");
}
/** 検索ボタン操作 */
function handleQuery() {
  getList();
}
/** リセットボタン操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
/** 新規ボタン操作 */
function handleAdd(row) {
  reset();
  listDept().then(response => {
    deptOptions.value = proxy.handleTree(response.data, "deptId");
  });
  if (row != undefined) {
    form.value.parentId = row.deptId;
  }
  open.value = true;
  title.value = "施設の追加";
}
/** 展開/折畳操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}
/** 修正ボタン操作 */
function handleUpdate(row) {
  reset();
  listDeptExcludeChild(row.deptId).then(response => {
    deptOptions.value = proxy.handleTree(response.data, "deptId");
  });
  getDept(row.deptId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "施設の変更";
  });
}
/** commitボタン */
function submitForm() {
  proxy.$refs["deptRef"].validate(valid => {
    if (valid) {
      if (form.value.deptId != undefined) {
        updateDept(form.value).then(response => {
          proxy.$modal.msgSuccess("変更に成功しました。");
          open.value = false;
          getList();
        });
      } else {
        addDept(form.value).then(response => {
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
  proxy.$modal.confirm('「' + row.deptName + '」を削除しますか').then(function() {
    return delDept(row.deptId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除に成功しました");
  }).catch(() => {});
}

getList();
</script>
