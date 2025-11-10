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
 * API client type definitions
 *
 * This file defines the type interfaces for API clients, allowing hooks to be independent of specific API-generated code
 */

// Base API types
export interface APIResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

export interface APIError {
  message: string;
  status: number;
  details?: unknown;
}

export interface RequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}

// API client interface
export interface APIClient {
  // Authentication related
  login_for_access_token: (config?: RequestConfig) => Promise<unknown>;

  // User management
  list_users: (config?: RequestConfig) => Promise<unknown>;
  get_user: (config?: { user_id: string } & RequestConfig) => Promise<unknown>;
  create_user: (config?: RequestConfig) => Promise<unknown>;
  update_user: (
    config?: { user_id: string } & RequestConfig,
    updates?: unknown,
  ) => Promise<unknown>;
  delete_user: (
    config?: { user_id: string } & RequestConfig,
  ) => Promise<unknown>;

  // System configuration
  get_global_config: (config?: RequestConfig) => Promise<unknown>;

  // Webhook
  payload_webhook: (config?: RequestConfig) => Promise<unknown>;
}

// Service interfaces
export interface AuthService {
  login_for_access_token: (config?: RequestConfig) => Promise<unknown>;
}

export interface ManagerService {
  create_user: (config?: RequestConfig) => Promise<unknown>;
  get_user: (config?: { user_id: string } & RequestConfig) => Promise<unknown>;
  list_users: (config?: RequestConfig) => Promise<unknown>;
  update_user: (
    config?: { user_id: string } & RequestConfig,
    updates?: unknown,
  ) => Promise<unknown>;
  delete_user: (
    config?: { user_id: string } & RequestConfig,
  ) => Promise<unknown>;
}

// Default API client instances (will be injected at runtime)
let apiClientInstance: APIClient;
let authServiceInstance: AuthService;
let managerServiceInstance: ManagerService;

/**
 * Set API client instance
 * This function needs to be called at application startup
 */
export function setApiClient(client: APIClient) {
  apiClientInstance = client;
}

/**
 * Set service instances
 */
export function setAuthService(service: AuthService) {
  authServiceInstance = service;
}

export function setManagerService(service: ManagerService) {
  managerServiceInstance = service;
}

/**
 * Get API client instance
 */
export function getApiClient(): APIClient {
  if (!apiClientInstance) {
    throw new Error('API client not initialized. Call setApiClient() first.');
  }
  return apiClientInstance;
}

/**
 * Get authentication service instance
 */
export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    throw new Error(
      'Auth service not initialized. Call setAuthService() first.',
    );
  }
  return authServiceInstance;
}

/**
 * Get manager service instance
 */
export function getManagerService(): ManagerService {
  if (!managerServiceInstance) {
    throw new Error(
      'Manager service not initialized. Call setManagerService() first.',
    );
  }
  return managerServiceInstance;
}
