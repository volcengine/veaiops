// Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. and/or its affiliates
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const fs = require('fs');
const path = require('path');

const CHINESE_REGEX = /[\u4e00-\u9fa5]/;

function countChineseCommentLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let commentLines = 0;
    let inBlockComment = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) continue;

      // Block comment detection
      const blockStart = line.indexOf('/*');
      const blockEnd = line.indexOf('*/');

      if (blockStart !== -1 && blockEnd !== -1 && blockStart < blockEnd) {
        // Single line block comment
        const comment = line.substring(blockStart + 2, blockEnd);
        if (CHINESE_REGEX.test(comment)) commentLines++;
      } else if (blockStart !== -1) {
        // Start of block comment
        inBlockComment = true;
        const comment = line.substring(blockStart + 2);
        if (CHINESE_REGEX.test(comment)) commentLines++;
      } else if (blockEnd !== -1) {
        // End of block comment
        const comment = line.substring(0, blockEnd);
        if (CHINESE_REGEX.test(comment)) commentLines++;
        inBlockComment = false;
      } else if (inBlockComment) {
        // Inside block comment
        if (CHINESE_REGEX.test(line)) commentLines++;
      } else if (trimmed.startsWith('//')) {
        // Line comment
        const comment = trimmed.substring(2).trim();
        if (CHINESE_REGEX.test(comment)) commentLines++;
      }
    }

    return commentLines;
  } catch (error) {
    return 0;
  }
}

function scanDir(dirPath) {
  const stats = { files: 0, commentLines: 0 };

  function walk(currentPath) {
    if (!fs.existsSync(currentPath)) return;

    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (
          !['node_modules', '.nx', 'dist', 'build', '.git'].includes(entry.name)
        ) {
          walk(fullPath);
        }
      } else if (
        entry.isFile() &&
        (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))
      ) {
        const commentLines = countChineseCommentLines(fullPath);
        if (commentLines > 0) {
          stats.files++;
          stats.commentLines += commentLines;
        }
      }
    }
  }

  walk(dirPath);
  return stats;
}

const dirs = [
  'packages/utils/src',
  'packages/types/src',
  'packages/constants/src',
  'packages/components/src',
  'apps/veaiops/src',
];

console.log('=== 剩余中文注释统计（当前分支） ===\n');
console.log('按目录统计（包含中文注释的文件数和注释行数）:\n');

let totalFiles = 0;
let totalCommentLines = 0;

for (const dir of dirs) {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    const stats = scanDir(dirPath);
    totalFiles += stats.files;
    totalCommentLines += stats.commentLines;
    console.log(`${dir}: ${stats.files} 个文件, ${stats.commentLines} 行注释`);
  } else {
    console.log(`${dir}: 目录不存在`);
  }
}

console.log(`\n总计: ${totalFiles} 个文件, ${totalCommentLines} 行注释`);
