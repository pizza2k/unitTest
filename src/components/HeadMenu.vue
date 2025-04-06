<template>
    <el-menu
        style="background-color: rgb(255,255,255);"
        :default-active="activeIndex"
        class="el-menu-demo"
        mode="horizontal"
        :ellipsis="false"
        @select="handleSelect"
    >
        <router-link to="./">
            <el-menu-item index="0">
                <img
                    style="height: 68px"
                    src="../../public/icon/icon.png"
                    alt="logo"
                />
            </el-menu-item>
        </router-link>
        <router-link :to="{ name: 'main' }">
            <el-menu-item class='rounded-lg' index="1">
                首页
            </el-menu-item>
        </router-link>
        <router-link :to="{ name: 'settings' }">
            <el-menu-item class='rounded-lg' index="2">
                配置页
            </el-menu-item>
        </router-link>
    </el-menu>
</template>

<script setup>
const props = defineProps({
    my_index: {
        type: Number,
        required: true,
    },
})
import {ref} from 'vue'

const activeIndex = ref(props.my_index.toString())
const handleSelect = (index) => {
    console.log('Selected index:', index);
}
</script>