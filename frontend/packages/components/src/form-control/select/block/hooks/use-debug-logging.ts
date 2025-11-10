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

import { useCallback, useRef } from 'react';
import { logger } from '../logger';

/**
 * Debug logging system Hook
 * Provides unified debug log collection and management functionality
 */
export function useDebugLogging(hookTraceId: string) {
  const debugLogsRef = useRef<any[]>([]);
  const consoleDebugLogsRef = useRef<any[]>([]);

  const addDebugLog = useCallback(
    (action: string, data: any) => {
      const logEntry = {
        action,
        data,
        timestamp: Date.now(),
        hookTraceId,
      };

      debugLogsRef.current.push(logEntry);
      consoleDebugLogsRef.current.push(logEntry);

      logger.debug(
        'UseSelectBlock',
        `Debug log: ${action}`,
        { logEntry },
        'addDebugLog',
        hookTraceId,
      );
    },
    [hookTraceId], // Only depend on hookTraceId to avoid function recreation due to array changes
  );

  return {
    debugLogs: debugLogsRef.current,
    consoleDebugLogs: consoleDebugLogsRef.current,
    addDebugLog,
  };
}
