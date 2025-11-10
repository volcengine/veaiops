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
 * Row selection plugin
 * Enhanced plugin based on Arco Table RowSelection capability
 */
import type React from 'react';
import { BatchActions, SelectionStat } from './components';
import { DEFAULT_ROW_SELECTION_CONFIG } from './config';
import { useRowSelection } from './hooks';
import type {
  BatchActionConfig,
  RowSelectionConfig,
  RowSelectionState,
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
 * Row selection plugin class
 */
export class RowSelectionPlugin<RecordType extends BaseRecord = BaseRecord>
  implements
    BasePlugin<
      Required<RowSelectionConfig<RecordType>>,
      RowSelectionState<RecordType>
    >
{
  name: string = PluginNames.ROW_SELECTION;
  config: Required<RowSelectionConfig<RecordType>>;

  constructor(config: Partial<RowSelectionConfig<RecordType>> = {}) {
    this.config = { ...DEFAULT_ROW_SELECTION_CONFIG, ...config } as Required<
      RowSelectionConfig<RecordType>
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
      useRowSelection: (
        options: Parameters<typeof useRowSelection<RecordType>>[0],
      ) => useRowSelection<RecordType>(options),
    };
  }

  getComponents(): Record<string, React.ComponentType<unknown>> {
    return {
      BatchActions: BatchActions as React.ComponentType<unknown>,
      SelectionStat: SelectionStat as React.ComponentType<unknown>,
    };
  }

  getMethods() {
    return {
      // Plugin methods will be provided through hooks
    };
  }

  render() {
    return {
      header: (context: PluginContext) => {
        const { state } = context;

        if (!this.config.enabled || !this.config.selectionStat?.show) {
          return null;
        }

        const { position } = this.config.selectionStat;
        if (position === 'footer' || position === 'both') {
          return null; // Do not render at header position
        }

        return (
          <SelectionStat<RecordType>
            selectionState={
              (state.rowSelection as any) || this.getDefaultState()
            }
            config={this.config.selectionStat}
            className="header"
          />
        );
      },

      footer: (context: PluginContext) => {
        const { state } = context;

        if (!this.config.enabled || !this.config.selectionStat?.show) {
          return null;
        }

        const { position } = this.config.selectionStat;
        if (position === 'header') {
          return null; // Do not render at footer position
        }

        return (
          <SelectionStat<RecordType>
            selectionState={
              (state.rowSelection as any) || this.getDefaultState()
            }
            config={this.config.selectionStat}
            className="footer"
          />
        );
      },

      toolbar: (context: PluginContext) => {
        const { state, methods } = context;

        if (!this.config.enabled || !this.config.batchActions?.length) {
          return null;
        }

        const executeBatchAction = ((methods as any)?.executeBatchAction ||
          (async () => {
            // Default empty implementation
          })) as (action: BatchActionConfig<RecordType>) => Promise<void>;

        return (
          <BatchActions<RecordType>
            actions={this.config.batchActions}
            selectionState={
              ((state as any).rowSelection ||
                this.getDefaultState()) as RowSelectionState<RecordType>
            }
            onExecuteAction={
              executeBatchAction ||
              (async () => {
                // Default empty implementation
              })
            }
          />
        );
      },
    };
  }

  getDefaultState(): RowSelectionState<RecordType> {
    return {
      selectedRowKeys: [],
      selectedRows: [],
      indeterminateKeys: [],
      allSelectedKeys: [],
      isAllSelected: false,
      isIndeterminate: false,
      selectionStat: {
        selectedCount: 0,
        totalCount: 0,
        currentPageCount: 0,
        selectedPercent: 0,
      },
      selectionCache: new Map(),
    };
  }

  validate() {
    return {
      isValid: true,
      errors: [],
    };
  }
}
