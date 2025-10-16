import { useState, useRef, useCallback } from 'react';

/**
 * 自定义Hook，用于处理滑动选择功能
 * @param {Function} onSelectionEnd - 选择结束时的回调函数
 */
export const useSwipeSelection = (onSelectionEnd) => {
  // 选择状态
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [currentCell, setCurrentCell] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  
  // 用于存储触摸事件的初始坐标
  const touchStartRef = useRef({ x: 0, y: 0 });
  
  // 开始选择
  const startSelection = useCallback((cellData) => {
    setIsSelecting(true);
    setStartCell(cellData);
    setCurrentCell(cellData);
    setSelectedCells([cellData]);
  }, []);
  
  // 更新选择
  const updateSelection = useCallback((cellData) => {
    if (!isSelecting) return;
    
    setCurrentCell(cellData);
    
    // 检查单元格是否已选中
    const isAlreadySelected = selectedCells.some(
      cell => cell.date === cellData.date && cell.timeSlotId === cellData.timeSlotId
    );
    
    if (!isAlreadySelected) {
      setSelectedCells(prev => [...prev, cellData]);
    }
  }, [isSelecting, selectedCells]);
  
  // 结束选择
  const endSelection = useCallback(() => {
    if (!isSelecting) return;
    
    setIsSelecting(false);
    if (onSelectionEnd && selectedCells.length > 0) {
      onSelectionEnd(selectedCells);
    }
    setStartCell(null);
    setCurrentCell(null);
    setSelectedCells([]);
  }, [isSelecting, onSelectionEnd, selectedCells]);
  
  // 处理鼠标/触摸开始事件
  const handleTouchStart = useCallback((e, cellData) => {
    // 阻止默认行为，防止页面滚动
    e.preventDefault();
    
    // 记录触摸开始位置
    const touch = e.touches ? e.touches[0] : e;
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    
    startSelection(cellData);
  }, [startSelection]);
  
  // 处理鼠标/触摸移动事件
  const handleTouchMove = useCallback((e, cellData) => {
    if (!isSelecting) return;
    
    // 阻止默认行为，防止页面滚动
    e.preventDefault();
    
    // 获取当前触摸位置
    const touch = e.touches ? e.touches[0] : e;
    const currentX = touch.clientX;
    const currentY = touch.clientY;
    
    // 计算移动距离
    const deltaX = Math.abs(currentX - touchStartRef.current.x);
    const deltaY = Math.abs(currentY - touchStartRef.current.y);
    
    // 如果移动距离超过阈值，认为是滑动操作
    if (deltaX > 5 || deltaY > 5) {
      // 更新选择
      updateSelection(cellData);
    }
  }, [isSelecting, updateSelection]);
  
  // 处理鼠标/触摸结束事件
  const handleTouchEnd = useCallback((e) => {
    endSelection();
  }, [endSelection]);
  
  // 清除选择
  const clearSelection = useCallback(() => {
    setIsSelecting(false);
    setStartCell(null);
    setCurrentCell(null);
    setSelectedCells([]);
  }, []);
  
  return {
    // 状态
    isSelecting,
    startCell,
    currentCell,
    selectedCells,
    
    // 方法
    startSelection,
    updateSelection,
    endSelection,
    clearSelection,
    
    // 事件处理函数
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
};