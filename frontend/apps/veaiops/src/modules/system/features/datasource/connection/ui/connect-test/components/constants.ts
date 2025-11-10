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

/**
 * Connection test modal related constants
 */

// Suggestions checklist
export const CONNECTION_TEST_SUGGESTIONS = [
  '网络连接是否正常',
  'API地址是否正确',
  '用户名和密码是否正确',
  '服务器是否可访问',
] as const;

// Test status type
export type TestStatus = 'loading' | 'success' | 'error' | 'idle';

// Status message configuration
export const STATUS_MESSAGES = {
  loading: {
    title: '正在测试连接',
    description: '请稍候，我们正在验证您的连接配置...',
    color: 'var(--color-text-1)',
  },
  success: {
    title: '连接测试成功',
    description: '恭喜！您的连接配置正确，可以正常使用。',
    color: '#00b42a',
  },
  error: {
    title: '连接测试失败',
    description: '很抱歉，连接测试未通过。请检查配置后重试。',
    color: '#f53f3f',
  },
  idle: {
    title: '准备开始测试',
    description: '点击"重新测试"按钮开始验证连接配置。',
    color: 'var(--color-text-1)',
  },
} as const;
