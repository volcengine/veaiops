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
 * Plugin system initialization logic
 * @description Responsible for plugin system initialization and configuration

 *
 */

import { corePlugins } from './core-plugins';
import {
  initializePluginExtensions,
  pluginExtensionManager,
} from './extension/config';

/**
 * Initialize core plugins
 * Execute complete plugin system initialization process
 *
 * @returns Initialization result statistics
 */
export const initializeCorePlugins = () => {
  // First initialize extension configuration
  initializePluginExtensions();

  // Use extension manager to enhance plugins and register
  pluginExtensionManager.enhanceAndRegisterPlugins(corePlugins);

  // Get statistics
  const { filterPluginRegistry } = require('./registry');
  const registryStats = filterPluginRegistry.getStats();
  const extensionStats = pluginExtensionManager.getStats();

  return {
    registryStats,
    extensionStats,
  };
};
