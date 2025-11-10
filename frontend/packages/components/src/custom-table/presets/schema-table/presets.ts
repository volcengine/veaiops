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
 * Schema table preset templates
 * @description Provides commonly used table configuration templates
 *
 * @date 2025-12-19
 */

import type {
  PresetTemplate,
  TableSchema,
} from '@/custom-table/types/schema-table';

// Basic table preset
const basicPreset: Partial<TableSchema> = {
  features: {
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: true,
      pageSizeOptions: ['10', '20', '50', '100'],
    },
    bordered: true,
    size: 'default',
  },
};

// Advanced search table preset
const advancedPreset: Partial<TableSchema> = {
  features: {
    pagination: {
      current: 1,
      pageSize: 20,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: true,
      pageSizeOptions: ['10', '20', '50', '100'],
    },
    search: {
      layout: 'horizontal',
      collapsed: true,
      resetText: 'Reset',
      searchText: 'Search',
    },
    toolbar: {
      settings: {
        density: true,
        columnSetting: true,
        fullScreen: true,
        reload: true,
      },
    },
    bordered: true,
    size: 'default',
  },
};

// Editable table preset
const editablePreset: Partial<TableSchema> = {
  features: {
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showTotal: true,
    },
    rowSelection: {
      type: 'checkbox',
      fixed: true,
    },
    editable: true,
    bordered: true,
    size: 'default',
  },
};

// Read-only table preset
const readonlyPreset: Partial<TableSchema> = {
  features: {
    pagination: {
      current: 1,
      pageSize: 20,
      showSizeChanger: false,
      showQuickJumper: false,
      showTotal: true,
      simple: true,
    },
    bordered: false,
    size: 'small',
  },
};

// Mobile table preset
const mobilePreset: Partial<TableSchema> = {
  features: {
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: false,
      showQuickJumper: false,
      showTotal: false,
      simple: true,
      size: 'small',
    },
    bordered: false,
    size: 'small',
  },
};

// Dashboard table preset
const dashboardPreset: Partial<TableSchema> = {
  features: {
    pagination: {
      current: 1,
      pageSize: 5,
      showSizeChanger: false,
      showQuickJumper: false,
      showTotal: false,
      simple: true,
      size: 'small',
    },
    toolbar: {
      settings: {
        reload: true,
      },
    },
    bordered: false,
    size: 'small',
  },
};

// Default preset templates
export const DEFAULT_PRESETS: Record<string, PresetTemplate> = {
  basic: {
    name: 'Basic Table',
    description: 'Standard table with basic pagination and sorting features',
    schema: basicPreset,
  },
  advanced: {
    name: 'Advanced Table',
    description:
      'Table with advanced features including search, toolbar, and column settings',
    schema: advancedPreset,
  },
  editable: {
    name: 'Editable Table',
    description:
      'Interactive table supporting inline editing and row selection',
    schema: editablePreset,
  },
  readonly: {
    name: 'Read-only Table',
    description:
      'Simple read-only display table, suitable for data display scenarios',
    schema: readonlyPreset,
  },
  mobile: {
    name: 'Mobile Table',
    description: 'Compact table adapted for mobile devices',
    schema: mobilePreset,
  },
  dashboard: {
    name: 'Dashboard Table',
    description: 'Small data display table suitable for dashboards',
    schema: dashboardPreset,
  },
};

// Get preset configuration
export const getPreset = (presetName: string): Partial<TableSchema> => {
  const preset = DEFAULT_PRESETS[presetName];
  if (!preset) {
    return DEFAULT_PRESETS.basic.schema;
  }
  return preset.schema;
};

// Merge preset configuration
export const mergePreset = (
  baseSchema: Partial<TableSchema>,
  presetName: string,
): TableSchema => {
  const presetSchema = getPreset(presetName);

  return {
    ...presetSchema,
    ...baseSchema,
    features: {
      ...presetSchema.features,
      ...baseSchema.features,
    },
    style: {
      ...presetSchema.style,
      ...baseSchema.style,
    },
  } as TableSchema;
};

// List all available presets
export const listPresets = (): Array<{
  key: string;
  name: string;
  description: string;
}> => {
  return Object.entries(DEFAULT_PRESETS).map(([key, preset]) => ({
    key,
    name: preset.name,
    description: preset.description,
  }));
};
