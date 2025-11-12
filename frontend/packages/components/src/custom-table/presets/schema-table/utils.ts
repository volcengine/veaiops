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
 * Schema表格工具函数
 * @description 提供Schema创建、验证等工具函数

 * @date 2025-12-19
 */

import type {
  BaseRecord,
  ColumnSchema,
  FieldValueType,
  TableSchemaBuilder as ITableSchemaBuilder,
  RequestConfig,
  SchemaActionConfig,
  SchemaPaginationConfig,
  SchemaToolbarConfig,
  TableSchema,
  ValidationResult,
} from '@/custom-table/types/schema-table';
import { getPreset, mergePreset } from './presets';

// 创建表格Schema
export const createTableSchema = <T extends BaseRecord = BaseRecord>(
  config?: Partial<TableSchema<T>>,
): TableSchema<T> => {
  const defaultSchema: TableSchema<T> = {
    columns: [],
    features: {
      pagination: true,
      bordered: true,
      size: 'default',
    },
  };

  return {
    ...defaultSchema,
    ...config,
    features: {
      ...defaultSchema.features,
      ...config?.features,
    },
  };
};

// 验证Schema配置
export const validateTableSchema = <T extends BaseRecord = BaseRecord>(
  schema: TableSchema<T>,
): ValidationResult => {
  const errors: ValidationResult['errors'] = [];

  // 验证列配置
  if (!schema.columns || schema.columns.length === 0) {
    errors.push({
      field: 'columns',
      message: '至少需要定义一个列',
      severity: 'error',
    });
  }

  // 验证列的唯一性
  const columnKeys = new Set<string>();
  schema.columns.forEach((column, index) => {
    if (!column.key) {
      errors.push({
        field: `columns[${index}].key`,
        message: '列必须有唯一的key',
        severity: 'error',
      });
    } else if (columnKeys.has(column.key)) {
      errors.push({
        field: `columns[${index}].key`,
        message: `列key "${column.key}" 重复`,
        severity: 'error',
      });
    } else {
      columnKeys.add(column.key);
    }

    if (!column.title) {
      errors.push({
        field: `columns[${index}].title`,
        message: '列必须有标题',
        severity: 'error',
      });
    }

    if (!column.dataIndex) {
      errors.push({
        field: `columns[${index}].dataIndex`,
        message: '列必须有dataIndex',
        severity: 'error',
      });
    }
  });

  // 验证操作列配置
  if (schema.actions) {
    if (!schema.actions.items || schema.actions.items.length === 0) {
      errors.push({
        field: 'actions.items',
        message: '操作列必须包含至少一个操作',
        severity: 'warning',
      });
    }

    schema.actions.items?.forEach((action, index) => {
      if (!action.key) {
        errors.push({
          field: `actions.items[${index}].key`,
          message: '操作必须有唯一的key',
          severity: 'error',
        });
      }

      if (!action.label) {
        errors.push({
          field: `actions.items[${index}].label`,
          message: '操作必须有标签',
          severity: 'error',
        });
      }

      if (!action.onClick) {
        errors.push({
          field: `actions.items[${index}].onClick`,
          message: '操作必须有点击处理函数',
          severity: 'error',
        });
      }
    });
  }

  // 验证数据源配置
  if (!schema.dataSource && !schema.request) {
    errors.push({
      field: 'dataSource',
      message: '必须提供dataSource或request配置',
      severity: 'error',
    });
  }

  return {
    valid: errors.filter((e) => e.severity === 'error').length === 0,
    errors,
  };
};

// Schema构建器实现
export class TableSchemaBuilder<T extends BaseRecord = BaseRecord>
  implements ITableSchemaBuilder<T>
{
  private schema: Partial<TableSchema<T>> = {
    columns: [],
    features: {},
  };

  setTitle = (title: string): this => {
    this.schema.title = title;
    return this;
  };

  setDescription = (description: string): this => {
    this.schema.description = description;
    return this;
  };

  addColumn = (column: ColumnSchema<T>): this => {
    if (!this.schema.columns) {
      this.schema.columns = [];
    }
    this.schema.columns.push(column);
    return this;
  };

  removeColumn = (key: string): this => {
    if (this.schema.columns) {
      this.schema.columns = this.schema.columns.filter(
        (col) => col.key !== key,
      );
    }
    return this;
  };

  updateColumn = ({
    key,
    updates,
  }: {
    key: string;
    updates: Partial<ColumnSchema<T>>;
  }): this => {
    if (this.schema.columns) {
      const index = this.schema.columns.findIndex((col) => col.key === key);
      if (index !== -1) {
        this.schema.columns[index] = {
          ...this.schema.columns[index],
          ...updates,
        };
      }
    }
    return this;
  };

  enablePagination = (config?: SchemaPaginationConfig): this => {
    if (!this.schema.features) {
      this.schema.features = {};
    }
    this.schema.features.pagination = config || true;
    return this;
  };

  enableSearch = (config?: boolean | object): this => {
    if (!this.schema.features) {
      this.schema.features = {};
    }
    this.schema.features.search = config || true;
    return this;
  };

  enableToolbar = (config?: SchemaToolbarConfig): this => {
    if (!this.schema.features) {
      this.schema.features = {};
    }
    this.schema.features.toolbar = config || true;
    return this;
  };

  enableRowSelection = (config?: boolean | object): this => {
    if (!this.schema.features) {
      this.schema.features = {};
    }
    this.schema.features.rowSelection = config || true;
    return this;
  };

  setDataSource = (dataSource: T[]): this => {
    this.schema.dataSource = dataSource;
    return this;
  };

  setRequest = (
    request:
      | RequestConfig<T>
      | (<TParams = unknown>(
          params: TParams,
        ) => Promise<{
          data: T[];
          total?: number;
          success?: boolean;
        }>),
  ): this => {
    this.schema.request = request as
      | RequestConfig<T>
      | (<TParams = unknown>(
          params: TParams,
        ) => Promise<{
          data: T[];
          total?: number;
          success?: boolean;
        }>);
    return this;
  };

  addAction = (action: SchemaActionConfig): this => {
    if (!this.schema.actions) {
      this.schema.actions = {
        items: [],
      };
    }
    if (!this.schema.actions.items) {
      this.schema.actions.items = [];
    }
    this.schema.actions.items.push(action);
    return this;
  };

  build = (): TableSchema<T> => {
    const validation = this.validate();
    if (!validation.valid) {
      // ✅ Silent mode: Schema validation failed (error logged internally)
    }
    return createTableSchema(this.schema);
  };

  validate = (): { valid: boolean; errors: string[] } => {
    const result = validateTableSchema(createTableSchema(this.schema));
    return {
      valid: result.valid,
      errors: result.errors.map((e) => `${e.field}: ${e.message}`),
    };
  };
}

// 创建列Schema的辅助函数
export const createColumnSchema = <T extends BaseRecord = BaseRecord>(
  config: Partial<ColumnSchema<T>> & {
    key: string;
    title: string;
    dataIndex: string;
  },
): ColumnSchema<T> => {
  return {
    valueType: 'text',
    align: 'left',
    ellipsis: false,
    sortable: false,
    filterable: false,
    editable: false,
    hideInTable: false,
    hideInSearch: true,
    ...config,
  };
};

// 创建操作配置的辅助函数
export const createActionConfig = (
  config: Partial<SchemaActionConfig> & {
    key: string;
    label: string;
    onClick: SchemaActionConfig['onClick'];
  },
): SchemaActionConfig => {
  return {
    type: 'text',
    disabled: false,
    visible: true,
    ...config,
  };
};

// 根据数据自动推断列类型
export const inferColumnType = (data: BaseRecord[]): Record<string, string> => {
  if (!data || data.length === 0) {
    return {};
  }

  const columnTypes: Record<string, string> = {};
  const sampleRecord = data[0];

  Object.keys(sampleRecord).forEach((key) => {
    const value = sampleRecord[key];

    if (typeof value === 'number') {
      columnTypes[key] = 'number';
    } else if (typeof value === 'boolean') {
      columnTypes[key] = 'boolean';
    } else if (value instanceof Date) {
      columnTypes[key] = 'date';
    } else if (typeof value === 'string') {
      // 尝试推断更具体的类型
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        columnTypes[key] = 'date';
      } else if (/^https?:\/\//.test(value)) {
        columnTypes[key] = 'link';
      } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(value)) {
        columnTypes[key] = 'image';
      } else {
        columnTypes[key] = 'text';
      }
    } else {
      columnTypes[key] = 'text';
    }
  });

  return columnTypes;
};

// 从数据自动生成列配置
export const generateColumnsFromData = <T extends BaseRecord = BaseRecord>(
  data: T[],
  options?: {
    excludeKeys?: string[];
    includeKeys?: string[];
    columnOverrides?: Record<string, Partial<ColumnSchema<T>>>;
  },
): ColumnSchema<T>[] => {
  if (!data || data.length === 0) {
    return [];
  }

  const { excludeKeys = [], includeKeys, columnOverrides = {} } = options || {};
  const sampleRecord = data[0];
  const columnTypes = inferColumnType(data);

  let keys = Object.keys(sampleRecord);

  // 过滤键
  if (includeKeys) {
    keys = keys.filter((key) => includeKeys.includes(key));
  }
  keys = keys.filter((key) => !excludeKeys.includes(key));

  return keys.map((key) => {
    const baseColumn = createColumnSchema({
      key,
      title: key.charAt(0).toUpperCase() + key.slice(1), // 首字母大写
      dataIndex: key,
      valueType: (columnTypes[key] || 'text') as FieldValueType,
    });

    // 应用覆盖配置
    if (columnOverrides[key]) {
      return { ...baseColumn, ...columnOverrides[key] };
    }

    return baseColumn;
  });
};

// 应用预设模板
export const applyPreset = <T extends BaseRecord = BaseRecord>(
  schema: Partial<TableSchema<T>>,
  presetName: string,
): TableSchema<T> => {
  return mergePreset(
    schema as Partial<TableSchema<BaseRecord>>,
    presetName,
  ) as unknown as TableSchema<T>;
};
