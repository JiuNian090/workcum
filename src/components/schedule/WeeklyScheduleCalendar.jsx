import React, { useState, useEffect } from 'react';
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

const WeeklyScheduleCalendar = ({ currentDate, onDateChange }) => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [shifts, setShifts] = useState([]); // Add shifts state
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    date: '',
    selectedShift: '' // 只保留班次选择
  });
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [selectedDateForReplace, setSelectedDateForReplace] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]); // 时间段配置
  const [showTimeSlotConfig, setShowTimeSlotConfig] = useState(false); // 时间段配置模态框
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null); // 当前选中的时间段

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

  // Load time slots from localStorage
  useEffect(() => {
    const savedTimeSlots = JSON.parse(localStorage.getItem('timeSlots') || '[]');
    if (savedTimeSlots.length > 0) {
      // 检查localStorage中的数据是否需要更新
        const shouldResetTimeSlots = savedTimeSlots && savedTimeSlots.some(slot => !slot.groupName || slot.groupName.startsWith('组'));
        
        if (!savedTimeSlots || shouldResetTimeSlots) {
          // 默认时间段配置：一天三组，每组四个时间段
          const defaultTimeSlots = [
            // 上午时段 (groupId: 1)
            { id: 1, start: '08:00', end: '09:00', group: 1, groupName: '上午' },
            { id: 2, start: '09:00', end: '10:00', group: 1, groupName: '上午' },
            { id: 3, start: '10:00', end: '11:00', group: 1, groupName: '上午' },
            { id: 4, start: '11:00', end: '12:00', group: 1, groupName: '上午' },
            // 下午时段 (groupId: 2)
            { id: 5, start: '13:00', end: '14:00', group: 2, groupName: '下午' },
            { id: 6, start: '14:00', end: '15:00', group: 2, groupName: '下午' },
            { id: 7, start: '15:00', end: '16:00', group: 2, groupName: '下午' },
            { id: 8, start: '16:00', end: '17:00', group: 2, groupName: '下午' },
            // 晚上时段 (groupId: 3)
            { id: 9, start: '18:00', end: '19:00', group: 3, groupName: '晚上' },
            { id: 10, start: '19:00', end: '20:00', group: 3, groupName: '晚上' },
            { id: 11, start: '20:00', end: '21:00', group: 3, groupName: '晚上' },
            { id: 12, start: '21:00', end: '22:00', group: 3, groupName: '晚上' },
          ];
          setTimeSlots(defaultTimeSlots);
          localStorage.setItem('timeSlots', JSON.stringify(defaultTimeSlots));
        } else {
          setTimeSlots(savedTimeSlots);
        }
    } else {
      // 如果没有任何时间段，使用默认配置
      const defaultTimeSlots = [
        // 上午时段 (groupId: 1)
        { id: 1, start: '08:00', end: '09:00', group: 1, groupName: '上午' },
        { id: 2, start: '09:00', end: '10:00', group: 1, groupName: '上午' },
        { id: 3, start: '10:00', end: '11:00', group: 1, groupName: '上午' },
        { id: 4, start: '11:00', end: '12:00', group: 1, groupName: '上午' },
        // 下午时段 (groupId: 2)
        { id: 5, start: '13:00', end: '14:00', group: 2, groupName: '下午' },
        { id: 6, start: '14:00', end: '15:00', group: 2, groupName: '下午' },
        { id: 7, start: '15:00', end: '16:00', group: 2, groupName: '下午' },
        { id: 8, start: '16:00', end: '17:00', group: 2, groupName: '下午' },
        // 晚上时段 (groupId: 3)
        { id: 9, start: '18:00', end: '19:00', group: 3, groupName: '晚上' },
        { id: 10, start: '19:00', end: '20:00', group: 3, groupName: '晚上' },
        { id: 11, start: '20:00', end: '21:00', group: 3, groupName: '晚上' },
        { id: 12, start: '21:00', end: '22:00', group: 3, groupName: '晚上' },
      ];
      setTimeSlots(defaultTimeSlots);
      localStorage.setItem('timeSlots', JSON.stringify(defaultTimeSlots));
    }
  }, []);

  // Save time slots to localStorage whenever they change
  useEffect(() => {
    if (timeSlots.length > 0) {
      localStorage.setItem('timeSlots', JSON.stringify(timeSlots));
    }
  }, [timeSlots]);

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

  const handleDateClick = (date) => {
    // 检查该日期是否已有排班或时间记录
    const existingSchedules = getScheduleForDate(date);
    const existingTimeEntries = getTimeEntriesForDate(date);
    
    if (existingSchedules.length > 0 || existingTimeEntries.length > 0) {
      // 如果已有排班或时间记录，提示用户是否替换
      setShowReplaceModal(true);
      setSelectedDateForReplace(date);
      return;
    }
    
    setSelectedDate(date);
    setFormData({
      id: null,
      date: format(date, 'yyyy-MM-dd'),
      selectedShift: ''
    });
    setShowModal(true);
  };

  const handleEdit = (schedule) => {
    setSelectedDate(new Date(schedule.date));
    // 只设置formData中存在的字段
    setFormData({
      id: schedule.id,
      date: schedule.date,
      selectedShift: schedule.selectedShift
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

  // 处理时间段点击事件
  const handleTimeSlotClick = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setShowTimeSlotConfig(true);
  };

  // 保存时间段配置
  const handleTimeSlotConfigSave = (updatedSlot) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === updatedSlot.id ? updatedSlot : slot
    ));
    setShowTimeSlotConfig(false);
    setSelectedTimeSlot(null);
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

  // 按组获取时间段
  const getTimeSlotsByGroup = () => {
    const groups = {};
    timeSlots.forEach(slot => {
      if (!groups[slot.group]) {
        groups[slot.group] = [];
      }
      groups[slot.group].push(slot);
    });
    return groups;
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
      startTime: selectedShiftData.startTime,
      endTime: selectedShiftData.endTime,
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

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="hide-scrollbar mt-2 h-full overflow-x-auto">
      {/* Table-based weekly calendar */}
      <div className="border border-gray-200 rounded-lg overflow-hidden w-full">
        {/* Header row with dates */}
        <div className="grid grid-cols-8">
          {/* Corner cell */}
          <div className="bg-gray-100 p-2 border-r border-b border-gray-200">
            <div className="h-6"></div>
          </div>
          
          {/* Date headers */}
          {weekDays.map((day, index) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div 
                key={index} 
                className={`bg-gray-100 p-1 border-b border-r border-gray-200 ${index === weekDays.length - 1 ? 'border-r-0' : ''} ${isToday ? 'bg-blue-100 text-blue-600' : ''}`}
              >
                <div className="text-[0.6rem] sm:text-xs font-bold text-center">
                  {format(day, 'EEE', { locale: zhCN })}
                </div>
                <div className="text-sm sm:text-base font-bold text-center">
                  {format(day, 'd', { locale: zhCN })}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Time slots and calendar cells */}
        {timeSlots.map((timeSlot) => (
          <div key={timeSlot.id} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0">
            {/* Time slot column */}
            <div 
              className="bg-white border-r border-gray-200 p-1 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-center"
              onClick={() => handleTimeSlotClick(timeSlot)}
            >
              <div className="text-[0.6rem] text-center w-full">
                <div className="text-gray-700 font-medium">{timeSlot.start}</div>
                <div className="text-gray-400">{timeSlot.end}</div>
              </div>
            </div>
            
            {/* Day cells for each time slot row */}
            {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date());
              const slotSchedules = getScheduleForTimeSlot(day, timeSlot);
              const slotTimeEntries = getTimeEntriesForTimeSlot(day, timeSlot);
              
              return (
                <div 
                  key={`${day}-${timeSlot.id}`}
                  className={`bg-white border-r border-gray-200 last:border-r-0 p-1 hover:bg-gray-50 transition-colors flex items-center justify-center ${isToday ? 'bg-blue-50' : ''}`}
                  onClick={() => handleDateClick(day)}
                >
                  {slotSchedules.length > 0 && slotSchedules.map((schedule) => {
                    // 获取班次信息
                    const shiftInfo = shifts.find(shift => shift.id === schedule.selectedShift);
                    const shiftName = shiftInfo ? shiftInfo.name : schedule.title;
                    // 获取班次类型和自定义色调
                    const shiftType = shiftInfo ? shiftInfo.shiftType : 'day';
                    const customHue = shiftInfo ? shiftInfo.customHue : undefined;
                    
                    return (
                      <div 
                        key={schedule.id} 
                        className="rounded-lg shadow-sm transition-all duration-200 ease-in-out transform hover:shadow p-1 text-[0.55rem] h-full w-full flex flex-col justify-center"
                        style={{ 
                          borderLeft: `2px solid ${getShiftColor(shiftType, customHue)}`,
                          backgroundColor: getShiftBackgroundColor(shiftType, customHue),
                          boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.05)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(schedule);
                        }}
                      >
                        <h3 
                          className="font-bold leading-tight truncate"
                          style={{ color: getShiftColor(shiftType, customHue) }}
                        >
                          {shiftName}
                        </h3>
                        <div className="flex justify-between items-center mt-0.5">
                          <span className="text-gray-600">
                            {formatTime(schedule.startTime)}
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
                  
                  {slotTimeEntries.length > 0 && slotTimeEntries.map((entry) => {
                    const entryColor = getEntryColor(entry.customHue);
                    return (
                      <div 
                        key={entry.id} 
                        className="text-[0.55rem] font-semibold p-1 rounded truncate cursor-pointer hover:scale-[1.01] transition-all duration-200 shadow-sm h-full flex flex-col justify-center"
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
                      </div>
                    );
                  })}
                  
                  {/* Empty slot indicator */}
                  {slotSchedules.length === 0 && slotTimeEntries.length === 0 && (
                    <div className="text-[0.4rem] text-gray-300 text-center py-0.5">
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
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