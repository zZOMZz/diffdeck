# Review 流程优化 TODO

这份文档记录 `reviewdeck` 当前 review 流程中可以优化的点：

```bash
reviewdeck index <diff>
# 根据带编号的 diff changes 创建 split metadata
reviewdeck split <diff> <split-meta> -o <review-dir>
reviewdeck render <review-dir>
```

## P0：澄清并稳定核心流程

- 明确区分两类 metadata。
  - `split-meta.json` 或 `split-plan.json`：用户手写或工具生成，作为 `reviewdeck split` 的输入。
  - `meta.json`：`reviewdeck split -o` 生成，作为 `reviewdeck render` 的输入。
  - 文档和 CLI 提示中尽量不要把这两类文件都笼统叫做 `meta`，否则容易混淆。

- 为 `reviewdeck index` 增加机器可读输出。
  - 示例：
    ```bash
    reviewdeck index mock/so.test.diff --json -o mock/so.test.index.json
    ```
  - 建议字段：
    - `index`
    - `file`
    - `line`
    - `side`
    - `kind`
    - `text`
  - 这样后续自动分组、LLM 辅助分组、Web UI 展示都会更稳定，不依赖解析终端文本。

- 优化 `reviewdeck split` 的分组数量展示。
  - 当前输出统计的是 `changes` 数组里的条目数，所以 `"0-179"` 会显示成 `1 item`。
  - 更建议展示实际 change 数量，例如：
    ```text
    1. Simplify PHP related-search... (1 range, 180 changes)
    ```

- 增加 `validate` 命令。
  - 示例：
    ```bash
    reviewdeck validate mock/so.test.diff mock/so.test.split-meta.json
    ```
  - 校验内容：
    - 每个 change index 是否恰好出现一次
    - range 是否合法
    - group 是否为空
    - description 是否存在
    - draft comment 是否指向合法 change
    - draft comment 是否指向当前 group 内的 change

## P1：降低人工操作成本

- 增加自动分组建议命令。
  - 示例：
    ```bash
    reviewdeck suggest-groups mock/so.test.diff -o mock/so.test.split-meta.json
    ```
  - 初始版本可以先用启发式策略：
    - 按文件分组
    - 按目录分组
    - 按 hunk 邻近关系分组
    - 限制每组最大 change 数
    - 限制最大 group 数
  - 后续可以接入 LLM，做语义级分组。

- 增加一站式 review 命令。
  - 示例：
    ```bash
    reviewdeck review mock/so.test.diff --meta mock/so.test.split-meta.json --output mock/so_com
    ```
  - 内部可以依次执行：
    - split
    - 验证组合结果
    - 写入 review 产物
    - 启动 render
  - 如果用户没有提供 metadata，可以使用默认分组策略，或者打开一个分组编辑页面。

- 让 split 输出目录包含追溯信息。
  - 当前通常包含：
    ```text
    sub1.diff
    sub2.diff
    meta.json
    ```
  - 可以考虑额外写入：
    ```text
    split-meta.json
    index.txt
    index.json
    ```
  - 这样 `review-dir` 会成为一个完整的 review artifact，后续追溯和调试更方便。

## P2：优化 Web Review 体验

- 让 render UI 支持调整分组。
  - 可能需要的交互：
    - 查看 indexed changes
    - 拖拽或移动 change 到其他 group
    - 编辑 group description
    - 保存更新后的 split metadata
    - 重新执行 split validation

- 在 UI 中把 change index 作为稳定锚点。
  - 同一个 change index 应该能够串起：
    - CLI `index` 输出
    - split metadata
    - render 后的 diff chunk
    - draft comments

- 支持完整的 review artifact 生命周期。
  - 建议流程：
    - 生成分组
    - 校验分组
    - review 拆分后的 sub-patches
    - 更新 draft comments
    - 导出最终 review notes

## Draft Comment 可靠性

- 加强 draft comment 校验。
  - `draftComments[].change` 应该指向当前 group 内的 indexed change。
  - `body` 不应该为空。
  - 如果 comment 无法解析，错误信息应包含：
    - group description
    - change index
    - 解析失败原因

- 统一解析 comment 锚点。
  - 根据 indexed change 自动确定 file、line、side。
  - 保留原始 change index，方便后续追踪。

## 文档

- 在 README 中增加面向用户旅程的示例：
  ```bash
  # 1. 给 diff 中的每一条 change 编号
  reviewdeck index mock/so.test.diff -o mock/so.test.index.txt

  # 2. 根据这些编号创建 split plan
  $EDITOR mock/so.test.split-meta.json

  # 3. 拆分并验证
  reviewdeck split mock/so.test.diff mock/so.test.split-meta.json -o mock/so_com

  # 4. 打开 Web review
  reviewdeck render mock/so_com
  ```

- 提供最小 split metadata 示例：
  ```json
  {
    "groups": [
      {
        "description": "Update installation docs",
        "changes": ["0-4"]
      },
      {
        "description": "Adjust runtime config",
        "changes": [5, 6, "7-10"]
      }
    ]
  }
  ```

## 建议实现顺序

1. 优化文档和 CLI 提示，明确 `split-meta.json` 与生成的 `meta.json` 的区别。
2. 增加 `reviewdeck index --json`。
3. 优化 `split` 的 group size 输出。
4. 增加 `reviewdeck validate`。
5. 增加启发式 `suggest-groups`。
6. 增加一站式 `review` 命令。
7. 让 render UI 支持编辑和校验分组。
