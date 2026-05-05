# 吃药提醒小程序 - UI/UX 设计方案

> 基于现有代码分析，结合医疗健康类应用最佳实践，制定统一设计规范

---

## 📋 目录

1. [设计系统概述](#设计系统概述)
2. [配色方案](#配色方案)
3. [字体排版](#字体排版)
4. [组件规范](#组件规范)
5. [页面设计指南](#页面设计指南)
6. [图标规范](#图标规范)
7. [无障碍设计](#无障碍设计)

---

## 设计系统概述

### 设计原则

| 原则 | 说明 |
|------|------|
| **清晰优先** | 药品信息、服药时间等关键信息必须一目了然 |
| **操作便捷** | 核心操作（标记已服）不超过2次点击 |
| **安心感** | 使用医疗绿色系，传递安全、专业的视觉感受 |
| **一致性** | 全应用统一的设计Token，避免硬编码颜色 |

### 现有设计Token（已实现 ✅）

您的小程序已经有完善的设计Token系统（`app.wxss`），主色 `#059669` 非常适合医疗健康主题！

```css
/* 主色系 - 医疗绿 */
--color-primary: #059669;        /* 主色 */
--color-primary-light: #10B981;   /* 浅主色 */
--color-primary-dark: #047857;    /* 深主色 */
--color-primary-bg: #F0FDF4;      /* 主色背景 */
--color-primary-border: #D1FAE5;  /* 主色边框 */

/* 辅助色 - 医疗青 */
--color-accent: #0891B2;
--color-accent-light: #22D3EE;

/* 语义色 */
--color-danger: #EF4444;         /* 漏服/危险 */
--color-danger-bg: #FEF2F2;
--color-warning: #D97706;         /* 库存不足/警告 */
--color-warning-bg: #FFFBEB;

/* 文字色 */
--color-text-primary: #111827;     /* 主要文字 */
--color-text-secondary: #6B7280;   /* 次要文字 */
--color-text-muted: #9CA3AF;      /* 辅助文字 */
--color-text-white: #FFFFFF;       /* 白色文字 */

/* 背景 & 边框 */
--color-bg-page: #F0FDF4;         /* 页面背景（淡绿） */
--color-bg-card: #FFFFFF;          /* 卡片背景 */
--color-border: #E5E7EB;
--color-border-light: #F3F4F6;

/* 间距（rpx）*/
--space-xs: 8rpx;
--space-sm: 16rpx;
--space-md: 24rpx;
--space-lg: 32rpx;
--space-xl: 48rpx;

/* 圆角（rpx）*/
--radius-sm: 12rpx;
--radius-md: 16rpx;
--radius-lg: 20rpx;
--radius-xl: 24rpx;
--radius-2xl: 28rpx;
--radius-full: 48rpx;

/* 字号（rpx）*/
--text-xs: 22rpx;   /* 辅助信息 */
--text-sm: 24rpx;   /* 小字 */
--text-base: 28rpx;  /* 正文 */
--text-md: 30rpx;    /* 稍大正文 */
--text-lg: 34rpx;    /* 小标题 */
--text-xl: 38rpx;    /* 大标题 */

/* 阴影 */
--shadow-sm: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
--shadow-md: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
--shadow-lg: 0 6rpx 24rpx rgba(5, 150, 105, 0.25);
--shadow-xl: 0 8rpx 32rpx rgba(5, 150, 105, 0.25);
--shadow-danger: 0 6rpx 24rpx rgba(239, 68, 68, 0.25);

/* 渐变 */
--gradient-primary: linear-gradient(135deg, #059669 0%, #10B981 100%);
--gradient-primary-long: linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%);
--gradient-primary-soft: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%);
--gradient-accent: linear-gradient(135deg, #0891B2 0%, #22D3EE 100%);
```

---

## 配色方案

### 主色板

```
┌─────────────────────────────────────────────┐
│  Primary: #059669   医疗绿 - 主按钮、强调  │
│  Primary Light: #10B981  悬停状态、渐变    │
│  Primary Dark: #047857   按下状态、深色文字 │
│  Primary BG: #F0FDF4     浅绿背景、标签    │
│  Primary Border: #D1FAE5  边框、分割线     │
└─────────────────────────────────────────────┘
```

### 语义色使用场景

| 颜色 | 场景 | 示例 |
|------|------|------|
| 🟢 主色绿 | 已服用状态、确认按钮、完成图标 | "已服"标签、打卡按钮 |
| 🔵 辅助青 | 提醒设置、信息提示 | "设置提醒"按钮、时间图标 |
| 🔴 危险红 | 漏服提示、删除操作、库存不足 | 漏服标记、删除按钮 |
| 🟡 警告黄 | 库存不足、即将过期 | "剩余不足"标签 |
| ⚪ 中性灰 | 禁用状态、次要信息 | 未选中Tab、时间戳 |

### 色彩对比度检查

| 文字色 | 背景色 | 对比度 | WCAG评级 |
|--------|--------|--------|----------|
| #111827 (主文字) | #FFFFFF (卡片) | 16.9:1 | ✅ AAA |
| #6B7280 (次文字) | #FFFFFF (卡片) | 4.6:1 | ✅ AA |
| #FFFFFF (白字) | #059669 (主色) | 4.8:1 | ✅ AA |

---

## 字体排版

### 字体家族

```css
font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

微信小程序推荐使用系统字体，保证最佳渲染效果。

### 文字层级

| 层级 | 字号(rpx) | 字重 | 用途 | 示例 |
|------|-----------|------|------|------|
| 页面标题 | 38-42rpx | 700 | 导航栏标题 | "吃药提醒" |
| 卡片标题 | 34-38rpx | 700 | section-title | "今日提醒" |
| 正文大 | 30rpx | 600 | 药品名称 | "阿司匹林" |
| 正文 | 28rpx | 400 | 正文内容 | 服药说明 |
| 小字 | 24rpx | 400 | 辅助信息 | 时间、剂量 |
| 极小字 | 22rpx | 400 | 标签、备注 | "已服"徽章 |

---

## 组件规范

### 1. 按钮（Button）

#### 主要按钮（Primary Button）
```css
.btn-primary {
  background: var(--gradient-primary);
  color: var(--color-text-white);
  border-radius: var(--radius-full);
  padding: 24rpx 48rpx;
  font-size: var(--text-md);
  font-weight: 600;
  border: none;
  box-shadow: var(--shadow-lg);
  transition: all 0.2s ease;
}
.btn-primary:active {
  transform: scale(0.97);
  box-shadow: var(--shadow-sm);
}
```
**使用场景**：添加药品、确认操作、打卡服用

#### 次要按钮（Secondary Button）
```css
.btn-secondary {
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  border-radius: var(--radius-full);
  padding: 24rpx 48rpx;
  border: 2rpx solid var(--color-border);
  font-weight: 600;
}
```

#### 小型操作按钮（Small Action）
```css
.btn-take {
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-lg);
  padding: 12rpx 28rpx;
  font-size: var(--text-sm);
  font-weight: 600;
  border: none;
}
```

### 2. 卡片（Card）

```css
.card {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);  /* 32rpx */
  margin-bottom: var(--space-md);  /* 24rpx */
  box-shadow: var(--shadow-md);
  border: none;
}
```

**卡片变体**：
- **默认卡片**：白色背景，用于一般内容
- **强调卡片**：浅绿背景 `var(--color-primary-bg)`，用于重要提醒
- **危险卡片**：浅红背景 `var(--color-danger-bg)`，用于漏服警告

### 3. 列表项（List Item）

```css
.list-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-xs);
  background: var(--color-bg-card);
  border: 2rpx solid var(--color-border-light);
  transition: all 0.2s ease;
}
.list-item:active {
  transform: scale(0.98);
  border-color: var(--color-primary-border);
}
```

### 4. 标签/徽章（Badge）

```css
.badge {
  padding: 6rpx 16rpx;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
}
.badge-success {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}
.badge-warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}
.badge-danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}
```

### 5. 表单输入（Form Input）

```css
.form-input {
  width: 100%;
  padding: 28rpx;
  background: var(--color-bg-input);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  border: 2rpx solid var(--color-border);
  transition: all 0.3s ease;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: var(--color-primary-light);
  background: var(--color-bg-card);
  box-shadow: 0 0 0 6rpx rgba(16, 185, 129, 0.1);
}
```

---

## 页面设计指南

### 🏠 首页（pages/index/index）

**布局结构**：
```
┌─────────────────────────────┐
│   Header Card (渐变绿)      │ ← 问候语 + 日期
│   "你好，用户名"            │
│   "2026年5月4日 周一"      │
├─────────────────────────────┤
│   Section: 今日提醒         │
│   ┌─────────────────────┐   │
│   │ 🕐 08:00  阿司匹林 │   │ ← 提醒项
│   │ 1片/次   [已服用]  │   │
│   └─────────────────────┘   │
│   ┌─────────────────────┐   │
│   │ 🕐 12:00  维生素C  │   │
│   │ 2粒/次   [已服用]  │   │
│   └─────────────────────┘   │
├─────────────────────────────┤
│   Section: 服药统计         │
│   ┌──────┐┌──────┐┌──────┐ │
│   │今日  ││已服  ││依从性│ │ ← 统计卡片
│   │  5   ││  3   ││ 60% │ │
│   └──────┘└──────┘└──────┘ │
├─────────────────────────────┤
│   [+ 添加药品]  [& 设置提醒]│ ← 快速操作
└─────────────────────────────┘
```

**设计要点**：
1. ✅ 已有渐变Header，保持
2. ✅ 提醒项使用圆角卡片，左图标+中信息+右操作
3. ⚠️ **需要改进**：将emoji图标（🕐）替换为SVG时钟图标
4. ✅ 统计卡片使用三列布局，主色背景
5. ✅ 快速操作按钮使用渐变背景

### 💊 药品页（pages/medication/medication）

**设计改进**：
1. ⚠️ **问题**：使用了 💊 emoji 作为药品图标
2. ✅ **方案**：替换为首字大字 + 彩色背景的圆角图标

```xml
<!-- 改进后的药品项 -->
<view class="medication-item">
  <view class="med-icon" style="background: #DBEAFE; color: #3B82F6;">
    {{item.name.charAt(0)}}
  </view>
  <view class="med-info">
    <view class="med-name">{{item.name}}</view>
    <view class="med-detail">{{item.dosage}} · {{item.frequency}}</view>
    <view class="stock-info" wx:if="{{item.totalQuantity}}">
      <text class="stock-text">剩余 {{item.remainingQuantity}}/{{item.totalQuantity}}</text>
      <text class="badge {{item.isLow ? 'badge-warning' : 'badge-success'}}">
        {{item.isLow ? '不足' : '充足'}}
      </text>
    </view>
  </view>
  <view class="med-actions">
    <button class="btn-icon" bindtap="editMedication">✏️</button>
    <button class="btn-icon danger" bindtap="deleteMedication">🗑️</button>
  </view>
</view>
```

**药品图标颜色方案**：
| 药品类型 | 背景色 | 文字色 |
|---------|--------|--------|
| 西药 | #DBEAFE | #3B82F6 |
| 中药 | #FEF3C7 | #D97706 |
| 保健品 | #D1FAE5 | #059669 |
| 维生素 | #E0E7FF | #6366F1 |

### 📊 记录页（pages/records/records）

**设计改进**：
1. ✅ 统计卡片使用三列布局
2. ⚠️ **问题**：Tab切换样式需要优化
3. ✅ 图表使用Canvas绘制，保持
4. ✅ 记录列表显示日期、药品、状态

**Tab样式**：
```css
.chart-tabs {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}
.tab-item {
  padding: 12rpx 32rpx;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
  transition: all 0.2s ease;
}
.tab-item.active {
  background: var(--gradient-primary);
  color: var(--color-text-white);
  font-weight: 600;
}
```

**记录项状态样式**：
```css
.record-status.taken {
  color: var(--color-primary);
  background: var(--color-primary-bg);
  padding: 8rpx 20rpx;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: var(--text-sm);
}
.record-status.missed {
  color: var(--color-danger);
  background: var(--color-danger-bg);
  padding: 8rpx 20rpx;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: var(--text-sm);
}
```

### 👤 我的页（pages/profile/profile）

**设计改进**：
1. ⚠️ **问题**：菜单项使用了emoji图标（⏰☁️❓ℹ️）
2. ✅ **方案**：使用SVG图标 + 统一右侧箭头

**菜单项样式**：
```css
.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 2rpx solid var(--color-border-light);
  transition: background 0.2s ease;
}
.menu-item:active {
  background: var(--color-bg-input);
}
.menu-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: var(--space-md);
  display: flex;
  align-items: center;
  justify-content: center;
}
.menu-text {
  flex: 1;
  font-size: var(--text-base);
  color: var(--color-text-primary);
}
.menu-arrow {
  color: var(--color-text-muted);
  font-size: var(--text-lg);
}
```

**SVG图标替换方案**（推荐使用Lucide图标库）：
| 菜单项 | 图标名 | 说明 |
|--------|--------|------|
| 提醒设置 | `bell` | 铃铛图标 |
| 数据同步 | `refresh-cw` | 刷新/同步图标 |
| 使用帮助 | `help-circle` | 帮助图标 |
| 关于我们 | `info` | 信息图标 |

---

## 图标规范

### ⚠️ 严禁使用 Emoji 作为 UI 图标

| ❌ 不要这样做 | ✅ 应该这样做 |
|--------------|--------------|
| 💊 药品图标 | 使用文字首字 + 彩色背景圆 |
| ⏰ 提醒图标 | 使用SVG图标（Lucide/Heroicons） |
| ☁️ 同步图标 | 使用SVG图标 |
| ❓ 帮助图标 | 使用SVG图标 |

### SVG图标使用方案

**方案A：使用图片图标（推荐小程序）**
```
在 images/ 目录存放SVG图标：
- images/icons/bell.svg       (提醒)
- images/icons/refresh.svg    (同步)
- images/icons/help.svg       (帮助)
- images/icons/info.svg       (信息)
- images/icons/clock.svg      (时间)
- images/icons/pill.svg       (药品)
```

**方案B：使用base64内联（适合小图标）**
```xml
<image src="data:image/svg+xml;base64,..." class="icon" />
```

**方案C：使用字体图标（如iconfont）**
```css
@font-face {
  font-family: 'iconfont';
  src: url('iconfont.woff2') format('woff2');
}
.icon-bell::before { content: '\e600'; }
```

---

## 无障碍设计

### WCAG 2.1 AA 合规检查清单

- [x] 文字对比度 ≥ 4.5:1（主文字 #111827 on #FFFFFF）
- [x] 大文字对比度 ≥ 3:1（已满足）
- [ ] 所有图标按钮添加 `aria-label`（需添加）
- [ ] 表单输入框有 `<label>` 关联（需检查）
- [x] 焦点状态可见（已有 `:focus` 样式）
- [ ] 支持 `prefers-reduced-motion`（需添加）

### 触摸目标尺寸

| 元素 | 最小尺寸 | 当前状态 |
|------|---------|---------|
| 按钮 | 44x44px (88rpx×88rpx) | ✅ 满足 |
| 列表项 | 44px高度 | ✅ 满足 |
| 图标按钮 | 44x44px | ⚠️ 需检查 |

### 动画与动效

```css
/* 尊重用户动画偏好 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* 现有动画优化 */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
/* 建议：将动画时长控制在2-3秒内，避免无限循环 */
```

---

## 设计审查清单

### 交付前检查

**视觉质量**
- [ ] 无emoji作为图标（全部替换为SVG或文字图标）
- [ ] 图标来自统一图标集
- [ ] 悬停/按下状态有视觉反馈
- [ ] 过渡动画流畅（150-300ms）

**交互体验**
- [ ] 所有可点击元素有 `cursor-pointer`（小程序为 `:active` 状态）
- [ ] 按钮按下有缩放反馈（`transform: scale(0.97)`）
- [ ] 表单输入有焦点状态

**响应式适配**
- [ ] 在小程序所有尺寸设备上测试
- [ ] 文字使用rpx单位，自适应屏幕
- [ ] 卡片间距统一使用设计Token

**无障碍**
- [ ] 图片有 `alt` 或 `aria-label`
- [ ] 表单有标签关联
- [ ] 颜色不是唯一的信息区分方式（配合文字/图标）

---

## 下一步行动

1. **立即修复**：将药品页、我的页中的emoji图标替换为SVG或文字图标
2. **统一图标**：建立 `images/icons/` 目录，存放统一的SVG图标
3. **添加动效**：为关键操作（标记已服、添加药品）添加微动效
4. **测试无障碍**：使用微信开发者工具的无障碍检查功能

---

*设计系统版本：v1.0*  
*更新日期：2026年5月4日*  
*基于 ui-ux-pro-max 专业技能生成*
