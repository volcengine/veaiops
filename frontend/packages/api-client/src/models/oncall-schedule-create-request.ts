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
export type OncallScheduleCreateRequest = {
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
  schedule_type: OncallScheduleCreateRequest.schedule_type;
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
    contact_info?: Record<string, any>;
    /**
     * Priority
     */
    priority?: number;
  }>;
  /**
   * Oncall schedule configuration
   */
  schedule_config: Record<string, any>;
  /**
   * Escalation policy
   */
  escalation_policy?: Record<string, any>;
  /**
   * Effective start time
   */
  effective_start?: string;
  /**
   * Effective end time
   */
  effective_end?: string;
};
export namespace OncallScheduleCreateRequest {
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
