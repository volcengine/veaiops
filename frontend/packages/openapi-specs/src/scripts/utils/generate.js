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
const { execSync } = require('child_process');

/**
 * Generate TypeScript code using openapi-typescript-codegen
 */
async function generateTypeScriptCode(
  openApiSpecPath,
  outputDir,
  openapiCodegenPath,
) {
  console.log('⚙️  使用openapi-typescript-codegen生成TypeScript代码...');

  if (!fs.existsSync(openApiSpecPath)) {
    throw new Error(`OpenAPI规范文件不存在: ${openApiSpecPath}`);
  }

  let command;
  if (fs.existsSync(openapiCodegenPath)) {
    console.log('使用自定义的 openapi-typescript-codegen');
    command = [
      `node ${openapiCodegenPath}`,
      `--input ${openApiSpecPath}`,
      `--output ${outputDir}`,
      '--client fetch',
      '--name VolcAIOpsApi',
      '--exportCore true',
      '--exportServices true',
      '--exportModels true',
      '--exportSchemas false',
    ].join(' ');
  } else {
    console.log('使用标准的 openapi-typescript-codegen');
    try {
      const { generate } = require('openapi-typescript-codegen');
      await generate({
        input: openApiSpecPath,
        output: outputDir,
        clientName: 'VolcAIOpsApi',
        httpClient: 'fetch',
        useOptions: false,
        useUnionTypes: false,
        exportCore: true,
        exportServices: true,
        exportModels: true,
        exportSchemas: false,
        indent: '2',
        postfixServices: 'Service',
        write: true,
      });
      console.log('✅ TypeScript代码生成完成 (programmatic)');
      return;
    } catch (programmaticError) {
      console.warn(
        '⚠️  程序化生成失败，使用CLI方式:',
        programmaticError.message,
      );
      command = `npx openapi-typescript-codegen -i ${openApiSpecPath} -o ${outputDir} --name VolcAIOpsApi`;
    }
  }

  console.log(`执行命令: ${command}`);
  execSync(command, { stdio: 'inherit' });
  console.log('✅ TypeScript代码生成完成');
}

module.exports = { generateTypeScriptCode };
