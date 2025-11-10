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

/* generated using openapi-typescript-codegen -- do not edit */
export type Interest = {
  /**
   * Interest rule UUID
   */
  uuid?: string;
  /**
   * Interest rule name
   */
  name: string;
  /**
   * Interest rule description
   */
  description?: string;
  /**
   * Alert level
   */
  level?: Interest.level;
  /**
   * Positive examples
   */
  examples_positive?: Array<string>;
  /**
   * Negative examples
   */
  examples_negative?: Array<string>;
  /**
   * Interest action category
   */
  action_category: Interest.action_category;
  /**
   * Interest inspect category
   */
  inspect_category: Interest.inspect_category;
  /**
   * Regular expression for RE inspection
   */
  regular_expression?: string;
  /**
   * Number of history messages to inspect
   */
  inspect_history?: number;
  /**
   * Alert suppression interval
   */
  silence_delta?: string;
  /**
   * Whether the interest rule is active
   */
  is_active?: boolean;
  /**
   * Creation timestamp
   */
  created_at?: string;
  /**
   * Last update timestamp
   */
  updated_at?: string;
  /**
   * Version number
   */
  version?: number;
};
export namespace Interest {
  /**
   * Alert level
   */
  export enum level {
    P0 = 'P0',
    P1 = 'P1',
    P2 = 'P2',
  }
  /**
   * Interest action category
   */
  export enum action_category {
    DETECT = 'Detect',
    FILTER = 'Filter',
  }
  /**
   * Interest inspect category
   */
  export enum inspect_category {
    SEMANTIC = 'Semantic',
    RE = 'RE',
  }
}
