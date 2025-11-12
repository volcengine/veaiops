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
 * 共享类型定义
 * 用于避免循环依赖
 */
import type { ColumnProps as ArcoColumnProps } from '@arco-design/web-react/es/Table/interface';
import type { ReactNode } from 'react';

/**
 * 基础记录值的联合类型
 * 支持所有常见的数据类型，包括嵌套对象和数组
 * 使用 unknown 作为兜底类型，确保最大兼容性
 */
export type BaseRecordValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>
  | Array<unknown>
  | BaseRecord
  | BaseRecord[]
  | unknown;

/**
 * 基础记录类型
 * 适配 api-generate 生成的所有类型，无需额外索引签名
 *
 * ✅ 兼容性更新：支持 null 值
 * - _id, id, key 字段允许 null（兼容后端可能返回的 null 值）
 * - 提升类型兼容性，避免类型断言
 */
export type BaseRecord = {
  _id?: string | null;
  id?: string | number | null;
  key?: string | number | null;
  [key: string]: BaseRecordValue;
};

/**
 * 现代表格列类型（用于新的插件系统）
 */
export interface ModernTableColumnProps<RecordType = BaseRecord>
  extends ArcoColumnProps<RecordType> {
  hidden?: boolean;
  tooltip?: string;
  copyable?: boolean;
  customRender?: (
    value: unknown,
    record: RecordType,
    index: number,
  ) => ReactNode;
}
