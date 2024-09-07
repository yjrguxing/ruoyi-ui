<template>
   <el-form ref="pwdRef" :model="user" :rules="rules" label-width="15vw">
      <el-form-item label="古いパスワード" prop="oldPassword">
         <el-input v-model="user.oldPassword" placeholder="古いパスワードを入力してください" type="password" show-password />
      </el-form-item>
      <el-form-item label="新しいパスワード" prop="newPassword">
         <el-input v-model="user.newPassword" placeholder="新しいパスワードを入力してください" type="password" show-password />
      </el-form-item>
      <el-form-item label="新しいパスワードを確認" prop="confirmPassword">
         <el-input v-model="user.confirmPassword" placeholder="新しいパスワードを確認してください" type="password" show-password/>
      </el-form-item>
      <el-form-item>
      <el-button type="primary" @click="submit">保存</el-button>
      <el-button type="danger" @click="close">閉じる</el-button>
      </el-form-item>
   </el-form>
</template>

<script setup>
import { updateUserPwd } from "@/api/system/user";

const { proxy } = getCurrentInstance();

const user = reactive({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined
});

const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    callback(new Error("2回入力されたパスワードが一致しません"));
  } else {
    callback();
  }
};
const rules = ref({
  oldPassword: [{ required: true, message: "古いパスワードのご入力は必須です。", trigger: "blur" }],
  newPassword: [{ required: true, message: "新しいパスワードのご入力は必須です。", trigger: "blur" }, { min: 8, max: 15, message: proxy.message.common.Common_E0006, trigger: "blur" }, { pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[`~!@#$%^&*()\-_=+\[{\]};:'",<.>/?\\|]).{8,}$/, message: proxy.message.common.Common_E0007, trigger: "blur" }],
  confirmPassword: [{ required: true, message: "確認用の新しいパスワードのご入力は必須です。", trigger: "blur" }, { required: true, validator: equalToPassword, trigger: "blur" }]
});

/** commitボタン */
function submit() {
  proxy.$refs.pwdRef.validate(valid => {
    if (valid) {
      updateUserPwd(user.oldPassword, user.newPassword).then(response => {
        proxy.$modal.msgSuccess("変更に成功しました。");
      });
    }
  });
};
/** 閉じるボタン */
function close() {
  proxy.$tab.closePage();
};
</script>
