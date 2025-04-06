<template>
    <div class="flex flex-col h-full justify-between">
        <div class="config-editor w-full grow place-content-center">
            <div class="main-layout">
                <!-- 左侧：参数配置区 -->
                <div class="config-column">
                    <!-- 核心参数 -->
                    <section class="config-section">
                        <h2>核心参数</h2>
                        <div class="form-group">
                            <label for="language-mode">语言模式:</label>
                            <input id="language-mode" type="text" v-model="config.LANGUAGE_MODE" readonly>
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
                            <div class="path-input-group">
                                <input id="repo-path" type="text" v-model="config.REPO_PATH" readonly>
                                <button @click="openDirectoryPicker('REPO_PATH')">浏览</button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="log-dir">日志目录:</label>
                            <div class="path-input-group">
                                <input id="log-dir" type="text" v-model="config.LOG_DIR" readonly>
                                <button @click="openDirectoryPicker('LOG_DIR')">浏览</button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>已有测试用例路径 (每行一个):</label>
                            <textarea v-model="testCodePathsText" rows="3"></textarea>
                        </div>

                        <div class="form-group">
                            <label>中间结果目录 (每行一个):</label>
                            <textarea v-model="resolvedMetaInfoPathsText" rows="3"></textarea>
                        </div>

                        <div class="form-group">
                            <label>排除路径 (每行一个):</label>
                            <textarea v-model="excludedPathsText" rows="3"></textarea>
                        </div>
                    </section>
                </div>

                <!-- 右侧：配置预览区 -->
                <div class="preview-column">
                    <section class="preview-section">
                        <h2>配置预览</h2>
                        <pre>{{ formattedConfig }}</pre>
                    </section>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
                <button @click="saveConfig" class="save-btn">保存配置</button>
                <button @click="resetConfig" class="reset-btn">重置</button>
                <button @click="exportConfig" class="export-btn">导出为文件</button>
            </div>

            <!-- 隐藏的文件输入 -->
            <input
                type="file"
                ref="directoryInput"
                style="display: none"
                webkitdirectory
                @change="handleDirectorySelected"
            >
        </div>
    </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import headMenu from '../components/HeadMenu.vue';

// 默认配置
const defaultConfig = {
    LANGUAGE_MODE: "c",  // 固定为C语言
    LOG_DIR: "D:\\Code\\UnitTestGen\\logs",
    LLM_LOG_DIR: "D:\\Code\\UnitTestGen\\logs\\llm_logs",
    REPO_PATH: "D:\\Code\\UnitTestGen\\sxiv",
    CUSTOMIZED_TESTCODE_PATH: [],  // 已有测试用例路径
    EXCEPTE_PATH: ["D:\\Code\\UnitTestGen\\fzy\\deps"],
    RESOLVED_METAINFO_PATH: ["D:\\Code\\UnitTestGen\\data\\"],  // 改为数组形式
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
const directoryInput = ref(null)
const currentPathField = ref('')

// 处理已有测试用例路径的文本格式
const testCodePathsText = computed({
    get: () => config.value.CUSTOMIZED_TESTCODE_PATH.join('\n'),
    set: (value) => {
        config.value.CUSTOMIZED_TESTCODE_PATH = value.split('\n').filter(line => line.trim())
    }
})

// 处理中间结果目录的文本格式
const resolvedMetaInfoPathsText = computed({
    get: () => config.value.RESOLVED_METAINFO_PATH.join('\n'),
    set: (value) => {
        config.value.RESOLVED_METAINFO_PATH = value.split('\n').filter(line => line.trim())
    }
})

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
    const blob = new Blob([formattedConfig.value], {type: 'application/json'})
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
    font-family: Arial, sans-serif;
}

.main-layout {
    display: flex;
    gap: 30px;
}

.config-column {
    flex: 1;
    min-width: 0;
}

.preview-column {
    flex: 1;
    min-width: 0;
}

.config-section {
    background: #e5ecf3;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 25px;
}

.form-group {
    margin-bottom: 18px;
}

label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    font-size: 14px;
}

input[type="text"],
select,
textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    background-color: white;
}

.path-input-group {
    display: flex;
    gap: 8px;
}

.path-input-group input {
    flex: 1;
}

.path-input-group button {
    padding: 0 15px;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.path-input-group button:hover {
    background-color: #0d8bf2;
}

textarea {
    min-height: 100px;
    resize: vertical;
    background-color: white;
}

input[type="range"] {
    width: 100%;
    margin-top: 5px;
}

.preview-section {
    background: #e5ecf3;
    padding: 20px;
    border-radius: 8px;
    height: calc(100% - 40px);
    display: flex;
    flex-direction: column;
}

.preview-section h2 {
    margin-top: 0;
}

pre {
    white-space: pre-wrap;
    background: white;
    padding: 15px;
    border-radius: 4px;
    flex-grow: 1;
    overflow-y: auto;
    font-size: 13px;
    line-height: 1.4;
}

.action-buttons {
    display: flex;
    gap: 12px;
    margin-top: 0px;
    margin-bottom: 20px;
    justify-content: center;
}

/* 降低操作按钮饱和度 */
button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.save-btn {
    background: hsl(120, 39%, 54%); /* 降低饱和度 */
    color: white;
}

.reset-btn {
    background: hsl(0, 69%, 58%); /* 降低饱和度 */
    color: white;
}

.export-btn {
    background: hsl(207, 72%, 55%); /* 降低饱和度 */
    color: white;
}

button:hover {
    opacity: 0.9;
}
</style>
