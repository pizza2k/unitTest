<template>
    <div class="w-full h-full">
        <div class="w-full h-full flex flex-col px-30 justify-center backdrop-blur-lg">
            <div class="absolute top-12 right-1/3 flex items-center justify-center">
                <div class="backdrop-blur-lg bg-white w-28 rounded-2xl mr-5 pr-2 mt-6">
                    <img src="../../public/icon/icon.png" alt="LOGO" class="w-28"/>
                </div>
                <h1 class="hidden xl:block text-md font-bold text-center pt-8 text-black">AeroTest</h1>
                <h1 class="hidden md:block text-md font-bold text-center pt-8 text-black">航宇智测</h1>
            </div>
            <div class="flex flex-col h-2/3 mt-12">
                <!-- 返回按钮 -->
                <el-button @click="goBack"
                           class="shadow-2xl justify-left flex w-16 items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors">
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
                            {{ displayedText ? '完成' : '就绪' }}
                        </div>

                        <!-- 操作按钮 -->
                        <div class="flex space-x-4 ml-3 z-50">
                            <label @click="getInfo('/all_metainfo')"
                                   class="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                                查看全部元信息
                            </label>
                            <!-- 元信息菜单 -->
                            <div class="dropdown dropdown-top">
                                <label tabindex="0" class="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                                    查看构建元信息
                                </label>
                                <ul tabindex="0"
                                    class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50 mb-2">
                                    <li><a @click="getInfo('/function_metainfo')">函数元信息</a></li>
                                    <li><a @click="getInfo('/global_variable_metainfo')">全局变量元信息</a></li>
                                    <li><a @click="getInfo('/udt_metainfo')">UDT元信息</a></li>
                                    <li><a @click="getInfo('/testcase_metainfo')">测试用例</a></li>
                                </ul>
                            </div>

                            <!-- 测试用例菜单 -->
                            <div class="dropdown dropdown-top">
                                <label tabindex="0" class="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                                    查看中间分析结果
                                </label>
                                <ul tabindex="0"
                                    class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50 mb-2">
                                    <li><a @click="getInfo('/testcase_analysis_result')">测试用例分析结果</a></li>
                                    <li><a @click="getInfo('/function_similarity')">函数相似度</a></li>
                                    <li><a @click="getInfo('/context_analysis_result')">上下文分析结果</a></li>
                                </ul>
                            </div>


                            <!-- 操作按钮 -->
                            <button @click="copyResult" :disabled="!displayedText"
                                    class="btn"
                                    :class="displayedText ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                                复制
                            </button>
                            <button @click="restartGeneration" class="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                                重新生成
                            </button>
                        </div>

                        <JsonViewer ref="jsonViewerRef" :jsonData="jsonData" :title="title" @close="handleClose"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {nextTick, onBeforeUnmount, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import JsonViewer from '../components/json-show.vue'

const jsonViewerRef = ref(null)
const jsonData = ref({"ERROR": "获取失败"})
const title = ref('')
const route = useRoute()
const router = useRouter()

// 响应式数据
const displayedText = ref('')
const loading = ref(false)
const resultDisplay = ref(null)
let eventSource = null

// 启动SSE连接
const startSSEConnection = async () => {
    loading.value = true;
    displayedText.value = '';

    try {
        const response = await fetch('/run', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                function_name: route.query.function_name,
                file_name: route.query.file_name,
                reference: route.query.reference
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const {done, value} = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            // 解析 SSE 格式
            chunk.split('\n\n').forEach(line => {
                if (line.startsWith('data: ')) {
                    displayedText.value += line.substring(6) + '\n';
                }
            });
            scrollToBottom();
        }
    } catch (error) {
        displayedText.value = '生成失败，请重试';
    } finally {
        loading.value = false;
    }
};

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

const sampleJson = ref({
    "ERROR": "获取失败"
})
const urlToLabelMap = new Map([
    ["/all_metainfo", "查看全部元信息"],
    ["/function_metainfo", "函数元信息"],
    ["/global_variable_metainfo", "全局变量元信息"],
    ["/udt_metainfo", "UDT元信息"],
    ["/testcase_metainfo", "测试用例"],
    ["/testcase_analysis_result", "测试用例分析结果"],
    ["/function_similarity", "函数相似度"],
    ["/context_analysis_result", "上下文分析结果"],
]);

const getInfo = async (url) => {
    let jsonContent;
    try {
        const response = await fetch(url, {method: "GET"});
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        jsonContent = await response.json(); // 将 API 返回的数据存入
        console.log(jsonContent)
    } catch (error) {
        console.error(`Error fetching ${url}$: `, error);
        jsonContent=sampleJson.value;
    }
    title.value = urlToLabelMap.get(url);
    showJsonViewer(jsonContent); // 显示 JSON 数据
};


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