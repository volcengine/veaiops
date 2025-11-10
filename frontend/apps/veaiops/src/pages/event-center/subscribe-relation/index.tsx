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

import { EventSubscriptionPage } from '@/modules/event-center/pages';
import { ModuleType } from '@/types/module';
import type React from 'react';

/**
 * Event center subscription relationship page
 * @description Display event subscription management (agent subscription rules), supports filtering and management
 *
 * Feature comparison (consistent with origin/feat/web-v2):
 * - Filters: Name, Agent (Content Recognition Agent + Intelligent Threshold Agent), Event Level, WEBHOOK Enabled, Focused Projects
 * - Table columns: Name, Agent, Effective Start Time, Effective End Time, Event Level, WEBHOOK Enabled, WEBHOOK Address, Actions
 * - Default filter: Agent = Content Recognition Agent
 */
const EventCenterSubscribeRelation: React.FC = () => {
  return <EventSubscriptionPage moduleType={ModuleType.EVENT_CENTER} />;
};

export default EventCenterSubscribeRelation;
