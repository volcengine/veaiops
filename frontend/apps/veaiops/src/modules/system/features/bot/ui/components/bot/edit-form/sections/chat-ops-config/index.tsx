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

import {
  type FormInstance,
  Space,
  Switch,
  Typography,
} from '@arco-design/web-react';
import type { Bot } from '@veaiops/api-client';
import { CardWithTitle } from '@veaiops/components';
import type React from 'react';
import { KnowledgeBaseConfig, ModelConfig } from './components';
import { type UrlValidator, useSecretViewer, useUrlValidator } from './hooks';

const { Text } = Typography;

/**
 * ChatOps配置组件的 Props
 */
interface ChatOpsConfigProps {
  form: FormInstance;
  bot?: Bot;
  showAdvancedConfig: boolean;
  setShowAdvancedConfig: (show: boolean) => void;
  kbCollections: string[];
  showSecrets: {
    ak: boolean;
    sk: boolean;
    api_key: boolean;
  };
  toggleSecretVisibility: (field: 'ak' | 'sk' | 'api_key') => void;
  addKbCollection: () => void;
  removeKbCollection: (index: number) => void;
  updateKbCollection: (index: number, value: string) => void;
  urlValidator?: UrlValidator;
}

/**
 * ChatOps扩展配置组件（编辑表单专用）
 *
 *
 * 拆分说明：
 * - 大模型配置（ModelConfig）：模型名称、Embedding模型名称、API Base URL、API Key
 * - 知识库配置（KnowledgeBaseConfig）：Access Key、Secret Key、TOS区域、网络类型、知识库集合
 * - 共享逻辑（hooks）：加密信息查看、URL验证
 */
export const ChatOpsConfig: React.FC<ChatOpsConfigProps> = ({
  form,
  bot,
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
  // Use shared hooks
  const secretViewer = useSecretViewer({
    botId: bot?._id ?? undefined,
    form,
  });

  const finalUrlValidator = useUrlValidator(urlValidator);

  return (
    <CardWithTitle title="高级配置" className="mb-4">
      <div className="mb-4">
        <Space align="center">
          <Switch
            checked={showAdvancedConfig}
            onChange={setShowAdvancedConfig}
          />
          <Text className="font-medium">配置ChatOps功能</Text>
        </Space>
        <Text type="secondary" className="block mt-2">
          ChatOps功能包括智能问答、内容识别、主动回复等AI能力，需要配置大模型（LLM）和知识库。
          <br />• 如不配置：将使用系统默认配置
          <br />• 如系统未配置有效密钥：ChatOps功能将不可用
          <br />• 不影响：智能阈值服务和告警消息推送可正常使用
        </Text>
      </div>

      {showAdvancedConfig && (
        <>
          <ModelConfig
            form={form}
            showAdvancedConfig={showAdvancedConfig}
            showSecrets={showSecrets}
            toggleSecretVisibility={toggleSecretVisibility}
            secretViewer={secretViewer}
            urlValidator={finalUrlValidator}
            botId={bot?._id ?? undefined}
          />

          <KnowledgeBaseConfig
            form={form}
            showAdvancedConfig={showAdvancedConfig}
            showSecrets={showSecrets}
            toggleSecretVisibility={toggleSecretVisibility}
            secretViewer={secretViewer}
            kbCollections={kbCollections}
            addKbCollection={addKbCollection}
            removeKbCollection={removeKbCollection}
            updateKbCollection={updateKbCollection}
            botId={bot?._id ?? undefined}
          />
        </>
      )}
    </CardWithTitle>
  );
};
