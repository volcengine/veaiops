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

// Hook exports
export { useSelectBlock } from './hooks/use-select-block';

// Plugin manager exports
export { SelectBlockPluginManager } from './core/plugin-manager';

// Built-in plugin exports
export { DataFetcherPluginImpl } from './plugins/data-fetcher';
export { SearchHandlerPluginImpl } from './plugins/search-handler';
export { PaginationPluginImpl } from './plugins/pagination-handler';
export { PasteHandlerPluginImpl } from './plugins/paste-handler';
export { CacheHandlerPluginImpl } from './plugins/cache-handler';

// Plugin system related type exports
export type {
  Plugin,
  PluginContext,
  PluginManager,
  PluginUtils,
  SelectBlockState,
  SearchParams,
  DataFetcherPlugin,
  DataFetcherConfig,
  SearchHandlerPlugin,
  SearchHandlerConfig,
  PaginationPlugin,
  PaginationConfig,
  PasteHandlerPlugin,
  PasteHandlerConfig,
  CacheHandlerPlugin,
  CacheHandlerConfig,
} from './types/plugin';
