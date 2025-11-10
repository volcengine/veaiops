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

import type { FormInstance } from '@arco-design/web-react';
import { Form } from '@arco-design/web-react';
import { useFormHandlers } from './handlers';
import { useBotCreateFormCallbacks } from './main-logic/callbacks';
import { useBotCreateFormEffects } from './main-logic/effects';
import { useBotCreateFormState } from './main-logic/state';
import { urlValidator } from './validators';

/**
 * Hook for form creation logic
 *
 * Split explanation:
 * - use-bot-create-form/state.ts: State management (form, kbCollections, showSecrets, etc.)
 * - use-bot-create-form/effects.ts: Side effects management (useEffect logic)
 * - use-bot-create-form/callbacks.ts: Callback functions (addKbCollection, removeKbCollection, etc.)
 * - handlers/form-handlers.ts: Form submission handler
 * - utils/: Utility functions (kb-collections.ts, validations.ts)
 * - validators/: Validators (url-validator.ts)
 * - use-bot-create-form.ts: Main entry, responsible for logic assembly
 */
export const useBotCreateForm = () => {
  // State management
  const state = useBotCreateFormState();

  // Side effects management
  useBotCreateFormEffects({
    form: state.form,
    showAdvancedConfig: state.showAdvancedConfig,
  });

  // Get current form's bot_id value
  // Note: Form.useWatch requires generic FormInstance, but here use type assertion to ensure compatibility
  const currentBotId =
    (Form.useWatch('bot_id', state.form as FormInstance) as
      | string
      | undefined) || '';

  // Callback functions
  const callbacks = useBotCreateFormCallbacks({
    form: state.form,
    kbCollections: state.kbCollections,
    setKbCollections: state.setKbCollections,
    setShowSecrets: state.setShowSecrets,
  });

  // Form submission handler
  const { createSubmitHandler } = useFormHandlers({
    form: state.form,
    showAdvancedConfig: state.showAdvancedConfig,
    kbCollections: state.kbCollections,
  });

  return {
    form: state.form,
    kbCollections: state.kbCollections,
    showSecrets: state.showSecrets,
    showAdvancedConfig: state.showAdvancedConfig,
    selectedChannel: state.selectedChannel,
    currentBotId,
    setSelectedChannel: state.setSelectedChannel,
    setShowAdvancedConfig: state.setShowAdvancedConfig,
    addKbCollection: callbacks.addKbCollection,
    removeKbCollection: callbacks.removeKbCollection,
    updateKbCollection: callbacks.updateKbCollection,
    toggleSecretVisibility: callbacks.toggleSecretVisibility,
    createSubmitHandler,
    urlValidator,
    checkAppIdDuplicate: callbacks.checkAppIdDuplicate,
  };
};
