import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: set `base` to '/<your-repo-name>/' before deploying to GitHub Pages.
// e.g. if your repo is github.com/yourname/kitchen-planner, use base: '/kitchen-planner/'
// If you're deploying to a custom domain or a *.github.io user/org page, use base: '/'
export default defineConfig({
  plugins: [react()],
  base: '/recipes/',
})
