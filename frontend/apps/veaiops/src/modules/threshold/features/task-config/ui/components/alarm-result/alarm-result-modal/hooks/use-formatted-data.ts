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

import type { SyncAlarmRulesResponse } from 'api-generate';
import { useMemo } from 'react';
import type {
  FormattedAlarmResultData,
  RuleOperationResult,
  RuleOperations,
} from '../types';

/**
 * Format alarm result data Hook
 */
export const useFormattedData = (
  data: SyncAlarmRulesResponse | null,
): FormattedAlarmResultData | null => {
  return useMemo(() => {
    if (!data) {
      return null;
    }

    // Process rule_operations data
    let ruleOperations: RuleOperations = {
      create: [],
      update: [],
      delete: [],
      failed: [],
    };

    // If rule_operations is array format, need to convert
    if (Array.isArray(data.rule_operations)) {
      data.rule_operations.forEach((op: unknown) => {
        const operationData = op as Record<string, unknown>;
        const operation: RuleOperationResult = {
          action: String(operationData.action || 'unknown'),
          rule_id: operationData.rule_id as string | undefined,
          rule_name: String(operationData.rule_name || '未知规则'),
          status: String(operationData.status || 'unknown'),
          error: operationData.error as string | undefined,
        };

        switch (operation.action.toLowerCase()) {
          case 'create':
            ruleOperations.create.push(operation);
            break;
          case 'update':
            ruleOperations.update.push(operation);
            break;
          case 'delete':
            ruleOperations.delete.push(operation);
            break;
          default:
            ruleOperations.failed.push(operation);
        }
      });
    } else if (
      data.rule_operations &&
      typeof data.rule_operations === 'object'
    ) {
      // If already in object format, use directly
      ruleOperations = data.rule_operations as RuleOperations;
    }

    return {
      ...data,
      rule_operations: ruleOperations,
    };
  }, [data]);
};
