import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import Modal from './Modal.jsx';

const AddCourseModal = ({ isOpen, onClose, currentWeek, onAddCourse }) => {
  const { t } = useTranslation();
  const [courseTemplates, setCourseTemplates] = useState([]);
  const [formData, setFormData] = useState({
    courseTemplate: '',
    date: '',
    startTime: '',
    endTime: '',
    location: ''
  });
  const [weekDays, setWeekDays] = useState([]);
  
  // 时间选项
  const timeOptions = [];
  for (let hour = 8; hour <= 21; hour++) {
    const startHour = hour.toString().padStart(2, '0');
    const endHour = (hour + 1).toString().padStart(2, '0');
    timeOptions.push({
      value: `${startHour}:00`,
      label: `${startHour}:00`
    });
    timeOptions.push({
      value: `${startHour}:30`,
      label: `${startHour}:30`
    });
  }

  // 初始化当前周日期
  useEffect(() => {
    if (currentWeek) {
      const startOfWeek = new Date(currentWeek);
      const dayOfWeek = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(startOfWeek.setDate(diff));
      
      const days = [];
      for (let i = 0; i < 7; i++) {
        days.push(addDays(monday, i));
      }
      setWeekDays(days);
    }
  }, [currentWeek]);

  // 加载课程模板
  useEffect(() => {
    const savedTemplates = localStorage.getItem('customShifts');
    if (savedTemplates) {
      setCourseTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  // 重置表单
  const resetForm = () => {
    setFormData({
      courseTemplate: '',
      date: '',
      startTime: '',
      endTime: '',
      location: ''
    });
  };

  // 关闭弹窗
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.courseTemplate || !formData.date || !formData.startTime || !formData.endTime) {
      alert('请填写所有必填字段');
      return;
    }

    // 获取选中的课程模板
    const selectedTemplate = courseTemplates.find(template => template.id === formData.courseTemplate);
    
    // 创建新课程
    const newCourse = {
      id: Date.now().toString(),
      templateId: selectedTemplate.id, // 添加模板ID引用
      name: selectedTemplate.name,
      color: selectedTemplate.customHue !== undefined ? `hsl(${selectedTemplate.customHue}, 70%, 50%)` : '#6366f1', // 使用自定义色调或默认颜色
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location
    };

    // 调用添加课程回调
    onAddCourse(newCourse);
    
    // 关闭弹窗
    handleClose();
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="添加课程" size="md">
      <form onSubmit={handleSubmit}>
        {/* 课程模板选择 */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="courseTemplate">
            课程模板 *
          </label>
          <select
            id="courseTemplate"
            name="courseTemplate"
            value={formData.courseTemplate}
            onChange={handleInputChange}
            className="w-full py-2 px-3 text-gray-700 bg-white border-2 border-indigo-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            required
          >
            <option value="">请选择课程模板</option>
            {courseTemplates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        {/* 日期选择 */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
            日期 *
          </label>
          <select
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full py-2 px-3 text-gray-700 bg-white border-2 border-indigo-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            required
          >
            <option value="">请选择日期</option>
            {weekDays.map((day, index) => (
              <option key={index} value={format(day, 'yyyy-MM-dd')}>
                {format(day, 'EEEE', { locale: zhCN })} - {format(day, 'MM月dd日', { locale: zhCN })}
              </option>
            ))}
          </select>
        </div>

        {/* 时间选择 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startTime">
              开始时间 *
            </label>
            <select
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className="w-full py-2 px-3 text-gray-700 bg-white border-2 border-indigo-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              required
            >
              <option value="">请选择开始时间</option>
              {timeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endTime">
              结束时间 *
            </label>
            <select
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className="w-full py-2 px-3 text-gray-700 bg-white border-2 border-indigo-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              required
            >
              <option value="">请选择结束时间</option>
              {timeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 地点填写 */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
            地点
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="请输入上课地点"
            className="w-full py-2 px-3 text-gray-700 bg-white border-2 border-indigo-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />
        </div>

        {/* 按钮组 */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            取消
          </button>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            添加课程
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCourseModal;