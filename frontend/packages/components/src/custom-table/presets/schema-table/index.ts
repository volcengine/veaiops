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
 * Schema-driven table component
 * @description Quickly build tables through configuration + Schema approach, supports filtering and other features
 *
 * @date 2025-12-19
 */

export type {
  SchemaTableProps,
  TableSchema,
  ColumnSchema,
  SchemaFilterConfig,
  SchemaActionConfig,
  SchemaPaginationConfig,
  BaseRecord,
  SchemaToolbarConfig,
  RequestConfig,
  PresetTemplate,
  ValidationResult,
  SchemaTableInstance,
  FieldValueType,
  FilterType,
} from '@/custom-table/types/schema-table';

// TableSchemaBuilder is a class, needs to be exported separately (types are already exported via export * from '@/custom-table/types/schema-table')
export { TableSchemaBuilder } from './utils';
