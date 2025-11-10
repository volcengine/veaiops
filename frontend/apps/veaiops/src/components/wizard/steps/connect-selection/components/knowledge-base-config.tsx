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
 * Knowledge base collection configuration component
 * @description References the knowledge base configuration interface design from images
 * @author AI Assistant
 * @date 2025-01-17
 */

import { Button, Input, Typography } from '@arco-design/web-react';
import { IconDelete, IconPlus } from '@arco-design/web-react/icon';
import type React from 'react';
import { useState } from 'react';
import styles from '../../../datasource-wizard.module.less';

const { Text } = Typography;

export interface KnowledgeBaseConfigProps {
  collections?: string[];
  onChange?: (collections: string[]) => void;
}

export const KnowledgeBaseConfig: React.FC<KnowledgeBaseConfigProps> = ({
  collections = [''],
  onChange,
}) => {
  const [kbCollections, setKbCollections] = useState<string[]>(collections);

  // Add knowledge base collection
  const addKbCollection = () => {
    const newCollections = [...kbCollections, ''];
    setKbCollections(newCollections);
    onChange?.(newCollections);
  };

  // Remove knowledge base collection
  const removeKbCollection = (index: number) => {
    if (kbCollections.length > 1) {
      const newCollections = kbCollections.filter((_, i) => i !== index);
      setKbCollections(newCollections);
      onChange?.(newCollections);
    }
  };

  // Update knowledge base collection
  const updateKbCollection = (index: number, value: string) => {
    const newCollections = [...kbCollections];
    newCollections[index] = value;
    setKbCollections(newCollections);
    onChange?.(newCollections);
  };

  return (
    <div className={styles.knowledgeBaseSection}>
      <div className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>火山引擎方舟知识库集合</Text>
        <Text type="secondary" className={styles.sectionDescription}>
          输入火山引擎方舟知识库的名称，支持添加多个
        </Text>
      </div>

      <div className={styles.collectionsList}>
        {kbCollections.map((collection, index) => (
          <div key={index} className={styles.collectionItem}>
            <Input
              placeholder="请输入知识库名称"
              value={collection}
              onChange={(value) => updateKbCollection(index, value)}
              allowClear
              className={styles.collectionInput}
            />
            {kbCollections.length > 1 && (
              <Button
                type="text"
                status="danger"
                icon={<IconDelete />}
                onClick={() => removeKbCollection(index)}
                className={styles.deleteButton}
              />
            )}
          </div>
        ))}
      </div>

      <Button
        type="dashed"
        icon={<IconPlus />}
        onClick={addKbCollection}
        className={styles.addButton}
      >
        + 添加知识库集合
      </Button>
    </div>
  );
};

export default KnowledgeBaseConfig;
