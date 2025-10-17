/**
 * 计算当前日期是学期的第几周
 * @returns {number} 周数，如果不在学期范围内返回0
 */
export const getCurrentWeekNumber = () => {
  const semesterSettings = JSON.parse(localStorage.getItem('semesterSettings') || '{}');
  
  if (!semesterSettings.startDate || !semesterSettings.endDate) {
    return 0;
  }
  
  const startDate = new Date(semesterSettings.startDate);
  const endDate = new Date(semesterSettings.endDate);
  const currentDate = new Date();
  
  // 如果当前日期不在学期范围内，返回0
  if (currentDate < startDate || currentDate > endDate) {
    return 0;
  }
  
  // 计算从学期开始到当前日期的天数
  const timeDiff = currentDate.getTime() - startDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  // 计算周数（向上取整）
  const weekNumber = Math.ceil(daysDiff / 7);
  
  return weekNumber;
};

/**
 * 获取学期设置
 * @returns {Object} 学期设置对象
 */
export const getSemesterSettings = () => {
  return JSON.parse(localStorage.getItem('semesterSettings') || '{}');
};

/**
 * 检查当前日期是否在学期范围内
 * @returns {boolean} 是否在学期范围内
 */
export const isInSemester = () => {
  const semesterSettings = JSON.parse(localStorage.getItem('semesterSettings') || '{}');
  
  if (!semesterSettings.startDate || !semesterSettings.endDate) {
    return false;
  }
  
  const startDate = new Date(semesterSettings.startDate);
  const endDate = new Date(semesterSettings.endDate);
  const currentDate = new Date();
  
  return currentDate >= startDate && currentDate <= endDate;
};