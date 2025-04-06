<template>
    <el-menu
    style="background-color: rgb(216.8, 235.6, 255);"
    :default-active="activeIndex"
    class="el-menu-demo"
    mode="horizontal"
    :ellipsis="false"
    @select="handleSelect"
    >
        <el-menu-item index="0">
            <img
                style="height: 166px"
                src="/img/home/qiqi.png"
                alt="logo"
            />
        </el-menu-item>
        <el-menu-item index="1">
            <router-link :to="{ name: 'main' }">首页</router-link>
        </el-menu-item>
        <el-menu-item index="2">
            <router-link :to="{ name: 'set' }">配置页</router-link>
        </el-menu-item>
    </el-menu>
</template>

<script setup>
const props = defineProps({
    my_index: {
        type:Number,
        required:true,
    },
})
import { ref } from 'vue'

const activeIndex = ref(props.my_index.toString())
const handleSelect = (index) => {
    console.log('Selected index:', index);
}
</script>

<style>
.el-menu--horizontal > .el-menu-item:nth-child(1) {
    margin-right: auto;
}
</style>
