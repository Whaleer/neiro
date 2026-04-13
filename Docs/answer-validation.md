
# 答题验证机制说明

## 整体流程

```
出题 → 用户在指板上看到高亮位置 → 用户点击音名按钮 → 比对答案 → 反馈
```

涉及的文件：
- `src/lib/music.ts` — 出题 & 计算正确音名
- `src/App.tsx` — 答题比对 & 状态管理

---

## 第一步：出题

`music.ts` 中的 `createQuestion()` 随机生成一道题：

```ts
export function createQuestion(): Question {
  const position = {
    stringIndex: Math.floor(Math.random() * 6),  // 随机选一根弦 (0-5)
    fretIndex: Math.floor(Math.random() * 13),    // 随机选一个品格 (0-12)
  }

  return {
    id: `${position.stringIndex}-${position.fretIndex}-${crypto.randomUUID()}`,
    position,
    correctNote: getNoteAtPosition(position),  // ← 在这一步算出正确答案
  }
}
```

生成结果是一个 `Question` 对象，包含弦索引、品格索引、以及**预先计算好的正确音名**。

---

## 第二步：计算正确音名

`getNoteAtPosition()` 根据弦的空弦音名 + 品格数，推算该位置的音名：

```ts
export const NOTE_SEQUENCE = ['C', 'bD', 'D', 'bE', 'E', 'F', 'bG', 'G', 'bA', 'A', 'bB', 'B']
export const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E']

export function getNoteAtPosition(position: FretPosition): NoteName {
  const openStringNote = STANDARD_TUNING[position.stringIndex]   // 取空弦音名
  const openNoteIndex = NOTE_SEQUENCE.indexOf(openStringNote)     // 找到它在12音序列中的下标
  return NOTE_SEQUENCE[(openNoteIndex + position.fretIndex) % 12] // 往后偏移fretIndex个半音
}
```

### 具体示例

| 弦 (stringIndex) | 空弦音 | 品格 (fretIndex) | 计算过程 | 结果 |
|---|---|---|---|---|
| 0 (1弦) | E | 0 | NOTE_SEQUENCE[4] | E |
| 0 (1弦) | E | 1 | NOTE_SEQUENCE[5] | F |
| 0 (1弦) | E | 5 | NOTE_SEQUENCE[9] | A |
| 1 (2弦) | A | 3 | NOTE_SEQUENCE[(1+3) % 12] = NOTE_SEQUENCE[4] | E |
| 2 (3弦) | D | 7 | NOTE_SEQUENCE[(7+7) % 12] = NOTE_SEQUENCE[2] | D |

---

## 第三步：比对答案

`App.tsx` 中的 `submitAnswer()` 在用户点击音名按钮时触发：

```ts
const submitAnswer = (selectedNote: NoteName) => {
  const isCorrect = selectedNote === currentQuestion.correctNote
  // 严格相等比较：用户选择的音名字符串 === 题目预先算好的正确音名字符串
}
```

验证方式是**字符串严格相等**（`===`），直接比较用户选择的音名与 `createQuestion()` 时预存的 `correctNote`。

---

## 第四步：反馈

根据 `isCorrect` 的值：

- **正确** → 指板上的标记变绿，反馈横幅显示"回答正确"
- **错误** → 指板上的标记变红，反馈横幅显示"回答错误"并同时展示正确答案

---

## 潜在问题

当前验证使用的是**降号音名体系**（bD, bE, bG, bA, bB），答案按钮也只有这一套音名。验证本身是准确的（12个半音一一对应），但如果未来需要支持升号/降号双体系，需要增加等音映射（如 `C# === bD`）。当前版本不存在这个问题。
