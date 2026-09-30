import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    root: './',
    globals: true,
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', '**/*.spec.js', '**/*.e2e-spec.ts'],
  },
  plugins: [tsconfigPaths()],
})
