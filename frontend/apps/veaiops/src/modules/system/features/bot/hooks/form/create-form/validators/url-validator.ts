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
 * URL validator
 */
export const urlValidator = (
  value: string,
  callback: (error?: string) => void,
): void => {
  if (!value) {
    callback();
    return;
  }
  try {
    /**
     * Why use new URL():
     * - URL constructor is the standard method to validate URL format, no other alternatives
     * - Use try-catch wrapper to ensure type safety
     * - Although using new operator, only for validation, no actual side effects
     */
    const _url = new URL(value);
    // Call success callback after validation passes
    callback();
  } catch {
    callback('请输入有效的URL');
  }
};
