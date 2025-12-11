/**
 * 封装 Chrome 原生 i18n
 * 使用方法: i18n('keyName')
 */
export const i18n = (key: string): string => {
  // 加上 try-catch 防止在非扩展环境下（如纯网页调试）报错
  try {
    return chrome.i18n.getMessage(key) || key
  } catch (e) {
    return key
  }
}