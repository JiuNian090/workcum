import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const TimeSlotConfigModal = ({ timeSlot, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    start: timeSlot.start,
    end: timeSlot.end
  });

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
      alert('请输入正确的时间格式 (HH:MM)');
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
      alert('开始时间必须早于结束时间');
      return;
    }

    const updatedTimeSlot = {
      ...timeSlot,
      start: formData.start,
      end: formData.end
    };
    
    onSave(updatedTimeSlot);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        点击修改时间段的起止时间。配置将保存在本地存储中。
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
            onClick={onCancel}
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
  );
};

export default TimeSlotConfigModal;