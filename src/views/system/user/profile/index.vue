<template>
   <div class="app-container">
      <el-row :gutter="20">
         <el-col :span="8" :xs="24">
            <el-card class="box-card">
               <template v-slot:header>
                 <div class="clearfix">
                   <span>個人情報</span>
                 </div>
               </template>
               <div>
                  <div class="text-center">
                     <userAvatar />
                  </div>
                  <ul class="list-group list-group-striped">
<!--                     <li class="list-group-item">-->
<!--                        <svg-icon icon-class="user" />ユーザ名-->
<!--                        <div class="pull-right">{{ state.user.userName }}</div>-->
<!--                     </li>-->
<!--                     <li class="list-group-item">-->
<!--                        <svg-icon icon-class="phone" />携帯番号-->
<!--                        <div class="pull-right">{{ state.user.phonenumber }}</div>-->
<!--                     </li>-->

                     <li class="list-group-item">
                        <svg-icon icon-class="email" />メールアドレス
                       <el-tooltip :content="state.user.userName" placement="top" effect="dark" :popper-options="{strategy: 'fixed'}">
                         <div class="pull-right text-ellipsis">{{ state.user.userName }}</div>
                       </el-tooltip>
<!--                        <div class="pull-right">{{ state.user.userName }}</div>-->
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="tree" />所属施設
                        <div class="pull-right" v-if="state.user.dept">{{ state.user.dept.deptName }}</div>
                     </li>
<!--                     <li class="list-group-item">-->
<!--                        <svg-icon icon-class="peoples" />所属ロール-->
<!--                        <div class="pull-right">{{ state.roleGroup }}</div>-->
<!--                     </li>-->
                     <li class="list-group-item">
                        <svg-icon icon-class="date" />作成日
                        <div class="pull-right">{{ state.user.createTime }}</div>
                     </li>
                  </ul>
               </div>
            </el-card>
         </el-col>
         <el-col :span="16" :xs="24">
            <el-card>
               <template v-slot:header>
                 <div class="clearfix">
                   <span>パスワードの変更</span>
                 </div>
               </template>
              <resetPwd />
<!--               <el-tabs v-model="activeTab">-->
<!--                  <el-tab-pane label="基本資料" name="userinfo">-->
<!--                     <userInfo :user="state.user" />-->
<!--                  </el-tab-pane>-->
<!--                  <el-tab-pane label="パスワードの変更" name="resetPwd">-->
<!--                     <resetPwd />-->
<!--                  </el-tab-pane>-->
<!--               </el-tabs>-->
            </el-card>
         </el-col>
      </el-row>
   </div>
</template>

<script setup name="Profile">
import userAvatar from "./userAvatar";
import userInfo from "./userInfo";
import resetPwd from "./resetPwd";
import { getUserProfile } from "@/api/system/user";

const activeTab = ref("userinfo");
const state = reactive({
  user: {},
  roleGroup: {},
  postGroup: {}
});

function getUser() {
  getUserProfile().then(response => {
    state.user = response.data;
    state.roleGroup = response.roleGroup;
    state.postGroup = response.postGroup;
  });
};

getUser();
</script>
<style>
.text-ellipsis {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>