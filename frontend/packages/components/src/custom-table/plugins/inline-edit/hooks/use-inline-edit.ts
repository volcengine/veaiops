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
  EditState,
  EditingCellInfo,
  FieldEditConfig,
  GetEditingErrorsParams,
  GetEditingValueParams,
  InlineEditMethods,
  IsEditingParams,
  SetEditingValueParams,
  StartEditParams,
} from '@/custom-table/types';
import { devLog } from '@/custom-table/utils';
import { Message } from '@arco-design/web-react';
/**
 * Inline edit Hook
 * Based on EPS platform editable table functionality
 */
import { type Key, useCallback, useMemo, useRef, useState } from 'react';

export interface UseInlineEditOptions<
  RecordType extends BaseRecord = BaseRecord,
> {
  /** Table data */
  data: RecordType[];
  /** Configuration */
  config: any;
  /** Function to get row key */
  getRowKey: (record: RecordType) => Key;
  /** Data update function */
  onDataChange: (newData: RecordType[]) => void;
}

export interface ValidateFieldParams<RecordType extends BaseRecord> {
  field: string;
  value: unknown;
  record: RecordType;
}

export interface GetCellKeyParams {
  rowKey: Key;
  field: string;
}

export interface UseInlineEditReturn<
  RecordType extends BaseRecord = BaseRecord,
> {
  /** Current editing state */
  state: any;
  /** Edit methods */
  methods: any;
  /** Start editing cell */
  startEdit: (params: StartEditParams) => void;
  /** Finish editing */
  finishEdit: (value: unknown) => Promise<void>;
  /** Cancel editing */
  cancelEdit: () => void;
  /** Start batch editing */
  startBatchEdit: (rowKeys: Key[]) => void;
  /** Whether currently editing */
  isEditing: (params: IsEditingParams) => boolean;
  /** Get field edit configuration */
  getFieldEditConfig: (field: string) => FieldEditConfig<RecordType> | null;
}

