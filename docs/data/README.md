# 题库数据说明 (MVP)

当前为卡片式练习数据，仅包含题干与分类。

## questions.json

- `questions[]`: 题库列表
  - `id`: 题目编号
  - `category`: 题目分类
  - `text`: 题干
  - `choices`: 预留字段，暂为空数组
  - `answer`: 预留字段，暂为 null
  - `explanation`: 预留字段，暂为 null

## 未来扩展

后续可新增以下文件扩展为选择题或闪卡：

- `data/choices.json`: 为每道题补充选项
- `data/answers.json`: 为每道题补充正确答案与解析

建议保持 `id` 与 `questions.json` 一致，用于关联。
