<template>
  <div class="user-info-head" @click="editCropper()">
    <img :src="options.img" title="クリックして画像をアップロード" class="img-circle img-lg" />
    <el-dialog :title="title" v-model="open" width="800px" append-to-body @opened="modalOpened" @close="closeDialog">
      <el-row>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <vue-cropper
            ref="cropper"
            :img="options.img"
            :info="true"
            :autoCrop="options.autoCrop"
            :autoCropWidth="options.autoCropWidth"
            :autoCropHeight="options.autoCropHeight"
            :fixedBox="options.fixedBox"
            :outputType="options.outputType"
            @realTime="realTime"
            v-if="visible"
          />
        </el-col>
        <el-col :xs="24" :md="12" :style="{ height: '350px' }">
          <div class="avatar-upload-preview">
            <img :src="options.previews.url" :style="options.previews.img" />
          </div>
        </el-col>
      </el-row>
      <br />
      <el-row>
        <el-col :lg="2" :md="2">
          <el-upload
            action="#"
            :http-request="requestUpload"
            :show-file-list="false"
            :before-upload="beforeUpload"
          >
            <el-button>
              選択
              <el-icon class="el-icon--right"><Upload /></el-icon>
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{ span: 1, offset: 2 }" :md="2">
          <el-button icon="Plus" @click="changeScale(1)"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="Minus" @click="changeScale(-1)"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="RefreshLeft" @click="rotateLeft()"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button icon="RefreshRight" @click="rotateRight()"></el-button>
        </el-col>
        <el-col :lg="{ span: 2, offset: 6 }" :md="2">
          <el-button type="primary" @click="uploadImg()">送信</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup>
// import "vue-cropper/next/dist/index.css";
// import VueCropper  from "vue-cropper";
import { uploadAvatar } from "@/api/system/user";
import useUserStore from "@/store/modules/user";

const userStore = useUserStore();
const { proxy } = getCurrentInstance();

const open = ref(false);
const visible = ref(false);
const title = ref("修正画像");

//画像切り抜きデータ
const options = reactive({
  img: userStore.avatar,     // 切り抜き画像のアドレス
  autoCrop: true,            // デフォルトがスクリーンショットボックスを生成するかどうか
  autoCropWidth: 200,        // デフォルト生成スクリーンショットボックス幅
  autoCropHeight: 200,       // デフォルト生成スクリーンショットボックスの高さ
  fixedBox: true,            // 固定スクリーンショットボックスのサイズは変更できません
  outputType: "png",         // デフォルトはPNG形式でスクリーンショットを生成
  filename: 'avatar',        // ファイル名
  previews: {}               //プレビューデータ
});

/** 画像編集 */
function editCropper() {
  open.value = true;
}
/** ポップアップレイヤを開いて終了したときのコールバック */
function modalOpened() {
  visible.value = true;
}
/** オーバーライド・フォルト・アプロードの動作 */
function requestUpload() {}
/** 左に曲がる */
function rotateLeft() {
  proxy.$refs.cropper.rotateLeft();
}
/** 右に回転 */
function rotateRight() {
  proxy.$refs.cropper.rotateRight();
}
/** 画像の拡大・縮小 */
function changeScale(num) {
  num = num || 1;
  proxy.$refs.cropper.changeScale(num);
}
/** ブロック前処理 */
function beforeUpload(file) {
  if (file.type.indexOf("image/") == -1) {
    proxy.$modal.msgError("ファイル格式エラー，画像タイプ,例：JPG，PNG接尾辞のファイルをアップロードしてください。。");
  } else {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      options.img = reader.result;
      options.filename = file.name;
    };
  }
}
/** アップロード画像 */
function uploadImg() {
  proxy.$refs.cropper.getCropBlob(data => {
    let formData = new FormData();
    formData.append("avatarfile", data, options.filename);
    uploadAvatar(formData).then(response => {
      open.value = false;
      options.img = import.meta.env.VITE_APP_BASE_API + response.imgUrl;
      userStore.avatar = options.img;
      proxy.$modal.msgSuccess("変更に成功しました。");
      visible.value = false;
    });
  });
}
/** プレビュー */
function realTime(data) {
  options.previews = data;
}
/** 閉じる */
function closeDialog() {
  options.img = userStore.avatar;
  options.visible = false;
}
</script>

<style lang='scss' scoped>
.user-info-head {
  position: relative;
  display: inline-block;
  height: 120px;
}

.user-info-head:hover:after {
  content: "+";
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  color: #eee;
  background: rgba(0, 0, 0, 0.5);
  font-size: 24px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  cursor: pointer;
  line-height: 110px;
  border-radius: 50%;
}
</style>