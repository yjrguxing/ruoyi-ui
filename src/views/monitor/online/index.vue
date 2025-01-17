<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true">
         <el-form-item label="ログインアドレス" prop="ipaddr">
            <el-input
               v-model="queryParams.ipaddr"
               placeholder="ログインアドレスを入力してください"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="ユーザ名" prop="userName">
            <el-input
               v-model="queryParams.userName"
               placeholder="ユーザ名を入力してください"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">検索</el-button>
            <el-button icon="Refresh" @click="resetQuery">リセット</el-button>
         </el-form-item>
      </el-form>
      <el-table
         v-loading="loading"
         :data="onlineList.slice((pageNum - 1) * pageSize, pageNum * pageSize)"
         style="width: 100%;"
      >
         <el-table-column label="番号" width="50" type="index" align="center">
            <template #default="scope">
               <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
            </template>
         </el-table-column>
         <el-table-column label="セッション番号" align="center" prop="tokenId" :show-overflow-tooltip="true" />
         <el-table-column label="ログイン名" align="center" prop="userName" :show-overflow-tooltip="true" />
         <el-table-column label="所属施設" align="center" prop="deptName" :show-overflow-tooltip="true" />
         <el-table-column label="ホスト" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
         <el-table-column label="ログイン場所" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
         <el-table-column label="オペレーティングシステム" align="center" prop="os" :show-overflow-tooltip="true" />
         <el-table-column label="ブラウザ" align="center" prop="browser" :show-overflow-tooltip="true" />
         <el-table-column label="ログイン日時" align="center" prop="loginTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.loginTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Delete" @click="handleForceLogout(scope.row)" v-hasPermi="['monitor:online:forceLogout']">強制ログアウト</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="pageNum" v-model:limit="pageSize" />
   </div>
</template>

<script setup name="Online">
import { forceLogout, list as initData } from "@/api/monitor/online";

const { proxy } = getCurrentInstance();

const onlineList = ref([]);
const loading = ref(true);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);

const queryParams = ref({
  ipaddr: undefined,
  userName: undefined
});

/** 登録ログリスト */
function getList() {
  loading.value = true;
  initData(queryParams.value).then(response => {
    onlineList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 検索ボタン操作 */
function handleQuery() {
  pageNum.value = 1;
  getList();
}
/** リセットボタン操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
/** ボタン強制操作 */
function handleForceLogout(row) {
    proxy.$modal.confirm('ユーザ"' + row.userName + '"を強制ログアウトしますか。').then(function () {
  return forceLogout(row.tokenId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除に成功しました");
  }).catch(() => {});
}

getList();
</script>
