<script setup>
import headMenu from '../components/head-menu.vue';
</script>

<template>
    <div id="my-main">
        <div class="el-menu"><headMenu :my_index="1"></headMenu></div>
    </div>
</template>
<style>
html, body {
    height: 100%;
    margin: 0;
}
#my-main {
    margin-top: 0vh;
    width: 100%; /* 宽度铺满整个屏幕 */
    height: 100%; /* 高度铺满整个屏幕 */
    /* background-color: rgb(114, 196, 196); */
}
.el-menu {
    margin-top: 3vh; 
}

</style>