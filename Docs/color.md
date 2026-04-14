# GuitarBoard 配色方案

来源：[Color Hunt Palette](https://colorhunt.co/palette/c0e1d2e5eee4f6f4e8dc9b9b)

## 基础色板

| 色值 | 名称 | 用途 |
|------|------|------|
| `#C0E1D2` | 薄荷绿 (Mint) | 边框、进度条轨道、品丝、五度圈空闲扇形 |
| `#E5EEE4` | 极浅绿 (Pale Mint) | 面板背景、指板背景、进度条背景、success-light、阶段横幅 metric pill |
| `#F6F4E8` | 暖米白 (Warm Cream) | 页面 body 背景 |
| `#DC9B9B` | 柔粉 (Dusty Rose) | accent（按钮、高亮目标、模式切换胶囊、五度圈当前音） |

## 派生色

| 色值 | 名称 | 用途 |
|------|------|------|
| `#C87E7E` | 深粉 | accent-strong（hover 状态、kicker 文字） |
| `#F5E6E6` | 极浅粉 | accent-light、error-light |
| `#6BAF92` | Sage Green | success（正确反馈、阶段完成 note pill、已找音名） |
| `#5A9A7E` | 深 Sage Green | success hover 状态 |
| `#8B9A8E` | 灰绿 | 次要文本 (text-muted)、muted 状态 |
| `#3D3D3D` | 柔黑 | 主文本 (text-main) |

## CSS 变量映射

```css
--text-main: #3D3D3D;
--text-muted: #8B9A8E;
--border: #C0E1D2;
--border-muted: #E5EEE4;
--panel: #E5EEE4;
--surface: #EAF0EA;
--accent: #DC9B9B;
--accent-strong: #C87E7E;
--accent-light: #F5E6E6;
--success: #6BAF92;
--success-light: #E5EEE4;
--error: #DC9B9B;
--error-light: #F5E6E6;
```
