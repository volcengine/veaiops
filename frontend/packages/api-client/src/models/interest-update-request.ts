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
export type InterestUpdateRequest = {
  /**
   * 规则名称
   */
  name?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 告警等级
   */
  level?: InterestUpdateRequest.level;
  /**
   * 告警抑制间隔（ISO 8601 duration format, e.g., PT6H, PT30M, P1D）
   */
  silence_delta?: string;
  /**
   * 是否启用状态
   */
  is_active?: boolean;
  /**
   * 正面示例（当检测类别为语义分析时可编辑）
   */
  examples_positive?: Array<string>;
  /**
   * 反面示例（当检测类别为语义分析时可编辑）
   */
  examples_negative?: Array<string>;
  /**
   * 正则表达式（当检测类别为正则表达式时可编辑）
   */
  regular_expression?: string;
  /**
   * 检查历史消息数量
   */
  inspect_history?: number;
};
export namespace InterestUpdateRequest {
  /**
   * 告警等级
   */
  export enum level {
    P0 = 'P0',
    P1 = 'P1',
    P2 = 'P2',
  }
}
