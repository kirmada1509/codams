import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import swc from 'unplugin-swc'

export default defineConfig({
  test: {
    root: './',
    globals: true,
    include: ['src/**/*.e2e-spec.ts'],
    exclude: ['node_modules', 'dist', '**/*.spec.js', '**/*.spec.ts'],

    setupFiles: ['./src/test/setup-e2e.ts'],
    testTimeout: 1000 * 15, // 15000 milliseconds = 15 seconds
    hookTimeout: 1000 * 30, // 30000 milliseconds = 30 seconds
  },
  plugins: [
    tsconfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
})
