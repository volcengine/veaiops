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

// Export feature modules (only export main components and types, avoid exporting conflicting utility functions)
// Account module: Export main components and Hooks, do not export utility functions from lib (avoid formatDateTime conflict)
export {
  AccountManagement,
  AccountModal,
  useAccountManagementLogic,
} from './account';
export type {
  UserStatus as AccountStatus,
  UserRole as AccountRole,
} from './account';

// Bot module: Full export
export * from './bot';

// Customer module: Full export
export * from './customer';

// Project module: Export main components and Hooks, do not export utility functions from lib (avoid formatDateTime conflict)
export {
  ProjectManagement,
  ProjectTable,
  ProjectModal,
  ProjectDetailDrawer,
  ProjectCreateDrawer,
  ProjectImportDrawer,
  useProjectManagement,
  useProjectTable,
  useProject,
  useProjectTableConfig,
  type ProjectStatus,
  type ProjectPriority,
} from './project';
