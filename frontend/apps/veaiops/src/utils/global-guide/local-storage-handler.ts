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

import { logger } from '@veaiops/utils';
import type { LocalStorageAnalysis } from './types';

/**
 * Backup localStorage state
 */
export function backupLocalStorage(): Record<string, string> {
  const backup: Record<string, string> = {};

  try {
    // Backup global guide related localStorage items
    const keys = [
      'global-guide-store',
      've_arch_amap_logs_session_',
      'guide_tracking',
    ];

    keys.forEach((key) => {
      if (key.includes('session_')) {
        // Handle session related keys
        for (let i = 0; i < localStorage.length; i++) {
          const storageKey = localStorage.key(i);
          if (storageKey?.includes(key)) {
            backup[storageKey] = localStorage.getItem(storageKey) || '';
          }
        }
      } else {
        const value = localStorage.getItem(key);
        if (value) {
          backup[key] = value;
        }
      }
    });

    logger.info({
      message: 'localStorage backup completed',
      data: {
        backupKeys: Object.keys(backup),
        backupSize: JSON.stringify(backup).length,
      },
      source: 'GlobalGuideAnalyzer',
    });
  } catch (error) {
    // ✅ Correct: Use logger to record error and expose actual error information
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: 'localStorage backup failed',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
      },
      source: 'GlobalGuideAnalyzer',
      component: 'backupLocalStorage',
    });
  }

  return backup;
}

/**
 * Analyze localStorage
 */
export function analyzeLocalStorage(
  localStorageBackup: Record<string, string>,
): LocalStorageAnalysis {
  const analysis: LocalStorageAnalysis = {
    globalGuideStore: null,
    issues: [],
  };

  try {
    const guideStore =
      localStorageBackup['global-guide-store'] ||
      localStorage.getItem('global-guide-store');

    if (guideStore) {
      const parsed = JSON.parse(guideStore);
      analysis.globalGuideStore = parsed;

      // Check key issues
      if ('state' in parsed && 'guideVisible' in parsed.state) {
        analysis.issues.push({
          type: 'persistence_issue',
          message: 'guideVisible is still persisted',
          severity: 'high',
          value: parsed.state.guideVisible,
        });
      }

      if (parsed.state?.guideVisible === true) {
        analysis.issues.push({
          type: 'initial_state_issue',
          message: 'guideVisible initial value is true',
          severity: 'high',
          value: parsed.state.guideVisible,
        });
      }
    } else {
      analysis.issues.push({
        type: 'missing_store',
        message: 'global-guide-store does not exist',
        severity: 'info',
      });
    }
  } catch (error) {
    // ✅ Correct: Expose actual error information
    const errorObj = error instanceof Error ? error : new Error(String(error));
    analysis.issues.push({
      type: 'parse_error',
      message: 'Failed to parse global-guide-store',
      severity: 'error',
      error: errorObj.message,
    });
  }

  return analysis;
}
