<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="90px">
         <el-form-item label="ロール名" prop="roleName">
            <el-input
               v-model="queryParams.roleName"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="権限文字" prop="roleKey">
            <el-input
               v-model="queryParams.roleKey"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="ステータス" prop="status">
            <el-select
               v-model="queryParams.status"
               placeholder=""
               clearable
               style="width: 175px"
            >
               <el-option
                  v-for="dict in sys_normal_disable"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="作成日時" style="width: 400px">
            <el-date-picker
               v-model="dateRange"
               value-format="YYYY-MM-DD"
               start-placeholder="開始"
               end-placeholder="終了"
               type="daterange"
               range-separator="-"
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
               v-hasPermi="['system:role:add']"
            >新規作成</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['system:role:edit']"
            >変更</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['system:role:remove']"
            >削除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['system:role:export']"
            >エクスポート</el-button>
         </el-col>
<!--         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>-->
      </el-row>

      <!-- テーブル格データ -->
      <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="ロール番号" prop="roleId" width="120" />
         <el-table-column label="ロール名" prop="roleName" :show-overflow-tooltip="true" width="150" />
         <el-table-column label="権限文字" prop="roleKey" :show-overflow-tooltip="true" width="150" />
         <el-table-column label="表示順" prop="roleSort" width="100" />
         <el-table-column label="ステータス" align="center" width="100">
            <template #default="scope">
               <el-switch
                  v-model="scope.row.status"
                  :disabled="isHelpdesk"
                  active-value="0"
                  inactive-value="1"
                  @change="handleStatusChange(scope.row)"
               ></el-switch>
            </template>
         </el-table-column>
         <el-table-column label="作成日時" align="center" prop="createTime">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-tooltip content="変更" placement="top" v-if="scope.row.roleId !== 1">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:role:edit']"></el-button>
              </el-tooltip>
              <el-tooltip content="削除" placement="top" v-if="scope.row.roleId !== 1">
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:role:remove']"></el-button>
              </el-tooltip>
              <el-tooltip content="データ権限" placement="top" v-if="scope.row.roleId !== 1">
                <el-button link type="primary" icon="CircleCheck" @click="handleDataScope(scope.row)" v-hasPermi="['system:role:edit']"></el-button>
              </el-tooltip>
              <el-tooltip content="ユーザの割当て" placement="top" v-if="scope.row.roleId !== 1">
                <el-button link type="primary" icon="User" @click="handleAuthUser(scope.row)" v-hasPermi="['system:role:edit']"></el-button>
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

      <!-- 追加または修正ロール構成ダイアログボックス -->
      <el-dialog :title="title" v-model="open" width="600px" append-to-body>
         <el-form ref="roleRef" :model="form" :rules="rules" label-width="110px">
            <el-form-item label="ロール名" prop="roleName">
               <el-input v-model="form.roleName" placeholder="ロール名を入力してください" />
            </el-form-item>
            <el-form-item prop="roleKey">
               <template #label>
                  <span>
                     <el-tooltip content="コントローラに定義されている権限文字（例：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
                        <el-icon><question-filled /></el-icon>
                     </el-tooltip>
                     権限文字
                  </span>
               </template>
               <el-input v-model="form.roleKey" placeholder="権限文字を入力してください" />
            </el-form-item>
            <el-form-item label="ロール順番" prop="roleSort">
               <el-input-number v-model="form.roleSort" controls-position="right" :min="0" />
            </el-form-item>
            <el-form-item label="ステータス">
               <el-radio-group v-model="form.status">
                  <el-radio
                     v-for="dict in sys_normal_disable"
                     :key="dict.value"
                     :label="dict.value"
                  >{{ dict.label }}</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="メニュー権限">
               <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展開/折りたたみ</el-checkbox>
               <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">すべて選択/すべて選択しない</el-checkbox>
               <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">親子関係</el-checkbox>
               <el-tree
                  class="tree-border"
                  :data="menuOptions"
                  show-checkbox
                  ref="menuRef"
                  node-key="id"
                  :check-strictly="!form.menuCheckStrictly"
                  empty-text="ロード中、お待ちください"
                  :props="{ label: 'label', children: 'children' }"
               ></el-tree>
            </el-form-item>
            <el-form-item label="備考">
               <el-input v-model="form.remark" type="textarea" placeholder="内容を入力してください"></el-input>
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">確 定</el-button>
               <el-button @click="cancel">キャンセル</el-button>
            </div>
         </template>
      </el-dialog>

      <!-- 分配ロールデータ権限ダイアログボックス -->
      <el-dialog :title="title" v-model="openDataScope" width="630px" append-to-body>
         <el-form :model="form" label-width="95px">
            <el-form-item label="ロール名">
               <el-input v-model="form.roleName" :disabled="true" />
            </el-form-item>
            <el-form-item label="権限文字">
               <el-input v-model="form.roleKey" :disabled="true" />
            </el-form-item>
            <el-form-item label="権限範囲">
               <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
                  <el-option
                     v-for="item in dataScopeOptions"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value"
                  ></el-option>
               </el-select>
            </el-form-item>
            <el-form-item label="データ権限" v-show="form.dataScope == 2">
               <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')">展開/折りたたみ</el-checkbox>
               <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">すべて選択/すべて選択しない</el-checkbox>
               <el-checkbox v-model="form.deptCheckStrictly" @change="handleCheckedTreeConnect($event, 'dept')">親子関係</el-checkbox>
               <el-tree
                  class="tree-border"
                  :data="deptOptions"
                  show-checkbox
                  default-expand-all
                  ref="deptRef"
                  node-key="id"
                  :check-strictly="!form.deptCheckStrictly"
                  empty-text="ロード中、お待ちください"
                  :props="{ label: 'label', children: 'children' }"
               ></el-tree>
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitDataScope">確 定</el-button>
               <el-button @click="cancelDataScope">キャンセル</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Role">
