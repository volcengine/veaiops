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
export type InterestCreateRequest = {
  /**
   * 规则名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 告警等级
   */
  level?: InterestCreateRequest.level;
  /**
   * 告警抑制间隔（ISO 8601 duration format, e.g., PT6H, PT30M, P1D）
   */
  silence_delta?: string;
  /**
   * 是否启用状态
   */
  is_active?: boolean;
  /**
   * 正面示例（当检测类别为语义分析时必填）
   */
  examples_positive?: Array<string>;
  /**
   * 反面示例（当检测类别为语义分析时必填）
   */
  examples_negative?: Array<string>;
  /**
   * 正则表达式（当检测类别为正则表达式时必填）
   */
  regular_expression?: string;
  /**
   * 检查历史消息数量
   */
  inspect_history?: number;
  /**
   * 行为类别
   */
  action_category: InterestCreateRequest.action_category;
  /**
   * 检测类别
   */
  inspect_category: InterestCreateRequest.inspect_category;
};
export namespace InterestCreateRequest {
  /**
   * 告警等级
   */
  export enum level {
    P0 = 'P0',
    P1 = 'P1',
    P2 = 'P2',
  }
  /**
   * 行为类别
   */
  export enum action_category {
    DETECT = 'Detect',
    FILTER = 'Filter',
  }
  /**
   * 检测类别
   */
  export enum inspect_category {
    SEMANTIC = 'Semantic',
    RE = 'RE',
  }
}
