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
      resolved: 'Resolved',
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
    agentDraftCommentsTitle: 'Agent Draft Comments',
    agentDraftCommentsHint:
      '每条Agent Comment的状态可以是已接受、已拒绝、或待定',
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
    agentComment: 'Agent Comment',
    humanComment: 'Human Comment',
    remove: '移除',
    composerTitle: ({ file, line, sideLabel }) =>
      `为 ${file}:${line}（${sideLabel}）添加 comment`,
    composerPlaceholder: '说明本行的问题、风险或后续跟进…',
    saveComment: '保存 comment',
    cancel: '取消',
    floatingSummaryTitle: 'Review Comments',
    floatingSummaryDescription: ({ commentCount, resolvedCount }) =>
      `可提交 ${commentCount} 条 Human Comment，${resolvedCount} 条 Agent Comment。`,
    previewPayload: '预览',
    previewPayloadTitle: '提交内容预览',
    previewPayloadDescription:
      '这是当前点击提交时会发送出去的 JSON payload。',
    submittedSuccess: '已成功提交。',
    submitting: '提交中…',
    submitReview: '提交',
  },
}
