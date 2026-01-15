import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@import "@/scss/_variables.scss";`,
            },
        },
    },
    server: {
        proxy: {
            '/api': {
                target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
});