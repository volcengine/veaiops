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
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Form } from '@arco-design/web-react';
import type { BotFormData } from '@bot/lib';
import type React from 'react';
import { useBotCreateForm } from '../../../../hooks/form/create-form';
import { ChatOpsConfig } from '../chat-ops-config';
import { BasicConfig } from './sections/basic-config';
import { FormActions } from './sections/form-actions';

interface BotCreateFormProps {
  onSubmit: (values: BotFormData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Bot creation form component
 * @description Contains complete bot configuration form, supports all required fields
 *
 * Split explanation:
 * - sections/basic-config.tsx: Basic configuration block (enterprise collaboration tool, App ID, App Secret)
 * - sections/form-actions.tsx: Action buttons block (cancel, create bot)
 * - chat-ops-config.tsx: Advanced configuration component (existing independent component)
 * - index.tsx: Main entry component, responsible for assembly and rendering
 */
export const BotCreateForm: React.FC<BotCreateFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const {
    form,
    kbCollections,
    showSecrets,
    showAdvancedConfig,
    selectedChannel,
    currentBotId,
    setSelectedChannel,
    setShowAdvancedConfig,
    addKbCollection,
    removeKbCollection,
    updateKbCollection,
    toggleSecretVisibility,
    createSubmitHandler,
    urlValidator,
    checkAppIdDuplicate,
  } = useBotCreateForm();

  return (
    <div className="bot-create-form">
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onSubmit={createSubmitHandler(onSubmit)}
      >
        {/* Basic configuration */}
        <BasicConfig
          form={form}
          selectedChannel={selectedChannel}
          currentBotId={currentBotId}
          showSecrets={showSecrets}
          checkAppIdDuplicate={checkAppIdDuplicate}
          setSelectedChannel={setSelectedChannel}
          toggleSecretVisibility={toggleSecretVisibility}
        />

        {/* Advanced configuration (optional) */}
        <ChatOpsConfig
          showAdvancedConfig={showAdvancedConfig}
          setShowAdvancedConfig={setShowAdvancedConfig}
          kbCollections={kbCollections}
          showSecrets={showSecrets}
          toggleSecretVisibility={toggleSecretVisibility}
          addKbCollection={addKbCollection}
          removeKbCollection={removeKbCollection}
          updateKbCollection={updateKbCollection}
          urlValidator={urlValidator}
        />

        {/* Action buttons */}
        <FormActions onCancel={onCancel} loading={loading} />
      </Form>
    </div>
  );
};

export default BotCreateForm;
