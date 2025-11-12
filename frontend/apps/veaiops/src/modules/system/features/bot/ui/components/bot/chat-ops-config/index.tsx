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

import { Space, Switch, Typography } from '@arco-design/web-react';
import { CardWithTitle } from '@veaiops/components';
import type React from 'react';
import { KbConfig, ModelConfig } from './sections';

const { Text } = Typography;

interface ChatOpsConfigProps {
  showAdvancedConfig: boolean;
  setShowAdvancedConfig: (show: boolean) => void;
  kbCollections: string[];
  showSecrets: {
    secret: boolean;
    ak: boolean;
    sk: boolean;
    api_key: boolean;
  };
  toggleSecretVisibility: (field: 'secret' | 'ak' | 'sk' | 'api_key') => void;
  addKbCollection: () => void;
  removeKbCollection: (index: number) => void;
  updateKbCollection: (params: { index: number; value: string }) => void;
  urlValidator?: (value: string, callback: (error?: string) => void) => void;
}

/**
 * ChatOps configuration component
 *
 * Component structure:
 * - sections/model-config.tsx: LLM configuration section (model name, embedding model, API base URL, API key)
 * - sections/kb-config.tsx: Knowledge base configuration section (access key, secret key, TOS region, network type, knowledge base collections)
 * - index.tsx: Main entry component, responsible for assembly and rendering
 */
export const ChatOpsConfig: React.FC<ChatOpsConfigProps> = ({
  showAdvancedConfig,
  setShowAdvancedConfig,
  kbCollections,
  showSecrets,
  toggleSecretVisibility,
  addKbCollection,
  removeKbCollection,
  updateKbCollection,
  urlValidator,
}) => {
  return (
    <CardWithTitle title="高级配置" className="mb-4">
      <div className="mb-4">
        <Space align="center">
          <Switch
            checked={showAdvancedConfig}
            onChange={setShowAdvancedConfig}
          />
          <Text className="font-medium">配置ChatOps</Text>
        </Space>
        <Text type="secondary" className="block mt-2">
          ChatOps功能包括智能问答、内容识别、主动回复等AI能力，需要配置大模型（LLM）和知识库。
          <br />• 如不配置：将使用系统默认配置
          <br />• 如系统未配置有效密钥：ChatOps功能将不可用
          <br />• 不影响：智能阈值服务和告警消息推送可正常使用
          <br />
          <br />
          创建后也可以随时在编辑页面补充配置。
        </Text>
      </div>

      {showAdvancedConfig && (
        <>
          <ModelConfig
            showAdvancedConfig={showAdvancedConfig}
            showSecrets={showSecrets}
            toggleSecretVisibility={toggleSecretVisibility}
            urlValidator={urlValidator}
          />
          <KbConfig
            showAdvancedConfig={showAdvancedConfig}
            kbCollections={kbCollections}
            showSecrets={showSecrets}
            toggleSecretVisibility={toggleSecretVisibility}
            addKbCollection={addKbCollection}
            removeKbCollection={removeKbCollection}
            updateKbCollection={updateKbCollection}
          />
        </>
      )}
    </CardWithTitle>
  );
};

export default ChatOpsConfig;
