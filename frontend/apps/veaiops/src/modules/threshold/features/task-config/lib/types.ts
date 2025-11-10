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

// Directly use API generated types
import type {
  IntelligentThresholdTask,
  IntelligentThresholdTaskVersion,
} from "api-generate";
/**
 * Task operation type enum - unified operation type definition
 */
export enum TaskOperateType {
  CREATE = "create",
  COPY = "copy",
  RERUN = "rerun",
  VERSIONS = "versions",
  RESULTS = "results",
  DETAIL = "detail",
}

/**
 * Task operation type union - consistent with TaskOperateType
 */
export type OperationType =
  | "create"
  | "copy"
  | "rerun"
  | "versions"
  | "results"
  | "detail";

/**
 * Intelligent threshold task table operation callbacks - uses IntelligentThresholdTask
 */
export interface TaskTableActions {
  onTaskDetail: (record: IntelligentThresholdTask) => void;
  onRerun: (task: IntelligentThresholdTask) => void;
  onViewVersions: (task: IntelligentThresholdTask) => void;
  onCreateAlarm: (task: IntelligentThresholdTask) => void;
  onCopy: (task: IntelligentThresholdTask) => void;
  onAdd?: () => void | Promise<boolean>;
  onBatchRerun?: () => void;
  onDelete?: (taskId: string) => Promise<boolean>;
  onViewDatasource?: (task: IntelligentThresholdTask) => void;
}

export interface HandleColumnsProps {
  action?: TaskTableActions;
  modelv?: IntelligentThresholdTask;
  datasourceType?: "Zabbix" | "Aliyun" | "Volcengine";
  metaMetricsTemplateAction?: TaskTableActions;
  accessArgosRulesAction?: TaskTableActions;
  setDetailConfigData?: (data: IntelligentThresholdTaskVersion) => void;
  setDetailConfigVisible?: (visible: boolean) => void;
  onCreateAlarm?: (record: IntelligentThresholdTaskVersion) => void;
  onViewCleaningResult?: (version: IntelligentThresholdTaskVersion) => void;
}

/**
 * Task list response type - uses IntelligentThresholdTask
 */
export interface TaskListResponse {
  data: Array<IntelligentThresholdTask & { key: string }>;
  total: number;
  skip: number;
  limit: number;
}

/**
 * Type guard: check if record is task table data
 */
export function isTaskTableData(
  record: Record<string, unknown>
): record is IntelligentThresholdTask {
  return (
    typeof record === "object" &&
    record !== null &&
    typeof record.key === "string" &&
    typeof record._id === "string" &&
    typeof record.task_name === "string"
  );
}
