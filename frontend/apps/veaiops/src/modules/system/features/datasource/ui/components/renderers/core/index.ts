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
 * Core renderers - Unified export entry
 * Responsibility: Provide core components and functions for config item rendering
 */

// Export types
export type { ConfigItem } from '@datasource/types';

// Export core rendering functions
export { renderAllConfigItems } from './render-functions';

// Export core components
export { ConfigKeyLabel } from './config-key-label';
export { ConfigValueRenderer } from './config-value-renderer';
export { ConfigValueContent } from './config-value-content';
export { ConfigItemRenderer } from './config-item-renderer';
