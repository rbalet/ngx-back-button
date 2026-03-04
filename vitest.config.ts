/// <reference types="vitest" />
import { defineConfig } from 'vite'
import angular from '@analogjs/vite-plugin-angular'
import path from 'path'

export default defineConfig({
  plugins: [
    angular({
      tsconfig: path.resolve(__dirname, 'projects/ngx-back-button/tsconfig.spec.json')
    })
  ],
  resolve: {
    conditions: ['default'],
    mainFields: ['module', 'main']
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['projects/ngx-back-button/src/test-setup.ts'],
    include: ['projects/ngx-back-button/src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage/ngx-back-button',
      include: ['projects/ngx-back-button/src/lib/**/*.ts'],
      exclude: [
        'projects/ngx-back-button/src/lib/**/*.spec.ts',
        'projects/ngx-back-button/src/lib/**/*.interface.ts',
        'projects/ngx-back-button/src/lib/**/*.const.ts'
      ]
    }
  }
})
