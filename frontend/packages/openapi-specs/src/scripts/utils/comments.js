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

/**
 * Remove auto-generated comment headers
 */
function removeGeneratedComments(outputDir) {
  console.log('🧹 删除自动生成的注释头...');

  if (!fs.existsSync(outputDir)) {
    console.warn('⚠️  生成目录不存在，跳过删除注释');
    return;
  }

  const processFile = (filePath) => {
    if (!filePath.endsWith('.ts')) {
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    const commentsToRemove = [
      /^\/\* generated using openapi-typescript-codegen -- do not edit \*\/\n?/m,
      /^\/\* istanbul ignore file \*\/\n?/m,
      /^\/\* tslint:disable \*\/\n?/m,
      /^\/\* eslint-disable \*\/\n?/m,
    ];

    commentsToRemove.forEach((pattern) => {
      const newContent = content.replace(pattern, '');
      if (newContent !== content) {
        updated = true;
        content = newContent;
      }
    });

    content = content.replace(/^\n+/, '');

    if (updated) {
      fs.writeFileSync(filePath, content);
    }
  };

  const processDirectory = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else {
        processFile(filePath);
      }
    }
  };

  processDirectory(outputDir);
  console.log('✅ 自动生成的注释头已删除');
}

module.exports = { removeGeneratedComments };

