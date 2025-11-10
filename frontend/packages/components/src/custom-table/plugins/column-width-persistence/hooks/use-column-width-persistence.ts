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
 * Column Width Persistence Core Hook
 */

import type {
  ColumnWidthPersistenceConfig,
  ColumnWidthPersistenceMethods,
  ColumnWidthPersistenceState,
} from '@/custom-table/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_COLUMN_WIDTH_PERSISTENCE_CONFIG } from '../config';
import {
  compareColumnWidths,
  createDebouncedWidthDetector,
  detectAllColumnWidthsFromDOM,
  filterValidColumnWidths,
  generateStorageKey,
  localStorageUtils,
  validateColumnWidth,
} from '../utils';

/**
 * Column Width Persistence Hook Parameters
 */
export interface UseColumnWidthPersistenceProps {
  /** Plugin configuration */
  config?: ColumnWidthPersistenceConfig;
  /** Table ID, used to distinguish storage for different tables */
  tableId?: string;
  /** Current column configuration */
  columns?: Array<{ dataIndex: string; width?: number | string }>;
  /** Table container reference */
  tableContainerRef?: React.RefObject<HTMLElement>;
  /** Column width change callback */
  onColumnWidthChange?: (dataIndex: string, width: number) => void;
  /** Batch column width change callback */
  onBatchColumnWidthChange?: (widthsMap: Record<string, number>) => void;
}

/**
 * Column Width Persistence Hook Return Value
 */
export interface UseColumnWidthPersistenceResult
  extends ColumnWidthPersistenceMethods {
  /** Plugin state */
  state: ColumnWidthPersistenceState;
  /** Currently persisted column width mapping */
  persistentWidths: Record<string, number>;
  /** Whether detection is in progress */
  isDetecting: boolean;
}

/**
 * Column Width Persistence Core Hook
 */
