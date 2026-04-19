---
name: diffdeck
description: Split a large PR/MR diff into reiviewable sub-patches for eaiser code review 
---

# DiffDeck
你帮助代码审查员将大型 PR 差异转换为有序的审查演示文稿，然后将其交给人工审查。

默认设置：
- 除非用户明确要求你亲自review代码， 否则不要使用你的自动reivew code流程
- 如果用户想要 PR 审查帮助， 不要在 `split` 之后停止。 除非用户明确只需要拆分后的数据， 否则继续执行`render` 命令
- 通过 `npx` 调用CLI时， 使用 `npx diffdeck@latest ...`

# 主路径

### 1. 获取diff

使用已经符合用户场景的最低成本路径：

- 如果用户已经提供了`.diff`文件， 直接读取并使用它
- 如果用户正在审查Github PR， 运行：

```bash
gh pr diff 123 > pr.diff
```

- 如果用户在本地的git仓库中， 并且想比较当前分支与`main`， 运行：

```bash
git diff main...HEAD > pr.diff
```

其他常见场景的处理方式：
```bash
# 指定另一个github仓库中的pr
gh pr diff 123 --repo owner/repo > pr.diff

# 比较两个commit
git diff <commit-a> <commit-b> > pr.diff

# 已暂存的改动
git diff --cached > pr.diff
```

### 2. 为改动建立索引

```bash
npx diffdeck index pr.diff
```

这个命令用来打印一个带编号的改动行列表。 这些索引就是输入给LLM在拆分元素中分组的单位

### 3. 选择审查模式

生成拆分元数据之前， 先判断用户是否已经表达了偏好的审查流程。

- 如果用户已经暗示了偏好的流程， 就按该流程执行
- 如果用户没有表达明确的偏好, 默认使用`deps-first`： 对分组排序， 使前面的分组先引入后续所需的上下文和依赖

### 4. 拆分元数据

输出一个单独的JSON对象， 格式参考:

```json
{
    "groups": [
        {
            "description": "新增用户注册功能",
            "changes": ["0-10", 14, 15]
        }
    ]
}
```

默认规则：
- 每个改动的索引必须且最多只能出现一次
- 根据可审查性选择分组数量。 把紧密相关的改动放到同一组；只有当拆分能让审查顺序更清晰时才拆分
- 选择所设置的审查模式匹配的顺序。 在`deps-first`模式下， 尽可能将前置依赖改动放在他们的改动之前
- 每个分组中的`description` 应该帮助reiviewer理解这组代码的主要功能，review顺序等， 而不是仅仅复述文件名或标签
- 相同情况下， 优先使用紧凑的范围与法，例如当这个group的changes包含从第0行**连续**到第10行时，不要输出`[0,1,2,...,10]`， 而是直接输出`[0-10]`, 以便节省LLM的output token
- `draftComment`是可选字段。 只有当你认为这个group中的某一行或某一段代码中， 有值得reviewer关注的问题时（一般是一些安全隐患）， 你才需要添加一条`draftComment`
- 每条`draftComment`必须锚定到同一分组内的一个`change`， 不能出现空位置或不存在这个组的change下的`draftComment`。

如果需要更深入的分组规则、`description`撰写或高质量`draftComment`指导， 请阅读[references/split.md](references/split.md)

### 5. 拆分并验证

```bash
echo '<meta JSON>' | npx diffdeck split pr.diff -
```

或者将结果写入指定文件及下：
```bash
echo '<meta JSON>' | npx diffdeck split pr.diff - -o output/
```

这个命令在执行时， 会验证元数据的有效性、生成子补丁， 并验证它们能否重新组合回原始diff。

如果`split`命令执行失败， 请详细阅读错误信息， 根据错误信息中提供的内容， 修正元数据JSON， 然后重试

### 6. 交给人工review

`split`命令成功后， 默认下一步是人工进行实时reiview审查：

```bash
npx reiviewdeck render output/
```

或者从stdin输入
```bash
echo '<meta JSON>' | npx diffdeck split pr.diff - | npx diffdeck render -
```

运行render命令后， 会在本地打开一个`httpServer`，并打开浏览器， 阻塞直到人工review完成，并向stdout打印一个reivew完成后提交的JSON对象

默认行为：
- 当用户想要帮忙reivew PR时， 优先使用render命令并等待提交
- 当`split`命令成功后， 如果当前环境支持本地reivew对话， 就继续执行后续的`render`命令， 不要停在`split succeeded`
- 将`comments`视为最终的人工reivew comment载荷
- 将`draftComments`视为溯源信息，标明各条agent draftComment的状态： resolved（已采纳）、rejected（已拒绝）、pending（未处理）

### 7. 将comment提交回Github/来源系统中

`render` 完成后：
- 总结`draftComment`被采纳、拒绝、未处理的结果
- 如果存在最终`comments`， 询问用户是否要将它们提交回原系统
- 若上下文中目标已经明确（例如具体PR或评审线程）， 则直接在该处继续， 不必再问一次
- 提交时使用`comments`， 不要使用原始的`draftComments`。
- 若没有最终的`comments`, 要和用户说清楚当前没有需要提交的comment， 然后停下
- 若来源系统不明确（Github、Gitlab或私有化代码平台），需要先向用户问清楚再操作