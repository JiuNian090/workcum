import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Modal from './Modal.jsx';

const EditCourseModal = ({ isOpen, onClose, course, courseTemplates, currentWeek, onEditCourse, onDeleteCourse }) => {
  const [formData, setFormData] = useState({
    courseTemplate: '',
    weekDay: '',
    selectedWeeks: [],
    startTime: '',
    endTime: '',
    location: ''
  });
  
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

  // 初始化表单数据
  useEffect(() => {
    if (course && courseTemplates.length > 0) {
      // 解析课程日期以获取周几
      const courseDate = new Date(course.date);
      const weekDay = courseDate.getDay() === 0 ? 0 : courseDate.getDay(); // 周日为0
      
      // 获取课程模板
      const template = courseTemplates.find(t => t.id === course.templateId);
      
      setFormData({
        courseTemplate: course.templateId,
        weekDay: weekDay.toString(),
        selectedWeeks: [course.weekNumber],
        startTime: course.startTime,
        endTime: course.endTime,
        location: course.location || ''
      });
    }
  }, [course, courseTemplates]);

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

    // 验证时间是否在允许的范围内（8:00-22:00）
    const [startHour, startMinute] = formData.startTime.split(':').map(Number);
    const [endHour, endMinute] = formData.endTime.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;
    const minTimeInMinutes = 8 * 60; // 8:00
    const maxTimeInMinutes = 22 * 60; // 22:00

    if (startTimeInMinutes < minTimeInMinutes || startTimeInMinutes > maxTimeInMinutes) {
      alert('开始时间必须在8:00-22:00之间');
      return;
    }

    if (endTimeInMinutes < minTimeInMinutes || endTimeInMinutes > maxTimeInMinutes) {
      alert('结束时间必须在8:00-22:00之间');
      return;
    }

    // 获取选中的课程模板
    const selectedTemplate = courseTemplates.find(template => template.id === formData.courseTemplate);
    
    // 为每个选中的周创建课程
    const updatedCourses = formData.selectedWeeks.map(week => {
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
        id: `${course.id.split('_')[0]}_${week}`, // 保持原始时间戳部分，更新周数
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

    // 调用编辑课程回调，传入课程数组
    onEditCourse(updatedCourses, course);
    
    // 关闭弹窗
    onClose();
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

  if (!isOpen || !course) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="编辑课程" size="md">
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
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              if (onDeleteCourse) {
                onDeleteCourse(course);
              }
              onClose();
            }}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
          >
            删除
          </button>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-all duration-200"
            >
              取消
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
            >
              保存更改
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditCourseModal;