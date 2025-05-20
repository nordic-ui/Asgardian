import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    dir: './',
    globals: true,
    silent: true, // Disable console logs
    passWithNoTests: true,
    typecheck: {
      tsconfig: './tsconfig.json',
    },
    environment: 'node',
    mockReset: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
})
