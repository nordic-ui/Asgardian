import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    dir: './',
    globals: true,
    environment: 'node',
    mockReset: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
})
