import React, { useState, useEffect, useCallback } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameDay,
  addWeeks,
  subWeeks
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { getShiftColor, getShiftBackgroundColor, getShiftTypeBackgroundColor } from '@/utils/shiftColor.js'; // 导入颜色工具函数
import { getEntryColor } from '@/utils/entryColor.js'; // 导入时间记录颜色工具函数
import Modal from '../modals/Modal.jsx'; // 导入统一的Modal组件
import { useSwipeSelection } from '@/hooks/useSwipeSelection'; // 导入滑动选择hook
import { getCurrentWeekNumber, isInSemester } from '@/utils/semesterUtils'; // 导入学期工具函数

const WeeklyScheduleCalendar = ({ currentDate, onDateChange }) => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [shifts, setShifts] = useState([]); // Add courses state
  const [courses, setCourses] = useState([]);
  // 添加选中的课程状态和删除确认弹窗状态
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false); // Add courses state
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [courseTemplates, setCourseTemplates] = useState([]);
  const [currentSemesterWeek, setCurrentSemesterWeek] = useState(0);
  const [inSemester, setInSemester] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    date: '',
    selectedCourse: '',
    location: ''
  });
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [selectedDateForReplace, setSelectedDateForReplace] = useState(null);
  
  // 处理合并选择的单元格
  const handleMergeSelection = useCallback((cells) => {
    // 如果选择了多个单元格，执行合并操作
    if (cells.length > 1) {
      console.log('合并选中的单元格:', cells);
      // 这里实现实际的合并逻辑
      // 例如：创建一个新的班次覆盖所有选中的时间段
    }
  }, []);
  
  // 使用滑动选择hook
  const { 
    isSelecting, 
    selectedCells, 
    handleTouchStart, 
    handleTouchMove, 
    handleTouchEnd 
  } = useSwipeSelection(handleMergeSelection);

  // Load schedules from localStorage
  useEffect(() => {
    const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    setSchedules(savedSchedules);
  }, []);

  // Load time entries from localStorage
  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    setTimeEntries(savedEntries);
  }, []);

  // 添加一个useEffect来监听localStorage的变化
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'timeEntries') {
        const savedEntries = JSON.parse(e.newValue || '[]');
        setTimeEntries(savedEntries);
      }
      if (e.key === 'schedules') {
        const savedSchedules = JSON.parse(e.newValue || '[]');
        setSchedules(savedSchedules);
      }
      if (e.key === 'customShifts') {
        const savedShifts = JSON.parse(e.newValue || '[]');
        setShifts(savedShifts);
        setCourseTemplates(savedShifts);
      }
      if (e.key === 'courses') {
        const savedCourses = JSON.parse(e.newValue || '[]');
        setCourses(savedCourses);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Load custom shifts from localStorage
  useEffect(() => {
    const savedShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    setShifts(savedShifts);
  }, []);

  // Load course templates from localStorage on component mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('customShifts');
    if (savedTemplates) {
      setCourseTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  // Load courses from localStorage
  useEffect(() => {
    const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    setCourses(savedCourses);
  }, []);

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

  // 设置静态时间线 - 只显示小时，从8:00到22:00
  const timeSlots = [];
  for (let hour = 8; hour <= 22; hour++) {
    const startHour = hour.toString().padStart(2, '0');
    const endHour = (hour + 1).toString().padStart(2, '0');
    
    timeSlots.push({
      id: hour - 7, // ID从1开始
      start: `${startHour}:00`,
      end: `${endHour}:00`
    });
  }

  // Save schedules to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('schedules', JSON.stringify(schedules));
  }, [schedules]);

  // Save time entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
  }, [timeEntries]);

  // Get all days to display in the week view
  const getWeekDays = (date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday as start of week
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    
    const days = [];
    let day = weekStart;
    
    while (day <= weekEnd) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }
    
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  const handleTimeSlotCellClick = (date, timeSlot) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    // 检查该时间段是否已有排班
    const existingSchedule = getScheduleForTimeSlot(date, timeSlot);
    
    if (existingSchedule.length > 0) {
      // 如果已有排班，打开编辑模式
      handleEdit(existingSchedule[0]);
      return;
    }
    
    setSelectedDate(date);
    setFormData({
      id: null,
      date: dateStr,
      selectedShift: '',
      startTime: timeSlot.start,
      endTime: timeSlot.end
    });
    setShowModal(true);
  };
  
  const handleDateClick = (date) => {
    // 保留原函数以保持兼容性，但可以在这里添加提示
    console.log('点击了日期:', date);
  };

  const handleEdit = (schedule) => {
    setSelectedDate(new Date(schedule.date));
    // 设置formData，包括开始和结束时间
    setFormData({
      id: schedule.id,
      date: schedule.date,
      selectedShift: schedule.selectedShift,
      startTime: schedule.startTime,
      endTime: schedule.endTime
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm(t('schedule.delete_confirm'))) {
      setSchedules(schedules.filter(schedule => schedule.id !== id));
      setShowModal(false); // 添加这行代码来关闭模态框
    }
  };

  const handleDeleteTimeEntry = (id) => {
    if (window.confirm(t('time_entry.delete_confirm') || '确定要删除这个时间记录吗？')) {
      setTimeEntries(timeEntries.filter(entry => entry.id !== id));
      setShowDeleteModal(false); // 添加这行代码来关闭模态框
    }
  };

  // 删除课程的函数
  const handleDeleteCourse = (courseToDelete) => {
    if (window.confirm(`确定要删除第${courseToDelete.weekNumber}周的课程吗？`)) {
      // 从课程列表中移除指定周数的课程
      const updatedCourses = courses.filter(course => 
        !(course.templateId === courseToDelete.templateId && 
          course.weekNumber === courseToDelete.weekNumber &&
          course.date === courseToDelete.date &&
          course.startTime === courseToDelete.startTime &&
          course.endTime === courseToDelete.endTime)
      );
      setCourses(updatedCourses);
      // 更新localStorage中的课程数据
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      // 关闭删除确认弹窗
      setShowDeleteCourseModal(false);
      // 清空选中的课程
      setSelectedCourse(null);
    }
  };

  // 计算课程卡片在时间线上的位置和高度
  const calculateCoursePosition = (startTime, endTime) => {
    // 将时间字符串转换为分钟数
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    
    // 计算相对于8:00的偏移量（分钟）
    const dayStartMinutes = 8 * 60; // 8:00 AM
    const offsetMinutes = startMinutes - dayStartMinutes;
    
    // 计算持续时间（分钟）
    const durationMinutes = endMinutes - startMinutes;
    
    // 每小时的高度 - 增加为48px (h-12)
    const hourHeight = 48;
    
    // 计算位置和高度，精确到分钟
    const top = (offsetMinutes / 60) * hourHeight;
    const height = (durationMinutes / 60) * hourHeight;
    
    // 确保最小高度，即使课程时间很短也要有足够的显示空间
    const minHeight = 30; // 最小高度30px
    const finalHeight = Math.max(height, minHeight);
    
    // 添加一些内边距，使卡片不会紧贴时间线边界
    const padding = 3;
    
    return {
      top: `${top + padding}px`,
      height: `${finalHeight - padding * 2}px`
    };
  };

  // 获取指定时间段的课程
  const getScheduleForTimeSlot = (date, timeSlot) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedules.filter(schedule => 
      schedule.date === dateStr && 
      schedule.startTime === timeSlot.start &&
      schedule.endTime === timeSlot.end
    );
  };

  // 获取指定时间段的时间记录
  const getTimeEntriesForTimeSlot = (date, timeSlot) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return timeEntries.filter(entry => 
      entry.date === dateStr && 
      entry.startTime === timeSlot.start
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 验证必须选择班次
    if (!formData.selectedShift) {
      alert(t('time_entry.custom_shift.select_shift') || '请选择一个班次');
      return;
    }
    
    // 获取选中的班次信息
    const selectedShiftData = shifts.find(shift => shift.id === formData.selectedShift);
    
    if (!selectedShiftData) {
      alert(t('time_entry.custom_shift.shift_not_found') || '找不到选中的班次');
      return;
    }
    
    // 构建新的排班对象
    const newSchedule = {
      id: formData.id || Date.now(),
      date: formData.date,
      selectedShift: formData.selectedShift,
      // 为了与现有代码兼容，仍然保存班次的名称、开始和结束时间
      title: selectedShiftData.name,
      startTime: formData.startTime || selectedShiftData.startTime,
      endTime: formData.endTime || selectedShiftData.endTime,
      notes: selectedShiftData.name,
      // 保存自定义工时信息
      customDuration: selectedShiftData.customDuration || null
    };
    
    if (formData.id) {
      // 更新现有排班
      setSchedules(schedules.map(schedule => 
        schedule.id === formData.id ? newSchedule : schedule
      ));
    } else {
      // 添加新排班
      setSchedules([...schedules, newSchedule]);
    }
    
    setShowModal(false);
  };

  // Function to convert duration string to hours
  const convertDurationToHours = (durationStr) => {
    if (!durationStr) return 0;
    
    const hoursMatch = durationStr.match(/(\d+(?:\.\d+)?)h/);
    const minutesMatch = durationStr.match(/(\d+(?:\.\d+)?)m/);
    
    const hours = hoursMatch ? parseFloat(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseFloat(minutesMatch[1]) : 0;
    
    return hours + (minutes / 60);
  };

  // 获取班次类型显示文本
  const getShiftTypeText = (shiftType) => {
    switch (shiftType) {
      case 'day':
        return t('time_entry.custom_shift.day_shift');
      case 'rest':
        return t('time_entry.custom_shift.rest_day');
      case 'overnight':
        return t('time_entry.custom_shift.overnight_shift');
      case 'special':
        return t('time_entry.custom_shift.special_shift');
      default:
        return t('time_entry.custom_shift.day_shift');
    }
  };
  
  const getScheduleForDate = (date) => {
    return schedules.filter(schedule => 
      isSameDay(new Date(schedule.date), date)
    );
  };

  const getTimeEntriesForDate = (date) => {
    return timeEntries.filter(entry => 
      isSameDay(new Date(entry.date), date)
    );
  };

  // 计算当前显示的周数（相对于学期开始）
  const getCurrentDisplayWeek = () => {
    const semesterSettings = JSON.parse(localStorage.getItem('semesterSettings') || '{}');
    
    if (!semesterSettings.startDate) {
      return 0;
    }
    
    const startDate = new Date(semesterSettings.startDate);
    const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    
    // 计算从学期开始到当前显示周开始的天数
    const timeDiff = currentWeekStart.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // 计算周数（向上取整，从1开始）
    const weekNumber = Math.ceil(daysDiff / 7) + 1;
    
    // 确保周数在合理范围内
    return Math.max(1, Math.min(weekNumber, 20));
  };

  // 获取指定日期的课程，只显示当前周的课程
  const getCoursesForDate = (date) => {
    const currentDisplayWeek = getCurrentDisplayWeek();
    return courses.filter(course => {
      const courseDate = new Date(course.date);
      // 检查日期是否匹配，并且周数是否匹配当前显示的周数
      return isSameDay(courseDate, date) && course.weekNumber === currentDisplayWeek;
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="hide-scrollbar mt-2 h-full overflow-x-auto">
      {/* Table-based weekly calendar */}
      <div className="border border-gray-200 rounded-lg overflow-hidden w-full">
        {/* Header row with dates only */}
        <div className="grid" style={{ gridTemplateColumns: '40px repeat(7, 1fr)' }}>
          {/* Empty cell for time column */}
          <div className="bg-gray-100 border-b border-r border-gray-200 p-1 relative">
            <div className="text-xs font-bold text-center h-full">
              {inSemester && currentSemesterWeek > 0 ? (
                <div className="relative h-8 w-full">
                  <span className="absolute top-0 left-0 text-indigo-600 font-bold text-[8px]">第</span>
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600 font-bold">{currentSemesterWeek}</span>
                  <span className="absolute bottom-0 right-0 text-indigo-600 font-bold text-[8px]">周</span>
                </div>
              ) : (
                <span>时间</span>
              )}
            </div>
          </div>
          
          {/* Date headers */}
          {weekDays.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div 
                key={index} 
                className={`bg-gray-100 p-1 border-b border-r border-gray-200 ${index === weekDays.length - 1 ? 'border-r-0' : ''} ${isToday ? 'bg-blue-100' : ''}`}
              >
                <div className="text-sm sm:text-base font-bold text-center text-indigo-700">
                  {format(day, 'EEE', { locale: zhCN })}
                </div>
                <div className="text-xs sm:text-sm text-center text-gray-600">
                  {format(day, 'd', { locale: zhCN })}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Day columns - 每个日期一列，不显示横向时间段格子 */}
        <div className="grid" style={{ gridTemplateColumns: '40px repeat(7, 1fr)' }}>
          {/* Time slot column - 时间线样式 */}
          <div className="border-r border-gray-200">
            {timeSlots.map((timeSlot) => (
              <div 
                key={timeSlot.id}
                className="bg-gradient-to-r from-blue-50 to-indigo-100 h-12 flex justify-center items-start shadow-sm"
              >
                <div className="text-xs text-center w-full">
                  <div className="text-indigo-700 font-bold">{timeSlot.start}</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Day columns - 每个日期一列 */}
          {weekDays.map((day, dayIndex) => {
            const isToday = isSameDay(day, new Date());
            const daySchedules = getScheduleForDate(day);
            const dayTimeEntries = getTimeEntriesForDate(day);
            const dayCourses = getCoursesForDate(day);
            
            return (
              <div 
                  key={dayIndex}
                  className={`border-r border-gray-200 ${dayIndex === weekDays.length - 1 ? 'border-r-0' : ''} ${isToday ? 'bg-blue-50' : ''}`}
                >
                {/* 显示该日期的所有日程和工时条目，不按时间段分隔 */}
                <div className="relative" style={{ minHeight: `${timeSlots.length * 48}px` }}>
                  {dayCourses.length > 0 && dayCourses.map((course) => {
                    // 获取课程模板信息
                    const template = courseTemplates.find(t => t.id === course.templateId);
                    const courseName = template ? template.name : course.name;
                    // 使用模板的自定义色调或课程的颜色
                    const courseColor = template && template.customHue !== undefined 
                      ? `hsl(${template.customHue}, 70%, 50%)` 
                      : course.color || '#3B82F6';
                    
                    // 计算课程卡片的位置和高度
                    const position = calculateCoursePosition(course.startTime, course.endTime);
                    
                    return (
                      <div 
                        key={course.id} 
                        className="rounded-lg shadow-sm transition-all duration-200 ease-in-out transform hover:shadow p-0.5 text-[0.7rem] absolute left-0.5 right-0.5 flex flex-col justify-start cursor-pointer"
                        style={{ 
                          backgroundColor: courseColor,
                          border: `1px solid ${courseColor}`,
                          top: position.top,
                          height: position.height,
                          zIndex: 10
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCourse(course);
                          setShowDeleteCourseModal(true);
                        }}
                      >
                        <h3 
                          className="font-bold leading-tight text-[0.6rem] break-words"
                          style={{ color: 'white' }}
                        >
                          {courseName}
                        </h3>
                        {course.location && (
                          <div className="text-[0.5rem] text-white text-opacity-90 mt-1 truncate flex items-center">
                            <span className="mr-1">📍</span>
                            <span className="truncate">{course.location}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {daySchedules.length > 0 && daySchedules.map((schedule) => {
                    // 获取班次信息
                    const shiftInfo = shifts.find(shift => shift.id === schedule.selectedShift);
                    const shiftName = shiftInfo ? shiftInfo.name : schedule.title;
                    // 获取班次类型和自定义色调
                    const shiftType = shiftInfo ? shiftInfo.shiftType : 'day';
                    const customHue = shiftInfo ? shiftInfo.customHue : undefined;
                    
                    return (
                      <div 
                        key={schedule.id} 
                        className="rounded-lg shadow-sm transition-all duration-200 ease-in-out transform hover:shadow p-2 text-[0.6rem] mb-2"
                        style={{ 
                          borderLeft: `3px solid ${getShiftColor(shiftType, customHue)}`,
                          backgroundColor: getShiftBackgroundColor(shiftType, customHue),
                          boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.05)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(schedule);
                        }}
                      >
                        <h3 
                          className="font-bold leading-tight"
                          style={{ color: getShiftColor(shiftType, customHue) }}
                        >
                          {shiftName}
                        </h3>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-gray-600">
                            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                          </span>
                          {shiftInfo?.customDuration && (
                            <span className="bg-white bg-opacity-70 px-1 py-0.5 rounded font-bold">
                              [{convertDurationToHours(shiftInfo.customDuration).toFixed(1)}h]
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {dayTimeEntries.length > 0 && dayTimeEntries.map((entry) => {
                    const entryColor = getEntryColor(entry.customHue);
                    return (
                      <div 
                        key={entry.id} 
                        className="text-[0.6rem] font-semibold p-2 rounded truncate cursor-pointer hover:scale-[1.01] transition-all duration-200 shadow-sm mb-2"
                        style={{
                          backgroundColor: entryColor.backgroundColor,
                          border: `1px solid ${entryColor.borderColor}`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEntry(entry);
                          setShowDeleteModal(true);
                        }}
                      >
                        <div 
                          className="font-bold truncate"
                          style={{
                            color: entryColor.textColor
                          }}
                        >
                          {entry.notes || t('time_entry.entry')}
                        </div>
                        <div className="text-xs mt-1">
                          {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* 如果没有日程或工时条目，不显示任何提示 */}
                  {daySchedules.length === 0 && dayTimeEntries.length === 0 && dayCourses.length === 0 && (
                    <div className="py-8"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={formData.id ? t('schedule.edit_schedule') : t('schedule.add_schedule')}
          size="md"
        >
            
            <form onSubmit={handleSubmit}>
              {/* 只保留班次选择框 */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2 sm:mb-3" htmlFor="shiftTemplate">
                  {t('time_entry.custom_shift.select_shift')} *
                </label>
                <div className="relative">
                  <select
                    id="shiftTemplate"
                    value={formData.selectedShift}
                    onChange={(e) => {
                      setFormData({...formData, selectedShift: e.target.value});
                    }}
                    className="appearance-none w-full py-2 px-3 sm:py-3 sm:px-4 pr-8 sm:pr-10 text-gray-700 bg-white border-2 border-indigo-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm sm:text-base"
                    required
                  >
                    <option value="">{t('time_entry.custom_shift.select_placeholder')}</option>
                    {shifts.map((shift) => {
                      // 获取班次类型对应的颜色和图标
                      const shiftColor = getShiftColor(shift.shiftType, shift.customHue);
                      const shiftTypeText = getShiftTypeText(shift.shiftType || 'day');
                      
                      return (
                        <option key={shift.id} value={shift.id} className="flex items-center">
                          {shift.name} ({shift.startTime} - {shift.endTime})
                          {shift.customDuration && ` [${convertDurationToHours(shift.customDuration).toFixed(1)}h]`}
                          ({shiftTypeText})
                        </option>
                      );
                    })}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-gray-700">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">{t('time_entry.custom_shift.select_shift_help')}</p>
              </div>
              
              <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-gray-100">
                <div>
                  {formData.id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(formData.id)}
                      className="flex items-center text-red-600 hover:text-red-800 font-medium transition-colors duration-200 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      {t('schedule.form.delete')}
                    </button>
                  )}
                </div>
                
                <div className="flex space-x-2 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 sm:px-5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                  >
                    {t('schedule.form.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 sm:px-5 sm:py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-md transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                  >
                    {t('schedule.form.save')}
                  </button>
                </div>
              </div>
            </form>
          </Modal>
        )}

      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={t('time_entry.delete_entry')}
          size="sm"
        >
            
            <div className="mb-6">
              <p className="text-gray-700 text-center mb-4">
                {t('time_entry.delete_confirm') || '确定要删除这个时间记录吗？'}
              </p>
              {selectedEntry && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="font-bold truncate text-gray-800">{selectedEntry.notes || t('time_entry.entry')}</div>
                  <div className="text-green-700 text-sm mt-2 flex flex-wrap items-center">
                    <span className="mr-3">
                      {formatTime(selectedEntry.startTime)} - {formatTime(selectedEntry.endTime)}
                    </span>
                    {selectedEntry.duration && (
                      <span className="bg-white bg-opacity-70 px-2 py-1 rounded-lg font-bold">
                        [{(selectedEntry.duration / 60).toFixed(1)}h]
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {t('schedule.form.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteTimeEntry(selectedEntry.id);
                  setShowDeleteModal(false);
                }}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl shadow-md transition-all duration-200 transform hover:scale-105"
              >
                {t('schedule.form.delete')}
              </button>
            </div>
          </Modal>
        )}
        
        {/* 删除课程确认弹窗 */}
        {showDeleteCourseModal && (
          <Modal
            isOpen={showDeleteCourseModal}
            onClose={() => {
              setShowDeleteCourseModal(false);
              setSelectedCourse(null);
            }}
            title="删除课程"
            size="sm"
          >
            <div className="mb-6">
              <p className="text-gray-700 text-center mb-4">
                确定要删除这个课程吗？
              </p>
              {selectedCourse && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="font-bold truncate text-gray-800">
                    {courseTemplates.find(t => t.id === selectedCourse.templateId)?.name || selectedCourse.name}
                  </div>
                  <div className="text-blue-700 text-sm mt-2 flex flex-wrap items-center">
                    <span className="mr-3">
                      {formatTime(selectedCourse.startTime)} - {formatTime(selectedCourse.endTime)}
                    </span>
                    <span className="bg-white bg-opacity-70 px-2 py-1 rounded-lg font-bold">
                      第{selectedCourse.weekNumber}周
                    </span>
                  </div>
                  {selectedCourse.location && (
                    <div className="text-gray-600 text-sm mt-1 flex items-center">
                      <span className="mr-1">📍</span>
                      <span className="truncate">{selectedCourse.location}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteCourseModal(false);
                  setSelectedCourse(null);
                }}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {t('schedule.form.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteCourse(selectedCourse);
                }}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl shadow-md transition-all duration-200 transform hover:scale-105"
              >
                {t('schedule.form.delete')}
              </button>
            </div>
          </Modal>
        )}
      {showReplaceModal && (
        <Modal
          isOpen={showReplaceModal}
          onClose={() => setShowReplaceModal(false)}
          title={t('schedule.replace_schedule')}
          size="sm"
        >
            
            <div className="mb-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      {t('schedule.replace_warning') || '该日期已有排班或记录，继续操作将替换现有内容。确定要继续吗？'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowReplaceModal(false)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {t('schedule.form.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  // 删除该日期的所有排班和时间记录
                  const dateStr = format(selectedDateForReplace, 'yyyy-MM-dd');
                  setSchedules(schedules.filter(schedule => schedule.date !== dateStr));
                  setTimeEntries(timeEntries.filter(entry => entry.date !== dateStr));
                  
                  // 打开添加排班模态框
                  setSelectedDate(selectedDateForReplace);
                  setFormData({
                    id: null,
                    date: dateStr,
                    selectedShift: ''
                  });
                  setShowReplaceModal(false);
                  setShowModal(true);
                }}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-md transition-all duration-200 transform hover:scale-105"
              >
                {t('schedule.replace')}
              </button>
            </div>
          </Modal>
        )}
    </div>
  );
};

export default WeeklyScheduleCalendar;