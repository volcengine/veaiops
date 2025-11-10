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

import type { SyncAlarmRulesPayload } from 'api-generate';
import { EventLevel } from 'api-generate';
import {
  DATASOURCE_TYPE_LABELS,
  TASK_STATUS_LABELS,
} from '../shared/constants';
import type { ContactGroup } from '../shared/types';

/**
 * Get datasource type label
 */
export const getDatasourceTypeLabel = (type: string): string => {
  return DATASOURCE_TYPE_LABELS[type] || type;
};

/**
 * Get task status label
 */
export const getTaskStatusLabel = (status?: string): string => {
  if (!status) {
    return '-';
  }
  return TASK_STATUS_LABELS[status] || status;
};

/**
 * Transform contact groups to selector options
 */
export const transformContactGroupsToOptions = (
  contactGroups: ContactGroup[],
) => {
  return contactGroups.map((group) => ({
    label:
      group.name ||
      group.ContactGroupName ||
      group.Name ||
      group.ContactGroupId ||
      '',
    value: group.id || group.ContactGroupId || group.Name || '',
  }));
};

/**
 * Build alarm rule submission data
 */
export const buildAlarmSubmitData = (
  formValues: Record<string, unknown>,
  task: Record<string, unknown>,
  datasourceType: string,
): { success: boolean; data?: SyncAlarmRulesPayload; error?: string } => {
  try {
    // Validate required task information
    if (!task?._id) {
      return {
        success: false,
        error: '缺少任务ID，无法创建告警规则',
      };
    }

    // Build base data (required for all datasource types)
    const submitData: Partial<SyncAlarmRulesPayload> & {
      task_id: string;
      task_version_id: string;
      alarm_level: SyncAlarmRulesPayload['alarm_level'];
    } = {
      task_id: task.task_id as string, // Use task ID instead of name
      task_version_id: task._id as string, // Use task version ID
      alarm_level:
        (formValues.alarmLevel as SyncAlarmRulesPayload['alarm_level']) ||
        EventLevel.P2,
    };

    // Add corresponding fields based on datasource type
    // Note: Zabbix reuses contact_group_ids and alert_methods fields
    //  - contact_group_ids in Zabbix corresponds to usergroup_ids
    //  - alert_methods in Zabbix corresponds to mediatype_ids
    if (datasourceType === 'Volcengine') {
      // Volcengine: contact_group_ids only needed when alert_methods is selected
      const { alertMethods } = formValues;
      const hasAlertMethods =
        alertMethods && Array.isArray(alertMethods) && alertMethods.length > 0;

      if (hasAlertMethods) {
        submitData.alert_methods = alertMethods;

        // If alert notification method is selected, contact group must also be selected
        if (!formValues.contactGroupId) {
          return {
            success: false,
            error: 'Volcengine数据源选择告警通知方式后，必须同时选择联系组', // Reverted to Chinese (code string)
          };
        }
        submitData.contact_group_ids = [formValues.contactGroupId];
      } else if (formValues.contactGroupId) {
        // If only contact group is selected but alert notification method is not, show prompt
      }
    } else if (datasourceType === 'Aliyun') {
      // Aliyun: Contact group is optional, if not selected, only deliver via Webhook
      if (formValues.contactGroupId) {
        submitData.contact_group_ids = [formValues.contactGroupId];
      }
    } else if (datasourceType === 'Zabbix') {
      // Zabbix: Reuse contact_group_ids (corresponds to usergroup_ids) and alert_methods (corresponds to mediatype_ids)
      const { alertMethods, contactGroupId } = formValues;

      // ✅ Fix: Initialize as empty arrays, pass empty arrays when not selected instead of not passing fields
      submitData.alert_methods = [];
      submitData.contact_group_ids = [];

      // If alert notification method (media type) is selected
      if (
        alertMethods &&
        Array.isArray(alertMethods) &&
        alertMethods.length > 0
      ) {
        submitData.alert_methods = alertMethods; // Zabbix media type ID list

        // If alert notification method is selected, user group must also be selected
        if (!contactGroupId) {
          return {
            success: false,
            error: 'Zabbix数据源选择告警通知方式后，必须同时选择告警组',
          };
        }
        submitData.contact_group_ids = [contactGroupId]; // Zabbix user group ID list
      } else if (contactGroupId) {
        // If only user group is selected but alert notification method is not, only add contact_group_ids
        submitData.contact_group_ids = [contactGroupId];
      }
    }

    return {
      success: true,
      data: submitData,
    };
  } catch (error) {
    // ✅ Correct: Expose actual error information
    const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: `Failed to build submit data: ${errorMessage}`,
      };
  }
};
