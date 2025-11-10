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

// 读取所有文件列表
const allFiles = fs
  .readFileSync('/tmp/all-files-with-comments.txt', 'utf-8')
  .split('\n')
  .filter((line) => line.trim())
  .map((line) => {
    const parts = line.split('\t');
    const count = parseInt(parts[0]) || 0;
    const filePath = parts[1] || '';
    return { count, path: filePath };
  })
  .filter((item) => item.path && item.count > 0);

// 按模块分组
const queues = {
  queue1: [], // packages/components
  queue2: [], // system 1/3
  queue3: [], // system 2/3
  queue4: [], // system 3/3
  queue5: [], // threshold 1/2
  queue6: [], // threshold 2/2
  queue7: [], // event-center
  queue8: [], // wizard
  queue9: [], // global-guide + oncall + others
  queue10: [], // remaining
};

// 分类文件
allFiles.forEach((item) => {
  const filePath = item.path;
  // 检查是否是 packages/components 文件（支持相对路径和绝对路径）
  if (
    filePath.includes('packages/components/src') ||
    (filePath.includes('components/src') && !filePath.includes('apps/veaiops'))
  ) {
    queues.queue1.push(item);
  } else if (filePath.startsWith('apps/veaiops/src/modules/system')) {
    if (queues.queue2.length < 150) {
      queues.queue2.push(item);
    } else if (queues.queue3.length < 150) {
      queues.queue3.push(item);
    } else {
      queues.queue4.push(item);
    }
  } else if (filePath.startsWith('apps/veaiops/src/modules/threshold')) {
    if (queues.queue5.length < 120) {
      queues.queue5.push(item);
    } else {
      queues.queue6.push(item);
    }
  } else if (filePath.startsWith('apps/veaiops/src/modules/event-center')) {
    queues.queue7.push(item);
  } else if (filePath.startsWith('apps/veaiops/src/components/wizard')) {
    queues.queue8.push(item);
  } else if (
    filePath.includes('components/global-guide') ||
    filePath.includes('modules/oncall') ||
    filePath.includes('components/common') ||
    filePath.includes('pages/system') ||
    filePath.includes('pages/statistics') ||
    filePath.includes('config/routes')
  ) {
    queues.queue9.push(item);
  } else {
    queues.queue10.push(item);
  }
});

// 生成详细文件列表
let output = '# 翻译队列详细文件列表\n\n';
output += '> **生成时间**: 2025-01-27\n';
output += `> **总文件数**: ${allFiles.length} 个文件\n`;
output += `> **总注释行数**: ${allFiles.reduce((sum, item) => sum + item.count, 0)} 行\n\n`;
output += '---\n\n';

const queueNames = [
  { key: 'queue1', name: '队列 1: 共享组件库', priority: '🔴 P0' },
  { key: 'queue2', name: '队列 2: System 模块 (1/3)', priority: '🔴 P0' },
  { key: 'queue3', name: '队列 3: System 模块 (2/3)', priority: '🔴 P0' },
  { key: 'queue4', name: '队列 4: System 模块 (3/3)', priority: '🔴 P0' },
  { key: 'queue5', name: '队列 5: Threshold 模块 (1/2)', priority: '🔴 P0' },
  { key: 'queue6', name: '队列 6: Threshold 模块 (2/2)', priority: '🔴 P0' },
  { key: 'queue7', name: '队列 7: Event Center 模块', priority: '🔴 P0' },
  { key: 'queue8', name: '队列 8: Wizard 组件', priority: '🟡 P1' },
  { key: 'queue9', name: '队列 9: 其他模块 (1/2)', priority: '🟡 P1' },
  { key: 'queue10', name: '队列 10: 其他模块 (2/2)', priority: '🟢 P2' },
];

queueNames.forEach((queueInfo, index) => {
  const queue = queues[queueInfo.key];
  const totalFiles = queue.length;
  const totalComments = queue.reduce((sum, item) => sum + item.count, 0);

  output += `## ${queueInfo.name}\n\n`;
  output += `**优先级**: ${queueInfo.priority}\n\n`;
  output += `**文件数**: ${totalFiles} 个文件\n`;
  output += `**注释行数**: ${totalComments} 行\n\n`;
  output += `**文件列表** (按注释行数排序):\n\n\`\`\`\n`;

  // 按注释行数排序
  queue.sort((a, b) => b.count - a.count);

  queue.forEach((item, idx) => {
    output += `${idx + 1}. ${item.path} (${item.count}行)\n`;
  });

  output += `\`\`\`\n\n---\n\n`;
});

// 保存到文件
fs.writeFileSync('TRANSLATION_QUEUES_DETAILED.md', output);
console.log('✅ 详细队列文件列表已生成: TRANSLATION_QUEUES_DETAILED.md');
console.log('\n队列统计:');
queueNames.forEach((queueInfo) => {
  const queue = queues[queueInfo.key];
  const totalFiles = queue.length;
  const totalComments = queue.reduce((sum, item) => sum + item.count, 0);
  console.log(
    `  ${queueInfo.name}: ${totalFiles} 个文件, ${totalComments} 行注释`,
  );
});
