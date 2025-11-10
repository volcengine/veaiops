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
 * Renderers - Unified export entry
 * Responsibility: Provide complete renderer functionality, including core components, business logic, and provider-specific renderers
 *
 * Directory structure:
 * - core/: Core rendering components and functions
 * - components/: UI components
 * - providers/: Cloud provider-specific renderers
 */

// Export main business functions
export { renderDataSourceConfig } from './render-data-source-config';

// Export components
export { CollapsibleConfigItems } from './components';

// Export core renderers (for advanced use)
export {
  renderAllConfigItems,
  ConfigKeyLabel,
  ConfigValueRenderer,
  ConfigValueContent,
  ConfigItemRenderer,
} from './core';

// Export types
export type { ConfigItem } from './core';

// Export cloud provider-specific renderers
export * from './providers';
