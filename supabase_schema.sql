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