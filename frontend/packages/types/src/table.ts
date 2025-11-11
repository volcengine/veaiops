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
 * 表格相关类型定义
 * 用于统一所有表格场景
 */

import type React from 'react';

/**
 * 基础记录值的联合类型
 * 支持所有常见的数据类型，包括嵌套对象和数组
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
 * 基础查询类型
 * 基于 bam-service 请求类型的通用查询约束
 */
export type BaseQuery = Record<string, unknown>;

/**
 * 插件上下文接口
 */
export interface PluginContext<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
  PProps = Record<string, unknown>,
> {
  readonly props: PProps;
  readonly state: Record<string, unknown>;
  readonly helpers: Record<string, unknown>;
  plugins?: Record<string, unknown>;
}

/**
 * 插件管理器接口
 */
export interface PluginManager {
  context?: PluginContext;
  plugins: Map<string, unknown>;
  metrics: Record<string, unknown>;
}

/**
 * 表格数据源接口
 */
export interface TableDataSource<
  RecordType extends BaseRecord = BaseRecord,
  QueryParams extends Record<string, unknown> = Record<string, unknown>,
> {
  /** 服务实例 */
  serviceInstance?: unknown;
  /** 服务方法名 */
  serviceMethod?: string | symbol | number;
  /** 请求函数 */
  request?: (params: QueryParams) => Promise<unknown>;
  /** 额外的请求参数 */
  payload?: Record<string, unknown>;
  /** 响应数据项的键名 */
  responseItemsKey?: string;
  /** 是否为服务端分页 */
  isServerPagination?: boolean;
  /** 是否为空列过滤 */
  isEmptyColumnsFilter?: boolean;
  /** 是否可以取消请求 */
  isCancel?: boolean;
  /** 是否准备就绪 */
  ready?: boolean;
  /** 是否手动触发 */
  manual?: boolean;
  /** 是否需要继续 */
  needContinue?: boolean;
  /** 是否有更多数据 */
  hasMoreData?: boolean;
  /** 数据列表 */
  data?: RecordType[];
  /** 总数 */
  total?: number;
  /** 加载状态 */
  loading?: boolean;
  /** 错误信息 */
  error?: Error | null;
}

/**
 * 表格操作函数类型
 */
export interface TableActions<T = Record<string, unknown>> {
  /** 编辑操作 */
  onEdit?: (record: T) => Promise<boolean>;
  /** 删除操作 */
  onDelete?: (id: string) => Promise<boolean>;
  /** 创建操作 */
  onCreate?: () => Promise<boolean>;
  /** 查看操作 */
  onView?: (record: T) => void;
  /** 查看详情操作 */
  onViewDetail?: (record: T) => void;
  /** 重试操作 */
  onRetry?: (recordId: string) => void;
  /** 其他自定义操作 */
  customActions?: (record: T) => React.ReactNode;
}

/**
 * 表格数据请求响应
 */
export interface TableDataResponse<T = Record<string, unknown>> {
  /** 数据列表 */
  data: T[];
  /** 总数 */
  total: number;
  /** 是否成功 */
  success: boolean;
}

/**
 * 表格响应数据类型别名
 * @deprecated 请使用 TableDataResponse
 */
export type TableResponseData<T = Record<string, unknown>> =
  TableDataResponse<T>;

/**
 * Render 函数的第一个参数类型
 * 通常是 cell 的值，类型取决于列的 dataIndex
 */
export type CellValue<T, K extends keyof T> = T[K];
/**
 * 表格 Render 函数类型
 */
export type TableRenderFunction<T, K extends keyof T = keyof T> = (
  value: CellValue<T, K>,
  record: T,
  index: number,
) => React.ReactNode;
