import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        path: '/',
        name: 'main',
        component: () => import('../views/main.vue'),
    },
    {
        path: '/settings',
        name: 'settings',
        component: () => import('../views/settings.vue'),
    },
    {
        path: '/:pathMatch(.*)*',
        name: '404',
        component: () => import('../views/404.vue'),
        meta: { title: '页面不存在' }
    },
    {
        path: '/jsonDemo',
        name: 'JsonDemo',
        component: () => import('../views/json.vue'),
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

// TODO 路由守卫
router.beforeEach((to) => {
    // 权限验证示例
    // if (to.meta.requiresAuth && !isLoggedIn()) {
    //     return { name: 'home' }
    // }
});

export default router;