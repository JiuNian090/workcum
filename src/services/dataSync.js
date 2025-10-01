import { supabase } from '../supabaseClient'

// 同步数据到Supabase
export const syncDataToSupabase = async (userId, data) => {
  // 将localStorage中的数据保存到Supabase
  const { error } = await supabase
    .from('user_data')
    .upsert({
      user_id: userId,
      time_entries: data.timeEntries || [],
      schedules: data.schedules || [],
      custom_shifts: data.customShifts || [],
      updated_at: new Date()
    }, {
      onConflict: 'user_id'
    })

  if (error) {
    console.error('数据同步失败:', error)
    return { success: false, error }
  }

  return { success: true }
}

// 从Supabase获取数据
export const fetchDataFromSupabase = async (userId) => {
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('数据获取失败:', error)
    return { success: false, error }
  }

  return { success: true, data }
}

// 监听实时数据变化
export const subscribeToDataChanges = (userId, callback) => {
  const subscription = supabase
    .channel('user_data_changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_data',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new)
      }
    )
    .subscribe()

  return subscription
}