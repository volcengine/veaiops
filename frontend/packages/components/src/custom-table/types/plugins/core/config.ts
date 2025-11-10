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
 * Plugin configuration related type definitions
 */

// PluginPriority is already defined in core/enums.ts, import from core to avoid duplication
import type { PluginPriority } from '../../core/enums';

/**
 * Plugin base configuration
 */
export interface PluginBaseConfig {
  enabled?: boolean;
  priority?: PluginPriority;
  autoInstall?: boolean;
  dependencies?: string[];
  conflicts?: string[];
}

/**
 * Plugin performance metrics
 */
export interface PluginPerformanceMetrics {
  totalPlugins: number;
  enabledPlugins: number;
  disabledPlugins: number;
  activePlugins: number;
  totalInstallTime: number;
  totalSetupTime: number;
  totalRenderTime: number;
  averageInstallTime: number;
  averageSetupTime: number;
  averageRenderTime: number;
  errorCount: number;
  pluginDetails: Record<
    string,
    {
      installTime: number;
      setupTime: number;
      renderTime: number;
      errorCount: number;
      lastError?: Error;
      status: 'active' | 'inactive' | 'error';
    }
  >;
}
