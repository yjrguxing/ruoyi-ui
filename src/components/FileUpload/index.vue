<template>
  <div class="upload-file">
    <el-upload
      multiple
      :action="uploadFileUrl"
      :before-upload="handleBeforeUpload"
      :file-list="fileList"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :show-file-list="false"
      :headers="headers"
      class="upload-file-uploader"
      ref="fileUpload"
    >
      <!-- アップロードボタン -->
      <el-button type="primary">ファイルの選択</el-button>
    </el-upload>
    <!-- アップロードヒント -->
    <div class="el-upload__tip" v-if="showTip">
      アップロード
      <template v-if="fileSize"> サイズは<b style="color:#f56c6c">{{fileSize}}MBを超えない</b> </template>
      <template v-if="fileType"> フォーマット <b style="color: #f56c6c">{{ fileType.join("/") }}</b> </template>
      のファイル
    </div>
    <!-- ファイルリスト -->
    <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
      <li :key="file.uid" class="el-upload-list__item ele-upload-list__item-content" v-for="(file, index) in fileList">
        <el-link :href="`${baseUrl}${file.url}`" :underline="false" target="_blank">
          <span class="el-icon-document"> {{ getFileName(file.name) }} </span>
        </el-link>
        <div class="ele-upload-list__item-content-action">
          <el-link :underline="false" @click="handleDelete(index)" type="danger">削除</el-link>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script setup>
import { getToken } from "@/utils/auth";

const props = defineProps({
  modelValue: [String, Object, Array],
  // 数量制限
  limit: {
    type: Number,
    default: 5,
  },
  // サイズ制限（MB）
  fileSize: {
    type: Number,
    default: 5,
  },
  // ファイルタイプ, 例['png', 'jpg', 'jpeg']
  fileType: {
    type: Array,
    default: () => ["doc", "xls", "ppt", "txt", "pdf"],
  },
  // ヒートを表示するかどうか
  isShowTip: {
    type: Boolean,
    default: true
  }
});

const { proxy } = getCurrentInstance();
const emit = defineEmits();
const number = ref(0);
const uploadList = ref([]);
const baseUrl = import.meta.env.VITE_APP_BASE_API;
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/common/upload"); // アップロードファイルサービスアドレス
const headers = ref({ Authorization: "Bearer " + getToken() });
const fileList = ref([]);
const showTip = computed(
  () => props.isShowTip && (props.fileType || props.fileSize)
);

watch(() => props.modelValue, val => {
  if (val) {
    let temp = 1;
    // まず値を配列に変換
    const list = Array.isArray(val) ? val : props.modelValue.split(',');
    // 次に、配列をオブジェクト配列に変換します
    fileList.value = list.map(item => {
      if (typeof item === "string") {
        item = { name: item, url: item };
      }
      item.uid = item.uid || new Date().getTime() + temp++;
      return item;
    });
  } else {
    fileList.value = [];
    return [];
  }
},{ deep: true, immediate: true });

// 前の校正フォーマットとサイズ
function handleBeforeUpload(file) {
  // ファイルタイプ
  if (props.fileType.length) {
    const fileName = file.name.split('.');
    const fileExt = fileName[fileName.length - 1];
    const isTypeOk = props.fileType.indexOf(fileExt) >= 0;
    if (!isTypeOk) {
      proxy.$modal.msgError(`ファイルフォーマットが正しくありません。${props.fileType.join("/")}フォーマットファイルをアップロードしてください!`);
      return false;
    }
  }
  // フィルサイズ
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      proxy.$modal.msgError(`アプロアドファイルサイズは${props.fileSize}MBを超えてはいけません!`);
      return false;
    }
  }
  proxy.$modal.loading("アプロドファイア中です、少々お待ちください...");
  number.value++;
  return true;
}

// ファイア個数超過
function handleExceed() {
  proxy.$modal.msgError(`アプロアドファイル数は${props.limit}個を超えてはならない!`);
}

// アップロード失敗
function handleUploadError(err) {
  proxy.$modal.msgError("アップロードファイル失敗");
}

// ステップロード成功コールバック
function handleUploadSuccess(res, file) {
  if (res.code === 200) {
    uploadList.value.push({ name: res.fileName, url: res.fileName });
    uploadedSuccessfully();
  } else {
    number.value--;
    proxy.$modal.closeLoading();
    proxy.$modal.msgError(res.msg);
    proxy.$refs.fileUpload.handleRemove(file);
    uploadedSuccessfully();
  }
}

// ファイル削除
function handleDelete(index) {
  fileList.value.splice(index, 1);
  emit("update:modelValue", listToString(fileList.value));
}

// アップロード終了処理
function uploadedSuccessfully() {
  if (number.value > 0 && uploadList.value.length === number.value) {
    fileList.value = fileList.value.filter(f => f.url !== undefined).concat(uploadList.value);
    uploadList.value = [];
    number.value = 0;
    emit("update:modelValue", listToString(fileList.value));
    proxy.$modal.closeLoading();
  }
}

// ファイル名
function getFileName(name) {
  // urlの場合は最終的な名前を付けて直接返さない
  if (name.lastIndexOf("/") > -1) {
    return name.slice(name.lastIndexOf("/") + 1);
  } else {
    return name;
  }
}

// オブジェクトが指定されたテキスト区切りに変換されます
function listToString(list, separator) {
  let strs = "";
  separator = separator || ",";
  for (let i in list) {
    if (list[i].url) {
      strs += list[i].url + separator;
    }
  }
  return strs != '' ? strs.substr(0, strs.length - 1) : '';
}
</script>

<style scoped lang="scss">
.upload-file-uploader {
  margin-bottom: 5px;
}
.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  line-height: 2;
  margin-bottom: 10px;
  position: relative;
}
.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}
.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}
</style>
