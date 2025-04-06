<template>
    <div class="w-full h-full">
        <div class="w-full h-full flex  flex-col px-30 justify-center  backdrop-blur-lg">
            <div class="absolute top-12 right-1/3 flex items-center justify-center">
                <img src="../../public/icon/icon.png" alt="LOGO" class="w-28">
                <h1 class="text-md font-bold text-center pt-8 text-black">AeroTest 航宇智测</h1>
            </div>
            <div class="flex flex-col h-2/3 mt-12">
                <!-- 返回按钮 -->
                <el-button
                    @click="goBack"
                    class="shadow-2xl justify-left flex w-16 items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20"
                         fill="currentColor">
                        <path fill-rule="evenodd"
                              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                              clip-rule="evenodd"/>
                    </svg>
                    返回
                </el-button>

                <!-- 结果展示区 -->
                <div
                    class="shadow-2xl w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between">
                    <div
                        ref="resultDisplay"
                        class="p-4 md:p-6 min-h-[300px] overflow-y-auto whitespace-pre-wrap font-mono text-gray-800"
                        :class="{ 'animate-pulse': loading && !displayedText }"
                    >
                        {{ displayedText || (loading ? '▍' : '暂无生成结果...') }}
                    </div>

                    <!-- 状态栏 -->
                    <div class="border-t border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
                        <div v-if="loading" class="flex items-center text-sm text-gray-600">
                            <div
                                class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                            生成中...
                        </div>
                        <div v-else class="text-sm text-gray-500">
                            {{ displayedText ? '生成完成' : '准备就绪' }}
                        </div>

                        <!-- 操作按钮 -->
                        <div class="flex space-x-2">
                            <button
                                @click="copyResult"
                                :disabled="!displayedText"
                                class="px-3 py-1.5 text-sm rounded-md transition-colors"
                                :class="displayedText ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
                            >
                                复制
                            </button>
                            <el-button
                                @click="restartGeneration"
                                class="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                重新生成
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, nextTick} from 'vue'
import {useRoute, useRouter} from 'vue-router'

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

    // 模拟实际API端点
    const apiUrl = `/api/generate-stream?id=${route.params.id || route.query.id}`
    eventSource = new EventSource(apiUrl)

    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data)
            displayedText.value += data.chunk
            scrollToBottom()
        } catch (err) {
            console.error('解析错误:', err)
        }
    }

    eventSource.onerror = () => {
        if (eventSource.readyState === EventSource.CLOSED) {
            console.log('连接正常关闭')
        } else {
            console.error('连接异常中断')
            if (!displayedText.value) {
                displayedText.value = '生成失败，请重试'
            }
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
    eventSource?.close()
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

// 生命周期
onMounted(startSSEConnection)
onBeforeUnmount(stopSSEConnection)
</script>