export const useInlineEdit = <RecordType extends BaseRecord = BaseRecord>({
  data,
  config,
  getRowKey,
  onDataChange,
}: UseInlineEditOptions<RecordType>): UseInlineEditReturn<RecordType> => {
  // Edit state
  const [editingCells, setEditingCells] = useState<
    Map<string, EditingCellInfo<RecordType>>
  >(new Map());
  const [editingRows, setEditingRows] = useState<Set<Key>>(new Set());
  const [originalValues, setOriginalValues] = useState<Map<string, unknown>>(
    new Map(),
  );
  const [validationErrors, setValidationErrors] = useState<Map<string, string>>(
    new Map(),
  );

  // References
  const dataRef = useRef(data);
  dataRef.current = data;

  // Generate cell key
  const getCellKey = useCallback(
    ({ rowKey, field }: GetCellKeyParams) => `${rowKey}:${field}`,
    [],
  );

  // Calculate edit state
  const state: EditState<RecordType> = useMemo(
    () => ({
      editingCells: new Map(editingCells),
      editingRows: new Set(editingRows),
      originalValues: new Map(originalValues),
      validationErrors: new Map(validationErrors),
      hasChanges: editingCells.size > 0,
      isAnyEditing: editingCells.size > 0 || editingRows.size > 0,
      editingValues: new Map(), // Add missing properties
      editingErrors: new Map(),
      hasUnsavedChanges: editingCells.size > 0,
      validationState: new Map(),
    }),
    [editingCells, editingRows, originalValues, validationErrors],
  );

  // Get field edit configuration
  const getFieldEditConfig = useCallback(
    (field: string): FieldEditConfig<RecordType> | null =>
      config.fields?.find(
        (f: FieldEditConfig<RecordType>) => f.dataIndex === field,
      ) || null,
    [config.fields],
  );

  // Validate field value
  const validateField = useCallback(
    async ({
      field,
      value,
      record,
    }: ValidateFieldParams<RecordType>): Promise<string | null> => {
      const fieldConfig = getFieldEditConfig(field);
      if (!fieldConfig?.validate) {
        return null;
      }

      try {
        const result = await fieldConfig.validate(value, record);
        return typeof result === 'string' ? result : null;
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        // ✅ Correct: Pass through actual error info
        const errorMessage =
          error instanceof Error ? error.message : 'Validation failed'; // Error message for validation failure
        devLog.error({
          component: 'InlineEdit',
          message: 'Field validation error',
          data: {
            field,
            error: errorObj.message,
            errorObj,
          },
        });
        return errorMessage || 'Validation failed'; // Error message for validation failure
      }
    },
    [getFieldEditConfig],
  );

  // Start editing cell
  const startEdit = useCallback(
    async ({ rowKey, field }: StartEditParams) => {
      const fieldConfig = getFieldEditConfig(field);
      if (!fieldConfig || fieldConfig.disabled || fieldConfig.readOnly) {
        return;
      }

      const record = dataRef.current.find((item) => getRowKey(item) === rowKey);
      if (!record) {
        devLog.warn({
          component: 'InlineEdit',
          message: 'Record not found for editing',
          data: {
            rowKey,
            field,
          },
        });
        return;
      }

      // Execute before edit callback
      if (config.onBeforeEdit) {
        const shouldContinue = await config.onBeforeEdit(field, record);
        if (shouldContinue === false) {
          return;
        }
      }

      const cellKey = getCellKey({ rowKey, field });
      const currentValue = (record as Record<string, unknown>)[field];

      // Save original value
      setOriginalValues((prev) => new Map(prev.set(cellKey, currentValue)));

      // Set editing state
      const editingInfo: EditingCellInfo<RecordType> = {
        rowKey,
        field,
        fieldName: field,
        rowIndex: 0, // TODO: Pass correct row index from external
        columnIndex: 0, // TODO: Pass correct column index from external
        record,
        originalValue: currentValue,
        currentValue,
      };

      setEditingCells((prev) => new Map(prev.set(cellKey, editingInfo)));

      if (config.mode === 'row') {
        setEditingRows((prev) => new Set(prev.add(rowKey)));
      }

      devLog.log({
        component: 'InlineEdit',
        message: 'Started editing cell',
        data: { rowKey, field },
      });
    },
    [config, getFieldEditConfig, getRowKey, getCellKey],
  );

  // Finish editing
  const finishEdit = useCallback(
    async (value: unknown) => {
      const editingArray = Array.from(editingCells.values());
      if (editingArray.length === 0) {
        return;
      }

      const currentCell = editingArray[editingArray.length - 1]; // Get the last edited cell
      const { rowKey, field, record } = currentCell;
      const cellKey = getCellKey({ rowKey, field });

      try {
        // Validate
        if (config.validateOnChange) {
          const error = await validateField({ field, value, record });
          if (error) {
            setValidationErrors((prev) => new Map(prev.set(cellKey, error)));
            if (config.onValidationError) {
              config.onValidationError(field, error, record);
            }
            return;
          }
          setValidationErrors((prev) => {
            const newMap = new Map(prev);
            newMap.delete(cellKey);
            return newMap;
          });
        }

        // Update data
        const newData = dataRef.current.map((item) => {
          if (getRowKey(item) === rowKey) {
            return {
              ...(item as Record<string, unknown>),
              [field]: value,
            } as RecordType;
          }
          return item;
        });

        onDataChange(newData);

        // Auto save
        if (config.autoSave && config.onSave) {
          await config.onSave(field, value, record);
        }

        // Clear editing state
        setEditingCells((prev) => {
          const newMap = new Map(prev);
          newMap.delete(cellKey);
          return newMap;
        });

        setOriginalValues((prev) => {
          const newMap = new Map(prev);
          newMap.delete(cellKey);
          return newMap;
        });

        if (config.mode === 'row' && editingCells.size === 1) {
          setEditingRows((prev) => {
            const newSet = new Set(prev);
            newSet.delete(rowKey);
            return newSet;
          });
        }

        // Execute after edit callback
        if (config.onAfterEdit) {
          config.onAfterEdit(field, value, record);
        }

        devLog.log({
          component: 'InlineEdit',
          message: 'Finished editing cell',
          data: {
            rowKey,
            field,
            value,
          },
        });
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        // ✅ Correct: Pass through actual error info
        const errorMessage =
          error instanceof Error ? error.message : 'Save failed'; // Error message for save failure
        devLog.error({
          component: 'InlineEdit',
          message: 'Failed to finish editing',
          data: {
            rowKey,
            field,
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
            errorMessage,
          },
        });
        Message.error(errorMessage);
      }
    },
    [editingCells, config, validateField, getRowKey, getCellKey, onDataChange],
  );

  // Cancel editing
  const cancelEdit = useCallback(() => {
    const editingArray = Array.from(editingCells.values());
    if (editingArray.length === 0) {
      return;
    }

    const currentCell = editingArray[editingArray.length - 1];
    const { rowKey, field, record } = currentCell;
    const cellKey = getCellKey({ rowKey, field });

    // Clear editing state
    setEditingCells((prev) => {
      const newMap = new Map(prev);
      newMap.delete(cellKey);
      return newMap;
    });

    setOriginalValues((prev) => {
      const newMap = new Map(prev);
      newMap.delete(cellKey);
      return newMap;
    });

    setValidationErrors((prev) => {
      const newMap = new Map(prev);
      newMap.delete(cellKey);
      return newMap;
    });

    if (config.mode === 'row' && editingCells.size === 1) {
      setEditingRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(rowKey);
        return newSet;
      });
    }

    // Execute cancel callback
    if (config.onEditCancel) {
      config.onEditCancel(field, record);
    }

    devLog.log({
      component: 'InlineEdit',
      message: 'Cancelled editing cell',
      data: { rowKey, field },
    });
  }, [editingCells, config, getCellKey]);

  // Batch start editing
  const startBatchEdit = useCallback(
    async (rowKeys: Key[]) => {
      if (!config.allowBatchEdit) {
        // ✅ Correct: Use devLog to record warning, pass complete context info
        devLog.warn({
          component: 'InlineEdit',
          message: 'Batch edit not allowed',
          data: {
            rowKeys,
            allowBatchEdit: config.allowBatchEdit,
          },
        });
        return;
      }

      for (const rowKey of rowKeys) {
        setEditingRows((prev) => new Set(prev.add(rowKey)));
      }

      devLog.log({
        component: 'InlineEdit',
        message: 'Started batch editing',
        data: { rowKeys },
      });
    },
    [config.allowBatchEdit],
  );

  // Check whether currently editing
  const isEditing = useCallback(
    ({ rowKey, field }: IsEditingParams) => {
      if (field) {
        return editingCells.has(getCellKey({ rowKey, field }));
      }
      return editingRows.has(rowKey);
    },
    [editingCells, editingRows, getCellKey],
  );

  // Edit methods
  const methods: InlineEditMethods<RecordType> = useMemo(
    () => ({
      startEdit,
      finishEdit,
      cancelEdit,
      startRowEdit: async (_rowKey: Key) => {
        // TODO: Implement row editing
      },
      finishRowEdit: async (_rowKey: Key) =>
        // TODO: Implement row editing complete
        true,
      cancelRowEdit: (_rowKey: Key) => {
        // TODO: Implement cancel row editing
      },
      saveAll: async () =>
        // TODO: Implement save all editing
        true,
      cancelAll: () => {
        // TODO: Implement cancel all editing
      },
      validate: async (params?: GetEditingErrorsParams) => {
        // TODO: Implement validation
        return true;
      },
      getEditingValue: ({ rowKey, field }: GetEditingValueParams) => {
        const cellKey = getCellKey({ rowKey, field });
        return editingCells.get(cellKey)?.currentValue;
      },
      setEditingValue: ({ rowKey, field, value }: SetEditingValueParams) => {
        const cellKey = getCellKey({ rowKey, field });
        const existing = editingCells.get(cellKey);
        if (existing) {
          existing.currentValue = value;
          setEditingCells((prev) => new Map(prev.set(cellKey, existing)));
        }
      },
      isEditing,
      getEditingData: () => {
        const result = new Map<Key, Partial<RecordType>>();
        editingCells.forEach((cellInfo, _cellKey) => {
          const existingData =
            result.get(cellInfo.rowKey) || ({} as Partial<RecordType>);
          (existingData as Record<string, unknown>)[cellInfo.field] =
            cellInfo.currentValue;
          result.set(cellInfo.rowKey, existingData);
        });
        return result;
      },
      getEditingErrors: ({ rowKey, field }: GetEditingErrorsParams = {}) => {
        if (rowKey && field) {
          const cellKey = getCellKey({ rowKey, field });
          const error = validationErrors.get(cellKey);
          return error ? [error] : [];
        }
        return Array.from(validationErrors.values());
      },
      startBatchEdit,
      getFieldEditConfig,
    }),
    [
      startEdit,
      finishEdit,
      cancelEdit,
      startBatchEdit,
      isEditing,
      getFieldEditConfig,
      validateField,
      editingCells,
      validationErrors,
      getCellKey,
    ],
  );

  return {
    state,
    methods,
    startEdit,
    finishEdit,
    cancelEdit,
    startBatchEdit,
    isEditing,
    getFieldEditConfig,
  };
};
