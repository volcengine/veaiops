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
 * API error type definition
 */
export interface ApiError {
  status: number;
  message?: string;
  // Support API error response format
  code?: number;
  data?: any;
}

/**
 * Error handling configuration
 */
export interface ErrorHandlerConfig {
  /** 401 Unauthorized error message */
  unauthorizedMessage?: string;
  /** 404 Not Found error message */
  notFoundMessage?: string;
  /** 409 Conflict error message */
  conflictMessage?: string;
  /** Default error message */
  defaultMessage?: string;
}
