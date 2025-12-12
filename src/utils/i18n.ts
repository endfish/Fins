/**
 * Chrome i18n 包装器
 * 用于在 Vue 组件中简化调用
 */
export const t = (key: string, substitutions?: string | string[]): string => {
  // 容错处理：如果 key 不存在，返回 key 本身，方便调试发现遗漏
  return chrome.i18n.getMessage(key, substitutions) || key
}