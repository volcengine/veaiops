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

/**
 * Card template management related type definitions

 */

// Import generated API types
import type {
  AgentTemplateCreateRequest,
  AgentTemplateUpdateRequest,
  ChannelType,
} from 'api-generate';

/**
 * Agent template query parameters
 */
export interface AgentTemplateQuery {
  /** Agent type filter */
  agents?: string[];
  /** Channel type filter */
  channels?: ChannelType[];
  /** Template ID search */
  templateId?: string;
  /** Template name search */
  name?: string;
  /** Whether enabled */
  is_active?: boolean;
  /** Creation time range */
  createTimeRanges?: number[];
  /** Pagination parameters */
  skip?: number;
  /** Page size */
  limit?: number;
  /** Index signature to satisfy BaseQuery constraints */
  [key: string]: unknown;
}

/**
 * Create Agent template request - uses generated API types
 */
export type CreateAgentTemplateRequest = AgentTemplateCreateRequest;

/**
 * Update Agent template request - uses generated API types
 */
export type UpdateAgentTemplateRequest = AgentTemplateUpdateRequest;

/**
 * Channel type options have been migrated to @veaiops/constants
 * @see frontend/packages/constants/src/channel.ts
 *
 * Usage:
 * import { CHANNEL_OPTIONS } from '@veaiops/constants';
 */

/**
 * Guide step type
 */
export interface GuideStep {
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Step icon */
  icon?: React.ReactNode;
  /** Whether completed */
  completed?: boolean;
  /** Action button */
  action?: {
    text: string;
    onClick: () => void;
  };
}
