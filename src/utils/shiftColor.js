// 定义班次类型到颜色配置的映射
// 每种类型包含色调(H)、饱和度(S)、亮度(L)和背景亮度值
// 颜色方案参考：https://www.canva.com/colors/color-palettes/
export const shiftTypeToColorMap = {
  day: {
    hue: 180,        // 青色
    saturation: 80,   // 饱和度80%
    lightness: 30,    // 亮度30% (更深的青色)
    bgLightness: 80  // 背景亮度80% (较深的浅青色)
  },
  overnight: {
    hue: 240,        // 蓝色
    saturation: 70,
    lightness: 40,    // 亮度40% (较深的蓝色)
    bgLightness: 90  // 背景亮度90% (较浅的蓝色)
  },
  rest: {
    hue: 270,        // 紫色
    saturation: 50,
    lightness: 45,    // 亮度45% (较深的紫色)
    bgLightness: 92  // 背景亮度92% (较浅的紫色)
  },
  regular: {
    hue: 30,         // 橙色
    saturation: 90,
    lightness: 50,    // 亮度50% (较深的橙色)
    bgLightness: 88  // 背景亮度88% (较浅的橙色)
  },
  special: {
    hue: 330,        // 粉色
    saturation: 70,   // 饱和度70%
    lightness: 40,    // 亮度40% (较深的粉色)
    bgLightness: 88  // 背景亮度88% (较浅的粉色)
  }
};

/**
 * 获取默认颜色配置
 * @returns {Object} 默认颜色配置对象
 */
export const getDefaultColorConfig = () => {
  return shiftTypeToColorMap.day;
};

/**
 * 根据班次类型和自定义色调获取边框颜色
 * @param {string|null} shiftType - 班次类型 ('day', 'overnight', 'rest', 'regular', 'special') 或 null
 * @param {number} customHue - 可选的自定义色调值 (0-360)
 * @returns {string} HSL颜色字符串
 */
export const getShiftColor = (shiftType = 'day', customHue = null) => {
  // 如果提供了自定义色调，则使用它
  if (customHue !== null && customHue !== undefined) {
    const config = shiftType && shiftTypeToColorMap[shiftType] ? shiftTypeToColorMap[shiftType] : getDefaultColorConfig();
    return `hsl(${customHue}, ${config.saturation}%, ${config.lightness}%)`;
  }
  
  // 否则使用默认配置
  const config = shiftType && shiftTypeToColorMap[shiftType] ? shiftTypeToColorMap[shiftType] : getDefaultColorConfig();
  return `hsl(${config.hue}, ${config.saturation}%, ${config.lightness}%)`;
};

/**
 * 根据班次类型和自定义色调获取背景颜色
 * @param {string|null} shiftType - 班次类型 ('day', 'overnight', 'rest', 'regular', 'special') 或 null
 * @param {number} customHue - 可选的自定义色调值 (0-360)
 * @returns {string} HSL颜色字符串
 */
export const getShiftBackgroundColor = (shiftType = 'day', customHue = null) => {
  // 如果提供了自定义色调，则使用它
  if (customHue !== null && customHue !== undefined) {
    const config = shiftType && shiftTypeToColorMap[shiftType] ? shiftTypeToColorMap[shiftType] : getDefaultColorConfig();
    return `hsl(${customHue}, ${config.saturation}%, ${config.bgLightness}%)`;
  }
  
  // 否则使用默认配置
  const config = shiftType && shiftTypeToColorMap[shiftType] ? shiftTypeToColorMap[shiftType] : getDefaultColorConfig();
  return `hsl(${config.hue}, ${config.saturation}%, ${config.bgLightness}%)`;
};

/**
 * 根据班次类型和自定义色调获取更深的背景颜色，用于类型标识
 * @param {string} shiftType - 班次类型 ('day', 'overnight', 'rest', 'regular', 'special')
 * @param {number} customHue - 可选的自定义色调值 (0-360)
 * @returns {string} HSL颜色字符串
 */
export const getShiftTypeBackgroundColor = (shiftType = 'day', customHue = null) => {
  // 如果提供了自定义色调，则使用它，但降低亮度值使颜色更深
  if (customHue !== null && customHue !== undefined) {
    const config = shiftTypeToColorMap[shiftType] || getDefaultColorConfig();
    // 将亮度值降低15%以获得更深的颜色
    const darkerBgLightness = Math.max(0, config.bgLightness - 15);
    return `hsl(${customHue}, ${config.saturation}%, ${darkerBgLightness}%)`;
  }
  
  // 否则使用默认配置，但降低亮度值使颜色更深
  const config = shiftTypeToColorMap[shiftType] || getDefaultColorConfig();
  // 将亮度值降低15%以获得更深的颜色
  const darkerBgLightness = Math.max(0, config.bgLightness - 15);
  return `hsl(${config.hue}, ${config.saturation}%, ${darkerBgLightness}%)`;
};