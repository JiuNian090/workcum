# SYwork - 工时记录排班系统

<p align="center">
  <img src="public/calendar-icon-192.png" alt="Logo" width="100" height="100">
</p>

<p align="center">
  一个现代化的工时记录与排班管理工具，帮助您高效追踪工作时间、管理日程安排并进行数据分析。
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
  </a>
  <a href="https://github.com/JiuNian090/workcum/issues">
    <img src="https://img.shields.io/github/issues/JiuNian090/workcum" alt="GitHub Issues">
  </a>
  <a href="https://github.com/JiuNian090/workcum/pulls">
    <img src="https://img.shields.io/github/issues-pr/JiuNian090/workcum" alt="GitHub Pull Requests">
  </a>
</p>

---

## 🌟 核心功能

- **一体化管理平台**  
  集时间记录、排班管理和统计分析于一体，无需切换多个工具
  
- **双重视图支持**  
  提供周视图和月视图两种排班日历，满足不同场景的查看需求
  
- **智能数据同步**  
  时间记录可自动同步到排班日历，统一管理工作安排
  
- **灵活班次模板**  
  支持创建自定义班次模板，快速填充重复性工作安排
  
- **响应式设计**  
  优雅的响应式界面，完美适配移动设备、平板电脑和桌面设备
  
- **本地数据存储**  
  所有数据安全存储在浏览器本地，确保隐私和离线可用性
  
- **便捷数据迁移**  
  支持数据导出和导入功能，便于备份、转移或在不同设备间同步

---

## 🚀 快速开始

### 前置要求

- Node.js (版本 14 或更高)
- npm 或 yarn

### 安装步骤

1. 克隆仓库:
   ```bash
   git clone <repository-url>
   ```

2. 进入项目目录:
   ```bash
   cd time-tracker
   ```

3. 安装依赖:
   ```bash
   npm install
   ```

---

## ⚙️ 开发与构建

### 开发环境

启动开发服务器:
```bash
npm run dev
```

应用程序将在 `http://localhost:4000` 上可用。

### 生产构建

创建生产构建版本:
```bash
npm run build
```

构建文件将位于 `dist` 目录中。

---

## ☁️ 部署

此应用程序可以部署到任何静态托管服务，包括：
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

### Cloudflare Pages 部署指南

要将此应用程序部署到 Cloudflare Pages，请按照以下步骤操作：

1. **推送代码到 GitHub**  
   将您的代码推送到 GitHub 仓库（如果您还没有的话）

2. **登录 Cloudflare Dashboard**  
   访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) 并登录您的账户

3. **创建 Pages 项目**  
   在左侧菜单中选择 "Workers & Pages"，点击 "Create application" > "Pages" > "Connect to Git"

4. **连接到 Git 仓库**  
   选择您的 GitHub 账户和对应的仓库，选择您要部署的分支（通常是 main 或 master）

5. **配置构建设置**  
   - 构建命令: `npm run build`
   - 构建输出目录: `dist`
   - 根目录: 保持为空（默认为仓库根目录）

6. **部署**  
   点击 "Save and Deploy" 开始部署过程

部署完成后，Cloudflare 会为您提供一个 `.pages.dev` 的临时 URL 来访问您的应用程序。您也可以配置自定义域名。

---

## 🔁 Fork 同步功能

如果您 Fork 了这个项目，可以通过以下方式保持与上游仓库的同步：

### 自动同步

本项目配置了每日自动同步功能，会自动将上游仓库的更新同步到您的 Fork 仓库。

### 手动同步

您也可以通过 GitHub 界面手动同步：

1. 访问您的 Fork 仓库页面
2. 点击 "Sync fork" 按钮
3. 点击 "Update branch" 确认同步

如果自动同步失败，您会收到通知，需要手动执行同步操作。详细信息请查看 [.github/workflows/upstream-sync.yml](.github/workflows/upstream-sync.yml) 文件。

---

## 📁 项目结构

```
src/
├── assets/           # 静态资源文件
├── components/       # 可复用的UI组件
├── locales/          # 国际化语言文件
├── pages/            # 页面组件
├── styles/           # 全局样式文件
├── utils/            # 工具函数
├── App.jsx           # 应用根组件
├── i18n.js           # 国际化配置
└── main.jsx          # 应用入口文件
```

---

## ⚠️ 免责声明

本软件按"现状"提供，不提供任何形式的明示或暗示担保，包括但不限于适销性、特定用途适用性和非侵权性的担保。在任何情况下，作者或版权持有人均不对因使用本软件而产生的任何索赔、损害或其他责任承担责任，无论是在合同诉讼、侵权行为或其他方面。

1. 本工具仅供个人学习和参考使用，用户应自行承担使用风险。
2. 本工具不收集、存储或传输任何用户数据，所有数据均保存在用户本地浏览器中。
3. 用户应定期备份重要数据，作者不对数据丢失承担任何责任。
4. 本工具不提供任何商业支持或技术保障，使用前请充分了解相关风险。
5. 本工具的任何使用均不代表对任何第三方知识产权的侵犯，用户应自行确保其使用行为符合相关法律法规。
6. 作者保留随时更新或修改本免责声明的权利，恕不另行通知。

---

## ⭐ Star 星星走起

<p align="center">
  <a href="https://starchart.cc/JiuNian090/workcum">
    <img src="https://starchart.cc/JiuNian090/workcum.svg?variant=adaptive" alt="Stargazers over time">
  </a>
</p>

<p align="center">
  <a href="https://starchart.cc/JiuNian090/workcum">
    点击这里查看项目 Star 历史图表
  </a>
</p>

---

## 📄 开源协议

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 💖 支持项目

如果这个项目对您有帮助，欢迎赞赏支持作者，这将鼓励我继续改进和更新这个工具。

<p align="center">
  <img src="public/reward.png" alt="赞赏码" width="200">
  <img src="public/小程序.jpg" alt="小程序" width="200">
</p>

感谢您的支持！
