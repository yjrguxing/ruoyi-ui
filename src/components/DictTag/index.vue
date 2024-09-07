<template>
  <div>
    <template v-for="(item, index) in options">
      <template v-if="values.includes(item.value)">
        <span
          v-if="(item.elTagType == 'default' || item.elTagType == '') && (item.elTagClass == '' || item.elTagClass == null)"
          :key="item.value"
          :index="index"
          :class="item.elTagClass"
        >{{ item.label + " " }}</span>
        <el-tag
          v-else
          :disable-transitions="true"
          :key="item.value + ''"
          :index="index"
          :type="item.elTagType === 'primary' ? '' : item.elTagType"
          :class="item.elTagClass"
        >{{ item.label + " " }}</el-tag>
      </template>
    </template>
    <template v-if="unmatch && showValue">
      {{ unmatchArray | handleArray }}
    </template>
  </div>
</template>

<script setup>
// レコード未一致の項目
const unmatchArray = ref([]);

const props = defineProps({
  // データ
  options: {
    type: Array,
    default: null,
  },
  // 現在の値
  value: [Number, String, Array],
  // 一致するデータが見つからない場合は、valueを表示します
  showValue: {
    type: Boolean,
    default: true,
  },
  separator: {
    type: String,
    default: ",",
  }
});

const values = computed(() => {
  if (props.value === null || typeof props.value === 'undefined' || props.value === '') return [];
  return Array.isArray(props.value) ? props.value.map(item => '' + item) : String(props.value).split(props.separator);
});

const unmatch = computed(() => {
  unmatchArray.value = [];
  // 表示されないvalueがない
  if (props.value === null || typeof props.value === 'undefined' || props.value === '' || props.options.length === 0) return false
  // 入力値は配列
  let unmatch = false // 不一致項目があるかどうかを判断するためにフラグを追加する
  values.value.forEach(item => {
    if (!props.options.some(v => v.value === item)) {
      unmatchArray.value.push(item)
      unmatch = true // 不一致がある場合は、Fragをtrueに設定します
    }
  })
  return unmatch // フラグの値を戻す
});

function handleArray(array) {
  if (array.length === 0) return "";
  return array.reduce((pre, cur) => {
    return pre + " " + cur;
  });
}
</script>

<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
</style>
