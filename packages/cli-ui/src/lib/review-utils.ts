import type {
  ReviewSide,
  ReviewResponse,
  SubPatch,
} from "@reviewdeck/shared";
import { parsePatch } from '@reviewdeck/core'

import type { LocalComment, ParsedDiffFile, ParsedDiffLine } from '../types/review'

export function getCommentsForLine(
  comments: LocalComment[],
  target?: { file: string; line: number; side: ReviewSide },
) {
  if (!target) {
    return []
  }

  return comments.filter(
    (comment) =>
      comment.file === target.file &&
      comment.line === target.line &&
      comment.side === target.side,
  )
}

export function buildRenderedDiff(patch: SubPatch): ParsedDiffFile[] {
  const filePatches = parsePatch(patch.diff);

  return filePatches.map((patch, pIdx) => ({
    key: `${patch.srcFile}-${patch.dstFile}-${pIdx}`,
    srcFile: patch.srcFile,
    dstFile: patch.dstFile,
    isDelete: patch.isDelete,
    isNew: patch.isNew,
    hunks: patch.hunks.map((hunk, hIdx) => {
      const header = `@@ -${hunk.srcStart},${hunk.srcCount} +${hunk.dstStart},${hunk.dstCount} @@`;
      let oldLineNumber = hunk.srcStart;
      let newLineNumber = hunk.dstStart;

      return {
        header,
        lines: hunk.lines.map((line, lIdx) => {
          let row: ParsedDiffLine;
          if (line.type === " ") {
            row = {
              key: `${pIdx}-${hIdx}-${lIdx}`,
              kind: "context",
              content: line.content,
              oldLineNumber,
              newLineNumber,
            };
            oldLineNumber += 1;
            newLineNumber += 1;
            return row;
          } else if (line.type === "-") {
            row = {
              key: `${pIdx}-${hIdx}-${lIdx}`,
              kind: "delete",
              content: line.content,
              oldLineNumber,
              commentTarget: {
                file: patch.srcFile,
                line: oldLineNumber,
                side: "deletions",
              },
            };
            oldLineNumber += 1;
            return row;
          } else if (line.type === "+") {
            row = {
              key: `${pIdx}-${hIdx}-${lIdx}`,
              kind: "add",
              content: line.content,
              newLineNumber,
              commentTarget: {
                file: patch.dstFile,
                line: newLineNumber,
                side: "additions",
              },
            };
            newLineNumber += 1;
            return row;
          } else if (line.type === '\\') {
            row = {
              key: `${pIdx}-${hIdx}-${lIdx}`,
              kind: 'meta',
              content: 'No newline at end of file',
            }
            return row;
          }

          row = {
            key: `${pIdx}-${hIdx}-${lIdx}`,
            kind: "meta",
            content: line.content,
          };

          return row;
        }),
      };
    }),
  }));
}
