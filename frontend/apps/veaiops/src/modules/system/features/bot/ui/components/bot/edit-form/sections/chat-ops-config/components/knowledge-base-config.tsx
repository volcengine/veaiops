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
  Button,
  Collapse,
  Form,
  type FormInstance,
  Input,
  Select,
  Typography,
} from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import { NETWORK_TYPE_OPTIONS, TOS_REGION_OPTIONS } from '@bot/lib';
import type React from 'react';
import type { UseSecretViewerReturn } from '../hooks';
import { SecretField } from './secret-field';

const CollapseItem = Collapse.Item;
const { Text } = Typography;

/**
 * Knowledge base configuration component Props
 */
interface KnowledgeBaseConfigProps {
  form: FormInstance;
  showAdvancedConfig: boolean;
  showSecrets: {
    ak: boolean;
    sk: boolean;
  };
  toggleSecretVisibility: (field: 'ak' | 'sk') => void;
  secretViewer: UseSecretViewerReturn;
  kbCollections: string[];
  addKbCollection: () => void;
  removeKbCollection: (index: number) => void;
  updateKbCollection: (index: number, value: string) => void;
  botId?: string;
}

/**
 * Knowledge base configuration component
 */
export const KnowledgeBaseConfig: React.FC<KnowledgeBaseConfigProps> = ({
  form,
  showAdvancedConfig,
  showSecrets,
  toggleSecretVisibility,
  secretViewer,
  kbCollections,
  addKbCollection,
  removeKbCollection,
  updateKbCollection,
  botId,
}) => {
  return (
    <Collapse defaultActiveKey={['1']} className="mb-4">
      <CollapseItem header="知识库配置（仅支持火山引擎）" name="1">
        <SecretField
          label="Access Key"
          field="volc_cfg.ak"
          required={showAdvancedConfig}
          placeholder="请输入火山引擎Access Key（留空表示不修改）"
          showSecret={showSecrets.ak}
          toggleSecretVisibility={() => toggleSecretVisibility('ak')}
          botId={botId}
          secretViewer={secretViewer}
          secretKey="ak"
          fieldName="volc_cfg.ak"
          formField="volc_cfg.ak"
        />

        <SecretField
          label="Secret Key"
          field="volc_cfg.sk"
          required={showAdvancedConfig}
          placeholder="请输入火山引擎Secret Key（留空表示不修改）"
          showSecret={showSecrets.sk}
          toggleSecretVisibility={() => toggleSecretVisibility('sk')}
          botId={botId}
          secretViewer={secretViewer}
          secretKey="sk"
          fieldName="volc_cfg.sk"
          formField="volc_cfg.sk"
        />

        <Form.Item
          label="TOS区域"
          field="volc_cfg.tos_region"
          rules={[
            {
              required: showAdvancedConfig,
              message: '请选择TOS区域',
            },
          ]}
        >
          <Select placeholder="请选择TOS区域">
            {TOS_REGION_OPTIONS.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="网络类型"
          field="volc_cfg.network_type"
          rules={[
            {
              required: showAdvancedConfig,
              message: '请选择网络类型',
            },
          ]}
        >
          <Select placeholder="请选择网络类型">
            {NETWORK_TYPE_OPTIONS.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Knowledge base collection configuration */}
        <div className="mb-4">
          <Text className="block mb-2">火山引擎方舟知识库集合</Text>
          <Text type="secondary" className="block mb-3">
            输入火山引擎方舟知识库的名称，支持添加多个
          </Text>

          {kbCollections.map((collection, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <Input
                placeholder="请输入知识库名称"
                value={collection}
                onChange={(value) => updateKbCollection(index, value)}
                allowClear
                className="flex-1"
              />

              <Button
                type="text"
                status="danger"
                icon={<IconDelete />}
                onClick={() => removeKbCollection(index)}
              />
            </div>
          ))}

          <Button
            type="dashed"
            icon={<IconPlus />}
            onClick={addKbCollection}
            className="w-full"
          >
            添加知识库集合
          </Button>
        </div>
      </CollapseItem>
    </Collapse>
  );
};
