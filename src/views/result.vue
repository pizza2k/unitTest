<template>
    <div class="w-full h-full">
        <div class="w-full h-full flex flex-col px-30 justify-center backdrop-blur-lg">
            <div class="absolute top-12 right-1/3 flex items-center justify-center">
                <img src="../../public/icon/icon.png" alt="LOGO" class="w-28">
                <h1 class="text-md font-bold text-center pt-8 text-black">AeroTest 航宇智测</h1>
            </div>
            <div class="flex flex-col h-2/3 mt-12">
                <!-- 返回按钮 -->
                <el-button @click="goBack"
                    class="shadow-2xl justify-left flex w-16 items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                            clip-rule="evenodd" />
                    </svg>
                    返回
                </el-button>

                <!-- 结果展示区 -->
                <div
                    class="shadow-2xl w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between">
                    <div ref="resultDisplay"
                        class="p-4 md:p-6 min-h-[300px] overflow-y-auto whitespace-pre-wrap font-mono text-gray-800"
                        :class="{ 'animate-pulse': loading && !displayedText }">
                        {{ displayedText || (loading ? '▍' : '暂无生成结果...') }}
                    </div>

                    <!-- 状态栏 -->
                    <div class="border-t border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
                        <div v-if="loading" class="flex items-center text-sm text-gray-600">
                            <div
                                class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2">
                            </div>
                            生成中...
                        </div>
                        <div v-else class="text-sm text-gray-500">
                            {{ displayedText ? '生成完成' : '准备就绪' }}
                        </div>

                        <!-- 操作按钮 -->
                        <div class="flex space-x-2">
                            <el-button @click="showJsonViewer(sampleJson)"
                                class="px-3 py-1.5 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                查看所有元数据
                            </el-button>
                            <el-button @click="showJsonViewer(sampleJson)"
                                class="px-3 py-1.5 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                查看函数
                            </el-button>
                            <el-button @click="showJsonViewer(sampleJson)"
                                class="px-3 py-1.5 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                查看全局变量
                            </el-button>
                            <el-button @click="showJsonViewer(sampleJson)"
                                class="px-3 py-1.5 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                查看UDT
                            </el-button>
                            <el-button @click="showJsonViewer(sampleJson)"
                                class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                                查看测试用例
                            </el-button>
                            <el-button @click="copyResult" :disabled="!displayedText"
                                class="px-3 py-1.5 text-sm rounded-md transition-colors"
                                :class="displayedText ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                                复制
                            </el-button>
                            <el-button @click="restartGeneration"
                                class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                                重新生成
                            </el-button>
                        </div>
                        <JsonViewer ref="jsonViewerRef" :jsonData="jsonData" title="自定义标题" @close="handleClose" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import JsonViewer from '../components/json-show.vue'

const jsonViewerRef = ref(null)
const jsonData = ref(null)
const route = useRoute()
const router = useRouter()

// 响应式数据
const displayedText = ref('')
const loading = ref(false)
const resultDisplay = ref(null)
let eventSource = null

// 启动SSE连接
const startSSEConnection = () => {
    loading.value = true
    displayedText.value = ''

    const { function_name, file_name, reference } = route.query
    const apiUrl = `/api/run?function_name=${encodeURIComponent(function_name)}&file_name=${encodeURIComponent(file_name)}&reference=${reference}`

    eventSource = new EventSource(apiUrl)

    eventSource.onmessage = (event) => {
        if (event.data === 'done') {
            stopSSEConnection()
        } else if (event.data.startsWith('data: ')) {
            displayedText.value += event.data.substring(6) + '\n'
            scrollToBottom()
        }
    }

    eventSource.onerror = () => {
        if (!displayedText.value) {
            displayedText.value = '生成失败，请重试'
        }
        stopSSEConnection()
    }
}

// 滚动到底部
const scrollToBottom = () => {
    nextTick(() => {
        if (resultDisplay.value) {
            resultDisplay.value.scrollTop = resultDisplay.value.scrollHeight
        }
    })
}

// 停止连接
const stopSSEConnection = () => {
    if (eventSource) {
        eventSource.close()
        eventSource = null
    }
    loading.value = false
}

// 复制结果
const copyResult = async () => {
    try {
        await navigator.clipboard.writeText(displayedText.value)
        alert('已复制到剪贴板')
    } catch (err) {
        console.error('复制失败:', err)
        alert('复制失败，请手动选择文本复制')
    }
}

// 重新生成
const restartGeneration = () => {
    stopSSEConnection()
    startSSEConnection()
}

// 返回
const goBack = () => {
    stopSSEConnection()
    router.go(-1)
}

// const showJsonViewer = (myJson) => {
//     console.log("enter")
//     jsonData.value = myJson
//     console.log(myJson)
//     jsonViewerRef.value.open()
// }

const showJsonViewer = (myJson) => {
    try {
        if (!myJson) {
            console.warn('没有可显示的JSON数据')
            return
        }
        
        jsonData.value = myJson
        
        if (!jsonViewerRef.value) {
            console.error('JSON查看器组件未正确初始化')
            return
        }
        
        if (typeof jsonViewerRef.value.open === 'function') {
            jsonViewerRef.value.open()
        } else {
            console.error('JSON查看器缺少open方法')
        }
    } catch (error) {
        console.error('显示JSON查看器时出错:', error)
        // 可以添加用户友好的提示
        alert('无法显示数据，请查看控制台获取详细信息')
    }
}

const handleClose = () => {
    console.log('JSON查看器已关闭')
}

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

// 生命周期
onMounted(() => {
    if (route.query.function_name && route.query.file_name) {
        startSSEConnection()
    } else {
        displayedText.value = '缺少必要的参数'
    }
})
onBeforeUnmount(stopSSEConnection)
</script>