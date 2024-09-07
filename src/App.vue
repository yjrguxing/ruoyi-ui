<template>
  <router-view />
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings'
import { handleThemeStyle } from '@/utils/theme'

onMounted(() => {
  nextTick(() => {
    // トピックスタイルの初期化
    handleThemeStyle(useSettingsStore().theme)
  })
})
</script>