import { addRole, changeRoleStatus, dataScope, delRole, getRole, listRole, updateRole, deptTreeSelect } from "@/api/system/role";
import { roleMenuTreeselect, treeselect as menuTreeselect } from "@/api/system/menu";
import useUserStore from "@/store/modules/user.js";

const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");
const isHelpdesk = useUserStore().roles.includes("helpdesk")

const roleList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const menuOptions = ref([]);
const menuExpand = ref(false);
const menuNodeAll = ref(false);
const deptExpand = ref(true);
const deptNodeAll = ref(false);
const deptOptions = ref([]);
const openDataScope = ref(false);
const menuRef = ref(null);
const deptRef = ref(null);

/** データ范围オプション*/
const dataScopeOptions = ref([
  { value: "1", label: "全部データ権限" },
  { value: "2", label: "カスタムデータ権限" },
  { value: "3", label: "本部門データ権限" },
  { value: "4", label: "本部門及び以下データ権限" },
  { value: "5", label: "本人データ権限のみ" }
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    roleName: undefined,
    roleKey: undefined,
    status: undefined
  },
  rules: {
    roleName: [{ required: true, message: "ロール名のご入力は必須です。", trigger: "blur" }],
    roleKey: [{ required: true, message: "権限文字のご入力は必須です。", trigger: "blur" }],
    roleSort: [{ required: true, message: "ロールの順序のご入力は必須です。", trigger: "blur" }]
  },
});

const { queryParams, form, rules } = toRefs(data);

