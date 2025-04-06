<template>
<!--    <div class="w-full h-full json-demo-page">-->
      <!-- 示例1：直接绑定数据 -->
      <!-- <button @click="showJsonViewer1" class="demo-btn">
        显示示例JSON数据
      </button> -->
      
      <!-- 示例2：通过ref调用 -->
      <button @click="showJsonViewer2" class="demo-btn">
        显示JSON数据
      </button>
      
      <!-- JSON查看器组件 -->
      <JsonViewer 
        ref="jsonViewerRef" 
        :jsonData="jsonData" 
        title="自定义标题"
        @close="handleClose"
      />
<!--    </div>-->
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import JsonViewer from './json-show.vue'
  
  const jsonViewerRef = ref(null)
  const jsonData = ref(null)
  
  // 示例数据
  const sampleJson = {
    name: "示例数据",
    version: "1.0.0",
    items: [
      { id: 1, name: "项目1" },
      { id: 2, name: "项目2" }
    ],
    metadata: {
      createdAt: "2023-05-20",
      updatedAt: "2023-05-21"
    }
  }
  
  // 方法1：直接绑定数据
  const showJsonViewer1 = () => {
    jsonData.value = sampleJson
    jsonViewerRef.value.open()
  }
  
  // 方法2：通过ref调用并传入数据
  const showJsonViewer2 = () => {
    jsonViewerRef.value.open()
    // 可以动态设置数据
    jsonViewerRef.value.jsonData = {
      dynamicData: Math.random(),
      timestamp: new Date().toISOString()
    }
  }
  
  const handleClose = () => {
    console.log('JSON查看器已关闭')
  }
  </script>
  
  <style scoped>
  .json-demo-page {
    padding: 20px;
    margin: 0 auto;
  }
  
  .demo-btn {
    display: block;
    width: 100%;
    max-width: 300px;
    margin: 15px auto;
    padding: 10px 15px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }
  
  .demo-btn:hover {
    background-color: #45a049;
  }
  
  .demo-btn + .demo-btn {
    margin-top: 10px;
  }
  </style>