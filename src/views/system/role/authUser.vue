
<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true">
         <el-form-item label="ユーザ名" prop="userName">
            <el-input
               v-model="queryParams.userName"
               placeholder="ユーザ名を入力してください"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="携帯番号" prop="phonenumber">
            <el-input
               v-model="queryParams.phonenumber"
               placeholder="携帯番号を入力してください"
               clearable
               style="width: 240px"
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
               type="primary"
               plain
               icon="Plus"
               @click="openSelectUser"
               v-hasPermi="['system:role:add']"
            >ユーザの追加</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="CircleClose"
               :disabled="multiple"
               @click="cancelAuthUserAll"
               v-hasPermi="['system:role:remove']"
            >権限取消し</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button 
               type="warning" 
               plain 
               icon="Close"
               @click="handleClose"
            >閉じる</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="ユーザ名" prop="userName" :show-overflow-tooltip="true" />
         <el-table-column label=ユーザのニックネーム prop="nickName" :show-overflow-tooltip="true" />
         <el-table-column label="メールアドレス" prop="email" :show-overflow-tooltip="true" />
         <el-table-column label="電話" prop="phonenumber" :show-overflow-tooltip="true" />
         <el-table-column label="ステータス" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="作成日時" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="CircleClose" @click="cancelAuthUser(scope.row)" v-hasPermi="['system:role:remove']">取消認証</el-button>
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
      <select-user ref="selectRef" :roleId="queryParams.roleId" @ok="handleQuery" />
   </div>
</template>

<script setup name="AuthUser">
import selectUser from "./selectUser";
import { allocatedUserList, authUserCancel, authUserCancelAll } from "@/api/system/role";

const route = useRoute();
const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const userList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const multiple = ref(true);
const total = ref(0);
const userIds = ref([]);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleId: route.params.roleId,
  userName: undefined,
  phonenumber: undefined,
});

/** 認証されたユーザ */
function getList() {
  loading.value = true;
  allocatedUserList(queryParams).then(response => {
    userList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
// 戻りボタン
function handleClose() {
  const obj = { path: "/system/role" };
  proxy.$tab.closeOpenPage(obj);
}
/** 検索ボタン操作 */
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}
/** リセットボタン操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
// 複数選択ボックス
function handleSelectionChange(selection) {
  userIds.value = selection.map(item => item.userId);
  multiple.value = !selection.length;
}
/** 承認されたユーザートブルーのポップアップウィンドウを開く */
function openSelectUser() {
  proxy.$refs["selectRef"].show();
}
/** 認可解除ボタン操作 */
function cancelAuthUser(row) {
  proxy.$modal.confirm('ユーザ"' + row.userName + '"ロールをキャンセルすることを確認しますか？？').then(function () {
    return authUserCancel({ userId: row.userId, roleId: queryParams.roleId });
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("認可の取り消しに成功しました");
  }).catch(() => {});
}
/** 認可解除ボタン操作 */
function cancelAuthUserAll(row) {
  const roleId = queryParams.roleId;
  const uIds = userIds.value.join(",");
  proxy.$modal.confirm("ユーザ認可データ項目の選択を解除するかどうか?").then(function () {
    return authUserCancelAll({ roleId: roleId, userIds: uIds });
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("認証の取り消しに成功しました");
  }).catch(() => {});
}

getList();
</script>
