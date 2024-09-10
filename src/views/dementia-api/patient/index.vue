<template>
  <div class="app-container" v-loading="pageLoading">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-upload
            v-model:file-list="fileList"
            class="upload-demo"
            :show-file-list="false"
            accept="image/*"
            :before-upload="handleBeforeUpload"
            :on-change="handleAddImage"
        >
          <el-button
              type="success"
              plain
              icon="Finished"
          >导入图片</el-button>
        </el-upload>
      </el-col>
    </el-row>

    <div>
      <canvas ref="canvas" id="img" style="border: 1px solid black"/>
    </div>
  </div>
</template>
<script setup name="tool">
import {Canvas, Rect, Image, FabricImage} from "fabric";
const loading = ref(true);
const pageLoading = ref(false);
const canvas = ref()
const fileList = ref([
]);
let fabricCanvas = null;

// 阻止文件上传组件向后端发送请求
function handleBeforeUpload(file){
  return false;
}

//
// 处理上传的图片并添加到 canvas
const handleAddImage = (uploadFile) => {
  console.log(uploadFile.raw); // 检查 uploadFile.raw 是否是有效的文件对象
  const reader = new FileReader();
  reader.onload = (e) => {
    console.log(e.target.result); // 确认 e.target.result 是有效的 base64 数据
    const imgElement = new window.Image();
    imgElement.src = e.target.result; // 设置图片的 base64 数据
    imgElement.onload = () => {
      // 等图片加载完后，使用 fabric.Image 创建 fabric 图像
      const fabricImg = new FabricImage(imgElement, {
        left: 100,
        top: 100,
        angle: 30,
        opacity: 0.85
      });
      fabricCanvas.add(fabricImg); // 添加图片到 canvas
      fabricCanvas.renderAll(); // 渲染 canvas
      console.log('Image added:', fabricImg);
    };
  };

  reader.readAsDataURL(uploadFile.raw); // 读取文件内容
  return false; // 阻止文件上传到后端
};
onMounted(() => {
  fabricCanvas = new Canvas('img', {
    width: window.innerWidth * 0.8,
    height: window.innerHeight * 0.8,
    backgroundColor: 'rgb(240, 240, 240)', // 可选: 设置背景色
  });

  // 动态调整 canvas 大小
  const updateCanvasSize = () => {
    fabricCanvas.setDimensions({
      width: window.innerWidth * 0.8,
      height: window.innerHeight * 0.8
    });
    fabricCanvas.renderAll(); // 重新渲染 canvas
  };

  window.addEventListener('resize', updateCanvasSize);
  updateCanvasSize();
});
// onMounted(() => {
//   const updateCanvasSize = () => {
//     canvas.value.width = window.innerWidth * 0.8
//     canvas.value.height = window.innerHeight * 0.8
//
//     fabricCanvas.clear(); // 清空所有对象// 使用 setDimensions 替代 setWidth
//     fabricCanvas.setDimensions({
//       width: canvas.value.width,
//       height: canvas.value.height
//     });
//     // const rect = new Rect({
//     //   left: 100,
//     //   top: 100,
//     //   fill: 'red',
//     //   width: 200,
//     //   height: 200,
//     //   angle: 45
//     // });
//     // fabricCanvas.add(rect)
//     // const image = new Image(myImage.value,{
//     //   left: 100,
//     //   top: 100,
//     //   angle: 30,
//     //   opacity: 0.85
//     // })
//     // fabricCanvas.add(image)
//   }
//   fabricCanvas = new Canvas('img');
//   window.addEventListener('resize', updateCanvasSize);
//   updateCanvasSize();
// })
</script>
