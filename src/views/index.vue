<template>
  <div class="app-container home">
  </div>
</template>

<script setup name="Index">
import request, {download} from '@/utils/request'
import useUserStore from "@/store/modules/user.js";
const isAdmin = ref(useUserStore().roles == "admin")

const systemSetting = reactive({
  displayFlag: 0,
  openingTime: null,
  closingTime: null,
  version: null,
  helpdeskMail: null,
  helpdeskWorkingTime: null,
  manualUrl: null
})
// function goTarget(url) {
//   window.open(url, '__blank')
// }

const { proxy } = getCurrentInstance();
function downloadManual() {
  let url = '/dementia-api/setting/downloadManual/general';
  let fileName = "ユーザマニュアル.pdf";
  return download(url, {},fileName)
}

function getSetting() {
  return request({
    url: '/dementia-api/setting/getInfo',
    method: 'get'
  })
}

onMounted(()=>{
  getSetting().then((res)=>{
    systemSetting.displayFlag = res.data.displayFlag
    systemSetting.openingTime = res.data.openingTime
    systemSetting.closingTime = res.data.closingTime
    systemSetting.version = res.data.version
    systemSetting.helpdeskMail = res.data.helpdeskMail
    systemSetting.helpdeskWorkingTime = res.data.helpdeskWorkingTime
    systemSetting.manualUrl = res.data.manualUrl
  })
})
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "ＭＳ ゴシック", "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>

