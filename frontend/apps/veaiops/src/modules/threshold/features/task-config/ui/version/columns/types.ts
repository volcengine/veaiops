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

import type { IntelligentThresholdTaskVersion } from 'api-generate';

/**
 * Type with optional row span
 */
export type WithOptionalRowSpan<T> = T & { rowSpan?: number };

/**
 * Flattened version data type
 */
export type FlattenedVersion = WithOptionalRowSpan<
  IntelligentThresholdTaskVersion & {
    filter?: { key?: string; operator?: string; value?: unknown };
  }
>;

/**
 * Additional props required for version table column configuration
 * Note: HandleColumnsProps is already defined in @task-config/lib, here we only define version table-specific types
 */
export interface VersionColumnsProps {
  setDetailConfigData: (data: FlattenedVersion) => void;
  setDetailConfigVisible: (visible: boolean) => void;
  onCreateAlarm: (data: FlattenedVersion) => void;
  onViewCleaningResult?: (data: FlattenedVersion) => void;
  onRerunOpen: (data: FlattenedVersion) => void;
}
