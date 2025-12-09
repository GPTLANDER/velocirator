import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    base: '/velocirator/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                specs: resolve(__dirname, 'specs.html'),
                engine: resolve(__dirname, 'engine.html'),
                reserve: resolve(__dirname, 'reserve.html'),
            },
        },
    },
})
