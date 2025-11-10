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

import type { FilterPluginRenderProps } from '@veaiops/types';
import React, { useState } from 'react';
import { type FieldItem, Filters } from './index';
import { filterPluginRegistry, pluginExtensionManager } from './plugins';

/**
 * Plugin-based filter usage example
 */
export const FilterExample: React.FC = () => {
  const [query, setQuery] = useState<Record<string, unknown>>({});

  // Example configuration - using plugin system
  const filterConfig: FieldItem[] = [
    {
      field: 'name',
      label: 'Name',
      type: 'Input',
      componentProps: {
        placeholder: 'Please enter name',
        allowClear: true,
      },
    },
    {
      field: 'age',
      label: 'Age',
      type: 'InputNumber',
      componentProps: {
        placeholder: 'Please enter age',
        min: 0,
        max: 120,
      },
    },
    {
      field: 'status',
      label: 'Status',
      type: 'Select',
      componentProps: {
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Pending', value: 'pending' },
        ],
      },
    },
    {
      field: 'category',
      label: 'Category',
      type: 'Cascader',
      componentProps: {
        options: [
          {
            value: 'tech',
            label: 'Technology',
            children: [
              { value: 'frontend', label: 'Frontend' },
              { value: 'backend', label: 'Backend' },
            ],
          },
          {
            value: 'design',
            label: 'Design',
            children: [
              { value: 'ui', label: 'UI Design' },
              { value: 'ux', label: 'UX Design' },
            ],
          },
        ],
      },
    },
    {
      field: 'dateRange',
      label: 'Date Range',
      type: 'RangePicker',
      componentProps: {
        format: 'YYYY-MM-DD',
      },
    },
    {
      field: 'tags',
      label: 'Tags',
      type: 'InputTag',
      componentProps: {
        placeholder: 'Please enter tags',
      },
    },
    {
      field: 'isActive',
      label: 'Is Active',
      type: 'Checkbox',
      componentProps: {
        label: 'Active Status',
      },
    },
    {
      field: 'customerIDs',
      label: 'Account',
      type: 'Select.Account',
      componentProps: {
        mode: 'multiple',
        maxTagCount: 1,
        placeholder: 'Please select account',
        allowClear: true,
      },
    },
    {
      field: 'employeeIDs',
      label: 'Employee',
      type: 'Select.Employee',
      componentProps: {
        mode: 'multiple',
        maxTagCount: 2,
        placeholder: '请选择员工',
        allowClear: true,
      },
    },
  ];

  // Custom configuration example
  React.useEffect(() => {
    // Add global configuration for Input component
    pluginExtensionManager.setGlobalConfig({
      pluginType: 'Input',
      config: {
        size: 'default',
        autoComplete: 'off',
      },
    });

    // Add custom hooks for Select component
    pluginExtensionManager.registerHooks({
      pluginType: 'Select',
      hooks: {
        beforeRender: (props: FilterPluginRenderProps) => {
          return {
            ...props,
            hijackedProps: {
              ...props.hijackedProps,
              showSearch: true,
              filterOption: true,
            },
          };
        },
      },
    });
  }, []);

  const handleReset = () => {
    setQuery({});
  };

  const handleQueryChange = (newQuery: Record<string, unknown>) => {
    setQuery(newQuery);
  };

  // Get plugin system statistics
  const pluginStats = filterPluginRegistry.getStats();
  const extensionStats = pluginExtensionManager.getStats();

  return (
    <div style={{ padding: '20px' }}>
      <h2>Plugin-based filter example</h2>

      {/* Plugin system information */}
      <div
        style={{
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
        }}
      >
        <h4>插件系统状态</h4>
        <p>已注册插件: {pluginStats.total} 个</p>
        <p>插件类型: {pluginStats.types.join(', ')}</p>
        <p>扩展钩子: {extensionStats.hooksCount} 个</p>
        <p>全局配置: {extensionStats.configsCount} 个</p>
      </div>

      {/* Filter component */}
      <Filters
        config={filterConfig}
        query={query}
        showReset={true}
        resetFilterValues={handleReset}
        filterStyle={{
          isWithBackgroundAndBorder: true,
          style: { padding: '16px' },
        }}
      />

      {/* Current query state */}
      <div style={{ marginTop: '20px' }}>
        <h4>当前查询状态:</h4>
        <pre
          style={{
            backgroundColor: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px',
          }}
        >
          {JSON.stringify(query, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default FilterExample;
