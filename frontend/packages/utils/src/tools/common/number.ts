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
 * Number conversion utilities
 */

/**
 * 检查是否可以转换为数字
 */
export const canConvertToNumber = (value: any): boolean => {
  return (
    !Number.isNaN(Number(value)) &&
    value !== '' &&
    value !== null &&
    value !== undefined
  );
};

/**
 * 转换为数字
 */
export const toNumber = (value: any): number => {
  return canConvertToNumber(value) ? Number(value) : value;
};