/** ロールリスト */
function getList() {
  loading.value = true;
  listRole(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    roleList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
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
/** 削除ボタン操作 */
function handleDelete(row) {
  const roleIds = row.roleId || ids.value;
  proxy.$modal.confirm('ロール番号が「' + roleIds + '」のデータ項目を削除しますか。').then(function () {
    return delRole(roleIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除に成功しました");
  }).catch(() => {});
}
/** エクスポートボタン操作 */
function handleExport() {
  proxy.download("system/role/export", {
    ...queryParams.value,
  }, `role_${new Date().getTime()}.xlsx`);
}
/** 複数選択ボックス選択データ */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.roleId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** ロールステータス修正 */
function handleStatusChange(row) {
  let text = row.status === "0" ? "スタート" : "停止";
  proxy.$modal.confirm('"' + text + '""' + row.roleName + '"を確認しますか?').then(function () {
    return changeRoleStatus(row.roleId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
}
/** その他の操作 */
function handleCommand(command, row) {
  switch (command) {
    case "handleDataScope":
      handleDataScope(row);
      break;
    case "handleAuthUser":
      handleAuthUser(row);
      break;
    default:
      break;
  }
}
/** 分配ユーザ */
function handleAuthUser(row) {
  router.push("/system/role-auth/user/" + row.roleId);
}
/** メニューツリー構造 */
function getMenuTreeselect() {
  menuTreeselect().then(response => {
    menuOptions.value = response.data;
  });
}
/** 部門データ */
function getDeptAllCheckedKeys() {
  let checkedKeys = deptRef.value.getCheckedKeys();
  let halfCheckedKeys = deptRef.value.getHalfCheckedKeys();
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
}
/** リセット新規Formおよびその他のデータ  */
function reset() {
  if (menuRef.value != undefined) {
    menuRef.value.setCheckedKeys([]);
  }
  menuExpand.value = false;
  menuNodeAll.value = false;
  deptExpand.value = true;
  deptNodeAll.value = false;
  form.value = {
    roleId: undefined,
    roleName: undefined,
    roleKey: undefined,
    roleSort: 0,
    status: "0",
    menuIds: [],
    deptIds: [],
    menuCheckStrictly: true,
    deptCheckStrictly: true,
    remark: undefined
  };
  proxy.resetForm("roleRef");
}
/** 追加ロール */
function handleAdd() {
  reset();
  getMenuTreeselect();
  open.value = true;
  title.value = "ロールの追加";
}
/** 修正ロール */
function handleUpdate(row) {
  reset();
  const roleId = row.roleId || ids.value;
  const roleMenu = getRoleMenuTreeselect(roleId);
  getRole(roleId).then(response => {
    form.value = response.data;
    form.value.roleSort = Number(form.value.roleSort);
    open.value = true;
    nextTick(() => {
      roleMenu.then((res) => {
        let checkedKeys = res.checkedKeys;
        checkedKeys.forEach((v) => {
          nextTick(() => {
            menuRef.value.setChecked(v, true, false);
          });
        });
      });
    });
    title.value = "ロール変更";
  });
}
/** ロールIDメニュツリー構造による */
function getRoleMenuTreeselect(roleId) {
  return roleMenuTreeselect(roleId).then(response => {
    menuOptions.value = response.menus;
    return response;
  });
}
/** ロールIDメニュツリー構造による */
function getDeptTree(roleId) {
  return deptTreeSelect(roleId).then(response => {
    deptOptions.value = response.depts;
    return response;
  });
}
/** 権限（展開/折畳）*/
function handleCheckedTreeExpand(value, type) {
  if (type == "menu") {
    let treeList = menuOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      menuRef.value.store.nodesMap[treeList[i].id].expanded = value;
    }
  } else if (type == "dept") {
    let treeList = deptOptions.value;
    for (let i = 0; i < treeList.length; i++) {
      deptRef.value.store.nodesMap[treeList[i].id].expanded = value;
    }
  }
}
/** 権限（すべて選択/すべて選択しない） */
function handleCheckedTreeNodeAll(value, type) {
  if (type == "menu") {
    menuRef.value.setCheckedNodes(value ? menuOptions.value : []);
  } else if (type == "dept") {
    deptRef.value.setCheckedNodes(value ? deptOptions.value : []);
  }
}
/** 権限 */
function handleCheckedTreeConnect(value, type) {
  if (type == "menu") {
    form.value.menuCheckStrictly = value ? true : false;
  } else if (type == "dept") {
    form.value.deptCheckStrictly = value ? true : false;
  }
}
/** メニューノードデータ */
function getMenuAllCheckedKeys() {
  let checkedKeys = menuRef.value.getCheckedKeys();
  let halfCheckedKeys = menuRef.value.getHalfCheckedKeys();
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
  return checkedKeys;
}
/** commitボタン */
function submitForm() {
  proxy.$refs["roleRef"].validate(valid => {
    if (valid) {
      if (form.value.roleId != undefined) {
        form.value.menuIds = getMenuAllCheckedKeys();
        updateRole(form.value).then(response => {
          proxy.$modal.msgSuccess("変更に成功しました。");
          open.value = false;
          getList();
        });
      } else {
        form.value.menuIds = getMenuAllCheckedKeys();
        addRole(form.value).then(response => {
          proxy.$modal.msgSuccess("新規追加に成功しました");
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 取消ボタン */
function cancel() {
  open.value = false;
  reset();
}
/** ロール権制限範囲選択トリガ */
function dataScopeSelectChange(value) {
  if (value !== "2") {
    deptRef.value.setCheckedKeys([]);
  }
}
/** 配布データ権限操作 */
function handleDataScope(row) {
  reset();
  const deptTreeSelect = getDeptTree(row.roleId);
  getRole(row.roleId).then(response => {
    form.value = response.data;
    openDataScope.value = true;
    nextTick(() => {
      deptTreeSelect.then(res => {
        nextTick(() => {
          if (deptRef.value) {
            deptRef.value.setCheckedKeys(res.checkedKeys);
          }
        });
      });
    });
    title.value = "配布データ権限";
  });
}
/** commitボタン（データ権限） */
function submitDataScope() {
  if (form.value.roleId != undefined) {
    form.value.deptIds = getDeptAllCheckedKeys();
    dataScope(form.value).then(response => {
      proxy.$modal.msgSuccess("変更に成功しました。");
      openDataScope.value = false;
      getList();
    });
  }
}
/** 取消ボタン（データ権限）*/
function cancelDataScope() {
  openDataScope.value = false;
  reset();
}

getList();
</script>
<style>
.el-message-box__content {
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>
