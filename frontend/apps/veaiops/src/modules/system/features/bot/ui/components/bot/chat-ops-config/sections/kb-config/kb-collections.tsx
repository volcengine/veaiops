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

import { Button, Input, Typography } from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import type React from 'react';

const { Text } = Typography;

interface KbCollectionsProps {
  kbCollections: string[];
  addKbCollection: () => void;
  removeKbCollection: (index: number) => void;
  updateKbCollection: (params: { index: number; value: string }) => void;
}

/**
 * Knowledge base collections configuration section component
 */
export const KbCollections: React.FC<KbCollectionsProps> = ({
  kbCollections,
  addKbCollection,
  removeKbCollection,
  updateKbCollection,
}) => {
  return (
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
            onChange={(value) => updateKbCollection({ index, value })}
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
  );
};
