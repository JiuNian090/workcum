import React from 'react';
import { useTranslation } from 'react-i18next';

const ColorPicker = ({ selectedColor, onColorChange }) => {
  const { t } = useTranslation();

  // 根据色调生成颜色值
  const getColorValue = (hue) => `hsl(${hue}, 80%, 50%)`;

  // 处理颜色滑块变化
  const handleHueChange = (e) => {
    const hue = parseInt(e.target.value);
    onColorChange(hue);
  };

  return (
    <div className="mb-2.5 sm:mb-3">
      <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1">
        {t('time_entry.custom_shift.color_picker')}
      </label>
      
      {/* 自定义颜色条 */}
      <div className="space-y-2">
        <div className="relative h-8 rounded-lg overflow-hidden shadow-sm border border-gray-200">
          <input
            type="range"
            min="0"
            max="360"
            value={selectedColor}
            onChange={handleHueChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div 
            className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500"
          ></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className="w-6 h-6 rounded-full border border-gray-300 mr-2 shadow-sm"
              style={{ backgroundColor: getColorValue(selectedColor) }}
            ></div>
            <span className="text-xs text-gray-600">
              {t('time_entry.custom_shift.selected_color')}: {selectedColor}°
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;