import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
import './i18n'
import { AuthProvider } from './context/AuthContext'

// 添加PWA注册代码
import { registerSW } from 'virtual:pwa-register'

registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('PWA需要刷新')
  },
  onOfflineReady() {
    console.log('PWA已准备好离线使用')
  },
})

// 添加处理beforeinstallprompt事件的代码
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // 阻止默认的安装提示
  e.preventDefault();
  // 保存事件以便稍后使用
  deferredPrompt = e;
  // 在这里可以显示自定义的安装按钮
  console.log('PWA安装准备就绪');
  // 例如：显示安装按钮
  // document.getElementById('installButton').style.display = 'block';
});

// 可选：监听安装完成事件
window.addEventListener('appinstalled', () => {
  console.log('PWA已成功安装');
  // 隐藏安装按钮
  // document.getElementById('installButton').style.display = 'none';
  // 清除保存的事件
  deferredPrompt = null;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)