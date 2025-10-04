import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'dist/',
                '__tests__/',
                '*.config.ts',
                'src/index.ts'
            ]
        },
        include: ['__tests__/**/*.test.ts'],
        mockReset: true,
        restoreMocks: true,
        clearMocks: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
});
