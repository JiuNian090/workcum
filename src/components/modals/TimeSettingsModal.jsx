import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';

const TimeSettingsModal = ({ isOpen, onClose, timeSlot, onSaveTimeSlot }) => {
  const { t } = useTranslation();
  const [semesterStart, setSemesterStart] = useState('');
  const [semesterEnd, setSemesterEnd] = useState('');
  const [timeSlotConfig, setTimeSlotConfig] = useState({
    start: timeSlot?.start || '08:00',
    end: timeSlot?.end || '22:00'
  });

  // Load semester settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('semesterSettings') || '{}');
    if (savedSettings.startDate) {
      setSemesterStart(savedSettings.startDate);
    }
    if (savedSettings.endDate) {
      setSemesterEnd(savedSettings.endDate);
    }
    
    // Load time slot settings
    if (timeSlot) {
      setTimeSlotConfig({
        start: timeSlot.start,
        end: timeSlot.end
      });
    }
  }, [timeSlot]);

  const handleSemesterSubmit = (e) => {
    e.preventDefault();
    
    if (!semesterStart || !semesterEnd) {
      alert(t('semester_settings.please_set_dates'));
      return;
    }
    
    const startDate = new Date(semesterStart);
    const endDate = new Date(semesterEnd);
    
    if (startDate >= endDate) {
      alert(t('semester_settings.start_must_be_earlier'));
      return;
    }
    
    // Save semester settings to localStorage
    const semesterSettings = {
      startDate: semesterStart,
      endDate: semesterEnd
    };
    
    localStorage.setItem('semesterSettings', JSON.stringify(semesterSettings));
    
    // Trigger a storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'semesterSettings',
      newValue: JSON.stringify(semesterSettings)
    }));
    
    alert(t('semester_settings.save_success'));
  };

  const handleSemesterReset = () => {
    setSemesterStart('');
    setSemesterEnd('');
    localStorage.removeItem('semesterSettings');
    
    // Trigger a storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'semesterSettings',
      newValue: null
    }));
    
    alert(t('semester_settings.reset_success'));
  };

  const handleTimeSlotChange = (e) => {
    const { name, value } = e.target;
    setTimeSlotConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimeSlotSubmit = (e) => {
    e.preventDefault();
    
    // 验证时间格式
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(timeSlotConfig.start) || !timeRegex.test(timeSlotConfig.end)) {
      alert(t('time_slot_config.invalid_time_format'));
      return;
    }

    // 验证开始时间不晚于结束时间
    const startTime = new Date();
    const [startHour, startMinute] = timeSlotConfig.start.split(':').map(Number);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date();
    const [endHour, endMinute] = timeSlotConfig.end.split(':').map(Number);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    if (startTime >= endTime) {
      alert(t('time_slot_config.start_time_must_be_earlier'));
      return;
    }

    const updatedTimeSlot = {
      start: timeSlotConfig.start,
      end: timeSlotConfig.end
    };
    
    onSaveTimeSlot(updatedTimeSlot);
    alert(t('time_slot_config.save_success'));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="md"
      title={t('time_settings.title')}
    >
      <div className="space-y-4">
        {/* 学期设置部分 */}
        <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-blue-50 to-indigo-50">
          <h3 className="text-md font-bold mb-2 text-gray-800 flex items-center">
            <svg className="w-4 h-4 mr-1.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            {t('semester_settings.title')}
          </h3>
          
          <form onSubmit={handleSemesterSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="semesterStart">
                  {t('semester_settings.start_date')}
                </label>
                <input
                  type="date"
                  id="semesterStart"
                  value={semesterStart}
                  onChange={(e) => setSemesterStart(e.target.value)}
                  className="shadow appearance-none border rounded-lg w-full py-1.5 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-xs font-bold mb-1" htmlFor="semesterEnd">
                  {t('semester_settings.end_date')}
                </label>
                <input
                  type="date"
                  id="semesterEnd"
                  value={semesterEnd}
                  onChange={(e) => setSemesterEnd(e.target.value)}
                  className="shadow appearance-none border rounded-lg w-full py-1.5 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-between pt-1">
              <button
                type="button"
                onClick={handleSemesterReset}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1.5 px-3 rounded-md focus:outline-none focus:shadow-outline text-xs"
              >
                {t('semester_settings.reset')}
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-1.5 px-3 rounded-md focus:outline-none focus:shadow-outline text-xs"
              >
                {t('semester_settings.save')}
              </button>
            </div>
          </form>
        </div>
        
        {/* 时间线设置部分 */}
        <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-green-50 to-emerald-50">
          <h3 className="text-md font-bold mb-2 text-gray-800 flex items-center">
            <svg className="w-4 h-4 mr-1.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {t('time_slot_config.title')}
          </h3>
          
          <div className="text-xs text-gray-600 mb-3">
            {t('time_slot_config.description')}
          </div>
          
          <form onSubmit={handleTimeSlotSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('time_slot_config.start_time')}
                </label>
                <input
                  type="time"
                  name="start"
                  value={timeSlotConfig.start}
                  onChange={handleTimeSlotChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-xs"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('time_slot_config.end_time')}
                </label>
                <input
                  type="time"
                  name="end"
                  value={timeSlotConfig.end}
                  onChange={handleTimeSlotChange}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-xs"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-green-500 text-xs"
              >
                {t('common.save')}
              </button>
            </div>
          </form>
        </div>
        
        {/* 关闭按钮 */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 text-xs"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TimeSettingsModal;