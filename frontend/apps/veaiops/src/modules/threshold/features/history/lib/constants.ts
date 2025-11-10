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

import type { PushStatus, PushType } from "@/types/push-history";

/**
 * Push status options configuration
 */
export const PUSH_STATUS_OPTIONS = [
  { value: "success", label: "成功" },
  { value: "failed", label: "失败" },
  { value: "pending", label: "处理中" },
  { value: "retrying", label: "重试中" },
] as const;

/**
 * Push type options configuration
 */
export const PUSH_TYPE_OPTIONS = [
  { value: "alert", label: "告警推送" },
  { value: "recovery", label: "恢复推送" },
  { value: "notification", label: "通知推送" },
  { value: "test", label: "测试推送" },
] as const;

/**
 * Push status color mapping
 */
export const STATUS_COLOR_MAP: Record<PushStatus, string> = {
  success: "green",
  failed: "red",
  pending: "blue",
  retrying: "orange",
};

/**
 * Push status text mapping
 */
export const STATUS_TEXT_MAP: Record<PushStatus, string> = {
  success: "成功",
  failed: "失败",
  pending: "处理中",
  retrying: "重试中",
};

/**
 * Push type text mapping
 */
export const PUSH_TYPE_TEXT_MAP: Record<PushType, string> = {
  alert: "告警推送",
  recovery: "恢复推送",
  notification: "通知推送",
  test: "测试推送",
};

/**
 * Table default configuration
 */
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50] as number[],
  SCROLL_WIDTH: {
    WITH_MODULE_TYPE: 1600,
    WITHOUT_MODULE_TYPE: 1480,
  },
} as const;

export const EVENT_LEVEL_OPTIONS = [
  { label: "信息", value: "INFO" },
  { label: "警告", value: "WARNING" },
  { label: "错误", value: "ERROR" },
  { label: "严重", value: "CRITICAL" },
];
