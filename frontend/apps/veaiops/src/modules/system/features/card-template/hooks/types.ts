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
 * Card Template Hook type definitions
 */

import type { Form } from '@arco-design/web-react';
import type {
  BaseQuery,
  CustomTableActionType,
  FieldItem,
  HandleFilterProps,
  ModernTableColumnProps,
  QueryFormat,
  useBusinessTable,
} from '@veaiops/components';
import type {
  AgentTemplate,
  AgentTemplateCreateRequest,
  AgentTemplateUpdateRequest,
} from 'api-generate';
import type React from 'react';

/**
 * Card Template table configuration Hook options type
 */
export interface UseCardTemplateTableConfigOptions {
  onEdit?: (record: AgentTemplate) => Promise<boolean>;
  onDelete?: (templateId: string) => Promise<boolean>;
  onCreate?: () => Promise<boolean>;
  onToggleStatus?: (templateId: string, status: boolean) => Promise<boolean>;
  /**
   * Table ref for refresh operations
   * If not provided, a new ref will be created internally
   */
  ref?: React.RefObject<CustomTableActionType<AgentTemplate, BaseQuery>>;
}

/**
 * Card Template table configuration Hook return type
 */
export interface UseCardTemplateTableConfigReturn {
  // Table configuration
  customTableProps: Record<string, unknown>;
  customOperations: ReturnType<typeof useBusinessTable>['customOperations'];
  handleColumns: (
    props?: Record<string, unknown>,
  ) => ModernTableColumnProps<AgentTemplate>[];
  handleFilters: (props: HandleFilterProps<BaseQuery>) => FieldItem[];
  renderActions: (props?: Record<string, unknown>) => React.ReactNode[];
  queryFormat: QueryFormat;

  // Business logic state
  modalVisible: boolean;
  editingTemplate: AgentTemplate | null;
  form: ReturnType<typeof Form.useForm>[0];

  // Business logic handlers
  handleEdit: (template: AgentTemplate) => void; // Only responsible for opening modal, no return value needed
  handleAdd: () => void; // Only responsible for opening modal, no return value needed
  handleCancel: () => void;
  handleSubmit: (
    values: AgentTemplateCreateRequest | AgentTemplateUpdateRequest,
  ) => Promise<boolean>;
  handleDelete: (templateId: string) => Promise<boolean>;
}
