<template>
    <div class="min-h-screen w-screen place-content-center flex justify-center items-center">
        <div class="w-3/5 h-full mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6 mb-10">
            <div class="flex items-center justify-center">
                <img src="../../public/icon/icon.png" alt="LOGO" class="w-48">
                <h1 class="text-3xl font-bold text-center pt-8">AeroTest 航宇智测</h1>
            </div>
            <div class="text-right -mt-2">
                <p class="text-gray-500 italic mt-1">——基于大语言模型的航空航天软件测试生成</p> 
            </div>
            <div class="space-y-4">
                <!-- 仓库路径 -->
                <div>
                    <label class="block font-semibold mb-1">仓库路径</label>
                    <div class="flex items-center space-x-2">
                        <input
                            type="text"
                            v-model="repoPath"
                            class="flex-1 border rounded-lg px-3 py-2"
                            placeholder="请输入路径"
                        />
                        <label class="cursor-pointer h-10 bg-base-300 px-3 pt-2 rounded hover:bg-blue-400">
                            📁
                            <input type="file" @change="handleDirectoryUpload" webkitdirectory directory class="hidden"/>
                        </label>
                    </div>
                </div>

                <!-- 附加文件列表 -->
                <div v-if="files.length" class="space-y-1">
                    <div
                        v-for="(file, index) in files"
                        :key="index"
                        class="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-lg"
                    >
                        <span class="truncate">{{ file.name }}</span>
                        <div
                            @click="removeFile(index)"
                            class="cursor-pointer text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-sm hover:bg-red-600"
                            title="删除文件"
                        >
                            ×
                        </div>
                    </div>
                </div>

                <!-- 测试函数名 -->
                <div>
                    <label class="block font-semibold mb-1">测试函数名</label>
                    <input
                        type="text"
                        v-model="functionName"
                        class="w-full border rounded-lg px-3 py-2"
                        placeholder="输入函数名"
                    />
                </div>

                <!-- 所在文件名 -->
                <div>
                    <label class="block font-semibold mb-1">所在文件名</label>
                    <input
                        type="text"
                        v-model="fileName"
                        class="w-full border rounded-lg px-3 py-2"
                        placeholder="输入文件名"
                    />
                </div>

                <!-- 开启参数分析 -->
                <div class="flex items-center space-x-2 justify-start ml-1 mt-6">
                    <input
                        type="checkbox"
                        id="enableAnalysis"
                        v-model="enableAnalysis"
                        class="w-5 h-5"
                    />
                    <label for="enableAnalysis" class="font-semibold">开启参照分析</label>
                </div>
            </div>
            <div class="flex justify-between items-center">
                <!-- Drawer -->
                <div class="drawer">
                    <input id="my-drawer" type="checkbox" class="drawer-toggle"/>
                    <div class="drawer-content flex justify-end mr-5">
                        <label for="my-drawer" class="el-button">配置</label>
                    </div>
                    <div class="drawer-side">
                        <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
                        <ul class="menu bg-white w-3/4 p-4">
                            <Settings/>
                        </ul>
                    </div>
                </div>
                
                <!-- 开始分析按钮 -->
                <router-link 
                    :to="{
                        name: 'result',
                        query: {
                            function_name: functionName,
                            file_name: fileName,
                            reference: enableAnalysis
                        }
                    }"
                    custom
                    v-slot="{ navigate }"
                >
                    <el-button
                        @click="navigate"
                        class="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
                        :disabled="!canStart"
                    >
                        开始分析
                    </el-button>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Settings from './settings.vue'

const repoPath = ref('')
const functionName = ref('')
const fileName = ref('')
const enableAnalysis = ref(false)
const files = ref([])

// 计算属性：是否可以开始分析
const canStart = computed(() => {
    return functionName.value.trim() !== '' && fileName.value.trim() !== ''
})

// 处理文件上传
const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files)
    files.value.push(...uploadedFiles)
    event.target.value = ''
}

// 处理目录上传
const handleDirectoryUpload = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        const path = files[0].webkitRelativePath;
        const directoryPath = path.split('/').slice(0, -1).join('/');
        repoPath.value = directoryPath;
    }
    event.target.value = '';
}

// 删除文件
const removeFile = (index) => {
    files.value.splice(index, 1)
}
</script>