import React, { useState, useEffect } from 'react';
import { format, addWeeks, subWeeks, getWeekOfMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import WeeklyScheduleCalendar from '../components/schedule/WeeklyScheduleCalendar';
import AddCourseModal from '../components/modals/AddCourseModal';
import { useTranslation } from 'react-i18next';
import { getCurrentWeekNumber, isInSemester } from '../utils/semesterUtils';

const SchedulePage = () => {
  const { t } = useTranslation();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [currentSemesterWeek, setCurrentSemesterWeek] = useState(0);
  const [inSemester, setInSemester] = useState(false);

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
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 定期更新周数（每分钟更新一次）
    const intervalId = setInterval(updateSemesterInfo, 60000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // Navigate weeks
  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  // Get week range for display
  const getWeekRange = (date) => {
    const month = format(date, 'M', { locale: zhCN });
    
    // 只显示月份，不显示周数
    return `${month}月`;
  };

  // 处理添加课程
  const handleAddCourse = (course) => {
    // 获取当前课程列表
    const existingCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    
    // 添加新课程
    existingCourses.push(course);
    
    // 保存到localStorage
    localStorage.setItem('courses', JSON.stringify(existingCourses));
    
    // 这里可以添加其他逻辑，比如刷新课表显示
    console.log('课程已添加:', course);
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-1 sm:px-2 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="page-heading">{t('schedule.title')}</h1>
        <button
          onClick={() => setShowAddCourseModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-3 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          添加课程
        </button>
      </div>
      
      <div className="p-0.5 sm:p-1 md:p-2 mt-1 mb-0.5 flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <button
            onClick={goToPreviousWeek}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg border border-gray-300 shadow-sm transition-all duration-200 hover:shadow-md text-sm sm:text-base"
          >
            {t('schedule.previous_week')}
          </button>
          
          <div className="text-center">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 bg-gradient-to-r from-indigo-50 to-blue-50 px-2 py-1 sm:px-4 sm:py-2 rounded-xl shadow-sm border border-gray-100">
              {getWeekRange(currentWeek)}
            </h2>
          </div>
          
          <button
            onClick={goToNextWeek}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg border border-gray-300 shadow-sm transition-all duration-200 hover:shadow-md text-sm sm:text-base"
          >
            {t('schedule.next_week')}
          </button>
        </div>
        
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
    </div>
  );
};

export default SchedulePage;