# LLM 驱动的一站式 Review TODO

这份文档记录未来将 `reviewdeck` 从“依赖 Claude Code / Codex 人工生成 split metadata”升级为“一站式自动生成、验证、拆分、渲染”的实现方向。

## 背景

当前完整流程大致是：

```bash
reviewdeck index mock/so.test.diff
# 用户或 LLM 工具理解 indexed diff，并手动生成 split-meta.json
reviewdeck split mock/so.test.diff mock/so.test.split-meta.json -o mock/so_com
reviewdeck render mock/so_com
```

痛点：

- `split-meta.json` 依赖外部 LLM 工具人工生成。
- 用户需要在 Claude Code、Codex 等 agent 环境中使用，普通 CLI 用户不方便。
- 流程不是一站式，无法直接从 diff 到 Web review 页面。

目标：

```bash
reviewdeck review mock/so.test.diff \
  --provider openai \
  --model gpt-5.4 \
  --output mock/so_com
```

内部自动执行：

1. 对 diff changes 编号。
2. 调用外部模型生成 split metadata。
3. 校验 split metadata。
4. 校验失败时自动修复。
5. 拆分 diff。
6. 启动 Web review。

## P0：先实现直接调用模型 API 的方案

- 新增 `generate-meta` 命令。
  - 示例：
    ```bash
    reviewdeck generate-meta mock/so.test.diff \
      --provider openai \
      --model gpt-5.4 \
      -o mock/so.test.split-meta.json
    ```
  - 该命令负责：
    - 运行或复用 `reviewdeck index --json`
    - 将 indexed changes 传给模型
    - 要求模型输出符合 schema 的 split metadata
    - 写入 `split-meta.json`

- 新增一站式 `review` 命令。
  - 示例：
    ```bash
    reviewdeck review mock/so.test.diff \
      --provider openai \
      --model gpt-5.4 \
      --output mock/so_com
    ```
  - 内部流程：
    ```text
    index --json
    generate-meta
    validate
    repair if needed
    split -o
    render
    ```

- 优先支持直接模型 API，而不是优先依赖 Codex / Claude Code agent。
  - 原因：
    - 生成 split metadata 本质是结构化生成任务。
    - 输入是 indexed diff，输出是 JSON。
    - 不一定需要完整 coding agent 读写文件或运行命令。
    - 直接 API 更适合 CI 和普通 CLI 用户。

## P0：定义稳定的 Split Metadata Schema

- 所有 provider 都必须输出同一个 schema。

- 初始 schema 可以类似：
  ```json
  {
    "type": "object",
    "properties": {
      "groups": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "description": { "type": "string" },
            "changes": {
              "type": "array",
              "items": {
                "anyOf": [
                  { "type": "integer" },
                  { "type": "string", "pattern": "^[0-9]+-[0-9]+$" }
                ]
              }
            },
            "draftComments": {
              "type": "array"
            }
          },
          "required": ["description", "changes"],
          "additionalProperties": false
        }
      }
    },
    "required": ["groups"],
    "additionalProperties": false
  }
  ```

- 模型输出只是候选结果。
  - 最终权威仍然是本地 `validate` 和 `split`。
  - 不允许绕过校验直接进入 render。

## P0：实现 Validate And Repair 闭环

- `generate-meta` 后必须调用校验逻辑。

- 如果校验失败，自动进行有限次数修复。
  - 示例流程：
    ```text
    validate failed
    -> 把错误信息 + 原始 split metadata + indexed diff 摘要传回模型
    -> 要求模型只返回修复后的 split metadata JSON
    -> 再次 validate
    ```

- 建议默认修复次数：
  - `--repair-attempts 2`

- 失败时输出清晰错误：
  - 缺失哪些 change index
  - 重复了哪些 change index
  - 哪些 range 不合法
  - 哪些 group 为空
  - 哪些 draft comment 无法定位

## P1：Provider 设计

- 设计统一 provider 接口。
  - 输入：
    - diff 文件路径
    - indexed changes JSON
    - 可选原始 diff 摘要
    - schema
    - prompt
  - 输出：
    - split metadata JSON

- 建议 provider 类型：
  ```bash
  reviewdeck review foo.diff --provider openai
  reviewdeck review foo.diff --provider anthropic
  reviewdeck review foo.diff --provider codex-sdk
  reviewdeck review foo.diff --provider codex-exec
  reviewdeck review foo.diff --provider claude-agent
  reviewdeck review foo.diff --provider claude-cli
  ```

- 推荐优先级：
  - `openai` / `anthropic`：默认推荐，直接调用模型 API。
  - `codex-sdk` / `claude-agent`：高级模式，适合需要 agent 读取仓库上下文或自动修复复杂问题。
  - `codex-exec` / `claude-cli`：快速集成或本地实验模式，依赖用户本机已安装并登录对应 CLI。

## P1：OpenAI / Codex 方向

- 直接 OpenAI API。
  - 适合默认实现。
  - 重点能力：
    - 结构化输出
    - JSON schema
    - function/tool calling
    - 后续可接 Responses API / Agents SDK

