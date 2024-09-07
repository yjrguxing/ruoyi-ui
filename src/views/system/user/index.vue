<template>
   <div class="app-container">
      <el-row :gutter="20">
         <!--部門データ-->
         <el-col :span="4" :xs="24">
            <div class="head-container">
<!--              placeholder="部門名を入力してください"-->
               <el-input
                  v-model="deptName"
                  clearable
                  placeholder="施設名を入力してください"
                  prefix-icon="Search"
                  style="margin-bottom: 20px"
               />
            </div>
            <div class="head-container">
               <el-tree
                  :data="deptOptions"
                  :props="{ label: 'label', children: 'children' }"
                  :expand-on-click-node="false"
                  :filter-node-method="filterNode"
                  ref="deptTreeRef"
                  node-key="id"
                  highlight-current
                  default-expand-all
                  @node-click="handleNodeClick"
               />
            </div>
         </el-col>
         <!--ユーザデータ-->
         <el-col :span="20" :xs="24">
            <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="120px">
               <el-form-item label="メールアドレス" prop="userName">
<!--                 placeholder="メールアドレスを入力してください"-->
                  <el-input
                     v-model="queryParams.userName"
                     clearable
                     style="width: 240px"
                     @keyup.enter="handleQuery"
                  />
               </el-form-item>
<!--               <el-form-item label="携帯番号" prop="phonenumber">-->
<!--                  <el-input-->
<!--                     v-model="queryParams.phonenumber"-->
<!--                     placeholder="携帯番号を入力してください"-->
<!--                     clearable-->
<!--                     style="width: 240px"-->
<!--                     @keyup.enter="handleQuery"-->
<!--                  />-->
<!--               </el-form-item>-->
               <el-form-item label="ステータス" prop="status">
<!--                 placeholder="ユーザのステータス"-->
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
               <el-form-item label="作成日時" style="width: 400px;">
<!--                 start-placeholder="開始日付"-->
<!--                 end-placeholder="終了日付"-->
                  <el-date-picker
                     v-model="dateRange"
                     value-format="YYYY-MM-DD"
                     type="daterange"
                     start-placeholder="開始"
                     end-placeholder="終了"
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
                     v-hasPermi="['system:user:add']"
                  >新規作成</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="success"
                     plain
                     icon="Edit"
                     :disabled="single"
                     @click="handleUpdate"
                     v-hasPermi="['system:user:edit']"
                  >変更</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="danger"
                     plain
                     icon="Delete"
                     :disabled="multiple"
                     @click="handleDelete"
                     v-hasPermi="['system:user:remove']"
                  >削除</el-button>
               </el-col>
<!--               <el-col :span="1.5">-->
<!--                  <el-button-->
<!--                     type="info"-->
<!--                     plain-->
<!--                     icon="Upload"-->
<!--                     @click="handleImport"-->
<!--                     v-hasPermi="['system:user:import']"-->
<!--                  >インポート</el-button>-->
<!--               </el-col>-->
<!--               <el-col :span="1.5">-->
<!--                  <el-button-->
<!--                     type="warning"-->
<!--                     plain-->
<!--                     icon="Download"-->
<!--                     @click="handleExport"-->
<!--                     v-hasPermi="['system:user:export']"-->
<!--                  >エクスポート</el-button>-->
<!--               </el-col>-->
<!--               <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>-->
            </el-row>

            <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
               <el-table-column type="selection" width="50" align="center" />
               <el-table-column label="ユーザ番号" align="center" key="userId" prop="userId" v-if="columns[0].visible" />
               <el-table-column label="メールアドレス" align="center" key="userName" prop="userName" v-if="columns[1].visible" :show-overflow-tooltip="true" />
               <el-table-column label=ユーザのニックネーム align="center" key="nickName" prop="nickName" v-if="columns[2].visible" :show-overflow-tooltip="true" />
               <el-table-column label="施設" align="center" key="deptName" prop="dept.deptName" v-if="columns[3].visible" :show-overflow-tooltip="true" />
               <el-table-column label="携帯番号" align="center" key="phonenumber" prop="phonenumber" v-if="columns[4].visible" width="120" />
               <el-table-column label="ステータス" align="center" key="status" v-if="columns[5].visible">
                  <template #default="scope">
                     <el-switch
                        v-model="scope.row.status"
                        active-value="0"
                        inactive-value="1"
                        @change="handleStatusChange(scope.row)"
                     ></el-switch>
                  </template>
               </el-table-column>
               <el-table-column label="作成日時" align="center" prop="createTime" v-if="columns[6].visible" width="160">
                  <template #default="scope">
                     <span>{{ parseTime(scope.row.createTime) }}</span>
                  </template>
               </el-table-column>
               <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
                  <template #default="scope">
                     <el-tooltip content="変更" placement="top" v-if="scope.row.userId !== 1">
                        <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:user:edit']"></el-button>
                     </el-tooltip>
                     <el-tooltip content="削除" placement="top" v-if="scope.row.userId !== 1">
                        <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:user:remove']"></el-button>
                     </el-tooltip>
                     <el-tooltip content="パスワードのリセット" placement="top" v-if="scope.row.userId !== 1">
                         <el-button link type="primary" icon="Key" @click="handleResetPwd(scope.row)" v-hasPermi="['system:user:resetPwd']"></el-button>
                     </el-tooltip>
