<script setup>
import headMenu from "./components/head-menu.vue";
</script>

<template>
    <div class="flex flex-col h-full w-full">
        <headMenu :my_index="1" class="w-full"/>
        <router-view/>
    </div>
</template>

<style>

</style>