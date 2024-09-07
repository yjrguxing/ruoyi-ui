<template>
   <!-- 認証ユーザ -->
   <el-dialog title="ユーザを選択" v-model="visible" width="800px" top="5vh" append-to-body>
      <el-form :model="queryParams" ref="queryRef" :inline="true">
         <el-form-item label="ユーザ名" prop="userName">
            <el-input
               v-model="queryParams.userName"
               placeholder="ユーザ名を入力してください"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="携帯番号" prop="phonenumber">
            <el-input
               v-model="queryParams.phonenumber"
               placeholder="携帯番号を入力してください"
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
      <el-row>
         <el-table @row-click="clickRow" ref="refTable" :data="userList" @selection-change="handleSelectionChange" height="260px">
            <el-table-column type="selection" width="55"></el-table-column>
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
         </el-table>
         <pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
         />
      </el-row>
      <template #footer>
         <div class="dialog-footer">
            <el-button type="primary" @click="handleSelectUser">確 定</el-button>
            <el-button @click="visible = false">キャンセル</el-button>
         </div>
      </template>
   </el-dialog>
</template>

<script setup name="SelectUser">
import { authUserSelectAll, unallocatedUserList } from "@/api/system/role";

const props = defineProps({
  roleId: {
    type: [Number, String]
  }
});

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const userList = ref([]);
const visible = ref(false);
const total = ref(0);
const userIds = ref([]);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleId: undefined,
  userName: undefined,
  phonenumber: undefined
});

// フレームを表示
function show() {
  queryParams.roleId = props.roleId;
  getList();
  visible.value = true;
}
/**行の選択 */
function clickRow(row) {
  proxy.$refs["refTable"].toggleRowSelection(row);
}
// 複数選択ボックス選択データ
function handleSelectionChange(selection) {
  userIds.value = selection.map(item => item.userId);
}
// テーブルデータ
function getList() {
  unallocatedUserList(queryParams).then(res => {
    userList.value = res.rows;
    total.value = res.total;
  });
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
const emit = defineEmits(["ok"]);
/** 認証ユーザ操作 */
function handleSelectUser() {
  const roleId = queryParams.roleId;
  const uIds = userIds.value.join(",");
  if (uIds == "") {
    proxy.$modal.msgError("ユーザを選択してください");
    return;
  }
  authUserSelectAll({ roleId: roleId, userIds: uIds }).then(res => {
    proxy.$modal.msgSuccess(res.msg);
    if (res.code === 200) {
      visible.value = false;
      emit("ok");
    }
  });
}

defineExpose({
  show,
});
</script>