<!--                     <el-tooltip content="ロールの割り当て" placement="top" v-if="scope.row.userId !== 1">-->
<!--                        <el-button link type="primary" icon="CircleCheck" @click="handleAuthRole(scope.row)" v-hasPermi="['system:user:edit']"></el-button>-->
<!--                     </el-tooltip>-->
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
         </el-col>
      </el-row>

      <!-- 追加または修正ユーザ構成ダイアログボックス -->
      <el-dialog :title="title" v-model="open" width="990px" append-to-body>
         <el-form :model="form" :rules="rules" ref="userRef" label-width="120px">
            <el-row :gutter="20" style="padding-top: 10px">
               <el-col :span="11">
                  <el-form-item label="所属施設" prop="deptId">
                     <el-tree-select
                        v-model="form.deptId"
                        :data="deptOptions"
                        :props="{ value: 'id', label: 'label', children: 'children' }"
                        value-key="id"
                        placeholder="所属施設を選択してください"
                        check-strictly
                     />
                  </el-form-item>
               </el-col>
              <el-col :span="13">
                <!--                  <el-form-item label=ユーザのニックネーム prop="nickName">-->
                <!--                     <el-input v-model="form.nickName" placeholder="ユーザのニックネームを入力してください" maxlength="30" />-->
                <!--                  </el-form-item>-->
              </el-col>
            </el-row>
<!--            <el-row>-->
<!--               <el-col :span="12">-->
<!--                  <el-form-item label="携帯番号" prop="phonenumber">-->
<!--                     <el-input v-model="form.phonenumber" placeholder="携帯番号を入力してください" maxlength="11" />-->
<!--                  </el-form-item>-->
<!--               </el-col>-->
<!--               <el-col :span="12">-->
<!--                  <el-form-item label="メールアドレス" prop="email">-->
<!--                     <el-input v-model="form.email" placeholder="メールアドレスを入力してください" maxlength="50" />-->
<!--                  </el-form-item>-->
<!--               </el-col>-->
<!--            </el-row>-->
            <el-row :gutter="20" v-if="form.userId == undefined" style="padding-top: 10px">
               <el-col :span="11">
                  <el-form-item label="メールアドレス" prop="userName">
                     <el-input v-model="form.userName" placeholder="メールアドレスを入力してください" maxlength="50"
                               autocomplete="new-username"/>
                  </el-form-item>
               </el-col>
               <el-col :span="9">
                  <el-form-item label="パスワード" prop="password">
                     <el-input v-model="form.password" placeholder="パスワードを入力してください" type="password" maxlength="15" show-password autocomplete="new-password"/>
                  </el-form-item>
               </el-col>
              <el-col :span="4">
                <el-button type="primary" plain @click="handleGenerate">パスワード生成</el-button>
              </el-col>
            </el-row>
            <el-row :gutter="20" style="padding-top: 10px">
