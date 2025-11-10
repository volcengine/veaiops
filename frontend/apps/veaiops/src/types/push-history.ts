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

import type { AgentType } from 'api-generate';
import type { ModuleType } from './module';

/**
 * Push status enumeration
 */
export enum PushStatus {
  /** Success */
  SUCCESS = 'success',
  /** Failed */
  FAILED = 'failed',
  /** Pending */
  PENDING = 'pending',
  /** Retrying */
  RETRYING = 'retrying',
}

/**
 * Push type enumeration
 */
export enum PushType {
  /** Alert push */
  ALERT = 'alert',
  /** Recovery push */
  RECOVERY = 'recovery',
  /** Notification push */
  NOTIFICATION = 'notification',
  /** Test push */
  TEST = 'test',
}

/**
 * History event record
 */
export interface PushHistoryRecord {
  /** Record ID */
  id: string;
  /** Module type */
  module_type: ModuleType;
  /** Push type */
  push_type: PushType;
  /** Push status */
  status: PushStatus;
  /** Target receiver */
  receiver: string;
  /** Push content */
  content: string;
  /** Push time */
  push_time: string;
  /** Response time (milliseconds) */
  response_time?: number;
  /** Error message */
  error_message?: string;
  /** Retry count */
  retry_count?: number;
  /** Creation time */
  created_at: string;
  /** Update time */
  updated_at?: string;
}

/**
 * History event query parameters
 */
export interface PushHistoryQuery {
  /** Module type */
  agentType?: AgentType;
  /** Push type */
  push_type?: PushType;
  /** Push status */
  status?: PushStatus;
  /** Receiver */
  receiver?: string;
  /** Start time */
  start_time?: string;
  /** End time */
  end_time?: string;
  /** Page number */
  page?: number;
  /** Page size */
  page_size?: number;
}

/**
 * History event response
 */
export interface PushHistoryResponse {
  /** History record list */
  records: PushHistoryRecord[];
  /** Total count */
  total: number;
  /** Current page */
  page: number;
  /** Page size */
  page_size: number;
}

/**
 * Push statistics information
 */
export interface PushStatistics {
  /** Total push count */
  total_count: number;
  /** Success count */
  success_count: number;
  /** Failed count */
  failed_count: number;
  /** Success rate */
  success_rate: number;
  /** Average response time */
  avg_response_time: number;
}
