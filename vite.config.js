import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    watch: {
      ignored: ['**/Windows-XP-master/**'],
    },
  },
})
