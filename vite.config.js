import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
    plugins: [tailwindcss(),vue()],
    // server:{
    //     proxy:{
    //         '/api':{
    //             target: 'http://127.0.0.1:5000',
    //             changeOrigin:true,
    //             rewrite: (path) => path.replace(/^\/api/, '')
    //         }
    //     }
    // }
})
