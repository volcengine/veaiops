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

import { Message } from '@arco-design/web-react';
import type { IntelligentThresholdTask } from 'api-generate';
import type { ThresholdRule } from '@threshold/shared/types/rules';

/**
 * Fetch rules list
 * Uses intelligent threshold template API as rules data source
 * TODO: Use correct API call after backend API is implemented
 */
export const fetchRules = async (): Promise<ThresholdRule[]> => {
  try {
    // Use intelligent threshold task list API to replace non-existent template API
    // Temporarily use empty data because correct list API may not exist
    const response = {
      data: {
        data: [],
        total: 0,
      },
    };

    if (response?.data) {
      // Convert intelligent threshold tasks to ThresholdRule format
      // Note: Currently using empty data, use correct types after backend provides corresponding API
      const rules = response.data.data.map(
        (task: IntelligentThresholdTask) => ({
          id: task._id || '',
          name: task.task_name || '未命名规则',
          description: `数据源类型: ${task.datasource_type || 'unknown'}`,
          template_id: task._id || '',
          template_name: task.task_name || '',
          metric_query: 'cpu_usage', // Default value, should actually be obtained from task configuration
          threshold_config: {
            warning_threshold: 80,
            critical_threshold: 95,
            comparison_operator: 'gt',
            evaluation_window: 300,
            evaluation_frequency: 60,
            recovery_threshold: 70,
          },
          notification_config: {
            channels: ['email'],
            recipients: [],
            message_template:
              '阈值告警: {{metric_name}} 当前值 {{current_value}} 超过阈值 {{threshold_value}}',
            suppress_duration: 300,
          },
          schedule_config: {
            enabled: true,
            active_hours: {
              start: '00:00',
              end: '23:59',
            },
            active_days: [1, 2, 3, 4, 5, 6, 7],
            timezone: 'Asia/Shanghai',
          },
          is_active: true, // IntelligentThresholdTask doesn't have deleted_at field, default to active state
          last_triggered_at: undefined,
          trigger_count: 0,
          created_at: task.created_at || new Date().toISOString(),
          updated_at: task.updated_at || new Date().toISOString(),
        }),
      );

      return rules as unknown as ThresholdRule[];
    } else {
      throw new Error('Failed to fetch rules list: Invalid response data format');
    }
  } catch (error: unknown) {
    // ✅ Correct: Expose actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    const errorMessage = errorObj.message || '获取规则列表失败，请重试';
    Message.error(errorMessage);
    return [];
  }
};

/**
 * Create rule
 * TODO: Use correct types after backend API is implemented
 */
export const createRule = async ({
  values,
}: {
  values: unknown;
}): Promise<boolean> => {
  try {
    // TODO: Implement real create API call
    Message.info('创建功能待实现，请联系后端开发人员');
    return true;
  } catch (error: unknown) {
    // ✅ Correct: Expose actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    const errorMessage = errorObj.message || '创建规则失败，请重试';
    Message.error(errorMessage);
    return false;
  }
};

/**
 * Update rule
 * TODO: Use correct types after backend API is implemented
 */
export const updateRule = async ({
  id,
  values,
}: {
  id: string;
  values: unknown;
}): Promise<boolean> => {
  try {
    // TODO: Implement real update API call
    Message.info('更新功能待实现，请联系后端开发人员');
    return true;
  } catch (error: unknown) {
    // ✅ Correct: Expose actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    const errorMessage = errorObj.message || '更新规则失败，请重试';
    Message.error(errorMessage);
    return false;
  }
};

/**
 * Delete rule
 * TODO: Use correct types after backend API is implemented
 */
export const deleteRule = async ({
  id,
}: {
  id: string;
}): Promise<boolean> => {
  try {
    // TODO: Implement real delete API call
    Message.info('删除功能待实现，请联系后端开发人员');
    return true;
  } catch (error: unknown) {
    // ✅ Correct: Expose actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    const errorMessage = errorObj.message || '删除规则失败，请重试';
    Message.error(errorMessage);
    return false;
  }
};

/**
 * Toggle rule enabled state
 * TODO: Use correct types after backend API is implemented
 */
export const toggleRule = async ({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}): Promise<boolean> => {
  try {
    // TODO: Implement real state toggle API call
    Message.info('状态切换功能待实现，请联系后端开发人员');
    return true;
  } catch (error: unknown) {
    // ✅ Correct: Expose actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    const errorMessage = errorObj.message || '操作失败，请重试';
    Message.error(errorMessage);
    return false;
  }
};
