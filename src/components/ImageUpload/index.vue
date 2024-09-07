<template>
  <div class="component-upload-image">
    <el-upload
      multiple
      :action="uploadImgUrl"
      list-type="picture-card"
      :on-success="handleUploadSuccess"
      :before-upload="handleBeforeUpload"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      ref="imageUpload"
      :before-remove="handleDelete"
      :show-file-list="true"
      :headers="headers"
      :file-list="fileList"
      :on-preview="handlePictureCardPreview"
      :class="{ hide: fileList.length >= limit }"
    >
      <el-icon class="avatar-uploader-icon"><plus /></el-icon>
    </el-upload>
    <!-- アップロードヒント -->
    <div class="el-upload__tip" v-if="showTip">
      アップロード
      <template v-if="fileSize">
        大きさは <b style="color: #f56c6c">{{ fileSize }}MB以下</b>
      </template>
      <template v-if="fileType">
        フォーマットは <b style="color: #f56c6c">{{ fileType.join("/") }}</b>
      </template>
      のファイル
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="プレビュー"
      width="800px"
      append-to-body
    >
      <img
        :src="dialogImageUrl"
        style="display: block; max-width: 100%; margin: 0 auto"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { getToken } from "@/utils/auth";

const props = defineProps({
  modelValue: [String, Object, Array],
  // 制限
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
    default: () => ["png", "jpg", "jpeg"],
  },
  // ヒートを表示するかどうか
  isShowTip: {
    type: Boolean,
    default: true
  },
});

const { proxy } = getCurrentInstance();
const emit = defineEmits();
const number = ref(0);
const uploadList = ref([]);
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const baseUrl = import.meta.env.VITE_APP_BASE_API;
const uploadImgUrl = ref(import.meta.env.VITE_APP_BASE_API + "/common/upload"); // アップロードの画像サービスアドレス
const headers = ref({ Authorization: "Bearer " + getToken() });
const fileList = ref([]);
const showTip = computed(
  () => props.isShowTip && (props.fileType || props.fileSize)
);

watch(() => props.modelValue, val => {
  if (val) {
    // まず値を配列に変換
    const list = Array.isArray(val) ? val : props.modelValue.split(",");
    // 次に、配列をオブジェクト配列に変換します
    fileList.value = list.map(item => {
      if (typeof item === "string") {
        if (item.indexOf(baseUrl) === -1) {
          item = { name: baseUrl + item, url: baseUrl + item };
        } else {
          item = { name: item, url: item };
        }
      }
      return item;
    });
  } else {
    fileList.value = [];
    return [];
  }
},{ deep: true, immediate: true });

// アップロード前loading
function handleBeforeUpload(file) {
  let isImg = false;
  if (props.fileType.length) {
    let fileExtension = "";
    if (file.name.lastIndexOf(".") > -1) {
      fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
    }
    isImg = props.fileType.some(type => {
      if (file.type.indexOf(type) > -1) return true;
      if (fileExtension && fileExtension.indexOf(type) > -1) return true;
      return false;
    });
  } else {
    isImg = file.type.indexOf("image") > -1;
  }
  if (!isImg) {
    proxy.$modal.msgError(
      `ファイルフォーマットが正しくありません。アップロード${props.fileType.join("/")}画像フォーマットファイル!`
    );
    return false;
  }
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      proxy.$modal.msgError(`アームロード画像の大きさは${props.fileSize} MBを超えてはいけません。`);
      return false;
    }
  }
  proxy.$modal.loading("画像をアップしています。少々お待ちください。...");
  number.value++;
}

// ファイア個数超過
function handleExceed() {
  proxy.$modal.msgError(`アプロアドファイル数は${props.limit}個を超えてはならない!`);
}

// ステップロード 成功コールバック
function handleUploadSuccess(res, file) {
  if (res.code === 200) {
    uploadList.value.push({ name: res.fileName, url: res.fileName });
    uploadedSuccessfully();
  } else {
    number.value--;
    proxy.$modal.closeLoading();
    proxy.$modal.msgError(res.msg);
    proxy.$refs.imageUpload.handleRemove(file);
    uploadedSuccessfully();
  }
}

// 画像削除
function handleDelete(file) {
  const findex = fileList.value.map(f => f.name).indexOf(file.name);
  if (findex > -1 && uploadList.value.length === number.value) {
    fileList.value.splice(findex, 1);
    emit("update:modelValue", listToString(fileList.value));
    return false;
  }
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

// アップロード失敗
function handleUploadError() {
  proxy.$modal.msgError("アップロード画像失敗");
  proxy.$modal.closeLoading();
}

// プレビュー
function handlePictureCardPreview(file) {
  dialogImageUrl.value = file.url;
  dialogVisible.value = true;
}

// オブジェクトが指定されたテキスト区切りに変換されます
function listToString(list, separator) {
  let strs = "";
  separator = separator || ",";
  for (let i in list) {
    if (undefined !== list[i].url && list[i].url.indexOf("blob:") !== 0) {
      strs += list[i].url.replace(baseUrl, "") + separator;
    }
  }
  return strs != "" ? strs.substr(0, strs.length - 1) : "";
}
</script>

<style scoped lang="scss">
// .el-upload--picture-card 制御プラス部分
:deep(.hide .el-upload--picture-card) {
    display: none;
}
</style>