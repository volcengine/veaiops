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
 * Unified UI component exports
 */

// Tables
export {
  ConnectionTable,
  default as ConnectionTableDefault,
} from './tables/connection-table';
export { getTableColumns } from './tables/table-columns';
export {
  getTableFilters,
  STATUS_FILTER_OPTIONS,
  TIME_RANGE_FILTER_OPTIONS,
} from './tables/table-filters';

// Panels
export {
  ConnectionPanel,
  default as ConnectionPanelDefault,
} from './panels/connection-panel';
export {
  ConnectionManager,
  default as ConnectionManagerDefault,
} from './panels/connection-manager';
export { ConnectionPanelHeader } from './panels/connection-panel-header';

// Forms
export { ConnectForm } from './forms/connect-form';
export { AliyunCredentialsForm } from './forms/aliyun-credentials-form';
export { VolcengineCredentialsForm } from './forms/volcengine-credentials-form';
export { ZabbixCredentialsForm } from './forms/zabbix-credentials-form';

// Modals
export { CreateConnectionModal } from './modals/create-connection-modal';
export { EditConnectionModal } from './modals/edit-connection-modal';
export { ConnectionModals } from './modals/connection-modals';
export { TestFailureModal } from './modals/test-failure-modal';

// Connect Test
export { ConnectTestModal } from './connect-test/connect-test-modal';
export * from './connect-test/components';

// Shared components
// Note: shared module has been removed
// export * from './shared';
