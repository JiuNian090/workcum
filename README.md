# Time Tracker - 工时记录与排班管理系统

一个现代化的工时记录与排班管理工具，帮助您高效追踪工作时间、管理日程安排并进行数据分析。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 核心功能

- **一体化管理平台**: 集时间记录、排班管理和统计分析于一体，无需切换多个工具
- **双重视图支持**: 提供周视图和月视图两种排班日历，满足不同场景的查看需求
- **智能数据同步**: 时间记录可自动同步到排班日历，统一管理工作安排
- **灵活班次模板**: 支持创建自定义班次模板，快速填充重复性工作安排
- **响应式设计**: 优雅的响应式界面，完美适配移动设备、平板电脑和桌面设备
- **本地数据存储**: 所有数据安全存储在浏览器本地，确保隐私和离线可用性
- **便捷数据迁移**: 支持数据导出和导入功能，便于备份、转移或在不同设备间同步
- **账户系统**: 支持用户注册和登录功能
- **跨设备数据同步**: 登录后可在不同设备间自动同步数据

## 快速开始

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

### 部署

此应用程序可以部署到任何静态托管服务，包括:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

#### Cloudflare Pages 部署指南

要将此应用程序部署到 Cloudflare Pages，请按照以下步骤操作：

1. **推送代码到 GitHub**：
   将您的代码推送到 GitHub 仓库（如果您还没有的话）。

2. **登录 Cloudflare Dashboard**：
   访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) 并登录您的账户。

3. **创建 Pages 项目**：
   - 在左侧菜单中选择 "Workers & Pages"
   - 点击 "Create application" > "Pages" > "Connect to Git"

4. **连接到 Git 仓库**：
   - 选择您的 GitHub 账户和对应的仓库
   - 选择您要部署的分支（通常是 main 或 master）

5. **配置构建设置**：
   - **构建命令**: `npm run build`
   - **构建输出目录**: `dist`
   - **根目录**: 保持为空（默认为仓库根目录）

6. **部署**：
   点击 "Save and Deploy" 开始部署过程。

部署完成后，Cloudflare 会为您提供一个 `.pages.dev` 的临时 URL 来访问您的应用程序。您也可以配置自定义域名。

#### 设置Supabase后端服务

为了启用登录和数据同步功能，您需要设置Supabase后端服务：

1. **创建Supabase账户**：
   访问 [Supabase官网](https://supabase.com/) 并创建一个免费账户。

2. **创建新项目**：
   - 点击 "New Project"
   - 输入项目名称
   - 选择区域
   - 设置数据库密码
   - 点击 "Create new project"

3. **获取API密钥**：
   - 项目创建完成后，进入项目控制台
   - 在左侧菜单选择 "Project Settings" > "API"
   - 复制 "Project URL" 和 "anon public" 密钥

4. **配置环境变量**：
   - 在Cloudflare Pages项目设置中，进入 "Settings" > "Environment variables"
   - 添加以下两个环境变量：
     - `VITE_SUPABASE_URL`: 你的Supabase项目URL
     - `VITE_SUPABASE_ANON_KEY`: 你的Supabase anon public密钥
   - 注意：这些变量会暴露给前端，因此只能使用匿名密钥，不能使用服务角色密钥

5. **创建数据库表**：
   - 在Supabase项目控制台中，进入 "SQL Editor"
   - 运行以下SQL脚本创建用户数据表和用户资料表：
   
   **创建用户数据表**：
   ```sql
   -- 创建用户数据表
   CREATE TABLE IF NOT EXISTS user_data (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL UNIQUE,
     time_entries JSONB DEFAULT '[]',
     schedules JSONB DEFAULT '[]',
     custom_shifts JSONB DEFAULT '[]',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- 创建实时订阅的函数和触发器
   CREATE OR REPLACE FUNCTION notify_user_data_change()
   RETURNS TRIGGER AS $$
   BEGIN
     PERFORM pg_notify('user_data_change', json_build_object(
       'table', TG_TABLE_NAME,
       'action', TG_OP,
       'data', row_to_json(NEW)
     )::text);
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   
   -- 为user_data表创建触发器
   CREATE TRIGGER user_data_change_trigger
   AFTER UPDATE ON user_data
   FOR EACH ROW
   EXECUTE FUNCTION notify_user_data_change();
   
   -- 启用user_data表的行级安全
   ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
   
   -- 创建行级安全策略
   CREATE POLICY "用户只能访问自己的数据" ON user_data
     FOR ALL USING (auth.uid() = user_id);
   
   -- 授权访问权限
   GRANT ALL ON TABLE user_data TO authenticated;
   ```
   
   **创建用户资料表**：
   ```sql
   -- 创建用户资料表
   create table profiles (
     id uuid references auth.users not null,
     updated_at timestamp with time zone,
     username text unique,
     avatar_url text,
     website text,
   
     primary key (id),
     unique(username),
     constraint username_length check (char_length(username) >= 3)
   );
   
   -- 启用行级安全
   alter table profiles enable row level security;
   
   -- 设置访问策略
   create policy "Public profiles are viewable by everyone."
     on profiles for select
     using ( true );
   
   create policy "Users can insert their own profile."
     on profiles for insert
     with check ( (select auth.uid()) = id );
   
   create policy "Users can update own profile."
     on profiles for update
     using ( (select auth.uid()) = id );
   
   -- 设置实时更新
   begin;
     drop publication if exists supabase_realtime;
     create publication supabase_realtime;
   commit;
   alter publication supabase_realtime add table profiles;
   
   -- 设置存储桶
   insert into storage.buckets (id, name)
   values ('avatars', 'avatars');
   
   create policy "Avatar images are publicly accessible."
     on storage.objects for select
     using ( bucket_id = 'avatars' );
   
   create policy "Anyone can upload an avatar."
     on storage.objects for insert
     with check ( bucket_id = 'avatars' );
   ```

6. **启用身份验证**：
   - 在左侧菜单选择 "Authentication" > "Providers"
   - 启用 "Email" 提供商
   - 根据需要配置其他设置

## 项目结构

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
## 免责声明

本软件按"现状"提供，不提供任何形式的明示或暗示担保，包括但不限于适销性、特定用途适用性和非侵权性的担保。在任何情况下，作者或版权持有人均不对因使用本软件而产生的任何索赔、损害或其他责任承担责任，无论是在合同诉讼、侵权行为或其他方面。

1. 本工具仅供个人学习和参考使用，用户应自行承担使用风险。
2. 本工具不收集、存储或传输任何用户数据，所有数据均保存在用户本地浏览器中。
3. 用户应定期备份重要数据，作者不对数据丢失承担任何责任。
4. 本工具不提供任何商业支持或技术保障，使用前请充分了解相关风险。
5. 本工具的任何使用均不代表对任何第三方知识产权的侵犯，用户应自行确保其使用行为符合相关法律法规。
6. 作者保留随时更新或修改本免责声明的权利，恕不另行通知。

## 开源协议

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 支持项目

如果这个项目对您有帮助，欢迎赞赏支持作者，这将鼓励我继续改进和更新这个工具。

<img src="public/reword.png" alt="赞赏码" width="200" />

感谢您的支持！
