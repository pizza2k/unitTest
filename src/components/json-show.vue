<template>
    <div v-if="isVisible" class="json-viewer-modal">
      <div class="json-viewer-content">
        <div class="json-viewer-header">
          <h3>中间结果查看</h3>
          <button @click="close" class="close-btn">&times;</button>
        </div>
        <div class="json-viewer-body">
          <pre v-if="formattedJson" ref="jsonContent">{{ formattedJson }}</pre>
          <p v-else class="no-data">没有可显示的JSON数据</p>
        </div>
        <div class="json-viewer-footer">
          <button @click="copyToClipboard" class="copy-btn">复制到剪贴板</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  
  const props = defineProps({
    jsonData: {
      type: [Object, Array, String],
      default: null
    },
    title: {
      type: String,
      default: '中间结果查看'
    },
    maxHeight: {
      type: String,
      default: '70vh' // 默认最大高度
    }
  })
  
  const emit = defineEmits(['close'])
  const isVisible = ref(false)
  const jsonContent = ref(null)
  
  // 格式化JSON显示
  const formattedJson = computed(() => {
    if (!props.jsonData) return null
    
    try {
      if (typeof props.jsonData === 'string') {
        return JSON.stringify(JSON.parse(props.jsonData), null, 2)
      }
      return JSON.stringify(props.jsonData, null, 2)
    } catch (e) {
      return '无效的JSON格式: ' + e.message
    }
  })
  
  // 打开弹窗时禁止背景滚动
  const disableBodyScroll = () => {
    document.body.style.overflow = 'hidden'
  }
  
  // 恢复背景滚动
  const enableBodyScroll = () => {
    document.body.style.overflow = ''
  }
  
  const open = () => {
    isVisible.value = true
    disableBodyScroll()
  }
  
  const close = () => {
    isVisible.value = false
    enableBodyScroll()
    emit('close')
  }
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson.value)
      alert('已复制到剪贴板!')
    } catch (err) {
      console.error('复制失败:', err)
      alert('复制失败，请手动复制')
    }
  }
  
  defineExpose({
    open,
    close
  })
  
  onUnmounted(() => {
    enableBodyScroll()
  })
  </script>
  
  <style scoped>
  .json-viewer-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    overflow: hidden; /* 防止模态框自身出现滚动条 */
  }
  
  .json-viewer-content {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-height: v-bind('props.maxHeight'); /* 使用动态props设置最大高度 */
  }
  
  .json-viewer-header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0; /* 防止头部被压缩 */
  }
  
  .json-viewer-header h3 {
    margin: 0;
    font-size: 18px;
  }
  
  .json-viewer-body {
    padding: 16px;
    overflow: hidden; /* 隐藏内部溢出 */
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  
  .json-viewer-body pre {
    margin: 0;
    white-space: pre-wrap;
    font-family: 'Courier New', Courier, monospace;
    background-color: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    overflow: auto; /* 只在pre内部出现滚动条 */
    flex-grow: 1;
    max-height: calc(v-bind('props.maxHeight') - 150px); /* 动态计算高度 */
  }
  
  .no-data {
    text-align: center;
    color: #666;
    margin: 20px 0;
  }
  
  .json-viewer-footer {
    padding: 12px 16px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    flex-shrink: 0; /* 防止底部被压缩 */
  }
  
  .close-btn {
    padding: 6px 12px;
    background-color: #e97d75;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .copy-btn {
    padding: 6px 12px;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .close-btn:hover, .copy-btn:hover {
    opacity: 0.9;
  }
  </style>