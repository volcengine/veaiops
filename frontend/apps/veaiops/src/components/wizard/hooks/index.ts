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
 * Data source wizard Hooks unified export
 */

// State management
export { useDataSourceWizard } from './state/use-datasource-wizard';
export { useWizardState } from './state/use-wizard-state';
export { useAliyunState } from './state/use-aliyun-state';

// Data operations
export { useConnectOperations } from './operations/use-connect-operations';
export { useZabbixOperations } from './operations/use-zabbix-operations';
export { useAliyunOperations } from './operations/use-aliyun-operations';
export { useVolcengineOperations } from './operations/use-volcengine-operations';

// Navigation
export { useWizardNavigation } from './navigation/use-wizard-navigation';
export {
  guardAliyunConnectRegion,
  guardVolcengineConnectRegion,
} from './navigation/use-next-step-guard';

// Creation
export { useDataSourceCreation } from './creation/use-datasource-creation';
