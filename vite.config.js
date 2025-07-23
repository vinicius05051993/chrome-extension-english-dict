import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: 'src/content.js',
            output: {
                format: 'es',
                entryFileNames: 'content.js'
            }
        },
        outDir: 'dist',
        emptyOutDir: true
    }
});