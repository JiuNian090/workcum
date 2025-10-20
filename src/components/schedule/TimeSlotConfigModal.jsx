import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const TimeSlotConfigModal = ({ isOpen, onClose, timeSlot, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    start: timeSlot?.start || '08:00',
    end: timeSlot?.end || '22:00'
  });

  // 当timeSlot变化时更新表单数据
  useEffect(() => {
    if (timeSlot) {
      setFormData({
        start: timeSlot.start,
        end: timeSlot.end
      });
    }
  }, [timeSlot]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 验证时间格式
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.start) || !timeRegex.test(formData.end)) {
      alert(t('time_slot_config.invalid_time_format') || '请输入正确的时间格式 (HH:MM)');
      return;
    }

    // 验证开始时间不晚于结束时间
    const startTime = new Date();
    const [startHour, startMinute] = formData.start.split(':').map(Number);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date();
    const [endHour, endMinute] = formData.end.split(':').map(Number);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    if (startTime >= endTime) {
      alert(t('time_slot_config.start_time_must_be_earlier') || '开始时间必须早于结束时间');
      return;
    }

    const updatedTimeSlot = {
      start: formData.start,
      end: formData.end
    };
    
    onSave(updatedTimeSlot);
  };

  // 如果模态框未打开，不渲染任何内容
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">{t('time_slot_config.title') || '时间线配置'}</h2>
        
        <div className="text-sm text-gray-600 mb-4">
          {t('time_slot_config.description') || '点击修改时间段的起止时间。配置将保存在本地存储中。'}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('time_slot_config.start_time') || '开始时间'}
              </label>
              <input
                type="time"
                name="start"
                value={formData.start}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('time_slot_config.end_time') || '结束时间'}
              </label>
              <input
                type="time"
                name="end"
                value={formData.end}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('common.cancel') || '取消'}
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('common.save') || '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeSlotConfigModal;