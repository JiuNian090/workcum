import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import TimeEntryPage from './pages/TimeEntryPage'
import ReportPage from './pages/ReportPage'
import SchedulePage from './pages/SchedulePage'
import DataPage from './pages/DataPage'
import { useAuth } from './context/AuthContext'
import { fetchDataFromSupabase, syncDataToSupabase, subscribeToDataChanges } from './services/dataSync'

function App() {
  const { user, loading } = useAuth()

  // 数据同步逻辑
  useEffect(() => {
    if (!user) return

    // 从Supabase获取数据
    const syncData = async () => {
      const result = await fetchDataFromSupabase(user.id)
      if (result.success) {
        // 更新localStorage
        if (result.data.time_entries) {
          localStorage.setItem('timeEntries', JSON.stringify(result.data.time_entries))
        }
        if (result.data.schedules) {
          localStorage.setItem('schedules', JSON.stringify(result.data.schedules))
        }
        if (result.data.custom_shifts) {
          localStorage.setItem('customShifts', JSON.stringify(result.data.custom_shifts))
        }
      }
    }

    syncData()

    // 监听数据变化
    const subscription = subscribeToDataChanges(user.id, (newData) => {
      // 当其他设备更新数据时，同步到本地
      if (newData.time_entries) {
        localStorage.setItem('timeEntries', JSON.stringify(newData.time_entries))
        // 触发storage事件以通知其他组件更新
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'timeEntries',
          newValue: JSON.stringify(newData.time_entries)
        }))
      }
      if (newData.schedules) {
        localStorage.setItem('schedules', JSON.stringify(newData.schedules))
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'schedules',
          newValue: JSON.stringify(newData.schedules)
        }))
      }
      if (newData.custom_shifts) {
        localStorage.setItem('customShifts', JSON.stringify(newData.custom_shifts))
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'customShifts',
          newValue: JSON.stringify(newData.custom_shifts)
        }))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  // 当本地数据变化时同步到Supabase
  useEffect(() => {
    if (!user) return

    const handleStorageChange = (e) => {
      // 收集所有相关数据
      const data = {
        timeEntries: JSON.parse(localStorage.getItem('timeEntries') || '[]'),
        schedules: JSON.parse(localStorage.getItem('schedules') || '[]'),
        customShifts: JSON.parse(localStorage.getItem('customShifts') || '[]')
      }

      // 同步到Supabase
      syncDataToSupabase(user.id, data)
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [user])

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<TimeEntryPage />} />
        <Route path="reports" element={<ReportPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="data" element={<DataPage />} />
      </Route>
    </Routes>
  )
}

export default App;