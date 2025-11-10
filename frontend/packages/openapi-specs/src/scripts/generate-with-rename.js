#!/usr/bin/env node

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

const path = require('path');
const { cleanupOldGeneration } = require('./utils/cleanup');
const { generateTypeScriptCode } = require('./utils/generate');
const { removeGeneratedComments } = require('./utils/comments');
const { executeRename } = require('./utils/rename');
const {
  fixAllOfTypeConflicts,
  replaceAnyWithUnknown,
} = require('./utils/fix-types');
const { validateResult, countGeneratedFiles } = require('./utils/validate');

/**
 * Complete API generation and renaming automation script
 * Includes: generate OpenAPI spec → generate TypeScript code → execute rename
 */
class GenerateWithRename {
  constructor() {
    this.outputDir = path.resolve(
      __dirname,
      '../../../../apps/veaiops/api-generate',
    );
    this.openApiSpecPath = path.resolve(
      __dirname,
      '../../../../openapi-spec.json',
    );
    this.openapiCodegenPath = path.resolve(
      __dirname,
      '../../../../../../openapi-typescript-codegen/bin/index.js',
    );
  }

  /**
   * Main generation flow
   */
  async generate() {
    console.log('🚀 开始完整的API生成和重命名流程...');

    try {
      cleanupOldGeneration(this.outputDir);

      await generateTypeScriptCode(
        this.openApiSpecPath,
        this.outputDir,
        this.openapiCodegenPath,
      );

      removeGeneratedComments(this.outputDir);

      executeRename(this.outputDir);

      fixAllOfTypeConflicts(this.outputDir);

      replaceAnyWithUnknown(this.outputDir);

      validateResult(this.outputDir);

      console.log('🎉 完整的API生成和重命名流程完成!');
      console.log(`📁 生成目录: ${this.outputDir}`);
      console.log(`📊 总文件数: ${countGeneratedFiles(this.outputDir)}`);
    } catch (error) {
      console.error('❌ 生成过程中出现错误:', error.message);
      throw error;
    }
  }
}

// If this script is run directly
if (require.main === module) {
  const generator = new GenerateWithRename();
  generator.generate().catch((error) => {
    console.error('❌ 脚本执行失败:', error);
    throw error;
  });
}

module.exports = GenerateWithRename;
