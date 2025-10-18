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
    weekDay: '', // 周几
    selectedWeeks: [], // 选中的周数（可多选）
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
      weekDay: '',
      selectedWeeks: [],
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
    
    if (!formData.courseTemplate || !formData.weekDay || formData.selectedWeeks.length === 0 || !formData.startTime || !formData.endTime) {
      alert('请填写所有必填字段');
      return;
    }

    // 验证时间逻辑：结束时间必须晚于开始时间
    if (formData.startTime >= formData.endTime) {
      alert('结束时间必须晚于开始时间');
      return;
    }

    // 获取选中的课程模板
    const selectedTemplate = courseTemplates.find(template => template.id === formData.courseTemplate);
    
    // 为每个选中的周创建课程
    const newCourses = formData.selectedWeeks.map(week => {
      // 获取学期设置
      const semesterSettings = JSON.parse(localStorage.getItem('semesterSettings') || '{}');
      
      // 如果没有设置学期开始日期，使用当前周的周一作为基准
      let semesterStart;
      if (semesterSettings.startDate) {
        semesterStart = new Date(semesterSettings.startDate);
      } else {
        // 如果没有设置学期开始日期，使用当前周的周一
        const startOfWeek = new Date(currentWeek);
        const dayOfWeek = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        semesterStart = new Date(startOfWeek.setDate(diff));
      }
      
      // 计算学期开始后的第一个周一
      const dayOfWeek = semesterStart.getDay();
      const diff = semesterStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const semesterFirstMonday = new Date(semesterStart.setDate(diff));
      
      // 计算目标周数的周一日期
      const targetWeekMonday = new Date(semesterFirstMonday);
      targetWeekMonday.setDate(semesterFirstMonday.getDate() + (week - 1) * 7);
      
      // 计算周几对应的日期
      const courseDate = new Date(targetWeekMonday);
      courseDate.setDate(targetWeekMonday.getDate() + parseInt(formData.weekDay) - 1);
      
      return {
        id: `${Date.now()}_${week}`, // 为每个课程添加唯一ID
        templateId: selectedTemplate.id,
        name: selectedTemplate.name,
        color: selectedTemplate.customHue !== undefined ? `hsl(${selectedTemplate.customHue}, 70%, 50%)` : '#6366f1',
        date: format(courseDate, 'yyyy-MM-dd'),
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        weekNumber: week // 添加周数信息
      };
    });

    // 调用添加课程回调，传入课程数组
    onAddCourse(newCourses);
    
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

  // 处理周几选择
  const handleWeekDayChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      weekDay: value
    }));
  };

  // 处理周数多选
  const handleWeekToggle = (week) => {
    setFormData(prev => {
      const { selectedWeeks } = prev;
      if (selectedWeeks.includes(week)) {
        // 如果已选中，则取消选中
        return {
          ...prev,
          selectedWeeks: selectedWeeks.filter(w => w !== week)
        };
      } else {
        // 如果未选中，则添加到选中列表
        return {
          ...prev,
          selectedWeeks: [...selectedWeeks, week]
        };
      }
    });
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

        {/* 时间选择 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startTime">
              开始时间 *
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleInputChange}
              className="w-full py-2 px-3 text-gray-700 bg-white border-2 border-indigo-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endTime">
              结束时间 *
            </label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleInputChange}
              className="w-full py-2 px-3 text-gray-700 bg-white border-2 border-indigo-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              required
            />
          </div>
        </div>

        {/* 地点填写 */}
        <div className="mb-4">
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

        {/* 周几选择 */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            周几 *
          </label>
          <select
            value={formData.weekDay}
            onChange={handleWeekDayChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">请选择周几</option>
            <option value="1">周一</option>
            <option value="2">周二</option>
            <option value="3">周三</option>
            <option value="4">周四</option>
            <option value="5">周五</option>
            <option value="6">周六</option>
            <option value="0">周日</option>
          </select>
        </div>

        {/* 第几周选择（多选） */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            选择周数 *
          </label>
          <div className="grid grid-cols-10 gap-1.5 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((week) => (
              <button
                key={week}
                type="button"
                onClick={() => handleWeekToggle(week)}
                className={`py-2 px-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  formData.selectedWeeks.includes(week)
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {week}
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            已选择 {formData.selectedWeeks.length} 周
          </div>
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