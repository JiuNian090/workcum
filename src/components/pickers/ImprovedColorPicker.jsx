import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ImprovedColorPicker = ({ selectedColor, onColorChange }) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  const thumbRef = useRef(null);

  // 根据色调生成颜色值
  const getColorValue = (hue) => `hsl(${hue}, 80%, 50%)`;

  // 处理颜色滑块变化
  const handleHueChange = (e) => {
    const hue = parseInt(e.target.value);
    onColorChange(hue);
  };

  // 计算滑块拇指的位置
  const calculateThumbPosition = () => {
    if (!sliderRef.current) return 0;
    const percentage = (selectedColor / 360) * 100;
    return `calc(${percentage}% - 12px)`;
  };

  // 处理滑块点击事件
  const handleSliderClick = (e) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    const hue = Math.round((percentage / 100) * 360);
    
    onColorChange(hue);
  };

  // 处理触摸事件
  const handleTouchMove = (e) => {
    if (!sliderRef.current) return;
    
    const touch = e.touches[0];
    const rect = sliderRef.current.getBoundingClientRect();
    const offsetX = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    const hue = Math.round((percentage / 100) * 360);
    
    onColorChange(hue);
  };

  // 处理触摸开始
  const handleTouchStart = () => {
    setIsDragging(true);
  };

  // 处理触摸结束
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="mb-2.5 sm:mb-3">
      <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1">
        {t('time_entry.custom_shift.color_picker')}
      </label>
      
      {/* 自定义颜色条 */}
      <div className="space-y-2">
        <div className="relative h-8 rounded-lg overflow-hidden shadow-sm border border-gray-200">
          {/* 颜色渐变条 */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, ' +
                'hsl(0, 80%, 50%), ' +
                'hsl(60, 80%, 50%), ' +
                'hsl(120, 80%, 50%), ' +
                'hsl(180, 80%, 50%), ' +
                'hsl(240, 80%, 50%), ' +
                'hsl(300, 80%, 50%), ' +
                'hsl(360, 80%, 50%))'
            }}
          ></div>
          
          {/* 可点击的滑块区域 */}
          <div
            ref={sliderRef}
            className="absolute inset-0 cursor-pointer"
            onClick={handleSliderClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* 滑块拇指 - 在移动端更明显 */}
            <div
              ref={thumbRef}
              className="absolute top-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-gray-300 transform -translate-y-1/2 z-20 transition-all duration-150 ease-out"
              style={{
                left: calculateThumbPosition(),
                borderColor: getColorValue(selectedColor),
                boxShadow: `0 0 0 2px ${getColorValue(selectedColor)}, 0 4px 8px rgba(0,0,0,0.2)`,
              }}
            >
              {/* 内部颜色指示器 */}
              <div 
                className="absolute inset-1 rounded-full"
                style={{ backgroundColor: getColorValue(selectedColor) }}
              ></div>
            </div>
          </div>
          
          {/* 隐藏的range input用于键盘访问 */}
          <input
            type="range"
            min="0"
            max="360"
            value={selectedColor}
            onChange={handleHueChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            aria-label={t('time_entry.custom_shift.color_picker')}
          />
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

export default ImprovedColorPicker;