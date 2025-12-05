/**
 * 解析 rgba 字符串
 * 输入: "rgba(255, 255, 255, 0.5)" 或 "rgb(255, 255, 255)"
 * 输出: { r: 255, g: 255, b: 255, a: 0.5 }
 */
export const parseRgba = (color: string) => {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (!match) return { r: 0, g: 0, b: 0, a: 1 }
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] ? Number(match[4]) : 1,
  }
}

/**
 * 将 RGB 对象转为 Hex
 * 输入: { r: 255, g: 0, b: 0 }
 * 输出: "#ff0000"
 */
export const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

/**
 * 将 Hex 转为 RGB 对象
 * 输入: "#ff0000"
 * 输出: { r: 255, g: 0, b: 0 }
 */
export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16),
      }
    : { r: 0, g: 0, b: 0 }
}

/**
 * 合成为 rgba 字符串
 */
export const toRgbaString = (r: number, g: number, b: number, a: number) => {
  // alpha 保留2位小数，去掉末尾的0
  const alpha = parseFloat(a.toFixed(2))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
