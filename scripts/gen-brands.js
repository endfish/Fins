// scripts/gen-brands.js
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as simpleIcons from 'simple-icons'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputPath = path.resolve(__dirname, '../src/assets/brands.json')

console.log('Fins: Extracting Simple Icons...')

const brands = []

// 遍历 simple-icons 导出对象
for (const key in simpleIcons) {
  const icon = simpleIcons[key]
  // 确保是图标对象
  if (icon && icon.slug && icon.path) {
    brands.push({
      n: icon.title,      // Name (用于搜索)
      s: icon.slug,       // Slug (唯一标识)
      h: '#' + icon.hex,  // Hex Color (官方品牌色)
      p: icon.path        // SVG Path (核心路径)
    })
  }
}

console.log(`Fins: Found ${brands.length} brand icons.`)

// 写入 JSON
fs.writeFileSync(outputPath, JSON.stringify(brands)) // 这里可以不格式化以减小体积，或者用 null, 2 方便调试

console.log(`Fins: Generated ${outputPath}`)