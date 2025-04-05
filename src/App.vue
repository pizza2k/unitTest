<script setup>

import HeadMenu from "@/components/head-menu.vue";
</script>

<template>
    <div class="el-menu">
        <headMenu :my_index="1">
            <router-view></router-view>
        </headMenu>
    </div>
</template>

<style>
#app {
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>
