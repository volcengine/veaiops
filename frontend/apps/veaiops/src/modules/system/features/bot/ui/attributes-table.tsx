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

import { Alert } from '@arco-design/web-react';
import { BOT_ATTRIBUTES_INFO_MESSAGE } from '../lib';
import type { BotAttributesTableProps } from '../types';
import { AttributesTableContent } from './components';

/**
 * Bot attributes table component
 * Provides CRUD functionality for Bot attributes
 *
 * Architecture description:
 * - AttributesTableContent component fully encapsulates CustomTable, useBotAttributesTable Hook and all related UI (including modals)
 * - Main component only handles outer container and info messages, does not manage any business logic or state
 * - Follows Feature-Based architecture cohesion principle: all table-related content is in AttributesTableContent
 */
export const BotAttributesTable: React.FC<BotAttributesTableProps> = ({
  botId,
  channel,
}) => {
  return (
    <div className="bot-attributes-table">
      {/* Feature description alert */}
      <Alert
        type="info"
        content={BOT_ATTRIBUTES_INFO_MESSAGE}
        closable
        style={{ marginBottom: 16 }}
      />

      {/* 🎯 Table content component (fully self-contained: CustomTable + useBotAttributesTable + modals) */}
      <AttributesTableContent botId={botId} channel={channel} />
    </div>
  );
};

export default BotAttributesTable;
