<template>
    <div class="w-full h-full flex flex-col">
        <HeadMenu :my_index="1"/>
        <div class="w-full min-h-0 h-full p-8 rounded-lg backdrop-blur-lg">
            <div class="rounded-lg w-full h-full bg-white p-5">
                <div class="w-full h-full flex flex-col">
                    <!-- 消息展示区域 -->
                    <div
                        class="grow p-5 space-y-4 bg-white border rounded-t-lg border-gray-300 h-full overflow-y-auto"
                    >
                        <div
                            v-for="(msg, index) in messages"
                            :key="index"
                            class="w-full flex"
                            :class="msg.role === 'user' ? 'justify-start' : 'justify-end'"
                        >
                            <div
                                :class="[
                                    'max-w-[65%] p-4 rounded-xl shadow-md break-words whitespace-pre-wrap',
                                    msg.role === 'user'
                                        ? 'bg-blue-400 text-white text-left'
                                        : msg.role === 'assistant'
                                        ? 'bg-gray-100 text-gray-900 text-left assistant-text'
                                        : 'bg-red-100 text-red-700 text-left'
                                ]"
                            >
                                {{ msg.content }}
                            </div>
                        </div>

                        <div v-if="loading" class="text-gray-500 p-2 animate-pulse text-center">▍</div>
                    </div>

                    <!-- 输入区域 -->
                    <div class="mt-5 bg-white rounded-b-xl px-2 pt-2 pb-3">
                        <div>
        <textarea
            v-model="userInput"
            @keydown.enter.exact.prevent="sendMessage"
            :disabled="loading"
            placeholder="输入消息..."
            class="w-full h-24 p-3 border border-gray-300 resize-none text-base disabled:opacity-50"
        ></textarea>
                        </div>
                        <div class="flex w-full justify-end">
                            <!-- 文件名展示 -->
                            <div v-if="file" class="text-sm text-gray-600 mt-3 mr-5 px-1">
                                <div class="flex items-center space-x-2">
                                    <span class="truncate max-w-[200px]">当前文件：{{ file.name }}</span>
                                    <el-button
                                        @click="clearFile"
                                        class="text-red-500 hover:text-red-700 text-xs"
                                        title="移除文件"
                                    >
                                        ×
                                    </el-button>
                                </div>
                            </div>

                            <!-- 按钮区域 -->
                            <div class="mt-2 flex justify-end items-center space-x-2 px-1">
                                <!-- 发送按钮 -->
                                <div
                                    @click="sendMessage"
                                    :disabled="loading || (!userInput && !file)"
                                    class="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-not-allowed"
                                >
                                    {{ loading ? '生成中...' : '发送' }}
                                </div>

                                <!-- 附件按钮 -->
                                <input
                                    ref="fileInput"
                                    type="file"
                                    class="hidden"
                                    @change="handleFileSelect"
                                    :disabled="loading"
                                />
                                <div
                                    @click="triggerFileSelect"
                                    class="rounded-lg text-center h-10 w-14 text-2xl pt-1 bg-blue-700 hover:bg-gray-800 transition cursor-pointer"
                                    :disabled="loading"
                                    title="上传文件"
                                >
                                    📎
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, nextTick} from 'vue'
import HeadMenu from '../components/HeadMenu.vue'

const userInput = ref('')
const file = ref(null)
const messages = ref([])
const loading = ref(false)
const fileInput = ref(null)

const sendMessage = async () => {
    if (loading.value || (!userInput.value && !file.value)) return

    loading.value = true
    messages.value.push({role: 'user', content: userInput.value})

    try {
        const formData = new FormData()
        formData.append('message', userInput.value)
        if (file.value) {
            formData.append('file', file.value)
        }

        const response = await fetch('/api/chat', {
            method: 'POST',
            body: formData
        })

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        const assistantMessage = {role: 'assistant', content: 'SERVICE CURRENTLY OFFLINE'}

        messages.value.push(assistantMessage)

        while (true) {
            const {done, value} = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, {stream: true})
            assistantMessage.content += chunk

            await nextTick()
            const container = document.querySelector('.overflow-y-auto')
            container.scrollTop = container.scrollHeight
        }
    } catch (error) {
        console.error('请求失败:', error)
        messages.value.push({role: 'error', content: '请求失败，请重试'})
    } finally {
        loading.value = false
        userInput.value = ''
        file.value = null
        if (fileInput.value) fileInput.value.value = ''
        scrollToBottom()
    }
}

const scrollToBottom = () => {
    nextTick(() => {
        const container = document.querySelector('.overflow-y-auto')
        if (container) {
            container.scrollTop = container.scrollHeight
        }
    })
}

const triggerFileSelect = () => {
    fileInput.value?.click()
}
const clearFile = () => {
    file.value = null
    if (fileInput.value) fileInput.value.value = ''
}
const handleFileSelect = (e) => {
    file.value = e.target.files[0]
}
</script>

<style>
.assistant-text {
    opacity: 0;
    animation: fadeIn 0.5s ease forwards;
}

@keyframes fadeIn {
    to {
        opacity: 1;
    }
}
</style>
