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
const toKebabCase = (str) => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Insert hyphen between lowercase and uppercase letters
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2') // Handle consecutive uppercase letters
    .toLowerCase();
};

/**
 * Convert file name from PascalCase to kebab-case
 */
const convertFileName = (fileName) => {
  const nameWithoutExt = path.parse(fileName).name;
  const { ext } = path.parse(fileName);
  return toKebabCase(nameWithoutExt) + ext;
};

/**
 * Recursively rename files in directory
 */
const renameFilesInDirectory = (dirPath) => {
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
};

/**
 * Update import/export statements in files
 */
const updateImports = (dirPath) => {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      updateImports(filePath);
    } else if (file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let updated = false;

      // Update import statements
      const importPatterns = [
        /from '\.\.?\/models\/(\w+)';/g,
        /from '\.\.?\/services\/(\w+)';/g,
        /from '\.\.?\/core\/(\w+)';/g,
        /from '\.\.?\/\.\.?\/models\/(\w+)';/g,
        /from '\.\.?\/\.\.?\/services\/(\w+)';/g,
        /from '\.\.?\/\.\.?\/core\/(\w+)';/g,
        /from '\.\/(\w+)';/g, // Handle direct file references like './VolcAIOpsApi'
      ];

      importPatterns.forEach((pattern) => {
        content = content.replace(pattern, (match, fileName) => {
          const newFileName = convertFileName(`${fileName}.ts`).replace(
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

      // Update export statements
      const exportPatterns = [
        /from '\.\/models\/(\w+)';/g,
        /from '\.\/services\/(\w+)';/g,
        /from '\.\/core\/(\w+)';/g,
      ];

      exportPatterns.forEach((pattern) => {
        content = content.replace(pattern, (match, fileName) => {
          const newFileName = convertFileName(`${fileName}.ts`).replace(
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
};

// Main execution
const apiGeneratePath = path.resolve(
  __dirname,
  '../../../../apps/volcaiops/api-generate',
);

console.log('Starting file renaming process...');

// Step 1: Rename files

console.log('Step 1: Renaming files...');
renameFilesInDirectory(path.join(apiGeneratePath, 'models'));
renameFilesInDirectory(path.join(apiGeneratePath, 'services'));
renameFilesInDirectory(path.join(apiGeneratePath, 'core'));
// Also rename files in the root directory (excluding index.ts)
renameFilesInDirectory(apiGeneratePath);

// Step 2: Update imports and exports

console.log('Step 2: Updating imports and exports...');
updateImports(apiGeneratePath);

console.log('File renaming process completed!');
