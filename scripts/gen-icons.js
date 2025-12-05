// scripts/gen-icons.js
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 获取 __dirname (ESM 模式)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 目标文件路径
const cssPath = path.resolve(__dirname, '../node_modules/remixicon/fonts/remixicon.css')
const outputPath = path.resolve(__dirname, '../src/assets/icons.json')

console.log('Fins: Scanning RemixIcon CSS...')

try {
  const cssContent = fs.readFileSync(cssPath, 'utf-8')

  // 正则匹配所有 .ri-xxx:before 格式的类名
  // RemixIcon v4 的格式通常是 .ri-home-line:before { ... }
  const regex = /\.ri-([a-z0-9-]+):before/g
  const icons = []
  let match

  while ((match = regex.exec(cssContent)) !== null) {
    // match[1] 是捕获组，即 ri- 之后的部分
    // 我们需要完整的类名 ri-xxx
    icons.push(`ri-${match[1]}`)
  }

  // 去重
  const uniqueIcons = [...new Set(icons)]

  console.log(`Fins: Found ${uniqueIcons.length} icons.`)

  // 写入 JSON
  fs.writeFileSync(outputPath, JSON.stringify(uniqueIcons, null, 2))

  console.log(`Fins: Generated ${outputPath}`)

} catch (e) {
  console.error('Error generating icons:', e)
  console.log('Tip: Ensure "remixicon" is installed in node_modules.')
}