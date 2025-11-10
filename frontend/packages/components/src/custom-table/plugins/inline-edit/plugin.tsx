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

import { PluginNames } from '@/custom-table/types/constants/enum';
/**
 * Inline Edit Plugin
 * Based on EPS platform editable table capability
 */
import type { BaseRecord } from '@/custom-table/types/core/common';
import { EditableCell } from './components';
import { DEFAULT_INLINE_EDIT_CONFIG } from './config';
import { useInlineEdit } from './hooks';
import type { EditState, InlineEditConfig } from './types';

/**
 * Base Plugin Interface
 */
interface BasePlugin<ConfigType = unknown, StateType = unknown> {
  name: string;
  config: ConfigType;
  install: () => Promise<void>;
  uninstall: () => Promise<void>;
  activate: () => Promise<void>;
  deactivate: () => Promise<void>;
  getDefaultState: () => StateType;
  validate: () => { isValid: boolean; errors: string[] };
}

/**
 * Inline Edit Plugin Class
 */
export class InlineEditPlugin<RecordType extends BaseRecord = BaseRecord>
  implements
    BasePlugin<Required<InlineEditConfig<RecordType>>, EditState<RecordType>>
{
  name: string = PluginNames.INLINE_EDIT;
  config: Required<InlineEditConfig<RecordType>>;

  constructor(config: Partial<InlineEditConfig<RecordType>> = {}) {
    this.config = { ...DEFAULT_INLINE_EDIT_CONFIG, ...config } as Required<
      InlineEditConfig<RecordType>
    >;
  }

  install() {
    // Plugin installation logic
    return Promise.resolve();
  }

  uninstall() {
    // Plugin uninstallation logic
    return Promise.resolve();
  }

  activate() {
    // Plugin activation logic
    return Promise.resolve();
  }

  deactivate() {
    // Plugin deactivation logic
    return Promise.resolve();
  }

  getHooks() {
    return {
      useInlineEdit: (
        options: Parameters<typeof useInlineEdit<RecordType>>[0],
      ) => useInlineEdit<RecordType>(options),
    };
  }

  getComponents() {
    return {
      EditableCell: EditableCell<RecordType>,
    };
  }

  getMethods() {
    return {
      // Plugin methods will be provided through hooks
    };
  }

  render() {
    return {
      // Inline editing is mainly implemented through column render functions
      // Toolbar or other auxiliary components can be provided here
      toolbar: (context: any) => {
        const { state, methods } = context;

        if (!this.config.enabled || !this.config.allowBatchEdit) {
          return null;
        }

        // TODO: Can add batch edit toolbar
        return null;
      },
    };
  }

  // Transform column configuration to support editing
  transformColumns<
    ColumnType extends {
      dataIndex?: string;
      render?: (...args: unknown[]) => React.ReactNode;
      [key: string]: unknown;
    },
  >(columns: ColumnType[]): ColumnType[] {
    if (!this.config.enabled) {
      return columns;
    }

    return columns.map((column) => {
      const fieldConfig = this.config.fields?.find(
        (f) => f.dataIndex === column.dataIndex,
      );

      if (!fieldConfig) {
        return column;
      }

      // Original render function
      const originalRender = column.render;

      return {
        ...column,
        render: (value: unknown, record: RecordType, index: number) => {
          // In actual use, these methods will be obtained from context
          const isEditing = false; // methods.isEditing(getRowKey(record), column.dataIndex);
          const onStartEdit = () => {
            // TODO: methods.startEdit(getRowKey(record), column.dataIndex);
          };
          const onFinishEdit = async (_editValue: unknown) => {
            // TODO: methods.finishEdit(editValue);
          };
          const onCancelEdit = () => {
            // TODO: methods.cancelEdit();
          };

          // Render editable cell
          return (
            <EditableCell<RecordType>
              value={value}
              record={record}
              fieldConfig={fieldConfig}
              mode={this.config.mode}
              trigger={this.config.trigger}
              editing={isEditing}
              onStartEdit={onStartEdit}
              onFinishEdit={onFinishEdit}
              onCancelEdit={onCancelEdit}
            >
              {originalRender
                ? (originalRender(value, record, index) as any)
                : value}
            </EditableCell>
          );
        },
      };
    });
  }

  getDefaultState(): EditState<RecordType> {
    return {
      editingCells: new Map(),
      editingRows: new Set(),
      originalValues: new Map(),
      validationErrors: new Map(),
      hasChanges: false,
      isAnyEditing: false,
      editingValues: new Map(),
      editingErrors: new Map(),
      hasUnsavedChanges: false,
      validationState: new Map(),
    };
  }

  validate() {
    const errors: string[] = [];

    if (
      this.config.enabled &&
      (!this.config.fields || this.config.fields.length === 0)
    ) {
      errors.push(
        'Edit fields must be configured when enabling inline editing',
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
