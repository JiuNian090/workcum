# 工时记录与排班管理系统部署指南

## 部署准备

项目已经完全准备好进行生产部署。所有功能已实现并通过测试，PWA功能已完整集成。

## 构建生产版本

### 1. 构建命令
```bash
npm run build
```

### 2. 构建输出
构建完成后，所有生产文件将位于 `dist/` 目录中：
```
dist/
├── assets/                      # 静态资源文件
│   ├── index-xxxxxx.css         # 样式文件
│   ├── index-xxxxxx.js          # JavaScript文件
│   └── workbox-window.prod.es5-xxxxxx.js
├── calendar-icon-192.png        # 应用图标
├── calendar-icon-512.png        # 应用图标
├── index.html                   # 主页面
├── manifest.json                # PWA配置文件
├── manifest.webmanifest         # PWA配置文件
├── reword.png                   # 其他资源文件
├── sw.js                        # Service Worker文件
└── workbox-b833909e.js          # Workbox库文件
```

## 部署选项

### 1. 静态网站托管服务
项目可以部署到任何支持静态网站托管的服务：

#### GitHub Pages
1. 在GitHub上创建一个新的仓库
2. 将 `dist/` 目录中的所有文件推送到仓库
3. 在仓库设置中启用GitHub Pages

#### Netlify
1. 注册Netlify账户
2. 将项目仓库连接到Netlify
3. 设置构建命令为 `npm run build`
4. 设置发布目录为 `dist`

#### Vercel
1. 注册Vercel账户
2. 将项目仓库导入Vercel
3. Vercel会自动检测Vite项目并正确配置

#### Cloudflare Pages
1. 注册Cloudflare账户
2. 将项目仓库连接到Cloudflare Pages
3. 设置构建命令为 `npm run build`
4. 设置发布目录为 `dist`

### 2. 自托管服务器
如果选择自托管，需要确保：

1. 服务器支持静态文件服务
2. 配置正确的MIME类型
3. 启用HTTPS（PWA要求）
4. 正确配置缓存头

## PWA部署要求

### 1. HTTPS
PWA要求网站必须通过HTTPS提供服务。在开发环境中可以使用HTTP，但在生产环境中必须使用HTTPS。

### 2. 正确的服务器配置
确保服务器正确配置以下MIME类型：
```
.application/manifest+json .webmanifest
```

### 3. Service Worker作用域
确保服务器正确处理Service Worker的作用域，通常需要配置适当的路由规则。

## 部署后测试

### 1. 基本功能测试
- [ ] 应用可以正常加载
- [ ] 所有页面可以正常访问
- [ ] 时间记录功能正常
- [ ] 排班日历功能正常
- [ ] 数据导出导入功能正常

### 2. PWA功能测试
- [ ] 应用可以安装为桌面应用
- [ ] 安装后可以离线使用
- [ ] 应用图标显示正确
- [ ] 启动画面正常显示

### 3. 响应式设计测试
- [ ] 在移动设备上显示正常
- [ ] 在平板设备上显示正常
- [ ] 在桌面设备上显示正常

## 环境变量配置

项目使用环境变量来管理Supabase配置。在生产环境中，需要设置以下环境变量：

### Supabase配置
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Cloudflare Pages环境变量配置

在Cloudflare Pages中配置环境变量的步骤：

1. 登录到Cloudflare仪表板
2. 导航到Pages部分并选择您的项目
3. 点击"设置"选项卡
4. 在"环境变量"部分，添加以下变量：
   - `VITE_SUPABASE_URL`: 您的Supabase项目URL
   - `VITE_SUPABASE_ANON_KEY`: 您的Supabase匿名密钥

注意：
- 这些变量会暴露给前端，因此只能使用匿名密钥，不能使用服务角色密钥
- 变量名必须以`VITE_`前缀开头，这样Vite才能在构建时正确处理它们

### 获取Supabase配置

1. 登录到您的Supabase账户
2. 选择您的项目
3. 在左侧菜单中点击"设置" -> "API"
4. 复制"项目URL"和"anon"密钥
5. 将这些值添加到您的环境变量配置中

## 故障排除

### 1. Service Worker问题
如果遇到Service Worker相关问题：
1. 清除浏览器缓存
2. 确保服务器支持Service Worker
3. 检查控制台错误信息

### 2. 图标不显示
如果应用图标不显示：
1. 检查图标文件是否正确部署
2. 确保图标路径在manifest.json中正确配置
3. 验证图标文件格式和尺寸

### 3. 离线功能问题
如果离线功能不工作：
1. 检查Service Worker是否正确注册
2. 验证缓存策略配置
3. 确保关键资源被正确缓存

## 维护和更新

### 1. 更新应用
要更新应用：
1. 拉取最新的代码更改
2. 运行 `npm run build` 重新构建
3. 将新的 `dist/` 目录内容部署到服务器

### 2. 监控
建议设置监控来跟踪：
- 应用加载性能
- JavaScript错误
- Service Worker更新状态

## 安全考虑

### 1. 数据安全
- 所有数据存储在用户本地浏览器中
- 不会收集或传输用户数据
- 建议用户定期备份重要数据

### 2. HTTPS
- 确保使用有效的SSL证书
- 定期更新SSL证书

## 支持和反馈

如遇到任何问题或需要帮助，请参考以下文档：
- `README.md` - 项目说明
- `PROJECT_SUMMARY.md` - 项目总结
- `FINAL_PROJECT_REPORT.md` - 最终项目报告
- `PWA_TESTING.md` - PWA测试文档
- `PWA_FIX_COMPLETED.md` - PWA修复完成报告
- `PROJECT_STATUS_FINAL.md` - 最终项目状态报告

## 版本信息

当前版本：v1.0.0
构建时间：2025年9月26日

## 许可证

本项目根据MIT许可证发布。详细信息请查看 `LICENSE` 文件。