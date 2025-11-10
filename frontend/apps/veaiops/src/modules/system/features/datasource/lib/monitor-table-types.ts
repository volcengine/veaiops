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

// Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. and/or its affiliates
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useBusinessTable } from '@veaiops/components';
import type {
  BaseQuery,
  FieldItem,
  HandleFilterProps,
  ModernTableColumnProps,
} from '@veaiops/components';
import type { DataSource, DataSourceType } from 'api-generate';

/**
 * Monitor configuration table configuration Hook options type
 */
export interface UseMonitorTableConfigOptions {
  onEdit?: (monitor: DataSource) => void;
  onDelete?: (monitorId: string) => Promise<boolean>;
  dataSourceType: DataSourceType;
}

/**
 * Monitor configuration table configuration Hook return value type
 */
export interface UseMonitorTableConfigReturn {
  customTableProps: ReturnType<typeof useBusinessTable>['customTableProps'];
  customOperations: ReturnType<typeof useBusinessTable>['customOperations'];
  operations: ReturnType<typeof useBusinessTable>['operations'];
  wrappedHandlers?: ReturnType<typeof useBusinessTable>['wrappedHandlers'];
  handleColumns: (
    props: Record<string, unknown>,
  ) => ModernTableColumnProps<DataSource>[];
  handleFilters: (props: HandleFilterProps<BaseQuery>) => FieldItem[];
}
