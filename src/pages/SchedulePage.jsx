import React, { useState } from 'react';
import { format, addWeeks, subWeeks, getWeekOfMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import WeeklyScheduleCalendar from '../components/schedule/WeeklyScheduleCalendar';
import { useTranslation } from 'react-i18next';

const SchedulePage = () => {
  const { t } = useTranslation();
  const [currentWeek, setCurrentWeek] = useState(new Date());

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
    const weekOfMonth = getWeekOfMonth(date, { weekStartsOn: 1 });
    const month = format(date, 'M', { locale: zhCN });
    return `${month}月 ${t('schedule.week_prefix')}${weekOfMonth}${t('schedule.week_suffix')}`;
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-1 sm:px-2 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="page-heading">{t('schedule.title')}</h1>
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
    </div>
  );
};

export default SchedulePage;