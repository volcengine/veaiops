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

/* generated using openapi-typescript-codegen -- do not edit */
export type OncallSchedule = {
  /**
   * Oncall schedule ID
   */
  id?: string;
  /**
   * Associated rule ID
   */
  rule_id: string;
  /**
   * Oncall schedule name
   */
  name: string;
  /**
   * Oncall schedule description
   */
  description?: string;
  /**
   * Oncall schedule type
   */
  schedule_type: OncallSchedule.schedule_type;
  /**
   * Oncall participants list
   */
  participants: Array<{
    /**
     * User ID
     */
    user_id: string;
    /**
     * User name
     */
    user_name: string;
    /**
     * Contact information
     */
    contact_info?: {
      phone?: string;
      email?: string;
      chat_id?: string;
    };
    /**
     * Priority
     */
    priority?: number;
  }>;
  /**
   * Oncall schedule configuration
   */
  schedule_config: {
    /**
     * Rotation interval (hours)
     */
    rotation_interval?: number;
    /**
     * Start time
     */
    start_time?: string;
    /**
     * End time
     */
    end_time?: string;
    /**
     * Timezone
     */
    timezone?: string;
    /**
     * Weekdays (0=Sunday, 6=Saturday)
     */
    weekdays?: Array<number>;
  };
  /**
   * Escalation policy
   */
  escalation_policy?: {
    /**
     * Whether escalation is enabled
     */
    enabled?: boolean;
    /**
     * Escalation timeout (minutes)
     */
    escalation_timeout?: number;
    /**
     * Escalation level configuration
     */
    escalation_levels?: Array<{
      level?: number;
      participants?: Array<string>;
      timeout?: number;
    }>;
  };
  /**
   * Whether active
   */
  is_active?: boolean;
  /**
   * Effective start time
   */
  effective_start?: string;
  /**
   * Effective end time
   */
  effective_end?: string;
  /**
   * Creation time
   */
  created_at?: string;
  /**
   * Last update timestamp
   */
  updated_at?: string;
};
export namespace OncallSchedule {
  /**
   * Oncall schedule type
   */
  export enum schedule_type {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    CUSTOM = 'custom',
  }
}
