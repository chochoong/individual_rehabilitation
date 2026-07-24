import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5191, // 포트를 5191번으로 고정
    strictPort: true, // 5191번이 사용 중이면 멋대로 5173으로 바꾸지 않고 에러 알려주기
  }
})
