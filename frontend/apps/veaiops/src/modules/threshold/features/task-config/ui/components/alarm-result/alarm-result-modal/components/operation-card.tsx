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

import { Button, Typography } from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import { CellRender } from '@veaiops/components';
import type React from 'react';
import styles from '../../alarm-result-modal.module.less';
import type { RuleOperationResult } from '../types';

const { Title, Text } = Typography;

interface OperationCardProps {
  title: string;
  operations: RuleOperationResult[];
  type: 'create' | 'update' | 'delete' | 'failed';
  icon: string;
  onCopyError: (error: string) => void;
}

/**
 * Operation details card
 */
export const OperationCard: React.FC<OperationCardProps> = ({
  title,
  operations,
  type,
  icon,
  onCopyError,
}) => {
  if (operations.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.operationCard} ${styles[type]}`}>
      <div className={styles.content}>
        <Title heading={6} className={styles.title}>
          <span className="text-lg">{icon}</span>
          {title} ({operations.length})
        </Title>

        {operations.map((op, index) => (
          <div key={index} className={styles.operationItem}>
            <CellRender.InfoWithCode
              name={op.rule_name}
              code={op.rule_id}
              nameLabel="规则名称"
              codeLabel="规则ID"
              copyable
            />
            {op.error && (
              <div className={styles.errorMessage}>
                <div className={styles.errorHeader}>
                  <Text className={styles.label}>错误信息：</Text>
                  <Button
                    type="text"
                    size="mini"
                    icon={<IconCopy />}
                    onClick={() => onCopyError(op.error || '')}
                    className={styles.copyButton}
                  >
                    复制
                  </Button>
                </div>
                <div className={styles.content}>{op.error}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
