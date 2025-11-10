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

import type { AgentTemplate } from 'api-generate';

/**
 * Card template table data type
 */
export interface CardTemplateTableData extends AgentTemplate {
  key: string;
}

/**
 * Transform template data to table data
 */
export const transformAgentTemplateToTableData = (
  template: AgentTemplate,
): CardTemplateTableData => {
  return {
    ...template,
    key: template._id ?? `temp-${Date.now()}-${Math.random()}`,
  };
};
