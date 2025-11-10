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
 * Validate generated result
 */
function validateResult(outputDir) {
  console.log('🔍 验证生成结果...');

  const modelsDir = path.join(outputDir, 'models');
  const servicesDir = path.join(outputDir, 'services');
  const coreDir = path.join(outputDir, 'core');
  const indexFile = path.join(outputDir, 'index.ts');

  if (!fs.existsSync(modelsDir)) {
    throw new Error('models目录不存在');
  }
  if (!fs.existsSync(servicesDir)) {
    throw new Error('services目录不存在');
  }
  if (!fs.existsSync(coreDir)) {
    throw new Error('core目录不存在');
  }
  if (!fs.existsSync(indexFile)) {
    throw new Error('index.ts文件不存在');
  }

  const modelFiles = fs.readdirSync(modelsDir).filter((f) => f.endsWith('.ts'));
  const serviceFiles = fs
    .readdirSync(servicesDir)
    .filter((f) => f.endsWith('.ts'));
  const coreFiles = fs.readdirSync(coreDir).filter((f) => f.endsWith('.ts'));

  console.log('📊 生成统计:');
  console.log(`   - 模型文件: ${modelFiles.length} 个`);
  console.log(`   - 服务文件: ${serviceFiles.length} 个`);
  console.log(`   - 核心文件: ${coreFiles.length} 个`);

  const allFiles = [...modelFiles, ...serviceFiles, ...coreFiles];
  const nonKebabFiles = allFiles.filter((f) => {
    const nameWithoutExt = f.replace('.ts', '');
    return (
      nameWithoutExt !== nameWithoutExt.toLowerCase() ||
      nameWithoutExt.includes('_') ||
      /[A-Z]/.test(nameWithoutExt)
    );
  });

  if (nonKebabFiles.length > 0) {
    console.warn(`⚠️  发现非kebab-case格式的文件: ${nonKebabFiles.join(', ')}`);
  } else {
    console.log('✅ 所有文件都使用kebab-case命名格式');
  }
}

/**
 * Count generated files
 */
function countGeneratedFiles(outputDir) {
  const countFiles = (dir) => {
    if (!fs.existsSync(dir)) {
      return 0;
    }
    return fs.readdirSync(dir).filter((f) => f.endsWith('.ts')).length;
  };

  const modelCount = countFiles(path.join(outputDir, 'models'));
  const serviceCount = countFiles(path.join(outputDir, 'services'));
  const coreCount = countFiles(path.join(outputDir, 'core'));
  const indexCount = fs.existsSync(path.join(outputDir, 'index.ts')) ? 1 : 0;

  return modelCount + serviceCount + coreCount + indexCount;
}

module.exports = { validateResult, countGeneratedFiles };

