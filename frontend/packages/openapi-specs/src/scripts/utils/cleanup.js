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
const { execSync } = require('child_process');

/**
 * Clean old generated directory
 */
function cleanupOldGeneration(outputDir) {
  console.log('🧹 清理旧的生成目录...');

  if (!fs.existsSync(outputDir)) {
    console.log('📁 生成目录不存在，跳过清理');
    return;
  }

  const preservePatterns = [
    '*.json',
    '*.yml',
    '*.yaml',
    '*.md',
    '*.config.js',
    '*.config.ts',
    '.gitkeep',
    'README*',
    'CHANGELOG*',
  ];

  const tempBackupDir = path.join(outputDir, '..', '.api-generate-backup');
  const preservedFiles = [];

  try {
    for (const pattern of preservePatterns) {
      const files = execSync(
        `find "${outputDir}" -name "${pattern}" -type f 2>/dev/null || true`,
        {
          encoding: 'utf8',
        },
      )
        .trim()
        .split('\n')
        .filter((f) => f);

      preservedFiles.push(...files);
    }

    if (preservedFiles.length > 0) {
      console.log(`📋 发现 ${preservedFiles.length} 个需要保留的文件:`);
      preservedFiles.forEach((file) => {
        console.log(`   - ${path.relative(outputDir, file)}`);
      });

      if (!fs.existsSync(tempBackupDir)) {
        fs.mkdirSync(tempBackupDir, { recursive: true });
      }

      for (const file of preservedFiles) {
        const relativePath = path.relative(outputDir, file);
        const backupPath = path.join(tempBackupDir, relativePath);
        const backupDir = path.dirname(backupPath);

        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }

        fs.copyFileSync(file, backupPath);
      }
      console.log('💾 文件已备份到临时目录');
    }

    execSync(`rm -rf ${outputDir}`, { stdio: 'inherit' });
    console.log('🗑️  旧目录已清理');

    if (preservedFiles.length > 0) {
      fs.mkdirSync(outputDir, { recursive: true });

      for (const file of preservedFiles) {
        const relativePath = path.relative(outputDir, file);
        const backupPath = path.join(tempBackupDir, relativePath);
        const restorePath = path.join(outputDir, relativePath);
        const restoreDir = path.dirname(restorePath);

        if (!fs.existsSync(restoreDir)) {
          fs.mkdirSync(restoreDir, { recursive: true });
        }

        fs.copyFileSync(backupPath, restorePath);
      }

      execSync(`rm -rf ${tempBackupDir}`, { stdio: 'inherit' });
      console.log('♻️  保留文件已恢复');
    }

    console.log('✅ 选择性清理完成');
  } catch (error) {
    console.error('❌ 清理过程中出现错误:', error.message);

    if (fs.existsSync(tempBackupDir)) {
      try {
        execSync(`rm -rf ${tempBackupDir}`, { stdio: 'inherit' });
      } catch (cleanupError) {
        console.warn('⚠️  清理临时备份目录失败:', cleanupError.message);
      }
    }

    throw error;
  }
}

module.exports = { cleanupOldGeneration };

