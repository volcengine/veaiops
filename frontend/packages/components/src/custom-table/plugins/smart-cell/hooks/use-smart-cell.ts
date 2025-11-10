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

import type {
  BaseRecord,
  CellRenderParams,
  EmptyValueConfig,
  EmptyValueContext,
  SmartCellConfig,
  SmartCellMethods,
  SmartCellState,
  UserRole,
} from '@/custom-table/types';
import { devLog } from '@/custom-table/utils';
/**
 * Smart cell Hook
 * Based on EPS platform's smart empty value handling
 */
import React, { useMemo, useCallback } from 'react';

export interface UseSmartCellOptions<
  RecordType extends BaseRecord = BaseRecord,
> {
  /** Table data */
  data: RecordType[];
  /** Configuration */
  config: SmartCellConfig;
  /** User role */
  userRole?: UserRole;
  /** Get context information */
  getContext?: (params: {
    record: RecordType;
    field: string;
  }) => EmptyValueContext;
}

export interface UseSmartCellReturn<
  RecordType extends BaseRecord = BaseRecord,
> {
  /** Current state */
  state: SmartCellState;
  /** Smart cell methods */
  methods: SmartCellMethods<RecordType>;
  /** Get field configuration */
  getFieldConfig: (field: string) => EmptyValueConfig;
  /** Render smart cell */
  renderSmartCell: (params: CellRenderParams<RecordType>) => React.ReactElement;
  /** Check if value is empty */
  isEmpty: (value: unknown) => boolean;
  /** Get context information */
  getContextInfo: (params: {
    record: RecordType;
    field: string;
  }) => EmptyValueContext;
}

export const useSmartCell = <RecordType extends BaseRecord = BaseRecord>({
  data,
  config,
  userRole = 'viewer',
  getContext,
}: UseSmartCellOptions<RecordType>): UseSmartCellReturn<RecordType> => {
  // Calculate state
  const state: SmartCellState = useMemo(() => {
    const emptyFields = new Set<string>();
    const fieldStats = new Map<string, { total: number; empty: number }>();

    data.forEach((record) => {
      Object.keys(record as Record<string, unknown>).forEach((field) => {
        const value = (record as Record<string, unknown>)[field];
        const isEmpty = isEmptyValue(value);

        if (isEmpty) {
          emptyFields.add(field);
        }

        const currentStat = fieldStats.get(field) || { total: 0, empty: 0 };
        fieldStats.set(field, {
          total: currentStat.total + 1,
          empty: currentStat.empty + (isEmpty ? 1 : 0),
        });
      });
    });

    return {
      emptyFields,
      fieldStats,
      totalRows: data.length,
      userRole,
      currentUserRole: userRole,
      fieldPermissions: new Map(),
      emptyValueStats: {
        totalEmptyCount: 0,
        fieldEmptyCounts: {},
        interactiveEmptyCount: 0,
      },
    };
  }, [data, userRole]);

  // Check if value is empty
  const isEmptyValue = useCallback((value: unknown): boolean => {
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
  }, []);

  // Get field configuration
  const getFieldConfig = useCallback(
    (field: string): EmptyValueConfig => {
      const fieldConfig = config.fieldConfigs?.[field];
      if (fieldConfig) {
        return { ...config.defaultEmptyConfig, ...fieldConfig };
      }
      return (
        config.defaultEmptyConfig || {
          strategy: 'text',
          text: '--',
          showTooltip: false,
          allowEdit: false,
        }
      );
    },
    [config],
  );

  // Get context information
  const getContextInfo = useCallback(
    ({
      record,
      field,
    }: { record: RecordType; field: string }): EmptyValueContext => {
      if (getContext) {
        return getContext({ record, field });
      }

      // Default context information
      const fieldStat = state.fieldStats?.get(field);
      const emptyRate = fieldStat ? fieldStat.empty / fieldStat.total : 0;

      return {
        fieldName: field,
        dataSize: (() => {
          if (data.length > 1000) {
            return 'large';
          }
          if (data.length > 100) {
            return 'medium';
          }
          return 'small';
        })(),
        hasRelatedData: false, // Requires business logic judgment
        isRequired: false, // Requires field configuration judgment
        emptyRate,
        rowIndex: data.findIndex((item) => item === record),
      };
    },
    [data, state.fieldStats, getContext],
  );

  // Handle empty value click
  const handleEmptyValueClick = useCallback(
    (params: CellRenderParams<RecordType>) => {
      const { field, record } = params;

      devLog.log({
        component: 'SmartCell',
        message: 'Empty value clicked',
        data: {
          field,
          userRole,
          recordId: (record as Record<string, unknown>).id,
        },
      });

      // Trigger configured callback
      if (config.onEmptyValueClick) {
        config.onEmptyValueClick(params as unknown as Record<string, unknown>);
      }

      // Trigger field-specific callback
      const fieldConfig = getFieldConfig(field);
      if (fieldConfig.onClick) {
        fieldConfig.onClick(params as unknown as Record<string, unknown>);
      }
    },
    [config, userRole, getFieldConfig],
  );

  // Render smart cell
  const renderSmartCell = useCallback(
    (params: CellRenderParams<RecordType>): React.ReactElement => {
      const { record, field } = params;
      const fieldConfig = getFieldConfig(field);
      const contextInfo = getContextInfo({ record, field });

      // If cell render is overridden by configuration
      if (config.onCellRender) {
        const customRender = config.onCellRender(
          params,
          fieldConfig,
          contextInfo,
        );
        if (customRender !== undefined) {
          return customRender as React.ReactElement;
        }
      }

      // Placeholder return, actual rendering completed by upper component
      return React.createElement(React.Fragment);
    },
    [config, getFieldConfig, getContextInfo],
  );

  // Smart cell methods
  const methods: SmartCellMethods<RecordType> = useMemo(
    () => ({
      renderSmartCell: (params: CellRenderParams<RecordType>) =>
        renderSmartCell(params) as unknown as React.ReactElement,
      checkFieldPermission: (_fieldName: string, _record: RecordType) =>
        // Simple permission check logic
        true,
      checkEditPermission: (_fieldName: string, _record: RecordType) =>
        // Simple edit permission check logic
        true,
      getEmptyConfig: getFieldConfig,
      handleEmptyClick: (_fieldName: string, record: RecordType) => {
        const params: CellRenderParams<RecordType> = {
          value: (record as unknown as Record<string, unknown>)[_fieldName],
          record,
          field: _fieldName,
        };
        handleEmptyValueClick(params);
      },
      updateUserRole: (role: UserRole) => {
        // Update user role logic
        config.userRole = role;
      },
      getEmptyStats: () => ({
        totalEmptyCount: 0,
        fieldEmptyCounts: {},
        interactiveEmptyCount: 0,
      }),
    }),
    [renderSmartCell, getFieldConfig, handleEmptyValueClick, config],
  );

  return {
    state,
    methods,
    getFieldConfig,
    renderSmartCell,
    isEmpty: isEmptyValue,
    getContextInfo,
  };
};
