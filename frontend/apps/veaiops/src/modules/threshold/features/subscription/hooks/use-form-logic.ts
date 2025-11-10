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

import { ModuleType } from '@/types/module';
import {
  AGENT_OPTIONS_EVENT_CENTER_SUBSCRIPTION,
  AGENT_OPTIONS_ONCALL_SUBSCRIPTION,
  AGENT_OPTIONS_THRESHOLD_FILTER,
} from '@veaiops/constants';
import type { InformStrategy } from 'api-generate';
import { useMemo, useState } from 'react';

// AgentType enum (kept for backward compatibility)
export enum AgentType {
  chatops_interest_agent = '会话检测',
  chatops_reactive_reply_agent = '旁路回复',
  chatops_proactive_reply_agent = '主动回复',
  intelligent_threshold_agent = '智能阈值',
}

// Event level options
export const EVENT_LEVEL_OPTIONS = [
  { label: 'P0', value: 'P0' },
  { label: 'P1', value: 'P1' },
  { label: 'P2', value: 'P2' },
];

/**
 * Subscribe relation form logic Hook
 * @param moduleType Module type, used to determine which Agent options to display
 */
export const useSubscribeRelationFormLogic = (moduleType?: ModuleType) => {
  const [informStrategies] = useState<InformStrategy[]>([]);

  // Return corresponding Agent options based on module type
  const agentTypeOptions = useMemo(() => {
    switch (moduleType) {
      case ModuleType.ONCALL:
        return AGENT_OPTIONS_ONCALL_SUBSCRIPTION;
      case ModuleType.INTELLIGENT_THRESHOLD:
        return AGENT_OPTIONS_THRESHOLD_FILTER;
      default:
        return AGENT_OPTIONS_EVENT_CENTER_SUBSCRIPTION;
    }
  }, [moduleType]);

  return {
    informStrategies,
    agentTypeOptions,
    eventLevelOptions: EVENT_LEVEL_OPTIONS,
  };
};
