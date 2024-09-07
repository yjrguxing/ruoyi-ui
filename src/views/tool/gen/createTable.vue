<template>
  <!-- 新規テーブル -->
  <el-dialog title="新規テーブル" v-model="visible" width="800px" top="5vh" append-to-body>
    <span>新規テキストブル文：</span>
    <el-input type="textarea" :rows="10" placeholder="テキストを入力してください" v-model="content"></el-input>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleImportTable">確 定</el-button>
        <el-button @click="visible = false">キャンセル</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { createTable } from "@/api/tool/gen";

const visible = ref(false);
const content = ref("");
const { proxy } = getCurrentInstance();
const emit = defineEmits(["ok"]);

/** フレームを表示 */
function show() {
  visible.value = true;
}

/** インポートボタン操作 */
function handleImportTable() {
  if (content.value === "") {
    proxy.$modal.msgError("表作成文を入力してください");
    return;
  }
  createTable({ sql: content.value }).then(res => {
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
