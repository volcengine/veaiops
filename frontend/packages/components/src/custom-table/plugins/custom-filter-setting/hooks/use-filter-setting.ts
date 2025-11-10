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

import type { CustomFilterSettingState } from '@/custom-table/types';
import { useCallback, useMemo, useState } from 'react';
/**
 * Custom Filter Setting Hook
 */

export interface UseFilterSettingOptions {
  /** Initially fixed fields */
  initialFixedFields?: string[];
  /** Initially selected fields */
  initialSelectedFields?: string[];
  /** Initially hidden fields */
  initialHiddenFields?: string[];
  /** All available fields */
  allFields?: string[];
  /** Field change callback */
  onFieldsChange?: (fields: {
    fixed_fields: string[];
    selected_fields: string[];
    hidden_fields: string[];
  }) => void;
}

export interface UseFilterSettingReturn {
  /** Current state */
  state: CustomFilterSettingState;
  /** Set fixed fields */
  setFixedFields: (fields: string[]) => void;
  /** Set selected fields */
  setSelectedFields: (fields: string[]) => void;
  /** Set hidden fields */
  setHiddenFields: (fields: string[]) => void;
  /** Reset to initial state */
  reset: () => void;
  /** Save configuration */
  saveConfiguration: (
    saveFun: (data: {
      fixed_fields: string[];
      selected_fields: string[];
      hidden_fields: string[];
    }) => void,
  ) => void;
}

export const useFilterSetting = ({
  initialFixedFields = [],
  initialSelectedFields = [],
  initialHiddenFields = [],
  allFields = [],
  onFieldsChange,
}: UseFilterSettingOptions): UseFilterSettingReturn => {
  const [fixedFields, setFixedFieldsState] =
    useState<string[]>(initialFixedFields);
  const [selectedFields, setSelectedFieldsState] = useState<string[]>(
    initialSelectedFields,
  );
  const [hiddenFields, setHiddenFieldsState] =
    useState<string[]>(initialHiddenFields);

  /**
   * Set fixed fields
   */
  const setFixedFields = useCallback(
    (fields: string[]) => {
      setFixedFieldsState(fields);
      onFieldsChange?.({
        fixed_fields: fields,
        selected_fields: selectedFields,
        hidden_fields: hiddenFields,
      });
    },
    [selectedFields, hiddenFields, onFieldsChange],
  );

  /**
   * Set selected fields
   */
  const setSelectedFields = useCallback(
    (fields: string[]) => {
      setSelectedFieldsState(fields);
      onFieldsChange?.({
        fixed_fields: fixedFields,
        selected_fields: fields,
        hidden_fields: hiddenFields,
      });
    },
    [fixedFields, hiddenFields, onFieldsChange],
  );

  /**
   * Set hidden fields
   */
  const setHiddenFields = useCallback(
    (fields: string[]) => {
      setHiddenFieldsState(fields);
      onFieldsChange?.({
        fixed_fields: fixedFields,
        selected_fields: selectedFields,
        hidden_fields: fields,
      });
    },
    [fixedFields, selectedFields, onFieldsChange],
  );

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setFixedFields(initialFixedFields);
    setSelectedFields(initialSelectedFields);
    setHiddenFields(initialHiddenFields);
  }, [
    initialFixedFields,
    initialSelectedFields,
    initialHiddenFields,
    setFixedFields,
    setSelectedFields,
    setHiddenFields,
  ]);

  /**
   * Save configuration
   */
  const saveConfiguration = useCallback(
    (
      saveFun: (data: {
        fixed_fields: string[];
        selected_fields: string[];
        hidden_fields: string[];
      }) => void,
    ) => {
      const saveData = {
        fixed_fields: fixedFields,
        selected_fields: selectedFields,
        hidden_fields: hiddenFields,
      };
      saveFun(saveData);
    },
    [fixedFields, selectedFields, hiddenFields],
  );

  /**
   * Current state
   */
  const state: CustomFilterSettingState = useMemo(
    () => ({
      showFilterSetting: true,
      fixedFields,
      selectedFields,
      hiddenFields,
      allFields,
      filters: {},
      visible: true,
    }),
    [fixedFields, selectedFields, hiddenFields, allFields],
  );

  return {
    state,
    setFixedFields,
    setSelectedFields,
    setHiddenFields,
    reset,
    saveConfiguration,
  };
};
