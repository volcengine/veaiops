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

import type { BaseRecord, PluginContext } from '@/custom-table/types';
import { PluginNames } from '@/custom-table/types/constants/enum';
/**
 * Smart cell plugin
 * Based on EPS platform smart empty value handling capability
 */
import React from 'react';
import { SmartEmptyCell } from './components';
import { DEFAULT_SMART_CELL_CONFIG } from './config';
import { useSmartCell } from './hooks';
import type {
  CellRenderParams,
  SmartCellConfig,
  SmartCellState,
} from './types';

/**
 * Base plugin interface
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
 * Smart cell plugin class
 */
export class SmartCellPlugin<RecordType extends BaseRecord = BaseRecord>
  implements BasePlugin<Required<SmartCellConfig>, SmartCellState>
{
  name: string = PluginNames.SMART_CELL;
  config: Required<SmartCellConfig>;

  constructor(config: Partial<SmartCellConfig> = {}) {
    this.config = {
      ...DEFAULT_SMART_CELL_CONFIG,
      ...config,
    } as Required<SmartCellConfig>;
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
      useSmartCell: (options: Parameters<typeof useSmartCell<RecordType>>[0]) =>
        useSmartCell<RecordType>(options),
    };
  }

  getComponents() {
    return {
      SmartEmptyCell: SmartEmptyCell<RecordType>,
    };
  }

  getMethods() {
    return {
      // Plugin methods will be provided through hooks
    };
  }

  render() {
    return {
      // Smart cell is mainly implemented through column render function
      // Here can provide statistics or other auxiliary components
      footer: (context: PluginContext) => {
        const { state } = context;

        if (!this.config.enabled || !(state as any).smartCell) {
          return null;
        }

        // TODO: Can add empty value statistics
        return null;
      },
    };
  }

  // Transform column configuration to support smart cell
  transformColumns<
    ColumnType extends { dataIndex?: string; [key: string]: unknown },
  >(columns: ColumnType[]): ColumnType[] {
    if (!this.config.enabled) {
      return columns;
    }

    return columns.map((column) => {
      const { dataIndex } = column;
      if (!dataIndex || typeof dataIndex !== 'string') {
        return column;
      }

      const fieldConfig = this.config.fieldConfigs?.[dataIndex];

      if (!fieldConfig) {
        return column;
      }

      // Original render function
      const originalRender = column.render;

      return {
        ...column,
        render: (value: unknown, record: RecordType, index: number) => {
          // In actual use, these methods will be obtained from context
          const { userRole } = this.config;
          const context = {
            fieldName: dataIndex,
            dataSize: 'medium' as const,
            hasRelatedData: false,
            isRequired: false,
            emptyRate: 0,
            rowIndex: index,
          };

          // If not empty value, use original render
          if (!this.isEmpty(value)) {
            return originalRender
              ? (originalRender as any)(value, record, index)
              : value;
          }

          // Render smart empty value cell
          const handleEmptyValueClick = this.config.onEmptyValueClick
            ? (params: CellRenderParams<RecordType>) => {
                this.config.onEmptyValueClick?.(params as any);
              }
            : undefined;

          return (
            <SmartEmptyCell<RecordType>
              value={value}
              record={record}
              field={dataIndex}
              emptyConfig={fieldConfig}
              userRole={userRole as any}
              context={context}
              showPermissionHints={this.config.showPermissionHints}
              enableContextualDisplay={this.config.enableContextualDisplay}
              onEmptyValueClick={handleEmptyValueClick}
            >
              {originalRender
                ? (originalRender as any)(value, record, index)
                : value}
            </SmartEmptyCell>
          );
        },
      };
    });
  }

  // Check if value is empty
  private isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) {
      return true;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return true;
    }
    if (Array.isArray(value) && value.length === 0) {
      return true;
    }
    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return true;
    }
    return false;
  }

  getDefaultState(): SmartCellState {
    return {
      emptyFields: new Set(),
      fieldStats: new Map(),
      totalRows: 0,
      userRole: this.config.userRole,
      currentUserRole: this.config.userRole,
      fieldPermissions: new Map(),
      emptyValueStats: {
        totalEmptyCount: 0,
        fieldEmptyCounts: {},
        interactiveEmptyCount: 0,
      },
    };
  }

  validate() {
    const errors: string[] = [];

    if (
      this.config.enabled &&
      (!this.config.fieldConfigs ||
        Object.keys(this.config.fieldConfigs).length === 0)
    ) {
      errors.push(
        'It is recommended to configure field rules when enabling smart cells',
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
