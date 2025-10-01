import { createClient } from '@supabase/supabase-js'

// 从环境变量获取Supabase URL和密钥
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)