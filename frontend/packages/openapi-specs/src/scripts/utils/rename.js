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
 * Convert PascalCase or camelCase to kebab-case
 */
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Convert file name from PascalCase to kebab-case
 */
function convertFileName(fileName) {
  const nameWithoutExt = path.parse(fileName).name;
  const { ext } = path.parse(fileName);
  return toKebabCase(nameWithoutExt) + ext;
}

/**
 * Recursively rename files in directory
 */
function renameFilesInDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      renameFilesInDirectory(filePath);
    } else if (file.endsWith('.ts') && file !== 'index.ts') {
      const newFileName = convertFileName(file);
      if (newFileName !== file) {
        const newFilePath = path.join(dirPath, newFileName);
        console.log(`Renaming: ${filePath} -> ${newFilePath}`);
        fs.renameSync(filePath, newFilePath);
      }
    }
  }
}

/**
 * Update import/export statements in files
 */
function updateImports(dirPath, convertFileNameFn) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      updateImports(filePath, convertFileNameFn);
    } else if (file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let updated = false;

      const importPatterns = [
        /from '\.\.?\/models\/(\w+)';/g,
        /from '\.\.?\/services\/(\w+)';/g,
        /from '\.\.?\/core\/(\w+)';/g,
        /from '\.\.?\/\.\.?\/models\/(\w+)';/g,
        /from '\.\.?\/\.\.?\/services\/(\w+)';/g,
        /from '\.\.?\/\.\.?\/core\/(\w+)';/g,
        /from '\.\/(\w+)';/g,
      ];

      importPatterns.forEach((pattern) => {
        content = content.replace(pattern, (match, fileName) => {
          const newFileName = convertFileNameFn(`${fileName}.ts`).replace(
            '.ts',
            '',
          );
          if (newFileName !== fileName) {
            updated = true;
            return match.replace(fileName, newFileName);
          }
          return match;
        });
      });

      const exportPatterns = [
        /from '\.\/models\/(\w+)';/g,
        /from '\.\/services\/(\w+)';/g,
        /from '\.\/core\/(\w+)';/g,
      ];

      exportPatterns.forEach((pattern) => {
        content = content.replace(pattern, (match, fileName) => {
          const newFileName = convertFileNameFn(`${fileName}.ts`).replace(
            '.ts',
            '',
          );
          if (newFileName !== fileName) {
            updated = true;
            return match.replace(fileName, newFileName);
          }
          return match;
        });
      });

      if (updated) {
        console.log(`Updating imports in: ${filePath}`);
        fs.writeFileSync(filePath, content);
      }
    }
  }
}

/**
 * Execute rename operation
 */
function executeRename(outputDir) {
  console.log('🔄 执行文件重命名操作...');

  if (!fs.existsSync(outputDir)) {
    throw new Error(`生成目录不存在: ${outputDir}`);
  }

  console.log('Step 1: Renaming files...');
  renameFilesInDirectory(path.join(outputDir, 'models'));
  renameFilesInDirectory(path.join(outputDir, 'services'));
  renameFilesInDirectory(path.join(outputDir, 'core'));
  renameFilesInDirectory(outputDir);

  console.log('Step 2: Updating imports and exports...');
  updateImports(outputDir, convertFileName);

  console.log('✅ 文件重命名完成');
}

module.exports = {
  executeRename,
  toKebabCase,
  convertFileName,
  renameFilesInDirectory,
  updateImports,
};
