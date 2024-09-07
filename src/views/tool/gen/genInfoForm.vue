<template>
  <el-form ref="genInfoForm" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item prop="tplCategory">
          <template #label>テンプレートの生成</template>
          <el-select v-model="info.tplCategory" @change="tplSelectChange">
            <el-option label="シングルテーブル" value="crud" />
            <el-option label="ツリーテーブル" value="tree" />
            <el-option label="主子テーブル" value="sub" />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="tplWebType">
          <template #label>タイプ</template>
          <el-select v-model="info.tplWebType">
            <el-option label="Vue2 Element UI テンプレート" value="element-ui" />
            <el-option label="Vue3 Element Plus テンプレート" value="element-plus" />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="packageName">
          <template #label>
            生成パケットパス
            <el-tooltip content="どのjavaパッケージの下に生成されるか、例えばcom.ruoyi.system" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.packageName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="moduleName">
          <template #label>
            生成モジュール名
            <el-tooltip content="サブシステム名として理解することができ、例えば system" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.moduleName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="businessName">
          <template #label>
            生成業務名
            <el-tooltip content="機能英文名として理解することができ、例えば user" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.businessName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="functionName">
          <template #label>
            生成機能名
            <el-tooltip content="クラスの説明として、例えば ユーザ" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.functionName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="genType">
          <template #label>
            コード生成方式
            <el-tooltip content="デフォルトはzip圧縮ファイルダウンロードで、生成パスをカスタマイズすることもできます" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-radio v-model="info.genType" label="0">zip圧縮ファイル</el-radio>
          <el-radio v-model="info.genType" label="1">カスタムパス</el-radio>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item>
          <template #label>
            親メニュー
            <el-tooltip content="指定されたメニュの下に割り当てられます。例えば、システム管理" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <tree-select
            v-model:value="info.parentMenuId"
            :options="menuOptions"
            :objMap="{ value: 'menuId', label: 'menuName', children: 'children' }"
            placeholder="システムメニューを選択してください"
          />
        </el-form-item>
      </el-col>

      <el-col :span="24" v-if="info.genType == '1'">
        <el-form-item prop="genPath">
          <template #label>
            カスタムパス
            <el-tooltip content="ディスクの絶対パスを記入し、記入しなければ、現在のWebプロジェクトの下に生成される" placement="top">
              <el-icon><question-filled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.genPath">
            <template #append>
              <el-dropdown>
                <el-button type="primary">
                  最近のパスのクイック選択
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="info.genPath = '/'">リカバリ・フォルトの生成基盤パス</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>
    
    <template v-if="info.tplCategory == 'tree'">
      <h4 class="form-header">その他情報</h4>
      <el-row v-show="info.tplCategory == 'tree'">
        <el-col :span="12">
          <el-form-item>
            <template #label>
              ツリーコードフィールド
              <el-tooltip content="ツリーに表示されるコードフィールド名、例えば、：dept_id" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeCode" placeholder="選択してください">
              <el-option
                v-for="(column, index) in info.columns"
                :key="index"
                :label="column.columnName + '：' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              树親コードフィールド
              <el-tooltip content="ツリーに表示される親コードの名前。例えば、parent_Id" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeParentCode" placeholder="選択してください">
              <el-option
                v-for="(column, index) in info.columns"
                :key="index"
                :label="column.columnName + '：' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              树名フィールド
              <el-tooltip content="ツリーノードの表示名フィールド名、 例えば：dept_name" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.treeName" placeholder="選択してください">
              <el-option
                v-for="(column, index) in info.columns"
                :key="index"
                :label="column.columnName + '：' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <template v-if="info.tplCategory == 'sub'">
      <h4 class="form-header">関連情報</h4>
      <el-row>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              関連子テーブルのテーブル名
              <el-tooltip content="関連子テーブルのテーブル名， 例えば：sys_user" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.subTableName" placeholder="選択してください" @change="subSelectChange">
              <el-option
                v-for="(table, index) in tables"
                :key="index"
                :label="table.tableName + '：' + table.tableComment"
                :value="table.tableName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label>
              子テーブル関連の外キー名
              <el-tooltip content="子テーブル関連の外キー名， 如：user_id" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </template>
            <el-select v-model="info.subTableFkName" placeholder="選択してください">
              <el-option
                v-for="(column, index) in subColumns"
                :key="index"
                :label="column.columnName + '：' + column.columnComment"
                :value="column.columnName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

  </el-form>
</template>

<script setup>
import { listMenu } from "@/api/system/menu";

const subColumns = ref([]);
const menuOptions = ref([]);
const { proxy } = getCurrentInstance();

const props = defineProps({
  info: {
    type: Object,
    default: null
  },
  tables: {
    type: Array,
    default: null
  }
});

// Form検証
const rules = ref({
  tplCategory: [{ required: true, message: "テンプレートの生成を選択してください", trigger: "blur" }],
  packageName: [{ required: true, message: "生成パケットパスを入力してください", trigger: "blur" }],
  moduleName: [{ required: true, message: "生成モジュール名を入力します。", trigger: "blur" }],
  businessName: [{ required: true, message: "作成業務名の入力をお願いします。", trigger: "blur" }],
  functionName: [{ required: true, message: "生成機能名を入力願います", trigger: "blur" }]
});
function subSelectChange(value) {
  props.info.subTableFkName = "";
}
function tplSelectChange(value) {
  if (value !== "sub") {
    props.info.subTableName = "";
    props.info.subTableFkName = "";
  }
}
function setSubTableColumns(value) {
  for (var item in props.tables) {
    const name = props.tables[item].tableName;
    if (value === name) {
      subColumns.value = props.tables[item].columns;
      break;
    }
  }
}
/** メニュー */
function getMenuTreeselect() {
  listMenu().then(response => {
    menuOptions.value = proxy.handleTree(response.data, "menuId");
  });
}

watch(() => props.info.subTableName, val => {
  setSubTableColumns(val);
});

watch(() => props.info.tplWebType, val => {
  if (val === '') {
    props.info.tplWebType = "element-plus";
  }
});

getMenuTreeselect();
</script>
