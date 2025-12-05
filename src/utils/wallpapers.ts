/**
 * 壁纸资源管理器
 * 负责自动扫描 src/assets/wallpapers 下的图片
 * 并提供 "文件名" <-> "真实URL" 的映射
 */

// 1. 自动扫描 (Eager load)
// key 是相对路径，value 是构建后的 URL (在 dev 是 localhost，在 build 是 hash 路径)
const modules = import.meta.glob('@/assets/wallpapers/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
})

// 2. 构建映射表
const wallpaperMap = new Map<string, string>()

// 遍历 modules，提取文件名作为 Key
for (const path in modules) {
  // path 类似于 "/src/assets/wallpapers/forest.jpg"
  const fileName = path.split('/').pop() // 拿到 "forest.jpg"
  const fullUrl = modules[path] as string

  if (fileName) {
    wallpaperMap.set(fileName, fullUrl)
  }
}

/**
 * 获取所有可用壁纸列表
 */
export const getLocalWallpapers = () => {
  return Array.from(wallpaperMap.entries()).map(([name, url]) => ({
    name,
    url,
  }))
}

/**
 * 解析壁纸路径
 * @param src 可能是文件名 (forest.jpg) 也可能是网络 URL (https://...)
 */
export const resolveWallpaperUrl = (src: string) => {
  if (!src) return ''

  // 如果是 http 开头，直接返回（网络图片）
  if (src.startsWith('http') || src.startsWith('data:')) {
    return src
  }

  // 否则尝试从本地映射表中查找
  return wallpaperMap.get(src) || src
}
