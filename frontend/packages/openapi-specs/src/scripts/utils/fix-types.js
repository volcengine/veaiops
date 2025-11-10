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
 * Fix type conflicts caused by allOf
 */
function fixAllOfTypeConflicts(outputDir) {
  console.log('🔧 修复allOf类型冲突...');

  if (!fs.existsSync(outputDir)) {
    console.warn('⚠️  API生成目录不存在，跳过类型冲突修复');
    return;
  }

  const processFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    const allOfPattern =
      /export type (\w+) = \(\{[\s\S]*?data\?: unknown;[\s\S]*?\} & \{[\s\S]*?data\?: ([\s\S]*?)\}\);/g;

    content = content.replace(allOfPattern, (match, typeName, dataType) => {
      updated = true;
      console.log(`修复类型冲突: ${typeName}`);

      const cleanDataType = dataType.replace(/;\s*$/, '').trim();

      return `export type ${typeName} = {
    /**
     * 响应状态码
     */
    code?: number;
    /**
     * 响应消息
     */
    message?: string;
    /**
     * 响应数据
     */
    data?: ${cleanDataType};
};`;
    });

    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(`已修复类型冲突: ${path.relative(outputDir, filePath)}`);
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
      } else if (
        file.endsWith('.ts') &&
        (file.includes('api-response') || file.includes('APIResponse'))
      ) {
        processFile(filePath);
      }
    }
  };

  const modelsDir = path.join(outputDir, 'models');
  if (fs.existsSync(modelsDir)) {
    processDirectory(modelsDir);
  }

  processDirectory(outputDir);

  console.log('✅ allOf类型冲突修复完成!');
}

/**
 * Replace 'any' types with 'unknown' for better type safety
 */
function replaceAnyWithUnknown(outputDir) {
  console.log('🔄 将 any 类型替换为 unknown...');

  if (!fs.existsSync(outputDir)) {
    console.warn('⚠️  API生成目录不存在，跳过any类型替换');
    return;
  }

  const processFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    const replacements = [
      {
        pattern: /\(([^)]*?):\s*any\)/g,
        replacement: (match, paramName) => {
          if (
            paramName.includes('reason?') ||
            paramName.includes('onRejected')
          ) {
            return match;
          }
          return match.replace(': any', ': unknown');
        },
      },
      {
        pattern: /:\s*any(?=\s*[;,=)])/g,
        replacement: ': unknown',
      },
      {
        pattern: /<any>/g,
        replacement: '<unknown>',
      },
      {
        pattern: /\):\s*any(?=\s*=>)/g,
        replacement: '): unknown',
      },
      {
        pattern: /Promise<any>/g,
        replacement: 'Promise<unknown>',
      },
      {
        pattern: /@returns\s+any\b/g,
        replacement: '@returns unknown',
      },
    ];

    replacements.forEach(({ pattern, replacement }) => {
      if (typeof replacement === 'function') {
        content = content.replace(pattern, replacement);
      } else {
        const newContent = content.replace(pattern, replacement);
        if (newContent !== content) {
          updated = true;
          content = newContent;
        }
      }
    });

    const originalContent = fs.readFileSync(filePath, 'utf8');
    if (content !== originalContent) {
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated types in: ${path.relative(outputDir, filePath)}`);
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
      } else if (file.endsWith('.ts')) {
        processFile(filePath);
      }
    }
  };

  processDirectory(outputDir);

  console.log('✅ any类型替换完成!');
}

module.exports = { fixAllOfTypeConflicts, replaceAnyWithUnknown };
