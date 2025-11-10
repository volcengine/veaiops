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

import type { PluginContext } from '@/custom-table/types';

/**
 * Create table event handlers
 */
export function createTableEvents() {
  return {
    // Apply persistent column widths when pagination changes
    onPageChange: (context: PluginContext, ..._args: unknown[]) => {
      setTimeout(() => {
        const persistentWidths =
          (
            context.helpers as unknown as {
              getAllPersistentColumnWidths?: () => Record<string, number>;
            }
          ).getAllPersistentColumnWidths?.() || {};
        if (Object.keys(persistentWidths).length > 0) {
          (
            context.helpers as {
              setBatchPersistentColumnWidths?: (
                widthsMap: Record<string, number>,
              ) => void;
            }
          ).setBatchPersistentColumnWidths?.(persistentWidths);
        }
      }, 50); // Delay application to ensure new page data is rendered
    },

    // Maintain column widths when data changes
    onDataChange: (context: PluginContext, ..._args: unknown[]) => {
      setTimeout(() => {
        const persistentWidths =
          (
            context.helpers as unknown as {
              getAllPersistentColumnWidths?: () => Record<string, number>;
            }
          ).getAllPersistentColumnWidths?.() || {};
        if (Object.keys(persistentWidths).length > 0) {
          (
            context.helpers as {
              setBatchPersistentColumnWidths?: (
                widthsMap: Record<string, number>,
              ) => void;
            }
          ).setBatchPersistentColumnWidths?.(persistentWidths);
        }
      }, 50);
    },
  };
}
