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
   * Rule name
   */
  name?: string;
  /**
   * Description
   */
  description?: string;
  /**
   * Alert level
   */
  level?: InterestUpdateRequest.level;
  /**
   * Alert suppression interval
   */
  silence_delta?: string;
  /**
   * Whether enabled
   */
  is_active?: boolean;
  /**
   * Positive examples (editable when inspection category is semantic analysis)
   */
  examples_positive?: Array<string>;
  /**
   * Negative examples (editable when inspection category is semantic analysis)
   */
  examples_negative?: Array<string>;
  /**
   * Regular expression (editable when inspection category is regular expression)
   */
  regular_expression?: string;
};
export namespace InterestUpdateRequest {
  /**
   * Alert level
   */
  export enum level {
    P0 = 'P0',
    P1 = 'P1',
    P2 = 'P2',
  }
}