<!--               <el-col :span="12">-->
<!--                  <el-form-item label="ユーザの性別">-->
<!--                     <el-select v-model="form.sex" placeholder="選択してください">-->
<!--                        <el-option-->
<!--                           v-for="dict in sys_user_sex"-->
<!--                           :key="dict.value"-->
<!--                           :label="dict.label"-->
<!--                           :value="dict.value"-->
<!--                        ></el-option>-->
<!--                     </el-select>-->
<!--                  </el-form-item>-->
<!--               </el-col>-->
              <el-col :span="11">
                <el-form-item label="ロール" prop="roleIds">
                  <el-select v-model="form.roleIds" multiple placeholder="選択してください">
                    <el-option
                        v-for="item in roleOptions"
                        :key="item.roleId"
                        :label="item.roleName"
                        :value="item.roleId"
                        :disabled="item.status == 1"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
               <el-col :span="13">
                  <el-form-item label="ステータス">
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
<!--            <el-row :gutter="20">-->
<!--               <el-col :span="12">-->
<!--                  <el-form-item label="ポジション">-->
<!--                     <el-select v-model="form.postIds" multiple placeholder="選択してください">-->
<!--                        <el-option-->
<!--                           v-for="item in postOptions"-->
<!--                           :key="item.postId"-->
<!--                           :label="item.postName"-->
<!--                           :value="item.postId"-->
<!--                           :disabled="item.status == 1"-->
<!--                        ></el-option>-->
<!--                     </el-select>-->
<!--                  </el-form-item>-->
<!--               </el-col>-->
<!--               <el-col :span="12">-->
<!--                  <el-form-item label="ロール">-->
<!--                     <el-select v-model="form.roleIds" multiple placeholder="選択してください">-->
<!--                        <el-option-->
<!--                           v-for="item in roleOptions"-->
<!--                           :key="item.roleId"-->
<!--                           :label="item.roleName"-->
<!--                           :value="item.roleId"-->
<!--                           :disabled="item.status == 1"-->
<!--                        ></el-option>-->
<!--                     </el-select>-->
<!--                  </el-form-item>-->
<!--               </el-col>-->
<!--            </el-row>-->
            <el-row :gutter="20" style="padding-top: 10px">
               <el-col :span="24">
                  <el-form-item label="備考">
                     <el-input v-model="form.remark" :maxlength="500"  type="textarea" placeholder="内容を入力してください"></el-input>
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

      <!-- ユーザインポートダイアログボックス -->
      <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
         <el-upload
            ref="uploadRef"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="upload.headers"
            :action="upload.url + '?updateSupport=' + upload.updateSupport"
            :disabled="upload.isUploading"
            :on-progress="handleFileUploadProgress"
            :on-success="handleFileSuccess"
            :auto-upload="false"
            drag
         >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">ファイルをここにドラッグするか、<em>[アップロード]</em>をクリックします</div>
            <template #tip>
               <div class="el-upload__tip text-center">
                  <div class="el-upload__tip">
                     <el-checkbox v-model="upload.updateSupport" />既存のユーザデータを更新しますか
                  </div>
                  <span>xls、xlsx形式ファイルのインポートのみが許可されます。</span>
                  <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">テンプレートのダウンロード</el-link>
               </div>
            </template>
         </el-upload>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitFileForm">確 定</el-button>
               <el-button @click="upload.open = false">キャンセル</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="User">
import { getToken } from "@/utils/auth";
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, deptTreeSelect } from "@/api/system/user";

const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_normal_disable, sys_user_sex } = proxy.useDict("sys_normal_disable", "sys_user_sex");

