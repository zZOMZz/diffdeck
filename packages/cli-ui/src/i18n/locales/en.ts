import type { I18nMessages } from '../types'

export const enMessages: I18nMessages = {
  meta: {
    htmlLang: 'en',
    title: 'Review Deck',
  },
  common: {
    localeLabel: 'Language',
    localeOptions: {
      en: 'English',
      'zh-CN': '简体中文',
    },
  },
  enums: {
    reviewSide: {
      additions: 'Addition',
      deletions: 'Deletion',
    },
    draftStatus: {
      accepted: 'Accepted',
      rejected: 'Rejected',
      pending: 'Pending',
    },
  },
  review: {
    loading: 'Loading patches...',
    loadErrorTitle: 'Unable to load patches',
    reload: 'Reload',
    emptyStateTitle: 'No patches available',
    emptyStateDescription: 'The backend returned an empty patch list.',
    deckEyebrow: 'Review Deck',
    pageTitle: 'Patch Review',
    pageDescription:
      'Review patch metadata, inspect diffs, add line comments, then submit one payload to the CLI server.',
    summary: {
      patches: 'Patches',
      comments: 'Comments',
      drafts: 'Drafts',
      resolved: 'Resolved',
    },
    patchQueueTitle: 'Patch Queue',
    patchGroupLabel: ({ index }) => `Group ${index}`,
    draftHints: ({ count }) => `${count} draft hints`,
    commentCount: ({ count }) => `${count} comments`,
    patchBadge: ({ index }) => `Patch #${index}`,
    fileCount: ({ count }) => `${count} file${count === 1 ? '' : 's'}`,
    metadataDescription:
      'Review the metadata here, then inspect the diff below. Comments attach to changed lines and will be submitted as human review comments.',
    groupIndex: 'Group Index',
    draftComments: 'Draft Comments',
    agentDraftCommentsTitle: 'Agent Draft Comments',
    agentDraftCommentsHint:
      'Mark each suggestion as accepted, rejected, or keep pending.',
    linePositionLabel: ({ sideLabel, line }) => `${sideLabel} line ${line}`,
    decisionActions: {
      accept: 'Accept',
      reject: 'Reject',
      pending: 'Pending',
    },
    diffTitle: 'Diff Review',
    diffDescription:
      'Context lines stay neutral, deletions are red, additions are green. Use the comment action on change lines to add review notes.',
    diffLineCount: ({ count }) => `${count} lines`,
    diffParseFallback: 'This patch did not parse into file diffs.',
    fileState: {
      deleted: 'Deleted',
      added: 'Added',
    },
    addComment: 'Comment',
    humanComment: 'Human Comment',
    remove: 'Remove',
    composerTitle: ({ file, line, sideLabel }) =>
      `Add comment for ${file}:${line} (${sideLabel})`,
    composerPlaceholder: 'Explain the issue, risk, or follow-up for this line...',
    saveComment: 'Save comment',
    cancel: 'Cancel',
    floatingSummaryTitle: 'Review Summary',
    floatingSummaryDescription: ({ commentCount, resolvedCount }) =>
      `${commentCount} human comments, ${resolvedCount} draft decisions updated.`,
    submittedSuccess: 'Review submitted successfully.',
    submitting: 'Submitting...',
    submitReview: 'Submit Review',
    clearStatus: 'Clear Status',
  },
}
