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

import type { PluginPerformanceMetrics } from '@/custom-table/types';
/**
 * Plugin performance monitoring module
 * Responsible for collecting and analyzing plugin performance metrics
 *
 * @date 2025-12-19
 */
import { PluginStatusEnum } from '@/custom-table/types/core/enums';
import type { PluginRegistry } from './plugin-registry';

/**
 * @name Plugin performance monitor
 */
export class PluginPerformanceMonitor {
  constructor(private registry: PluginRegistry) {}

  /**
   * @name Get performance metrics
   */
  getPerformanceMetrics(): PluginPerformanceMetrics {
    const plugins = this.registry.getPlugins();
    const metrics: PluginPerformanceMetrics = {
      totalPlugins: plugins.length,
      enabledPlugins: plugins.filter((p) => p.enabled).length,
      disabledPlugins: plugins.filter((p) => !p.enabled).length,
      activePlugins: 0,
      totalInstallTime: 0,
      totalSetupTime: 0,
      totalRenderTime: 0,
      averageInstallTime: 0,
      averageSetupTime: 0,
      averageRenderTime: 0,
      errorCount: 0,
      pluginDetails: {},
    };

    plugins.forEach((plugin) => {
      const instance = this.registry.getInstance(plugin.name);
      if (instance) {
        const { performance } = instance;

        metrics.totalInstallTime += performance.installTime;
        metrics.totalSetupTime += performance.setupTime;
        metrics.totalRenderTime += performance.renderTime;

        metrics.pluginDetails[plugin.name] = {
          status: (() => {
            if (instance.status === PluginStatusEnum.ACTIVE) {
              return 'active';
            }
            if (instance.status === PluginStatusEnum.INACTIVE) {
              return 'inactive';
            }
            return 'error';
          })(),
          installTime: performance.installTime,
          setupTime: performance.setupTime,
          renderTime: performance.renderTime,
          errorCount: instance.error ? 1 : 0,
          lastError: instance.error,
        };

        if (instance.status === PluginStatusEnum.ACTIVE) {
          metrics.activePlugins++;
        }

        if (instance.error) {
          metrics.errorCount++;
        }
      }
    });

    // Calculate averages
    if (plugins.length > 0) {
      metrics.averageInstallTime = metrics.totalInstallTime / plugins.length;
      metrics.averageSetupTime = metrics.totalSetupTime / plugins.length;
      metrics.averageRenderTime = metrics.totalRenderTime / plugins.length;
    }

    return metrics;
  }

  /**
   * @name Get performance report
   */
  getPerformanceReport(): string {
    const metrics = this.getPerformanceMetrics();

    const report = [
      '=== Plugin Performance Report ===',
      `Total Plugins: ${metrics.totalPlugins}`,
      `Enabled: ${metrics.enabledPlugins}`,
      `Disabled: ${metrics.disabledPlugins}`,
      '',
      '=== Performance Metrics ===',
      `Total Install Time: ${metrics.totalInstallTime.toFixed(2)}ms`,
      `Total Setup Time: ${metrics.totalSetupTime.toFixed(2)}ms`,
      `Total Render Time: ${metrics.totalRenderTime.toFixed(2)}ms`,
      `Average Install Time: ${metrics.averageInstallTime.toFixed(2)}ms`,
      `Average Setup Time: ${metrics.averageSetupTime.toFixed(2)}ms`,
      `Average Render Time: ${metrics.averageRenderTime.toFixed(2)}ms`,
      '',
      '=== Plugin Details ===',
    ];

    Object.entries(metrics.pluginDetails).forEach(([name, details]) => {
      const pluginDetails = details as {
        installTime: number;
        setupTime: number;
        renderTime: number;
        errorCount: number;
        lastError?: Error;
        status: string;
      };
      report.push(`${name}:`);
      report.push(`  Status: ${pluginDetails.status}`);
      report.push(`  Install Time: ${pluginDetails.installTime.toFixed(2)}ms`);
      report.push(`  Setup Time: ${pluginDetails.setupTime.toFixed(2)}ms`);
      report.push(`  Render Time: ${pluginDetails.renderTime.toFixed(2)}ms`);
      if (pluginDetails.errorCount > 0) {
        report.push(`  Error Count: ${pluginDetails.errorCount}`);
        if (pluginDetails.lastError) {
          report.push(`  Last Error: ${pluginDetails.lastError.message}`);
        }
      }
      report.push('');
    });

    return report.join('\n');
  }

  /**
   * @name Check performance issues
   */
  checkPerformanceIssues(): string[] {
    const metrics = this.getPerformanceMetrics();
    const issues: string[] = [];

    // Check plugins with excessive installation time
    Object.entries(metrics.pluginDetails).forEach(([name, details]) => {
      const pluginDetails = details as {
        installTime: number;
        setupTime: number;
        renderTime: number;
        errorCount: number;
        lastError?: Error;
      };
      if (pluginDetails.installTime > 100) {
        issues.push(
          `Plugin "${name}" installation time too long (${pluginDetails.installTime.toFixed(
            2,
          )}ms)`,
        );
      }

      if (pluginDetails.setupTime > 50) {
        issues.push(
          `Plugin "${name}" setup time too long (${pluginDetails.setupTime.toFixed(
            2,
          )}ms)`,
        );
      }

      if (pluginDetails.renderTime > 16) {
        // 16ms = 60fps
        issues.push(
          `Plugin "${name}" render time too long (${pluginDetails.renderTime.toFixed(
            2,
          )}ms)`,
        );
      }

      if (pluginDetails.errorCount > 0) {
        issues.push(
          `Plugin "${name}" has errors: ${
            pluginDetails.lastError?.message || 'Unknown error'
          }`,
        );
      }
    });

    return issues;
  }

  /**
   * @name Reset performance data
   */
  resetPerformanceData(): void {
    const plugins = this.registry.getPlugins();

    plugins.forEach((plugin) => {
      const instance = this.registry.getInstance(plugin.name);
      if (instance) {
        instance.performance = {
          installTime: 0,
          setupTime: 0,
          renderTime: 0,
          lastExecutionTime: 0,
        };
        instance.error = undefined;
      }
    });
  }
}
