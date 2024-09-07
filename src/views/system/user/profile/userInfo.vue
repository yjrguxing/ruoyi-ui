<template>
   <el-form ref="userRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label=ユーザのニックネーム prop="nickName">
         <el-input v-model="form.nickName" maxlength="30" />
      </el-form-item>
      <el-form-item label="携帯番号" prop="phonenumber">
         <el-input v-model="form.phonenumber" maxlength="11" />
      </el-form-item>
      <el-form-item label="メールアドレス" prop="email">
         <el-input v-model="form.email" maxlength="50" />
      </el-form-item>
      <el-form-item label="性別">
         <el-radio-group v-model="form.sex">
            <el-radio label="0">男</el-radio>
            <el-radio label="1">女</el-radio>
         </el-radio-group>
      </el-form-item>
      <el-form-item>
      <el-button type="primary" @click="submit">保存</el-button>
      <el-button type="danger" @click="close">閉じる</el-button>
      </el-form-item>
   </el-form>
</template>

<script setup>
import { updateUserProfile } from "@/api/system/user";

const props = defineProps({
  user: {
    type: Object
  }
});

const { proxy } = getCurrentInstance();

const form = ref({});
const rules = ref({
  nickName: [{ required: true, message: "ユーザニックネームのご入力は必須です。", trigger: "blur" }],
  email: [{ required: true, message: "メールアドレスのご入力は必須です。", trigger: "blur" }, { type: "email", message: "正しいメールアドレスを入力してください", trigger: ["blur", "change"] }],
  phonenumber: [{ required: true, message: "携帯番号のご入力は必須です。", trigger: "blur" }, { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "正しい携帯番号を入力してください", trigger: "blur" }],
});

/** commitボタン */
function submit() {
  proxy.$refs.userRef.validate(valid => {
    if (valid) {
      updateUserProfile(form.value).then(response => {
        proxy.$modal.msgSuccess("変更に成功しました。");
        props.user.phonenumber = form.value.phonenumber;
        props.user.email = form.value.email;
      });
    }
  });
};

/** 閉じるボタン */
function close() {
  proxy.$tab.closePage();
};

// 登録したユーザ情報
watch(() => props.user, user => {
  if (user) {
    form.value = { nickName: user.nickName, phonenumber: user.phonenumber, email: user.email, sex: user.sex, userName: user.userName };
  }
},{ immediate: true });
</script>
