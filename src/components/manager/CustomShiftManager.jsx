import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getShiftColor, getShiftBackgroundColor } from '@/utils/shiftColor.js';
import Modal from '../modals/Modal';
import ColorPicker from '../pickers/ColorPicker'; // 导入颜色选择器组件
import SemesterSettingsModal from '../modals/SemesterSettingsModal'; // 导入学期设置模态框组件

const CustomShiftManager = ({ scrollToEditSection }) => {
  const { t } = useTranslation();
  const [shifts, setShifts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftName, setShiftName] = useState('');
  const [customHue, setCustomHue] = useState(180); // 添加自定义色调状态，默认为青色
  const [showSemesterSettings, setShowSemesterSettings] = useState(false); // 学期设置模态框状态
  
  // Drag and drop sorting related state
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOver, setDraggedOver] = useState(null);

  // Load shifts from localStorage on component mount
  useEffect(() => {
    const savedShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    setShifts(savedShifts);
  }, []);

  // Save shifts to localStorage whenever shifts change
  useEffect(() => {
    localStorage.setItem('customShifts', JSON.stringify(shifts));
  }, [shifts]);

  // 移除班次类型相关的颜色设置逻辑

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!shiftName.trim()) {
      alert(t('time_entry.custom_shift.validation.name_required'));
      return;
    }
    
    const newShift = {
      id: editingShift ? editingShift.id : Date.now().toString(),
      name: shiftName,
      customHue // 保存自定义色调
    };
    
    if (editingShift) {
      // Update existing shift
      setShifts(shifts.map(shift => shift.id === editingShift.id ? newShift : shift));
      setEditingShift(null);
    } else {
      // Add new shift
      setShifts([...shifts, newShift]);
    }
    
    // Reset form
    setShiftName('');
    setCustomHue(180); // 重置为默认值（青色）
      setShowForm(false);
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setShiftName(shift.name);
    setCustomHue(shift.customHue !== undefined ? shift.customHue : 180); // 设置自定义色调，如果不存在则默认为青色
    setShowForm(true);
    
    // 滚动到编辑区域
    if (scrollToEditSection) {
      setTimeout(() => {
        scrollToEditSection();
      }, 100);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm(t('time_entry.custom_shift.delete_confirm'))) {
      setShifts(shifts.filter(shift => shift.id !== id));
    }
  };

  // 不需要转换时长，已移除自定义工时功能

  // 移除班次类型显示文本函数

  // Drag and drop sorting functions
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOver(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, targetItem) => {
    if (targetItem !== draggedItem) {
      setDraggedOver(targetItem.id);
    }
  };

  const handleDragLeave = (e) => {
    // No action needed
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    
    if (draggedItem && targetItem !== draggedItem) {
      const newShifts = [...shifts];
      const draggedIndex = newShifts.findIndex(item => item.id === draggedItem.id);
      const targetIndex = newShifts.findIndex(item => item.id === targetItem.id);
      
      // Remove dragged item
      const [removed] = newShifts.splice(draggedIndex, 1);
      // Insert at target position
      newShifts.splice(targetIndex, 0, removed);
      
      setShifts(newShifts);
    }
    
    setDraggedItem(null);
    setDraggedOver(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 md:p-6 w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-1 h-6 sm:h-8 rounded-full mr-3"></div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {t('time_entry.custom_shift.title')}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSemesterSettings(true)}
              className="flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 text-sm whitespace-nowrap"
              title="学期设置"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 text-sm whitespace-nowrap md:py-2.5 md:px-5 md:text-sm md:rounded-lg"
            >
              <svg className="w-4 h-4 mr-1 md:w-4 md:h-4 md:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>{t('time_entry.custom_shift.add_shift')}</span>
            </button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={showForm} 
        onClose={() => {
          setShowForm(false);
      setEditingShift(null);
      setShiftName('');
      setCustomHue(180); // 重置为默认值（青色）
        }}
        size="md"
        title={editingShift ? `${t('time_entry.custom_shift.edit')}课程 - ${editingShift.name}` : t('time_entry.custom_shift.add_shift')}
      >
        <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-4">
          <div className="mb-2 sm:mb-3">
            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="shiftName">
              {t('time_entry.custom_shift.shift_name')}
            </label>
            <input
              type="text"
              id="shiftName"
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs sm:text-sm"
              placeholder={t('time_entry.custom_shift.shift_name_placeholder')}
              required
            />
</div>
        

          
          {/* 移除时间和自定义工时字段 */}
          
          {/* 移除班次类型选择选项 */}
          
          {/* 颜色选择器 */}
          <ColorPicker 
            selectedColor={customHue} 
            onColorChange={setCustomHue} 
          />
          
          <div className="flex flex-row justify-between items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingShift(null);
                setShiftName('');
                setCustomHue(180); // 重置为默认值（青色）
              }}
              className="w-auto px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-base sm:text-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="w-auto px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg shadow transition-all duration-200 text-base sm:text-sm"
            >
              {editingShift ? t('common.save') : t('common.add')}
            </button>
          </div>
        </form>
      </Modal>
      
      {shifts.length > 0 ? (
        // 优化班次项的显示，改进布局和视觉效果
        <div className="space-y-3">
          {shifts.map((shift) => (
            <div 
              key={shift.id} 
              className={`rounded-xl shadow-sm transition-all duration-200 ease-in-out transform hover:shadow-md md:p-3 p-1.5 max-w-xs mx-auto md:max-w-2xl ${
                draggedOver === shift.id ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
              }`}
              style={{ 
                borderLeft: `4px solid ${getShiftColor(null, shift.customHue)}`,
                backgroundColor: getShiftBackgroundColor(null, shift.customHue),
                boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.05)'
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, shift)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, shift)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, shift)}
            >
              <div className="md:p-3 p-1.5">
                <div className="flex justify-between items-start">
                  {/* 左侧：班次名称 */}
                  <div className="flex items-start min-w-0">
                    <div 
                      className="w-3.5 h-3.5 rounded-full border-2 border-white shadow mr-2.5 mt-1 flex-shrink-0"
                      style={{ backgroundColor: getShiftColor(null, shift.customHue) }}
                    ></div>
                    <div className="min-w-0 flex-1 flex flex-col">
                      <h3 
                      className="font-bold text-gray-800 md:text-base text-sm truncate leading-tight"
                      style={{ color: getShiftColor(null, shift.customHue) }}
                    >
                      {shift.name}
                    </h3>

                    </div>
                  </div>
                  
                  {/* 右侧：操作按钮 */}
                  <div className="flex space-x-0.5 md:space-x-2 ml-1 md:ml-3">
                    <button
                      onClick={() => handleEdit(shift)}
                      className="p-0.5 md:p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center justify-center min-w-[24px] md:min-w-[36px] min-h-[24px] md:min-h-[36px]"
                      aria-label={t('common.edit')}
                    >
                      <svg className="w-3 md:w-4 h-3 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(shift.id)}
                      className="p-0.5 md:p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-red-600 transition-colors duration-200 flex items-center justify-center min-w-[24px] md:min-w-[36px] min-h-[24px] md:min-h-[36px]"
                      aria-label={t('common.delete')}
                    >
                      <svg className="w-3 md:w-4 h-3 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* 底部：时间范围和工时时长 */}
                {/* 移除班次类型信息显示 */}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('time_entry.custom_shift.no_shifts')}</h3>
          <p className="text-gray-500 max-w-md mx-auto">{t('time_entry.custom_shift.no_shifts_description')}</p>
        </div>
      )}
      
      {/* 学期设置模态框 */}
      <SemesterSettingsModal 
        isOpen={showSemesterSettings} 
        onClose={() => setShowSemesterSettings(false)} 
      />
    </div>
  );
};

export default CustomShiftManager;