const userList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const deptName = ref("");
const deptOptions = ref(undefined);
const initPassword = ref(undefined);
const postOptions = ref([]);
const roleOptions = ref([]);
/*** ユーザインポートパラメータ */
const upload = reactive({
  // ポップアップ層（ユーザインポート）
  open: false,
  // ポップアップ層タイトル（ユーザインポート）
  title: "",
  // アプロードを無効にするかどうか
  isUploading: false,
  // 既存のユザデータを更新するかどうか
  updateSupport: 0,
  // アップロードのリクエスト設定
  headers: { Authorization: "Bearer " + getToken() },
  // アップロードのアドレス
  url: import.meta.env.VITE_APP_BASE_API + "/system/user/importData"
});
// 列显隐情報
const columns = ref([
  { key: 0, label: `ユーザ番号`, visible: true },
  { key: 1, label: `メールアドレス`, visible: true },
  { key: 2, label: `ユーザのニックネーム`, visible: false },
  { key: 3, label: `施設`, visible: true },
  { key: 4, label: `携帯番号`, visible: false },
  { key: 5, label: `ステータス`, visible: true },
  { key: 6, label: `作成日時`, visible: true }
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    phonenumber: undefined,
    status: undefined,
    deptId: undefined
  },
  rules: {
    userName: [{ required: true, message: "メールアドレスのご入力は必須です。", trigger: "blur" }, { min: 2, max: 50, message: "2～50文字の長さが必要です。", trigger: "blur" }, { type: "email", message: "正しいメールアドレスを入力してください", trigger: ["blur", "change"] }],
    // nickName: [{ required: true, message: "ユーザニックネームのご入力は必須です。", trigger: "blur" }],
    password: [{ required: true, message: "パスワードのご入力は必須です。", trigger: "blur" }, { min: 8, max: 15, message: proxy.message.common.Common_E0006, trigger: "blur" }, { pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[`~!@#$%^&*()\-_=+\[{\]};:'",<.>/?\\|]).{8,}$/, message: proxy.message.common.Common_E0007, trigger: "blur" }],
    deptId: [{ required: true, message: "所属施設のご入力は必須です。", trigger: "blur" }],
    roleIds: [{ required: true, message: "ロールのご入力は必須です。", trigger: "blur" }],
    // email: [{ type: "email", message: "正しいメールアドレスを入力してください", trigger: ["blur", "change"] }],
    // phonenumber: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "正しい携帯番号を入力してください", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 条件付きフィルタノード  */
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};
/** 名前による部門ツリーのフィルタ */
watch(deptName, val => {
  proxy.$refs["deptTreeRef"].filter(val);
});
/** 部門ドロップダウン・ツリー構造 */
function getDeptTree() {
  deptTreeSelect().then(response => {
    deptOptions.value = response.data;
  });
};
/** ユーザリスト */
function getList() {
  loading.value = true;
  listUser(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
    loading.value = false;
    userList.value = res.rows;
    total.value = res.total;
  });
};
/** ノードクリックイベント */
function handleNodeClick(data) {
  queryParams.value.deptId = data.id;
  handleQuery();
};
/** 検索ボタン操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
};
/** リセットボタン操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  queryParams.value.deptId = undefined;
  proxy.$refs.deptTreeRef.setCurrentKey(null);
  handleQuery();
};
/** 削除ボタン操作 */
function handleDelete(row) {
  const userIds = row.userId || ids.value;
  proxy.$modal.confirm('ユーザ番号が「' + userIds + '」のデータ項目を削除しますか。').then(function () {
    return delUser(userIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除に成功しました");
  }).catch(() => {});
};
/** エクスポートボタン操作 */
function handleExport() {
  proxy.download("system/user/export", {
    ...queryParams.value,
  },`user_${new Date().getTime()}.xlsx`);
};
/** ユーザステータス修正  */
function handleStatusChange(row) {
  let text = row.status === "0" ? "正常" : "停止";
  proxy.$modal.confirm('"' +row.userName +'"' + 'ユーザのステータスを'+ text +'に変更しますか？').then(function () {
    return changeUserStatus(row.userId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess("ステータスが『"+ text +"』に変更されました。");
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
};
/** その他の操作 */
function handleCommand(command, row) {
  switch (command) {
    case "handleResetPwd":
      handleResetPwd(row);
      break;
    case "handleAuthRole":
      handleAuthRole(row);
      break;
    default:
      break;
  }
};
/** ジャンプロール割り当て */
function handleAuthRole(row) {
  const userId = row.userId;
  router.push("/system/user-auth/role/" + userId);
};
/** リセットパスワードボタン操作 */
function handleResetPwd(row) {
  proxy.$prompt('ユーザ"' + row.userName + '"の新しいパスワードを入力してください', "ヒント", {
    confirmButtonText: "確定",
    cancelButtonText: "キャンセル",
    closeOnClickModal: false,
    inputPattern: /^.{8,15}$/,
    inputErrorMessage: proxy.message.common.Common_E0006,
    inputValidator: (value) => {
      if (!(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[`~!@#$%^&*()\-_=+\[{\]};:'",<.>/?\\|]).{8,}$/.test(value))) {
        return proxy.message.common.Common_E0007
      }
    },
    customClass: 'custom-reset-pwd-dialog',
  }).then(({ value }) => {
    resetUserPwd(row.userId, value).then(response => {
      proxy.$modal.msgSuccess("変更に成功しました。新しいパスワードは" + value + "です。");
    });
  }).catch(() => {});
};
/** 選択項目数  */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.userId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};
/** インポートボタン操作 */
function handleImport() {
  upload.title = "ユーザのインポート";
  upload.open = true;
};
/** ダウンロードテンプレート操作 */
function importTemplate() {
  proxy.download("system/user/importTemplate", {
  }, `user_template_${new Date().getTime()}.xlsx`);
};
/**ファイルアップロード中処理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};
/** ファイルアップロード成功処理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  proxy.$refs["uploadRef"].handleRemove(file);
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "インポート結果", { dangerouslyUseHTMLString: true });
  getList();
};
/** アップロードファイルのコミット */
function submitFileForm() {
  proxy.$refs["uploadRef"].submit();
};
/** リセット操作Form */
function reset() {
  form.value = {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: "default",
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: "0",
    remark: undefined,
    postIds: [],
    roleIds: []
  };
  proxy.resetForm("userRef");
};
/** 取消ボタン */
function cancel() {
  open.value = false;
  reset();
};
/** 新規ボタン操作 */
function handleAdd() {
  reset();
  getUser().then(response => {
    postOptions.value = response.posts;
    roleOptions.value = response.roles;
    open.value = true;
    title.value = "ユーザの追加";
    form.value.password = initPassword.value;
  });
};
/** 修正ボタン操作 */
function handleUpdate(row) {
  reset();
  const userId = row.userId || ids.value;
  getUser(userId).then(response => {
    form.value = response.data;
    postOptions.value = response.posts;
    roleOptions.value = response.roles;
    form.value.postIds = response.postIds;
    form.value.roleIds = response.roleIds;
    open.value = true;
    title.value = "修正ユーザ";
    form.password = "";
  });
};
/** commitボタン */
function submitForm() {
  proxy.$refs["userRef"].validate(valid => {
    if (valid) {
      if (form.value.userId != undefined) {
        updateUser(form.value).then(response => {
          proxy.$modal.msgSuccess("変更に成功しました。");
          open.value = false;
          getList();
        });
      } else {
        addUser(form.value).then(response => {
          proxy.$modal.msgSuccess("新規追加に成功しました");
          open.value = false;
          getList();
        });
      }
    }
  });
};
onActivated(()=>{
  getDeptTree();
})

getDeptTree();
getList();

const handleGenerate = () => {
  let lower = "abcdefghijklmnopqrstuvwxyz";
  let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let num = "1234567890";
  let symbol = "~!@#$%^&*()_+{}:',./";
  let password = "";
  password += lower[randomInteger(0, lower.length - 1)];
  password += upper[randomInteger(0, upper.length - 1)];
  password += num[randomInteger(0, num.length - 1)];
  password += symbol[randomInteger(0, symbol.length - 1)];
  let rest = 6;
  for (let i = 1; i <= rest; i++) {
    let randomNum = randomInteger(0, 3);
    if (randomNum === 0) {
      password += lower[randomInteger(0, lower.length - 1)];
    } else if (randomNum === 1){
      password += upper[randomInteger(0, upper.length - 1)];
    } else if (randomNum === 2){
      password += num[randomInteger(0, num.length - 1)];
    } else {
      password += symbol[randomInteger(0, symbol.length - 1)];
    }
  }
  form.value.password = shuffleString(password);
}
function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function shuffleString(str) {
  let arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}
</script>
<style>
.custom-reset-pwd-dialog {
  height: 195px !important;
  overflow-y: auto;
}
.el-message-box__content {
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>