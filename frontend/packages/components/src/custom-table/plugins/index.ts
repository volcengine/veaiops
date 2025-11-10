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
 * CustomTable plugin exports
 */

// Base types and system
export * from './plugin-system';

// Data source plugin
export * from './data-source';

// Filter plugin
export * from './table-filter';

// Column management plugin
export * from './table-columns';

// Pagination plugin
export * from './table-pagination';

// Sorting plugin
export * from './table-sorting';

// Query parameter synchronization plugin
export * from './query-sync';

// Column width persistence plugin
export * from './column-width-persistence';

// Custom fields plugin
export * from './custom-fields';

// Custom filter setting plugin
export * from './custom-filter-setting';

// Row selection plugin
export * from './row-selection';

// Inline edit plugin
export * from './inline-edit';

// Smart cell plugin
export * from './smart-cell';

// Core plugin system type exports (merged into core.ts)
export * from '@/custom-table/types/plugins/core';

// Specific plugin type exports
export * from '@/custom-table/types/plugins/data-source';
export * from '@/custom-table/types/plugins/table-alert';
export * from '@/custom-table/types/plugins/table-columns';
// table-filter types are exported via ./table-filter to avoid duplicate exports
// export * from '@/custom-table/types/plugins/table-filter';
export * from '@/custom-table/types/plugins/table-pagination';
export * from '@/custom-table/types/plugins/table-sorting';
// inline-edit and smart-cell types are exported via corresponding plugins to avoid duplicate exports
// export * from '@/custom-table/types/plugins/inline-edit';
// export * from '@/custom-table/types/plugins/smart-cell';
