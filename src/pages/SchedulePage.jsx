import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import WeeklyScheduleCalendar from '../components/schedule/WeeklyScheduleCalendar';
import AddCourseModal from '../components/modals/AddCourseModal';
import TimeSettingsModal from '../components/modals/TimeSettingsModal'; // 导入新的时间设置模态框
import { useTranslation } from 'react-i18next';
import { getCurrentWeekNumber, isInSemester } from '../utils/semesterUtils';

const SchedulePage = () => {
  const { t } = useTranslation();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showTimeSettingsModal, setShowTimeSettingsModal] = useState(false); // 更新状态名称
  const [currentSemesterWeek, setCurrentSemesterWeek] = useState(0);
  const [inSemester, setInSemester] = useState(false);
  const [timeSlotConfig, setTimeSlotConfig] = useState({
    start: '08:00',
    end: '22:00'
  });

  // 监听学期设置变化
  useEffect(() => {
    const updateSemesterInfo = () => {
      setCurrentSemesterWeek(getCurrentWeekNumber());
      setInSemester(isInSemester());
    };

    // 初始化学期信息
    updateSemesterInfo();

    // 监听storage事件
    const handleStorageChange = (e) => {
      if (e.key === 'semesterSettings') {
        updateSemesterInfo();
      }
      // 监听时间线配置变化
      if (e.key === 'timeSlotConfig') {
        const savedConfig = JSON.parse(e.newValue || '{"start": "08:00", "end": "22:00"}');
        setTimeSlotConfig(savedConfig);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 定期更新周数（每分钟更新一次）
    const intervalId = setInterval(updateSemesterInfo, 60000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // 加载时间线配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('timeSlotConfig');
    if (savedConfig) {
      setTimeSlotConfig(JSON.parse(savedConfig));
    }
  }, []);

  // Get week range for display
  const getWeekRange = (date) => {
    const month = format(date, 'M', { locale: zhCN });
    
    // 只显示月份，不显示周数
    return `${month}月`;
  };

  // 处理添加课程
  const handleAddCourse = (courses) => {
    // 获取当前课程列表
    const existingCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    
    // 支持单个课程或课程数组
    const coursesToAdd = Array.isArray(courses) ? courses : [courses];
    
    // 添加新课程
    existingCourses.push(...coursesToAdd);
    
    // 保存到localStorage
    localStorage.setItem('courses', JSON.stringify(existingCourses));
    
    // 创建自定义事件通知课程更新
    const event = new CustomEvent('coursesUpdated', { detail: existingCourses });
    window.dispatchEvent(event);
    
    // 这里可以添加其他逻辑，比如刷新课表显示
    console.log('课程已添加:', coursesToAdd);
  };

  // 处理保存时间线配置
  const handleSaveTimeSlotConfig = (config) => {
    // 保存到localStorage
    localStorage.setItem('timeSlotConfig', JSON.stringify(config));
    setTimeSlotConfig(config);
    
    // 创建自定义事件通知时间线配置更新
    const event = new CustomEvent('timeSlotConfigUpdated', { detail: config });
    window.dispatchEvent(event);
    
    // 注意：这里不再关闭模态框，因为新的模态框包含学期设置和时间线设置两个部分
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-1 sm:px-2 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div className="flex items-center">
          <h1 className="page-heading">{t('schedule.title')}</h1>
          <span className="ml-3 text-lg sm:text-xl md:text-2xl font-bold text-gray-800 bg-gradient-to-r from-indigo-50 to-blue-50 px-3 py-1 sm:px-4 sm:py-2 rounded-xl shadow-sm border border-gray-100">
            {getWeekRange(currentWeek)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {/* 添加时间设置按钮 */}
          <button
            onClick={() => setShowTimeSettingsModal(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-full shadow-sm transition-all duration-200 hover:shadow-md flex items-center justify-center w-8 h-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
          <button
            onClick={() => setShowAddCourseModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full shadow-sm transition-all duration-200 hover:shadow-md flex items-center justify-center w-8 h-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-0.5 sm:p-1 md:p-2 mt-1 mb-0.5 flex-grow flex flex-col">
        <div className="flex-grow">
          <WeeklyScheduleCalendar 
            currentDate={currentWeek}
            onDateChange={setCurrentWeek}
          />
        </div>
      </div>
      
      {/* 添加课程弹窗 */}
      <AddCourseModal
        isOpen={showAddCourseModal}
        onClose={() => setShowAddCourseModal(false)}
        currentWeek={currentWeek}
        onAddCourse={handleAddCourse}
      />
      
      {/* 时间设置弹窗 */}
      <TimeSettingsModal
        isOpen={showTimeSettingsModal}
        onClose={() => setShowTimeSettingsModal(false)}
        timeSlot={timeSlotConfig}
        onSaveTimeSlot={handleSaveTimeSlotConfig}
      />
    </div>
  );
};

export default SchedulePage;