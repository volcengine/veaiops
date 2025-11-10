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

import { Collapse, Form } from '@arco-design/web-react';
import type React from 'react';
import { ApiKeyField, ModelFields } from './model-config/index';

const CollapseItem = Collapse.Item;

interface ModelConfigProps {
  showAdvancedConfig: boolean;
  showSecrets: {
    api_key: boolean;
  };
  toggleSecretVisibility: (field: 'api_key') => void;
  urlValidator?: (value: string, callback: (error?: string) => void) => void;
}

/**
 * Large model configuration block component
 *
 * Split description:
 * - model-config/model-fields.tsx: Model configuration fields (model name, Embedding model name, API Base URL)
 * - model-config/api-key-field.tsx: API Key input field (includes password visibility toggle)
 * - model-config.tsx: Main entry component, responsible for assembly and rendering
 */
export const ModelConfig: React.FC<ModelConfigProps> = ({
  showAdvancedConfig,
  showSecrets,
  toggleSecretVisibility,
  urlValidator,
}) => {
  return (
    <Collapse defaultActiveKey={['1']} className="mb-4">
      <CollapseItem header="大模型配置" name="1">
        <ModelFields
          showAdvancedConfig={showAdvancedConfig}
          urlValidator={urlValidator}
        />

        <ApiKeyField
          showAdvancedConfig={showAdvancedConfig}
          showSecrets={showSecrets}
          toggleSecretVisibility={toggleSecretVisibility}
        />
      </CollapseItem>
    </Collapse>
  );
};
