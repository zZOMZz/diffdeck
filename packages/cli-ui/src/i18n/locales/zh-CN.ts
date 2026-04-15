import type { I18nMessages } from '../types'

export const zhCNMessages: I18nMessages = {
  meta: {
    htmlLang: 'zh-CN',
    title: 'Review Deck',
  },
  enums: {
    reviewSide: {
      additions: '新增',
      deletions: '删除',
    },
    draftStatus: {
      accepted: '已接受',
      rejected: '已拒绝',
      pending: '待处理',
    },
  },
  review: {
    loading: '正在加载 patch…',
    loadErrorTitle: '无法加载 patch',
    reload: '重新加载',
    emptyStateTitle: '暂无 patch',
    emptyStateDescription: 'backend 返回了空的 patch 列表。',
    deckEyebrow: 'Review Deck',
    pageTitle: 'Patch Review',
    pageDescription:
      '审查 patch metadata、查看 diff、添加行级 comment，然后向 CLI server 提交一个 payload。',
    summary: {
      patches: 'Patch',
      comments: 'Comment',
      drafts: 'Draft',
      resolved: '已解决',
    },
    patchQueueTitle: 'Patch Queue',
    patchGroupLabel: ({ index }) => `Group ${index}`,
    draftHints: ({ count }) => `${count} 条 draft hint`,
    commentCount: ({ count }) => `${count} 条 comment`,
    patchBadge: ({ index }) => `Patch #${index}`,
    fileCount: ({ count }) => `${count} 个 file`,
    metadataDescription:
      '在此查看 metadata，然后向下浏览 diff。Comment 会附加到变更行，并作为 human review comment 提交。',
    groupIndex: 'Group 索引',
    draftComments: 'Draft Comment',
    agentDraftCommentsTitle: 'Agent Draft Comment',
    agentDraftCommentsHint:
      '将每条建议标记为 accepted、rejected，或保持 pending。',
    linePositionLabel: ({ sideLabel, line }) => `${sideLabel} line ${line}`,
    decisionActions: {
      accepted: '接受',
      rejected: '拒绝',
      pending: '待定',
    },
    diffTitle: 'Diff Review',
    diffDescription:
      '上下文行保持中性，删除为红色，新增为绿色。在变更行上使用 comment 操作添加 review 备注。',
    diffLineCount: ({ count }) => `${count} 行`,
    diffParseFallback: '该 patch 未能解析为 file diff。',
    fileState: {
      deleted: '删除文件',
      added: '新增文件',
    },
    addComment: 'Comment',
    humanComment: 'Human Comment',
    remove: '移除',
    composerTitle: ({ file, line, sideLabel }) =>
      `为 ${file}:${line}（${sideLabel}）添加 comment`,
    composerPlaceholder: '说明本行的问题、风险或后续跟进…',
    saveComment: '保存 comment',
    cancel: '取消',
    floatingSummaryTitle: 'Review 摘要',
    floatingSummaryDescription: ({ commentCount, resolvedCount }) =>
      `${commentCount} 条 human comment，${resolvedCount} 条 draft decision 已更新。`,
    submittedSuccess: 'Review 已成功提交。',
    submitting: '提交中…',
    submitReview: '提交 Review',
    clearStatus: '清除状态',
  },
}
