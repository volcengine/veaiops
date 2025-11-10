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
 * Common utility types
 */

/**
 * 从对象中移除指定的键的参数接口
 */
export interface OmitObjectKeysParams<T extends Record<string, any>> {
  obj: T;
  keys: string[];
}

/**
 * 表单数据属性类型
 */
export interface FormTableDataProps<
  RecordType = unknown,
  FormatRecordType = RecordType,
> {
  sourceData?: RecordType[];
  formattedData?: FormatRecordType[];
  [key: string]: unknown;
}

/**
 * 安全JSON解析参数接口
 */
export interface SafeJSONParseParams {
  valueString: undefined | string;
  empty?: unknown;
  shouldThrow?: boolean;
}
