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

import { useDeepCompareEffect } from 'ahooks';
import { isEmpty } from 'lodash-es';
import { useEffect, useRef } from 'react';
import { logger } from '../logger';

/**
 * Default value side effects Hook
 * Responsible for handling default value related side effect logic
 */
export function useDefaultValueEffects({
  defaultActiveFirstOption,
  finalDefaultValue,
  onChange,
  value,
  mode,
}: {
  defaultActiveFirstOption: boolean;
  finalDefaultValue: unknown;
  onChange?: (value: unknown, option?: unknown) => void;
  value?: unknown;
  mode?: 'multiple' | 'tags';
}) {
  // 🔧 Full trace marker point 4: Hook entry
  logger.info(
    'DefaultValueEffects',
    '🟢 [Full Trace-4] Hook received parameters',
    {
      receivedDefaultActiveFirstOption: defaultActiveFirstOption,
      receivedFinalDefaultValue: finalDefaultValue,
      receivedValue: value,
      receivedMode: mode,
      hasOnChange: Boolean(onChange),
    },
    'hookEntry',
  );

  // 🔧 Fix: Use ref to mark if default value has been triggered, avoid duplicate triggers
  const hasTriggeredDefaultRef = useRef(false);
  const prevValueRef = useRef(value);

  // Monitor value changes, if changes from having value to no value, reset marker
  useEffect(() => {
    const prevEmpty = isEmpty(prevValueRef.current);
    const currentEmpty = isEmpty(value);

    // If changes from having value to no value, allow reapplying default value
    if (!prevEmpty && currentEmpty) {
      hasTriggeredDefaultRef.current = false;
    }

    prevValueRef.current = value;
  }, [value]);

  // === Default value side effect processing ===
  useEffect(() => {
    // 🔧 Full trace marker point 5: useEffect execution
    logger.info(
      'DefaultValueEffects',
      '🔵 [Full Trace-5] useEffect triggered',
      {
        defaultActiveFirstOption,
        finalDefaultValue,
        value,
        mode,
        hasTriggered: hasTriggeredDefaultRef.current,
        dependencies: {
          defaultActiveFirstOption,
          finalDefaultValue,
          value,
          mode,
        },
      },
      'useEffect',
    );

    // 🔧 Key fix: Only trigger onChange in the following cases:
    // 1. defaultActiveFirstOption is true
    if (!defaultActiveFirstOption) {
      logger.debug(
        'DefaultValueEffects',
        'Skipped: defaultActiveFirstOption not enabled',
        {},
        'useEffect',
      );
      return;
    }

    // 2. Has finalDefaultValue
    if (!finalDefaultValue) {
      logger.debug(
        'DefaultValueEffects',
        'Skipped: no finalDefaultValue',
        {},
        'useEffect',
      );
      return;
    }

    // 3. Current value is empty (avoid overwriting user-selected values)
    // For multiple mode, empty array is also considered empty value
    const isValueEmpty =
      mode === 'multiple' || mode === 'tags'
        ? isEmpty(value) || (Array.isArray(value) && value.length === 0)
        : value === undefined || value === null || value === '';

    if (!isValueEmpty) {
      logger.debug(
        'DefaultValueEffects',
        'Skipped: value is not empty',
        { value, isValueEmpty, mode },
        'useEffect',
      );
      return;
    }

    // 4. value already equals finalDefaultValue, avoid duplicate triggers
    const isValueMatchDefault =
      mode === 'multiple' || mode === 'tags'
        ? Array.isArray(value) &&
          Array.isArray(finalDefaultValue) &&
          value.length === finalDefaultValue.length &&
          value.every(
            (v: any, i: number) => v === (finalDefaultValue as any)[i],
          )
        : value === finalDefaultValue;

    if (isValueMatchDefault) {
      logger.debug(
        'DefaultValueEffects',
        'Skipped: value already matches finalDefaultValue',
        { value, finalDefaultValue },
        'useEffect',
      );
      return;
    }

    // 5. Not yet triggered (avoid duplicate triggers)
    if (hasTriggeredDefaultRef.current) {
      logger.warn(
        'DefaultValueEffects',
        '⚠️ Skipped: default value already triggered',
        { hasTriggered: true },
        'useEffect',
      );
      return;
    }

    // 🔧 Full trace marker point 6: Trigger onChange
    logger.info(
      'DefaultValueEffects',
      '🟢 [Full Trace-6] ✅ About to trigger onChange - auto-fill default value',
      {
        finalDefaultValue,
        currentValue: value,
        defaultActiveFirstOption,
        mode,
        willSetValue: finalDefaultValue,
        timestamp: new Date().toISOString(),
      },
      'useEffect',
    );

    // Pass undefined as second parameter, because OptionInfo type is not available
    onChange?.(finalDefaultValue, undefined as never);

    hasTriggeredDefaultRef.current = true;

    // 🔧 Full trace marker point 7: onChange execution completed
    logger.info(
      'DefaultValueEffects',
      '🟣 [Full Trace-7] ✅ onChange execution completed',
      {
        setValue: finalDefaultValue,
        timestamp: new Date().toISOString(),
      },
      'useEffect',
    );
  }, [defaultActiveFirstOption, finalDefaultValue, value, mode]);
  // Note: onChange is not included, as it is usually a stable reference, including it may cause infinite loop
}
