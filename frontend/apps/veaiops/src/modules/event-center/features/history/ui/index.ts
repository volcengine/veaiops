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
 * 历史事件 UI 组件统一导出
 */

// HistoryManagement and HistoryTable removed - all history pages now use EventHistoryTable from @veaiops/components
export { HistoryDetailDrawer } from './components/table';

// 导出子组件
export * from './components/base';
export * from './components/business';

// 导出类型定义
export * from './shared/types';

// 导出常量
export * from './shared/constants';

// 导出工具函数
export * from './shared/utils';