- OpenAI Agents SDK。
  - 适合未来构建更完整的 agentic workflow。
  - 可用于：
    - 读取更多项目上下文
    - 工具调用
    - 多轮修复
    - tracing

- Codex SDK。
  - 适合复用本地 Codex agent 能力。
  - 可作为高级 provider：
    ```bash
    reviewdeck review foo.diff --provider codex-sdk
    ```
  - 注意：
    - 不应该作为唯一依赖。
    - 用户环境中未安装或未认证时需要清晰 fallback。

- `codex exec` 非交互模式。
  - 适合快速实验。
  - 可配合 `--output-schema` 获取结构化输出。
  - 示例：
    ```bash
    reviewdeck index mock/so.test.diff --json \
      | codex exec \
          --output-schema ./schemas/split-meta.schema.json \
          -o mock/so.test.split-meta.json \
          "Generate reviewdeck split metadata from this indexed diff."
    ```
  - 风险：
    - 依赖用户本机 Codex CLI。
    - 依赖用户登录态或 `CODEX_API_KEY`。
    - 不适合作为默认路径。

## P1：Anthropic / Claude 方向

- 直接 Anthropic API。
  - 适合默认 provider 之一。
  - 用户通过 `ANTHROPIC_API_KEY` 配置。

- Claude Agent SDK。
  - 适合高级 agent 模式。
  - 可用于：
    - 读取文件
    - 运行命令
    - 搜索代码
    - 修复 metadata
  - 注意：
    - 面向外部产品时，应使用 API key、Bedrock、Vertex、Azure 等认证方式。
    - 不应依赖用户本机 Claude Code 登录态作为产品默认认证方式。

- Claude CLI 非交互模式。
  - 可作为快速集成 provider。
  - 风险类似 `codex exec`：
    - 依赖本机 CLI 安装
    - 依赖本机登录或配置
    - 可移植性弱

## P2：Prompt 设计

- Prompt 应该明确模型任务：
  - 只根据 indexed changes 生成 split metadata。
  - 每个 change index 必须出现且只出现一次。
  - group 应该按语义相关性划分。
  - group 数量不宜过多。
  - 只输出 JSON，不输出解释。

- Prompt 应该包含分组原则：
  - 同一功能修改优先放在同一 group。
  - 同一文件不一定强制同组，按语义拆。
  - 跨文件但同一功能链路应放同组。
  - 大型无关变更应拆开。
  - 纯样式、打点、配置、后端逻辑可以独立成组。

- Prompt 应该允许模型使用范围表达：
  - `0`
  - `5`
  - `"10-20"`

- Repair prompt 应该只关注修复校验错误。
  - 输入：
    - validation errors
    - previous split metadata
    - indexed changes summary
  - 输出：
    - corrected split metadata JSON

## P2：配置和安全

- 支持环境变量：
  - `OPENAI_API_KEY`
  - `ANTHROPIC_API_KEY`
  - `REVIEWDECK_PROVIDER`
  - `REVIEWDECK_MODEL`

- 支持项目级配置文件，例如：
  ```json
  {
    "provider": "openai",
    "model": "gpt-5.4",
    "repairAttempts": 2,
    "maxGroups": 8
  }
  ```

- 注意 diff 可能包含敏感代码。
  - CLI 应明确提示调用外部模型会发送 diff 内容。
  - 支持 `--no-network` 或 `--local-only` 模式。
  - 支持仅使用本地 provider 或用户自定义 endpoint。

## P2：错误处理和回退策略

- Provider 不可用时：
  - 给出明确错误和配置提示。
  - 不要静默 fallback 到另一个 provider。

- 模型输出非法 JSON 时：
  - 尝试 repair。
  - repair 失败后保留原始输出到调试文件。

- 校验多次失败时：
  - 写出失败的候选 metadata。
  - 写出 validation errors。
  - 提示用户可手动编辑后运行 `reviewdeck split`。

- 建议输出调试文件：
  ```text
  .reviewdeck/
    last-index.json
    last-generated-split-meta.json
    last-validation-errors.json
    last-provider-output.txt
  ```

## 建议实现顺序

1. 增加 `index --json`。
2. 定义 split metadata JSON schema。
3. 抽象 provider 接口。
4. 实现 `openai` provider。
5. 实现 `generate-meta` 命令。
6. 增加 `validate + repair` 闭环。
7. 实现一站式 `review` 命令。
8. 增加 `anthropic` provider。
9. 增加 `codex-exec` / `claude-cli` provider 作为实验能力。
10. 评估并接入 Codex SDK / Claude Agent SDK 作为高级 agent provider。

## 不建议的方向

- 不建议把 Codex CLI 或 Claude Code CLI 作为唯一依赖。
  - 否则工具仍然不是一站式，只是把人工步骤隐藏到另一个 CLI 里。

- 不建议让模型直接生成 sub diff。
  - 模型应只生成 split metadata。
  - diff 拆分和组合验证必须由本地 deterministic 逻辑完成。

- 不建议跳过本地校验。
  - 模型输出必须经过 validate。
  - `split` 的 composition verification 仍然是最终保障。
