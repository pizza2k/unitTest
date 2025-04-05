<template>
    <div class="el-menu">
        <headMenu :my_index="2"></headMenu>
    </div>

    <div class="config-editor">
     
      <div class="config-sections">
        <!-- 核心参数 -->
        <section class="config-section">
          <h2>核心参数</h2>
          <div class="form-group">
            <label for="language-mode">语言模式:</label>
            <select id="language-mode" v-model="config.LANGUAGE_MODE">
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="python">Python</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="test-framework">测试框架:</label>
            <select id="test-framework" v-model="config.UNITTEST_FRAMEWORK">
              <option value="Unity">Unity</option>
              <option value="Google Test">Google Test</option>
              <option value="Catch2">Catch2</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="threshold">相似度阈值 ({{ config.REFERENCE_THRESHOLD }}):</label>
            <input 
              id="threshold" 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              v-model.number="config.REFERENCE_THRESHOLD"
            >
          </div>
        </section>
        
        <!-- 路径配置 -->
        <section class="config-section">
          <h2>路径配置</h2>
          <div class="form-group">
            <label for="repo-path">代码仓库路径:</label>
            <input id="repo-path" type="text" v-model="config.REPO_PATH">
            <!-- <button @click="selectDirectory('REPO_PATH')">浏览</button> -->
            <button @click="openDirectoryPicker('REPO_PATH')">浏览</button>
            <input 
                type="file" 
                ref="directoryInput"
                style="display: none"
                webkitdirectory
                @change="handleDirectorySelected"
            >
          </div>
          
          <div class="form-group">
            <label for="log-dir">日志目录:</label>
            <input id="log-dir" type="text" v-model="config.LOG_DIR">
            <button @click="selectDirectory('LOG_DIR')">浏览</button>
          </div>
          
          <div class="form-group">
            <label>排除路径 (每行一个):</label>
            <textarea v-model="excludedPathsText" rows="3"></textarea>
          </div>
        </section>
      </div>
      
      <!-- 配置预览 -->
      <section class="preview-section">
        <h2>配置预览</h2>
        <pre>{{ formattedConfig }}</pre>
      </section>
      

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button @click="saveConfig" class="save-btn">保存配置</button>
        <button @click="resetConfig" class="reset-btn">重置</button>
        <button @click="exportConfig" class="export-btn">导出为文件</button>
      </div>
    </div>
  </template>
  
<script setup>
import { ref, computed, onMounted } from 'vue';

import headMenu from '../components/head-menu.vue';

  
  // 默认配置（已修正所有路径字符串格式）
  const defaultConfig = {
    LANGUAGE_MODE: "cpp",
    LOG_DIR: "D:\\Code\\UnitTestGen\\logs",
    LLM_LOG_DIR: "D:\\Code\\UnitTestGen\\logs\\llm_logs",
    REPO_PATH: "D:\\Code\\UnitTestGen\\sxiv",
    CUSTOMIZED_TESTCODE_PATH: [],
    EXCEPTE_PATH: ["D:\\Code\\UnitTestGen\\fzy\\deps"],
    RESOLVED_METAINFO_PATH: "D:\\Code\\UnitTestGen\\data\\",
    ALL_METAINFO_PATH: "D:\\Code\\UnitTestGen\\data\\all_metainfo.json",
    FUNCTION_METAINFO_PATH: "D:\\Code\\UnitTestGen\\data\\function_metainfo.json",
    TESTCASE_METAINFO_PATH: "D:\\Code\\UnitTestGen\\data\\testcase_metainfo.json",
    UDT_METAINFO_PATH: "D:\\Code\\UnitTestGen\\data\\udt_metainfo.json",
    GLOBAL_VARIABLE_METAINFO_PATH: "D:\\Code\\UnitTestGen\\data\\global_variable_metainfo.json",
    FUNCTION_SIMILARITY_PATH: "D:\\Code\\UnitTestGen\\data\\function_similarity.json",
    TESTCASE_ANALYSIS_RESULT_PATH: "D:\\Code\\UnitTestGen\\data\\testcase_analysis_result.json",
    CONTEXT_ANALYSIS_RESULT_PATH: "D:\\Code\\UnitTestGen\\data\\context_analysis_result.json",
    GENERATION_RESULT_PATH: "D:\\Code\\UnitTestGen\\results\\",
    REFERENCE_THRESHOLD: 0.8,
    UNITTEST_FRAMEWORK: "Unity"
  }
  
  const config = ref(JSON.parse(JSON.stringify(defaultConfig)))
  
  // 处理排除路径的文本格式
  const excludedPathsText = computed({
    get: () => config.value.EXCEPTE_PATH.join('\n'),
    set: (value) => {
      config.value.EXCEPTE_PATH = value.split('\n').filter(line => line.trim())
    }
  })
  
  // 格式化配置预览
  const formattedConfig = computed(() => {
    return JSON.stringify(config.value, null, 2)
  })
  
  // 选择目录
  const selectDirectory = (field) => {
    console.log(`选择目录: ${field}`)
    // 实际应用中这里应该调用文件选择对话框
    alert('在实际应用中会打开目录选择对话框')
  }
  
  // 打开目录选择器
const openDirectoryPicker = (field) => {
  currentPathField.value = field
  directoryInput.value.click()
}

// 处理目录选择
const handleDirectorySelected = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    // 获取选择的目录路径
    const path = files[0].path || files[0].webkitRelativePath.split('/')[0]
    config.value[currentPathField.value] = path
  }
  // 重置input，以便可以再次选择同一目录
  event.target.value = ''
}

  // 保存配置
  const saveConfig = () => {
    console.log('保存配置:', config.value)
    localStorage.setItem('unitTestGenConfig', JSON.stringify(config.value))
    alert('配置已保存')
  }
  
  // 导出配置为文件
  const exportConfig = () => {
    const blob = new Blob([formattedConfig.value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'unitTestGen_config.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  
  // 重置配置
  const resetConfig = () => {
    if (confirm('确定要重置为默认配置吗？')) {
      config.value = JSON.parse(JSON.stringify(defaultConfig))
    }
  }
  
  // 初始化时加载保存的配置
  onMounted(() => {
    const savedConfig = localStorage.getItem('unitTestGenConfig')
    if (savedConfig) {
      config.value = JSON.parse(savedConfig)
    }
  })
  </script>
  
  <style scoped>
  .config-editor {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }
  
  .el-menu {
    margin-top: 3vh; 
    margin-bottom: 5vh;
}

  .config-sections {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  
  .config-section {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  input[type="text"],
  select,
  textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  textarea {
    min-height: 80px;
  }
  
  input[type="range"] {
    width: 100%;
  }
  
  .preview-section {
    background: #f0f0f0;
    padding: 15px;
    border-radius: 8px;
    margin-top: 20px;
  }
  
  pre {
    white-space: pre-wrap;
    background: white;
    padding: 10px;
    border-radius: 4px;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .action-buttons {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }
  
  button {
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .save-btn {
    background: #4CAF50;
    color: white;
  }
  
  .reset-btn {
    background: #f44336;
    color: white;
  }
  
  .export-btn {
    background: #2196F3;
    color: white;
  }
  
  button:hover {
    opacity: 0.9;
  }
  </style>