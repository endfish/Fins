/**
 * 数字格式化工具
 */

// 1. 基础千分位格式化 (例如: 12345 -> "12,345")
export const formatNumber = (num: number): string => {
  // 使用 'en-US' locale 可以确保总是使用逗号作为千分位符
  return num.toLocaleString('en-US')
}

// 2. 如果你以后需要更复杂的格式化，比如紧凑模式 (1.2k, 1.5M)
export const formatCompactNumber = (num: number): string => {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num)
}
