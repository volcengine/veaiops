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

import { EMPTY_CONTENT_TEXT ,
  PUSH_TYPE_TEXT_MAP,
  STATUS_COLOR_MAP,
  STATUS_TEXT_MAP,
} from "@veaiops/constants";
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

import type React from "react";
import type { PushStatus, PushType } from "@/types/push-history";

/**
 * Get push status label color
 */
export const getStatusColor = (status: PushStatus): string => {
  return STATUS_COLOR_MAP[status] || "gray";
};

/**
 * Get push status text
 */
export const getStatusText = (status: PushStatus): string => {
  return STATUS_TEXT_MAP[status] || "未知";
};

/**
 * Get push type text
 */
export const getPushTypeText = (type: PushType): string => {
  return PUSH_TYPE_TEXT_MAP[type] || "未知";
};

/**
 * Format response time display
 */
export const formatResponseTime = (responseTime: number): string => {
  if (!responseTime) {
    return EMPTY_CONTENT_TEXT;
  }
  return `${responseTime}ms`;
};

/**
 * Format retry count display
 */
export const formatRetryCount = (retryCount: number): number => {
  return retryCount || 0;
};

/**
 * Truncate long text and add ellipsis
 */
export const truncateText = (maxWidth = 200): React.CSSProperties => {
  return {
    maxWidth,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };
};

/**
 * Error message style
 */
export const getErrorMessageStyle = (maxWidth = 200): React.CSSProperties => {
  return {
    ...truncateText(maxWidth),
    color: "#f53f3f",
  };
};
