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
 * CustomTable utility function related error type definitions
 *

 * @date 2025-12-19
 */

/**
 * @name Response error type
 * @description Used for unified handling of API response errors
 */
export interface ResponseErrorType {
  /** @name Error code */
  code: number;
  /** @name Error message */
  message: string;
  /** @name Error details (optional) */
  details?: string;
  /** @name Error stack (optional, used in development environment) */
  stack?: string;
}
