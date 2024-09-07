<template>
  <div>
    <el-upload
      :action="uploadUrl"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      name="file"
      :show-file-list="false"
      :headers="headers"
      class="editor-img-uploader"
      v-if="type == 'url'"
    >
      <i ref="uploadRef" class="editor-img-uploader"></i>
    </el-upload>
  </div>
  <div class="editor">
    <quill-editor
      ref="quillEditorRef"
      v-model:content="content"
      contentType="html"
      @textChange="(e) => $emit('update:modelValue', content)"
      :options="options"
      :style="styles"
    />
  </div>
</template>

<script setup>
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { getToken } from "@/utils/auth";

const { proxy } = getCurrentInstance();

const quillEditorRef = ref();
const uploadUrl = ref(import.meta.env.VITE_APP_BASE_API + "/common/upload"); // アップロードの画像サービスアドレス
const headers = ref({
  Authorization: "Bearer " + getToken()
});

const props = defineProps({
  /* 編集の内容 */
  modelValue: {
    type: String,
  },
  /* 高さ */
  height: {
    type: Number,
    default: null,
  },
  /* 最小高さ */
  minHeight: {
    type: Number,
    default: null,
  },
  /* 読み取り専用 */
  readOnly: {
    type: Boolean,
    default: false,
  },
  /* アップロードファイルサイズ(MB) */
  fileSize: {
    type: Number,
    default: 5,
  },
  /* タイプ（base64、url） */
  type: {
    type: String,
    default: "url",
  }
});

const options = ref({
  theme: "snow",
  bounds: document.body,
  debug: "warn",
  modules: {
    // ツェル欄構成
    toolbar: [
      ["bold", "italic", "underline", "strike"],      // 太字、斜体、下線、破線
      ["blockquote", "code-block"],                   // 引用、コードブロック
      [{ list: "ordered" }, { list: "bullet" }],      //有序、无序列表
      [{ indent: "-1" }, { indent: "+1" }],           // インデント
      [{ size: ["small", false, "large", "huge"] }],  // フォントサイズ
      [{ header: [1, 2, 3, 4, 5, 6, false] }],        // タイトル
      [{ color: [] }, { background: [] }],            // フォント色、フォント背景色
      [{ align: [] }],                                // 配置
      ["clean"],                                      // テキストフォーマットの消去
      ["link", "image", "video"]                      // リンク、画像、ビデオ
    ],
  },
  placeholder: "内容を入力してください",
  readOnly: props.readOnly
});

const styles = computed(() => {
  let style = {};
  if (props.minHeight) {
    style.minHeight = `${props.minHeight}px`;
  }
  if (props.height) {
    style.height = `${props.height}px`;
  }
  return style;
});

const content = ref("");
watch(() => props.modelValue, (v) => {
  if (v !== content.value) {
    content.value = v === undefined ? "<p></p>" : v;
  }
}, { immediate: true });

// アプロードアドレスを設定するとカスタム画像アプロードイベント
onMounted(() => {
  if (props.type == 'url') {
    let quill = quillEditorRef.value.getQuill();
    let toolbar = quill.getModule("toolbar");
    toolbar.addHandler("image", (value) => {
      if (value) {
        proxy.$refs.uploadRef.click();
      } else {
        quill.format("image", false);
      }
    });
  }
});

// 前の校正フォーマットとサイズ
function handleBeforeUpload(file) {
  const type = ["image/jpeg", "image/jpg", "image/png", "image/svg"];
  const isJPG = type.includes(file.type);
  //检验ファイル格式
  if (!isJPG) {
    proxy.$modal.msgError(`画像フォーマットが間違っています！`);
    return false;
  }
  // 校正ファイルサイズ
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      proxy.$modal.msgError(`アプロアド・ファイルサイズは${props.fileSize}MBを超えてはいけません!`);
      return false;
    }
  }
  return true;
}

// ブロック成功処理
function handleUploadSuccess(res, file) {
  // もしアームロードが成功したら
  if (res.code == 200) {
    // テキストインスタンス
    let quill = toRaw(quillEditorRef.value).getQuill();
    // カーソル位置
    let length = quill.selection.savedRange.index;
    // 挿入画像、res.urlはサービスリターンの画像リンクアドレス
    quill.insertEmbed(length, "image", import.meta.env.VITE_APP_BASE_API + res.fileName);
    // カーソルを最終に合わせる
    quill.setSelection(length + 1);
  } else {
    proxy.$modal.msgError("画像挿入に失敗しました");
  }
}

// アップロード失敗処理
function handleUploadError() {
  proxy.$modal.msgError("画像挿入に失敗しました");
}
</script>

<style>
.editor-img-uploader {
  display: none;
}
.editor, .ql-toolbar {
  white-space: pre-wrap !important;
  line-height: normal !important;
}
.quill-img {
  display: none;
}
.ql-snow .ql-tooltip[data-mode="link"]::before {
  content: "リンクアドレスを入力してください:";
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  border-right: 0px;
  content: "保存";
  padding-right: 0px;
}
.ql-snow .ql-tooltip[data-mode="video"]::before {
  content: "動画アドレスを入力してください：";
}
.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: "14px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
  content: "10px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
  content: "18px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
  content: "32px";
}
.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "テキスト";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
  content: "タイトル1";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
  content: "タイトル22";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
  content: "タイトル33";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
  content: "タイトル44";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="5"]::before {
  content: "タイトル55";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="6"]::before {
  content: "タイトル66";
}
.ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
  content: "標準フォント";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
  content: "配線フォント";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
  content: "等幅フォント";
}
</style>
