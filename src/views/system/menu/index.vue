<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="メニュー名" prop="menuName">
            <el-input
               v-model="queryParams.menuName"
               placeholder="メニュー名を入力してください"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="ステータス" prop="status">
            <el-select v-model="queryParams.status" placeholder="メニューのステータス" clearable style="width: 200px">
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
               v-hasPermi="['system:menu:add']"
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
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table
         v-if="refreshTable"
         v-loading="loading"
         :data="menuList"
         row-key="menuId"
         :default-expand-all="isExpandAll"
         :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
         <el-table-column prop="menuName" label="メニュー名" :show-overflow-tooltip="true" width="160"></el-table-column>
         <el-table-column prop="icon" label="アイコン" align="center" width="100">
            <template #default="scope">
               <svg-icon :icon-class="scope.row.icon" />
            </template>
         </el-table-column>
         <el-table-column prop="orderNum" label="ソート" width="60"></el-table-column>
         <el-table-column prop="perms" label="権限ID" :show-overflow-tooltip="true"></el-table-column>
         <el-table-column prop="component" label="コンポーネントパス" :show-overflow-tooltip="true"></el-table-column>
         <el-table-column prop="status" label="ステータス" width="80">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="作成日時" align="center" width="160" prop="createTime">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="210" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:menu:edit']">変更</el-button>
               <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:menu:add']">新規作成</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:menu:remove']">削除</el-button>
            </template>
         </el-table-column>
      </el-table>

      <!-- 追加または修正メニューダイアログボックス -->
      <el-dialog :title="title" v-model="open" width="680px" append-to-body>
         <el-form ref="menuRef" :model="form" :rules="rules" label-width="100px">
            <el-row>
               <el-col :span="24">
                  <el-form-item label="親メニュー">
                     <el-tree-select
                        v-model="form.parentId"
                        :data="menuOptions"
                        :props="{ value: 'menuId', label: 'menuName', children: 'children' }"
                        value-key="menuId"
                        placeholder="親メニュを選択してください"
                        check-strictly
                     />
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="メニューの種類" prop="menuType">
                     <el-radio-group v-model="form.menuType">
                        <el-radio label="M">ディレクトリ</el-radio>
                        <el-radio label="C">メニュー</el-radio>
                        <el-radio label="F">ボタン</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="24" v-if="form.menuType != 'F'">
                  <el-form-item label="メニューアイコン" prop="icon">
                     <el-popover
                        placement="bottom-start"
                        :width="540"
                        trigger="click"
                     >
                        <template #reference>
                           <el-input v-model="form.icon" placeholder="選択アイコンをクリック" @blur="showSelectIcon" readonly>
                              <template #prefix>
                                 <svg-icon
                                    v-if="form.icon"
                                    :icon-class="form.icon"
                                    class="el-input__icon"
                                    style="height: 32px;width: 16px;"
                                 />
                                 <el-icon v-else style="height: 32px;width: 16px;"><search /></el-icon>
                              </template>
                           </el-input>
                        </template>
                        <icon-select ref="iconSelectRef" @selected="selected" :active-icon="form.icon" />
                     </el-popover>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="メニュー名" prop="menuName">
                     <el-input v-model="form.menuName" placeholder="メニュー名を入力してください" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="ソートを表示" prop="orderNum">
                     <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType != 'F'">
                  <el-form-item>
                     <template #label>
                        <span>
                           <el-tooltip content="外部リンクを選択する場合は、ルーティングアドレスは` http（s）：/`で始まる必要があります" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>外部リンクかどうか
                        </span>
                     </template>
                     <el-radio-group v-model="form.isFrame">
                        <el-radio label="0">はい</el-radio>
                        <el-radio label="1">いいえ</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType != 'F'">
                  <el-form-item prop="path">
                     <template #label>
                        <span>
                           <el-tooltip content="アクセスするルーティングアドレス（例：` user `、外部ネットワークアドレスがイントラリンクアクセスを必要とする場合は` http（s）：/`で始まる" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           ルーティングアドレス
                        </span>
                     </template>
                     <el-input v-model="form.path" placeholder="ルーティングアドレスを入力してください" />
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType == 'C'">
                  <el-form-item prop="component">
                     <template #label>
                        <span>
                           <el-tooltip content="アクセスのコンポーネントパス，如：`system/user/index`，デフォルト在`views`ディレクトリ下" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           コンポーネントパス
                        </span>
                     </template>
                     <el-input v-model="form.component" placeholder="コンポーネントパスを入力してください" />
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType != 'M'">
                  <el-form-item>
                     <el-input v-model="form.perms" placeholder="権限識別子を入力してください" maxlength="100" />
                     <template #label>
                        <span>
                           <el-tooltip content="制御中に定義される権限文字、例えば：@PreAuthorize(`@ss.hasPermi('system:user:list')`)" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           権限文字
                        </span>
                     </template>
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType == 'C'">
                  <el-form-item>
                     <el-input v-model="form.query" placeholder="ルーティングパラメータを入力してください" maxlength="255" />
                     <template #label>
                        <span>
                           <el-tooltip content='アクセスルーティングのデフォルト転送パラメータ，例えば：`{"id": 1, "name": "ry"}`' placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           ルーティングパラメータ
                        </span>
                     </template>
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType == 'C'">
                  <el-form-item>
                     <template #label>
                        <span>
                           <el-tooltip content="「Yes」を選択すると、`keep-alive`キャッシュ，コンポーネントの`name`とアドレスを一致させる必要がある" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           キャッシュ
                        </span>
                     </template>
                     <el-radio-group v-model="form.isCache">
                        <el-radio label="0">キャッシュ</el-radio>
                        <el-radio label="1">不キャッシュ</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType != 'F'">
                  <el-form-item>
                     <template #label>
                        <span>
                           <el-tooltip content="非表示を選択すると、ルーティングはサイドバーには表示されませんが、アクセスできます" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           ステータスの表示
                        </span>
                     </template>
                     <el-radio-group v-model="form.visible">
                        <el-radio
                           v-for="dict in sys_show_hide"
                           :key="dict.value"
                           :label="dict.value"
                        >{{ dict.label }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item>
                     <template #label>
                        <span>
                           <el-tooltip content="非アクティブを選択すると、ルーティングはサイドバーに表示されず、アクセスできなくなります" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           メニューのステータス
                        </span>
                     </template>
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

<script setup name="Menu">
import { addMenu, delMenu, getMenu, listMenu, updateMenu } from "@/api/system/menu";
import SvgIcon from "@/components/SvgIcon";
import IconSelect from "@/components/IconSelect";

const { proxy } = getCurrentInstance();
const { sys_show_hide, sys_normal_disable } = proxy.useDict("sys_show_hide", "sys_normal_disable");

const menuList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const menuOptions = ref([]);
const isExpandAll = ref(false);
const refreshTable = ref(true);
const iconSelectRef = ref(null);

const data = reactive({
  form: {},
  queryParams: {
    menuName: undefined,
    visible: undefined
  },
  rules: {
    menuName: [{ required: true, message: "メニュー名のご入力は必須です。", trigger: "blur" }],
    orderNum: [{ required: true, message: "メニュー順序のご入力は必須です。", trigger: "blur" }],
    path: [{ required: true, message: "ルーティングアドレスのご入力は必須です。", trigger: "blur" }]
  },
});

const { queryParams, form, rules } = toRefs(data);

/** メニューリスト */
function getList() {
  loading.value = true;
  listMenu(queryParams.value).then(response => {
    menuList.value = proxy.handleTree(response.data, "menuId");
    loading.value = false;
  });
}
/** メニュドロップダウンツリー構造 */
function getTreeselect() {
  menuOptions.value = [];
  listMenu().then(response => {
    const menu = { menuId: 0, menuName: "メインカテゴリー", children: [] };
    menu.children = proxy.handleTree(response.data, "menuId");
    menuOptions.value.push(menu);
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
    menuId: undefined,
    parentId: 0,
    menuName: undefined,
    icon: undefined,
    menuType: "M",
    orderNum: undefined,
    isFrame: "1",
    isCache: "0",
    visible: "0",
    status: "0"
  };
  proxy.resetForm("menuRef");
}
/** ドロップダウンアイコンを表示 */
function showSelectIcon() {
  iconSelectRef.value.reset();
}
/** アイコンを選択 */
function selected(name) {
  form.value.icon = name;
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
  getTreeselect();
  if (row != null && row.menuId) {
    form.value.parentId = row.menuId;
  } else {
    form.value.parentId = 0;
  }
  open.value = true;
  title.value = "メニューの追加";
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
async function handleUpdate(row) {
  reset();
  await getTreeselect();
  getMenu(row.menuId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "メニューの変更";
  });
}
/** commitボタン */
function submitForm() {
  proxy.$refs["menuRef"].validate(valid => {
    if (valid) {
      if (form.value.menuId != undefined) {
        updateMenu(form.value).then(response => {
          proxy.$modal.msgSuccess("変更に成功しました。");
          open.value = false;
          getList();
        });
      } else {
        addMenu(form.value).then(response => {
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
  proxy.$modal.confirm('「' + row.menuName + '」を削除しますか').then(function() {
    return delMenu(row.menuId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("削除に成功しました");
  }).catch(() => {});
}

getList();
</script>
