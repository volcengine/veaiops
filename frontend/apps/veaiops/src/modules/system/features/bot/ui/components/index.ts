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
 * Bot UI Components Export
 * Organized by Feature-Based Architecture
 */

// Bot related components
export { BotAttributeFormModal } from './bot/attribute-form-modal';
export { BotAttributesDrawer } from './bot/attributes-drawer';
export { BotCompleteModal } from './bot/complete-modal';
export { BotDrawerTitle } from './bot/drawer-title';
export { BotCreateForm } from './bot/create-form';
export { BotEditForm } from './bot/edit-form';
export { LarkConfigGuide } from './bot/lark-config-guide';
export { CallbacksCollapse } from './bot/callbacks-collapse';
export { EventsCollapse } from './bot/events-collapse';
export { PermissionsCollapse } from './bot/permissions-collapse';

// Chat management components
export { ChatConfigModal } from './chat/chat-config-modal';
export { ChatTable } from './chat/chat-table';
export { ChatManagementDrawer } from './chat/management-drawer';

// Attribute components
export {
  BotAttributesTable as AttributesTable,
  default as BotAttributesTable,
} from './attributes/attributes-table';
export { AttributeDetailModal } from './attributes/detail-modal';
export { AttributesTableContent } from './attributes/table-content';
export type { AttributesTableContentProps } from './attributes/table-content';
