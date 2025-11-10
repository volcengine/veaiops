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
import {
  KbCollections,
  VolcCredentials,
  VolcSettings,
} from './kb-config/index';

const CollapseItem = Collapse.Item;

interface KbConfigProps {
  showAdvancedConfig: boolean;
  kbCollections: string[];
  showSecrets: {
    ak: boolean;
    sk: boolean;
  };
  toggleSecretVisibility: (field: 'ak' | 'sk') => void;
  addKbCollection: () => void;
  removeKbCollection: (index: number) => void;
  updateKbCollection: (params: { index: number; value: string }) => void;
}

/**
 * Knowledge base configuration block component
 *
 * Split description:
 * - kb-config/volc-credentials.tsx: Volcengine credentials configuration (Access Key, Secret Key)
 * - kb-config/volc-settings.tsx: Volcengine settings configuration (TOS region, network type)
 * - kb-config/kb-collections.tsx: Knowledge base collections configuration
 * - kb-config.tsx: Main entry component, responsible for assembly and rendering
 */
export const KbConfig: React.FC<KbConfigProps> = ({
  showAdvancedConfig,
  kbCollections,
  showSecrets,
  toggleSecretVisibility,
  addKbCollection,
  removeKbCollection,
  updateKbCollection,
}) => {
  return (
    <Collapse defaultActiveKey={['1']} className="mb-4">
      <CollapseItem header="知识库配置（仅支持火山引擎）" name="1">
        <VolcCredentials
          showAdvancedConfig={showAdvancedConfig}
          showSecrets={showSecrets}
          toggleSecretVisibility={toggleSecretVisibility}
        />

        <VolcSettings showAdvancedConfig={showAdvancedConfig} />

        <KbCollections
          kbCollections={kbCollections}
          addKbCollection={addKbCollection}
          removeKbCollection={removeKbCollection}
          updateKbCollection={updateKbCollection}
        />
      </CollapseItem>
    </Collapse>
  );
};
