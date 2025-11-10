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
 * Custom Fields Hook
 */
import type { BaseRecord, ModernTableColumnProps } from '@/custom-table/types';
import { useCallback, useMemo, useState } from 'react';
import type { CustomFieldsState } from '../types';

export interface UseCustomFieldsOptions<T extends BaseRecord = BaseRecord> {
  /** Initially selected fields */
  initialFields?: string[];
  /** All available columns */
  columns: ModernTableColumnProps<T>[];
  /** Disabled fields */
  disabledFields?: Map<string, string | undefined>;
  /** Field change callback */
  onFieldsChange?: (fields: string[]) => void;
}

export interface UseCustomFieldsReturn<T extends BaseRecord = BaseRecord> {
  /** Current state */
  state: CustomFieldsState<T>;
  /** Set selected fields */
  setSelectedFields: (fields: string[]) => void;
  /** Toggle field state */
  toggleField: (field: string) => void;
  /** Reset to initial state */
  reset: () => void;
  /** Get all available fields */
  getAllAvailableFields: () => string[];
}

export const useCustomFields = <T extends BaseRecord = BaseRecord>({
  initialFields = [],
  columns,
  disabledFields = new Map(),
  onFieldsChange,
}: UseCustomFieldsOptions<T>): UseCustomFieldsReturn<T> => {
  const [selectedFields, setSelectedFieldsState] =
    useState<string[]>(initialFields);

  /**
   * Recursively get all fields
   */
  const getAllFields = useCallback(
    (columns: ModernTableColumnProps<T>[]): string[] => {
      const fields: string[] = [];
      columns.forEach((column) => {
        if (column.dataIndex) {
          fields.push(column.dataIndex);
        }
        if (column.children) {
          fields.push(...getAllFields(column.children));
        }
      });
      return fields;
    },
    [],
  );

  /**
   * Get all available fields (excluding disabled ones)
   */
  const getAllAvailableFields = useCallback(() => {
    const allFields = getAllFields(columns);
    return allFields.filter((field) => !disabledFields.has(field));
  }, [columns, disabledFields, getAllFields]);

  /**
   * Available columns
   */
  const availableColumns = useMemo(
    () =>
      columns.filter(
        (column) => !column.dataIndex || !disabledFields.has(column.dataIndex),
      ),
    [columns, disabledFields],
  );

  /**
   * Set selected fields
   */
  const setSelectedFields = useCallback(
    (fields: string[]) => {
      setSelectedFieldsState(fields);
      onFieldsChange?.(fields);
    },
    [onFieldsChange],
  );

  /**
   * Toggle field state
   */
  const toggleField = useCallback((field: string) => {
    setSelectedFieldsState((prev: string[]) => {
      if (prev.includes(field)) {
        return prev.filter((f: string) => f !== field);
      } else {
        return [...prev, field];
      }
    });
  }, []);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setSelectedFields(initialFields);
  }, [initialFields, setSelectedFields]);

  /**
   * Current state
   */
  const state: CustomFieldsState<T> = useMemo(
    () => ({
      showCustomFields: true,
      selectedFields,
      availableColumns,
      disabledFields: Array.from(disabledFields.keys()),
    }),
    [selectedFields, availableColumns, disabledFields],
  );

  return {
    state,
    setSelectedFields,
    toggleField,
    reset,
    getAllAvailableFields,
  };
};