export const useColumnWidthPersistence = ({
  config = {},
  tableId = 'default',
  columns = [],
  tableContainerRef,
  onColumnWidthChange,
  onBatchColumnWidthChange,
}: UseColumnWidthPersistenceProps): UseColumnWidthPersistenceResult => {
  // Merge configuration
  const finalConfig = { ...DEFAULT_COLUMN_WIDTH_PERSISTENCE_CONFIG, ...config };

  // Base state
  const [state, setState] = useState<ColumnWidthPersistenceState>({
    persistentWidths: {},
    isDetecting: false,
    lastDetectionTime: 0,
    widthHistory: [],
  });

  // Refs
  const detectionTimerRef = useRef<NodeJS.Timeout>();
  const lastWidthsRef = useRef<Record<string, number>>({});
  const storageKeyRef = useRef<string>(
    generateStorageKey({
      prefix: finalConfig.storageKeyPrefix,
      tableId,
    }),
  );

  // Get current column dataIndex list
  const dataIndexList = columns.map((col) => col.dataIndex).filter(Boolean);

  /**
   * Set persistent width for a single column (internal implementation)
   */
  const setPersistentColumnWidthImpl = useCallback(
    ({ dataIndex, width }: { dataIndex: string; width: number }) => {
      const validatedWidth = validateColumnWidth({
        width,
        config: finalConfig,
      });

      setState((prev: ColumnWidthPersistenceState) => ({
        ...prev,
        persistentWidths: {
          ...prev.persistentWidths,
          [dataIndex]: validatedWidth,
        },
      }));

      // Trigger callback
      onColumnWidthChange?.(dataIndex, validatedWidth);

      // Save to local storage
      if (finalConfig.enableLocalStorage && localStorageUtils.isAvailable()) {
        const currentWidths = {
          ...state.persistentWidths,
          [dataIndex]: validatedWidth,
        };
        localStorageUtils.save(storageKeyRef.current, currentWidths);
      }
    },
    [finalConfig, onColumnWidthChange, state.persistentWidths],
  );

  /**
   * Batch set persistent column widths
   */
  const setBatchPersistentColumnWidths = useCallback(
    (widthsMap: Record<string, number>) => {
      const validatedWidths = filterValidColumnWidths({
        widths: widthsMap,
        config: finalConfig,
      });

      setState((prev: ColumnWidthPersistenceState) => ({
        ...prev,
        persistentWidths: {
          ...prev.persistentWidths,
          ...validatedWidths,
        },
      }));

      // Trigger callback
      onBatchColumnWidthChange?.(validatedWidths);

      // Save to local storage
      if (finalConfig.enableLocalStorage && localStorageUtils.isAvailable()) {
        const currentWidths = {
          ...state.persistentWidths,
          ...validatedWidths,
        };
        localStorageUtils.save(storageKeyRef.current, currentWidths);
      }
    },
    [finalConfig, onBatchColumnWidthChange, state.persistentWidths],
  );

  /**
   * Get persistent column width
   */
  const getPersistentColumnWidth = useCallback(
    (dataIndex: string): number | undefined =>
      state.persistentWidths[dataIndex],
    [state.persistentWidths],
  );

  /**
   * Get all persistent column widths
   */
  const getAllPersistentColumnWidths = useCallback(
    (): Record<string, number> => ({ ...state.persistentWidths }),
    [state.persistentWidths],
  );

  /**
   * Clear persistent width for a specific column
   */
  const clearPersistentColumnWidth = useCallback(
    (dataIndex: string) => {
      setState((prev: ColumnWidthPersistenceState) => {
        const { [dataIndex]: _, ...rest } = prev.persistentWidths;
        return {
          ...prev,
          persistentWidths: rest,
        };
      });

      // Update local storage
      if (finalConfig.enableLocalStorage && localStorageUtils.isAvailable()) {
        const { [dataIndex]: _, ...rest } = state.persistentWidths;
        localStorageUtils.save(storageKeyRef.current, rest);
      }
    },
    [finalConfig.enableLocalStorage, state.persistentWidths],
  );

  /**
   * Clear all persistent column widths
   */
  const clearAllPersistentColumnWidths = useCallback(() => {
    setState((prev: ColumnWidthPersistenceState) => ({
      ...prev,
      persistentWidths: {},
    }));

    // Clear local storage
    if (finalConfig.enableLocalStorage && localStorageUtils.isAvailable()) {
      localStorageUtils.remove(storageKeyRef.current);
    }
  }, [finalConfig.enableLocalStorage]);

  /**
   * Detect current column widths from DOM
   */
  const detectCurrentColumnWidths = useCallback(async (): Promise<
    Record<string, number>
  > => {
    if (!tableContainerRef?.current) {
      return {};
    }

    setState((prev: ColumnWidthPersistenceState) => ({
      ...prev,
      isDetecting: true,
    }));

    try {
      const detectedWidths = detectAllColumnWidthsFromDOM({
        tableContainer: tableContainerRef.current,
        dataIndexList,
      });

      setState((prev: ColumnWidthPersistenceState) => ({
        ...prev,
        isDetecting: false,
        lastDetectionTime: Date.now(),
      }));

      return detectedWidths;
    } catch (error) {
      // Column width detection failed, reset state and return empty object
      setState((prev: ColumnWidthPersistenceState) => ({
        ...prev,
        isDetecting: false,
      }));
      return {};
    }
  }, [tableContainerRef, dataIndexList]);

  /**
   * Save current column widths to persistent storage
   */
  const saveCurrentColumnWidths = useCallback(async () => {
    const currentWidths = await detectCurrentColumnWidths();
    if (Object.keys(currentWidths).length > 0) {
      setBatchPersistentColumnWidths(currentWidths);
    }
  }, [detectCurrentColumnWidths, setBatchPersistentColumnWidths]);

  /**
   * Restore column widths from persistent storage
   */
  const restoreColumnWidths = useCallback(async () => {
    if (!finalConfig.enableLocalStorage || !localStorageUtils.isAvailable()) {
      return;
    }

    const savedWidths = localStorageUtils.load<Record<string, number>>(
      storageKeyRef.current,
    );
    if (savedWidths && Object.keys(savedWidths).length > 0) {
      setState((prev: ColumnWidthPersistenceState) => ({
        ...prev,
        persistentWidths: savedWidths,
      }));
    }
  }, [finalConfig.enableLocalStorage]);

  /**
   * Apply column widths to table
   */
  const applyColumnWidths = useCallback(
    (widthsMap: Record<string, number>) => {
      setBatchPersistentColumnWidths(widthsMap);
    },
    [setBatchPersistentColumnWidths],
  );

  // Create debounced auto-detection function
  const debouncedDetection = useCallback(
    createDebouncedWidthDetector({
      detectFunction: async () => {
        if (!finalConfig.enableAutoDetection || !tableContainerRef?.current) {
          return;
        }

        const currentWidths = await detectCurrentColumnWidths();

        // Only update when width changes
        if (
          !compareColumnWidths({
            widths1: currentWidths,
            widths2: lastWidthsRef.current,
          })
        ) {
          lastWidthsRef.current = currentWidths;
          setBatchPersistentColumnWidths(currentWidths);
        }
      },
      delay: finalConfig.detectionDelay,
    }),
    [
      finalConfig.enableAutoDetection,
      finalConfig.detectionDelay,
      tableContainerRef,
      detectCurrentColumnWidths,
      setBatchPersistentColumnWidths,
    ],
  );

  // Listen to table container changes, trigger auto-detection
  useEffect(() => {
    if (!finalConfig.enableAutoDetection || !tableContainerRef?.current) {
      return undefined;
    }

    const container = tableContainerRef.current;
    const observer = new ResizeObserver(() => {
      debouncedDetection();
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [finalConfig.enableAutoDetection, tableContainerRef, debouncedDetection]);

  // Restore column widths on initialization
  useEffect(() => {
    restoreColumnWidths();
  }, [restoreColumnWidths]);

  // Cleanup timer
  useEffect(
    () => () => {
      if (detectionTimerRef.current) {
        clearTimeout(detectionTimerRef.current);
      }
    },
    [],
  );

  // Wrap setPersistentColumnWidth to match interface signature
  const wrappedSetPersistentColumnWidth: ColumnWidthPersistenceMethods['setPersistentColumnWidth'] =
    useCallback(
      (params: { dataIndex: string; width: number }) => {
        setPersistentColumnWidthImpl(params);
      },
      [setPersistentColumnWidthImpl],
    );

  return {
    // State
    state,
    persistentWidths: state.persistentWidths,
    isDetecting: state.isDetecting || false,

    // Methods (implement ColumnWidthPersistenceMethods interface)
    setPersistentColumnWidth: wrappedSetPersistentColumnWidth,
    setBatchPersistentColumnWidths,
    getPersistentColumnWidth,
    getAllPersistentColumnWidths,
    clearPersistentColumnWidth,
    clearAllPersistentColumnWidths,
    detectCurrentColumnWidths,
    saveCurrentColumnWidths,
    restoreColumnWidths,
    applyColumnWidths,
  };
};
