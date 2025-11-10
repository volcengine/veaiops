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

import * as businessPresets from './business';
/**
 * Preset registry
 */
import type { PresetGenerator, PresetRegistry } from './types';

/**
 * Preset registry class
 */
class FilterPresetRegistry {
  private presets: PresetRegistry = {};

  /**
   * Register preset
   */
  register({
    name,
    generator,
  }: {
    name: string;
    generator: PresetGenerator;
  }): void {
    this.presets[name] = generator;
  }

  /**
   * Batch register presets
   */
  registerBatch(presets: Record<string, PresetGenerator>): void {
    Object.entries(presets).forEach(([name, generator]) => {
      this.register({ name, generator });
    });
  }

  /**
   * Get preset
   */
  get(name: string): PresetGenerator | undefined {
    return this.presets[name];
  }

  /**
   * Check if preset exists
   */
  has(name: string): boolean {
    return name in this.presets;
  }

  /**
   * Get all preset names
   */
  getNames(): string[] {
    return Object.keys(this.presets);
  }

  /**
   * Get preset statistics
   */
  getStats(): {
    total: number;
    names: string[];
  } {
    return {
      total: Object.keys(this.presets).length,
      names: this.getNames(),
    };
  }

  /**
   * Clear all presets
   */
  clear(): void {
    this.presets = {};
  }
}

// Create singleton instance
export const filterPresetRegistry = new FilterPresetRegistry();

// Register default business presets
filterPresetRegistry.registerBatch({
  // Account related
  'account-select': businessPresets.accountSelectPreset,
  'customer-select': businessPresets.accountSelectPreset, // Alias

  // Product related
  'product-select': businessPresets.productSelectPreset,

  // Event related
  'event-type-select': businessPresets.eventTypeSelectPreset,
  'event-id-input': businessPresets.eventIdInputPreset,
  'subscription-name-input': businessPresets.subscriptionNameInputPreset,

  // Business scene
  'business-scene-cascader': businessPresets.businessSceneCascaderPreset,

  // Data source
  'datasource-type-select': businessPresets.datasourceTypeSelectPreset,

  // Task related
  'task-status-select': businessPresets.taskStatusSelectPreset,
  'task-id-select': businessPresets.taskIdSelectPreset,
});

// Export class for custom use
export { FilterPresetRegistry };
