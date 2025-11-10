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

module.exports = {
  root: true,
  extends: ['@modern-js/eslint-config', 'plugin:react-hooks/recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  rules: {
    // Disable most strict rules, keep essential code quality checks
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/lines-between-class-members': 'off',
    '@typescript-eslint/typedef': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    '@typescript-eslint/no-unsafe-enum-comparison': 'off',
    '@typescript-eslint/no-redundant-type-constituents': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-redeclare': 'off', // Allow type and value with same name (TypeScript feature)
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off',
    'react/no-array-index-key': 'off',
    'no-console': 'off',
    'no-magic-numbers': 'off',
    'no-unused-vars': 'off',
    // Disable Node.js compatibility checks since the project uses Node.js >= 18
    'node/no-unsupported-features/node-builtins': 'off',
    'node/no-unsupported-features/es-builtins': 'off',
    'node/prefer-global/url': 'off',
    'node/prefer-global/url-search-params': 'off',
    // Disable React Hooks dependency check (overly strict)
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off',
    // Disable Prettier-related rules (project uses Biome for formatting)
    'prettier/prettier': 'off',
    // Disable some overly strict rules
    '@typescript-eslint/no-empty-function': 'off', // Allow empty functions (used as placeholders)
    'no-nested-ternary': 'warn', // Nested ternary expressions set to warning
    'spaced-comment': 'off', // Comment formatting handled by Biome
    'eslint-comments/no-unused-disable': 'warn', // Unused eslint-disable set to warning
    '@typescript-eslint/await-thenable': 'warn', // Await non-Promise set to warning
    '@typescript-eslint/no-base-to-string': 'off', // Allow using String() to convert objects
    // Keep basic import rules, but disable import/order (handled by Biome)
    // Completely disable import/export to avoid stack overflow during circular reference checks
    'import/export': 'off', // Completely disabled to avoid stack overflow (checked by TypeScript compiler)
    'import/no-duplicates': 'error',
    'import/order': 'off', // Import order handled by Biome
    // Adjust max-lines: 500 is a reasonable upper bound for complex components and utilities
    'max-lines': [
      'warn',
      { max: 500, skipBlankLines: true, skipComments: true },
    ],
  },
  ignorePatterns: [
    '**/api-generate/**/*',
    'packages/api-client/src/models/**/*', // Auto-generated API models; ignore namespace and naming rule errors
    'packages/api-client/src/services/**/*', // Auto-generated API services; ignore namespace and naming rule errors
    'packages/api-client/src/core/**/*', // Auto-generated API core code
    '**/doc/**/*',
    '**/dist/**/*',
    '**/output/**/*',
    '**/node_modules/**/*',
    '**/*.tsbuildinfo',
    '**/*.css',
    '**/*.less',
    '**/*.debug.ts', // Debug files - exclude from ESLint checks
    '**/*.debug.tsx', // Debug files - exclude from ESLint checks
  ],
  overrides: [
    {
      files: [
        '.eslintrc.js',
        '*.config.js',
        '*.config.ts',
        '*.config.mjs',
        '*.js',
      ],
      rules: {
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
    // Specify correct project config for TypeScript files under packages
    // ✅ Fixed: Use correct project paths relative to tsconfigRootDir
    {
      files: ['packages/**/*.ts', 'packages/**/*.tsx'],
      parserOptions: {
        project: ['./tsconfig.json', './packages/*/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
    // Specify correct project config for TypeScript files under apps
    // ✅ Fixed: Use explicit path to apps/veaiops/tsconfig.json
    // Root tsconfig.json includes "apps/**/*" and references apps/veaiops/tsconfig.json
    // apps/veaiops/tsconfig.json includes "src/**/*" which contains the actual source files
    {
      files: ['apps/**/*.ts', 'apps/**/*.tsx'],
      parserOptions: {
        // ✅ Fixed: Include both root and app-specific tsconfig to ensure all files are found
        // Root tsconfig.json includes "global.d.ts" and base paths
        // apps/veaiops/tsconfig.json includes "src/**/*" which contains the actual source files
        project: ['./tsconfig.json', './apps/veaiops/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
  ],
};
