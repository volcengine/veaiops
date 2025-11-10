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
 * Subscription relation form validation rules
 */

/**
 * Subscription name validation rules
 */
export const subscribeNameRules = [
  { required: true, message: '请输入订阅名称' },
  {
    validator: (value: string, callback: (error?: string) => void) => {
      if (value && !/^[a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
        callback('仅支持汉字和英文');
      } else {
        callback();
      }
    },
  },
];

/**
 * Webhook URL validation rules
 */
export const webhookUrlRules = [
  {
    required: true,
    message: '启用Webhook时必须填写端点地址',
  },
  {
    validator: (value: string, callback: (error?: string) => void) => {
      if (value && !/^https?:\/\/.+/.test(value)) {
        callback('请输入有效的URL地址');
      } else {
        callback();
      }
    },
  },
];

/**
 * Webhook request headers JSON validation rules
 */
export const webhookHeadersRules = [
  {
    validator: (value: string, callback: (error?: string) => void) => {
      if (!value) {
        callback();
        return;
      }
      try {
        JSON.parse(value);
        callback();
      } catch (error: unknown) {
        // ✅ Correct: Extract actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage =
          errorObj.message || '请输入有效的JSON格式';
        callback(errorMessage);
      }
    },
  },
];
