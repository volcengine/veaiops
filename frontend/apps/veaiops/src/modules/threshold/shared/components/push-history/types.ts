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

import type { ModuleType } from '@veaiops/types';
import type { Event } from 'api-generate';
import type React from 'react';

/**
 * Historical event record type
 * @description Directly use the Event type from api-generate to avoid duplicate definitions
 */
export type PushHistoryRecord = Event;

/**
 * Historical event management component props
 */
export interface PushHistoryManagerProps {
  /** Module type, used to filter historical events */
  moduleType?: ModuleType;
  /** Whether to show module type column */
  showModuleTypeColumn?: boolean;
  /** Custom action buttons */
  customActions?: (record: PushHistoryRecord) => React.ReactNode;
  /** View detail callback */
  onViewDetail?: (record: PushHistoryRecord) => void;
  /** Retry callback */
  onRetry?: (recordId: string) => void;
}

/**
 * Table column configuration props
 */
export interface TableColumnsProps {
  /** Custom action buttons */
  customActions?: (record: PushHistoryRecord) => React.ReactNode;
  /** Retry callback */
  onRetry?: (recordId: string) => void;
  /** View detail callback */
  onViewDetail?: (record: PushHistoryRecord) => void;
  /** Whether to show module type column */
  showModuleTypeColumn?: boolean;
}
