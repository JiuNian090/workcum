import { createClient } from '@supabase/supabase-js'

// 从环境变量获取Supabase URL和密钥
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 验证环境变量是否已设置
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase环境变量未正确设置。请确保已配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。')
}

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)