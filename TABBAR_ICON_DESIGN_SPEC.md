# 🎨 TabBar图标系统 - 完整设计规范与实现指南

**版本：** v2.0 (Modern Linear Icons)  
**最后更新：** 2026-05-05  
**适用项目：** 吃药提醒小程序  
**设计师：** AI UI Design System

---

## 📋 目录

1. [设计理念与原则](#-设计理念与原则)
2. [技术规格](#-技术规格)
3. [图标清单](#-图标清单)
4. [色彩系统](#-色彩系统)
5. [SVG源文件说明](#-svg源文件说明)
6. [PNG导出指南（重要！）](#-png导出指南)
7. [配置集成步骤](#-配置集成步骤)
8. [质量检查清单](#-质量检查清单)
9. [使用规范与最佳实践](#-使用规范与最佳实践)

---

## 一、设计理念与原则

### 1.1 设计风格：Modern Linear Icons v2.0

本套图标采用**现代线性图标**（Modern Line Icons）设计语言，这是2024年UI/UX设计的国际主流趋势。

#### **核心特征：**

| 特征 | 描述 | 应用效果 |
|------|------|----------|
| **极简主义** | 去除一切不必要的装饰元素 | 视觉干净、专业 |
| **统一描边** | 所有图标使用2px/2.5px统一线宽 | 视觉一致性 |
| **几何和谐** | 基于网格系统的精确对齐 | 整齐感强 |
| **圆角端点** | stroke-linecap: round | 友好、柔和 |
| **语义化填充** | 选中状态使用品牌色+透明度填充 | 状态区分清晰 |

### 1.2 设计原则

#### **✅ 必须遵守的原则：**

1. **可识别性优先**
   - 图标必须在0.5秒内被用户识别
   - 形状应符合用户的认知习惯
   - 避免过于抽象的设计

2. **视觉一致性**
   - 同一状态的所有图标使用相同的视觉重量
   - 描边宽度、圆角大小必须统一
   - 色彩饱和度和明度保持一致

3. **尺寸适应性**
   - 在48px标准尺寸下清晰可辨
   - 缩小到24px时仍能识别轮廓
   - 放大到96px时不模糊

4. **状态对比度**
   - 未选中 vs 选中状态的对比度 ≥ 4.5:1
   - 颜色差异明显（灰 vs 品牌）
   - 形状可以有微妙变化（如填充）

#### **❌ 应避免的问题：**

- 过于复杂的细节（< 1px的线条）
- 不对称的构图
- 使用超过3种颜色
- 过大的圆角或过小的间距
- 模糊的边缘或锯齿

---

## 二、技术规格

### 2.1 核心参数表

| 参数 | 规格 | 允许偏差 |
|------|------|----------|
| **视图尺寸（ViewBox）** | 48×48 px | ±0 px |
| **输出尺寸（PNG）** | 81×81 px (@3x) 或 96×96 px (@2x) | 推荐@3x |
| **基础网格单元** | 4 px | - |
| **主描边宽度** | 2 px (normal) / 2.5 px (active) | ±0 px |
| **辅助线宽** | 1-1.5 px | ±0 px |
| **端点样式** | Round (圆角) | 必须 |
| **连接样式** | Round (圆角) | 必须 |
| **最小圆角半径** | 2 px | - |
| **最大圆角半径** | 8 px | - |

### 2.2 网格系统图示

```
48×48 画布 (基于4px网格)
┌─────────────────────────────────┐
│ · · · · · · · · · · · · · │  0px
│ · ┌─────────────────────· · │  4px
│ · │                     │ · │  8px
│ · │    图标绘制区域      │ · │ 12px
│ · │     (24×24 核心)     │ · │ 16px
│ · │                     │ · │ 20px
│ · └─────────────────────· · │ 24px
│ · · · · · · · · · · · · · │ 28px
│                                 │
│ · · · · · · · · · · · · · │ 32px
│                                 │
│ · · · · · · · · · · · · · │ 36px
│                                 │
│ · · · · · · · · · · · · · │ 40px
│                                 │
└─────────────────────────────────┘  44px
                                  48px
```

**关键对齐规则：**
- 图标主体应居中在 24×24 的核心区域内
- 四周保留至少 12px 的安全边距（用于触摸反馈）
- 所有元素应落在网格交叉点上（4的倍数）

### 2.3 分辨率适配策略

微信小程序的TabBar在不同设备上的显示逻辑：

| 设备类型 | 屏幕密度 | 推荐图标尺寸 | 缩放比例 |
|---------|----------|--------------|----------|
| **普通手机** | @2x | 96×96 px | 200% |
| **高清屏** | @3x | 144×144 px | 300% |
| **iPad** | @2x | 96×96 px | 200% |

**最佳实践：提供 @3x (144px) 高清版本**

---

## 三、图标清单

### 3.1 图标总览

本系统共包含 **8个图标文件**（4个Tab × 2种状态）：

| Tab名称 | 功能页面 | Normal状态 | Active状态 | 设计隐喻 |
|---------|---------|------------|-----------|----------|
| **首页** | pages/index/index | home-normal.svg | home-active.svg | 房子/家 |
| **药品** | pages/medication/medication | medication-normal.svg | medication-active.svg | 药丸/胶囊 |
| **记录** | pages/records/records | records-normal.svg | records-active.svg | 文档/列表 |
| **我的** | pages/profile/profile | profile-normal.svg | profile-active.svg | 用户头像 |

### 3.2 各图标详细说明

#### **图标 #1：首页 (Home)**

**文件位置：**
- Normal: `images/tabbar/home-normal.svg`
- Active: `images/tabbar/home-active.svg`

**设计描述：**
- **形状：** 房屋造型（屋顶 + 主体 + 门）
- **Normal状态：** 仅轮廓线（2px #9CA3AF）
- **Active状态：** 
  - 房屋主体半透明绿色填充（opacity: 0.15）
  - 门完全填充（opacity: 0.9）
  - 外圈淡绿色光晕（radius: 16px, opacity: 0.1）

**视觉重量：** 中等  
**复杂度：** 低（简单几何）  
**识别难度：** 极低（通用符号）

---

#### **图标 #2：药品 (Medication)**

**文件位置：**
- Normal: `images/tabbar/medication-normal.svg`
- Active: `images/tabbar/medication-active.svg`

**设计描述：**
- **形状：** 胶囊/药丸（圆角矩形 + 中间分割线）
- **Normal状态：** 轮廓 + 分割线（2px #9CA3AF）
- **Active状态：**
  - 药丸整体填充（opacity: 0.9）
  - 分割线变为白色（模拟真实药丸）
  - 外围椭圆形光晕（增强医疗感）

**视觉重量：** 中等  
**复杂度：** 低  
**识别难度：** 低（医药领域通用符号）

**特殊处理：**
- 高光线条（顶部1.5px细线）增加立体感
- 选中态的分割线用白色而非深色，更符合真实药丸外观

---

#### **图标 #3：记录 (Records)**

**文件位置：**
- Normal: `images/tabbar/records-normal.svg`
- Active: `images/tabbar/records-active.svg`

**设计描述：**
- **形状：** 文档/列表（矩形 + 内容行）
- **Normal状态：** 文档框 + 3行内容线（2px #9CA3AF）
- **Active状态：**
  - 文档主体浅绿填充（opacity: 0.15）
  - 标题栏加深填充（opacity: 0.25）
  - 3条内容行变为实心条（不同透明度）
  - **右下角添加圆形勾选标记**（表示"已完成/有记录"）

**视觉重量：** 中等偏高  
**复杂度：** 中等（多元素组合）  
**识别难度：** 低（办公类通用符号）

**特色功能：**
- 勾选标记（checkmark）是active状态的独特标识
- 圆形背景 + 对勾 = "数据已记录"的语义强化

---

#### **图标 #4：我的 (Profile)**

**文件位置：**
- Normal: `images/tabbar/profile-normal.svg`
- Active: `images/tabbar/profile-active.svg`

**设计描述：**
- **形状：** 用户头像（头部圆圈 + 身体弧线）
- **Normal状态：** 纯轮廓（2px #9CA3AF）
- **Active状态：**
  - 头部圆圈填充（opacity: 0.9）+ 高光效果
  - 身体弧线区域浅色填充（opacity: 0.15）
  - 大范围外围光晕（radius: 20px, opacity: 0.08）

**视觉重量：** 轻（线条简洁）  
**复杂度：** 低（抽象人形）  
**识别难度：** 极低（全球通用的用户图标）

**设计考量：**
- 采用经典的"头+肩"剪影造型（非全脸）
- 更具普适性（不限定性别、年龄等特征）
- Active态的头像高光增加"已登录"的真实感

---

## 四、色彩系统

### 4.1 主色调定义

| 色彩角色 | 色值 | 用途 | 说明 |
|----------|------|------|------|
| **Brand Primary (品牌主色)** | `#059669` | Active状态主色 | 深绿色，专业可信 |
| **Brand Light (品牌浅色)** | `#34D399` | 渐变结束色 | 浅绿色，活力 |
| **Neutral Gray (中性灰)** | `#9CA3AF` | Normal状态默认色 | 中性灰，不抢眼 |
| **White (纯白)** | `#FFFFFF` | 高光、分割线 | 用于细节强调 |

### 4.2 透明度阶梯（Opacity Scale）

针对不同的视觉层次，使用标准化的透明度值：

| 层级 | 透明度 | 应用场景 | 示例 |
|------|--------|----------|------|
| **Level 0 - 微妙** | 10% (0.1) | 外发光、大范围背景光晕 | `.opacity-10` |
| **Level 1 - 轻量** | 15% (0.15) | 主体区域填充 | `.fill-subtle` |
| **Level 2 - 中等** | 20% (0.25) | 强调区域填充 | `.fill-medium` |
| **Level 3 - 明显** | 40% (0.4) | 辅助装饰元素 | `.accent` |
| **Level 4 - 强烈** | 60% (0.6) | 重要元素的辅助层 | `.strong-accent` |
| **Level 5 - 实心** | 90% (0.9) | 核心实体填充 | `.solid` |

**使用示例：**
```css
/* Active状态的标准配色 */
.icon-active {
  /* 主体填充 - Level 2 */
  fill: #059669;
  opacity: 0.9;        /* .solid */
  
  /* 区域背景 - Level 1 */
  background: #059669;
  opacity: 0.15;       /* .fill-subtle */
  
  /* 外发光 - Level 0 */
  box-shadow: 0 0 20px rgba(5,150,105,0.1);  /* .glow */
}
```

### 4.3 无障碍色彩对比度

确保所有状态都符合WCAG 2.0 AA级标准：

| 组合 | 对比度 | 达标等级 | 说明 |
|------|--------|----------|------|
| **Normal (#9CA3AF) on White (#FFF)** | 3.2:1 | ❌ AA未达标 | 需依赖背景 |
| **Active (#059669) on White (#FFF)** | 4.6:1 | ✅ AA达标 | 清晰可见 |
| **Active (#059669) on Light Green (#F0FDF4)** | 7.2:1 | ✅ AAA达标 | 极佳 |

**建议：** 页面背景使用浅绿色 (#F0FDF4) 以提升整体对比度

---

## 五、SVG源文件说明

### 5.1 文件结构

所有SVG源文件位于：
```
f:\吃药提醒小程序\images\tabbar\
  ├── home-normal.svg          ← 首页-未选中
  ├── home-active.svg          ← 首页-选中
  ├── medication-normal.svg    ← 药品-未选中
  ├── medication-active.svg    ← 药品-选中
  ├── records-normal.svg       ← 记录-未选中
  ├── records-active.svg       ← 记录-选中
  ├── profile-normal.svg       ← 我的-未选中
  └── profile-active.svg       ← 我的-选中
```

### 5.2 SVG代码规范

每个SVG文件遵循以下代码规范：

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
  <!-- 
    ══════════════════════════════════
    元数据块（每个文件必须有）
    ══════════════════════════════════
  -->
  
  <!-- 图标名称、版本、风格 -->
  <!-- 设计参数：尺寸、颜色、描边 -->
  
  <!-- 
    ══════════════════════════════════
    图层顺序（从下到上渲染）
    ══════════════════════════════════
  -->
  
  <!-- Layer 1: 背景效果（发光、渐变） -->
  <!-- Layer 2: 主体形状（填充区域） -->
  <!-- Layer 3: 细节元素（高光、纹理） -->
  <!-- Layer 4: 轮廓线条（描边） -->
</svg>
```

### 5.3 SVG属性标准

```xml
<!-- 正确示例 -->
<svg 
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 48 48"           <!-- 固定视图尺寸 -->
  fill="none"                   <!-- 默认无填充 -->
>

<!-- 路径元素 -->
<path 
  d="M..."                      <!-- 路径数据 -->
  stroke="#9CA3AF"             <!-- 颜色值（必须使用hex） -->
  stroke-width="2"              <!-- 描边宽度（整数或.5） -->
  stroke-linecap="round"        <!-- 必须为round -->
  stroke-linejoin="round"      <!-- 必须为round -->
  fill="none"                  <!-- 或指定填充色 -->
/>

<!-- 形状元素 -->
<rect/circle/ellipse/...
  rx="4"                       <!-- 圆角半径（≥2且≤8）"/>
/>
```

### 5.4 注释规范

每个SVG文件的注释应包含：

```xml
<!--
  TabBar Icon: [名称] ([中文])
  Design System: Modern Linear Icons v2.0
  Style: [Outline/Filled] ([状态])
  Color: [色值]
  Size: 48x48px, Stroke: [X]px
  Grid: 24x24 base unit
  Designer: [AI/UI Designer Name]
  Date: [YYYY-MM-DD]
  Version: [X.X]
-->
```

---

## ⚠️ 六、PNG导出指南（关键！）

### 6.1 为什么需要PNG？

**微信小程序TabBar的限制：**
- ❌ **不支持SVG格式**（只能用PNG/JPEG）
- ❌ **不支持字体图标**（Icon Font）
- ❌ **不支持CSS控制**（无法动态改色）
- ✅ **仅支持静态图片**（PNG @2x/@3x）

因此，**必须将SVG转换为PNG**才能在实际项目中使用！

### 6.2 推荐导出工具

#### **工具A：Figma（推荐⭐⭐⭐⭐⭐）**

如果已有Figma项目：

1. 导入SVG文件到Figma画板
2. 选择图层 → Export
3. 设置参数（见下文6.3节）
4. 导出为PNG

**优点：** 可视化操作、批量导出、精准控制

---

#### **工具B：Adobe Illustrator（专业级）⭐⭐⭐⭐**

适合矢量图形专业人员：

1. 打开SVG文件
2. File → Export → Export As → PNG
3. 配置分辨率和选项
4. 导出

**优点：** 工业标准、完美质量

---

#### **工具C：在线转换器（快速）⭐⭐⭐**

推荐网站：

1. **CloudConvert** (cloudconvert.com)
   - 上传SVG → 选择PNG → 下载
   
2. **SVGOMG** (svgomg.com)
   - 支持批量转换、自定义尺寸

3. **Vector Magic** (vectormagic.com)
   - 在线编辑器 + 导出

**优点：** 无需安装软件、速度快

---

#### **工具D：命令行工具（自动化）⭐⭐⭐⭐**

适合开发者批量处理：

##### **使用 Inkscape（免费开源）：**

```bash
# 安装 Inkscape
# Windows: 下载安装包 https://inkscape.org/
# Mac: brew install --cask inkscape
# Linux: sudo apt-get install inkscape

# 单个文件转换
inkscape input.svg --export-filename=output.png -w 144 -h 144

# 批量转换（Linux/Mac）
for file in *.svg; do
  inkscape "$file" --export-filename="${file%.svg}.png" -w 144 -h 144
done
```

##### **使用 ImageMagick：**

```bash
# 安装 ImageMagick
# Windows: 下载安装包
# Mac: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# 转换（需先安装rsvg delegate）
convert -background none -density 300 input.svg output.png
```

##### **使用 Sharp (Node.js)：**

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng(svgPath, outputPath, size = 144) {
  const svgBuffer = fs.readFileSync(svgPath);
  
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outputPath);
    
  console.log(`✅ Converted: ${svgPath} → ${outputPath}`);
}

// 批量转换
const svgFiles = [
  'home-normal.svg',
  'home-active.svg',
  // ... 其他文件
];

Promise.all(svgFiles.map(file => 
  convertSvgToPng(
    path.join(__dirname, 'tabbar', file),
    path.join(__dirname, 'tabbar', `${file}.png`)
  )
));
```

---

### 6.3 导出参数配置

#### **推荐设置（@3x高清版）：**

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| **输出尺寸** | **144×144 px** | @3x for Retina屏 |
| **DPI/PPI** | **288** | 3倍标准DPI(96) |
| **背景色** | **Transparent (RGBA)** | 透明背景 |
| **抗锯齿** | **开启 (Anti-aliased)** | 平滑边缘 |
| **颜色空间** | **sRGB** | 标准屏幕色彩 |
| **压缩质量** | **100 (无损)** | PNG是无损格式 |

#### **备选设置（@2x兼容版）：**

| 参数 | 备选值 | 适用场景 |
|------|--------|----------|
| **输出尺寸** | **96×96 px** | 普通屏幕 |
| **DPI/PPI** | **192** | 2倍标准DPI |
| **适用设备** | Android中低端机型 | 兼容性好 |

#### **特殊注意事项：**

1. **不要添加额外边距**
   - 导出时应裁剪到内容边界
   - 或保持48px viewbox的原始比例

2. **保持透明通道（Alpha Channel）**
   - PNG必须支持透明背景
   - 否则会出现白底方块

3. **避免过度压缩**
   - PNG本身是无损压缩
   - 不要再用JPEG二次压缩

4. **文件大小限制**
   - 单个图标 < 50KB
   - 总计 < 200KB（4个图标 × 2状态）

---

### 6.4 自动化脚本（推荐使用）

我为你准备了一个**一键转换脚本**：

```javascript
// 📄 scripts/convert-tabbar-icons.js
// 用法：node scripts/convert-tabbar-icons.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  inputDir: './images/tabbar',      // SVG源目录
  outputDir: './images',          // 输出目录（根目录images）
  size: 144,                    // 输出尺寸(px)
  icons: [
    { name: 'home', states: ['normal', 'active'] },
    { name: 'medication', states: ['normal', 'active'] },
    { name: 'records', states: ['normal', 'active'] },
    { name: 'profile', states: ['normal', 'active'] }
  ]
};

async function main() {
  console.log('🎨 开始转换 TabBar 图标...\n');
  
  // 确保输出目录存在
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (const icon of CONFIG.icons) {
    for (const state of icon.states) {
      const inputName = `${icon.name}-${state}.svg`;
      const outputName = `${icon.name}${state === 'active' ? '-active' : ''}.png`;
      
      const inputPath = path.join(CONFIG.inputDir, inputName);
      const outputPath = path.join(CONFIG.outputDir, outputName);
      
      try {
        if (!fs.existsSync(inputPath)) {
          throw new Error(`Source file not found: ${inputPath}`);
        }
        
        const svgBuffer = fs.readFileSync(inputPath);
        
        await sharp(svgBuffer)
          .resize(CONFIG.size, CONFIG.size)
          .png()
          .toFile(outputPath);
        
        console.log(`  ✅ ${inputName} → ${outputName} (${CONFIG.size}×${CONFIG.size}px)`);
        successCount++;
        
      } catch (error) {
        console.error(`  ❌ Failed: ${inputName}`, error.message);
        failCount++;
      }
    }
  }
  
  console.log(`\n🎉 转换完成！成功: ${successCount}, 失败: ${failCount}`);
  console.log(`📍 输出目录: ${path.resolve(CONFIG.outputDir)}`);
}

main().catch(console.error);
```

**使用方法：**
```bash
# 1. 安装依赖
npm install sharp

# 2. 运行脚本
node scripts/convert-tabbar-icons.js

# 3. 检查输出
ls -lh images/*.png
```

---

## 七、配置集成步骤

### 7.1 准备工作

**前置条件检查清单：**
- [ ] 已将所有SVG转换为PNG（见第六章）
- [ ] PNG文件位于正确的路径：`images/`
- [ ] 文件命名正确：
  - `home.png` (首页-未选中)
  - `home-active.png` (首页-选中)
  - `medication.png` (药品-未选中)
  - `medication-active.png` (药品-选中)
  - `records.png` (记录-未选中)
  - `records-active.png` (记录-选中)
  - `profile.png` (我的-未选中)
  - `profile-active.png` (我的-选中)

### 7.2 更新 app.json 配置

修改 `app.json` 中的 tabBar 配置：

```json
{
  "tabBar": {
    "color": "#9CA3AF",              // 未选中文字颜色（中性灰）
    "selectedColor": "#059669",      // 选中文字颜色（品牌绿）
    "borderStyle": "white",         // 分隔线样式（白色更轻盈）
    "backgroundColor": "#FFFFFF",    // 背景色（纯白）
    "position": "bottom",           // 位置（底部）
    "custom": false,                // 是否自定义（false=系统原生）
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "images/home.png",
        "selectedIconPath": "images/home-active.png"
      },
      {
        "pagePath": "pages/medication/medication",
        "text": "药品",
        "iconPath": "images/medication.png",
        "selectedIconPath": "images/medication-active.png"
      },
      {
        "pagePath": "pages/records/records",
        "text": "记录",
        "iconPath": "images/records.png",
        "selectedIconPath": "images/records-active.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的",
        "iconPath": "images/profile.png",
        "selectedIconPath": "images/profile-active.png"
      }
    ]
  }
}
```

**关键配置说明：**

| 配置项 | 推荐值 | 原因 |
|--------|--------|------|
| **color** | `#9CA3AF` | 与Normal状态图标颜色一致 |
| **selectedColor** | `#059669` | 与Active状态图标颜色一致 |
| **borderStyle** | `white` | 白色分隔线更现代（black太重） |
| **backgroundColor** | `#FFFFFF` | 纯白背景配合图标 |

### 7.3 验证集成结果

**在微信开发者工具中：**

1. **编译运行** 项目
2. **查看底部TabBar**：
   - ✅ 显示4个新图标
   - ✅ 未选中状态显示灰色线性图标
   - ✅ 选中状态显示绿色填充图标
   - ✅ 图标清晰无模糊
   - ✅ 尺寸合适（不过大也不过小）

3. **测试切换交互**：
   - 点击各Tab查看切换效果
   - 确认图标状态正确变化
   - 检查是否有视觉跳动

---

## 八、质量检查清单

### 8.1 技术质量检查

- [ ] **文件格式正确**
  - [ ] PNG格式（不是JPG/GIF/BMP）
  - [ ] 支持透明通道（Alpha Channel）
  - [ ] RGB色彩模式（不是CMYK/索引色）

- [ ] **尺寸规格达标**
  - [ ] 输出尺寸 ≥ 96×96 px (@2x)
  - [ ] 推荐 144×144 px (@3x)
  - [ ] 宽高比 1:1（正方形）

- [ ] **视觉质量**
  - [ ] 无明显锯齿（Anti-aliased）
  - [ ] 边缘清晰锐利
  - [ ] 无意外杂色或噪点
  - [ ] 透明背景纯净

- [ ] **文件体积合理**
  - [ ] 单个文件 < 50KB
  - [ ] 总计 < 200KB
  - [ ] 无嵌入不需要的元数据

### 8.2 设计质量检查

- [ ] **一致性**
  - [ ] 4个Normal状态图标视觉重量相同
  - [ ] 4个Active状态图标视觉重量相同
  - [ ] 描边宽度统一（2px / 2.5px）
  - [ ] 圆角大小协调

- [ ] **辨识度**
  - [ ] 每个图标含义明确
  - [ ] 不会与其他图标混淆
  - [ ] 缩小后仍可识别
  - [ ] 符合用户心智模型

- [ ] **状态区分**
  - [ ] Normal vs Active 对比明显
  - [ ] 颜色差异显著（灰 vs 绿）
  - [ ] 形状有微妙变化（填充/新增元素）
  - [ ] 选中状态有"激活"的感觉

### 8.3 用户体验检查

- [ ] **触控目标**
  - [ ] 图标点击区域足够大（≥ 44×44 px）
  - [ ] 图标与文字间距适中
  - [ ] 不会误触相邻Tab

- [ ] **视觉舒适度**
  - [ ] 不刺眼（无过高饱和度）
  - [ ] 不暗淡（对比度足够）
  - [ ] 与页面整体风格协调
  - [ ] 长时间观看不疲劳

- [ ] **品牌传达**
  - [ ] 体现医疗健康主题
  - [ ] 传递专业可信感觉
  - [ ] 有记忆点和独特性
  - [ ] 符合目标用户审美

---

## 九、使用规范与最佳实践

### 9.1 图标使用禁忌

#### **❌ 禁止的操作：**

1. **禁止拉伸变形**
   ```css
   /* 错误 */
   .tab-icon {
     width: 100%;  /* 会拉伸变形 */
     height: auto;
   }
   
   /* 正确 */
   .tab-icon {
     width: 48rpx;
     height: 48rpx;
   }
   ```

2. **禁止修改颜色**
   - 不要通过CSS filter改变图标颜色
   - 不要叠加半透明色层
   - 保持原始设计的色彩准确性

3. **禁止添加滤镜**
   - 不要使用 blur、grayscale 等滤镜
   - 不要调整 brightness/contrast
   - 保持图标清晰锐利

4. **禁止旋转或翻转**
   - 不要 transform: rotate()
   - 不要 scale(-1, 1) 左右翻转
   - 保持图标的正向性

#### **⚠️ 需谨慎的操作：**

1. **尺寸调整（仅在必要时）**
   ```css
   /* 如果确实需要调整 */
   .tab-icon {
     width: 56rpx;  /* 最大不超过原尺寸的120% */
     height: 56rpx;
   }
   
   /* 建议：使用transform缩放而非直接改width */
   .tab-icon {
     transform: scale(1.15);  /* 相对缩放，保持清晰度 */
   }
   ```

2. **透明度调整（仅在特殊场景）**
   ```css
   /* 禁用状态的图标可以稍微淡化 */
   .tab-item.disabled .tab-icon {
     opacity: 0.4;  /* 但不建议低于0.3 */
   }
   ```

### 9.2 维护与更新流程

#### **版本管理建议：**

```
images/tabbar/                    ← SVG源文件（版本控制）
  ├── home-normal.svg            ← Git追踪
  ├── home-active.svg
  ...
  
scripts/                        ← 转换脚本
  └── convert-tabbar-icons.js
  
images/                         ← PNG输出（可选Git LFS）
  ├── home.png                 ← 生成文件
  ├── home-active.png
  ...
```

**推荐工作流：**
1. **编辑SVG源文件**（使用文本编辑器或设计工具）
2. **运行转换脚本**生成新的PNG
3. **测试验证**在真机上的显示效果
4. **提交Git**（只提交SVG，PNG可通过CI自动生成）

#### **更新图标时的Checklist：**

- [ ] 同时更新 Normal 和 Active 两个状态
- [ ] 保持新旧版本的视觉连贯性
- [ ] 更新此文档的版本号和日期
- [ ] 通知团队成员图标变更
- [ ] 在测试设备上验证所有状态

### 9.3 性能优化建议

#### **图片加载优化：**

虽然TabBar图标由系统缓存，但仍可注意：

1. **预加载关键图标**
   ```javascript
   // 在app.js中
   wx.preloadPage({
     url: '/pages/index/index'  // 预加载首页及其TabBar图标
   });
   ```

2. **使用CDN加速（如果有条件）**
   - 将图标上传至CDN
   - 在app.json中使用网络路径
   - 适用于大型小程序

3. **监控图标加载性能**
   ```javascript
   // 监控首屏加载时间
   if (wx.getPerformance) {
     wx.getPerformance().entry({
       type: 'render'
     }).then(res => {
       console.log('TabBar render time:', res.duration);
     });
   }
   ```

### 9.4 未来扩展预留

当前设计为4个Tab，但系统已考虑扩展性：

#### **新增第5个Tab时：**

只需重复以下步骤：
1. 设计新图标（遵循本规范）
2. 创建 normal + active 两个SVG
3. 转换为PNG
4. 在 app.json 的 list 数组中添加配置

**设计约束：**
- 最多支持 **5个Tab**（微信限制）
- 图标数量 = Tab数量 × 2（normal + active）
- 保持所有图标的视觉重量一致

#### **适配Dark Mode（未来）：**

如果未来支持暗黑模式，可准备第三套图标：

| 状态 | 当前 | 未来(Dark Mode) |
|------|------|------------------|
| **Normal** | #9CA3AF (灰) | #6B7280 (深灰) |
| **Active** | #059669 (绿) | #34D399 (亮绿) |

---

## 附录

### A. 快速参考卡片

**色彩速查：**
```
Normal:  #9CA3AF (Gray-400)
Active:  #059669 (Emerald-600)
Background: #FFFFFF (White)
Border:   #E5E7EB (Gray-200)
```

**尺寸速查：**
```
ViewBox:  48×48 px
Grid:     24×24 unit (4px each)
Stroke:   2px (normal) / 2.5px (active)
Radius:   4-8px
Output:   144×144 px (@3x) 推荐
```

**文件命名：**
```
{tabname}-{state}.{ext}
例: home-normal.svg, home-active.png
```

### B. 问题排查指南

**Q1: 图标显示模糊？**
→ 检查是否使用了@3x（144px）版本
→ 确认没有在CSS中强制放大

**Q2: 图标有白底？**
→ 检查PNG是否保留了透明通道
→ 重新导出时确保背景透明

**Q3: 图标颜色不对？**
→ 确认使用的是正确的文件名
→ 检查app.json中的路径配置

**Q4: 切换时有闪烁？**
→ 正常现象（图片替换）
→ 如频繁闪烁，检查网络状况

**Q5: 不同设备显示不一致？**
→ 提供@2x和@3x两套资源
→ 让系统自动选择

### C. 相关工具与资源

**设计工具：**
- Figma (figma.com) - 协作设计
- Sketch (sketch.com) - Mac原生
- Adobe Illustrator (adobe.com) - 专业矢量

**在线转换：**
- CloudConvert (cloudconvert.com)
- SVGOMG (svgomg.com)
- Vector Magic (vectormagic.com)

**命令行工具：**
- Inkscape (inkscape.org) - 开源免费
- ImageMagick (imagemagick.org) - 强大全面
- Sharp (sharp.pixelplum.com) - Node.js库

**图标灵感库：**
- Feather Icons (feathericons.com) - 线性图标
- Phosphor Icons (phosphoricons.com) - iOS风格
- Material Symbols (fonts.google.com/icons) - Google官方
- Heroicons (heroicons.com) - Tailwind CSS团队

---

**文档结束**

*本规范由AI UI Design System自动生成*
*遵循 Modern Linear Icons v2.0设计语言*
*适用于微信小程序TabBar图标系统*

**版本历史：**
- v1.0 (2024-01): 初始版本，基础线性图标
- v2.0 (2026-05-05): 全面升级，Material Design 3风格

**下次更新：** 当品牌升级或设计趋势重大变化时
